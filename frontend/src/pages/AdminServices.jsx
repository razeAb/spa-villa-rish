import { useCallback, useEffect, useMemo, useState } from "react";
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
    sessionExpired: "החיבור פג תוקף. נכנסתם מחדש דרך קונסולת האדמין כדי לערוך או לראות שירותים מושבתים.",
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
    deactivateConfirm: "להשבית את השירות? הוא ייעלם מהאתר ומרשימה זו עד שתשוחזר.",
    reactivate: "שחזר",
    deactivatedSection: "שירותים מושבתים",
    deactivatedHint: "שירותים מושבתים לא מוצגים באתר. לחצו \"שחזר\" כדי להחזיר.",
    deletePermanently: "מחק לצמיתות",
    deleteConfirm: "למחוק את השירות לצמיתות? לא ניתן לשחזר.",
    addTitle: "הוספת שירות",
    add: "הוסף שירות",
    description: "תיאור (לא חובה)",
    addOns: "תוספות",
    addOnName: "שם תוספת",
    addOnDescription: "תיאור",
    addOnPrice: "מחיר תוספת",
    addOnDuration: "משך (דק׳)",
    addOnAdd: "הוסף תוספת",
    addOnRemove: "הסר",
    featured: "הצג כחבילה מובלטת בעמוד הבית",
    sortOrder: "סדר הצגה",
    heroImage: "תמונת רקע לעמוד הבית",
    uploadPhoto: "העלאת תמונה",
    uploading: "מעלה…",
    noImage: "לא הועלתה תמונה",
  },
  en: {
    header: "Admin · Services",
    subtitle: "Manage titles, prices, durations, and availability.",
    calendar: "Calendar",
    console: "Admin console",
    back: "← Back to site",
    loginPrompt: "Please log in via the Admin console first.",
    sessionExpired: "Your session expired. Log back in via the Admin console to edit or see deactivated services.",
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
    deactivateConfirm: "Deactivate this service? It will disappear from the site and this list until reactivated.",
    reactivate: "Reactivate",
    deactivatedSection: "Deactivated services",
    deactivatedHint: "Deactivated services aren't shown on the site. Click \"Reactivate\" to bring one back.",
    deletePermanently: "Delete permanently",
    deleteConfirm: "Permanently delete this service? This can't be undone.",
    addTitle: "Add service",
    add: "Add service",
    description: "Description (optional)",
    addOns: "Add-ons",
    addOnName: "Add-on name",
    addOnDescription: "Description",
    addOnPrice: "Add-on price",
    addOnDuration: "Duration (min)",
    addOnAdd: "Add add-on",
    addOnRemove: "Remove",
    featured: "Show as a featured package on the homepage",
    sortOrder: "Display order",
    heroImage: "Homepage background photo",
    uploadPhoto: "Upload photo",
    uploading: "Uploading…",
    noImage: "No photo uploaded",
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
  const [deleting, setDeleting] = useState({});
  const [uploadingImage, setUploadingImage] = useState({});
  const [createForm, setCreateForm] = useState({
    title: "",
    priceAmount: "",
    priceDisplay: "",
    durationMin: "",
    description: "",
    featured: false,
    sortOrder: "",
    heroImage: "",
  });
  const [createMessage, setCreateMessage] = useState("");
  const [createUploading, setCreateUploading] = useState(false);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let data;
      try {
        data = await api.listAllServicesAdmin();
      } catch (err) {
        if (err?.status === 401 || err?.status === 403) {
          data = await api.listServices();
          setError(T[lang].sessionExpired);
        } else {
          throw err;
        }
      }
      setServices(data);
      const map = {};
      data.forEach((svc) => {
        const localizedDescription = svc?.translations?.[lang]?.description || svc?.description || "";
        map[svc._id] = {
          title: svc.title || "",
          priceAmount: svc.priceAmount || "",
          priceDisplay: svc.priceDisplay || "",
          durationMin: svc.durationMin || "",
          description: localizedDescription,
          isActive: svc.isActive !== false,
          featured: Boolean(svc.featured),
          sortOrder: svc.sortOrder || 0,
          heroImage: svc.heroImage || "",
          translations: svc.translations || {},
          addOns: Array.isArray(svc.addOns)
            ? svc.addOns.map((addOn) => ({
                _id: addOn._id,
                title: addOn.title || "",
                description: addOn.description || "",
                        priceAmount: addOn.priceAmount ?? "",
                        durationMin: addOn.durationMin ?? "",
                      }))
                    : [],
                };
      });
      setDrafts(map);
    } catch (err) {
      setError(err?.payload?.error || err.message || (lang === "he" ? "שגיאה בטעינת שירותים" : "Failed to load services"));
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleDraftChange = (id, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleAddOnChange = (serviceId, index, field, value) => {
    setDrafts((prev) => {
      const service = prev[serviceId] || {};
      const nextAddOns = Array.isArray(service.addOns) ? [...service.addOns] : [];
      nextAddOns[index] = { ...nextAddOns[index], [field]: value };
      return {
        ...prev,
        [serviceId]: {
          ...service,
          addOns: nextAddOns,
        },
      };
    });
  };

  const handleAddOnAdd = (serviceId) => {
    setDrafts((prev) => {
      const service = prev[serviceId] || {};
      const nextAddOns = Array.isArray(service.addOns) ? [...service.addOns] : [];
      nextAddOns.push({ title: "", description: "", priceAmount: "", durationMin: "" });
      return {
        ...prev,
        [serviceId]: {
          ...service,
          addOns: nextAddOns,
        },
      };
    });
  };

  const handleAddOnRemove = (serviceId, index) => {
    setDrafts((prev) => {
      const service = prev[serviceId] || {};
      const nextAddOns = Array.isArray(service.addOns) ? [...service.addOns] : [];
      nextAddOns.splice(index, 1);
      return {
        ...prev,
        [serviceId]: {
          ...service,
          addOns: nextAddOns,
        },
      };
    });
  };

  const handleSave = async (id, overrides = {}) => {
    const draft = { ...drafts[id], ...overrides };
    if (!draft) return;
    setSaving((prev) => ({ ...prev, [id]: true }));
    try {
      const prevTranslations = draft.translations || {};
      const langTranslation = prevTranslations[lang] || {};
      const updatedTranslations = {
        ...prevTranslations,
        [lang]: {
          ...langTranslation,
          description: draft.description,
        },
      };
      await api.upsertService({
        id,
        title: draft.title,
        description: draft.description,
        durationMin: Number(draft.durationMin),
        priceAmount: Number(draft.priceAmount),
        priceDisplay: draft.priceDisplay,
        isActive: Boolean(draft.isActive),
        featured: Boolean(draft.featured),
        sortOrder: Number(draft.sortOrder) || 0,
        heroImage: draft.heroImage || "",
        translations: updatedTranslations,
        addOns: Array.isArray(draft.addOns)
          ? draft.addOns.map((addOn) => ({
              _id: addOn._id,
              title: addOn.title,
              description: addOn.description,
              priceAmount: Number(addOn.priceAmount),
              durationMin: Number(addOn.durationMin) || 0,
            }))
          : [],
      });
      await loadServices();
    } catch (err) {
      setError(err?.payload?.error || err.message || (lang === "he" ? "שגיאה בשמירת שירות" : "Failed to save service"));
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleToggleActive = (id, next) => {
    if (!next && !window.confirm(T[lang].deactivateConfirm)) return;
    return handleSave(id, { isActive: next });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(T[lang].deleteConfirm)) return;
    setDeleting((prev) => ({ ...prev, [id]: true }));
    try {
      await api.deleteService(id);
      await loadServices();
    } catch (err) {
      setError(err?.payload?.error || err.message || (lang === "he" ? "שגיאה במחיקת שירות" : "Failed to delete service"));
    } finally {
      setDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleImageUpload = async (id, file) => {
    if (!file) return;
    setUploadingImage((prev) => ({ ...prev, [id]: true }));
    try {
      const { url } = await api.uploadImage(file);
      handleDraftChange(id, "heroImage", url);
      await handleSave(id, { heroImage: url });
    } catch (err) {
      setError(err?.payload?.error || err.message || (lang === "he" ? "שגיאה בהעלאת תמונה" : "Failed to upload image"));
    } finally {
      setUploadingImage((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleCreateImageUpload = async (file) => {
    if (!file) return;
    setCreateUploading(true);
    try {
      const { url } = await api.uploadImage(file);
      setCreateForm((prev) => ({ ...prev, heroImage: url }));
    } catch (err) {
      setCreateMessage(err?.payload?.error || err.message || (lang === "he" ? "שגיאה בהעלאת תמונה" : "Failed to upload image"));
    } finally {
      setCreateUploading(false);
    }
  };

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
        featured: Boolean(createForm.featured),
        sortOrder: Number(createForm.sortOrder) || 0,
        heroImage: createForm.heroImage || "",
      });
      setCreateForm({
        title: "",
        priceAmount: "",
        priceDisplay: "",
        durationMin: "",
        description: "",
        featured: false,
        sortOrder: "",
        heroImage: "",
      });
      setCreateMessage(lang === "he" ? "השירות נוסף" : "Service added");
      await loadServices();
    } catch (err) {
      setCreateMessage(err?.payload?.error || err.message || (lang === "he" ? "נכשל בהוספת שירות" : "Failed to add service"));
    }
  };

  const activeServices = useMemo(() => services.filter((s) => s.isActive !== false), [services]);
  const inactiveServices = useMemo(() => services.filter((s) => s.isActive === false), [services]);

  return (
    <div className="min-h-screen bg-black text-white" dir={lang === "he" ? "rtl" : "ltr"}>
      <header className="border-b border-white/10 bg-black/70 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Wrench className="h-6 w-6 text-white" />
            <div>
              <p className="text-lg font-semibold">{T[lang].header}</p>
              <p className="text-xs text-white/60">{T[lang].subtitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
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
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-base font-semibold text-white"
                          />
                          <p className="mt-1 text-xs text-white/60">{getServiceTitle(svc, lang)}</p>
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
                        <label className="w-full text-xs text-white/70">
                          {T[lang].description}
                          <textarea
                            value={drafts[svc._id]?.description ?? ""}
                            onChange={(e) => handleDraftChange(svc._id, "description", e.target.value)}
                            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm leading-relaxed text-white"
                            rows={6}
                          />
                        </label>

                        <div className="flex w-full flex-wrap items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-3">
                          <div className="flex items-center gap-3">
                            {drafts[svc._id]?.heroImage ? (
                              <img
                                src={drafts[svc._id].heroImage}
                                alt=""
                                className="h-14 w-20 rounded-md border border-white/10 object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-20 items-center justify-center rounded-md border border-dashed border-white/20 text-[10px] text-white/40">
                                {T[lang].noImage}
                              </div>
                            )}
                            <label className="rounded-md border border-white/20 px-2 py-1 text-xs text-white/80 hover:bg-white/10 cursor-pointer">
                              {uploadingImage[svc._id] ? T[lang].uploading : T[lang].uploadPhoto}
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                disabled={uploadingImage[svc._id]}
                                onChange={(e) => handleImageUpload(svc._id, e.target.files?.[0])}
                              />
                            </label>
                          </div>
                          <label className="flex items-center gap-2 text-xs text-white/70">
                            <input
                              type="checkbox"
                              checked={Boolean(drafts[svc._id]?.featured)}
                              onChange={(e) => handleDraftChange(svc._id, "featured", e.target.checked)}
                              className="h-4 w-4 rounded border-white/30 bg-black/40"
                            />
                            {T[lang].featured}
                          </label>
                          <label className="text-xs text-white/70">
                            {T[lang].sortOrder}
                            <input
                              type="number"
                              value={drafts[svc._id]?.sortOrder ?? 0}
                              onChange={(e) => handleDraftChange(svc._id, "sortOrder", e.target.value)}
                              className="mt-1 w-20 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-white"
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
                          <button
                            onClick={() => handleDelete(svc._id)}
                            disabled={deleting[svc._id]}
                            className="rounded-lg border border-red-500/50 px-3 py-1 text-sm text-red-300 hover:bg-red-500/20 disabled:opacity-60"
                          >
                            {T[lang].deletePermanently}
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs uppercase tracking-wide text-white/60">{T[lang].addOns}</p>
                          <button
                            type="button"
                            onClick={() => handleAddOnAdd(svc._id)}
                            className="rounded-md border border-white/20 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                          >
                            {T[lang].addOnAdd}
                          </button>
                        </div>
                        <div className="mt-3 space-y-2">
                          {(drafts[svc._id]?.addOns || []).map((addOn, index) => (
                            <div key={addOn._id || `${svc._id}-addon-${index}`} className="flex flex-wrap items-end gap-2">
                              <label className="text-xs text-white/70">
                                {T[lang].addOnName}
                                <input
                                  type="text"
                                  value={addOn.title || ""}
                                  onChange={(e) => handleAddOnChange(svc._id, index, "title", e.target.value)}
                                  className="mt-1 w-40 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-white"
                                />
                              </label>
                              <label className="text-xs text-white/70">
                                {T[lang].addOnDescription}
                                <input
                                  type="text"
                                  value={addOn.description || ""}
                                  onChange={(e) => handleAddOnChange(svc._id, index, "description", e.target.value)}
                                  className="mt-1 w-48 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-white"
                                />
                              </label>
                              <label className="text-xs text-white/70">
                                {T[lang].addOnPrice}
                                <input
                                  type="number"
                                  value={addOn.priceAmount ?? ""}
                                  onChange={(e) => handleAddOnChange(svc._id, index, "priceAmount", e.target.value)}
                                  className="mt-1 w-24 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-white"
                                />
                              </label>
                              <label className="text-xs text-white/70">
                                {T[lang].addOnDuration}
                                <input
                                  type="number"
                                  value={addOn.durationMin ?? ""}
                                  onChange={(e) => handleAddOnChange(svc._id, index, "durationMin", e.target.value)}
                                  className="mt-1 w-24 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-white"
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => handleAddOnRemove(svc._id, index)}
                                className="mb-1 rounded-md border border-red-300/40 px-2 py-1 text-xs text-red-200 hover:bg-red-500/10"
                              >
                                {T[lang].addOnRemove}
                              </button>
                            </div>
                          ))}
                          {(drafts[svc._id]?.addOns || []).length === 0 ? (
                            <p className="text-xs text-white/40">{lang === "he" ? "אין תוספות" : "No add-ons yet."}</p>
                          ) : null}
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

            {inactiveServices.length ? (
              <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-inner">
                <h2 className="text-lg font-semibold text-white">{T[lang].deactivatedSection}</h2>
                <p className="mt-1 text-xs text-white/60">{T[lang].deactivatedHint}</p>
                <div className="mt-4 space-y-2">
                  {inactiveServices.map((svc) => (
                    <div
                      key={svc._id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/40 p-3"
                    >
                      <div>
                        <p className="text-sm text-white">{getServiceTitle(svc, lang)}</p>
                        <p className="text-[10px] text-white/40">{svc._id}</p>
                      </div>
                      <button
                        onClick={() => handleSave(svc._id, { isActive: true })}
                        disabled={saving[svc._id]}
                        className="rounded-lg bg-white/90 px-3 py-1 text-sm font-semibold text-black hover:bg-white disabled:opacity-60"
                      >
                        {saving[svc._id] ? T[lang].saving : T[lang].reactivate}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

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
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm leading-relaxed text-white"
                    rows={6}
                  />
                </label>

                <div className="md:col-span-2 flex flex-wrap items-center gap-4 rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center gap-3">
                    {createForm.heroImage ? (
                      <img
                        src={createForm.heroImage}
                        alt=""
                        className="h-14 w-20 rounded-md border border-white/10 object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-20 items-center justify-center rounded-md border border-dashed border-white/20 text-[10px] text-white/40">
                        {T[lang].noImage}
                      </div>
                    )}
                    <label className="rounded-md border border-white/20 px-2 py-1 text-xs text-white/80 hover:bg-white/10 cursor-pointer">
                      {createUploading ? T[lang].uploading : T[lang].uploadPhoto}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={createUploading}
                        onChange={(e) => handleCreateImageUpload(e.target.files?.[0])}
                      />
                    </label>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-white/70">
                    <input
                      type="checkbox"
                      checked={createForm.featured}
                      onChange={(e) => setCreateForm((p) => ({ ...p, featured: e.target.checked }))}
                      className="h-4 w-4 rounded border-white/30 bg-black/40"
                    />
                    {T[lang].featured}
                  </label>
                  <label className="text-xs text-white/70">
                    {T[lang].sortOrder}
                    <input
                      type="number"
                      value={createForm.sortOrder}
                      onChange={(e) => setCreateForm((p) => ({ ...p, sortOrder: e.target.value }))}
                      className="mt-1 w-20 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-white"
                    />
                  </label>
                </div>

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
