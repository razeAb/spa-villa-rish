import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { api } from "../api/client";
import { useLocale } from "../context/LocaleContext.jsx";
import { getTreatmentsForLocale } from "../data/treatments";

const COPY = {
  he: {
    heading: "תיאום טיפול",
    subtitle: "3 צעדים קצרים להזמנה מושלמת.",
    stepLabels: ["פרטים אישיים", "בחירת זמן", "תשלום"],
    contactTitle: "ספרו לנו למי לקבוע",
    nameLabel: "שם מלא",
    phoneLabel: "טלפון",
    contactHint: "נשתמש בפרטים רק כדי לאשר את ההזמנה.",
    calendarTitle: "בחרו תאריך ושעה",
    serviceLabel: "בחרו טיפול",
    dateLabel: "תאריך",
    slotsLabel: "שעות זמינות",
    noSlots: "אין שעות פנויות ביום הנבחר. נסו תאריך אחר.",
    paymentTitle: "תשלום מאובטח",
    paymentDesc: "אנא הזינו את פרטי התשלום בשדה המאובטח. הנתונים אינם נשמרים באתר.",
    cardNumber: "מספר כרטיס",
    expiry: "תוקף (MM/YY)",
    cvc: "CVV",
    hostedField: "שדה תשלום מאובטח (החליפו בספק התשלומים שלכם)",
    next: "הבא",
    back: "חזרה",
    pay: "שלם וסיים",
    success: "ההזמנה התקבלה! ניצור קשר לאישור סופי.",
    error: "אירעה תקלה, נסו שוב.",
    validations: {
      contact: "אנא מלאו שם וטלפון.",
      schedule: "בחרו טיפול, תאריך ושעה פנויה.",
      payment: "מלאו את כל פרטי התשלום.",
    },
  },
  en: {
    heading: "Book Your Experience",
    subtitle: "Three simple steps to lock your spot.",
    stepLabels: ["Contact", "Schedule", "Payment"],
    contactTitle: "Who should we book for?",
    nameLabel: "Full name",
    phoneLabel: "Phone number",
    contactHint: "We only use this info to confirm your booking.",
    calendarTitle: "Choose a date & time",
    serviceLabel: "Select treatment",
    dateLabel: "Date",
    slotsLabel: "Available times",
    noSlots: "No slots available for that day. Try another date.",
    paymentTitle: "Secure payment",
    paymentDesc: "Enter payment details inside the hosted field. Replace this block with your PSP integration.",
    cardNumber: "Card number",
    expiry: "Expiry (MM/YY)",
    cvc: "CVV",
    hostedField: "Hosted payment field placeholder",
    next: "Next",
    back: "Back",
    pay: "Pay & finish",
    success: "Booking received! We’ll confirm shortly.",
    error: "Something went wrong. Please try again.",
    validations: {
      contact: "Name and phone are required.",
      schedule: "Pick a treatment, date, and open slot.",
      payment: "Please fill out every payment field.",
    },
  },
};

const sectionMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const buildDateWindow = (locale) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 14 }).map((_, index) => {
    const current = new Date(start);
    current.setDate(current.getDate() + index);
    return {
      iso: current.toISOString().slice(0, 10),
      weekday: current.toLocaleDateString(locale === "he" ? "he-IL" : "en-US", { weekday: "short" }),
      label: current.toLocaleDateString(locale === "he" ? "he-IL" : "en-US", { month: "short", day: "numeric" }),
    };
  });
};
const formatDateForDisplay = (iso, locale) => {
  const dateObj = new Date(iso);
  return dateObj.toLocaleDateString(locale === "he" ? "he-IL" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

export default function BookingPage() {
  const { locale } = useLocale();
  const copy = COPY[locale];
  const isHebrew = locale === "he";

  const [step, setStep] = useState(1);
  const [contact, setContact] = useState({ customerName: "", phone: "" });

  const [services, setServices] = useState([]);
  const [servicesError, setServicesError] = useState("");
  const [servicesLoading, setServicesLoading] = useState(true);

  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reservedSlots, setReservedSlots] = useState([]);

  const [payment, setPayment] = useState({ cardNumber: "", expiry: "", cvc: "" });
  const [submitState, setSubmitState] = useState({ status: "idle", message: "" });
  const [formError, setFormError] = useState("");

  const fallbackTreatments = useMemo(
    () =>
      getTreatmentsForLocale(locale).map((treatment) => ({
        _id: `demo-${treatment.id}`,
        title: treatment.title,
        durationMin: treatment.durationMin,
        isFallback: true,
      })),
    [locale]
  );

  useEffect(() => {
    let alive = true;
    setServicesLoading(true);
    api
      .listServices()
      .then((data) => {
        if (!alive) return;
        setServices(data);
        if (data.length) {
          setServiceId((prev) => {
            if (!prev) return String(data[0]._id);
            return /^[a-f\d]{24}$/i.test(prev) ? prev : String(data[0]._id);
          });
        }
      })
      .catch(() => {
        if (!alive) return;
        setServicesError(copy.error);
      })
      .finally(() => {
        if (alive) setServicesLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [copy.error]);

  useEffect(() => {
    if (services.length || !fallbackTreatments.length || serviceId) return;
    setServiceId(fallbackTreatments[0]._id);
  }, [services.length, fallbackTreatments, serviceId]);

  const serviceOptions = useMemo(
    () => (services.length ? services : fallbackTreatments),
    [services, fallbackTreatments]
  );
  const selectedService = useMemo(
    () => serviceOptions.find((s) => String(s._id) === String(serviceId)),
    [serviceOptions, serviceId]
  );
  const serviceIdIsMongoId = /^[a-f\d]{24}$/i.test(String(serviceId));
  useEffect(() => {
    if (!serviceId || !date) return;
    if (!serviceIdIsMongoId) {
      setSlotsLoading(false);
      setSlotsError("");
      setSlots([]);
      setReservedSlots([]);
      setSelectedSlot(null);
      return;
    }
    let alive = true;
    setSlotsLoading(true);
    setSlotsError("");
    api
      .getAvailability(serviceId, date)
      .then((data) => {
        if (!alive) return;
        setSlots(data?.slots || []);
        setReservedSlots(data?.reserved || []);
        setSelectedSlot(null);
      })
      .catch(() => {
        if (!alive) return;
        setSlotsError(copy.error);
        setSlots([]);
        setReservedSlots([]);
      })
      .finally(() => {
        if (alive) setSlotsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [serviceId, date, copy.error, serviceIdIsMongoId]);
  const dateOptions = useMemo(() => buildDateWindow(locale), [locale]);

  useEffect(() => {
    if (!dateOptions.length) return;
    if (!dateOptions.some((option) => option.iso === date)) {
      setDate(dateOptions[0].iso);
    }
  }, [dateOptions, date]);

  const handleNext = () => {
    setFormError("");
    setSubmitState({ status: "idle", message: "" });
    if (step === 1) {
      if (!contact.customerName.trim() || !contact.phone.trim()) {
        setFormError(copy.validations.contact);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedService || !selectedSlot || !date) {
        setFormError(copy.validations.schedule);
        return;
      }
      setStep(3);
    }
  };

  const handlePay = async (event) => {
    event.preventDefault();
    if (!payment.cardNumber.trim() || !payment.expiry.trim() || !payment.cvc.trim()) {
      setFormError(copy.validations.payment);
      return;
    }
    try {
      setSubmitState({ status: "loading", message: "" });
      await api.createBooking({
        serviceId: selectedService._id,
        customerName: contact.customerName.trim(),
        phone: contact.phone.trim(),
        startUtc: selectedSlot.startUtc,
        note: `Payment placeholder • card ending ${payment.cardNumber.slice(-4)}`,
      });
      setSubmitState({ status: "success", message: copy.success });
    } catch (err) {
      setSubmitState({ status: "error", message: err?.payload?.error || copy.error });
    }
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">{copy.contactTitle}</h2>
          <p className="text-sm text-white/70">{copy.contactHint}</p>
          <label className="block text-sm">
            {copy.nameLabel}
            <input
              type="text"
              value={contact.customerName}
              onChange={(e) => setContact((prev) => ({ ...prev, customerName: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white placeholder-white/40"
              placeholder="John Doe"
            />
          </label>
          <label className="block text-sm">
            {copy.phoneLabel}
            <input
              type="tel"
              value={contact.phone}
              onChange={(e) => setContact((prev) => ({ ...prev, phone: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white placeholder-white/40"
              placeholder="+972 50-000-0000"
            />
          </label>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">{copy.calendarTitle}</h2>
          {servicesLoading ? (
            <p className="text-sm text-white/70">Loading…</p>
          ) : (
            <>
              {servicesError ? <p className="text-sm text-red-400">{servicesError}</p> : null}
              <label className="block text-sm">
                {copy.serviceLabel}
                <select
                  className="mt-1 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                >
                  {serviceOptions.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.title}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <p className="text-sm">{copy.dateLabel}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {dateOptions.map((option) => {
                    const isSelected = option.iso === date;
                    return (
                      <button
                        type="button"
                        key={option.iso}
                        onClick={() => setDate(option.iso)}
                        className={`rounded-xl border px-3 py-3 text-left ${
                          isSelected
                            ? "border-white bg-white text-black"
                            : "border-white/20 bg-white/5 text-white hover:border-white/60"
                        }`}
                      >
                        <span className="block text-xs uppercase tracking-[0.3em] text-white/60">
                          {option.weekday}
                        </span>
                        <span className="text-lg font-semibold">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm">{copy.slotsLabel}</p>
                {slotsLoading ? (
                  <p className="mt-2 text-sm text-white/70">Loading…</p>
                ) : slotsError ? (
                  <p className="mt-2 text-sm text-red-400">{slotsError}</p>
                ) : slots.length === 0 ? (
                  <p className="mt-2 text-sm text-white/70">{copy.noSlots}</p>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
                    {slots.map((slot) => (
                      <button
                        type="button"
                        key={slot.startUtc}
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-lg border px-3 py-2 text-sm ${
                          selectedSlot?.startUtc === slot.startUtc
                            ? "border-white bg-white text-black"
                            : "border-white/20 bg-white/5 text-white hover:border-white/60"
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                )}
                {selectedSlot ? (
                  <div className="mt-4 rounded-2xl border border-emerald-200/40 bg-emerald-500/10 px-4 py-3 text-sm text-white">
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                      {locale === "he" ? "בחירה" : "Selected slot"}
                    </p>
                    <p className="mt-1 font-semibold">
                      {formatDateForDisplay(date, locale)} · {selectedSlot.label}
                    </p>
                  </div>
                ) : null}
                {reservedSlots.length ? (
                  <div className="mt-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                      {locale === "he" ? "תורים תפוסים" : "Reserved slots"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {reservedSlots.map((slot) => (
                        <span
                          key={slot.startUtc}
                          className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70"
                        >
                          {slot.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      );
    }

    return (
      <form className="space-y-6" onSubmit={handlePay}>
        <h2 className="text-2xl font-semibold text-white">{copy.paymentTitle}</h2>
        <p className="text-sm text-white/70">{copy.paymentDesc}</p>

        <div className="rounded-2xl border border-emerald-200/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          {copy.hostedField}
        </div>

        <label className="block text-sm">
          {copy.cardNumber}
          <input
            type="text"
            value={payment.cardNumber}
            onChange={(e) => setPayment((prev) => ({ ...prev, cardNumber: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white placeholder-white/40"
            placeholder="4242 4242 4242 4242"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            {copy.expiry}
            <input
              type="text"
              value={payment.expiry}
              onChange={(e) => setPayment((prev) => ({ ...prev, expiry: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white placeholder-white/40"
              placeholder="06/27"
            />
          </label>

          <label className="block text-sm">
            {copy.cvc}
            <input
              type="text"
              value={payment.cvc}
              onChange={(e) => setPayment((prev) => ({ ...prev, cvc: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white placeholder-white/40"
              placeholder="123"
            />
          </label>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-white px-4 py-2 text-black transition hover:bg-white/80 disabled:cursor-not-allowed disabled:bg-white/50"
          disabled={submitState.status === "loading"}
        >
          {submitState.status === "loading" ? "…" : copy.pay}
        </button>
      </form>
    );
  };

  const stepIndicator = (
    <div className="flex gap-3 text-xs uppercase tracking-[0.3em] text-white/40" dir={isHebrew ? "rtl" : "ltr"}>
      {copy.stepLabels.map((label, index) => {
        const current = index + 1;
        const active = step === current;
        const done = step > current;
        return (
          <div
            key={label}
            className={`flex items-center gap-2 ${active ? "text-white" : done ? "text-white/70" : ""}`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                active ? "border-white bg-white text-black" : done ? "border-white/50" : "border-white/20"
              }`}
            >
              {current}
            </span>
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <motion.section
      {...sectionMotion}
      className="min-h-[100dvh] bg-gradient-to-b from-black via-black to-[#050505] px-6 py-20 text-white"
      dir={isHebrew ? "rtl" : "ltr"}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">{copy.subtitle}</p>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl">{copy.heading}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            {stepIndicator}
            <NavLink to="/" className="text-xs text-white/60 hover:text-white">
              ← {locale === "he" ? "חזרה לאתר" : "Back to site"}
            </NavLink>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40">
          {renderStep()}
          <div className="mt-8 flex flex-wrap justify-between gap-4">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                className="rounded-full border border-white/20 px-6 py-2 text-sm text-white hover:border-white/60"
              >
                {copy.back}
              </button>
            )}
            {step < 3 && (
              <button
                type="button"
                onClick={handleNext}
                className="ml-auto rounded-full bg-white px-6 py-2 text-sm font-semibold text-black hover:bg-white/80"
              >
                {copy.next}
              </button>
            )}
          </div>
          {formError ? <p className="mt-4 text-sm text-red-400">{formError}</p> : null}
          {submitState.message ? (
            <p
              className={`mt-4 text-sm ${
                submitState.status === "success" ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {submitState.message}
            </p>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
}
