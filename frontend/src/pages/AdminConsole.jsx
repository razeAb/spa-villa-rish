import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getAuthToken, setAuthToken } from "../api/client";

const STATUSES = ["pending", "confirmed", "done", "canceled"];

export default function AdminConsole() {
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [authed, setAuthed] = useState(() => Boolean(getAuthToken()));
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginError, setLoginError] = useState("");

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
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-white/60">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="bg-black/40">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{booking.customerName}</p>
                        <p className="text-xs text-white/60">{booking.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-white/80">{booking.serviceId?.title || "—"}</td>
                      <td className="px-4 py-3 text-white/80">
                        {booking.startUtc ? new Date(booking.startUtc).toLocaleString() : "—"}
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
          </div>
        )}
      </main>
    </div>
  );
}
