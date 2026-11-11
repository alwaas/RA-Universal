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
  Upload,
  ShieldCheck,
  Key,
  Lock,
  Image as ImageIcon,
  Star,
  RefreshCw,
  Server,
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

  // Multi-angle photo and color interfaces for product form
  interface FormColorItem {
    id?: string;
    name: string;
    hexCode: string;
    imageUrl?: string;
  }

  interface FormImageItem {
    id?: string;
    imageUrl: string;
    altText?: string; // Angle name: e.g. "Front View", "Back View", "Side / Border Angle", "Texture / Weave Detail", "Model Pose"
    colorName?: string; // Associated color name, or "" for General
    isPrimary: boolean;
  }

  // Create form state with multi-color & multi-angle support
  const [newProductForm, setNewProductForm] = useState({
    title: "",
    category: "scarves_dupattas" as ProductCategory,
    fabric: "100% Pure Handloom Cotton",
    description: "Authentic handwoven textile crafted by traditional artisans.",
    mrp: 1000,
    sellingPrice: 599,
    stockCount: 15,
    colors: [
      { name: "Traditional Red", hexCode: "#DC2626", imageUrl: "" },
    ] as FormColorItem[],
    images: [
      {
        imageUrl: "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=800",
        altText: "Front View",
        colorName: "Traditional Red",
        isPrimary: true,
      },
    ] as FormImageItem[],
  });

  const [selectedUploadColor, setSelectedUploadColor] = useState<string>("Traditional Red");
  const [selectedAngleLabel, setSelectedAngleLabel] = useState<string>("Front View");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [customImageUrlInput, setCustomImageUrlInput] = useState("");

  // Health and Password Rotation state (Req 5, 6, 10)
  const [healthData, setHealthData] = useState<any>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isRotatingPassword, setIsRotatingPassword] = useState(false);

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

  // Load Admin Diagnostic Health
  const fetchAdminHealth = async () => {
    try {
      setIsLoadingHealth(true);
      const res = await fetch("/api/admin/health");
      const data = await res.json();
      if (res.ok && data.success) {
        setHealthData(data.data);
      }
    } catch {
      console.warn("Failed to load admin health diagnostics");
    } finally {
      setIsLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOffer();
    fetchEnquiries();
    if (activeTab === "security") {
      fetchAdminHealth();
    }
  }, [activeTab]);

  // Handle Server-Side Multi-File Image Upload with Color & Angle Mapping
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetForm: "create" | "edit" = "create"
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const targetColor = selectedUploadColor;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      setIsUploadingImage(true);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const newUrls: string[] =
          data.data.urls ||
          (data.data.url ? [data.data.url] : data.data.imageUrl ? [data.data.imageUrl] : []);

        if (newUrls.length > 0) {
          const defaultAngles = [
            "Front View",
            "Back View",
            "Side / Border Angle",
            "Texture / Weave Detail",
            "Model Pose",
          ];

          if (targetForm === "create") {
            setNewProductForm((prev) => {
              const newImages: FormImageItem[] = newUrls.map((url, idx) => ({
                imageUrl: url,
                altText:
                  newUrls.length === 1 && selectedAngleLabel
                    ? selectedAngleLabel
                    : defaultAngles[idx % defaultAngles.length] || `Angle ${prev.images.length + idx + 1}`,
                colorName: targetColor || (prev.colors[0]?.name || ""),
                isPrimary: prev.images.length === 0 && idx === 0,
              }));

              const nextImages = [...prev.images, ...newImages];
              // Automatically sync the color's primary photo if currently empty
              const nextColors = prev.colors.map((c) => {
                if (
                  (!c.imageUrl || c.imageUrl === "") &&
                  (c.name === targetColor || (!targetColor && c === prev.colors[0]))
                ) {
                  return { ...c, imageUrl: newUrls[0] };
                }
                return c;
              });

              return {
                ...prev,
                images: nextImages,
                colors: nextColors,
              };
            });
          } else if (targetForm === "edit" && editingProduct) {
            setEditingProduct((prev) => {
              if (!prev) return null;
              const newImages = newUrls.map((url, idx) => ({
                id: `img-new-${Date.now()}-${idx}`,
                imageUrl: url,
                altText:
                  newUrls.length === 1 && selectedAngleLabel
                    ? selectedAngleLabel
                    : defaultAngles[idx % defaultAngles.length] || `Angle ${prev.images.length + idx + 1}`,
                colorName: targetColor || (prev.colors[0]?.name || ""),
                isPrimary: prev.images.length === 0 && idx === 0,
              }));

              return {
                ...prev,
                images: [...prev.images, ...newImages],
              };
            });
          }

          setFeedback({
            type: "success",
            text: `Successfully uploaded ${newUrls.length} photo(s) for ${
              targetColor ? `color "${targetColor}"` : "product"
            } (${data.data.provider || "server storage"})!`,
          });
        }
      } else {
        setFeedback({ type: "error", text: data.error?.message || "Failed to upload image(s)" });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error occurred during image upload" });
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleAddImageUrl = (targetForm: "create" | "edit" = "create") => {
    if (!customImageUrlInput || !customImageUrlInput.trim()) return;
    const trimmed = customImageUrlInput.trim();
    const targetColor = selectedUploadColor;

    if (targetForm === "create") {
      setNewProductForm((prev) => {
        const newImg: FormImageItem = {
          imageUrl: trimmed,
          altText: selectedAngleLabel || "Front View",
          colorName: targetColor || (prev.colors[0]?.name || ""),
          isPrimary: prev.images.length === 0,
        };
        const nextImages = [...prev.images, newImg];
        const nextColors = prev.colors.map((c) => {
          if (
            (!c.imageUrl || c.imageUrl === "") &&
            (c.name === targetColor || (!targetColor && c === prev.colors[0]))
          ) {
            return { ...c, imageUrl: trimmed };
          }
          return c;
        });
        return {
          ...prev,
          images: nextImages,
          colors: nextColors,
        };
      });
    } else if (targetForm === "edit" && editingProduct) {
      setEditingProduct((prev) => {
        if (!prev) return null;
        const newImg = {
          id: `img-url-${Date.now()}`,
          imageUrl: trimmed,
          altText: selectedAngleLabel || "Front View",
          colorName: targetColor || (prev.colors[0]?.name || ""),
          isPrimary: prev.images.length === 0,
        };
        return {
          ...prev,
          images: [...prev.images, newImg],
        };
      });
    }
    setCustomImageUrlInput("");
  };

  const handleSetPrimaryImage = (index: number, targetForm: "create" | "edit" = "create") => {
    if (targetForm === "create") {
      setNewProductForm((prev) => ({
        ...prev,
        images: prev.images.map((img, i) => ({ ...img, isPrimary: i === index })),
      }));
    } else if (targetForm === "edit" && editingProduct) {
      setEditingProduct((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          images: prev.images.map((img, i) => ({ ...img, isPrimary: i === index })),
        };
      });
    }
  };

  const handleRemoveImage = (index: number, targetForm: "create" | "edit" = "create") => {
    if (targetForm === "create") {
      setNewProductForm((prev) => {
        const filtered = prev.images.filter((_, i) => i !== index);
        if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
          filtered[0].isPrimary = true;
        }
        return { ...prev, images: filtered };
      });
    } else if (targetForm === "edit" && editingProduct) {
      setEditingProduct((prev) => {
        if (!prev) return null;
        const filtered = prev.images.filter((_, i) => i !== index);
        if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
          filtered[0].isPrimary = true;
        }
        return { ...prev, images: filtered };
      });
    }
  };

  const handleUpdateImageColor = (
    index: number,
    colorName: string,
    targetForm: "create" | "edit" = "create"
  ) => {
    if (targetForm === "create") {
      setNewProductForm((prev) => ({
        ...prev,
        images: prev.images.map((img, i) => (i === index ? { ...img, colorName } : img)),
      }));
    } else if (targetForm === "edit" && editingProduct) {
      setEditingProduct((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          images: prev.images.map((img, i) => (i === index ? { ...img, colorName } : img)),
        };
      });
    }
  };

  const handleUpdateImageAngle = (
    index: number,
    altText: string,
    targetForm: "create" | "edit" = "create"
  ) => {
    if (targetForm === "create") {
      setNewProductForm((prev) => ({
        ...prev,
        images: prev.images.map((img, i) => (i === index ? { ...img, altText } : img)),
      }));
    } else if (targetForm === "edit" && editingProduct) {
      setEditingProduct((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          images: prev.images.map((img, i) => (i === index ? { ...img, altText } : img)),
        };
      });
    }
  };

  // Color variant management helpers
  const handleAddColor = (targetForm: "create" | "edit" = "create") => {
    const defaultColorNames = [
      "Forest Green",
      "Indigo Blue",
      "Mustard Ochre",
      "Royal Maroon",
      "Jet Black",
      "Ivory White",
    ];
    if (targetForm === "create") {
      setNewProductForm((prev) => {
        const nextIdx = prev.colors.length;
        const nextName =
          defaultColorNames[nextIdx % defaultColorNames.length] || `Color ${nextIdx + 1}`;
        const nextHex =
          ["#15803D", "#1D4ED8", "#CA8A04", "#800000", "#171717", "#F5F5DC"][nextIdx % 6] ||
          "#4B5563";
        return {
          ...prev,
          colors: [...prev.colors, { name: nextName, hexCode: nextHex, imageUrl: "" }],
        };
      });
    } else if (targetForm === "edit" && editingProduct) {
      setEditingProduct((prev) => {
        if (!prev) return null;
        const nextIdx = prev.colors.length;
        const nextName =
          defaultColorNames[nextIdx % defaultColorNames.length] || `Color ${nextIdx + 1}`;
        const nextHex =
          ["#15803D", "#1D4ED8", "#CA8A04", "#800000", "#171717", "#F5F5DC"][nextIdx % 6] ||
          "#4B5563";
        return {
          ...prev,
          colors: [
            ...prev.colors,
            { id: `c-${Date.now()}`, name: nextName, hexCode: nextHex, imageUrl: "" },
          ],
        };
      });
    }
  };

  const handleRemoveColor = (index: number, targetForm: "create" | "edit" = "create") => {
    if (targetForm === "create") {
      setNewProductForm((prev) => {
        if (prev.colors.length <= 1) return prev;
        const removed = prev.colors[index].name;
        return {
          ...prev,
          colors: prev.colors.filter((_, i) => i !== index),
          images: prev.images.map((img) =>
            img.colorName === removed ? { ...img, colorName: "" } : img
          ),
        };
      });
    } else if (targetForm === "edit" && editingProduct) {
      setEditingProduct((prev) => {
        if (!prev || prev.colors.length <= 1) return prev;
        const removed = prev.colors[index].name;
        return {
          ...prev,
          colors: prev.colors.filter((_, i) => i !== index),
          images: prev.images.map((img) =>
            img.colorName === removed ? { ...img, colorName: "" } : img
          ),
        };
      });
    }
  };

  const handleColorChange = (
    index: number,
    field: "name" | "hexCode" | "imageUrl",
    value: string,
    targetForm: "create" | "edit" = "create"
  ) => {
    if (targetForm === "create") {
      setNewProductForm((prev) => {
        const oldName = prev.colors[index]?.name;
        const updated = prev.colors.map((c, i) => (i === index ? { ...c, [field]: value } : c));
        let updatedImages = prev.images;
        if (field === "name" && oldName) {
          updatedImages = prev.images.map((img) =>
            img.colorName === oldName ? { ...img, colorName: value } : img
          );
          if (selectedUploadColor === oldName) setSelectedUploadColor(value);
        }
        return { ...prev, colors: updated, images: updatedImages };
      });
    } else if (targetForm === "edit" && editingProduct) {
      setEditingProduct((prev) => {
        if (!prev) return null;
        const oldName = prev.colors[index]?.name;
        const updated = prev.colors.map((c, i) => (i === index ? { ...c, [field]: value } : c));
        let updatedImages = prev.images;
        if (field === "name" && oldName) {
          updatedImages = prev.images.map((img) =>
            img.colorName === oldName ? { ...img, colorName: value } : img
          );
          if (selectedUploadColor === oldName) setSelectedUploadColor(value);
        }
        return { ...prev, colors: updated, images: updatedImages };
      });
    }
  };

  // Handle Admin Password Rotation
  const handleRotatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFeedback({ type: "error", text: "New password and confirmation do not match." });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setFeedback({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }

    try {
      setIsRotatingPassword(true);
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: "success", text: "Admin password successfully updated and rotated!" });
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        fetchAdminHealth();
      } else {
        setFeedback({ type: "error", text: data.error?.message || "Failed to rotate password." });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error occurred while updating password." });
    } finally {
      setIsRotatingPassword(false);
    }
  };

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
      const finalImages =
        newProductForm.images.length > 0
          ? newProductForm.images
          : [
              {
                imageUrl: "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=800",
                isPrimary: true,
                altText: "Front View",
                colorName: newProductForm.colors[0]?.name || "",
              },
            ];

      const primaryImg =
        finalImages.find((img) => img.isPrimary)?.imageUrl || finalImages[0]?.imageUrl;

      const finalColors = newProductForm.colors.map((c) => {
        const matchingImg = finalImages.find(
          (img) => img.colorName && img.colorName.toLowerCase() === c.name.toLowerCase()
        );
        return {
          name: c.name,
          hexCode: c.hexCode,
          imageUrl: c.imageUrl || matchingImg?.imageUrl || primaryImg,
          inStock: true,
        };
      });

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
          images: finalImages.map((img, idx) => ({
            imageUrl: img.imageUrl,
            altText: img.altText || `Angle ${idx + 1}`,
            colorName: img.colorName || null,
            displayOrder: idx,
            isPrimary: img.isPrimary,
          })),
          colors: finalColors,
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
      const finalImages =
        editingProduct.images && editingProduct.images.length > 0 ? editingProduct.images : [];
      const primaryImg =
        finalImages.find((img) => img.isPrimary)?.imageUrl || finalImages[0]?.imageUrl || "";

      const finalColors = (editingProduct.colors || []).map((c) => {
        const matchingImg = finalImages.find(
          (img) => img.colorName && img.colorName.toLowerCase() === c.name.toLowerCase()
        );
        return {
          name: c.name,
          hexCode: c.hexCode,
          imageUrl: c.imageUrl || matchingImg?.imageUrl || primaryImg,
          inStock: c.inStock ?? true,
        };
      });

      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingProduct.title,
          fabric: editingProduct.fabric,
          category: editingProduct.category,
          description: editingProduct.description,
          mrp: Number(editingProduct.mrp),
          sellingPrice: Number(editingProduct.sellingPrice),
          stockCount: Number(editingProduct.stockCount),
          status: editingProduct.status,
          images: finalImages.map((img, idx) => ({
            imageUrl: img.imageUrl,
            altText: img.altText || `Angle ${idx + 1}`,
            colorName: img.colorName || null,
            displayOrder: idx,
            isPrimary: img.isPrimary,
          })),
          colors: finalColors,
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

        <Link
          href="/admin?tab=security"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-[6px] transition-colors whitespace-nowrap ${
            activeTab === "security"
              ? "bg-neutral-900 text-white"
              : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Security & System Health</span>
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
      {/* TAB: SECURITY & SYSTEM HEALTH (Req 5, 6, 10) */}
      {/* ================================================================== */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Health Diagnostics Card */}
          <div className="bg-white border border-neutral-300/80 rounded-[8px] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-brand-primary" />
                <h2 className="font-serif text-lg font-bold text-neutral-900">
                  Real-Time Infrastructure Health
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAdminHealth}
                isLoading={isLoadingHealth}
                className="flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Diagnostics</span>
              </Button>
            </div>

            {healthData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-[6px] bg-neutral-50 border border-neutral-200 space-y-1">
                  <span className="text-neutral-500 font-semibold">PostgreSQL Database</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        healthData.diagnostics?.database?.status === "connected"
                          ? "bg-emerald-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span className="font-bold text-neutral-900 uppercase">
                      {healthData.diagnostics?.database?.status || "Unknown"}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Query Latency: {healthData.diagnostics?.database?.latencyMs != null ? `${healthData.diagnostics.database.latencyMs} ms` : "N/A"}
                  </p>
                </div>

                <div className="p-4 rounded-[6px] bg-neutral-50 border border-neutral-200 space-y-1">
                  <span className="text-neutral-500 font-semibold">Image Asset Storage</span>
                  <p className="font-bold text-neutral-900 capitalize">
                    {healthData.diagnostics?.storage?.provider || "Local / Public"}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    {healthData.diagnostics?.storage?.isCloudinaryConfigured
                      ? "Cloudinary secure server-side configured"
                      : "Using local public/uploads directory"}
                  </p>
                </div>

                <div className="p-4 rounded-[6px] bg-neutral-50 border border-neutral-200 space-y-1">
                  <span className="text-neutral-500 font-semibold">Environment & Memory</span>
                  <p className="font-bold text-neutral-900">
                    Node: {healthData.environment}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    RSS Memory: {healthData.diagnostics?.memoryUsageMb} MB | Uptime: {healthData.uptimeSeconds}s
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-neutral-500 py-3">
                Click &quot;Refresh Diagnostics&quot; to probe current PostgreSQL and server metrics.
              </div>
            )}
          </div>

          {/* Admin Password Rotation Card (Req 10) */}
          <div className="bg-white border border-neutral-300/80 rounded-[8px] p-6 shadow-sm space-y-4">
            <div className="pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-accent-gold" />
                <h2 className="font-serif text-lg font-bold text-neutral-900">
                  Rotate Administrator Password
                </h2>
              </div>
              <p className="text-xs text-neutral-600 mt-1">
                Protect your production store by rotating the initial bootstrap credentials. Passwords are encrypted with bcrypt (12 rounds) in the database.
              </p>
            </div>

            <form onSubmit={handleRotatePassword} className="max-w-md space-y-4">
              <Input
                label="Current Password"
                type="password"
                required
                placeholder="Enter existing admin password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />

              <Input
                label="New Password"
                type="password"
                required
                placeholder="Minimum 8 characters"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />

              <Input
                label="Confirm New Password"
                type="password"
                required
                placeholder="Repeat new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />

              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isRotatingPassword}
                className="w-full flex items-center justify-center gap-1.5"
              >
                <Key className="w-4 h-4" />
                <span>Update Admin Password</span>
              </Button>
            </form>
          </div>
        </div>
      )}
      {/* ================================================================== */}
      {/* MODAL: CREATE NEW PRODUCT */}
      {/* ================================================================== */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Add New Handloom Product"
          subtitle="Fill in catalogue details, color swatches, and multi-angle photos"
          size="3xl"
        >
          <form onSubmit={handleCreateProduct} className="space-y-4 sm:space-y-5">
            <Input
              label="Product Title"
              required
              placeholder="e.g. Sambalpuri Cotton Gamcha"
              value={newProductForm.title}
              onChange={(e) => setNewProductForm({ ...newProductForm, title: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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

            {/* ========================================================== */}
            {/* 1. COLOR VARIANTS MANAGEMENT */}
            {/* ========================================================== */}
            <div className="p-3 sm:p-4 rounded-[10px] bg-neutral-50 border border-neutral-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-800">
                    Product Color Variants ({newProductForm.colors.length})
                  </label>
                  <p className="text-[11px] text-neutral-500">
                    Define color swatches. Multiple angle photos can be linked to each color.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddColor("create")}
                  className="h-8 text-xs flex items-center justify-center gap-1 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Color</span>
                </Button>
              </div>

              <div className="space-y-2.5">
                {newProductForm.colors.map((color, cIdx) => {
                  const photoCount = newProductForm.images.filter(
                    (img) => img.colorName && img.colorName.toLowerCase() === color.name.toLowerCase()
                  ).length;

                  return (
                    <div
                      key={cIdx}
                      className="p-3 bg-white rounded-[8px] border border-neutral-200 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-3 shadow-xs"
                    >
                      {/* Left Group: Color Picker + Name + Hex */}
                      <div className="flex items-center gap-2 flex-1">
                        <div className="relative flex-shrink-0">
                          <input
                            type="color"
                            value={color.hexCode}
                            onChange={(e) => handleColorChange(cIdx, "hexCode", e.target.value, "create")}
                            className="w-8 h-8 p-0 border border-neutral-300 rounded cursor-pointer"
                            title="Click to pick color"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Color Name (e.g. Crimson Red)"
                          value={color.name}
                          onChange={(e) => handleColorChange(cIdx, "name", e.target.value, "create")}
                          className="flex-1 min-w-[120px] h-9 px-2.5 text-xs bg-white border border-neutral-300 rounded focus:outline-none focus:border-brand-primary font-medium"
                        />
                        <input
                          type="text"
                          placeholder="#DC2626"
                          value={color.hexCode}
                          onChange={(e) => handleColorChange(cIdx, "hexCode", e.target.value, "create")}
                          className="w-20 h-9 px-2 text-xs font-mono bg-white border border-neutral-300 rounded focus:outline-none focus:border-brand-primary"
                        />
                      </div>

                      {/* Right Group: Angle Badge + Upload Target Button + Delete Button */}
                      <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                        <span className="text-[11px] px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 font-medium whitespace-nowrap">
                          {photoCount} {photoCount === 1 ? "angle" : "angles"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedUploadColor(color.name)}
                          className={`text-xs px-2.5 py-1.5 rounded transition-colors whitespace-nowrap ${
                            selectedUploadColor === color.name
                              ? "bg-brand-primary text-white font-semibold shadow-xs"
                              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                          }`}
                        >
                          {selectedUploadColor === color.name ? "✓ Target Color" : "Select for Upload"}
                        </button>
                        {newProductForm.colors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(cIdx, "create")}
                            className="p-1.5 text-neutral-400 hover:text-red-600 rounded transition-colors"
                            title="Remove color variant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ========================================================== */}
            {/* 2. MULTI-PHOTO UPLOAD & ANGLE SPECIFICATION */}
            {/* ========================================================== */}
            <div className="space-y-3 p-3 sm:p-4 rounded-[10px] bg-neutral-50 border border-neutral-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <label className="block text-xs font-bold text-neutral-800">
                    Multi-Angle Product Photos ({newProductForm.images.length})
                  </label>
                  <p className="text-[11px] text-neutral-500">
                    Upload multiple angles (Front, Back, Border Detail, Texture, Model Pose) per color.
                  </p>
                </div>
              </div>

              {/* Upload Controls Bar */}
              <div className="bg-white p-3 rounded-[8px] border border-neutral-200 space-y-2.5 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-700 whitespace-nowrap text-xs">Target Color:</span>
                    <select
                      value={selectedUploadColor}
                      onChange={(e) => setSelectedUploadColor(e.target.value)}
                      className="flex-1 h-9 px-2.5 bg-neutral-50 border border-neutral-300 rounded text-xs focus:outline-none focus:border-brand-primary font-medium"
                    >
                      <option value="">General / All Colors</option>
                      {newProductForm.colors.map((c, i) => (
                        <option key={i} value={c.name}>
                          {c.name} ({c.hexCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-700 whitespace-nowrap text-xs">Angle Preset:</span>
                    <select
                      value={selectedAngleLabel}
                      onChange={(e) => setSelectedAngleLabel(e.target.value)}
                      className="flex-1 h-9 px-2.5 bg-neutral-50 border border-neutral-300 rounded text-xs focus:outline-none focus:border-brand-primary font-medium"
                    >
                      <option value="Front View">Front View</option>
                      <option value="Back View">Back View</option>
                      <option value="Side / Border Angle">Side / Border Angle</option>
                      <option value="Texture / Weave Detail">Texture / Weave Detail</option>
                      <option value="Model Pose">Model Pose</option>
                      <option value="Packaging / Folded">Packaging / Folded</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-neutral-100">
                  {/* File Upload Button (Multiple files enabled) */}
                  <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-neutral-300 rounded-[8px] cursor-pointer hover:border-brand-primary bg-neutral-50/50 hover:bg-neutral-50 transition-colors min-h-[44px]">
                    <Upload className="w-4 h-4 text-brand-primary flex-shrink-0" />
                    <span className="text-xs font-semibold text-neutral-700">
                      {isUploadingImage ? "Uploading photos..." : "Upload Photo(s) (Multi-Select)"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isUploadingImage}
                      onChange={(e) => handleFileUpload(e, "create")}
                      className="hidden"
                    />
                  </label>

                  {/* Direct URL input */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="url"
                      placeholder="Or paste image URL"
                      value={customImageUrlInput}
                      onChange={(e) => setCustomImageUrlInput(e.target.value)}
                      className="flex-1 h-9 px-2.5 text-xs bg-white border border-neutral-300 rounded focus:outline-none focus:border-brand-primary"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddImageUrl("create")}
                      className="whitespace-nowrap h-9 text-xs px-3"
                    >
                      Add URL
                    </Button>
                  </div>
                </div>
              </div>

              {/* Multi-Angle Gallery Thumbnails with Angle & Color Editor */}
              {newProductForm.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 pt-1">
                  {newProductForm.images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative flex flex-col rounded-[8px] overflow-hidden border-2 bg-white shadow-xs group transition-shadow hover:shadow-md ${
                        img.isPrimary ? "border-brand-primary ring-1 ring-brand-primary" : "border-neutral-200"
                      }`}
                    >
                      {/* Photo Thumbnail */}
                      <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden">
                        <Image
                          src={img.imageUrl}
                          alt={img.altText || `Angle ${idx + 1}`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          className="object-cover"
                        />

                        {/* Primary Badge / Toggle */}
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx, "create")}
                          title={img.isPrimary ? "Primary storefront image" : "Click to set as primary"}
                          className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-xs ${
                            img.isPrimary
                              ? "bg-brand-primary text-white"
                              : "bg-neutral-900/70 text-neutral-200 hover:bg-neutral-900"
                          }`}
                        >
                          <Star className="w-2.5 h-2.5" />
                          <span>{img.isPrimary ? "Main" : "Make Main"}</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx, "create")}
                          title="Remove image"
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600/90 text-white shadow-xs hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Angle & Color Metadata Controls */}
                      <div className="p-2 bg-neutral-50 border-t border-neutral-200 space-y-1.5">
                        {/* Angle / Alt Text Selector */}
                        <input
                          type="text"
                          placeholder="Angle label (e.g. Front View)"
                          value={img.altText || ""}
                          onChange={(e) => handleUpdateImageAngle(idx, e.target.value, "create")}
                          className="w-full h-7 px-2 text-xs bg-white border border-neutral-300 rounded focus:outline-none focus:border-brand-primary font-medium"
                        />

                        {/* Color Mapping Selector */}
                        <select
                          value={img.colorName || ""}
                          onChange={(e) => handleUpdateImageColor(idx, e.target.value, "create")}
                          className="w-full h-7 px-1.5 text-[11px] bg-white border border-neutral-300 rounded focus:outline-none focus:border-brand-primary font-semibold text-neutral-700"
                        >
                          <option value="">General (All Colors)</option>
                          {newProductForm.colors.map((c, i) => (
                            <option key={i} value={c.name}>
                              Color: {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sticky Bottom Actions */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs border-t border-neutral-200 py-3 px-4 sm:px-6 -mx-4 sm:-mx-6 -mb-4 sm:-mb-5 flex items-center justify-end gap-3 z-20 shadow-xs">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                className="px-5 h-9 font-semibold"
              >
                Save Product
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================================================================== */}
      {/* MODAL: EDIT PRODUCT (With Multi-Angle Photos & Colors) */}
      {/* ================================================================== */}
      {editingProduct && (
        <Modal
          isOpen={Boolean(editingProduct)}
          onClose={() => setEditingProduct(null)}
          title={`Edit: ${editingProduct.title}`}
          subtitle="Update product details, color swatches, and photo angles"
          size="3xl"
        >
          <form onSubmit={handleUpdateProduct} className="space-y-4 sm:space-y-5">
            <Input
              label="Product Title"
              required
              value={editingProduct.title}
              onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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

            {/* Colors in Edit Modal */}
            <div className="p-3 sm:p-4 rounded-[10px] bg-neutral-50 border border-neutral-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-800">
                    Color Variants ({editingProduct.colors.length})
                  </label>
                  <p className="text-[11px] text-neutral-500">Manage color swatches for this product</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddColor("edit")}
                  className="h-8 text-xs flex items-center justify-center gap-1 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Color</span>
                </Button>
              </div>

              <div className="space-y-2.5">
                {editingProduct.colors.map((color, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-3 bg-white rounded-[8px] border border-neutral-200 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-3 shadow-xs"
                  >
                    {/* Left Group: Color Picker + Name + Hex */}
                    <div className="flex items-center gap-2 flex-1">
                      <div className="relative flex-shrink-0">
                        <input
                          type="color"
                          value={color.hexCode}
                          onChange={(e) => handleColorChange(cIdx, "hexCode", e.target.value, "edit")}
                          className="w-8 h-8 p-0 border border-neutral-300 rounded cursor-pointer"
                          title="Click to pick color"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Color Name"
                        value={color.name}
                        onChange={(e) => handleColorChange(cIdx, "name", e.target.value, "edit")}
                        className="flex-1 min-w-[120px] h-9 px-2.5 text-xs bg-white border border-neutral-300 rounded focus:outline-none focus:border-brand-primary font-medium"
                      />
                      <input
                        type="text"
                        placeholder="#HEX"
                        value={color.hexCode}
                        onChange={(e) => handleColorChange(cIdx, "hexCode", e.target.value, "edit")}
                        className="w-20 h-9 px-2 text-xs font-mono bg-white border border-neutral-300 rounded focus:outline-none focus:border-brand-primary"
                      />
                    </div>

                    {/* Right Group: Upload Target Button + Delete Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                      <button
                        type="button"
                        onClick={() => setSelectedUploadColor(color.name)}
                        className={`text-xs px-2.5 py-1.5 rounded transition-colors whitespace-nowrap ${
                          selectedUploadColor === color.name
                            ? "bg-brand-primary text-white font-semibold shadow-xs"
                            : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                        }`}
                      >
                        {selectedUploadColor === color.name ? "✓ Target Color" : "Select for Upload"}
                      </button>
                      {editingProduct.colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(cIdx, "edit")}
                          className="p-1.5 text-neutral-400 hover:text-red-600 rounded transition-colors"
                          title="Remove color variant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Photos & Multi-Angle in Edit Modal */}
            <div className="space-y-3 p-3 sm:p-4 rounded-[10px] bg-neutral-50 border border-neutral-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <label className="block text-xs font-bold text-neutral-800">
                    Product Photos ({editingProduct.images.length})
                  </label>
                  <p className="text-[11px] text-neutral-500">Upload or adjust angle photos</p>
                </div>
              </div>

              {/* Upload Controls for Edit */}
              <div className="bg-white p-3 rounded-[8px] border border-neutral-200 space-y-2.5 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-700 whitespace-nowrap text-xs">Target Color:</span>
                    <select
                      value={selectedUploadColor}
                      onChange={(e) => setSelectedUploadColor(e.target.value)}
                      className="flex-1 h-9 px-2.5 bg-neutral-50 border border-neutral-300 rounded text-xs focus:outline-none focus:border-brand-primary font-medium"
                    >
                      <option value="">General / All Colors</option>
                      {editingProduct.colors.map((c, i) => (
                        <option key={i} value={c.name}>
                          {c.name} ({c.hexCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-700 whitespace-nowrap text-xs">Angle Preset:</span>
                    <select
                      value={selectedAngleLabel}
                      onChange={(e) => setSelectedAngleLabel(e.target.value)}
                      className="flex-1 h-9 px-2.5 bg-neutral-50 border border-neutral-300 rounded text-xs focus:outline-none focus:border-brand-primary font-medium"
                    >
                      <option value="Front View">Front View</option>
                      <option value="Back View">Back View</option>
                      <option value="Side / Border Angle">Side / Border Angle</option>
                      <option value="Texture / Weave Detail">Texture / Weave Detail</option>
                      <option value="Model Pose">Model Pose</option>
                      <option value="Packaging / Folded">Packaging / Folded</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-neutral-100">
                  <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-neutral-300 rounded-[8px] cursor-pointer hover:border-brand-primary bg-neutral-50/50 hover:bg-neutral-50 transition-colors min-h-[44px]">
                    <Upload className="w-4 h-4 text-brand-primary flex-shrink-0" />
                    <span className="text-xs font-semibold text-neutral-700">
                      {isUploadingImage ? "Uploading..." : "Upload Photo(s) (Multi-Select)"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isUploadingImage}
                      onChange={(e) => handleFileUpload(e, "edit")}
                      className="hidden"
                    />
                  </label>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="url"
                      placeholder="Paste image URL"
                      value={customImageUrlInput}
                      onChange={(e) => setCustomImageUrlInput(e.target.value)}
                      className="flex-1 h-9 px-2.5 text-xs bg-white border border-neutral-300 rounded focus:outline-none focus:border-brand-primary"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddImageUrl("edit")}
                      className="whitespace-nowrap h-9 text-xs px-3"
                    >
                      Add URL
                    </Button>
                  </div>
                </div>
              </div>

              {/* Edit Gallery Cards */}
              {editingProduct.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 pt-1">
                  {editingProduct.images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative flex flex-col rounded-[8px] overflow-hidden border-2 bg-white shadow-xs group transition-shadow hover:shadow-md ${
                        img.isPrimary ? "border-brand-primary ring-1 ring-brand-primary" : "border-neutral-200"
                      }`}
                    >
                      <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden">
                        <Image
                          src={img.imageUrl}
                          alt={img.altText || `Angle ${idx + 1}`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx, "edit")}
                          className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-xs ${
                            img.isPrimary
                              ? "bg-brand-primary text-white"
                              : "bg-neutral-900/70 text-neutral-200 hover:bg-neutral-900"
                          }`}
                        >
                          <Star className="w-2.5 h-2.5" />
                          <span>{img.isPrimary ? "Main" : "Make Main"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx, "edit")}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600/90 text-white shadow-xs hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-2 bg-neutral-50 border-t border-neutral-200 space-y-1.5">
                        <input
                          type="text"
                          placeholder="Angle Label"
                          value={img.altText || ""}
                          onChange={(e) => handleUpdateImageAngle(idx, e.target.value, "edit")}
                          className="w-full h-7 px-2 text-xs bg-white border border-neutral-300 rounded focus:outline-none focus:border-brand-primary font-medium"
                        />
                        <select
                          value={img.colorName || ""}
                          onChange={(e) => handleUpdateImageColor(idx, e.target.value, "edit")}
                          className="w-full h-7 px-1.5 text-[11px] bg-white border border-neutral-300 rounded focus:outline-none focus:border-brand-primary font-semibold text-neutral-700"
                        >
                          <option value="">General (All Colors)</option>
                          {editingProduct.colors.map((c, i) => (
                            <option key={i} value={c.name}>
                              Color: {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sticky Bottom Actions */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs border-t border-neutral-200 py-3 px-4 sm:px-6 -mx-4 sm:-mx-6 -mb-4 sm:-mb-5 flex items-center justify-end gap-3 z-20 shadow-xs">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingProduct(null)}
                className="px-4 h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                className="px-5 h-9 font-semibold"
              >
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
