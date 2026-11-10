"use client";

import React, { useState } from "react";
import { MessageCircle, CheckCircle, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { generateWhatsAppOrderUrl, type WhatsAppOrderItem } from "@/lib/whatsapp";
import { formatINR } from "@/lib/formatters";

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
  const [city, setCity] = useState("");

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleConfirmWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();

    const url = generateWhatsAppOrderUrl({
      items,
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      city: city.trim() || undefined,
    });

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
            <p className="font-semibold text-amber-950">Automated Payments Coming Soon!</p>
            <p className="mt-0.5 text-amber-800">
              We are currently accepting direct orders via WhatsApp and phone support. Our weavers will verify stock and coordinate fast dispatch.
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

        {/* Optional Fast-Fill Customer Info */}
        <form onSubmit={handleConfirmWhatsApp} className="space-y-3 pt-1">
          <Input
            label="Your Name (Optional)"
            placeholder="e.g. Rahul Sharma"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="WhatsApp Phone (Optional)"
              placeholder="e.g. 9876543210"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
            <Input
              label="City / PIN (Optional)"
              placeholder="e.g. Kolkata, 700001"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="whatsapp"
              size="lg"
              className="w-full flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Confirm Order via WhatsApp</span>
            </Button>
          </div>
        </form>

        <p className="text-center text-[11px] text-neutral-500">
          Clicking opens your WhatsApp app or WhatsApp Web with the order pre-filled.
        </p>
      </div>
    </Modal>
  );
};
