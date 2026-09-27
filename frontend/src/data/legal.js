// Business details shown on the legal pages. Fill in the empty values — empty fields are
// left out of the pages rather than shown blank.
export const BUSINESS = {
  name: { he: "ספא ריש", en: "Spa Rish" },
  legalName: "", // שם העסק הרשום, e.g. "ישראל ישראלי" or "ספא ריש בע״מ"
  businessId: "025981044", // ע.מ / ח.פ
  address: { he: "אלחדיתה, ירכא, 2496700", en: "Al-Hadita, Yarka, 2496700" },
  phone: "050-629-0202",
  email: "Oladeen75@gmail.com", // contact email for privacy / accessibility requests
  accessibilityCoordinator: "Ola", // name of the accessibility coordinator (רכז/ת נגישות)
  lastUpdated: "2026-09-27",
};

// Cancellation window used across the site, the emails and these pages.
export const CANCELLATION_DAYS = 3;

// Each page: { title, intro, sections: [{ heading, paragraphs: [], list: [] }] }.
// Text is a starting point written for this site's actual behavior; have it reviewed by a lawyer.
export const LEGAL_PAGES = {
  terms: {
    he: {
      title: "תקנון ומדיניות ביטולים",
      intro:
        "ברוכים הבאים לאתר ספא ריש. השימוש באתר והזמנת טיפולים וחבילות דרכו כפופים לתנאים שלהלן. ביצוע הזמנה באתר מהווה הסכמה לתנאים אלה.",
      sections: [
        {
          heading: "הזמנת טיפולים",
          list: [
            "ההזמנה מתבצעת באתר: בחירת טיפול או חבילה, מועד פנוי, ותשלום מלא באמצעות כרטיס אשראי או ארנק דיגיטלי.",
            "ההזמנה מאושרת רק לאחר שהתשלום אושר על ידי חברת הסליקה. אישור הזמנה יוצג במסך ויישלח לכתובת האימייל שמסרתם.",
            "המתחם פרטי ומשמש קבוצה אחת בכל מועד. אם המועד שבחרתם נתפס בזמן התשלום, החיוב יבוטל אוטומטית והכסף יוחזר לכרטיס.",
            "הכניסה למתחם מגיל 18 ומעלה, אלא אם צוין אחרת בתיאור החבילה.",
          ],
        },
        {
          heading: "מחירים ותשלום",
          list: [
            "המחירים באתר נקובים בשקלים חדשים וכוללים מע״מ כחוק.",
            "התשלום מתבצע בדף תשלום מאובטח של חברת Hyp. פרטי כרטיס האשראי מוזנים ישירות אצל חברת הסליקה ואינם נשמרים אצלנו.",
            "תוספות לחבילה (אם נבחרו) מחויבות יחד עם ההזמנה.",
            "ייתכנו תוספות מחיר לסופי שבוע ולחגים, כמפורט בתיאור כל חבילה.",
          ],
        },
        {
          heading: "מדיניות ביטולים ושינויים",
          list: [
            `ביטול הזמנה עד ${CANCELLATION_DAYS} ימים לפני מועד הטיפול – החזר כספי מלא לכרטיס שבו בוצע התשלום.`,
            `ביטול בפחות מ־${CANCELLATION_DAYS} ימים לפני מועד הטיפול, או אי-הגעה – לא יינתן החזר כספי, אלא אם נקבע אחרת בדין.`,
            "לביטול או לשינוי מועד יש לפנות אלינו בוואטסאפ או בטלפון. שינוי מועד כפוף לזמינות.",
            "ההחזר יבוצע לאותו אמצעי תשלום. זמן הופעת הזיכוי בחשבון תלוי בחברת האשראי.",
            "אין באמור כדי לגרוע מזכויות הצרכן לפי חוק הגנת הצרכן, התשמ״א–1981, והתקנות מכוחו.",
          ],
        },
        {
          heading: "ביטול מצד העסק",
          paragraphs: [
            "במקרים חריגים (כגון תקלה במתחם או נסיבות שאינן בשליטתנו) אנו רשאים לבטל הזמנה. במקרה כזה נציע מועד חלופי או החזר כספי מלא.",
          ],
        },
        {
          heading: "הגעה ושימוש במתחם",
          list: [
            "יש להגיע בזמן. איחור עלול לקצר את משך הטיפול, שכן המועד הבא עשוי להיות תפוס.",
            "יש לעדכן אותנו מראש על מצב רפואי, הריון או רגישויות שעשויים להשפיע על הטיפול.",
            "השימוש במתקני המתחם (סאונה, ג׳קוזי, חמאם) הוא באחריות המשתמשים ובהתאם להוראות הצוות.",
          ],
        },
        {
          heading: "כללי",
          list: [
            "אנו רשאים לעדכן תקנון זה מעת לעת. ההזמנה כפופה לתקנון שהיה בתוקף במועד ביצועה.",
            "על תקנון זה יחולו דיני מדינת ישראל.",
          ],
        },
      ],
    },
    en: {
      title: "Terms & Cancellation Policy",
      intro:
        "Welcome to the Spa Rish website. Using this site and booking treatments or packages through it is subject to the terms below. Placing a booking means you accept these terms.",
      sections: [
        {
          heading: "Bookings",
          list: [
            "You book on this site by choosing a treatment or package, an available time, and paying in full by credit card or digital wallet.",
            "A booking is confirmed only once the payment has been approved. The confirmation is shown on screen and sent to the email address you provide.",
            "The spa is private and used by one group at a time. If the time you chose is taken while you are paying, the charge is cancelled automatically and refunded to your card.",
            "Entry is for ages 18 and over unless the package description says otherwise.",
          ],
        },
        {
          heading: "Prices and payment",
          list: [
            "Prices are in Israeli shekels (ILS) and include VAT.",
            "Payment is taken on a secure payment page run by Hyp. Card details are entered directly with the payment provider and are not stored by us.",
            "Add-ons you select are charged together with the booking.",
            "Weekend and holiday surcharges may apply, as stated in each package description.",
          ],
        },
        {
          heading: "Cancellations and changes",
          list: [
            `Cancel up to ${CANCELLATION_DAYS} days before your appointment for a full refund to the card you paid with.`,
            `Cancellations less than ${CANCELLATION_DAYS} days before the appointment, and no-shows, are not refunded unless the law requires otherwise.`,
            "To cancel or reschedule, contact us on WhatsApp or by phone. Rescheduling depends on availability.",
            "Refunds go to the original payment method. How long the credit takes to appear depends on your card issuer.",
            "Nothing here limits your rights under the Israeli Consumer Protection Law, 1981, and its regulations.",
          ],
        },
        {
          heading: "Cancellation by us",
          paragraphs: [
            "In exceptional cases (such as a fault at the spa or circumstances beyond our control) we may cancel a booking. If so, we will offer another date or a full refund.",
          ],
        },
        {
          heading: "Arrival and use of the spa",
          list: [
            "Please arrive on time. Late arrival may shorten your session, as the next slot may be booked.",
            "Tell us in advance about any medical condition, pregnancy or sensitivity that may affect your treatment.",
            "Use of the facilities (sauna, jacuzzi, hammam) is at your own responsibility and according to staff instructions.",
          ],
        },
        {
          heading: "General",
          list: [
            "We may update these terms from time to time. A booking is governed by the terms in force when it was made.",
            "These terms are governed by the laws of the State of Israel.",
          ],
        },
      ],
    },
  },

  privacy: {
    he: {
      title: "מדיניות פרטיות",
      intro:
        "אנו מכבדים את פרטיותכם. מדיניות זו מסבירה אילו פרטים אנו אוספים באתר, לשם מה, ועם מי הם משותפים, בהתאם לחוק הגנת הפרטיות, התשמ״א–1981.",
      sections: [
        {
          heading: "אילו פרטים אנו אוספים",
          list: [
            "פרטי קשר שאתם מוסרים בהזמנה: שם מלא, טלפון ואימייל.",
            "פרטי ההזמנה: הטיפול או החבילה, התוספות, המועד והסכום ששולם.",
            "פרטי תשלום חלקיים בלבד: ארבע הספרות האחרונות של הכרטיס, תוקף הכרטיס ומספר אישור העסקה. מספר הכרטיס המלא ו-CVV אינם מגיעים אלינו ואינם נשמרים אצלנו.",
            "העדפת הסכמה לקבלת עדכונים ודיוור, אם סימנתם זאת.",
          ],
        },
        {
          heading: "למה אנו משתמשים בפרטים",
          list: [
            "לניהול ההזמנה, אישורה ותיאום ההגעה.",
            "לשליחת אישור הזמנה, תזכורות ועדכונים הנוגעים להזמנה.",
            "לטיפול בביטולים, החזרים ופניות.",
            "לשליחת עדכונים והטבות – רק אם הסכמתם לכך. ניתן לבטל את ההסכמה בכל עת.",
            "לעמידה בחובות על פי דין, כגון הנהלת חשבונות.",
          ],
        },
        {
          heading: "עם מי הפרטים משותפים",
          paragraphs: ["איננו מוכרים את פרטיכם. אנו משתפים אותם רק עם ספקים הנחוצים להפעלת השירות:"],
          list: [
            "Hyp – חברת סליקת האשראי המעבדת את התשלום (ומפיקה קבלות, אם הופעל).",
            "ספק שירותי הדואר האלקטרוני שדרכו נשלחים אישורי ההזמנה.",
            "ספקי אחסון האתר ומסד הנתונים שבהם נשמרות ההזמנות.",
            "רשויות, כאשר הדבר נדרש על פי דין.",
          ],
        },
        {
          heading: "עוגיות ואחסון בדפדפן",
          paragraphs: [
            "האתר שומר בדפדפן העדפות בסיסיות (כגון שפת התצוגה). האתר טוען גופנים משירות Google Fonts, ולכן כתובת ה-IP שלכם נחשפת לשירות זה. איננו משתמשים בעוגיות פרסום.",
          ],
        },
        {
          heading: "אבטחת מידע ושמירה",
          list: [
            "התקשורת עם האתר מוצפנת (HTTPS). התשלום מתבצע אצל חברת סליקה העומדת בתקן PCI DSS.",
            "פרטי ההזמנות נשמרים כל עוד הם נחוצים לניהול השירות ולעמידה בחובות על פי דין.",
          ],
        },
        {
          heading: "הזכויות שלכם",
          paragraphs: [
            "אתם רשאים לעיין במידע שנשמר עליכם, לבקש לתקנו או למחוק אותו, ולבקש להסיר אתכם מרשימת הדיוור. לפניות – צרו קשר בפרטים שבתחתית העמוד.",
          ],
        },
      ],
    },
    en: {
      title: "Privacy Policy",
      intro:
        "We respect your privacy. This policy explains what information we collect on this site, why, and who it is shared with, in line with the Israeli Protection of Privacy Law, 1981.",
      sections: [
        {
          heading: "What we collect",
          list: [
            "Contact details you give when booking: full name, phone and email.",
            "Booking details: the treatment or package, add-ons, time and amount paid.",
            "Limited payment details only: the last four card digits, card expiry and the approval number. The full card number and CVV never reach us and are not stored by us.",
            "Whether you agreed to receive updates and offers.",
          ],
        },
        {
          heading: "How we use it",
          list: [
            "To manage and confirm your booking and arrange your visit.",
            "To send your booking confirmation, reminders and updates about your booking.",
            "To handle cancellations, refunds and enquiries.",
            "To send updates and offers — only if you agreed. You can opt out at any time.",
            "To meet legal obligations such as bookkeeping.",
          ],
        },
        {
          heading: "Who we share it with",
          paragraphs: ["We never sell your information. We share it only with providers needed to run the service:"],
          list: [
            "Hyp — the card payment provider that processes your payment (and issues receipts, if enabled).",
            "The email provider used to send booking confirmations.",
            "The website hosting and database providers where bookings are stored.",
            "Authorities, where required by law.",
          ],
        },
        {
          heading: "Cookies and browser storage",
          paragraphs: [
            "The site stores basic preferences in your browser (such as display language). It loads fonts from Google Fonts, so your IP address is visible to that service. We do not use advertising cookies.",
          ],
        },
        {
          heading: "Security and retention",
          list: [
            "Traffic to the site is encrypted (HTTPS). Payments are handled by a PCI DSS–compliant payment provider.",
            "Booking records are kept for as long as needed to provide the service and meet legal obligations.",
          ],
        },
        {
          heading: "Your rights",
          paragraphs: [
            "You may ask to see the information we hold about you, to correct or delete it, or to be removed from our mailing list. Contact us using the details at the bottom of this page.",
          ],
        },
      ],
    },
  },

  accessibility: {
    he: {
      title: "הצהרת נגישות",
      intro:
        "אנו רואים חשיבות רבה במתן שירות שוויוני לכלל הלקוחות, כולל אנשים עם מוגבלות, ופועלים להנגשת האתר בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע״ג–2013, ולתקן הישראלי 5568 המבוסס על הנחיות WCAG 2.0 ברמה AA.",
      sections: [
        {
          heading: "מה עשינו באתר",
          list: [
            "האתר מותאם לתצוגה במחשב, בטאבלט ובטלפון נייד.",
            "תמיכה מלאה בעברית (מימין לשמאל) ובאנגלית.",
            "אפשרות ניווט באמצעות מקלדת בחלקים המרכזיים של האתר, ובהם תהליך ההזמנה.",
            "טקסט חלופי לתמונות באתר.",
          ],
        },
        {
          heading: "מגבלות ידועות",
          list: [
            "ייתכן שחלק מהתכנים, בהם גלריית התמונות וסרטוני הווידאו, אינם נגישים במלואם, וחלק מהטקסטים המשניים מוצגים בניגודיות נמוכה.",
            "טופס התשלום מופעל על ידי חברת הסליקה Hyp ומוצג בתוך האתר. הנגשתו באחריות חברת הסליקה.",
            "אנו ממשיכים לשפר את נגישות האתר. אם נתקלתם בקושי, נשמח שתעדכנו אותנו.",
          ],
        },
        {
          heading: "נגישות המתחם",
          paragraphs: [
            "לפרטים על הסדרי הנגישות במתחם הספא ולתיאום התאמות לפני הגעה, צרו איתנו קשר ונשמח לסייע.",
          ],
        },
        {
          heading: "פניות בנושא נגישות",
          paragraphs: [
            "נתקלתם בבעיית נגישות באתר או במתחם? פנו אלינו בפרטים שבתחתית העמוד. נשיב לפנייתכם בהקדם ונפעל לתקן את הבעיה.",
          ],
        },
      ],
    },
    en: {
      title: "Accessibility Statement",
      intro:
        "We believe everyone, including people with disabilities, should get equal service. We work to make this site accessible in line with the Israeli Equal Rights for Persons with Disabilities (Service Accessibility Adjustments) Regulations, 2013, and Israeli Standard 5568, based on WCAG 2.0 level AA.",
      sections: [
        {
          heading: "What we have done",
          list: [
            "The site adapts to desktop, tablet and mobile screens.",
            "Full support for Hebrew (right-to-left) and English.",
            "Keyboard navigation in the main parts of the site, including the booking process.",
            "Alternative text for images on the site.",
          ],
        },
        {
          heading: "Known limitations",
          list: [
            "Some content, including the photo gallery and videos, may not be fully accessible, and some secondary text has low contrast.",
            "The payment form is provided by the payment company Hyp and shown within the site. Its accessibility is the payment company's responsibility.",
            "We keep improving the site's accessibility. If you run into a problem, please let us know.",
          ],
        },
        {
          heading: "Accessibility at the spa",
          paragraphs: [
            "For details on accessibility arrangements at the spa, or to arrange adjustments before your visit, please contact us — we are happy to help.",
          ],
        },
        {
          heading: "Accessibility requests",
          paragraphs: [
            "Found an accessibility problem on the site or at the spa? Contact us using the details at the bottom of this page. We will respond as soon as possible and work to fix it.",
          ],
        },
      ],
    },
  },
};
