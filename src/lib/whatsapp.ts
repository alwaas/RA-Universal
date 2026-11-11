export interface WhatsAppOrderItem {
  productId?: string;
  sku?: string;
  title: string;
  color?: string;
  quantity: number;
  price: number;
}

export interface WhatsAppOrderDetails {
  orderNumber?: string;
  items: WhatsAppOrderItem[];
  customerName?: string;
  customerPhone?: string;
  address?: string;
  city?: string;
  pincode?: string;
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

  let message = `Namaste ${brandName},\n`;
  if (details.orderNumber) {
    message += `*Order ID:* #${details.orderNumber}\n`;
  }
  message += `I would like to place an order from your website catalogue:\n\n`;

  details.items.forEach((item, index) => {
    const skuPart = item.sku ? ` [ID: ${item.sku}]` : "";
    const colorPart = item.color ? ` (${item.color})` : "";
    const itemTotal = item.price * item.quantity;
    message += `${index + 1}.${skuPart} ${item.title}${colorPart} x ${item.quantity} - ₹${itemTotal}\n`;
  });

  message += `\n*Total Estimated Amount:* ₹${totalAmount}\n`;

  if (details.customerName || details.customerPhone || details.city || details.address || details.pincode) {
    message += `\n*Customer Delivery Address:*`;
    if (details.customerName) message += `\nName: ${details.customerName}`;
    if (details.customerPhone) message += `\nPhone: ${details.customerPhone}`;
    if (details.address) message += `\nAddress: ${details.address}`;
    if (details.city) message += `\nCity: ${details.city}`;
    if (details.pincode) message += `\nPincode: ${details.pincode}`;
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
