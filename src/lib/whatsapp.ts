export interface WhatsAppOrderItem {
  title: string;
  color?: string;
  quantity: number;
  price: number;
}

export interface WhatsAppOrderDetails {
  items: WhatsAppOrderItem[];
  customerName?: string;
  customerPhone?: string;
  city?: string;
}

/**
 * Builds a pre-filled click-to-chat WhatsApp link with formatted order summary.
 */
export function generateWhatsAppOrderUrl(details: WhatsAppOrderDetails): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "917388553867";
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "RA Universal";

  const totalAmount = details.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  let message = `Namaste ${brandName},\nI would like to place an order from your website catalogue:\n\n`;

  details.items.forEach((item, index) => {
    const colorPart = item.color ? ` (${item.color})` : "";
    const itemTotal = item.price * item.quantity;
    message += `${index + 1}. ${item.title}${colorPart} x ${item.quantity} - ₹${itemTotal}\n`;
  });

  message += `\n*Total Estimated Amount:* ₹${totalAmount}\n`;

  if (details.customerName || details.customerPhone || details.city) {
    message += `\n*Customer Details:*`;
    if (details.customerName) message += `\nName: ${details.customerName}`;
    if (details.customerPhone) message += `\nPhone: ${details.customerPhone}`;
    if (details.city) message += `\nCity: ${details.city}`;
  }

  message += `\n\nPlease confirm product availability, dispatch time, and payment options. Thank you!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds a direct general enquiry link for WhatsApp.
 */
export function generateWhatsAppEnquiryUrl(subject: string): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "917388553867";
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "RA Universal";

  const message = `Namaste ${brandName},\nI have an enquiry regarding: ${subject}.\nPlease assist me.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
