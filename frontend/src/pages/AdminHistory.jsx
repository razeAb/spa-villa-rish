import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, getAuthToken } from "../api/client";

const T = {
  he: {
    title: "אדמין · היסטוריית הזמנות",
    subtitle: "הזמנות שבוצעו (סטטוס בוצע).",
    calendar: "לוח שנה",
    console: "קונסולת אדמין",
    services: "שירותים",
    back: "חזרה לאתר",
    loginPrompt: "התחברו דרך קונסולת האדמין כדי לצפות בהיסטוריה.",
    refresh: "רענון",
    refreshing: "מרענן…",
    customers: "לקוח",
    service: "שירות",
    start: "התחלה",
    payment: "תשלום",
    status: "סטטוס",
    none: "—",
    noBookings: "אין הזמנות שבוצעו.",
    viewCard: "פרטי ויזה",
    hideCard: "הסתר פרטים",
    cardNumber: "כרטיס",
    expiry: "תוקף",
    cvc: "CVV",
  },
  en: {
    title: "Admin · Order History",
    subtitle: "Completed bookings (status: done).",
    calendar: "Calendar",
    console: "Admin console",
    services: "Services",
    back: "← Back to site",
    loginPrompt: "Please log in via the Admin console to view history.",
    refresh: "Refresh",
    refreshing: "Refreshing…",
    customers: "Customer",
    service: "Service",
    start: "Start",
    payment: "Payment",
    status: "Status",
    none: "—",
    noBookings: "No completed bookings yet.",
    viewCard: "Visa details",
    hideCard: "Hide details",
    cardNumber: "Card",
    expiry: "Expiry",
    cvc: "CVV",
  },
};

