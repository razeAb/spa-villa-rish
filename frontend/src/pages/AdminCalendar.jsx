import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, LogOut, RefreshCcw, Wrench } from "lucide-react";
import { api, getAuthToken, setAuthToken } from "../api/client";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toDateIso = (date) => date.toISOString().slice(0, 10);
const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const buildCalendarDays = (monthCursor, selectedIso) => {
  const start = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
  const firstDow = start.getDay();
  const daysInMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0).getDate();
  const days = [];

  for (let i = firstDow; i > 0; i -= 1) {
    const date = new Date(start);
    date.setDate(start.getDate() - i);
    days.push({ iso: toDateIso(date), label: date.getDate(), inMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(start);
    date.setDate(day);
    days.push({
      iso: toDateIso(date),
      label: day,
      inMonth: true,
    });
  }

  const trailing = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= trailing; i += 1) {
    const date = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, i);
    days.push({ iso: toDateIso(date), label: date.getDate(), inMonth: false });
  }

  const todayIso = toDateIso(new Date());
  return days.map((entry) => ({
    ...entry,
    isToday: entry.iso === todayIso,
    isSelected: entry.iso === selectedIso,
  }));
};

const combineDateTime = (dateIso, time) => {
  if (!dateIso || !time) return null;
  const local = new Date(`${dateIso}T${time}`);
  if (Number.isNaN(local.getTime())) return null;
  return local.toISOString();
};

