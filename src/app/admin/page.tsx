"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  ExternalLink,
  Package,
  Tag,
  Gift,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  X,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatINR } from "@/lib/formatters";
import type { Product, ProductCategory, BadgeColor } from "@/types";

interface OfferState {
  id: string;
  title: string;
  description: string;
  couponCode: string;
  isPopupActive: boolean;
}

interface EnquiryItem {
  id: string;
  type: "b2b" | "whatsapp_order";
  fullName: string;
  businessName?: string | null;
  gstin?: string | null;
  phone: string;
  email?: string | null;
  estimatedVolume?: string | null;
  message: string;
  status: "new" | "contacted" | "closed";
  createdAt: string;
}

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "products";

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create form state
  const [newProductForm, setNewProductForm] = useState({
    title: "",
    category: "scarves_dupattas" as ProductCategory,
    fabric: "100% Pure Handloom Cotton",
    description: "Authentic handwoven textile crafted by traditional artisans.",
    mrp: 1000,
    sellingPrice: 599,
    stockCount: 15,
    imageUrl: "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=800",
    colorName: "Crimson Red",
    colorHex: "#DC2626",
    badgeName: "",
  });

  // Offers state
  const [offer, setOffer] = useState<OfferState | null>(null);
  const [isTogglingOffer, setIsTogglingOffer] = useState(false);

  // Enquiries state
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [isLoadingEnquiries, setIsLoadingEnquiries] = useState(false);

  // Load products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to load products list from API." });
    } finally {
      setIsLoading(false);
    }
  };

  // Load active offer
  const fetchOffer = async () => {
    try {
      const res = await fetch("/api/offers/active");
      const data = await res.json();
      if (data.success && data.data) {
        setOffer(data.data);
      }
    } catch {
      console.warn("Could not fetch active offer");
    }
  };

  // Load enquiries
  const fetchEnquiries = async () => {
    try {
      setIsLoadingEnquiries(true);
      const res = await fetch("/api/admin/enquiries");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setEnquiries(data.data);
      }
    } catch {
      console.warn("Could not fetch enquiries");
    } finally {
      setIsLoadingEnquiries(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOffer();
    fetchEnquiries();
  }, []);

  // Quick Toggle Product Status
  const handleToggleStatus = async (product: Product) => {
    const nextStatus = product.status === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, status: nextStatus } : p))
        );
        setFeedback({
          type: "success",
          text: `Product "${product.title}" is now ${nextStatus}.`,
        });
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to update product status on server." });
    }
  };

  // Create Product Submit
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProductForm.sellingPrice > newProductForm.mrp) {
      setFeedback({ type: "error", text: "Validation Error: Selling Price cannot exceed MRP." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newProductForm.title,
          category: newProductForm.category,
          fabric: newProductForm.fabric,
          description: newProductForm.description,
          mrp: Number(newProductForm.mrp),
          sellingPrice: Number(newProductForm.sellingPrice),
          stockCount: Number(newProductForm.stockCount),
          images: [{ imageUrl: newProductForm.imageUrl, isPrimary: true }],
          colors: [{ name: newProductForm.colorName, hexCode: newProductForm.colorHex }],
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsCreateModalOpen(false);
        setFeedback({ type: "success", text: `Product "${newProductForm.title}" created successfully!` });
        fetchProducts();
      } else {
        setFeedback({ type: "error", text: data.error?.message || "Failed to create product." });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error occurred while creating product." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Product Submit
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (editingProduct.sellingPrice > editingProduct.mrp) {
      setFeedback({ type: "error", text: "Validation Error: Selling Price cannot exceed MRP." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingProduct.title,
          fabric: editingProduct.fabric,
          category: editingProduct.category,
          mrp: Number(editingProduct.mrp),
          sellingPrice: Number(editingProduct.sellingPrice),
          stockCount: Number(editingProduct.stockCount),
          status: editingProduct.status,
        }),
      });

      if (res.ok) {
        setEditingProduct(null);
        setFeedback({ type: "success", text: `Product "${editingProduct.title}" updated successfully!` });
        fetchProducts();
      } else {
        const data = await res.json();
        setFeedback({ type: "error", text: data.error?.message || "Failed to update product." });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error occurred while updating product." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Product Submit
  const handleDeleteProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        setDeletingProductId(null);
        setFeedback({ type: "success", text: "Product deleted from catalogue." });
      } else {
        setFeedback({ type: "error", text: "Failed to delete product from server." });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error while deleting product." });
    }
  };

  // Toggle Offer Active State
  const handleToggleOffer = async () => {
    if (!offer) return;
    setIsTogglingOffer(true);
    const nextState = !offer.isPopupActive;

    try {
      const res = await fetch(`/api/admin/offers/${offer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPopupActive: nextState }),
      });

      if (res.ok) {
        setOffer({ ...offer, isPopupActive: nextState });
        setFeedback({
          type: "success",
          text: `Offer popup is now ${nextState ? "activated" : "deactivated"}.`,
        });
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to update offer popup status." });
    } finally {
      setIsTogglingOffer(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-300">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
            Administrative Control Panel
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            Manage handloom catalogue, corner badges, promotional popups, and wholesale leads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/shop"
            target="_blank"
            className="text-xs font-semibold text-brand-primary flex items-center gap-1 hover:underline"
          >
            <span>View Live Shop</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {activeTab === "products" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-neutral-200 overflow-x-auto pb-2 text-xs font-semibold">
        <Link
          href="/admin?tab=products"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-[6px] transition-colors whitespace-nowrap ${
            activeTab === "products"
              ? "bg-neutral-900 text-white"
              : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
          }`}
        >
          <Package className="w-4 h-4 text-accent-gold" />
          <span>Products Catalogue ({products.length})</span>
        </Link>

        <Link
          href="/admin?tab=offers"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-[6px] transition-colors whitespace-nowrap ${
            activeTab === "offers"
              ? "bg-neutral-900 text-white"
              : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
          }`}
        >
          <Gift className="w-4 h-4 text-brand-primary" />
          <span>Offer Popups</span>
        </Link>

        <Link
          href="/admin?tab=tags"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-[6px] transition-colors whitespace-nowrap ${
            activeTab === "tags"
              ? "bg-neutral-900 text-white"
              : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
          }`}
        >
          <Tag className="w-4 h-4 text-semantic-warning" />
          <span>Badges & Tags</span>
        </Link>

        <Link
          href="/admin?tab=enquiries"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-[6px] transition-colors whitespace-nowrap ${
            activeTab === "enquiries"
              ? "bg-neutral-900 text-white"
              : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
          }`}
        >
          <MessageSquare className="w-4 h-4 text-semantic-whatsapp" />
          <span>B2B Enquiries ({enquiries.length})</span>
        </Link>
      </div>

      {/* Action Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-[8px] flex items-center justify-between text-xs sm:text-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:opacity-70 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================================================================== */}
      {/* TAB 1: PRODUCTS CATALOGUE CRUD */}
      {/* ================================================================== */}
      {activeTab === "products" && (
        <div className="space-y-6">
          {/* KPI Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-[8px] border border-neutral-300 space-y-1 shadow-sm">
              <span className="text-xs font-semibold text-neutral-500 uppercase">Total Items</span>
              <p className="text-2xl font-bold text-neutral-900">{products.length}</p>
            </div>

            <div className="bg-white p-4 rounded-[8px] border border-neutral-300 space-y-1 shadow-sm">
              <span className="text-xs font-semibold text-neutral-500 uppercase">Active on Shop</span>
              <p className="text-2xl font-bold text-semantic-success">
                {products.filter((p) => p.status === "active").length}
              </p>
            </div>

            <div className="bg-white p-4 rounded-[8px] border border-neutral-300 space-y-1 shadow-sm">
              <span className="text-xs font-semibold text-neutral-500 uppercase">Men&apos;s Gamchas</span>
              <p className="text-2xl font-bold text-brand-primary">
                {products.filter((p) => p.category === "gamchas").length}
              </p>
            </div>

            <div className="bg-white p-4 rounded-[8px] border border-neutral-300 space-y-1 shadow-sm">
              <span className="text-xs font-semibold text-neutral-500 uppercase">Women&apos;s Dupattas</span>
              <p className="text-2xl font-bold text-accent-gold">
                {products.filter((p) => p.category === "scarves_dupattas").length}
              </p>
            </div>
          </div>

          {/* Products Table Card */}
          <div className="bg-white border border-neutral-300 rounded-[8px] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
              <h2 className="font-serif text-lg font-bold text-neutral-900">
                Catalogue Inventory ({products.length})
              </h2>
              <span className="text-xs text-neutral-500 hidden sm:inline">
                Click status pill to toggle active/inactive in live storefront
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-700 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price (MRP / Sale)</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Corner Badge</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-neutral-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-neutral-500">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                          <span>Loading product catalogue...</span>
                        </div>
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-neutral-500">
                        No products available in catalogue. Click &quot;Add New Product&quot; to begin.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-12 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={product.images[0]?.imageUrl || "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=800"}
                                alt={product.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="max-w-xs">
                              <p className="font-semibold text-neutral-900 line-clamp-1">{product.title}</p>
                              <p className="text-[11px] text-neutral-500 truncate">{product.fabric}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-medium capitalize">
                          {product.category === "gamchas" ? "Men's Gamcha" : "Women's Dupatta"}
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-neutral-900">{formatINR(product.sellingPrice)}</span>{" "}
                          <span className="text-neutral-400 line-through text-[11px]">{formatINR(product.mrp)}</span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-semantic-success">
                            {product.discountPercentage}% OFF
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {product.badge ? (
                            <Badge color={product.badge.badgeColor}>{product.badge.name}</Badge>
                          ) : (
                            <span className="text-neutral-400">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-semibold">
                          {product.stockCount === 0 ? (
                            <span className="text-semantic-error">0 (Out of stock)</span>
                          ) : (
                            product.stockCount
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(product)}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-colors ${
                              product.status === "active"
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
                            }`}
                          >
                            {product.status === "active" ? "Active" : "Inactive"}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              title="Edit Product"
                              onClick={() => setEditingProduct(product)}
                              className="p-1.5 text-neutral-600 hover:text-brand-primary rounded hover:bg-neutral-100 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Delete Product"
                              onClick={() => setDeletingProductId(product.id)}
                              className="p-1.5 text-neutral-600 hover:text-semantic-error rounded hover:bg-neutral-100 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* TAB 2: PROMOTIONAL POPUP OFFERS */}
      {/* ================================================================== */}
      {activeTab === "offers" && (
        <div className="bg-white border border-neutral-300 rounded-[8px] p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
            <div>
              <h2 className="font-serif text-xl font-bold text-neutral-900">
                First-Visit Welcome Offer Configuration
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Controls the dismissible promotional modal that greets first-time website visitors.
              </p>
            </div>

            {offer && (
              <Button
                variant={offer.isPopupActive ? "primary" : "outline"}
                size="md"
                onClick={handleToggleOffer}
                isLoading={isTogglingOffer}
              >
                {offer.isPopupActive ? "Active (Click to Deactivate)" : "Disabled (Click to Activate)"}
              </Button>
            )}
          </div>

          {offer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase">Offer Title</span>
                  <p className="text-base font-bold text-neutral-900 mt-0.5">{offer.title}</p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase">Coupon Code</span>
                  <p className="font-mono text-lg font-bold text-brand-primary mt-0.5">{offer.couponCode}</p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase">Description Copy</span>
                  <p className="text-xs text-neutral-700 mt-0.5 leading-relaxed">{offer.description}</p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs font-semibold text-neutral-700">Popup Status:</span>
                  <Badge color={offer.isPopupActive ? "green" : "gray"}>
                    {offer.isPopupActive ? "Live on Storefront" : "Deactivated"}
                  </Badge>
                </div>
              </div>

              {/* Offer Preview Box */}
              <div className="bg-brand-secondary/40 border-2 border-dashed border-brand-primary/40 rounded-[12px] p-6 text-center space-y-3">
                <Gift className="w-8 h-8 text-brand-primary mx-auto" />
                <span className="text-[10px] font-bold text-accent-gold uppercase tracking-widest block">
                  Preview in Modal
                </span>
                <h4 className="font-serif text-lg font-bold text-neutral-900">{offer.title}</h4>
                <div className="p-2.5 bg-white border border-brand-primary/30 rounded inline-block">
                  <span className="font-mono font-bold text-brand-primary tracking-wider">{offer.couponCode}</span>
                </div>
                <p className="text-[11px] text-neutral-600 max-w-xs mx-auto">{offer.description}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================== */}
      {/* TAB 3: CORNER BADGES & TAGS */}
      {/* ================================================================== */}
      {activeTab === "tags" && (
        <div className="bg-white border border-neutral-300 rounded-[8px] p-6 space-y-6 shadow-sm">
          <div className="pb-4 border-b border-neutral-200">
            <h2 className="font-serif text-xl font-bold text-neutral-900">
              Corner Badges & Merchandising Tags
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Admin-configurable tags pinned to the top-left corner of product cards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border border-neutral-200 rounded-[8px] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900 text-sm">Sale Tag</span>
                <Badge color="red">Sale</Badge>
              </div>
              <p className="text-xs text-neutral-500">Pinned on promotional or deeply discounted handlooms.</p>
              <span className="text-[10px] font-mono text-neutral-400">Slug: sale</span>
            </div>

            <div className="p-4 border border-neutral-200 rounded-[8px] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900 text-sm">Best Selling</span>
                <Badge color="yellow">Best Selling</Badge>
              </div>
              <p className="text-xs text-neutral-500">Highlights popular high-converting handloom dupattas.</p>
              <span className="text-[10px] font-mono text-neutral-400">Slug: best-selling</span>
            </div>

            <div className="p-4 border border-neutral-200 rounded-[8px] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900 text-sm">Low Stock Tag</span>
                <Badge color="orange">Only 2-3 Left</Badge>
              </div>
              <p className="text-xs text-neutral-500">Creates purchase urgency for limited cluster runs.</p>
              <span className="text-[10px] font-mono text-neutral-400">Slug: only-2-3-left</span>
            </div>

            <div className="p-4 border border-neutral-200 rounded-[8px] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900 text-sm">Out of Stock</span>
                <Badge color="gray">Out of Stock</Badge>
              </div>
              <p className="text-xs text-neutral-500">Automatically disables Add to Cart and Buy Now buttons.</p>
              <span className="text-[10px] font-mono text-neutral-400">Slug: out-of-stock</span>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* TAB 4: B2B ENQUIRIES & WHATSAPP LEADS */}
      {/* ================================================================== */}
      {activeTab === "enquiries" && (
        <div className="bg-white border border-neutral-300 rounded-[8px] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
            <div>
              <h2 className="font-serif text-lg font-bold text-neutral-900">
                Customer & Wholesale Enquiries ({enquiries.length})
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                B2B wholesale quotation requests and WhatsApp checkout intent logs.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-700 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Name & Contact</th>
                  <th className="py-3 px-4">Business / Volume</th>
                  <th className="py-3 px-4">Message / Order Snapshot</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-neutral-800">
                {isLoadingEnquiries ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-500">
                      Loading inquiries...
                    </td>
                  </tr>
                ) : enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-500">
                      No customer enquiries captured yet. Submissions from /b2b and /contact will appear here.
                    </td>
                  </tr>
                ) : (
                  enquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-neutral-50">
                      <td className="py-3 px-4 whitespace-nowrap text-neutral-500">
                        {new Date(enq.createdAt).toLocaleDateString("en-IN")}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-semibold">
                        <Badge color={enq.type === "b2b" ? "yellow" : "green"}>
                          {enq.type === "b2b" ? "B2B Wholesale" : "WhatsApp Order"}
                        </Badge>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-neutral-900">{enq.fullName}</p>
                        <p className="text-neutral-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>+91 {enq.phone}</span>
                        </p>
                        {enq.email && (
                          <p className="text-neutral-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            <span>{enq.email}</span>
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-medium text-neutral-900">{enq.businessName || "—"}</p>
                        <p className="text-neutral-500 text-[11px]">
                          {enq.estimatedVolume ? `Volume: ${enq.estimatedVolume} pcs` : ""}
                        </p>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="line-clamp-2 text-neutral-700">{enq.message}</p>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 uppercase">
                          {enq.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL: ADD NEW PRODUCT */}
      {/* ================================================================== */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Add New Handloom Product"
        >
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <Input
              label="Product Title"
              required
              placeholder="e.g. Sambalpuri Cotton Gamcha"
              value={newProductForm.title}
              onChange={(e) => setNewProductForm({ ...newProductForm, title: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Category</label>
                <select
                  value={newProductForm.category}
                  onChange={(e) =>
                    setNewProductForm({ ...newProductForm, category: e.target.value as ProductCategory })
                  }
                  className="w-full h-10 px-3 bg-white border border-neutral-300 rounded-[6px] text-xs font-medium text-neutral-800 focus:outline-none focus:border-brand-primary"
                >
                  <option value="scarves_dupattas">Women&apos;s Scarves & Dupattas</option>
                  <option value="gamchas">Men&apos;s Gamchas</option>
                </select>
              </div>

              <Input
                label="Fabric Specification"
                required
                value={newProductForm.fabric}
                onChange={(e) => setNewProductForm({ ...newProductForm, fabric: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="MRP (₹)"
                type="number"
                required
                min={1}
                value={newProductForm.mrp}
                onChange={(e) => setNewProductForm({ ...newProductForm, mrp: Number(e.target.value) })}
              />

              <Input
                label="Selling Price (₹)"
                type="number"
                required
                min={1}
                value={newProductForm.sellingPrice}
                onChange={(e) => setNewProductForm({ ...newProductForm, sellingPrice: Number(e.target.value) })}
              />

              <Input
                label="Stock Count"
                type="number"
                required
                min={0}
                value={newProductForm.stockCount}
                onChange={(e) => setNewProductForm({ ...newProductForm, stockCount: Number(e.target.value) })}
              />
            </div>

            <Input
              label="Primary Image URL"
              required
              value={newProductForm.imageUrl}
              onChange={(e) => setNewProductForm({ ...newProductForm, imageUrl: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Color Name"
                required
                value={newProductForm.colorName}
                onChange={(e) => setNewProductForm({ ...newProductForm, colorName: e.target.value })}
              />

              <Input
                label="Color Hex Code"
                required
                value={newProductForm.colorHex}
                onChange={(e) => setNewProductForm({ ...newProductForm, colorHex: e.target.value })}
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                Save Product
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================================================================== */}
      {/* MODAL: EDIT PRODUCT */}
      {/* ================================================================== */}
      {editingProduct && (
        <Modal
          isOpen={Boolean(editingProduct)}
          onClose={() => setEditingProduct(null)}
          title={`Edit Product: ${editingProduct.title}`}
        >
          <form onSubmit={handleUpdateProduct} className="space-y-4">
            <Input
              label="Product Title"
              required
              value={editingProduct.title}
              onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Category</label>
                <select
                  value={editingProduct.category}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, category: e.target.value as ProductCategory })
                  }
                  className="w-full h-10 px-3 bg-white border border-neutral-300 rounded-[6px] text-xs font-medium text-neutral-800 focus:outline-none focus:border-brand-primary"
                >
                  <option value="scarves_dupattas">Women&apos;s Scarves & Dupattas</option>
                  <option value="gamchas">Men&apos;s Gamchas</option>
                </select>
              </div>

              <Input
                label="Fabric Specification"
                required
                value={editingProduct.fabric}
                onChange={(e) => setEditingProduct({ ...editingProduct, fabric: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="MRP (₹)"
                type="number"
                required
                min={1}
                value={editingProduct.mrp}
                onChange={(e) => setEditingProduct({ ...editingProduct, mrp: Number(e.target.value) })}
              />

              <Input
                label="Selling Price (₹)"
                type="number"
                required
                min={1}
                value={editingProduct.sellingPrice}
                onChange={(e) => setEditingProduct({ ...editingProduct, sellingPrice: Number(e.target.value) })}
              />

              <Input
                label="Stock Count"
                type="number"
                required
                min={0}
                value={editingProduct.stockCount}
                onChange={(e) => setEditingProduct({ ...editingProduct, stockCount: Number(e.target.value) })}
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingProduct(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================================================================== */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ================================================================== */}
      {deletingProductId && (
        <Modal
          isOpen={Boolean(deletingProductId)}
          onClose={() => setDeletingProductId(null)}
          title="Confirm Product Deletion"
        >
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-neutral-700">
              Are you sure you want to permanently delete this product from your catalogue? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDeletingProductId(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="bg-semantic-error hover:bg-red-700"
                onClick={() => handleDeleteProduct(deletingProductId)}
              >
                Delete Product
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="h-64 bg-white rounded animate-pulse" />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
