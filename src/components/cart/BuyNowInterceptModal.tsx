"use client";

import React, { useState } from "react";
import { MessageCircle, AlertCircle, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { generateWhatsAppOrderUrl, type WhatsAppOrderItem } from "@/lib/whatsapp";
import { formatINR } from "@/lib/formatters";
import { toast } from "@/lib/store/useToastStore";

export interface BuyNowInterceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: WhatsAppOrderItem[];
}

export const BuyNowInterceptModal: React.FC<BuyNowInterceptModalProps> = ({
  isOpen,
  onClose,
  items,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleConfirmWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let recordedOrderNumber: string | undefined = undefined;

    try {
      // Record order in backend database / in-memory store
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim() || "Guest Customer",
          customerPhone: customerPhone.trim() || "9999999999",
          customerEmail: null,
          shippingAddress: address.trim() || "Direct WhatsApp Delivery",
          shippingCity: city.trim() || "Local Dispatch",
          shippingState: "India",
          shippingPincode: pincode.trim() || "000000",
          totalAmount,
          mrpTotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
          items: items.map((i) => ({
            productId: i.productId || "prod-direct",
            sku: i.sku,
            title: i.title,
            colorName: i.color,
            quantity: i.quantity,
            sellingPrice: i.price,
            mrp: i.price,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.orderNumber) {
          recordedOrderNumber = data.data.orderNumber;
        }
      }
    } catch {
      // Graceful fallback: continue to WhatsApp even if backend save was interrupted
    }

    const url = generateWhatsAppOrderUrl({
      orderNumber: recordedOrderNumber,
      items,
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      pincode: pincode.trim() || undefined,
    });

    toast.success(
      recordedOrderNumber
        ? `Order #${recordedOrderNumber} recorded! Opening WhatsApp...`
        : "Opening WhatsApp to confirm order..."
    );

    setIsSubmitting(false);
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Order Confirmation">
      <div className="space-y-4">
        {/* Notice Banner */}
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-[6px] text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-950">Direct Artisan Order via WhatsApp</p>
            <p className="mt-0.5 text-amber-800">
              Orders are confirmed directly with our weavers. Your order will be assigned a unique ID for Amazon-standard billing and parcel tracking.
            </p>
          </div>
        </div>

        {/* Order Summary Snapshot */}
        <div className="border border-neutral-200 rounded-[6px] p-3 bg-neutral-50/50">
          <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
            Selected Items ({items.reduce((s, i) => s + i.quantity, 0)})
          </h4>
          <div className="max-h-36 overflow-y-auto space-y-1.5 text-xs">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-neutral-800">
                <span className="truncate pr-2">
                  {item.sku ? <span className="font-mono text-neutral-500 mr-1">[{item.sku}]</span> : null}
                  {item.title} {item.color ? `(${item.color})` : ""} × {item.quantity}
                </span>
                <span className="font-semibold whitespace-nowrap">
                  {formatINR(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-neutral-200 mt-2.5 pt-2 flex justify-between items-center text-sm font-bold text-neutral-900">
            <span>Estimated Total:</span>
            <span>{formatINR(totalAmount)}</span>
          </div>
        </div>

        {/* Customer Delivery Info */}
        <form onSubmit={handleConfirmWhatsApp} className="space-y-3 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Your Name (Optional)"
              placeholder="e.g. Rahul Sharma"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <Input
              label="WhatsApp Phone (Optional)"
              placeholder="e.g. 9830123456"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          <Input
            label="Delivery Street Address (Optional)"
            placeholder="e.g. Flat 4B, Shantiniketan Enclave, Gariahat"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City (Optional)"
              placeholder="e.g. Kolkata"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Input
              label="Pincode (Optional)"
              placeholder="e.g. 700019"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="whatsapp"
              size="lg"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 shadow-sm font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Recording Order...</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5" />
                  <span>Confirm Order via WhatsApp</span>
                </>
              )}
            </Button>
          </div>
        </form>

        <p className="text-center text-[11px] text-neutral-500">
          Clicking opens your WhatsApp app or WhatsApp Web with the order and unique item IDs pre-filled.
        </p>
      </div>
    </Modal>
  );
};