export default function AdminCalendar() {
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [authed, setAuthed] = useState(() => Boolean(getAuthToken()));
  const [loginError, setLoginError] = useState("");

  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    now.setDate(1);
    return now;
  });
  const [selectedDateIso, setSelectedDateIso] = useState(toDateIso(new Date()));
  const [showCalendar, setShowCalendar] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState("");

  const [noteDrafts, setNoteDrafts] = useState({});
  const [savingNote, setSavingNote] = useState({});
  const [deleting, setDeleting] = useState({});

  const [newBooking, setNewBooking] = useState({
    serviceId: "",
    date: toDateIso(new Date()),
    time: "",
    customerName: "",
    phone: "",
    customerEmail: "",
    note: "",
  });
  const [createState, setCreateState] = useState({ status: "idle", message: "" });

  useEffect(() => {
    setServicesLoading(true);
    api
      .listServices()
      .then((data) => {
        setServices(data);
        if (!newBooking.serviceId && data.length) {
          setNewBooking((prev) => ({ ...prev, serviceId: data[0]._id }));
        }
      })
      .finally(() => setServicesLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setNoteDrafts(
      bookings.reduce((map, booking) => {
        map[booking._id] = booking.note || "";
        return map;
      }, {})
    );
  }, [bookings]);

  const range = useMemo(() => {
    const from = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    const to = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0, 23, 59, 59, 999);
    return { from: from.toISOString(), to: to.toISOString() };
  }, [monthCursor]);

  const calendarDays = useMemo(() => buildCalendarDays(monthCursor, selectedDateIso), [monthCursor, selectedDateIso]);

  const bookingsByDate = useMemo(() => {
    const map = {};
    bookings.forEach((booking) => {
      const iso = toDateIso(new Date(booking.startUtc));
      if (!map[iso]) map[iso] = [];
      map[iso].push(booking);
    });
    Object.values(map).forEach((list) => list.sort((a, b) => new Date(a.startUtc) - new Date(b.startUtc)));
    return map;
  }, [bookings]);

  const dayBookings = bookingsByDate[selectedDateIso] || [];

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

  const loadBookings = async () => {
    if (!authed) return;
    setBookingsLoading(true);
    setBookingsError("");
    try {
      const data = await api.listBookings({ from: range.from, to: range.to });
      setBookings(data);
    } catch (err) {
      setBookingsError(err?.payload?.error || err.message || "Failed to fetch bookings");
      if (err?.status === 401) {
        setAuthToken(null);
        setAuthed(false);
      }
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, range.from, range.to]);

  useEffect(() => {
    const monthIso = `${monthCursor.getFullYear()}-${String(monthCursor.getMonth() + 1).padStart(2, "0")}`;
    if (!selectedDateIso.startsWith(monthIso)) {
      const firstOfMonth = toDateIso(new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1));
      setSelectedDateIso(firstOfMonth);
      setNewBooking((prev) => ({ ...prev, date: firstOfMonth }));
    }
  }, [monthCursor, selectedDateIso]);

  const handleLogout = () => {
    setAuthToken(null);
    setAuthed(false);
    setBookings([]);
  };

  const handleNoteSave = async (bookingId) => {
    const next = noteDrafts[bookingId] ?? "";
    setSavingNote((prev) => ({ ...prev, [bookingId]: true }));
    try {
      await api.updateBooking(bookingId, { note: next });
      await loadBookings();
    } catch (err) {
      setBookingsError(err?.payload?.error || err.message || "Failed to update note");
    } finally {
      setSavingNote((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm("Remove this appointment? This cannot be undone.")) return;
    setDeleting((prev) => ({ ...prev, [bookingId]: true }));
    try {
      await api.deleteBooking(bookingId);
      await loadBookings();
    } catch (err) {
      setBookingsError(err?.payload?.error || err.message || "Failed to remove appointment");
    } finally {
      setDeleting((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreateState({ status: "idle", message: "" });
    const startUtc = combineDateTime(newBooking.date, newBooking.time);
    if (!startUtc) {
      setCreateState({ status: "error", message: "Choose date and time" });
      return;
    }
    if (!newBooking.serviceId || !newBooking.customerName || !newBooking.phone || !newBooking.customerEmail) {
      setCreateState({ status: "error", message: "All fields are required" });
      return;
    }

    setCreateState({ status: "loading", message: "" });
    try {
      await api.createAdminBooking({
        serviceId: newBooking.serviceId,
        customerName: newBooking.customerName,
        phone: newBooking.phone,
        customerEmail: newBooking.customerEmail,
        startUtc,
        note: newBooking.note,
      });
      setCreateState({ status: "success", message: "Appointment added" });
      setNewBooking((prev) => ({ ...prev, time: "", note: "" }));
      await loadBookings();
    } catch (err) {
      setCreateState({ status: "error", message: err?.payload?.error || err.message || "Failed to add appointment" });
    }
  };

  const handleMonthShift = (delta) => {
    setMonthCursor((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + delta, 1);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white">
      <header className="border-b border-white/10 bg-black/70 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-white" />
            <div>
              <p className="text-lg font-semibold">Admin Calendar</p>
              <p className="text-xs text-white/60">Manage bookings visually</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-white/70">
            <Link to="/admin" className="hover:text-white">
              Admin list
            </Link>
            <Link to="/" className="hover:text-white">
              ← Back to site
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        {!authed ? (
          <div className="mx-auto max-w-md rounded-2xl border border-white/15 bg-white/5 p-6 shadow-xl shadow-black/40">
            <h2 className="text-lg font-semibold text-white">Login</h2>
            <p className="mt-1 text-sm text-white/60">Use your admin credentials to manage appointments.</p>
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
              <button type="submit" className="w-full rounded-lg bg-white/90 px-4 py-2 text-black transition hover:bg-white">
                Sign in
              </button>
              {loginError ? <p className="text-sm text-red-400">{loginError}</p> : null}
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <button className="rounded-lg border border-white/15 px-3 py-1 hover:bg-white/10" onClick={() => handleMonthShift(-1)}>
                  ← Prev
                </button>
                <div className="rounded-lg border border-white/15 px-3 py-1 font-semibold text-white">
                  {monthCursor.toLocaleString("en", { month: "long", year: "numeric" })}
                </div>
                <button className="rounded-lg border border-white/15 px-3 py-1 hover:bg-white/10" onClick={() => handleMonthShift(1)}>
                  Next →
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={loadBookings}
                  disabled={bookingsLoading}
                  className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-1 text-white/80 transition hover:bg-white/10 disabled:opacity-60"
                >
                  <RefreshCcw className="h-4 w-4" />
                  {bookingsLoading ? "Refreshing…" : "Refresh"}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-1 text-white/80 transition hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>

            {bookingsError ? <p className="text-sm text-red-400">{bookingsError}</p> : null}

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/20">
                  <div className="grid grid-cols-7 gap-2 text-xs uppercase tracking-wide text-white/50">
                    {DAY_LABELS.map((label) => (
                      <span key={label} className="text-center">
                        {label}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 grid grid-cols-7 gap-2">
                    {calendarDays.map((day, index) => {
                      const count = bookingsByDate[day.iso]?.length || 0;
                      const highlight = day.isSelected ? "ring-2 ring-white" : "";
                      const muted = day.inMonth ? "" : "opacity-40";
                      return (
                        <button
                          key={`${day.iso}-${index}`}
                          onClick={() => {
                            setSelectedDateIso(day.iso);
                            setNewBooking((prev) => ({ ...prev, date: day.iso }));
                          }}
                          className={`flex h-24 flex-col justify-between rounded-xl border border-white/10 bg-black/40 p-2 text-left transition hover:border-white/30 ${highlight} ${muted}`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-white">{day.label}</span>
                            {day.isToday ? <span className="rounded-md bg-white/15 px-2 py-0.5 text-[10px]">Today</span> : null}
                          </div>
                          <div className="text-[11px] text-white/70">{count ? `${count} appointment${count > 1 ? "s" : ""}` : "Empty"}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60">Selected day</p>
                      <h3 className="text-xl font-semibold text-white">
                        {new Date(selectedDateIso).toLocaleDateString(undefined, {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </h3>
                    </div>
                    <span className="rounded-lg border border-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/60">
                      {dayBookings.length ? `${dayBookings.length} items` : "No bookings"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {dayBookings.map((booking) => (
                      <div key={booking._id} className="rounded-xl border border-white/10 bg-black/40 p-4 shadow-inner shadow-black/30">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {booking.customerName} • {booking.serviceId?.title || "Service"}
                            </p>
                            <p className="text-xs text-white/60">
                              {formatTime(booking.startUtc)} – {formatTime(booking.endUtc)} · {booking.phone}
                            </p>
                            {booking.customerEmail ? <p className="text-xs text-white/60">{booking.customerEmail}</p> : null}
                            <p className="mt-1 text-[11px] uppercase tracking-wide text-white/50">
                              Status: {booking.status} · Payment: {booking.paymentStatus}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <button
                              onClick={() => handleDelete(booking._id)}
                              disabled={deleting[booking._id]}
                              className="rounded-lg border border-white/20 px-3 py-1 text-red-300 transition hover:bg-red-500/10 disabled:opacity-60"
                            >
                              {deleting[booking._id] ? "Removing…" : "Remove"}
                            </button>
                          </div>
                        </div>
                        <label className="mt-3 block text-xs text-white/70">
                          Comment
                          <textarea
                            value={noteDrafts[booking._id] ?? ""}
                            onChange={(event) => setNoteDrafts((prev) => ({ ...prev, [booking._id]: event.target.value }))}
                            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white"
                            rows={2}
                          />
                        </label>
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={() => handleNoteSave(booking._id)}
                            disabled={savingNote[booking._id]}
                            className="rounded-lg bg-white/90 px-3 py-1 text-xs font-semibold text-black transition hover:bg-white disabled:opacity-60"
                          >
                            {savingNote[booking._id] ? "Saving…" : "Save comment"}
                          </button>
                        </div>
                      </div>
                    ))}
                    {!dayBookings.length ? (
                      <p className="rounded-lg border border-dashed border-white/15 bg-black/30 px-3 py-6 text-center text-sm text-white/60">
                        No appointments for this day.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-white" />
                    <div>
                      <p className="text-sm font-semibold text-white">Add appointment</p>
                      <p className="text-xs text-white/60">Creates a manual booking without payment.</p>
                    </div>
                  </div>
                  <form className="mt-4 space-y-3" onSubmit={handleCreate}>
                    <label className="block text-sm text-white/80">
                      Service
                      <select
                        value={newBooking.serviceId}
                        onChange={(event) => setNewBooking((prev) => ({ ...prev, serviceId: event.target.value }))}
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white"
                        disabled={servicesLoading}
                      >
                        {services.map((svc) => (
                          <option key={svc._id} value={svc._id}>
                            {svc.title}
                          </option>
                        ))}
                        {!services.length ? <option>No services</option> : null}
                      </select>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block text-sm text-white/80">
                        Date
                        <div className="relative">
                          <input
                            readOnly
                            value={newBooking.date}
                            onClick={() => setShowCalendar(!showCalendar)}
                            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white cursor-pointer"
                          />

                          {showCalendar && (
                            <div className="absolute z-50 mt-2 rounded-xl bg-black border border-white/10 shadow-xl p-3">
                              <DayPicker
                                mode="single"
                                selected={new Date(newBooking.date)}
                                onSelect={(date) => {
                                  if (!date) return;
                                  const iso = date.toISOString().slice(0, 10);
                                  setNewBooking((prev) => ({ ...prev, date: iso }));
                                  setShowCalendar(false);
                                }}
                                modifiersClassNames={{
                                  selected: "bg-white text-black font-bold",
                                  today: "border border-white/40",
                                }}
                                className="text-white"
                              />
                            </div>
                          )}
                        </div>
                      </label>

                      <label className="block text-sm text-white/80">
                        Time
                        <input
                          type="time"
                          value={newBooking.time}
                          onChange={(event) => setNewBooking((prev) => ({ ...prev, time: event.target.value }))}
                          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white"
                        />
                      </label>
                    </div>
                    <label className="block text-sm text-white/80">
                      Customer name
                      <input
                        type="text"
                        value={newBooking.customerName}
                        onChange={(event) => setNewBooking((prev) => ({ ...prev, customerName: event.target.value }))}
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white"
                        placeholder="Name"
                      />
                    </label>
                    <label className="block text-sm text-white/80">
                      Phone
                      <input
                        type="tel"
                        value={newBooking.phone}
                        onChange={(event) => setNewBooking((prev) => ({ ...prev, phone: event.target.value }))}
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white"
                        placeholder="+972…"
                      />
                    </label>
                    <label className="block text-sm text-white/80">
                      Email
                      <input
                        type="email"
                        value={newBooking.customerEmail}
                        onChange={(event) => setNewBooking((prev) => ({ ...prev, customerEmail: event.target.value }))}
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white"
                        placeholder="guest@example.com"
                      />
                    </label>
                    <label className="block text-sm text-white/80">
                      Comment
                      <textarea
                        value={newBooking.note}
                        onChange={(event) => setNewBooking((prev) => ({ ...prev, note: event.target.value }))}
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 p-2 text-white"
                        rows={2}
                        placeholder="Optional note"
                      />
                    </label>
                    {createState.message ? (
                      <p className={`text-sm ${createState.status === "error" ? "text-red-400" : "text-emerald-300"}`}>
                        {createState.message}
                      </p>
                    ) : null}
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-black transition hover:bg-white disabled:opacity-60"
                      disabled={createState.status === "loading"}
                    >
                      {createState.status === "loading" ? "Adding…" : "Add appointment"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
