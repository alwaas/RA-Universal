"use client";

import React, { useState, useEffect } from "react";
import { Star, ShieldCheck, ThumbsUp, MessageSquarePlus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ProductReview } from "@/types";

interface ProductReviewsProps {
  productSlug: string;
  productId: string;
  productTitle: string;
}

export function ProductReviews({
  productSlug,
  productId,
  productTitle,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Form fields
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch(`/api/products/${productSlug}/reviews`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setReviews(data.data);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch product reviews:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, [productSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!customerName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }
    if (!comment.trim() || comment.trim().length < 5) {
      setErrorMessage("Please write a review comment (minimum 5 characters).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          rating,
          title: title.trim() || undefined,
          comment: comment.trim(),
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setReviews([json.data, ...reviews]);
        setSubmittedSuccess(true);
        setTimeout(() => {
          setIsFormOpen(false);
          setSubmittedSuccess(false);
          setCustomerName("");
          setTitle("");
          setComment("");
          setRating(5);
        }, 1500);
      } else {
        setErrorMessage(json?.error?.message || "Failed to submit review.");
      }
    } catch {
      setErrorMessage("Network error submitting review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0";

  return (
    <section className="mt-16 pt-12 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-bold text-accent-gold">
                Verified Customer Feedback
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3" />
                100% Genuine Buyers
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-1">
              Ratings & Reviews
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(Number(avgRating))
                        ? "fill-amber-400 text-amber-400"
                        : "text-neutral-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-bold text-neutral-900">{avgRating} out of 5</span>
              <span className="text-xs text-neutral-500">({reviews.length} customer ratings)</span>
            </div>
          </div>

          <div>
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="flex items-center gap-2 border-neutral-800 text-neutral-900 font-semibold text-xs hover:bg-neutral-900 hover:text-white transition-colors"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>{isFormOpen ? "Close Review Form" : "Write a Verified Review"}</span>
            </Button>
          </div>
        </div>

        {/* Review Form Drawer / Panel */}
        {isFormOpen && (
          <div className="my-6 p-6 bg-amber-50/50 border border-amber-200 rounded-xl max-w-2xl">
            {submittedSuccess ? (
              <div className="py-6 text-center text-emerald-700 flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8" />
                <p className="font-bold text-sm">Thank you! Your verified review has been published.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-serif font-bold text-neutral-900 text-base">
                  Review & Rate &quot;{productTitle}&quot;
                </h3>

                {errorMessage && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                    {errorMessage}
                  </p>
                )}

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Your Rating *
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= (hoverRating || rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-neutral-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-neutral-700 ml-2">
                      {hoverRating || rating} / 5 Stars
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Your Full Name *
                    </label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ananya Mukherjee"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Headline / Title (Optional)
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Gorgeous silk sheen!"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Detailed Experience *
                  </label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe the fabric feel, drape, color accuracy, and handloom texture..."
                    className="w-full text-xs p-3 border border-neutral-300 rounded-[6px] focus:ring-1 focus:ring-accent-gold focus:border-accent-gold outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFormOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={submitting}
                  >
                    {submitting ? "Publishing..." : "Publish Review"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Reviews List */}
        <div className="mt-8 space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="p-4 bg-neutral-100 rounded-lg animate-pulse h-24" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 bg-neutral-50 rounded-xl border border-neutral-200">
              <p className="text-neutral-600 text-sm">
                No reviews yet for this artisanal weave. Be the first verified customer to share your thoughts!
              </p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 bg-white border border-neutral-200 rounded-xl shadow-xs space-y-2.5 transition-all hover:border-neutral-300"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-neutral-300"
                          }`}
                        />
                      ))}
                    </div>
                    {rev.title && (
                      <h4 className="font-serif font-bold text-neutral-900 text-sm">
                        {rev.title}
                      </h4>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                  {rev.comment}
                </p>

                <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-500">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-neutral-800">{rev.customerName}</span>
                    {rev.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-0.5 text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 text-neutral-400 hover:text-neutral-600 cursor-pointer">
                    <ThumbsUp className="w-3 h-3" />
                    Helpful
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
