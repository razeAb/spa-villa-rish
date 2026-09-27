// Hyp Pay client — https://developers.hyp.co.il/pay/
// All calls are server-side GET requests to one endpoint; credentials travel in the query string,
// so they must never reach the browser or the logs.

const BASE_URL = process.env.HYP_BASE_URL || "https://pay.hyp.co.il/p/";
const REQUEST_TIMEOUT_MS = 20000;

// Params we set ourselves on VERIFY; a tampered redirect must not be able to override them.
const RESERVED_KEYS = new Set(["action", "what", "masof", "key", "passp"]);

const COIN_BY_CURRENCY = { ILS: "1", USD: "2", EUR: "3", GBP: "4" };

class HypError extends Error {
  constructor(message, ccode = null) {
    super(message);
    this.name = "HypError";
    this.ccode = ccode;
  }
}

const getConfig = () => {
  const masof = process.env.HYP_MASOF;
  const key = process.env.HYP_KEY;
  const passP = process.env.HYP_PASSP;
  if (!masof || !key || !passP) return null;
  return { masof, key, passP };
};

const isConfigured = () => Boolean(getConfig());

// Hyp Invoice (EZcount) emails the customer a legal receipt/tax invoice for each payment.
// Off until the document type is configured in the Hyp portal; turn on with HYP_SEND_INVOICE=true.
const invoicesEnabled = () => String(process.env.HYP_SEND_INVOICE).toLowerCase() === "true";

// Receipt line items: [code~description~quantity~unit price incl. VAT]. Hyp rejects the payment (400)
// unless they add up exactly to Amount, and the description may not contain ~ [ ].
const formatInvoiceItems = (items) =>
  items
    .map((item) => {
      const description = String(item.description || "").replace(/[~[\]]/g, " ").trim() || "-";
      return `[0~${description}~${item.quantity || 1}~${Number(item.unitPrice).toFixed(2)}]`;
    })
    .join("");

const requireConfig = () => {
  const config = getConfig();
  if (!config) throw new HypError("Hyp is not configured (set HYP_MASOF, HYP_KEY, HYP_PASSP)");
  return config;
};

const toQuery = (params) =>
  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");

// Hyp answers 200 even on errors; the result is a URL-encoded string, or HTML on a system error.
const callHyp = async (query) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let text;
  try {
    const response = await fetch(`${BASE_URL}?${query}`, { signal: controller.signal });
    text = (await response.text()).trim();
  } catch (err) {
    throw new HypError(`Hyp request failed: ${err.name === "AbortError" ? "timeout" : err.message}`);
  } finally {
    clearTimeout(timer);
  }
  if (!text || text.startsWith("<")) {
    throw new HypError("Hyp returned an unexpected (non URL-encoded) response");
  }
  return text;
};

const parseResponse = (text) => Object.fromEntries(new URLSearchParams(text));

/**
 * APISign/SIGN: returns the signed payment page URL to redirect the customer to.
 */
const createPaymentPageUrl = async ({
  amount,
  currency = "ILS",
  order,
  info,
  clientName,
  clientLName,
  email,
  cell,
  lang = "he",
  items = [],
}) => {
  const { masof, key, passP } = requireConfig();
  const query = toQuery({
    action: "APISign",
    What: "SIGN",
    Sign: "True",
    Masof: masof,
    KEY: key,
    PassP: passP,
    Amount: Number(amount).toFixed(2),
    Coin: COIN_BY_CURRENCY[currency] || "1",
    Order: order,
    Info: info,
    ClientName: clientName,
    ClientLName: clientLName,
    email,
    cell,
    PageLang: lang === "en" ? "ENG" : "HEB",
    // Template 4 asks only for card details (+ Israeli ID); customer details come from the fields above.
    tmp: 4,
    MoreData: "True",
    Tash: 1,
    ...(invoicesEnabled() && email
      ? {
          SendHesh: "True",
          "EZ.lang": lang === "en" ? "en" : "he",
          ...(items.length ? { Pritim: "True", heshDesc: formatInvoiceItems(items) } : { heshDesc: info }),
        }
      : {}),
  });
  const text = await callHyp(query);
  const parsed = parseResponse(text);
  if (!parsed.signature) {
    throw new HypError("Hyp did not return a signed payment page", parsed.CCode || null);
  }
  // Docs: append the response verbatim — parameter order matters for the signature.
  return `${BASE_URL}?${text}`;
};

/**
 * APISign/VERIFY: confirms the redirect parameters really came from Hyp.
 * `rawQuery` must be the success-page query string exactly as received.
 */
const verifyRedirect = async (rawQuery) => {
  const { masof, key, passP } = requireConfig();
  const segments = String(rawQuery || "")
    .replace(/^\?/, "")
    .split("&")
    .filter(Boolean)
    .filter((segment) => {
      const rawName = segment.split("=")[0] || "";
      let name;
      try {
        name = decodeURIComponent(rawName).toLowerCase();
      } catch {
        name = rawName.toLowerCase();
      }
      return !RESERVED_KEYS.has(name);
    });
  const prefix = toQuery({ action: "APISign", What: "VERIFY", Masof: masof, KEY: key, PassP: passP });
  const text = await callHyp([prefix, ...segments].join("&"));
  const parsed = parseResponse(text);
  return { ok: parsed.CCode === "0", ccode: parsed.CCode ?? null };
};

/**
 * CancelTrans: voids a transaction that was not yet transmitted (same business day, before 22:00).
 */
const cancelTransaction = async (transId) => {
  const { masof, passP } = requireConfig();
  const text = await callHyp(toQuery({ action: "CancelTrans", Masof: masof, PassP: passP, TransId: transId }));
  const parsed = parseResponse(text);
  return { ok: parsed.CCode === "0", ccode: parsed.CCode ?? null };
};

/**
 * zikoyAPI: refunds a settled transaction (full or partial). Creates a new Hyp transaction.
 */
const refundTransaction = async (transId, amount) => {
  const { masof, passP } = requireConfig();
  const text = await callHyp(
    toQuery({ action: "zikoyAPI", Masof: masof, PassP: passP, TransId: transId, Amount: Number(amount).toFixed(2) })
  );
  const parsed = parseResponse(text);
  return { ok: parsed.CCode === "0", ccode: parsed.CCode ?? null, refundId: parsed.Id || null };
};

/**
 * Gives the money back by the cheapest route: cancel if still possible, otherwise refund.
 */
const reverseTransaction = async (transId, amount) => {
  const cancel = await cancelTransaction(transId);
  if (cancel.ok) return { method: "cancel", refundId: null };
  const refund = await refundTransaction(transId, amount);
  if (refund.ok) return { method: "refund", refundId: refund.refundId };
  throw new HypError(`Hyp could not cancel (CCode ${cancel.ccode}) or refund (CCode ${refund.ccode})`, refund.ccode);
};

module.exports = {
  HypError,
  isConfigured,
  createPaymentPageUrl,
  verifyRedirect,
  cancelTransaction,
  refundTransaction,
  reverseTransaction,
};
