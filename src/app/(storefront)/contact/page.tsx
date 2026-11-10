"use client";

import React, { useState } from "react";
import { MessageCircle, Phone, Mail, MapPin, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-accent-gold">
          We Are Here To Assist
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-neutral-900">
          Contact & Customer Care
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto">
          Have queries regarding fabric care, orders, bulk gifting, or delivery status? Reach out to our team directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          {/* WhatsApp Direct Card */}
          <div className="bg-white p-5 border border-neutral-300 rounded-[8px] space-y-3 shadow-sm">
            <div className="flex items-center gap-2.5 text-semantic-whatsapp">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-serif font-bold text-neutral-900">WhatsApp Helpdesk</h3>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Fastest way to get answers on product sizing, color verification, and shipping tracking.
            </p>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-semantic-whatsapp text-white text-xs font-bold rounded hover:opacity-95 transition-opacity"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Message on WhatsApp</span>
            </a>
          </div>

          {/* Phone & Email */}
          <div className="bg-white p-5 border border-neutral-300 rounded-[8px] space-y-4 shadow-sm text-xs text-neutral-700">
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-neutral-900">Customer Helpline</p>
                <p className="text-neutral-600">+91 98765 43210</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-neutral-900">Email Address</p>
                <p className="text-neutral-600">care@ra-heritage.in</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-neutral-900">Operating Hours</p>
                <p className="text-neutral-600">Monday – Saturday: 10:00 AM – 7:00 PM IST</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-neutral-900">Registered Office</p>
                <p className="text-neutral-600">Handloom Complex, Park Street, Kolkata, West Bengal - 700016</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 border border-neutral-300 rounded-[12px] shadow-sm">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle className="w-12 h-12 text-semantic-success mx-auto" />
              <h3 className="font-serif text-xl font-bold text-neutral-900">Message Received!</h3>
              <p className="text-xs text-neutral-600 max-w-sm mx-auto">
                Thank you for reaching out. A customer support representative will review your message and reply within 24 business hours.
              </p>
              <div className="pt-2">
                <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-neutral-900 mb-2">
                Send Us a Message
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Name"
                  required
                  placeholder="e.g. Ananya Sen"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="Phone Number"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. ananya@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="Subject"
                  required
                  placeholder="e.g. Order Tracking or Fabric Query"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Your Message
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write your query or message here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-3 text-sm bg-white border border-neutral-300 rounded-[6px] text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