const formatMoney = (amount, currency = "ILS") => {
  if (!amount) return "";
  try {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

const getServiceTitle = (svc, lang) => svc?.translations?.[lang]?.title || svc?.title || svc?.translations?.en?.title || "";

const getBookingSearchText = (booking, lang) => {
  const parts = [
    booking.customerName,
    booking.phone,
    booking.customerEmail,
    getServiceTitle(booking.serviceId, lang),
  ];
  return parts.filter(Boolean).join(" ").toLowerCase();
};

const isSameLocalDay = (dateA, dateB) =>
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getDate() === dateB.getDate();

export default function AdminHistory() {
  const [authed] = useState(() => Boolean(getAuthToken()));
  const [lang, setLang] = useState("he");
  const toggleLang = () => setLang((p) => (p === "he" ? "en" : "he"));
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [openPaymentBookingId, setOpenPaymentBookingId] = useState(null);

  const loadBookings = useCallback(async () => {
    if (!authed) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.listBookings();
      setBookings(data);
    } catch (err) {
      setError(err?.payload?.error || err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [authed]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filteredBookings = useMemo(() => {
    if (!bookings.length) return [];
    const normalizedQuery = query.trim().toLowerCase();
    const today = new Date();
    return bookings.filter((booking) => {
      if (booking.status !== "done") return false;
      if (showTodayOnly) {
        if (!booking.startUtc) return false;
        const bookingDate = new Date(booking.startUtc);
        if (!isSameLocalDay(bookingDate, today)) return false;
      }
      if (!normalizedQuery) return true;
      return getBookingSearchText(booking, lang).includes(normalizedQuery);
    });
  }, [bookings, lang, query, showTodayOnly]);

  return (
    <div className="min-h-screen bg-black text-white" dir={lang === "he" ? "rtl" : "ltr"}>
      <header className="border-b border-white/10 bg-black/70 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{T[lang].title}</h1>
            <p className="text-sm text-white/60">{T[lang].subtitle}</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/70">
            <Link to="/admin" className="rounded-lg border border-white/15 px-3 py-1 hover:text-white hover:bg-white/10">
              {T[lang].console}
            </Link>
            <Link to="/admin/calendar" className="rounded-lg border border-white/15 px-3 py-1 hover:text-white hover:bg-white/10">
              {T[lang].calendar}
            </Link>
            <Link to="/admin/services" className="rounded-lg border border-white/15 px-3 py-1 hover:text-white hover:bg-white/10">
              {T[lang].services}
            </Link>
            <Link to="/" className="rounded-lg border border-white/15 px-3 py-1 hover:text-white hover:bg-white/10">
              {T[lang].back}
            </Link>
            <button onClick={toggleLang} className="rounded-lg border border-white/20 px-3 py-1 hover:bg-white/10">
              {lang === "he" ? "English" : "עברית"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        {!authed ? (
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6 shadow-lg shadow-black/40">
            <p className="text-sm text-white/70">
              {T[lang].loginPrompt} <Link className="underline" to="/admin">{T[lang].console}</Link>
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={lang === "he" ? "חיפוש לפי שם, טלפון או שירות" : "Search by name, phone, or service"}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white sm:max-w-md"
                />
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={showTodayOnly}
                    onChange={(event) => setShowTodayOnly(event.target.checked)}
                    className="h-4 w-4 rounded border-white/30 bg-black/40"
                  />
                  {lang === "he" ? "הצג רק היום" : "Today only"}
                </label>
              </div>
              <button
                type="button"
                onClick={loadBookings}
                disabled={loading}
                className="rounded-lg border border-white/15 px-3 py-1 text-sm text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-60"
              >
                {loading ? T[lang].refreshing : T[lang].refresh}
              </button>
            </div>

            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-white/60">{T[lang].customers}</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-white/60">{T[lang].service}</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-white/60">{T[lang].start}</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-white/60">{T[lang].payment}</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-white/60">{T[lang].status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredBookings.map((booking) => {
                    const payment = booking.paymentId;
                    const maskedCard = payment?.maskedCard || (payment?.last4 ? `**** **** **** ${payment.last4}` : "");
                    const hasCardDetails = Boolean(maskedCard || payment?.expiresOn || payment?.cvc);
                    const isOpen = openPaymentBookingId === booking._id;
                    return (
                      <tr key={booking._id} className="bg-black/40">
                        <td className="px-4 py-3">
                          <p className="font-medium text-white">{booking.customerName}</p>
                          <p className="text-xs text-white/60">{booking.phone}</p>
                          {booking.customerEmail ? <p className="text-xs text-white/60">{booking.customerEmail}</p> : null}
                        </td>
                        <td className="px-4 py-3 text-white/80">{getServiceTitle(booking.serviceId, lang) || T[lang].none}</td>
                        <td className="px-4 py-3 text-white/80">
                          {booking.startUtc ? new Date(booking.startUtc).toLocaleString() : T[lang].none}
                        </td>
                        <td className="px-4 py-3 text-white/80">
                          {booking.totalAmount ? (
                            <>
                              <p className="font-medium">{formatMoney(booking.totalAmount, booking.currency)}</p>
                              <p className="text-xs uppercase tracking-wide text-white/60">{booking.paymentStatus}</p>
                              {hasCardDetails ? (
                                <div className="mt-2">
                                  <button
                                    type="button"
                                    onClick={() => setOpenPaymentBookingId(isOpen ? null : booking._id)}
                                    className="text-[10px] uppercase tracking-wide text-white/70 hover:text-white"
                                  >
                                    {isOpen ? T[lang].hideCard : T[lang].viewCard}
                                  </button>
                                  {isOpen ? (
                                    <div className="mt-2 space-y-1 text-xs text-white/70">
                                      {maskedCard ? (
                                        <p>
                                          {T[lang].cardNumber}: {maskedCard}
                                        </p>
                                      ) : null}
                                      {payment?.expiresOn ? (
                                        <p>
                                          {T[lang].expiry}: {payment.expiresOn}
                                        </p>
                                      ) : null}
                                      {payment?.cvc ? (
                                        <p>
                                          {T[lang].cvc}: {payment.cvc}
                                        </p>
                                      ) : null}
                                    </div>
                                  ) : null}
                                </div>
                              ) : null}
                            </>
                          ) : (
                            <span className="text-white/60">{T[lang].none}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-white/80">{booking.status || T[lang].none}</td>
                      </tr>
                    );
                  })}
                  {!filteredBookings.length && !loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-white/60">
                        {T[lang].noBookings}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
