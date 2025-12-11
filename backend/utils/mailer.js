const formatBooking = (booking, serviceTitle, lang = "he") => {
  if (lang === "he") {
    return `שלום ${booking.customerName}
  
  ההזמנה שלך לשירות "${serviceTitle}" התקבלה בהצלחה
  תודה שבחרת בנו
  
  פרטי הזמנה
  1 שם לקוח: ${booking.customerName}
  2 תאריך: ${booking.date}
  3 שעה: ${booking.time}
  
  מדיניות ביטולים
  ניתן לבטל הזמנה רק עד 3 ימים מראש`;
  }

  return `Hello ${booking.customerName}
  
  Your booking for "${serviceTitle}" has been received successfully
  Thank you for choosing us
  
  Booking Details
  1 Customer Name: ${booking.customerName}
  2 Date: ${booking.date}
  3 Time: ${booking.time}
  
  Cancellation Policy
  You can cancel your reservation only up to 3 days in advance`;
};
