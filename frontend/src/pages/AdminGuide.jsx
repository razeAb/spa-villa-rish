import { Link } from "react-router-dom";

const guideContent = [
  {
    id: "console",
    titleEn: "Admin Console",
    titleHe: "קונסולת אדמין",
    path: "/admin",
    bullets: [
      {
        en: "Sign in with credentials from backend/.env. Use the language toggle in the header.",
        he: "התחבר עם פרטי האדמין שבקובץ backend/.env. ניתן להחליף שפה בראש הדף.",
      },
      {
        en: "Bookings table: shows customer, service, time, payment, and status. Change status from the dropdown; it saves immediately.",
        he: "טבלת הזמנות: מציגה לקוח, שירות, זמן, תשלום וסטטוס. שינוי סטטוס נשמר מיד מהתפריט.",
      },
      {
        en: "Availability & Hours: adjust slot length, buffer, and weekly opening hours. Save to apply; refresh to reload.",
        he: "זמינות ושעות: שינוי משך משבצת, מרווח ושעות פתיחה שבועיות. שמרו כדי ליישם; רעננו לטעינה מחדש.",
      },
    ],
  },
  {
    id: "calendar",
    titleEn: "Admin Calendar",
    titleHe: "לוח אדמין",
    path: "/admin/calendar",
    bullets: [
      {
        en: "Month view of bookings. Language toggle and quick links to Services/Console in the header.",
        he: "תצוגת חודש להזמנות. מעבר שפה וקישורים מהירים לשירותים/קונסולה בראש.",
      },
      {
        en: "Click a day to view/edit bookings. Delete bookings or edit notes and save.",
        he: "לחיצה על יום מציגה ומאפשרת עריכת הזמנות. אפשר למחוק או לערוך הערות ולשמור.",
      },
      {
        en: "Add appointment panel creates manual bookings (no payment). Fill service, name, phone, and time, then submit.",
        he: "פאנל הוספת תור יוצר הזמנה ידנית (ללא תשלום). מלאו שירות, שם, טלפון ושעה ושלחו.",
      },
    ],
  },
  {
    id: "services",
    titleEn: "Admin Services",
    titleHe: "ניהול שירותים",
    path: "/admin/services",
    bullets: [
      {
        en: "Edit service titles, durations, prices inline; Save to apply. Deactivate hides a service from bookings.",
        he: "עריכת כותרות, משכים ומחירים בשורה; לחצו שמור כדי ליישם. השבתה מסתירה שירות מהזמנות.",
      },
      {
        en: "Add service: create new service with title, duration, price, and optional display/description.",
        he: "הוספת שירות: יצירת שירות חדש עם כותרת, משך, מחיר ותצוגה/תיאור אופציונליים.",
      },
      {
        en: "Use Refresh to reload data from the server after changes.",
        he: "השתמשו ברענון כדי לטעון נתונים מהשרת אחרי שינויים.",
      },
    ],
  },
];

export default function AdminGuide() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black/70 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-xl font-semibold">Admin Guide / מדריך אדמין</h1>
          <div className="flex items-center gap-3 text-sm text-white/70">
            <Link to="/admin" className="rounded-lg border border-white/15 px-3 py-1 hover:bg-white/10">
              Admin
            </Link>
            <Link to="/admin/calendar" className="rounded-lg border border-white/15 px-3 py-1 hover:bg-white/10">
              Calendar
            </Link>
            <Link to="/admin/services" className="rounded-lg border border-white/15 px-3 py-1 hover:bg-white/10">
              Services
            </Link>
            <Link to="/" className="rounded-lg border border-white/15 px-3 py-1 hover:bg-white/10">
              ← Back to site
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl px-6 py-10 space-y-8">
        {guideContent.map((section) => (
          <div key={section.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-white/60">{section.titleEn}</p>
                <p className="text-lg font-semibold text-white">{section.titleHe}</p>
              </div>
              <Link to={section.path} className="rounded-lg border border-white/20 px-3 py-1 text-sm text-white/80 hover:bg-white/10">
                {section.titleEn}
              </Link>
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/80">
              {section.bullets.map((b, idx) => (
                <li key={idx}>
                  {b.he} <span className="text-white/50">/</span> {b.en}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </main>
    </div>
  );
}
