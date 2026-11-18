"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  CheckCircle2,
  Tag,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Phone,
  Mail,
  User,
  Clock,
  Printer,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatINR } from "@/lib/formatters";
import { Button } from "@/components/ui/Button";
import { toast } from "@/lib/store/useToastStore";
import type { UserAddress, Coupon, Order } from "@/types";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    clearCart,
    getTotalCount,
    getTotalMrp,
    getTotalSellingPrice,
    getTotalSavings,
  } = useCartStore();

  const totalCount = getTotalCount();
  const totalMrp = getTotalMrp();
  const rawSellingPrice = getTotalSellingPrice();
  const totalSavings = getTotalSavings();

  // Step Management: 1 = Address, 2 = Order Review & Coupon, 3 = Payment Method, 4 = Success
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Address State
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    email: "",
    street: "",
    landmark: "",
    city: "",
    state: "Uttar Pradesh",
    pincode: "",
  });

  // Coupon State
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);

  // Payment Method: "razorpay" | "cod"
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Delivery Calculation
  const deliveryFee = rawSellingPrice >= 499 || appliedCoupon?.code === "FIRSTFREE" ? 0 : 50;
  const finalPayable = Math.max(0, rawSellingPrice - couponDiscount + deliveryFee);

  // Load Saved Addresses & Available Coupons
  useEffect(() => {
    // 1. Fetch saved addresses if logged in
    fetch("/api/account/addresses")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setSavedAddresses(json.data);
          const defaultAddr = json.data.find((a: UserAddress) => a.isDefault) || json.data[0];
          setSelectedAddressId(defaultAddr.id);
          setAddressForm({
            name: defaultAddr.fullName,
            phone: defaultAddr.phone,
            email: "",
            street: defaultAddr.streetAddress,
            landmark: defaultAddr.landmark || "",
            city: defaultAddr.city,
            state: defaultAddr.state,
            pincode: defaultAddr.pincode,
          });
        }
      })
      .catch(() => {});

    // 2. Fetch active promo coupons
    fetch("/api/coupons")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setAvailableCoupons(json.data);
        }
      })
      .catch(() => {});

    // 3. Dynamically inject Razorpay Checkout JS script
    if (typeof window !== "undefined" && !document.getElementById("razorpay-checkout-js")) {
      const script = document.createElement("script");
      script.id = "razorpay-checkout-js";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleSelectSavedAddress = (addr: UserAddress) => {
    setSelectedAddressId(addr.id);
    setAddressForm({
      name: addr.name,
      phone: addr.phone,
      email: addressForm.email,
      street: addr.street,
      landmark: addr.landmark || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
  };

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      toast.warning("Please enter a valid coupon code");
      return;
    }

    try {
      setIsValidatingCoupon(true);
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, cartTotal: rawSellingPrice }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.data?.valid) {
        setAppliedCoupon(data.data.coupon);
        setCouponDiscount(data.data.discount);
        toast.success(`Coupon "${code}" applied! Saved ₹${data.data.discount}`);
        setCouponInput("");
      } else {
        toast.error(data.error?.message || data.data?.message || "Invalid coupon code");
      }
    } catch {
      toast.error("Failed to validate coupon code");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    toast.info("Coupon removed");
  };

  const validateAddressStep = () => {
    if (!addressForm.name.trim()) {
      toast.error("Please enter recipient name");
      return false;
    }
    const cleanPhone = addressForm.phone.replace(/[^0-9]/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      toast.error("Please enter a valid 10-digit Indian mobile number");
      return false;
    }
    if (!addressForm.street.trim() || addressForm.street.trim().length < 5) {
      toast.error("Please enter a complete street / house address");
      return false;
    }
    if (!addressForm.city.trim()) {
      toast.error("Please specify your delivery city");
      return false;
    }
    if (!/^\d{6}$/.test(addressForm.pincode.trim())) {
      toast.error("Please enter a valid 6-digit postal PIN code");
      return false;
    }
    return true;
  };

  const handleProceedToReview = () => {
    if (validateAddressStep()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleProceedToPayment = () => {
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Place Order Handler (Razorpay or COD)
  const handleFinalOrderSubmit = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsProcessingPayment(true);

    const orderPayloadItems = items.map((i) => ({
      productId: i.productId,
      sku: i.sku,
      title: i.title,
      colorName: i.colorName,
      quantity: i.quantity,
      sellingPrice: i.sellingPrice,
      mrp: i.mrp,
      imageUrl: i.imageUrl,
    }));

    if (paymentMethod === "cod") {
      try {
        const res = await fetch("/api/checkout/cod", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: addressForm.name,
            customerPhone: addressForm.phone,
            customerEmail: addressForm.email || undefined,
            shippingAddress: addressForm.street + (addressForm.landmark ? `, Near ${addressForm.landmark}` : ""),
            shippingCity: addressForm.city,
            shippingState: addressForm.state,
            shippingPincode: addressForm.pincode,
            totalAmount: finalPayable,
            mrpTotal: totalMrp,
            savingsTotal: totalSavings,
            shippingFee: deliveryFee,
            couponCode: appliedCoupon?.code,
            couponDiscount,
            items: orderPayloadItems,
          }),
        });

        const data = await res.json();
        if (data.success && data.data?.order) {
          setConfirmedOrder(data.data.order);
          clearCart();
          setCurrentStep(4);
          toast.success("Cash on Delivery order placed successfully!");
        } else {
          toast.error(data.error?.message || "Failed to place COD order");
        }
      } catch (err: any) {
        toast.error(err.message || "Network error placing COD order");
      } finally {
        setIsProcessingPayment(false);
      }
      return;
    }

    // Razorpay Online Flow
    try {
      const initRes = await fetch("/api/checkout/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalPayable,
          receipt: `rcpt_${Date.now()}`,
          notes: {
            customerName: addressForm.name,
            customerPhone: addressForm.phone,
          },
        }),
      });

      const initData = await initRes.json();
      if (!initData.success) {
        throw new Error(initData.error?.message || "Failed to initiate online payment");
      }

      const { orderId, keyId, isTestMode } = initData.data;

      const completeVerification = async (paymentId: string, signature: string) => {
        const verifyRes = await fetch("/api/checkout/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            razorpaySignature: signature,
            customerName: addressForm.name,
            customerPhone: addressForm.phone,
            customerEmail: addressForm.email || undefined,
            shippingAddress: addressForm.street + (addressForm.landmark ? `, Near ${addressForm.landmark}` : ""),
            shippingCity: addressForm.city,
            shippingState: addressForm.state,
            shippingPincode: addressForm.pincode,
            totalAmount: finalPayable,
            mrpTotal: totalMrp,
            savingsTotal: totalSavings,
            shippingFee: deliveryFee,
            couponCode: appliedCoupon?.code,
            couponDiscount,
            items: orderPayloadItems,
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyData.success && verifyData.data?.order) {
          setConfirmedOrder(verifyData.data.order);
          clearCart();
          setCurrentStep(4);
          toast.success("Payment verified! Order confirmed.");
        } else {
          toast.error(verifyData.error?.message || "Payment verification failed");
        }
      };

      if (isTestMode || !window.Razorpay) {
        // Instant simulated sandbox flow
        toast.info("⚡ Test Mode Payment Active: Auto-verifying HMAC signature...");
        await completeVerification(`pay_test_${Date.now()}`, `sig_test_${Date.now()}`);
        setIsProcessingPayment(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: keyId,
        amount: Math.round(finalPayable * 100),
        currency: "INR",
        name: "RA Universal Handlooms",
        description: `Order for ${totalCount} handloom items`,
        order_id: orderId,
        prefill: {
          name: addressForm.name,
          contact: addressForm.phone,
          email: addressForm.email || undefined,
        },
        theme: {
          color: "#800020",
        },
        handler: async function (response: any) {
          await completeVerification(
            response.razorpay_payment_id,
            response.razorpay_signature
          );
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            toast.info("Payment cancelled. You can try again or select Cash on Delivery.");
          },
        },
      });

      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Failed to process payment");
      setIsProcessingPayment(false);
    }
  };

  // If Cart is Empty and not on success step
  if (items.length === 0 && currentStep !== 4) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
          <ShoppingBag className="w-8 h-8 stroke-1" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-neutral-900">
          Your Shopping Cart is Empty
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 max-w-sm mx-auto">
          Explore our collection of traditional Varanasi silk dupattas and Bengal cotton gamchas to begin your order.
        </p>
        <div className="pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-primary hover:bg-brand-dark text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <span>Explore Handloom Weaves</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Checkout Progress Stepper */}
      {currentStep !== 4 && (
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-xl mx-auto">
            {[
              { num: 1, label: "Delivery Address" },
              { num: 2, label: "Review & Offers" },
              { num: 3, label: "Secure Payment" },
            ].map((step, idx) => (
              <React.Fragment key={step.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      currentStep === step.num
                        ? "bg-brand-primary text-white ring-4 ring-brand-primary/20"
                        : currentStep > step.num
                        ? "bg-emerald-600 text-white"
                        : "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    {currentStep > step.num ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                  </div>
                  <span
                    className={`hidden sm:inline text-xs font-semibold ${
                      currentStep === step.num ? "text-neutral-900" : "text-neutral-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-colors ${
                      currentStep > step.num ? "bg-emerald-600" : "bg-neutral-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: ORDER CONFIRMATION & TAX INVOICE */}
      {currentStep === 4 && confirmedOrder ? (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-10 space-y-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Order Confirmed & Placed
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
              Thank You, {confirmedOrder.customerName}!
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
              Your handloom parcel has been dispatched to our artisan packaging loft. We have sent an order summary to your phone (+91 {confirmedOrder.customerPhone}).
            </p>
          </div>

          <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-200 space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
              <span className="text-neutral-500">Order Reference ID:</span>
              <span className="font-mono font-bold text-sm text-neutral-900">
                #{confirmedOrder.orderNumber}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-500">Payment Mode:</span>
              <span className="font-semibold uppercase text-brand-primary">
                {confirmedOrder.paymentGateway === "cod" ? "Cash on Delivery (COD)" : "Razorpay Online (Paid)"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-500">Total Net Amount:</span>
              <span className="font-bold text-sm text-neutral-900 font-mono">
                {formatINR(confirmedOrder.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between items-start pt-1">
              <span className="text-neutral-500">Delivery Address:</span>
              <span className="font-medium text-right max-w-xs text-neutral-800">
                {typeof confirmedOrder.shippingAddress === "string"
                  ? confirmedOrder.shippingAddress
                  : "Standard Address"}
                , {confirmedOrder.shippingCity} ({confirmedOrder.shippingPincode})
              </span>
            </div>
          </div>

          {/* Real-time Order Tracking Timeline */}
          <div className="space-y-4 pt-2">
            <h3 className="font-serif text-base font-bold text-neutral-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent-gold" />
              <span>Artisan Dispatch Pipeline</span>
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] sm:text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1">
                <span className="font-bold text-emerald-800 block">✓ Confirmed</span>
                <span className="text-neutral-500 text-[10px]">Loom Assigned</span>
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg space-y-1">
                <span className="font-bold text-indigo-800 block">Packed</span>
                <span className="text-neutral-500 text-[10px]">Quality Inspected</span>
              </div>
              <div className="p-3 bg-neutral-100 rounded-lg space-y-1 opacity-70">
                <span className="font-medium text-neutral-700 block">Shipped</span>
                <span className="text-neutral-400 text-[10px]">In Transit</span>
              </div>
              <div className="p-3 bg-neutral-100 rounded-lg space-y-1 opacity-70">
                <span className="font-medium text-neutral-700 block">Delivered</span>
                <span className="text-neutral-400 text-[10px]">At Doorstep</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-6 py-2.5 bg-brand-primary hover:bg-brand-dark text-white text-xs font-semibold rounded-lg text-center shadow-sm transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/account/profile"
              className="w-full sm:w-auto px-6 py-2.5 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold rounded-lg text-center transition-colors"
            >
              View Order History
            </Link>
          </div>
        </div>
      ) : (
        /* MAIN CHECKOUT 2-COLUMN GRID */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: ACTIVE STEP DETAILS */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-neutral-200 p-5 sm:p-7 shadow-xs">
            {/* ============================================================== */}
            {/* STEP 1: DELIVERY ADDRESS SELECTION */}
            {/* ============================================================== */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold text-neutral-900">
                    Shipping & Delivery Address
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Enter the recipient contact details and physical address for weaver dispatch.
                  </p>
                </div>

                {/* Saved Address Cards */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-neutral-700">Select Saved Address:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedAddressId === addr.id
                              ? "border-brand-primary bg-brand-cream/40 shadow-xs"
                              : "border-neutral-200 hover:border-neutral-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-neutral-900">{addr.name}</span>
                            <span className="text-[10px] font-mono bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded capitalize">
                              {addr.type}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 line-clamp-2">
                            {addr.street}, {addr.city} ({addr.pincode})
                          </p>
                          <span className="text-[11px] text-neutral-500 block mt-1">
                            📞 +91 {addr.phone}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual Address Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleProceedToReview();
                  }}
                  className="space-y-4 pt-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        10-Digit Mobile Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        placeholder="e.g. 9876543210"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Email Address (For Tax Bill PDF & Dispatch Tracking)
                    </label>
                    <input
                      type="email"
                      value={addressForm.email}
                      onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                      placeholder="e.g. rahul@example.com"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Complete Street Address (House/Flat, Building, Street) *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      placeholder="e.g. Flat 302, Royal Residency, Loom Workers Lane"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        placeholder="e.g. Varanasi"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        placeholder="Uttar Pradesh"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        placeholder="e.g. 221001"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto bg-brand-primary text-white flex items-center justify-center gap-2 py-3 px-6 text-sm sm:text-base font-bold shadow-md hover:bg-brand-primary-hover transition-all rounded-lg"
                    >
                      <span>Proceed to Review & Offers</span>
                      <ArrowRight className="w-4 h-4 flex-shrink-0" />
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 2: REVIEW ORDER & PROMO COUPONS */}
            {/* ============================================================== */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-neutral-900">
                      Review Items & Apply Coupons
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Verify your handloom choices and claim exclusive artisan discounts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-semibold text-brand-primary hover:underline"
                  >
                    Edit Address
                  </button>
                </div>

                {/* Items List */}
                <div className="divide-y divide-neutral-200">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.colorName || "std"}`} className="py-3 flex items-center gap-3">
                      <div className="relative w-14 h-18 bg-neutral-100 rounded overflow-hidden flex-shrink-0 aspect-[3/4]">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          sizes="60px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-mono text-neutral-400">
                          {item.sku || "RA-SKU"}
                        </span>
                        <h4 className="font-semibold text-xs text-neutral-900 truncate">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-neutral-500">
                          Color: <strong className="text-neutral-700">{item.colorName || "Standard"}</strong> | Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-xs text-neutral-900 font-mono">
                          {formatINR(item.sellingPrice * item.quantity)}
                        </span>
                        {item.mrp > item.sellingPrice && (
                          <span className="block text-[10px] text-neutral-400 line-through">
                            {formatINR(item.mrp * item.quantity)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Application Box */}
                <div className="p-4 bg-brand-cream/60 border border-brand-primary/20 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-brand-primary" />
                    <span className="text-xs font-bold text-neutral-900">
                      Apply Promotional Discount Code
                    </span>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>
                          Code <strong>{appliedCoupon.code}</strong> applied (-{formatINR(couponDiscount)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-[11px] font-bold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code (e.g. HANDLOOM10)"
                        className="flex-1 text-xs px-3 py-2 uppercase font-mono tracking-wider rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                      />
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={isValidatingCoupon}
                        onClick={() => handleApplyCoupon()}
                        className="bg-brand-primary text-white text-xs font-semibold px-4"
                      >
                        {isValidatingCoupon ? "Validating..." : "Apply"}
                      </Button>
                    </div>
                  )}

                  {/* Quick-Apply Available Coupons Pills */}
                  {availableCoupons.length > 0 && !appliedCoupon && (
                    <div className="pt-1">
                      <span className="text-[10px] text-neutral-500 block mb-1.5 font-medium">
                        Available Promos for You:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {availableCoupons.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => handleApplyCoupon(c.code)}
                            className="text-[10px] font-mono bg-white border border-brand-primary/30 hover:border-brand-primary text-brand-primary px-2 py-0.5 rounded transition-colors"
                          >
                            🏷️ {c.code} ({c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Back / Next Buttons */}
                <div className="pt-3 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setCurrentStep(1)}
                    className="w-full sm:w-auto justify-center text-xs sm:text-sm font-semibold py-2.5"
                  >
                    Back to Address
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={handleProceedToPayment}
                    className="w-full sm:w-auto bg-brand-primary text-white flex items-center justify-center gap-2 py-3 px-6 text-sm sm:text-base font-bold shadow-md hover:bg-brand-primary-hover transition-all rounded-lg"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4 flex-shrink-0" />
                  </Button>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 3: PAYMENT METHOD SELECTION */}
            {/* ============================================================== */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold text-neutral-900">
                    Choose Payment Method
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    100% encrypted and protected by Razorpay & artisan quality guarantee.
                  </p>
                </div>

                {/* Payment Selection Radios */}
                <div className="space-y-3">
                  {/* Option 1: Razorpay Online */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "razorpay"
                        ? "border-brand-primary bg-brand-cream/40 shadow-xs"
                        : "border-neutral-200 hover:border-neutral-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_choice"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={() => setPaymentMethod("razorpay")}
                      className="mt-1 text-brand-primary focus:ring-brand-primary"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm text-neutral-900 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-brand-primary" />
                          <span>Razorpay Online Payment (Recommended)</span>
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                          FASTEST DISPATCH
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600">
                        Pay securely with UPI (Google Pay, PhonePe, Paytm), RuPay / Debit / Credit Cards, or Netbanking. Zero extra surcharge.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Cash on Delivery */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "cod"
                        ? "border-brand-primary bg-brand-cream/40 shadow-xs"
                        : "border-neutral-200 hover:border-neutral-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_choice"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="mt-1 text-brand-primary focus:ring-brand-primary"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm text-neutral-900 flex items-center gap-1.5">
                          <Banknote className="w-4 h-4 text-emerald-600" />
                          <span>Cash on Delivery (COD)</span>
                        </span>
                        <span className="text-[10px] bg-neutral-100 text-neutral-700 font-medium px-2 py-0.5 rounded">
                          Pay upon arrival
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600">
                        Pay cash or UPI directly to the courier agent when your handloom package arrives at your doorstep.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-neutral-600">
                  <div className="flex items-center gap-2 p-2 bg-neutral-50 rounded border border-neutral-200">
                    <ShieldCheck className="w-4 h-4 text-accent-gold flex-shrink-0" />
                    <span>256-Bit SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-neutral-50 rounded border border-neutral-200">
                    <Truck className="w-4 h-4 text-accent-gold flex-shrink-0" />
                    <span>Pan-India Courier Handover</span>
                  </div>
                </div>

                {/* Final Order Submit Button */}
                <div className="pt-4 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setCurrentStep(2)}
                    className="w-full sm:w-auto justify-center text-xs sm:text-sm font-semibold py-2.5"
                  >
                    Back to Items
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    disabled={isProcessingPayment}
                    onClick={handleFinalOrderSubmit}
                    className="w-full sm:flex-1 bg-brand-primary text-white font-bold flex items-center justify-center gap-2 py-3 px-4 text-sm sm:text-base shadow-md hover:bg-brand-primary-hover active:scale-[0.99] transition-all text-center rounded-lg"
                  >
                    <span className="leading-snug break-words">
                      {isProcessingPayment
                        ? "Confirming Order..."
                        : paymentMethod === "cod"
                        ? `Place Cash on Delivery Order (${formatINR(finalPayable)})`
                        : `Pay ${formatINR(finalPayable)} Securely`}
                    </span>
                    <ArrowRight className="w-4 h-4 flex-shrink-0" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: STICKY BILL SUMMARY CARD */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-neutral-200 p-5 shadow-xs sticky top-24 space-y-4">
            <h3 className="font-serif text-base font-bold text-neutral-900 border-b border-neutral-200 pb-3">
              Order Bill Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Total Items:</span>
                <span className="font-medium text-neutral-900">{totalCount} pcs</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Total MRP:</span>
                <span className="line-through text-neutral-400 font-mono">{formatINR(totalMrp)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Handloom Selling Price:</span>
                <span className="font-medium text-neutral-900 font-mono">{formatINR(rawSellingPrice)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code}):</span>
                  <span className="font-mono">-{formatINR(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Express Courier Shipping:</span>
                <span className="font-mono">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    formatINR(deliveryFee)
                  )}
                </span>
              </div>
              <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-sm text-neutral-900">Net Payable Amount:</span>
                <span className="font-serif text-xl font-bold text-brand-primary font-mono">
                  {formatINR(finalPayable)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/80 text-[11px] text-neutral-600 space-y-1">
              <p>
                Inclusive of all applicable Indian taxes. Standard delivery within 2–5 business days.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
