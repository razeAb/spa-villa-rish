import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getAuthToken, setAuthToken } from "../api/client";

const STATUSES = ["pending", "confirmed", "done", "canceled"];
const DOW_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

const normalizeOpeningHours = (hours = []) => {
  return DOW_LABELS.map((_, dow) => {
    const existing = hours.find((entry) => Number(entry.dow) === dow);
    if (existing) return { dow, open: existing.open, close: existing.close };
    return { dow, open: "", close: "" };
  });
};

export default function AdminConsole() {
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [authed, setAuthed] = useState(() => Boolean(getAuthToken()));
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [settings, setSettings] = useState(null);
  const [settingsForm, setSettingsForm] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [settingsSaving, setSettingsSaving] = useState(false);

  const loadBookings = async () => {
    if (!authed) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.listBookings();
      setBookings(data);
    } catch (err) {
      setError(err?.payload?.error || err.message || "Failed to fetch bookings");
      if (err?.status === 401) {
        setAuthToken(null);
        setAuthed(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  useEffect(() => {
    let alive = true;
    setSettingsLoading(true);
    setSettingsError("");
    api
      .getSettings()
      .then((data) => {
        if (!alive) return;
        const normalized = {
          slotStepMin: data.slotStepMin,
          bufferMin: data.bufferMin,
          openingHours: normalizeOpeningHours(data.openingHours || []),
        };
        setSettings(normalized);
        setSettingsForm(normalized);
      })
      .catch((err) => {
        if (!alive) return;
        setSettingsError(err?.payload?.error || err.message || "Failed to load settings");
      })
      .finally(() => {
        if (alive) setSettingsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError("");
    try {
      const { token } = await api.login(creds.username, creds.password);
      setAuthToken(token);
      setAuthed(true);
      setCreds({ username: "", password: "" });
    } catch (err) {
      setLoginError(err?.payload?.error || err.message || "Login failed");
    }
  };

  const handleStatusChange = async (bookingId, status) => {
    try {
      await api.updateBooking(bookingId, { status });
      await loadBookings();
    } catch (err) {
      setError(err?.payload?.error || err.message || "Failed to update booking");
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setAuthed(false);
    setBookings([]);
  };

  const updateSettingsField = (field, value) => {
    setSettingsForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const updateOpeningHour = (dow, field, value) => {
    setSettingsForm((prev) => {
      if (!prev) return prev;
      const hours = prev.openingHours.map((entry) => (entry.dow === dow ? { ...entry, [field]: value } : entry));
      return { ...prev, openingHours: hours };
    });
  };

  const handleSettingsSubmit = async (event) => {
    event.preventDefault();
    if (!settingsForm) return;
    setSettingsSaving(true);
    setSettingsMessage("");
    try {
      const payload = {
        slotStepMin: Number(settingsForm.slotStepMin),
        bufferMin: Number(settingsForm.bufferMin),
        openingHours: settingsForm.openingHours
          .filter((entry) => entry.open && entry.close)
          .map((entry) => ({ dow: entry.dow, open: entry.open, close: entry.close })),
      };
      const updated = await api.updateSettings(payload);
      const normalized = {
        slotStepMin: updated.slotStepMin,
        bufferMin: updated.bufferMin,
        openingHours: normalizeOpeningHours(updated.openingHours || []),
      };
      setSettings(normalized);
      setSettingsForm(normalized);
      setSettingsMessage("Settings saved");
    } catch (err) {
      setSettingsMessage(err?.payload?.error || err.message || "Failed to save settings");
    } finally {
      setSettingsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black/70 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-xl font-semibold">Spa Villa Rish · Admin</h1>
          <Link to="/" className="text-sm text-white/70 hover:text-white">
            ← Back to site
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        {!authed ? (
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6 shadow-lg shadow-black/40">
            <h2 className="text-lg font-semibold text-white">Login</h2>
            <p className="mt-1 text-sm text-white/60">
              Use the credentials defined in <code>backend/.env</code>.
            </p>
            <form className="mt-6 space-y-4" onSubmit={handleLogin}>
              <label className="block text-sm">
                Username
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white"
                  value={creds.username}
                  onChange={(event) => setCreds((prev) => ({ ...prev, username: event.target.value }))}
                />
              </label>
              <label className="block text-sm">
                Password
                <input
                  type="password"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white"
                  value={creds.password}
                  onChange={(event) => setCreds((prev) => ({ ...prev, password: event.target.value }))}
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-lg bg-white/90 px-4 py-2 text-black transition hover:bg-white"
              >
                Sign in
              </button>
              {loginError ? <p className="text-sm text-red-400">{loginError}</p> : null}
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-white/60">Authenticated</p>
                <button className="text-xs text-white/60 hover:text-white" onClick={handleLogout}>
                  Logout
                </button>
              </div>
              <button
                onClick={loadBookings}
                className="rounded-lg border border-white/20 px-3 py-1 text-sm text-white/80 hover:bg-white/10"
                disabled={loading}
              >
                {loading ? "Refreshing…" : "Refresh"}
              </button>
            </div>

            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-white/60">Customer</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-white/60">Service</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-white/60">Start</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-white/60">Payment</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-white/60">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="bg-black/40">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{booking.customerName}</p>
                        <p className="text-xs text-white/60">{booking.phone}</p>
                        {booking.customerEmail ? (
                          <p className="text-xs text-white/60">{booking.customerEmail}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-white/80">{booking.serviceId?.title || "—"}</td>
                      <td className="px-4 py-3 text-white/80">
                        {booking.startUtc ? new Date(booking.startUtc).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-white/80">
                        {booking.totalAmount ? (
                          <>
                            <p className="font-medium">{formatMoney(booking.totalAmount, booking.currency)}</p>
                            <p className="text-xs uppercase tracking-wide text-white/60">{booking.paymentStatus}</p>
                          </>
                        ) : (
                          <span className="text-white/60">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={booking.status}
                          onChange={(event) => handleStatusChange(booking._id, event.target.value)}
                          className="rounded-md border border-white/10 bg-black/60 px-2 py-1 text-xs uppercase tracking-wide text-white"
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {!bookings.length && !loading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-white/60">
                        No bookings yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-inner shadow-black/20">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Availability & Hours</h3>
                  <p className="text-sm text-white/60">
                    Update slot size, buffers, and weekly opening hours.
                  </p>
                </div>
                {!authed ? (
                  <p className="text-xs text-white/60">Sign in to edit</p>
                ) : null}
              </div>
              {settingsLoading ? (
                <p className="mt-4 text-sm text-white/70">Loading settings…</p>
              ) : settingsError ? (
                <p className="mt-4 text-sm text-red-400">{settingsError}</p>
              ) : settingsForm ? (
                <form className="mt-6 space-y-5" onSubmit={handleSettingsSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm text-white/80">
                      Slot step (minutes)
                      <input
                        type="number"
                        min="5"
                        step="5"
                        value={settingsForm.slotStepMin ?? ""}
                        onChange={(event) => updateSettingsField("slotStepMin", event.target.value)}
                        disabled={!authed || settingsSaving}
                        className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white"
                      />
                    </label>
                    <label className="text-sm text-white/80">
                      Buffer (minutes)
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={settingsForm.bufferMin ?? ""}
                        onChange={(event) => updateSettingsField("bufferMin", event.target.value)}
                        disabled={!authed || settingsSaving}
                        className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white"
                      />
                    </label>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {settingsForm.openingHours.map((entry) => (
                      <div key={entry.dow} className="rounded-xl border border-white/10 bg-black/30 p-3">
                        <p className="text-xs uppercase tracking-wide text-white/60">{DOW_LABELS[entry.dow]}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <input
                            type="time"
                            value={entry.open}
                            onChange={(event) => updateOpeningHour(entry.dow, "open", event.target.value)}
                            disabled={!authed || settingsSaving}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white"
                          />
                          <span className="text-white/60">→</span>
                          <input
                            type="time"
                            value={entry.close}
                            onChange={(event) => updateOpeningHour(entry.dow, "close", event.target.value)}
                            disabled={!authed || settingsSaving}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {settingsMessage ? (
                    <p className="text-sm text-emerald-300">{settingsMessage}</p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={!authed || settingsSaving}
                    className="rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-black transition hover:bg-white disabled:cursor-not-allowed disabled:bg-white/40 disabled:text-black/60"
                  >
                    {settingsSaving ? "Saving…" : "Save availability"}
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
