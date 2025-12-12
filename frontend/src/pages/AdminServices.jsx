import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Wrench, ArrowLeftRight } from "lucide-react";
import { api, getAuthToken } from "../api/client";

const T = {
  he: {
    header: "אדמין · שירותים",
    subtitle: "ניהול שמות, מחירים, משך וזמינות.",
    calendar: "לוח שנה",
    console: "קונסולת אדמין",
    back: "חזרה לאתר",
    loginPrompt: "התחברו דרך קונסולת האדמין כדי לערוך.",
    active: "שירותים פעילים",
    refresh: "רענון",
    loading: "טוען…",
    noServices: "לא נמצאו שירותים.",
    duration: "משך (דק׳)",
    priceAmount: "מחיר",
    priceDisplay: "תצוגת מחיר",
    save: "שמור",
    saving: "שומר…",
    deactivate: "השבת",
    addTitle: "הוספת שירות",
    add: "הוסף שירות",
    description: "תיאור (לא חובה)",
  },
  en: {
    header: "Admin · Services",
    subtitle: "Manage titles, prices, durations, and availability.",
    calendar: "Calendar",
    console: "Admin console",
    back: "← Back to site",
    loginPrompt: "Please log in via the Admin console first.",
    active: "Active services",
    refresh: "Refresh",
    loading: "Loading…",
    noServices: "No services found.",
    duration: "Duration (min)",
    priceAmount: "Price amount",
    priceDisplay: "Price display",
    save: "Save",
    saving: "Saving…",
    deactivate: "Deactivate",
    addTitle: "Add service",
    add: "Add service",
    description: "Description (optional)",
  },
};

const getServiceTitle = (svc, lang) => svc?.translations?.[lang]?.title || svc?.title || svc?.translations?.en?.title || "";

