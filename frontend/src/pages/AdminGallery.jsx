import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Images } from "lucide-react";
import { api, getAuthToken } from "../api/client";

const T = {
  he: {
    header: "אדמין · גלריה",
    subtitle: "הוספה, סידור ומחיקה של תמונות הגלריה בעמוד הבית.",
    calendar: "לוח שנה",
    services: "שירותים",
    console: "קונסולת אדמין",
    guide: "מדריך",
    back: "חזרה לאתר",
    loginPrompt: "התחברו דרך קונסולת האדמין כדי לערוך.",
    photos: "תמונות הגלריה",
    refresh: "רענון",
    loading: "טוען…",
    noPhotos: "אין תמונות בגלריה.",
    sortOrder: "סדר הצגה",
    save: "שמור",
    saving: "שומר…",
    delete: "מחק",
    deleting: "מוחק…",
    deleteConfirm: "למחוק את התמונה הזו לצמיתות? לא ניתן לשחזר.",
    addTitle: "הוספת תמונה",
    uploadPhoto: "העלאת תמונה",
    uploading: "מעלה…",
  },
  en: {
    header: "Admin · Gallery",
    subtitle: "Add, reorder, and delete the homepage gallery photos.",
    calendar: "Calendar",
    services: "Services",
    console: "Admin console",
    guide: "Guide",
    back: "← Back to site",
    loginPrompt: "Please log in via the Admin console first.",
    photos: "Gallery photos",
    refresh: "Refresh",
    loading: "Loading…",
    noPhotos: "No photos in the gallery yet.",
    sortOrder: "Display order",
    save: "Save",
    saving: "Saving…",
    delete: "Delete",
    deleting: "Deleting…",
    deleteConfirm: "Permanently delete this photo? This can't be undone.",
    addTitle: "Add photo",
    uploadPhoto: "Upload photo",
    uploading: "Uploading…",
  },
};

export default function AdminGallery() {
  const [authed] = useState(() => Boolean(getAuthToken()));
  const [lang, setLang] = useState("he");
  const toggleLang = () => setLang((p) => (p === "he" ? "en" : "he"));
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState({});
  const [deleting, setDeleting] = useState({});
  const [uploading, setUploading] = useState(false);

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.listGalleryPhotos();
      setPhotos(data);
      const map = {};
      data.forEach((photo) => {
        map[photo._id] = { sortOrder: photo.sortOrder || 0 };
      });
      setDrafts(map);
    } catch (err) {
      setError(err?.payload?.error || err.message || (lang === "he" ? "שגיאה בטעינת הגלריה" : "Failed to load gallery"));
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const handleSortOrderChange = (id, value) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], sortOrder: value } }));
  };

  const handleSaveOrder = async (id) => {
    setSaving((prev) => ({ ...prev, [id]: true }));
    try {
      await api.updateGalleryPhoto(id, { sortOrder: Number(drafts[id]?.sortOrder) || 0 });
      await loadPhotos();
    } catch (err) {
      setError(err?.payload?.error || err.message || (lang === "he" ? "שגיאה בשמירה" : "Failed to save"));
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(T[lang].deleteConfirm)) return;
    setDeleting((prev) => ({ ...prev, [id]: true }));
    try {
      await api.deleteGalleryPhoto(id);
      await loadPhotos();
    } catch (err) {
      setError(err?.payload?.error || err.message || (lang === "he" ? "שגיאה במחיקה" : "Failed to delete"));
    } finally {
      setDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { url } = await api.uploadImage(file);
      const nextSortOrder = photos.length ? Math.max(...photos.map((p) => p.sortOrder || 0)) + 1 : 1;
      await api.addGalleryPhoto({ url, sortOrder: nextSortOrder });
      await loadPhotos();
    } catch (err) {
      setError(err?.payload?.error || err.message || (lang === "he" ? "שגיאה בהעלאת תמונה" : "Failed to upload photo"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white" dir={lang === "he" ? "rtl" : "ltr"}>
      <header className="border-b border-white/10 bg-black/70 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Images className="h-6 w-6 text-white" />
            <div>
              <p className="text-lg font-semibold">{T[lang].header}</p>
              <p className="text-xs text-white/60">{T[lang].subtitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
            <Link to="/admin/calendar" className="rounded-lg border border-white/15 px-3 py-1 hover:bg-white/10">
              {T[lang].calendar}
            </Link>
            <Link to="/admin/services" className="rounded-lg border border-white/15 px-3 py-1 hover:bg-white/10">
              {T[lang].services}
            </Link>
            <Link to="/admin" className="rounded-lg border border-white/15 px-3 py-1 hover:bg-white/10">
              {T[lang].console}
            </Link>
            <Link to="/admin/guide" target="_blank" rel="noreferrer" className="rounded-lg border border-white/15 px-3 py-1 hover:bg-white/10">
              {T[lang].guide}
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
                <h2 className="text-lg font-semibold text-white">{T[lang].photos}</h2>
                <button
                  onClick={loadPhotos}
                  className="rounded-lg border border-white/20 px-3 py-1 text-sm text-white/80 hover:bg-white/10"
                >
                  {T[lang].refresh}
                </button>
              </div>
              {loading ? (
                <p className="mt-3 text-sm text-white/70">{T[lang].loading}</p>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {photos.map((photo) => (
                    <div key={photo._id} className="rounded-xl border border-white/10 bg-black/40 p-3">
                      <img
                        src={photo.url}
                        alt=""
                        className="h-40 w-full rounded-lg border border-white/10 object-cover"
                      />
                      <div className="mt-3 flex items-center gap-2">
                        <label className="flex-1 text-xs text-white/70">
                          {T[lang].sortOrder}
                          <input
                            type="number"
                            value={drafts[photo._id]?.sortOrder ?? 0}
                            onChange={(e) => handleSortOrderChange(photo._id, e.target.value)}
                            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white"
                          />
                        </label>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => handleSaveOrder(photo._id)}
                          disabled={saving[photo._id]}
                          className="flex-1 rounded-lg bg-white/90 px-3 py-1 text-sm font-semibold text-black hover:bg-white disabled:opacity-60"
                        >
                          {saving[photo._id] ? T[lang].saving : T[lang].save}
                        </button>
                        <button
                          onClick={() => handleDelete(photo._id)}
                          disabled={deleting[photo._id]}
                          className="flex-1 rounded-lg border border-red-500/50 px-3 py-1 text-sm text-red-300 hover:bg-red-500/20 disabled:opacity-60"
                        >
                          {deleting[photo._id] ? T[lang].deleting : T[lang].delete}
                        </button>
                      </div>
                    </div>
                  ))}
                  {!photos.length && !loading ? (
                    <p className="col-span-full rounded-lg border border-dashed border-white/15 bg-black/30 px-3 py-4 text-center text-sm text-white/60">
                      {T[lang].noPhotos}
                    </p>
                  ) : null}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-inner">
              <h2 className="text-lg font-semibold text-white">{T[lang].addTitle}</h2>
              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10">
                {uploading ? T[lang].uploading : T[lang].uploadPhoto}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => handleUpload(e.target.files?.[0])}
                />
              </label>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
