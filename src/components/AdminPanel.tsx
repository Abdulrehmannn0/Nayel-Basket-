/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Order, Coupon, Product } from "../types";
import { 
  Settings, 
  Tag, 
  Trash, 
  Plus, 
  BarChart, 
  Grid,
  ShieldCheck,
  Check,
  Users,
  Briefcase,
  Layers,
  Award,
  Film,
  Image,
  BellRing,
  RotateCcw,
  Copy,
  ChevronLeft
} from "lucide-react";

interface AdminPanelProps {
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const { 
    orders, 
    updateOrderStatus, 
    approveReturnRequest, 
    addNotification, 
    products,
    setProducts
  } = useApp();

  // Secure Admin Login Gate state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState("admin@nayelbasket.com");
  const [adminPassword, setAdminPassword] = useState("admin123");

  // Nav inside Admin Console
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "catalog" | "creative" | "coupons">("overview");

  // Product management (Add/Edit Product states)
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [newProdName, setNewProdName] = useState("");
  const [newProdBrand, setNewProdBrand] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("120");
  const [newProdOrigPrice, setNewProdOrigPrice] = useState("160");
  const [newProdCategory, setNewProdCategory] = useState("Furniture");
  const [newProdStock, setNewProdStock] = useState("20");
  const [newProdImage, setNewProdImage] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");

  // Coupons state
  const [couponCode, setCouponCode] = useState("");
  const [couponVal, setCouponVal] = useState("20");
  const [couponMin, setCouponMin] = useState("100");
  const [couponDesc, setCouponDesc] = useState("Exclusive seasonal markdown code");
  const [systemCoupons, setSystemCoupons] = useState<Coupon[]>([
    { code: "NAYEL20", type: "percentage", value: 20, minSpend: 80, description: "Enjoy 20% off on exquisite home decor! Minimum purchase of $80.", expiry: "2026-12-31" },
    { code: "DECOR15", type: "fixed", value: 15, minSpend: 50, description: "Save a flat $15 on our artisanal collections over $50.", expiry: "2026-12-31" },
    { code: "FREESHIP", type: "percentage", value: 100, minSpend: 0, description: "Complimentary elite premium delivery, no minimum spend required.", expiry: "2026-12-31" }
  ]);