export default function AdminServices() {
  const [authed] = useState(() => Boolean(getAuthToken()));
  const [lang, setLang] = useState("he");
  const toggleLang = () => setLang((p) => (p === "he" ? "en" : "he"));
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState({});
  const [createForm, setCreateForm] = useState({ title: "", priceAmount: "", priceDisplay: "", durationMin: "", description: "" });
  const [createMessage, setCreateMessage] = useState("");

  const loadServices = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.listServices();
      setServices(data);
      const map = {};
      data.forEach((svc) => {
        map[svc._id] = {
          title: svc.title || "",
          priceAmount: svc.priceAmount || "",
          priceDisplay: svc.priceDisplay || "",
          durationMin: svc.durationMin || "",
          description: svc.description || "",
          isActive: svc.isActive !== false,
        };
      });
      setDrafts(map);
    } catch (err) {
      setError(err?.payload?.error || err.message || (lang === "he" ? "שגיאה בטעינת שירותים" : "Failed to load services"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleDraftChange = (id, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = async (id, overrides = {}) => {
    const draft = { ...drafts[id], ...overrides };
    if (!draft) return;
    setSaving((prev) => ({ ...prev, [id]: true }));
    try {
      await api.upsertService({
        id,
        title: draft.title,
        description: draft.description,
        durationMin: Number(draft.durationMin),
        priceAmount: Number(draft.priceAmount),
        priceDisplay: draft.priceDisplay,
        isActive: Boolean(draft.isActive),
      });
      await loadServices();
    } catch (err) {
      setError(err?.payload?.error || err.message || (lang === "he" ? "שגיאה בשמירת שירות" : "Failed to save service"));
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleToggleActive = (id, next) => handleSave(id, { isActive: next });

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreateMessage("");
    try {
      await api.upsertService({
        title: createForm.title,
        description: createForm.description,
        durationMin: Number(createForm.durationMin),
        priceAmount: Number(createForm.priceAmount),
        priceDisplay: createForm.priceDisplay || "",
      });
      setCreateForm({ title: "", priceAmount: "", priceDisplay: "", durationMin: "", description: "" });
      setCreateMessage(lang === "he" ? "השירות נוסף" : "Service added");
      await loadServices();
    } catch (err) {
      setCreateMessage(err?.payload?.error || err.message || (lang === "he" ? "נכשל בהוספת שירות" : "Failed to add service"));
    }
  };

  const activeServices = useMemo(() => services.filter((s) => s.isActive !== false), [services]);

  return (
    <div className="min-h-screen bg-black text-white" dir={lang === "he" ? "rtl" : "ltr"}>
      <header className="border-b border-white/10 bg-black/70 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Wrench className="h-6 w-6 text-white" />
            <div>
              <p className="text-lg font-semibold">{T[lang].header}</p>
              <p className="text-xs text-white/60">{T[lang].subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/80">
            <Link to="/admin/calendar" className="rounded-lg border border-white/15 px-3 py-1 hover:bg-white/10">
              {T[lang].calendar}
            </Link>
            <Link to="/admin" className="rounded-lg border border-white/15 px-3 py-1 hover:bg-white/10">
              {T[lang].console}
            </Link>
            <Link to="/admin/guide" target="_blank" rel="noreferrer" className="rounded-lg border border-white/15 px-3 py-1 hover:bg-white/10">
              {lang === "he" ? "מדריך" : "Guide"}
            </Link>
            <Link to="/" className="rounded-lg border border-white/15 px-3 py-1 hover:bg-white/10">
              {T[lang].back}
            </Link>
            <button onClick={toggleLang} className="rounded-lg border border-white/20 px-3 py-1 hover:bg-white/10">
              {lang === "he" ? "English" : "עברית"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        {!authed ? (
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6 text-sm text-white/80">
            {T[lang].loginPrompt} <Link className="underline" to="/admin">{T[lang].console}</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-inner">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{T[lang].active}</h2>
                <button
                  onClick={loadServices}
                  className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-1 text-sm text-white/80 hover:bg-white/10"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  {T[lang].refresh}
                </button>
              </div>
              {loading ? (
                <p className="mt-3 text-sm text-white/70">{T[lang].loading}</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {activeServices.map((svc) => (
                    <div key={svc._id} className="rounded-xl border border-white/10 bg-black/40 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <input
                            type="text"
                            value={drafts[svc._id]?.title || ""}
                            onChange={(e) => handleDraftChange(svc._id, "title", e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-white"
                          />
                          <p className="text-xs text-white/60">{getServiceTitle(svc, lang)}</p>
                          <p className="text-[10px] text-white/40">{svc._id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-white/70">
                            {T[lang].duration}
                            <input
                              type="number"
                              value={drafts[svc._id]?.durationMin ?? ""}
                              onChange={(e) => handleDraftChange(svc._id, "durationMin", e.target.value)}
                              className="mt-1 w-24 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white"
                            />
                          </label>
                          <label className="text-xs text-white/70">
                            {T[lang].priceAmount}
                            <input
                              type="number"
                              value={drafts[svc._id]?.priceAmount ?? ""}
                              onChange={(e) => handleDraftChange(svc._id, "priceAmount", e.target.value)}
                              className="mt-1 w-24 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white"
                            />
                          </label>
                          <label className="text-xs text-white/70">
                            {T[lang].priceDisplay}
                            <input
                              type="text"
                              value={drafts[svc._id]?.priceDisplay ?? ""}
                              onChange={(e) => handleDraftChange(svc._id, "priceDisplay", e.target.value)}
                              className="mt-1 w-32 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white"
                            />
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSave(svc._id)}
                            disabled={saving[svc._id]}
                            className="rounded-lg bg-white/90 px-3 py-1 text-sm font-semibold text-black hover:bg-white disabled:opacity-60"
                          >
                            {saving[svc._id] ? T[lang].saving : T[lang].save}
                          </button>
                          <button
                            onClick={() => handleToggleActive(svc._id, false)}
                            className="rounded-lg border border-red-300/40 px-3 py-1 text-sm text-red-200 hover:bg-red-500/10"
                          >
                            {T[lang].deactivate}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!activeServices.length && !loading ? (
                    <p className="rounded-lg border border-dashed border-white/15 bg-black/30 px-3 py-4 text-center text-sm text-white/60">
                      {T[lang].noServices}
                    </p>
                  ) : null}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-inner">
              <h2 className="text-lg font-semibold text-white">{T[lang].addTitle}</h2>
              <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleCreate}>
                <label className="text-sm text-white/80">
                  {lang === "he" ? "כותרת" : "Title"}
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                    required
                  />
                </label>
                <label className="text-sm text-white/80">
                  {T[lang].duration}
                  <input
                    type="number"
                    value={createForm.durationMin}
                    onChange={(e) => setCreateForm((p) => ({ ...p, durationMin: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                    required
                  />
                </label>
                <label className="text-sm text-white/80">
                  {T[lang].priceAmount}
                  <input
                    type="number"
                    value={createForm.priceAmount}
                    onChange={(e) => setCreateForm((p) => ({ ...p, priceAmount: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                    required
                  />
                </label>
                <label className="text-sm text-white/80">
                  {T[lang].priceDisplay}
                  <input
                    type="text"
                    value={createForm.priceDisplay}
                    onChange={(e) => setCreateForm((p) => ({ ...p, priceDisplay: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                  />
                </label>
                <label className="md:col-span-2 text-sm text-white/80">
                  {T[lang].description}
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
                    rows={2}
                  />
                </label>
                {createMessage ? <p className="text-sm text-emerald-300 md:col-span-2">{createMessage}</p> : null}
                <button
                  type="submit"
                  className="md:col-span-2 rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-black transition hover:bg-white"
                >
                  {T[lang].add}
                </button>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
