import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, LogOut, RefreshCcw, Wrench } from "lucide-react";
import { api, getAuthToken, setAuthToken } from "../api/client";
import "./AdminCalendar.css";

const toDateIso = (date) => date.toISOString().slice(0, 10);
const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const buildCalendarDays = (monthCursor, selectedIso) => {
  const start = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
  const firstDow = start.getDay();
  const daysInMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0).getDate();
  const days = [];

  for (let i = firstDow; i > 0; i--) {
    const date = new Date(start);
    date.setDate(start.getDate() - i);
    days.push({
      iso: toDateIso(date),
      label: date.getDate(),
      inMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(start);
    date.setDate(day);
    days.push({
      iso: toDateIso(date),
      label: day,
      inMonth: true,
    });
  }

  const trailing = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= trailing; i++) {
    const date = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, i);
    days.push({
      iso: toDateIso(date),
      label: date.getDate(),
      inMonth: false,
    });
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

/* ---------------------------------------------------
   COMPONENT START
--------------------------------------------------- */
export default function AdminCalendar() {
  const [lang, setLang] = useState("he"); // "he" | "en"
  const toggleLang = () => setLang((p) => (p === "he" ? "en" : "he"));

  /* ----------------------------- TRANSLATIONS ----------------------------- */
  const T = {
    he: {
      adminCalendar: "לוח ניהול",
      manageVisually: "ניהול תורים בצורה ויזואלית",
      adminList: "רשימת אדמינים",
      backToSite: "חזרה לאתר",
      login: "התחברות",
      loginDesc: "הזן פרטי מנהל לצורך ניהול תורים.",
      username: "שם משתמש",
      password: "סיסמה",
      signIn: "כניסה",
      prev: "← חודש קודם",
      next: "חודש הבא →",
      refresh: "רענון",
      refreshing: "מרענן…",
      logout: "התנתקות",
      selectedDay: "יום נבחר",
      noBookings: "אין תורים",
      items: "תורים",
      addAppointment: "הוספת תור",
      manualBooking: "יוצר תור ידני ללא תשלום.",
      service: "שירות",
      date: "תאריך",
      time: "שעה",
      customerName: "שם לקוח",
      phone: "טלפון",
      email: "אימייל",
      comment: "הערה",
      optionalNote: "הערה (לא חובה)",
      add: "הוסף תור",
      adding: "מוסיף…",
      today: "היום",
      empty: "פנוי",
      remove: "מחק",
      removing: "מוחק…",
      saveComment: "שמור הערה",
      saving: "שומר…",
      langButton: "English",
      emptyDay: "אין תורים ביום זה.",
    },
    en: {
      adminCalendar: "Admin Calendar",
      manageVisually: "Manage bookings visually",
      adminList: "Admin list",
      backToSite: "← Back to site",
      login: "Login",
      loginDesc: "Use your admin credentials to manage appointments.",
      username: "Username",
      password: "Password",
      signIn: "Sign in",
      prev: "← Prev",
      next: "Next →",
      refresh: "Refresh",
      refreshing: "Refreshing…",
      logout: "Logout",
      selectedDay: "Selected day",
      noBookings: "No bookings",
      items: "items",
      addAppointment: "Add appointment",
      manualBooking: "Creates a manual booking without payment.",
      service: "Service",
      date: "Date",
      time: "Time",
      customerName: "Customer name",
      phone: "Phone",
      email: "Email",
      comment: "Comment",
      optionalNote: "Optional note",
      add: "Add appointment",
      adding: "Adding…",
      today: "Today",
      empty: "Empty",
      remove: "Remove",
      removing: "Removing…",
      saveComment: "Save comment",
      saving: "Saving…",
      langButton: "עברית",
      emptyDay: "No appointments for this day.",
    },
  };

  const DAY_LABELS = lang === "he" ? ["א", "ב", "ג", "ד", "ה", "ו", "ש"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  /* ----------------------------- STATES ----------------------------- */
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

  const [createState, setCreateState] = useState({
    status: "idle",
    message: "",
  });

  /* ----------------------------- FETCH SERVICES ----------------------------- */
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
  }, []);

  useEffect(() => {
    setNoteDrafts(
      bookings.reduce((map, booking) => {
        map[booking._id] = booking.note || "";
        return map;
      }, {})
    );
  }, [bookings]);

  /* ----------------------------- RANGE ----------------------------- */
  const range = useMemo(() => {
    const from = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    const to = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0, 23, 59, 59, 999);
    return { from: from.toISOString(), to: to.toISOString() };
  }, [monthCursor]);

  const calendarDays = useMemo(() => buildCalendarDays(monthCursor, selectedDateIso), [monthCursor, selectedDateIso]);

  /* ----------------------------- BOOKINGS ORGANIZED ----------------------------- */
  const bookingsByDate = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      const iso = toDateIso(new Date(b.startUtc));
      if (!map[iso]) map[iso] = [];
      map[iso].push(b);
    });
    Object.values(map).forEach((list) => list.sort((a, b) => new Date(a.startUtc) - new Date(b.startUtc)));
    return map;
  }, [bookings]);

  const dayBookings = bookingsByDate[selectedDateIso] || [];

  /* ----------------------------- LOGIN ----------------------------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    try {
      const { token } = await api.login(creds.username, creds.password);
      setAuthToken(token);
      setAuthed(true);
    } catch (err) {
      setLoginError(err?.payload?.error || err.message);
    }
  };

  const loadBookings = async () => {
    if (!authed) return;
    setBookingsLoading(true);
    setBookingsError("");

    try {
      const data = await api.listBookings({
        from: range.from,
        to: range.to,
      });
      setBookings(data);
    } catch (err) {
      setBookingsError(err?.payload?.error || err.message);
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
  }, [authed, range.from, range.to]);

  /* ----------------------------- MONTH CHANGE ----------------------------- */
  const handleMonthShift = (delta) => {
    setMonthCursor((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + delta, 1);
      return next;
    });
  };

  /* ----------------------------- REMOVE ----------------------------- */
  const handleDelete = async (id) => {
    if (!window.confirm(T[lang].remove + "?")) return;

    setDeleting((p) => ({ ...p, [id]: true }));
    try {
      await api.deleteBooking(id);
      await loadBookings();
    } finally {
      setDeleting((p) => ({ ...p, [id]: false }));
    }
  };

  /* ----------------------------- SAVE COMMENT ----------------------------- */
  const handleNoteSave = async (id) => {
    const next = noteDrafts[id] ?? "";
    setSavingNote((p) => ({ ...p, [id]: true }));

    try {
      await api.updateBooking(id, { note: next });
      await loadBookings();
    } finally {
      setSavingNote((p) => ({ ...p, [id]: false }));
    }
  };

  /* ----------------------------- ADD BOOKING ----------------------------- */
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateState({ status: "idle", message: "" });

    const startUtc = combineDateTime(newBooking.date, newBooking.time);
    if (!startUtc) {
      setCreateState({
        status: "error",
        message: lang === "he" ? "בחר תאריך ושעה" : "Choose date and time",
      });
      return;
    }

    if (!newBooking.serviceId || !newBooking.customerName || !newBooking.phone || !newBooking.customerEmail) {
      setCreateState({
        status: "error",
        message: lang === "he" ? "כל השדות חובה" : "All fields are required",
      });
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

      setCreateState({
        status: "success",
        message: lang === "he" ? "התור נוסף" : "Appointment added",
      });

      setNewBooking((prev) => ({ ...prev, time: "", note: "" }));
      await loadBookings();
    } catch (err) {
      setCreateState({
        status: "error",
        message: err?.payload?.error || err.message,
      });
    }
  };

  /* ---------------------------------------------------
     RETURN
  --------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white" dir={lang === "he" ? "rtl" : "ltr"}>
      {/* HEADER */}
      <header className="border-b border-white/10 bg-black/70 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-white" />
            <div>
              <p className="text-lg font-semibold">{T[lang].adminCalendar}</p>
              <p className="text-xs text-white/60">{T[lang].manageVisually}</p>
            </div>
          </div>

          {/* LANGUAGE SWITCH */}
          <button onClick={toggleLang} className="rounded-lg border border-white/20 px-3 py-1 text-sm text-white/80 hover:bg-white/10">
            {T[lang].langButton}
          </button>
        </div>
      </header>

      {/* BODY */}
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        {/* LOGIN */}
        {!authed ? (
          <div className="mx-auto max-w-md rounded-2xl border border-white/15 bg-white/5 p-6 shadow-xl shadow-black/40">
            <h2 className="text-lg font-semibold">{T[lang].login}</h2>
            <p className="mt-1 text-sm text-white/60">{T[lang].loginDesc}</p>

            <form className="mt-6 space-y-4" onSubmit={handleLogin}>
              <label className="block text-sm">
                {T[lang].username}
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2"
                  value={creds.username}
                  onChange={(e) => setCreds((p) => ({ ...p, username: e.target.value }))}
                />
              </label>

              <label className="block text-sm">
                {T[lang].password}
                <input
                  type="password"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2"
                  value={creds.password}
                  onChange={(e) => setCreds((p) => ({ ...p, password: e.target.value }))}
                />
              </label>

              <button type="submit" className="w-full rounded-lg bg-white/90 px-4 py-2 text-black transition hover:bg-white">
                {T[lang].signIn}
              </button>

              {loginError ? <p className="text-sm text-red-400">{loginError}</p> : null}
            </form>
          </div>
        ) : (
          /* ---------------------------------------------------
             AUTHENTICATED VIEW
          --------------------------------------------------- */
          <div className="space-y-6">
            {/* MONTH CONTROL */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <button className="rounded-lg border border-white/15 px-3 py-1 hover:bg-white/10" onClick={() => handleMonthShift(-1)}>
                  {T[lang].prev}
                </button>

                <div className="rounded-lg border border-white/15 px-3 py-1 font-semibold">
                  {monthCursor.toLocaleString(lang === "he" ? "he" : "en", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>

                <button className="rounded-lg border border-white/15 px-3 py-1 hover:bg-white/10" onClick={() => handleMonthShift(1)}>
                  {T[lang].next}
                </button>
              </div>

              {/* Refresh + Logout */}
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={loadBookings}
                  disabled={bookingsLoading}
                  className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-1 text-white/80 hover:bg-white/10 disabled:opacity-60"
                >
                  <RefreshCcw className="h-4 w-4" />
                  {bookingsLoading ? T[lang].refreshing : T[lang].refresh}
                </button>

                <button
                  onClick={() => {
                    setAuthToken(null);
                    setAuthed(false);
                  }}
                  className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-1 hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4" />
                  {T[lang].logout}
                </button>
              </div>
            </div>

            {/* Calendar & Day Details */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* CALENDAR */}
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner">
                  <div className="grid grid-cols-7 gap-2 text-xs uppercase tracking-wide text-white/50">
                    {DAY_LABELS.map((label) => (
                      <span key={label} className="text-center">
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="mt-2 grid grid-cols-7 gap-2">
                    {calendarDays.map((day, idx) => {
                      const count = bookingsByDate[day.iso]?.length || 0;
                      return (
                        <button
                          key={`${day.iso}-${idx}`}
                          onClick={() => {
                            setSelectedDateIso(day.iso);
                            setNewBooking((prev) => ({
                              ...prev,
                              date: day.iso,
                            }));
                          }}
                          className={`flex h-24 flex-col justify-between rounded-xl border border-white/10 bg-black/40 p-2 transition hover:border-white/30 ${
                            day.isSelected ? "ring-2 ring-white" : ""
                          } ${day.inMonth ? "" : "opacity-40"}`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span>{day.label}</span>
                            {day.isToday ? <span className="rounded-md bg-white/15 px-2 py-0.5 text-[10px]">{T[lang].today}</span> : null}
                          </div>

                          <div className="text-[11px] text-white/70">{count ? `${count} ${T[lang].items}` : T[lang].empty}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SELECTED DAY */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60">{T[lang].selectedDay}</p>
                      <h3 className="text-xl font-semibold">
                        {new Date(selectedDateIso).toLocaleDateString(lang === "he" ? "he" : "en", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </h3>
                    </div>

                    <span className="rounded-lg border border-white/10 px-3 py-1 text-xs text-white/60">
                      {dayBookings.length ? `${dayBookings.length} ${T[lang].items}` : T[lang].noBookings}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {dayBookings.map((b) => (
                      <div key={b._id} className="rounded-xl border border-white/10 bg-black/40 p-4 shadow-inner">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-sm font-semibold">
                              {b.customerName} • {b.serviceId?.title || T[lang].service}
                            </p>

                            <p className="text-xs text-white/60">
                              {formatTime(b.startUtc)} – {formatTime(b.endUtc)} · {b.phone}
                            </p>

                            {b.customerEmail ? <p className="text-xs text-white/60">{b.customerEmail}</p> : null}
                          </div>

                          <button
                            onClick={() => handleDelete(b._id)}
                            disabled={deleting[b._id]}
                            className="rounded-lg border border-white/20 px-3 py-1 text-red-300 hover:bg-red-500/10 disabled:opacity-60"
                          >
                            {deleting[b._id] ? T[lang].removing : T[lang].remove}
                          </button>
                        </div>

                        <label className="mt-3 block text-xs text-white/70">
                          {T[lang].comment}
                          <textarea
                            value={noteDrafts[b._id]}
                            onChange={(e) =>
                              setNoteDrafts((prev) => ({
                                ...prev,
                                [b._id]: e.target.value,
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm"
                            rows={2}
                          />
                        </label>

                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={() => handleNoteSave(b._id)}
                            disabled={savingNote[b._id]}
                            className="rounded-lg bg-white/90 px-3 py-1 text-xs font-semibold text-black hover:bg-white disabled:opacity-60"
                          >
                            {savingNote[b._id] ? T[lang].saving : T[lang].saveComment}
                          </button>
                        </div>
                      </div>
                    ))}

                    {!dayBookings.length ? (
                      <p className="rounded-lg border border-dashed border-white/15 bg-black/30 px-3 py-6 text-center text-sm text-white/60">
                        {T[lang].emptyDay}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* ADD APPOINTMENT SIDEBAR */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-white" />
                    <div>
                      <p className="text-sm font-semibold">{T[lang].addAppointment}</p>
                      <p className="text-xs text-white/60">{T[lang].manualBooking}</p>
                    </div>
                  </div>

                  <form className="mt-4 space-y-3" onSubmit={handleCreate}>
                    {/* SERVICE */}
                    <label className="block text-sm text-white/80">
                      {T[lang].service}
                      <select
                        value={newBooking.serviceId}
                        onChange={(e) =>
                          setNewBooking((prev) => ({
                            ...prev,
                            serviceId: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2"
                        disabled={servicesLoading}
                      >
                        {services.map((svc) => (
                          <option key={svc._id} value={svc._id}>
                            {svc.title}
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* DATE + TIME */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* DATE */}
                      <label className="block text-sm">
                        {T[lang].date}
                        <div className="relative mt-1 border-b border-white/30">
                          <input
                            id="datePicker"
                            type="date"
                            value={newBooking.date}
                            onChange={(e) =>
                              setNewBooking((prev) => ({
                                ...prev,
                                date: e.target.value,
                              }))
                            }
                            className="w-full bg-transparent text-white py-2 pr-10 outline-none"
                          />
                          <Calendar
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer text-white/70"
                            onClick={() => document.getElementById("datePicker").showPicker?.()}
                          />
                        </div>
                      </label>

                      {/* TIME */}
                      <label className="block text-sm">
                        {T[lang].time}
                        <div className="relative mt-1 border-b border-white/30">
                          <input
                            id="timePicker"
                            type="time"
                            value={newBooking.time}
                            onChange={(e) =>
                              setNewBooking((prev) => ({
                                ...prev,
                                time: e.target.value,
                              }))
                            }
                            className="w-full bg-transparent text-white py-2 pr-10 outline-none"
                          />
                          <svg
                            onClick={() => document.getElementById("timePicker").showPicker?.()}
                            xmlns="http://www.w3.org/2000/svg"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 cursor-pointer text-white/70"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
                            />
                          </svg>
                        </div>
                      </label>
                    </div>

                    {/* CUSTOMER NAME */}
                    <label className="block text-sm">
                      {T[lang].customerName}
                      <input
                        type="text"
                        value={newBooking.customerName}
                        onChange={(e) =>
                          setNewBooking((prev) => ({
                            ...prev,
                            customerName: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2"
                      />
                    </label>

                    {/* PHONE */}
                    <label className="block text-sm">
                      {T[lang].phone}
                      <input
                        type="tel"
                        value={newBooking.phone}
                        onChange={(e) =>
                          setNewBooking((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2"
                        placeholder="+972…"
                      />
                    </label>

                    {/* EMAIL */}
                    <label className="block text-sm">
                      {T[lang].email}
                      <input
                        type="email"
                        value={newBooking.customerEmail}
                        onChange={(e) =>
                          setNewBooking((prev) => ({
                            ...prev,
                            customerEmail: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2"
                        placeholder="guest@example.com"
                      />
                    </label>

                    {/* COMMENT */}
                    <label className="block text-sm">
                      {T[lang].comment}
                      <textarea
                        value={newBooking.note}
                        onChange={(e) =>
                          setNewBooking((prev) => ({
                            ...prev,
                            note: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 p-2"
                        rows={2}
                        placeholder={T[lang].optionalNote}
                      />
                    </label>

                    {/* STATUS MESSAGES */}
                    {createState.message ? (
                      <p className={`text-sm ${createState.status === "error" ? "text-red-400" : "text-emerald-300"}`}>
                        {createState.message}
                      </p>
                    ) : null}

                    {/* SUBMIT BUTTON */}
                    <button
                      type="submit"
                      disabled={createState.status === "loading"}
                      className="w-full rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-black transition hover:bg-white disabled:opacity-60"
                    >
                      {createState.status === "loading" ? T[lang].adding : T[lang].add}
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