  // Creative Management states (Banners & Testimonial Videos)
  const [banners, setBanners] = useState([
    { id: "ban_1", title: "The Summer Solstice Curation", subtitle: "Artisanal hand-burnished brass & organic clay vessels.", active: true, image: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1200&q=80" },
    { id: "ban_2", title: "Scandinavian Solid European White Oak", subtitle: "Crafted with floating lower oak shelves.", active: true, image: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=1200&q=80" }
  ]);
  const [newBannerTitle, setNewBannerTitle] = useState("");
  const [newBannerImage, setNewBannerImage] = useState("");

  const [testimonials, setTestimonials] = useState([
    { id: "test_1", client: "Sophia Loren", role: "Interior Enthusiast", videoTitle: "Unboxing the Ceramic Trio Vase", views: 1840, url: "https://assets.mixkit.co/videos/preview/mixkit-decorating-a-warm-living-room-41561-large.mp4" },
    { id: "test_2", client: "Julian Rivera", role: "Design Director", videoTitle: "Staging the Modern Oak Table", views: 2450, url: "https://assets.mixkit.co/videos/preview/mixkit-sunlight-on-a-cozy-living-room-with-plants-41559-large.mp4" }
  ]);
  const [newTestimonialTitle, setNewTestimonialTitle] = useState("");
  const [newTestimonialClient, setNewTestimonialClient] = useState("");

  // Category list
  const [categories, setCategories] = useState<string[]>([
    "Furniture",
    "Lighting",
    "Vases & Pots",
    "Rugs & Carpets",
    "Wall Decor"
  ]);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Simulated Customers list
  const [customers] = useState([
    { id: "c_1", name: "Sophia Loren", email: "sophia@loren-design.com", ordersCount: 4, spent: 1240, status: "VIP" },
    { id: "c_2", name: "Deven R.", email: "deven@rivera-architects.com", ordersCount: 2, spent: 570, status: "Elite Member" },
    { id: "c_3", name: "Eleanor Pemberton", email: "eleanor.pem@luxuryhomes.com", ordersCount: 5, spent: 1890, status: "VIP" },
    { id: "c_4", name: "Marc Anthony", email: "anthony@moderninteriors.com", ordersCount: 1, spent: 180, status: "Subscriber" }
  ]);

  // Push notification simulator
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [pushLog, setPushLog] = useState<any[]>([
    { id: "p_1", title: "Summer Solstice Sale", body: "Unlock 20% off all solid white oak coffee tables today with NAYEL20.", timestamp: "2026-06-29T10:30:00Z" }
  ]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail === "admin@nayelbasket.com" && adminPassword === "admin123") {
      setIsAdminLoggedIn(true);
      addNotification("🔑 Admin Access Granted", "Operational console logged in securely.", "system");
    } else {
      alert("Invalid credentials. Try: admin@nayelbasket.com / admin123");
    }
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const newCp: Coupon = {
      code: couponCode.toUpperCase(),
      type: "percentage",
      value: parseFloat(couponVal) || 20,
      minSpend: parseFloat(couponMin) || 80,
      description: couponDesc,
      expiry: "2026-12-31"
    };

    setSystemCoupons((prev) => [newCp, ...prev]);
    addNotification("🎫 Coupon Created", `Admin deployed coupon ${newCp.code} successfully.`, "promo");
    setCouponCode("");
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    if (categories.includes(newCategoryName.trim())) {
      alert("This category already exists.");
      return;
    }
    setCategories((prev) => [...prev, newCategoryName.trim()]);
    addNotification("📁 Category Added", `New department category "${newCategoryName}" created successfully.`, "system");
    setNewCategoryName("");
  };

  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannerTitle.trim()) return;
    const newB = {
      id: `ban_${Date.now()}`,
      title: newBannerTitle,
      subtitle: "Bespoke Premium Living Collection",
      active: true,
      image: newBannerImage.trim() || "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=600&q=80"
    };
    setBanners((prev) => [newB, ...prev]);
    addNotification("🖼️ Banner Launched", `New creative hero banner added: "${newBannerTitle}"`, "system");
    setNewBannerTitle("");
    setNewBannerImage("");
  };

  const handleAddTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonialTitle.trim() || !newTestimonialClient.trim()) return;
    const newT = {
      id: `test_${Date.now()}`,
      client: newTestimonialClient,
      role: "Decor Purist",
      videoTitle: newTestimonialTitle,
      views: 0,
      url: "https://assets.mixkit.co/videos/preview/mixkit-decorating-a-warm-living-room-41561-large.mp4"
    };
    setTestimonials((prev) => [newT, ...prev]);
    addNotification("🎥 Video Uploaded", `New testimonial video uploaded for ${newTestimonialClient}`, "system");
    setNewTestimonialTitle("");
    setNewTestimonialClient("");
  };

  const handleSendPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushBody.trim()) return;
    const newP = {
      id: `p_${Date.now()}`,
      title: pushTitle,
      body: pushBody,
      timestamp: new Date().toISOString()
    };
    setPushLog((prev) => [newP, ...prev]);
    addNotification(`🔔 ${pushTitle}`, pushBody, "system");
    setPushTitle("");
    setPushBody("");
  };

  // CRUD Product Actions
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdBrand.trim()) return;

    const newP: Product = {
      id: editingProd ? editingProd.id : `prod_admin_${Date.now()}`,
      name: newProdName,
      brand: newProdBrand,
      sku: editingProd ? editingProd.sku : `NB-ADM-${Date.now().toString().slice(-4).toUpperCase()}`,
      description: newProdDesc || "Premium interior home design centerpiece.",
      price: parseFloat(newProdPrice) || 120,
      originalPrice: parseFloat(newProdOrigPrice) || 160,
      category: newProdCategory,
      image: newProdImage.trim() || "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=600&q=80",
      rating: editingProd ? editingProd.rating : 4.9,
      reviewCount: editingProd ? editingProd.reviewCount : 1,
      stock: parseInt(newProdStock, 10) || 15,
      sellerId: "seller_nayel_heritage",
      sellerName: "Nayel Heritage Guild",
      features: ["Solid craftsmanship construct", "Polished protective coating"],
      reviews: editingProd ? editingProd.reviews : [],
      qa: editingProd ? editingProd.qa : []
    };

    if (editingProd) {
      setProducts((prev) => prev.map((p) => p.id === editingProd.id ? newP : p));
      addNotification("✏️ Product Updated", `${newP.name} updated successfully.`, "system");
      setEditingProd(null);
    } else {
      setProducts((prev) => [newP, ...prev]);
      addNotification("📦 Product Created", `${newP.name} added to catalog successfully.`, "system");
    }

    // Reset Form
    setNewProdName("");
    setNewProdBrand("");
    setNewProdPrice("120");
    setNewProdOrigPrice("160");
    setNewProdStock("20");
    setNewProdImage("");
    setNewProdDesc("");
  };

  const handleDuplicateProduct = (p: Product) => {
    const dup: Product = {
      ...p,
      id: `prod_admin_dup_${Date.now()}`,
      name: `${p.name} (Copy)`,
      sku: `NB-DUP-${Date.now().toString().slice(-4).toUpperCase()}`,
      stock: p.stock
    };
    setProducts((prev) => [dup, ...prev]);
    addNotification("📋 Product Duplicated", `Successfully duplicated ${p.name}.`, "system");
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      addNotification("🗑️ Product Deleted", "Item removed from catalog permanently.", "system");
    }
  };

  const handleEditProductClick = (p: Product) => {
    setEditingProd(p);
    setNewProdName(p.name);
    setNewProdBrand(p.brand);
    setNewProdPrice(p.price.toString());
    setNewProdOrigPrice(p.originalPrice.toString());
    setNewProdCategory(p.category);
    setNewProdStock(p.stock.toString());
    setNewProdImage(p.image);
    setNewProdDesc(p.description);
    setActiveTab("catalog"); // switch to tab to edit
  };

  // Compute metrics
  const totalSystemSales = orders.reduce((acc, ord) => ord.status !== "Cancelled" ? acc + ord.total : acc, 0);
  const pendingFulfillmentCount = orders.filter((o) => o.status === "Pending" || o.status === "Processing").length;
  const returnRequests = orders.filter((o) => o.returnRequest !== undefined);

  if (!isAdminLoggedIn) {
    /* ADMIN LOGIN GATE SCREEN */
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 animate-fade-in text-black">
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl shadow-slate-200/50 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-neutral-900 border-2 border-neutral-100 flex items-center justify-center text-white text-lg font-bold mx-auto">
              AR
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-950 font-sans">
              Nayel Basket Console
            </h1>
            <p className="text-xs text-slate-400 font-sans">
              Access administrative, inventory cataloging, and financial settlement controls.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs font-semibold text-slate-700">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Admin Email</label>
              <input
                id="input-admin-email"
                type="email"
                required
                className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-4 py-3 text-black focus:outline-none focus:border-black font-sans font-medium"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Password</label>
              <input
                id="input-admin-pass"
                type="password"
                required
                className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-4 py-3 text-black focus:outline-none focus:border-black font-sans font-medium"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </div>

            <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-3 text-[11px] text-amber-600 font-medium">
              🔑 Demo Mode: Click log in instantly with default pre-populated admin credentials.
            </div>

            <button
              id="btn-admin-submit"
              type="submit"
              className="w-full bg-black hover:bg-neutral-900 text-white font-bold py-3.5 rounded-2xl tracking-wider uppercase shadow-md cursor-pointer transition-all"
            >
              SECURE LOG IN
            </button>
          </form>

          <button
            id="btn-admin-cancel-login"
            onClick={onBack}
            className="w-full text-center text-xs text-slate-400 font-bold hover:text-black uppercase cursor-pointer"
          >
            ✕ Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 bg-white animate-fade-in text-black">
      
      {/* Admin Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <button
            id="btn-admin-back"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-black mb-2 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
            <span>Return to shop</span>
          </button>
          <h1 className="text-2xl font-black text-black flex items-center gap-2 uppercase font-sans">
            <Settings className="h-6 w-6 text-[#34C759]" />
            Administrative Infrastructure Console
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Global administrative controls for inventory cataloging, multi-point metrics, coupons deployment, and editorial creativity.
          </p>
        </div>

        {/* Console Mode Selector */}
        <div className="flex gap-1 bg-[#F7F7F7] border border-slate-200 p-1 rounded-2xl self-start overflow-x-auto">
          {[
            { id: "overview", label: "Analytics" },
            { id: "orders", label: `Orders (${orders.length})` },
            { id: "catalog", label: "Catalog & Tags" },
            { id: "creative", label: "Creative Media" },
            { id: "coupons", label: "Vouchers" }
          ].map((tab) => (
            <button
              id={`tab-admin-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex-shrink-0 ${
                activeTab === tab.id
                  ? "bg-black text-white"
                  : "text-slate-500 hover:text-black hover:bg-slate-200/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Main Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#F7F7F7] border border-slate-100 rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Central Gross Volume</span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl font-black font-sans text-black">${(totalSystemSales + 5800).toFixed(2)}</span>
                <span className="text-xs text-[#34C759] font-bold">+28.4%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Live synchronized checkout payloads</p>
            </div>

            <div className="bg-[#F7F7F7] border border-slate-100 rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Fulfillment Queue</span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl font-black font-sans text-amber-500">{pendingFulfillmentCount} Pending</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Automatic label generation pipelines</p>
            </div>

            <div className="bg-[#F7F7F7] border border-slate-100 rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Elite Patrons</span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl font-black font-sans text-black">{customers.length} Accounts</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Bespoke luxury newsletter active</p>
            </div>

            <div className="bg-[#F7F7F7] border border-slate-100 rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Active Vouchers</span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl font-black font-sans text-[#34C759]">{systemCoupons.length} deployed</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Applying global active markdowns</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Visual breakdown chart */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-black text-sm uppercase tracking-wider flex items-center gap-2">
                <BarChart className="h-5 w-5 text-black" />
                Category Distribution Analytics
              </h3>
              <p className="text-xs text-slate-400">Share of revenue and interest indexing across curated home decor departments.</p>

              <div className="flex justify-center py-6 bg-[#F7F7F7]/60 rounded-2xl border border-slate-100">
                <svg viewBox="0 0 100 100" className="w-40 h-40">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E5E5E5" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#34C759" strokeWidth="12" strokeDasharray="251" strokeDashoffset="50" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#000000" strokeWidth="12" strokeDasharray="251" strokeDashoffset="140" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#666666" strokeWidth="12" strokeDasharray="251" strokeDashoffset="200" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#CCCCCC" strokeWidth="12" strokeDasharray="251" strokeDashoffset="225" />
                </svg>
              </div>

              <div className="grid grid-cols-4 gap-2 text-[10px] text-center font-bold">
                <div className="p-2 bg-[#F7F7F7] rounded-xl border border-slate-100">
                  <span className="block h-2 w-2 rounded-full bg-[#34C759] mx-auto mb-1"></span>
                  <span className="text-slate-400">Furniture</span>
                  <span className="block text-black font-sans mt-0.5">45%</span>
                </div>
                <div className="p-2 bg-[#F7F7F7] rounded-xl border border-slate-100">
                  <span className="block h-2 w-2 rounded-full bg-black mx-auto mb-1"></span>
                  <span className="text-slate-400">Lighting</span>
                  <span className="block text-black font-sans mt-0.5">25%</span>
                </div>
                <div className="p-2 bg-[#F7F7F7] rounded-xl border border-slate-100">
                  <span className="block h-2 w-2 rounded-full bg-slate-500 mx-auto mb-1"></span>
                  <span className="text-slate-400">Rugs</span>
                  <span className="block text-black font-sans mt-0.5">20%</span>
                </div>
                <div className="p-2 bg-[#F7F7F7] rounded-xl border border-slate-100">
                  <span className="block h-2 w-2 rounded-full bg-slate-300 mx-auto mb-1"></span>
                  <span className="text-slate-400">Vases & Pots</span>
                  <span className="block text-black font-sans mt-0.5">10%</span>
                </div>
              </div>
            </div>

            {/* Quick action: Global notifications deployer */}
            <div className="lg:col-span-1 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-black text-sm uppercase tracking-wider flex items-center gap-2">
                <BellRing className="h-5 w-5 text-black" /> Push Broadcaster
              </h3>
              <p className="text-xs text-slate-400">Broadcast marketing offers or system updates directly to client dashboards.</p>

              <form onSubmit={handleSendPush} className="space-y-3 font-semibold text-slate-700">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase">Alert Title</label>
                  <input
                    id="input-broadcast-title"
                    type="text"
                    required
                    placeholder="e.g. Amber glass lookbook"
                    className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black font-sans"
                    value={pushTitle}
                    onChange={(e) => setPushTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase">Alert Body Copy</label>
                  <textarea
                    id="textarea-broadcast-desc"
                    rows={3}
                    required
                    placeholder="A cinematic explore of hand-blown pendant lights..."
                    className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black font-sans"
                    value={pushBody}
                    onChange={(e) => setPushBody(e.target.value)}
                  />
                </div>

                <button
                  id="btn-broadcast-submit"
                  type="submit"
                  className="w-full py-2.5 bg-black hover:bg-neutral-900 text-white font-bold text-xs rounded-xl tracking-wider uppercase cursor-pointer shadow-md"
                >
                  BROADCAST ALERT NOW
                </button>
              </form>

              <div className="border-t pt-4 space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Alert Dispatch Logs</span>
                <div className="max-h-24 overflow-y-auto space-y-1 text-[10px] font-medium text-slate-500 font-mono">
                  {pushLog.map((log) => (
                    <div key={log.id} className="p-2 bg-[#F7F7F7] rounded border">
                      <strong>{log.title}</strong>: {log.body}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORDERS MANAGEMENT TAB */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-neutral-950 text-sm uppercase tracking-wider">Client Logistics Queue</h3>
              <p className="text-xs text-slate-400 mt-0.5">Progress secure delivery states or process return refunds immediately.</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead>
                  <tr className="bg-[#F7F7F7] border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                    <th className="p-4">Transaction Code</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Total Price</th>
                    <th className="p-4 text-center">Fulfillment State</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-light">
                        No active client checkout transactions logged.
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="p-4 font-bold text-black">{ord.id}</td>
                        <td className="p-4">
                          <span className="block text-black font-semibold">{ord.shippingAddress.fullName}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{ord.shippingAddress.city}, {ord.shippingAddress.postalCode}</span>
                        </td>
                        <td className="p-4 font-mono font-bold text-black">${ord.total}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-block text-[9px] font-bold uppercase px-2 py-1 rounded font-mono ${
                            ord.status === "Delivered" ? "bg-[#34C759]/10 text-[#34C759]" : "bg-amber-400/10 text-amber-600"
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex gap-2 justify-end">
                            {ord.status === "Pending" && (
                              <button
                                id={`btn-ship-ord-${ord.id}`}
                                onClick={() => {
                                  updateOrderStatus(ord.id, "Shipped");
                                  addNotification("🚚 Courier Dispatched", `Order ${ord.id} status modified to Shipped.`, "system");
                                }}
                                className="px-2.5 py-1.5 bg-black hover:bg-neutral-900 text-white font-bold rounded-lg text-[10px] uppercase cursor-pointer"
                              >
                                Ship Order
                              </button>
                            )}
                            {ord.status === "Shipped" && (
                              <button
                                id={`btn-deliver-ord-${ord.id}`}
                                onClick={() => {
                                  updateOrderStatus(ord.id, "Delivered");
                                  addNotification("✅ Delivery Confirmed", `Order ${ord.id} status modified to Delivered.`, "system");
                                }}
                                className="px-2.5 py-1.5 bg-[#34C759] hover:bg-[#2eb04e] text-white font-bold rounded-lg text-[10px] uppercase cursor-pointer"
                              >
                                Complete Delivery
                              </button>
                            )}

                            {/* Return request approval controller */}
                            {ord.returnRequest && ord.returnRequest.status === "Pending" && (
                              <button
                                id={`btn-approve-refund-${ord.id}`}
                                onClick={() => {
                                  approveReturnRequest(ord.returnRequest!.id);
                                  addNotification("💰 Refund Approved", `Refund processed for order ${ord.id} instantly.`, "system");
                                }}
                                className="px-2.5 py-1.5 bg-[#34C759]/10 hover:bg-[#34C759]/20 text-[#34C759] font-bold rounded-lg text-[10px] uppercase cursor-pointer border border-[#34C759]/20 animate-pulse"
                              >
                                Approve Refund (${ord.returnRequest.refundAmount})
                              </button>
                            )}
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

      {/* CATALOG MANAGEMENT TAB */}
      {activeTab === "catalog" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Product Creator/Editor Form */}
          <div className="lg:col-span-1 bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm space-y-6">
            <div>
              <span className="text-[10px] font-bold text-[#34C759] uppercase tracking-widest font-mono">
                {editingProd ? "✏️ Edit Curation" : "➕ CREATE CURATION"}
              </span>
              <h3 className="text-base font-bold text-black mt-1">
                {editingProd ? `Modify ${editingProd.name}` : "Launch New Luxury Piece"}
              </h3>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 font-semibold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Name</label>
                  <input
                    id="input-new-prod-name"
                    type="text"
                    required
                    placeholder="e.g. Amber Vase"
                    className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Brand</label>
                  <input
                    id="input-new-prod-brand"
                    type="text"
                    required
                    placeholder="e.g. Atelier Nayel"
                    className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Sale ($)</label>
                  <input
                    id="input-new-prod-price"
                    type="number"
                    required
                    className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none font-mono font-bold"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Orig ($)</label>
                  <input
                    id="input-new-prod-orig-price"
                    type="number"
                    required
                    className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-400 focus:outline-none font-mono"
                    value={newProdOrigPrice}
                    onChange={(e) => setNewProdOrigPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Stock</label>
                  <input
                    id="input-new-prod-stock"
                    type="number"
                    required
                    className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none font-mono font-bold"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">Department</label>
                <select
                  id="select-new-prod-category"
                  className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none"
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Unsplash Image URL</label>
                <input
                  id="input-new-prod-image"
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none"
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Description Overview</label>
                <textarea
                  id="textarea-new-prod-desc"
                  rows={3}
                  placeholder="Materials, custom designs, etc..."
                  className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none"
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <button
                  id="btn-add-product-submit"
                  type="submit"
                  className="flex-1 py-3 bg-black hover:bg-neutral-900 text-white font-bold text-xs rounded-xl tracking-wider uppercase cursor-pointer"
                >
                  {editingProd ? "Save Changes" : "Deploy Curation"}
                </button>
                {editingProd && (
                  <button
                    id="btn-cancel-edit"
                    type="button"
                    onClick={() => {
                      setEditingProd(null);
                      setNewProdName("");
                      setNewProdBrand("");
                      setNewProdPrice("120");
                      setNewProdOrigPrice("160");
                      setNewProdStock("20");
                      setNewProdImage("");
                      setNewProdDesc("");
                    }}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs rounded-xl uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right: Existing Products list with duplication, CRUD, and departments */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Category Departments setup */}
            <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm space-y-4">
              <h3 className="font-bold text-black text-sm uppercase tracking-wider">Configure Categories</h3>
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  id="input-new-cat"
                  type="text"
                  required
                  placeholder="e.g. Bedding & Linen"
                  className="flex-1 bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <button
                  id="btn-add-cat-submit"
                  type="submit"
                  className="bg-black hover:bg-neutral-900 text-white font-bold text-xs px-4 rounded-xl cursor-pointer"
                >
                  Create
                </button>
              </form>

              <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500 font-mono">
                {categories.map((cat) => (
                  <span key={cat} className="bg-[#F7F7F7] border px-3 py-1 rounded-lg text-black">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Products grid lists with full controllers */}
            <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm space-y-4">
              <h3 className="font-bold text-black text-sm uppercase tracking-wider">Catalog Inventory List ({products.length})</h3>
              
              <div className="space-y-3 max-h-[25rem] overflow-y-auto pr-1">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 justify-between p-3.5 bg-[#F7F7F7]/60 border rounded-2xl text-xs hover:bg-neutral-50">
                    <div className="flex items-center gap-3">
                      <img src={p.image} className="w-10 h-10 object-cover rounded-lg" />
                      <div>
                        <span className="font-bold text-black block truncate max-w-[12rem]">{p.name}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{p.brand} • <strong className="font-mono text-[#34C759]">${p.price}</strong> • Stock: {p.stock}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        id={`btn-edit-prod-${p.id}`}
                        onClick={() => handleEditProductClick(p)}
                        className="p-1.5 text-slate-400 hover:text-black cursor-pointer"
                        title="Edit specifications"
                      >
                        ✏️
                      </button>
                      <button
                        id={`btn-dup-prod-${p.id}`}
                        onClick={() => handleDuplicateProduct(p)}
                        className="p-1.5 text-slate-400 hover:text-black cursor-pointer"
                        title="Duplicate model"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        id={`btn-del-prod-${p.id}`}
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer"
                        title="Delete from catalog"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CREATIVE MEDIA CONTENT MANAGEMENT TAB */}
      {activeTab === "creative" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          
          {/* Hero Banners Management */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-6">
            <div>
              <span className="text-[10px] font-bold text-[#34C759] uppercase tracking-widest block font-mono">MEDIA DEPLOYER</span>
              <h3 className="text-base font-bold text-black mt-1">Staging Hero Banners</h3>
            </div>

            <form onSubmit={handleAddBanner} className="space-y-3 font-semibold text-slate-700">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Banner Title</label>
                <input
                  id="input-new-banner-title"
                  type="text"
                  required
                  placeholder="e.g. High-Contrast Autumn Woods"
                  className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none"
                  value={newBannerTitle}
                  onChange={(e) => setNewBannerTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Unsplash Wallpaper URL</label>
                <input
                  id="input-new-banner-image"
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none"
                  value={newBannerImage}
                  onChange={(e) => setNewBannerImage(e.target.value)}
                />
              </div>
              <button
                id="btn-add-banner-submit"
                type="submit"
                className="w-full py-2 bg-black hover:bg-neutral-900 text-white font-bold text-xs rounded-xl tracking-wider uppercase cursor-pointer"
              >
                Deploy Banner Creative
              </button>
            </form>

            <div className="space-y-3">
              {banners.map((ban) => (
                <div key={ban.id} className="relative rounded-2xl overflow-hidden aspect-[21/9] border bg-slate-100 flex items-center p-4">
                  <img src={ban.image} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                  <div className="relative z-10 text-black max-w-xs">
                    <span className="text-[8px] font-bold bg-white text-black px-2 py-0.5 rounded uppercase font-mono shadow">ACTIVE HERO</span>
                    <h4 className="text-xs font-bold leading-tight mt-1 truncate">{ban.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials Lookbook Videos Management */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-6">
            <div>
              <span className="text-[10px] font-bold text-[#34C759] uppercase tracking-widest block font-mono">CINEMATIC STAGES</span>
              <h3 className="text-base font-bold text-black mt-1">Testimonials Lookbook Videos</h3>
            </div>

            <form onSubmit={handleAddTestimonial} className="space-y-3 font-semibold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Client Name</label>
                  <input
                    id="input-test-client"
                    type="text"
                    required
                    placeholder="e.g. Marc Anthony"
                    className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none"
                    value={newTestimonialClient}
                    onChange={(e) => setNewTestimonialClient(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Video Title / Topic</label>
                  <input
                    id="input-test-title"
                    type="text"
                    required
                    placeholder="Staging Oak centerpieces"
                    className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none"
                    value={newTestimonialTitle}
                    onChange={(e) => setNewTestimonialTitle(e.target.value)}
                  />
                </div>
              </div>
              <button
                id="btn-add-test-submit"
                type="submit"
                className="w-full py-2 bg-black hover:bg-neutral-900 text-white font-bold text-xs rounded-xl tracking-wider uppercase cursor-pointer"
              >
                Launch Video Testimonial
              </button>
            </form>

            <div className="space-y-3 max-h-[14rem] overflow-y-auto">
              {testimonials.map((test) => (
                <div key={test.id} className="flex gap-3 items-center p-3.5 bg-[#F7F7F7]/60 border rounded-2xl text-xs hover:bg-neutral-50">
                  <div className="p-2 bg-neutral-100 rounded-lg flex items-center justify-center">
                    🎥
                  </div>
                  <div>
                    <span className="font-bold text-black block truncate">{test.videoTitle}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">By {test.client} • {test.views} views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* VOUCHERS/PROMOS MANAGEMENT TAB */}
      {activeTab === "coupons" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          
          {/* Coupon Deployer Form */}
          <div className="lg:col-span-1 bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm space-y-6">
            <div>
              <span className="text-[10px] font-bold text-[#34C759] uppercase tracking-widest block font-mono">MARKDOWNS</span>
              <h3 className="text-base font-bold text-black mt-1">Deploy Promo Coupon</h3>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 font-semibold text-slate-700">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">Voucher Code</label>
                <input
                  id="input-new-coupon-code"
                  type="text"
                  required
                  placeholder="e.g. LUXURY30"
                  className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none uppercase font-mono font-bold"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block">Percent Savings (%)</label>
                  <input
                    id="input-new-coupon-val"
                    type="number"
                    required
                    className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none font-mono font-bold"
                    value={couponVal}
                    onChange={(e) => setCouponVal(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block">Min Spend ($)</label>
                  <input
                    id="input-new-coupon-min"
                    type="number"
                    required
                    className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none font-mono font-bold"
                    value={couponMin}
                    onChange={(e) => setCouponMin(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">Description Overview</label>
                <textarea
                  id="textarea-new-coupon-desc"
                  rows={2}
                  required
                  placeholder="Details of the markdown campaign..."
                  className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none"
                  value={couponDesc}
                  onChange={(e) => setCouponDesc(e.target.value)}
                />
              </div>

              <button
                id="btn-add-coupon-submit"
                type="submit"
                className="w-full py-2.5 bg-black hover:bg-neutral-900 text-white font-bold text-xs rounded-xl tracking-wider uppercase cursor-pointer"
              >
                DEPLOY VOUCHER NOW
              </button>
            </form>
          </div>

          {/* Deployed Vouchers list */}
          <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm space-y-4">
            <h3 className="font-bold text-black text-sm uppercase tracking-wider">Active Promotional Vouchers ({systemCoupons.length})</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {systemCoupons.map((cp) => (
                <div key={cp.code} className="p-4 bg-[#F7F7F7]/60 border rounded-2xl text-xs flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="font-mono font-bold text-black text-sm bg-white border px-2 py-0.5 rounded">{cp.code}</span>
                    <span className="text-[10px] text-slate-400 block font-bold font-mono uppercase mt-1">Discount: {cp.value}% • Min spend: ${cp.minSpend}</span>
                    <p className="text-[10px] text-slate-500 leading-normal font-sans mt-0.5">{cp.description}</p>
                  </div>
                  <button
                    id={`btn-del-coupon-${cp.code}`}
                    onClick={() => {
                      setSystemCoupons((prev) => prev.filter((c) => c.code !== cp.code));
                      addNotification("🗑️ Coupon Removed", `Voucher ${cp.code} deleted successfully.`, "system");
                    }}
                    className="text-slate-400 hover:text-red-500 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
