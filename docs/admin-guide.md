# Admin Pages Quick Guide · מדריך אדמין

## Admin Console (`/admin`) · קונסולת אדמין
- Sign in with the admin credentials from `backend/.env`. Toggle Hebrew/English via the header button.  
  התחבר עם פרטי האדמין בקובץ `backend/.env`. אפשר לעבור בין עברית/אנגלית בראש הדף.
- Bookings table shows customer info, service, time, payment, and status. Change status from the dropdown; it saves immediately.  
  טבלת ההזמנות מציגה לקוח, שירות, זמן, תשלום וסטטוס. ניתן לשנות סטטוס מהתפריט והוא נשמר מיד.
- Availability & Hours lets you adjust slot length, buffer, and weekly opening hours. Save to apply; use refresh in the header to reload data.  
  זמינות ושעות: שינוי משך משבצת, מרווח ושעות פתיחה שבועיות. שמרו כדי ליישם; רעננו מהכפתור בראש.

## Admin Calendar (`/admin/calendar`) · לוח אדמין
- Visual month view of bookings. Toggle language in the header; navigation links jump to Services or Console.  
  תצוגה חודשית של ההזמנות. מעבר שפה בראש וקישורי ניווט לשירותים או קונסולה.
- Click a day to view/edit bookings. You can delete bookings or edit notes, then save.  
  לחיצה על יום מציגה/מאפשרת עריכת הזמנות. אפשר למחוק או לערוך הערות ולשמור.
- Add appointment panel creates manual bookings (no payment). Fill required fields (service, name, phone, time) and submit.  
  פאנל הוספת תור יוצר הזמנה ידנית ללא תשלום. מלאו שירות, שם, טלפון ושעה ושלחו.
- Use month controls and refresh button to reload data. Logout is in the header.  
  שלטו בחודשים ורעננו נתונים מהכפתור. התנתקות זמינה בראש הדף.

## Admin Services (`/admin/services`) · ניהול שירותים
- Manage service titles, durations, and prices. Toggle language in the header; navigation links jump to Calendar or Console.  
  ניהול כותרות, משכים ומחירים. מעבר שפה בראש וקישורי ניווט ללוח או לקונסולה.
- Active services list: edit fields inline and click Save; Deactivate hides a service from bookings.  
  רשימת שירותים פעילים: ערכו בשורה ולחצו "שמור"; "השבת" מסתיר מהזמנות.
- Add service: create a new service with title, duration, price, and optional display/description.  
  הוספת שירות חדש: כותרת, משך, מחיר ותצוגת מחיר/תיאור אופציונליים.
- Use Refresh to reload from the server after changes.  
  השתמשו ב"רענון" לטעינת נתונים עדכנית מהשרת.
