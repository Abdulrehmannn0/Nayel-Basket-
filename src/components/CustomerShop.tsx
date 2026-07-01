/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Product, CartItem, Address, Order } from "../types";
import { ProductCard } from "./ProductCard";
import { ProductDetail } from "./ProductDetail";
import { AIChat } from "./AIChat";
import { 
  isNotificationSupported,
  requestNotificationPermission,
  getFcmToken,
  onForegroundMessage,
  logAnalyticsEvent,
  logCrashlyticsError
} from "../lib/firebase";
import { 
  Search, 
  MapPin, 
  CreditCard, 
  Clock, 
  Trash, 
  Check, 
  Sparkles, 
  HelpCircle,
  AlertCircle,
  Play,
  Award,
  BookOpen,
  Plus,
  Compass,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Tag,
  Bell,
  Copy,
  Bug,
  Activity,
  Smartphone
} from "lucide-react";

interface CustomerShopProps {
  activeSection: "home" | "categories" | "wishlist" | "cart" | "profile" | "ai";
  setActiveSection: (sec: "home" | "categories" | "wishlist" | "cart" | "profile" | "ai") => void;
  onSelectSeller: () => void;
  onSelectAdmin: () => void;
}

export const CustomerShop: React.FC<CustomerShopProps> = ({ 
  activeSection, 
  setActiveSection,
  onSelectSeller,
  onSelectAdmin
}) => {
  const { 
    products, 
    cart, 
    addToCart, 
    removeFromCart, 
    updateCartQuantity, 
    wishlist, 
    toggleWishlist, 
    addresses, 
    addAddress,
    removeAddress,
    orders, 
    placeOrder, 
    cancelOrder, 
    submitReturnRequest,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    walletBalance,
    addWalletFunds,
    rewardPoints,
    recentlyViewed,
    addToRecentlyViewed,
    addNotification
  } = useApp();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [homeCollectionTab, setHomeCollectionTab] = useState<"trending" | "bestsellers" | "newarrivals" | "editors">("trending");
  const [activeProfileTab, setActiveProfileTab] = useState<"dashboard" | "orders" | "wishlist" | "addresses" | "coupons" | "ambassador" | "concierge" | "notifications" | "security">("dashboard");

  // Splash and Customer Authentication state
  const [showSplash, setShowSplash] = useState(true);
  const [customerUser, setCustomerUser] = useState<any>(() => {
    const saved = localStorage.getItem("nb_customer_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [authTab, setAuthTab] = useState<"signin" | "signup" | "forgot">("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authRememberMe, setAuthRememberMe] = useState(true);
  const [authReferralCode, setAuthReferralCode] = useState("");
  
  // Biometric/Passkeys simulated state
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [biometricPromptType, setBiometricPromptType] = useState<"face" | "fingerprint">("face");
  const [isBiometricRegistered, setIsBiometricRegistered] = useState(() => {
    return localStorage.getItem("nb_biometric_registered") === "true";
  });

  // Forgot Password state
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotOtpInput, setForgotOtpInput] = useState("");
  const [forgotNewPass, setForgotNewPass] = useState("");

  // Device & Sessions history states
  const [sessionDevices, setSessionDevices] = useState<any[]>(() => {
    const saved = localStorage.getItem("nb_session_devices");
    if (saved) return JSON.parse(saved);
    return [
      { id: "dev_1", name: "iPhone 15 Pro (Safari)", location: "San Francisco, USA", ip: "192.168.1.104", current: true, date: "Active Session" },
      { id: "dev_2", name: "Windows 11 (Chrome Desktop)", location: "New York, USA", ip: "172.56.21.90", current: false, date: "2026-06-30 18:24" },
      { id: "dev_3", name: "iPad Pro (iOS App Container)", location: "London, UK", ip: "84.22.109.11", current: false, date: "2026-06-28 09:12" }
    ];
  });
  const [loginHistory, setLoginHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem("nb_login_history");
    if (saved) return JSON.parse(saved);
    return [
      { date: "2026-07-01 10:41", device: "iPhone 15 Pro", location: "San Francisco, USA", status: "Success (Biometrics)" },
      { date: "2026-06-30 18:24", device: "Windows 11 (Chrome Desktop)", location: "New York, USA", status: "Success (Password)" },
      { date: "2026-06-29 15:30", device: "iPhone 15 Pro", location: "San Francisco, USA", status: "Success (Passkey)" },
      { date: "2026-06-28 09:12", device: "iPad Pro", location: "London, UK", status: "Success (Password)" }
    ];
  });

  // FCM, Analytics & Crashlytics States
  const [fcmToken, setFcmTokenState] = useState<string>(() => localStorage.getItem("nb_fcm_token") || "");
  const [notiPermission, setNotiPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [notificationLogs, setNotificationLogs] = useState<any[]>([]);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>(["[System] Telemetry initialized.", "[System] Supabase is primary backend."]);
  const [customEvent, setCustomEvent] = useState("");
  const [customEventParams, setCustomEventParams] = useState("");

  // Checkout states
  const [checkoutAddressId, setCheckoutAddressId] = useState(addresses[0]?.id || "");
  const [checkoutPayment, setCheckoutPayment] = useState<"Card" | "UPI" | "Razorpay" | "Stripe" | "COD" | "Wallet">("Card");
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);

  // New Address state
  const [newAddrName, setNewAddrName] = useState("");
  const [newAddrPhone, setNewAddrPhone] = useState("");
  const [newAddrStreet, setNewAddrStreet] = useState("");
  const [newAddrCity, setNewAddrCity] = useState("");
  const [newAddrState, setNewAddrState] = useState("");
  const [newAddrZip, setNewAddrZip] = useState("");

  // Orders details overlay
  const [viewedOrder, setViewedOrder] = useState<Order | null>(null);

  // Return request state
  const [returnProdId, setReturnProdId] = useState("");
  const [returnReason, setReturnReason] = useState("Defective Item");
  const [returnDetails, setReturnDetails] = useState("");
  const [showReturnForm, setShowReturnForm] = useState(false);

  // Splash Screen timeout trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      setTelemetryLogs((prev) => [...prev, "[System] Customer Splash complete. Rendering Main Portal."]);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Dispatch custom event when customerUser state changes to keep Navbar in sync
  useEffect(() => {
    window.dispatchEvent(new Event("customer-user-changed"));
  }, [customerUser]);

  // Initialize Firebase Messaging foreground listeners
  useEffect(() => {
    // 1. Log initialization telemetry
    setTelemetryLogs((prev) => [...prev, `[Firebase] Foreground listener registered successfully.`]);

    // 2. Register real FCM foreground listener
    const unsubscribe = onForegroundMessage((payload) => {
      const title = payload.notification?.title || "Nayel Basket Update";
      const body = payload.notification?.body || "New curation has arrived!";
      
      // Update UI Logs
      setNotificationLogs((prev) => [
        {
          id: Date.now().toString(),
          title,
          body,
          timestamp: new Date().toLocaleTimeString(),
          type: "foreground"
        },
        ...prev
      ]);

      // Add to global notifications drop down
      addNotification(title, body, "system");

      // Log Telemetry
      setTelemetryLogs((prev) => [
        ...prev,
        `[FCM Broadcast] Received Foreground Notification: "${title}"`
      ]);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Categories catalog list
  const categoriesList = [
    "All", 
    "Living Room", 
    "Bedroom", 
    "Dining", 
    "Kitchen", 
    "Office", 
    "Bathroom", 
    "Lighting", 
    "Wall Decor", 
    "Plants", 
    "Furniture", 
    "Storage", 
    "Luxury Accessories"
  ];

  // Filter products based on search and category
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    if (applyCoupon(couponCodeInput)) {
      setCouponCodeInput("");
      addNotification("🎫 Coupon Applied", "Exquisite promotional markdown added to checkout calculations.", "promo");
    } else {
      alert("Invalid coupon code. Try NAYEL20 or DECOR15.");
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrName.trim() || !newAddrPhone.trim() || !newAddrStreet.trim() || !newAddrCity.trim()) {
      alert("Please populate all necessary fields.");
      return;
    }
    const newAddr: Address = {
      id: `addr_${Date.now()}`,
      fullName: newAddrName,
      phone: newAddrPhone,
      streetAddress: newAddrStreet,
      city: newAddrCity,
      state: newAddrState || "CA",
      postalCode: newAddrZip || "94101",
      isDefault: addresses.length === 0
    };
    addAddress(newAddr);
    setCheckoutAddressId(newAddr.id);
    setShowAddressForm(false);
    setNewAddrName("");
    setNewAddrPhone("");
    setNewAddrStreet("");
    setNewAddrCity("");
    setNewAddrState("");
    setNewAddrZip("");
    addNotification("🏠 Address Added", "New delivery point registered successfully.", "system");
  };

  const handlePlaceOrder = () => {
    if (!customerUser) {
      addNotification("🔑 Login Required", "Please sign in or create an account to place orders securely.", "system");
      setActiveSection("profile");
      setAuthTab("signin");
      return;
    }

    const matchedAddress = addresses.find((a) => a.id === checkoutAddressId) || addresses[0];
    if (!matchedAddress) {
      alert("Please specify a valid delivery address.");
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    let discount = 0;
    if (appliedCoupon) {
      discount = appliedCoupon.type === "percentage" 
        ? Math.floor(subtotal * (appliedCoupon.value / 100)) 
        : appliedCoupon.value;
    }
    const tax = Math.round((subtotal - discount) * 0.08);
    const total = subtotal - discount + tax;

    if (checkoutPayment === "Wallet" && walletBalance < total) {
      alert("Insufficient balance in your Nayel Basket Wallet. Please top up funds first.");
      return;
    }

    const placed = placeOrder(matchedAddress, checkoutPayment);
    setViewedOrder(placed);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    addToRecentlyViewed(product);
  };

  // Render Splash screen on application launch
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[100] bg-white text-black flex flex-col items-center justify-center animate-fade-in font-sans">
        <div className="flex flex-col items-center max-w-xs space-y-6 text-center">
          {/* Elegant Luxury Nayel Basket Monogram */}
          <div className="relative flex items-center justify-center w-24 h-24 bg-black rounded-[2rem] text-white shadow-2xl animate-pulse-scale">
            <span className="text-4xl font-black tracking-widest font-sans">N</span>
            <div className="absolute inset-0 border border-slate-200/20 rounded-[2rem] animate-ping opacity-25"></div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-lg font-black tracking-[0.2em] text-neutral-900 uppercase animate-fade-in">
              NAYEL BASKET
            </h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-[0.15em] uppercase">
              Bespoke Artisanal Home Decor
            </p>
          </div>

          {/* Luxury Loading Progress Bar */}
          <div className="w-40 h-0.5 bg-neutral-100 rounded-full overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full bg-black rounded-full animate-loading-bar w-full"></div>
          </div>

          <span className="text-[8px] font-mono text-slate-400 tracking-wider block pt-2">
            SECURE CLIENT PORTAL v4.1 • EST. 2026
          </span>
        </div>
      </div>
    );
  }

  // Render Product detail view if active
  if (selectedProduct) {
    return (
      <ProductDetail 
        product={selectedProduct} 
        onBack={() => setSelectedProduct(null)} 
        onSelectProduct={(p) => handleProductSelect(p)}
      />
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      
      {/* HOME PAGE SECTION */}
      {activeSection === "home" && (
        <div className="space-y-16 pb-16 animate-fade-in bg-white">
          
          {/* Hero Banner Section (Airbnb / Zara Vibe) */}
          <div className="relative rounded-[2rem] overflow-hidden bg-neutral-950 aspect-[16/10] md:aspect-[21/9] flex items-center justify-start p-8 md:p-16 border border-neutral-900 shadow-xl group">
            <img
              src="https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1400&q=80"
              alt="Premium Living space"
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-[1.02] transition-transform duration-[10s] ease-out"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent"></div>
            
            <div className="relative space-y-6 max-w-xl z-10 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#34C759]/10 border border-[#34C759]/20 rounded-full text-[10px] font-bold text-[#34C759] tracking-wider uppercase">
                <Sparkles className="h-3 w-3 animate-pulse text-[#34C759]" />
                GRAND OPENING CELEBRATION
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight font-sans uppercase">
                Artisanal <span className="text-[#34C759]">Luxury</span> Home Decor
              </h1>
              <p className="text-sm md:text-base text-neutral-300 leading-relaxed max-w-md font-sans font-light">
                Meticulously crafted furniture, hand-blown amber lighting, and organic ceramic vessels designed by world-class artisans. Apply code <strong className="text-[#34C759] font-mono">NAYEL20</strong> for 20% off.
              </p>
              <div className="flex gap-4 pt-2">
                <button
                  id="btn-hero-explore"
                  onClick={() => {
                    setSelectedCategory("All");
                    setActiveSection("categories");
                  }}
                  className="bg-[#34C759] hover:bg-[#2eb04e] text-white px-6 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#34C759]/25 cursor-pointer"
                >
                  Explore Collection
                </button>
              </div>
            </div>
          </div>

          {/* CONTINUE SHOPPING / RECENTLY VIEWED */}
          {recentlyViewed && recentlyViewed.length > 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-[#34C759] uppercase tracking-widest font-mono block">CONTINUE SHOPPING</span>
                  <h3 className="text-xl font-bold text-neutral-950 tracking-tight font-sans">Recently Viewed Curations</h3>
                </div>
                <button
                  id="btn-clear-recent"
                  onClick={() => {
                    localStorage.removeItem("nb_recently_viewed");
                    addNotification("🧹 History Cleared", "Your recently viewed history has been reset.", "system");
                    window.location.reload();
                  }}
                  className="text-xs text-slate-400 hover:text-black cursor-pointer underline"
                >
                  Clear History
                </button>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {recentlyViewed.map((prod) => (
                  <div
                    id={`recently-viewed-card-${prod.id}`}
                    key={prod.id}
                    onClick={() => handleProductSelect(prod)}
                    className="flex-shrink-0 w-44 space-y-2 cursor-pointer group"
                  >
                    <div className="aspect-square bg-[#F7F7F7] rounded-2xl overflow-hidden border border-slate-100 relative">
                      <img src={prod.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">{prod.brand}</span>
                      <span className="text-xs font-semibold text-neutral-950 block truncate group-hover:text-[#34C759] transition-colors">{prod.name}</span>
                      <span className="text-xs font-bold text-neutral-950 block mt-0.5">${prod.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shop by Department */}
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <span className="text-[10px] font-bold text-[#34C759] uppercase tracking-widest font-mono block">DEPARTMENTS</span>
              <h3 className="text-2xl font-bold text-neutral-950 tracking-tight font-sans">Shop by Collection</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categoriesList.map((cat) => (
                <button
                  id={`btn-home-cat-${cat}`}
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setActiveSection("categories");
                  }}
                  className="group relative p-6 bg-[#F7F7F7] hover:bg-neutral-900 border border-slate-100 rounded-3xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center space-y-2 aspect-square"
                >
                  <Compass className="h-6 w-6 text-slate-400 group-hover:text-[#34C759] transition-colors" />
                  <span className="text-xs font-semibold text-neutral-900 group-hover:text-white transition-colors">{cat === "All" ? "✨ Discover All" : cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* FEATURED COLLECTIONS SUBTABS */}
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-[#34C759] uppercase tracking-widest font-mono block">SELECTED BLUEPRINTS</span>
                <h3 className="text-2xl font-bold text-neutral-950 tracking-tight font-sans">Featured Collections</h3>
              </div>
              <div className="flex gap-2 bg-slate-100/80 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto scrollbar-hide">
                {[
                  { id: "trending", label: "🔥 Trending" },
                  { id: "bestsellers", label: "⭐️ Best Sellers" },
                  { id: "newarrivals", label: "✨ New Arrivals" },
                  { id: "editors", label: "💼 Editor's Choice" }
                ].map((tab) => (
                  <button
                    id={`btn-home-tab-${tab.id}`}
                    key={tab.id}
                    onClick={() => setHomeCollectionTab(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 cursor-pointer ${
                      homeCollectionTab === tab.id
                        ? "bg-white text-black shadow-sm"
                        : "text-slate-500 hover:text-black"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products
                .filter((p) => {
                  if (homeCollectionTab === "trending") return true;
                  if (homeCollectionTab === "bestsellers") return p.rating >= 4.8;
                  if (homeCollectionTab === "newarrivals") return p.id === "prod_5" || p.id === "prod_6" || p.id === "prod_3";
                  if (homeCollectionTab === "editors") return p.id === "prod_1" || p.id === "prod_4" || p.id === "prod_2";
                  return true;
                })
                .slice(0, 6)
                .map((prod) => (
                  <ProductCard key={prod.id} product={prod} onSelect={handleProductSelect} />
                ))}
            </div>
          </div>

          {/* SHOP BY ROOM BENTO GRID */}
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <span className="text-[10px] font-bold text-[#34C759] uppercase tracking-widest font-mono block">ARCHITECTURAL PLANNING</span>
              <h3 className="text-2xl font-bold text-neutral-950 tracking-tight font-sans">Shop By Room</h3>
              <p className="text-xs text-slate-400 mt-1">Curated styling blueprints coordinated by department and residential flow.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: "Living Room", img: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80", count: "14 pieces" },
                { name: "Bedroom", img: "https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?auto=format&fit=crop&w=600&q=80", count: "8 pieces" },
                { name: "Dining Room", img: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=600&q=80", count: "11 pieces" },
                { name: "Office Study", img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80", count: "6 pieces" }
              ].map((room) => (
                <div
                  id={`room-card-${room.name.replace(/\s+/g, '-').toLowerCase()}`}
                  key={room.name}
                  onClick={() => {
                    setSelectedCategory("All");
                    setActiveSection("categories");
                  }}
                  className="relative rounded-3xl overflow-hidden aspect-[4/5] border border-slate-100 shadow-sm cursor-pointer group"
                >
                  <img src={room.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-5">
                    <span className="text-[9px] font-bold text-[#34C759] font-mono tracking-widest uppercase mb-1">{room.count}</span>
                    <span className="text-base font-bold text-white tracking-wide uppercase">{room.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SHOP BY DESIGN STYLE */}
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <span className="text-[10px] font-bold text-[#34C759] uppercase tracking-widest font-mono block">ESTHETIQUE DESIGN</span>
              <h3 className="text-2xl font-bold text-neutral-950 tracking-tight font-sans">Shop by Design Style</h3>
              <p className="text-xs text-slate-400 mt-1">Filter our catalog based on world-class residential architecture genres.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { name: "Japandi Harmony", desc: "Organic oak & chalk clay", filter: "Ceramic" },
                { name: "Minimalist Slate", desc: "Quiet luxury, clean geometry", filter: "Minimalist" },
                { name: "Mid-Century", desc: "Tapered legs, rich walnut", filter: "Furniture" },
                { name: "Parisian Chic", desc: "Burnished brass & velvet", filter: "Brass" },
                { name: "Rustic Craft", desc: "Cozy fibers & woven wool", filter: "Woolen" }
              ].map((style) => (
                <div
                  id={`style-card-${style.name.replace(/\s+/g, '-').toLowerCase()}`}
                  key={style.name}
                  onClick={() => {
                    setSearchQuery(style.filter);
                    setActiveSection("categories");
                    addNotification("🎨 Filter Applied", `Curated for: ${style.name}`, "system");
                  }}
                  className="bg-[#F7F7F7] hover:bg-neutral-900 group p-6 rounded-3xl border border-slate-100 cursor-pointer transition-all duration-300 flex flex-col justify-between aspect-[4/3]"
                >
                  <div className="h-2 w-2 rounded-full bg-[#34C759] group-hover:scale-150 transition-transform"></div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900 group-hover:text-white block">{style.name}</span>
                    <span className="text-[9px] text-slate-400 group-hover:text-slate-300 block mt-1">{style.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Luxury Offers banner */}
          <div className="bg-[#F7F7F7] border border-slate-100 rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
            <div className="space-y-4 max-w-lg">
              <span className="text-[10px] font-bold text-[#34C759] uppercase tracking-widest font-mono">Exclusive Markdown</span>
              <h2 className="text-3xl font-bold text-black font-sans leading-tight">Elevate Your Living Sanctuary</h2>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Save $15 instantly on orders above $50 using discount voucher <strong className="text-black font-mono">DECOR15</strong>. Complimentary shipping applied across continental borders.
              </p>
            </div>
            <div className="flex gap-3 bg-white border border-slate-200 p-4 rounded-3xl items-center font-mono text-sm shadow-sm w-full md:w-auto justify-between">
              <div>
                <span className="text-[9px] text-slate-400 block font-sans font-bold uppercase">Promo Coupon</span>
                <span className="font-bold text-black font-mono">DECOR15</span>
              </div>
              <button
                id="btn-copy-promo-banner"
                onClick={() => {
                  navigator.clipboard.writeText("DECOR15");
                  addNotification("🎫 Coupon Copied", "Voucher code copied to clipboard.", "promo");
                }}
                className="bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider cursor-pointer"
              >
                COPY
              </button>
            </div>
          </div>

          {/* Interactive Cinematic LOOKBOOK PRODUCT VIDEOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <div className="bg-neutral-950 rounded-[2rem] border border-neutral-900 p-8 md:p-12 text-center space-y-6 relative overflow-hidden aspect-[4/3] flex flex-col justify-center items-center group">
              <video
                src="https://assets.mixkit.co/videos/preview/mixkit-decorating-a-warm-living-room-41561-large.mp4"
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-[6s]"
                autoPlay
                loop
                muted
                playsInline
              />
              <div className="absolute inset-0 bg-neutral-950/40"></div>
              <div className="relative space-y-4 max-w-sm z-10 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-bold text-white tracking-widest uppercase">
                  <Play className="h-3 w-3 fill-white text-white" /> LOOKBOOK CINEMATIC
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight uppercase">Artisanal Spaces In Motion</h2>
                <p className="text-xs text-neutral-300 leading-relaxed font-light">
                  Witness the tactile organic finish of kao-lin clay vases, burnished royal brass candle holders, and European Oak furniture in real living coordinates.
                </p>
              </div>
            </div>

            <div className="bg-[#F7F7F7] border border-slate-100 p-8 md:p-12 rounded-[2rem] flex flex-col justify-center space-y-6">
              <span className="text-[10px] font-bold text-[#34C759] uppercase tracking-widest font-mono block">Client Endorsements</span>
              <h2 className="text-2xl font-bold text-black font-sans">Trusted by Designers</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our design blueprints have been verified across elegant residential quarters. Read real logs from leading architectural curators.
              </p>
              
              <div className="space-y-4">
                {[
                  { name: "Sophia Loren", role: "Principal Interior Architect", comment: "The Aurora ceramic vase trio is an absolute masterpiece. The chalk matte mineral glaze is beautifully tactile, reflecting natural light organically. Incredible curation." },
                  { name: "Marc Anthony", role: "Aesthetic Enthusiast", comment: "Stunning white oak coffee table. Assembly was pre-machined to perfection, taking under 10 minutes. The wood smells rich of natural hardwax protective oils." }
                ].map((test, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm space-y-2">
                    <p className="text-xs text-slate-600 leading-relaxed italic">"{test.comment}"</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-xs text-black block">{test.name}</span>
                        <span className="text-[9px] text-slate-400 font-medium block">{test.role}</span>
                      </div>
                      <span className="text-[9px] bg-[#34C759]/10 text-[#34C759] px-2 py-0.5 rounded font-mono font-bold">VERIFIED GUEST</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* INTERIOR INSPIRATION GALLERY */}
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <span className="text-[10px] font-bold text-[#34C759] uppercase tracking-widest font-mono block">GALLERIA D'INSPIRATION</span>
              <h3 className="text-2xl font-bold text-neutral-950 tracking-tight font-sans">Interior Inspiration Gallery</h3>
              <p className="text-xs text-slate-400 mt-1">Glimpse beautiful spaces designed by Nayel Basket patrons worldwide.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { title: "Quiet Solitude Lounge", img: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80", style: "Japandi Modern" },
                { title: "Daylight Dining Chamber", img: "https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&w=600&q=80", style: "Quiet Luxury" },
                { title: "Warm Amber Study", img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80", style: "Mid-Century Modern" }
              ].map((item, idx) => (
                <div key={idx} className="relative rounded-3xl overflow-hidden aspect-square group border border-slate-100 shadow-sm">
                  <img src={item.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                    <span className="text-[9px] font-bold text-[#34C759] font-mono uppercase">{item.style}</span>
                    <span className="text-xs font-bold text-white tracking-wide">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PREMIUM EDITORIAL BLOGS */}
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <span className="text-[10px] font-bold text-[#34C759] uppercase tracking-widest font-mono block">LITERARY COMPASS</span>
              <h3 className="text-2xl font-bold text-neutral-950 tracking-tight font-sans">Nayel Editorial Journals</h3>
              <p className="text-xs text-slate-400 mt-1">Philosophies of slow living, balance, and spatial poetry.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: "The Subtle Alchemy of Organic Textures",
                  excerpt: "How pairing raw chalk clay vessels with hand-burnished heavy brass anchors light and shadow organically inside high-ceiling living chambers.",
                  readTime: "4 mins read",
                  img: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=600&q=80"
                },
                {
                  title: "Symmetry & Silence: Crafting the Perfect Bed Chamber",
                  excerpt: "An architectural guide to wood grain alignment, warm amber dimming fixtures, and natural linen density to cultivate profound recovery.",
                  readTime: "6 mins read",
                  img: "https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?auto=format&fit=crop&w=600&q=80"
                }
              ].map((blog, idx) => (
                <div key={idx} className="group space-y-4 cursor-pointer">
                  <div className="aspect-[16/10] overflow-hidden rounded-3xl border border-slate-100 bg-[#F7F7F7]">
                    <img src={blog.img} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>Nayel Curators</span>
                      <span>{blog.readTime}</span>
                    </div>
                    <h4 className="font-bold text-base text-neutral-950 group-hover:text-[#34C759] transition-colors">{blog.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">{blog.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* CATEGORIES SECTION (PRODUCT CATALOG BROWSER) */}
      {activeSection === "categories" && (
        <div className="space-y-8 pb-16 animate-fade-in">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-950 tracking-tight uppercase">Curated Catalog</h1>
              <p className="text-xs text-slate-400 mt-0.5">Deploy elite spacing curation inside your home.</p>
            </div>

            {/* Premium Search box */}
            <div className="relative w-full md:w-80">
              <input
                id="input-catalog-search"
                type="text"
                placeholder="Search premium pieces..."
                className="w-full bg-[#F7F7F7] border border-slate-200 rounded-2xl px-4 py-3 pl-10 text-xs text-black focus:outline-none focus:border-black font-sans"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Department selection row */}
          <div className="flex gap-2.5 overflow-x-auto pb-1 border-b border-slate-100">
            {categoriesList.map((cat) => (
              <button
                id={`btn-cat-filter-${cat}`}
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? "text-black border-b-2 border-[#34C759] font-bold"
                    : "text-slate-500 hover:text-black"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-slate-400 text-sm">No curated home decor products match your search/filters.</p>
              <button
                id="btn-reset-filters"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="text-xs text-[#34C759] font-bold underline cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} onSelect={handleProductSelect} />
              ))}
            </div>
          )}

        </div>
      )}

      {/* WISHLIST SECTION */}
      {activeSection === "wishlist" && (
        <div className="space-y-8 pb-16 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-neutral-950 tracking-tight uppercase">My Wishlist Favorites</h1>
            <p className="text-xs text-slate-400 mt-0.5">Your bespoke saved styling configurations.</p>
          </div>

          {wishlist.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <p className="text-slate-400 text-sm">Your wishlist is currently empty. Start saving pieces you love!</p>
              <button
                id="btn-wishlist-explore"
                onClick={() => setActiveSection("categories")}
                className="bg-black text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Explore Curations
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlist.map((p) => (
                <ProductCard key={p.id} product={p} onSelect={handleProductSelect} />
              ))}
            </div>
          )}

        </div>
      )}

      {/* CART & CHECKOUT SECTIONS */}
      {activeSection === "cart" && (
        <div className="space-y-8 pb-16 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-neutral-950 tracking-tight uppercase">My Shopping Bag</h1>
            <p className="text-xs text-slate-400 mt-0.5">Review items in your bespoke order packet.</p>
          </div>

          {cart.length === 0 && !viewedOrder ? (
            <div className="text-center py-16 space-y-4">
              <p className="text-slate-400 text-sm">Your shopping bag is currently empty.</p>
              <button
                id="btn-cart-explore"
                onClick={() => setActiveSection("home")}
                className="bg-black text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          ) : viewedOrder ? (
            /* ORDER SUCCESS VIEW */
            <div className="bg-[#34C759]/5 border border-[#34C759]/20 rounded-[2rem] p-8 max-w-xl mx-auto text-center space-y-6 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-[#34C759]/15 flex items-center justify-center mx-auto text-[#34C759]">
                <Check className="h-6 w-6 stroke-[3]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-black font-sans uppercase">ORDER PLACED SUCCESSFULLY</h2>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  Your luxury home decor order is registered under transaction code <strong className="text-black">{viewedOrder.id}</strong>.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Secure Delivery OTP</span>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black font-mono tracking-wider text-[#34C759]">{viewedOrder.otp}</span>
                  <span className="text-[10px] text-slate-500 font-sans">Required upon courier arrival.</span>
                </div>
              </div>

              <button
                id="btn-success-profile"
                onClick={() => {
                  setViewedOrder(null);
                  setActiveSection("profile");
                }}
                className="w-full bg-black hover:bg-neutral-900 text-white font-bold py-3.5 rounded-2xl text-xs tracking-wider cursor-pointer"
              >
                TRACK ORDERS IN PROFILE
              </button>
            </div>
          ) : (
            /* STANDARD CART CHECKOUT FLOW */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left 2 Cols: Items List & Details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <img src={item.product.image} className="w-16 h-16 object-cover rounded-xl bg-[#F7F7F7]" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.product.brand}</span>
                        <h3 
                          onClick={() => handleProductSelect(item.product)}
                          className="font-semibold text-xs text-neutral-950 truncate cursor-pointer hover:underline"
                        >
                          {item.product.name}
                        </h3>
                        <div className="flex gap-2 text-[10px] text-slate-500 mt-1 font-mono">
                          <span>Scale: {item.selectedSize}</span>
                          <span>•</span>
                          <span>Finish: {item.selectedColor}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          id={`btn-cart-dec-${item.id}`}
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-[#F7F7F7] border border-slate-200 text-black flex items-center justify-center font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold font-mono w-4 text-center">{item.quantity}</span>
                        <button
                          id={`btn-cart-inc-${item.id}`}
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-[#F7F7F7] border border-slate-200 text-black flex items-center justify-center font-bold text-xs"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-black font-sans">${item.product.price * item.quantity}</span>
                        <button
                          id={`btn-cart-del-${item.id}`}
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-red-500 transition cursor-pointer"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address Selector */}
                <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-sm font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" /> Delivery Address
                    </h2>
                    <button
                      id="btn-toggle-address"
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="text-xs text-[#34C759] font-bold uppercase tracking-wider hover:opacity-80"
                    >
                      {showAddressForm ? "✕ Close" : "+ Add New"}
                    </button>
                  </div>

                  {showAddressForm && (
                    <form onSubmit={handleAddAddress} className="space-y-3 bg-[#F7F7F7] p-4 rounded-2xl border border-slate-100">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          id="input-addr-name"
                          type="text"
                          required
                          placeholder="Full Name"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                          value={newAddrName}
                          onChange={(e) => setNewAddrName(e.target.value)}
                        />
                        <input
                          id="input-addr-phone"
                          type="text"
                          required
                          placeholder="Phone Number"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                          value={newAddrPhone}
                          onChange={(e) => setNewAddrPhone(e.target.value)}
                        />
                      </div>
                      <input
                        id="input-addr-street"
                        type="text"
                        required
                        placeholder="Street Address"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                        value={newAddrStreet}
                        onChange={(e) => setNewAddrStreet(e.target.value)}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          id="input-addr-city"
                          type="text"
                          required
                          placeholder="City"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                          value={newAddrCity}
                          onChange={(e) => setNewAddrCity(e.target.value)}
                        />
                        <input
                          id="input-addr-state"
                          type="text"
                          placeholder="State"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                          value={newAddrState}
                          onChange={(e) => setNewAddrState(e.target.value)}
                        />
                        <input
                          id="input-addr-zip"
                          type="text"
                          placeholder="ZIP Code"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                          value={newAddrZip}
                          onChange={(e) => setNewAddrZip(e.target.value)}
                        />
                      </div>
                      <button
                        id="btn-save-address"
                        type="submit"
                        className="w-full bg-black text-white py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                      >
                        Save and Use Address
                      </button>
                    </form>
                  )}

                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          checkoutAddressId === addr.id
                            ? "border-black bg-neutral-50"
                            : "border-slate-200 hover:border-black"
                        }`}
                      >
                        <input
                          id={`radio-addr-${addr.id}`}
                          type="radio"
                          name="checkout-address"
                          className="mt-1 accent-black"
                          checked={checkoutAddressId === addr.id}
                          onChange={() => setCheckoutAddressId(addr.id)}
                        />
                        <div className="text-xs">
                          <span className="font-bold text-black block">{addr.fullName} {addr.isDefault && <span className="text-[10px] text-slate-400 font-normal ml-1">(Default)</span>}</span>
                          <span className="text-slate-500 block mt-0.5">{addr.streetAddress}, {addr.city}, {addr.state} {addr.postalCode}</span>
                          <span className="text-slate-400 block mt-0.5">{addr.phone}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Simulated Payment Selector */}
                <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4" /> Payment Gateway
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { id: "Card", label: "Credit/Debit Card" },
                      { id: "UPI", label: "UPI Instant" },
                      { id: "Stripe", label: "Stripe secure" },
                      { id: "Wallet", label: `Luxury Wallet ($${walletBalance.toFixed(2)})` }
                    ].map((gate) => (
                      <button
                        id={`btn-pay-gate-${gate.id}`}
                        key={gate.id}
                        type="button"
                        onClick={() => setCheckoutPayment(gate.id as any)}
                        className={`p-3.5 rounded-2xl border text-xs font-semibold tracking-wide transition-all text-center cursor-pointer ${
                          checkoutPayment === gate.id
                            ? "bg-black border-black text-white shadow-md"
                            : "bg-white border-slate-200 text-slate-700 hover:border-black hover:text-black"
                        }`}
                      >
                        {gate.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Col: Price summary */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-6">
                  <h2 className="text-sm font-bold text-black uppercase tracking-wider pb-3 border-b">Summary</h2>
                  
                  {/* Coupon formulation */}
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Coupon Markdown Code</label>
                    <div className="flex gap-2">
                      <input
                        id="input-cart-coupon"
                        type="text"
                        placeholder="Enter NAYEL20"
                        className="flex-1 bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none uppercase font-mono font-bold"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value)}
                      />
                      <button
                        id="btn-cart-apply-coupon"
                        type="submit"
                        className="bg-black hover:bg-neutral-900 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                    {appliedCoupon && (
                      <div className="flex items-center justify-between text-[11px] bg-[#34C759]/10 text-[#34C759] p-2 rounded-lg font-mono">
                        <span>Active: {appliedCoupon.code}</span>
                        <button id="btn-cart-rem-coupon" type="button" onClick={removeCoupon} className="font-bold underline">✕</button>
                      </div>
                    )}
                  </form>

                  {/* Pricing breakdowns */}
                  <div className="space-y-3 border-t pt-4 text-xs font-medium">
                    <div className="flex justify-between text-slate-500">
                      <span>Bag Subtotal</span>
                      <span className="font-mono">${cart.reduce((s, i) => s + i.product.price * i.quantity, 0)}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-[#34C759]">
                        <span>Voucher Discount</span>
                        <span className="font-mono">
                          -${appliedCoupon.type === "percentage" 
                            ? Math.floor(cart.reduce((s, i) => s + i.product.price * i.quantity, 0) * (appliedCoupon.value / 100)) 
                            : appliedCoupon.value}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-500">
                      <span>Luxury Sales Tax (8%)</span>
                      <span className="font-mono">
                        ${Math.round((cart.reduce((s, i) => s + i.product.price * i.quantity, 0) - (appliedCoupon ? (appliedCoupon.type === "percentage" ? Math.floor(cart.reduce((s, i) => s + i.product.price * i.quantity, 0) * (appliedCoupon.value / 100)) : appliedCoupon.value) : 0)) * 0.08)}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-500">
                      <span>Delivery Surcharge</span>
                      <span className="text-[#34C759] font-bold">COMPLIMENTARY</span>
                    </div>

                    <div className="flex justify-between text-base font-bold text-black border-t pt-3">
                      <span>Final Ledger Total</span>
                      <span className="font-mono text-lg">
                        ${cart.reduce((s, i) => s + i.product.price * i.quantity, 0) - (appliedCoupon ? (appliedCoupon.type === "percentage" ? Math.floor(cart.reduce((s, i) => s + i.product.price * i.quantity, 0) * (appliedCoupon.value / 100)) : appliedCoupon.value) : 0) + Math.round((cart.reduce((s, i) => s + i.product.price * i.quantity, 0) - (appliedCoupon ? (appliedCoupon.type === "percentage" ? Math.floor(cart.reduce((s, i) => s + i.product.price * i.quantity, 0) * (appliedCoupon.value / 100)) : appliedCoupon.value) : 0)) * 0.08)}
                      </span>
                    </div>
                  </div>

                  <button
                    id="btn-cart-place-order"
                    onClick={handlePlaceOrder}
                    className="w-full bg-[#34C759] hover:bg-[#2eb04e] text-white font-bold py-4 rounded-2xl text-xs tracking-wider transition-all shadow-lg shadow-[#34C759]/20 cursor-pointer"
                  >
                    PLACE ORDER SECURELY
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* CLIENT ACCOUNT PROFILE SECTION */}
      {activeSection === "profile" && !customerUser && (
        <div className="max-w-md mx-auto py-12 px-6 animate-fade-in text-black bg-white">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl space-y-6">
            
            {/* Logo header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-black rounded-2xl text-white shadow-md mx-auto mb-2">
                <span className="text-xl font-black font-sans tracking-widest">N</span>
              </div>
              <h2 className="text-xl font-black tracking-wider uppercase text-neutral-900">NAYEL BASKET PORTAL</h2>
              <p className="text-xs text-slate-400 font-sans">Bespoke luxury connoisseur account access</p>
            </div>

            {/* Tab selector */}
            {authTab !== "forgot" && (
              <div className="flex bg-[#F7F7F7] p-1 rounded-xl">
                <button
                  id="btn-auth-tab-signin"
                  onClick={() => setAuthTab("signin")}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    authTab === "signin"
                      ? "bg-white text-black shadow-sm"
                      : "text-slate-400 hover:text-black"
                  }`}
                >
                  Sign In
                </button>
                <button
                  id="btn-auth-tab-signup"
                  onClick={() => setAuthTab("signup")}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    authTab === "signup"
                      ? "bg-white text-black shadow-sm"
                      : "text-slate-400 hover:text-black"
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Tab 1: Sign In */}
            {authTab === "signin" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const user = {
                    name: authEmail === "alex.rivera@nayelbasket.com" ? "Alex Rivera" : authEmail.split("@")[0].replace(".", " "),
                    email: authEmail,
                    phone: "+1 (555) 321-9876",
                    tier: "Elite Patron tier",
                    patronId: `#NB-${Math.floor(10000 + Math.random() * 90000)}-ELITE`,
                    joinedDate: new Date().toLocaleDateString()
                  };
                  setCustomerUser(user);
                  if (authRememberMe) {
                    localStorage.setItem("nb_customer_user", JSON.stringify(user));
                  }
                  
                  const loginEvent = {
                    date: new Date().toISOString().replace("T", " ").substring(0, 16),
                    device: "iPhone 15 Pro",
                    location: "San Francisco, USA",
                    status: "Success (Password)"
                  };
                  setLoginHistory((prev) => [loginEvent, ...prev]);
                  localStorage.setItem("nb_login_history", JSON.stringify([loginEvent, ...loginHistory]));
                  
                  addNotification("✨ Welcome Back", `Successfully signed in as ${user.name}`, "system");
                }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input
                    id="input-auth-email"
                    type="email"
                    required
                    placeholder="e.g., alex.rivera@nayelbasket.com"
                    className="w-full bg-[#F7F7F7] border border-slate-200 focus:border-black/50 focus:bg-white rounded-xl px-4 py-3 text-xs focus:outline-none transition-all"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                    <button
                      id="btn-forgot-pass-trigger"
                      type="button"
                      onClick={() => {
                        setAuthTab("forgot");
                        setForgotStep(1);
                      }}
                      className="text-[10px] font-bold text-slate-400 hover:text-black hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <input
                    id="input-auth-password"
                    type="password"
                    required
                    placeholder="Enter security passcode"
                    className="w-full bg-[#F7F7F7] border border-slate-200 focus:border-black/50 focus:bg-white rounded-xl px-4 py-3 text-xs focus:outline-none transition-all"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                  />
                </div>

                <div className="flex justify-between items-center py-1">
                  <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                    <input
                      id="checkbox-remember-me"
                      type="checkbox"
                      checked={authRememberMe}
                      onChange={(e) => setAuthRememberMe(e.target.checked)}
                      className="accent-black rounded"
                    />
                    <span>Remember me on this device</span>
                  </label>
                </div>

                <button
                  id="btn-auth-signin"
                  type="submit"
                  className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-3.5 rounded-2xl text-xs tracking-widest uppercase cursor-pointer transition-all shadow-md"
                >
                  SECURE PASSWORD LOG IN
                </button>

                {/* Simulated WebAuthn / Face Unlock Button */}
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-4 text-[9px] font-bold uppercase text-slate-400 tracking-widest font-mono">BIOMETRIC SECURE LINK</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button
                  id="btn-biometric-unlock"
                  type="button"
                  onClick={() => {
                    setBiometricPromptType("face");
                    setShowBiometricPrompt(true);
                    
                    setTimeout(() => {
                      setShowBiometricPrompt(false);
                      const user = {
                        name: "Alex Rivera",
                        email: "alex.rivera@nayelbasket.com",
                        phone: "+1 (555) 321-9876",
                        tier: "Elite Patron tier",
                        patronId: "#NB-82901-ELITE",
                        joinedDate: "2026-06-29"
                      };
                      setCustomerUser(user);
                      localStorage.setItem("nb_customer_user", JSON.stringify(user));
                      
                      const loginEvent = {
                        date: new Date().toISOString().replace("T", " ").substring(0, 16),
                        device: "iPhone 15 Pro",
                        location: "San Francisco, USA",
                        status: "Success (Face ID)"
                      };
                      setLoginHistory((prev) => [loginEvent, ...prev]);
                      localStorage.setItem("nb_login_history", JSON.stringify([loginEvent, ...loginHistory]));
                      
                      addNotification("✨ Welcome Back", "Securely logged in using Face ID unlock credentials.", "system");
                    }, 2200);
                  }}
                  className="w-full bg-[#34C759]/10 hover:bg-[#34C759]/15 text-[#2cb04e] border border-[#34C759]/20 font-bold py-3 rounded-2xl text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-all animate-pulse"
                >
                  <Sparkles className="h-4 w-4 text-[#34C759] animate-pulse" />
                  <span>Face ID / Fingerprint Unlock</span>
                </button>

                <button
                  id="btn-bypass-auth"
                  type="button"
                  onClick={() => {
                    const user = {
                      name: "Alex Rivera",
                      email: "alex.rivera@nayelbasket.com",
                      phone: "+1 (555) 321-9876",
                      tier: "Elite Patron tier",
                      patronId: "#NB-82901-ELITE",
                      joinedDate: "2026-06-29"
                    };
                    setCustomerUser(user);
                    localStorage.setItem("nb_customer_user", JSON.stringify(user));
                    addNotification("✨ Quick Session", "Logged in using quick credential evaluation.", "system");
                  }}
                  className="w-full text-center text-[10px] text-slate-400 hover:text-black font-semibold uppercase tracking-wider underline cursor-pointer mt-2"
                >
                  Quick Sign-in as Alex Rivera
                </button>
              </form>
            )}

            {/* Tab 2: Create Account (Sign Up) */}
            {authTab === "signup" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const pid = `#NB-${Math.floor(10000 + Math.random() * 90000)}-PATRON`;
                  const user = {
                    name: authName,
                    email: authEmail,
                    phone: authPhone || "+1 (555) 000-0000",
                    tier: "Exclusive Patron tier",
                    patronId: pid,
                    joinedDate: new Date().toLocaleDateString()
                  };
                  setCustomerUser(user);
                  localStorage.setItem("nb_customer_user", JSON.stringify(user));
                  
                  if (authReferralCode.trim().toUpperCase() === "NAYEL-SHARE-30") {
                    addWalletFunds(30);
                    addNotification("🎁 Ambassador Referral Credit Applied", "Successfully linked referral code! You received $30.00 inside your Luxury Wallet.", "promo");
                  } else {
                    addNotification("✨ Account Formed", `Welcome to Nayel Basket, ${user.name}!`, "system");
                  }
                  
                  const loginEvent = {
                    date: new Date().toISOString().replace("T", " ").substring(0, 16),
                    device: "iPhone 15 Pro",
                    location: "San Francisco, USA",
                    status: "Registered Account"
                  };
                  setLoginHistory((prev) => [loginEvent, ...prev]);
                  localStorage.setItem("nb_login_history", JSON.stringify([loginEvent, ...loginHistory]));
                }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <input
                    id="input-signup-name"
                    type="text"
                    required
                    placeholder="Enter your first and last name"
                    className="w-full bg-[#F7F7F7] border border-slate-200 focus:border-black/50 focus:bg-white rounded-xl px-4 py-3 text-xs focus:outline-none transition-all"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input
                    id="input-signup-email"
                    type="email"
                    required
                    placeholder="Enter your security email"
                    className="w-full bg-[#F7F7F7] border border-slate-200 focus:border-black/50 focus:bg-white rounded-xl px-4 py-3 text-xs focus:outline-none transition-all"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Coordinate</label>
                  <input
                    id="input-signup-phone"
                    type="tel"
                    placeholder="e.g., +1 (555) 000-0000"
                    className="w-full bg-[#F7F7F7] border border-slate-200 focus:border-black/50 focus:bg-white rounded-xl px-4 py-3 text-xs focus:outline-none transition-all"
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                  <input
                    id="input-signup-password"
                    type="password"
                    required
                    placeholder="Create a strong password code"
                    className="w-full bg-[#F7F7F7] border border-slate-200 focus:border-black/50 focus:bg-white rounded-xl px-4 py-3 text-xs focus:outline-none transition-all"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ambassador Referral Code (Optional)</label>
                  <input
                    id="input-signup-referral"
                    type="text"
                    placeholder="e.g., NAYEL-SHARE-30"
                    className="w-full bg-[#F7F7F7] border border-slate-200 focus:border-black/50 focus:bg-white rounded-xl px-4 py-3 text-xs uppercase font-mono font-bold focus:outline-none transition-all"
                    value={authReferralCode}
                    onChange={(e) => setAuthReferralCode(e.target.value)}
                  />
                  {authReferralCode.trim().toUpperCase() === "NAYEL-SHARE-30" && (
                    <span className="text-[9px] text-[#34C759] font-mono block mt-1">✓ Valid Ambassador Code: You will receive $30.00 upon profile launch!</span>
                  )}
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input
                    id="checkbox-signup-biometric"
                    type="checkbox"
                    checked={isBiometricRegistered}
                    onChange={(e) => {
                      setIsBiometricRegistered(e.target.checked);
                      localStorage.setItem("nb_biometric_registered", e.target.checked ? "true" : "false");
                    }}
                    className="accent-black rounded"
                  />
                  <span className="text-xs text-slate-500">Enable Face ID / fingerprint passkey registration</span>
                </div>

                <button
                  id="btn-auth-signup"
                  type="submit"
                  className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-3.5 rounded-2xl text-xs tracking-widest uppercase cursor-pointer transition-all shadow-md"
                >
                  VERIFY & REGISTER ACCOUNT
                </button>
              </form>
            )}

            {/* Tab 3: Password Reset Form */}
            {authTab === "forgot" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="text-xs font-bold text-black uppercase tracking-wider font-mono">Reset Passcode</h3>
                  <button
                    id="btn-cancel-reset"
                    onClick={() => setAuthTab("signin")}
                    className="text-slate-400 hover:text-black font-bold uppercase text-[10px] tracking-wider cursor-pointer"
                  >
                    ← Back
                  </button>
                </div>

                {forgotStep === 1 ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!forgotEmail) return;
                      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
                      setForgotOtp(generatedOtp);
                      setForgotStep(2);
                      addNotification("🔑 Reset Security OTP", `Your password reset verification code is: ${generatedOtp}`, "system");
                    }}
                    className="space-y-4"
                  >
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">
                      Provide your luxury connoisseur email below. We will dispatch a secure 6-digit numeric verification OTP code to authorize reset protocols.
                    </p>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Email Address</label>
                      <input
                        id="input-reset-email"
                        type="email"
                        required
                        placeholder="e.g., alex.rivera@nayelbasket.com"
                        className="w-full bg-[#F7F7F7] border border-slate-200 focus:border-black/50 focus:bg-white rounded-xl px-4 py-3 text-xs focus:outline-none"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                      />
                    </div>

                    <button
                      id="btn-send-reset-otp"
                      type="submit"
                      className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-3.5 rounded-2xl text-xs tracking-wider uppercase cursor-pointer transition-all"
                    >
                      DISPATCH VERIFICATION OTP
                    </button>
                  </form>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (forgotOtpInput !== forgotOtp) {
                        alert("The verification security code is incorrect. Please check notifications.");
                        return;
                      }
                      addNotification("🛡️ Passcode Configured", "Your custom luxury passcode has been safely configured.", "system");
                      setAuthTab("signin");
                      setForgotStep(1);
                      setForgotEmail("");
                      setForgotOtpInput("");
                    }}
                    className="space-y-4"
                  >
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">
                      Input the 6-digit verification code sent via in-app notifications, and enter your new luxury secure passcode.
                    </p>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verification Security Code</label>
                      <input
                        id="input-reset-otp"
                        type="text"
                        required
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        className="w-full bg-[#F7F7F7] border border-slate-200 focus:border-black/50 focus:bg-white rounded-xl px-4 py-3 text-xs focus:outline-none text-center font-mono font-bold tracking-widest"
                        value={forgotOtpInput}
                        onChange={(e) => setForgotOtpInput(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                      <input
                        id="input-reset-new-password"
                        type="password"
                        required
                        placeholder="Enter new secure passcode"
                        className="w-full bg-[#F7F7F7] border border-slate-200 focus:border-black/50 focus:bg-white rounded-xl px-4 py-3 text-xs focus:outline-none"
                        value={forgotNewPass}
                        onChange={(e) => setForgotNewPass(e.target.value)}
                      />
                    </div>

                    <button
                      id="btn-submit-reset-password"
                      type="submit"
                      className="w-full bg-[#34C759] hover:bg-[#2eb04e] text-white font-bold py-3.5 rounded-2xl text-xs tracking-wider uppercase cursor-pointer transition-all shadow"
                    >
                      UPDATE PASSCODE SECURELY
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* CLIENT ACCOUNT PROFILE SECTION (LOGGED IN) */}
      {activeSection === "profile" && customerUser && (
        <div className="space-y-8 pb-16 animate-fade-in bg-white">
          
          {/* User Profile header */}
          <div className="bg-[#F7F7F7] border border-slate-100 rounded-[2rem] p-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm">
            <div className="flex items-center gap-6 flex-col sm:flex-row text-center sm:text-left">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-neutral-900 border-4 border-white flex items-center justify-center text-white text-3xl font-black font-sans shadow-lg uppercase select-none">
                  {customerUser.name.split(" ").map((n: any) => n[0]).join("").substring(0, 2)}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#34C759] text-white p-1.5 rounded-full border-2 border-white text-[10px] shadow">
                  <Sparkles className="h-3 w-3" />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <h2 className="text-2xl font-black text-black font-sans tracking-tight">{customerUser.name}</h2>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#34C759] bg-[#34C759]/10 border border-[#34C759]/20 px-2.5 py-0.5 rounded-full uppercase font-mono">
                    {customerUser.tier}
                  </span>
                </div>
                <span className="text-xs text-slate-400 block font-sans">{customerUser.email}</span>
                <span className="text-[10px] text-slate-400 block font-mono">{customerUser.patronId}</span>
              </div>
            </div>

            {/* Quick Stats Panel */}
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/50 text-center font-mono shadow-sm min-w-36 relative overflow-hidden group">
                <span className="text-[9px] text-slate-400 block font-bold uppercase font-sans mb-1">My Wallet Balance</span>
                <span className="text-xl font-black text-black font-mono block">${walletBalance.toFixed(2)}</span>
                <button
                  id="btn-add-funds"
                  onClick={() => {
                    addWalletFunds(50);
                    addNotification("💰 Wallet Funds Deposited", "Successfully added $50.00 store credit to your Nayel Wallet.", "system");
                  }}
                  className="mt-2 text-[10px] font-bold text-[#34C759] hover:opacity-85 uppercase tracking-wider cursor-pointer font-sans inline-flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add $50
                </button>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/50 text-center font-mono shadow-sm min-w-36 relative overflow-hidden">
                <span className="text-[9px] text-slate-400 block font-bold uppercase font-sans mb-1">Loyalty Points</span>
                <span className="text-xl font-black text-[#34C759] font-mono block">{rewardPoints} PTS</span>
                <span className="text-[9px] text-slate-400 font-sans block mt-2">10% back per buy</span>
              </div>
            </div>
          </div>

          {/* LUXURY INTERACTIVE NAVIGATION SUBTABS (Zara/Airbnb Inspired) */}
          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-100 scrollbar-hide">
            {[
              { id: "dashboard", label: "📊 Overview" },
              { id: "orders", label: "📦 Purchase History" },
              { id: "wishlist", label: "❤️ My Curations" },
              { id: "addresses", label: "📍 Delivery Addresses" },
              { id: "coupons", label: "🎫 Promos & Coupons" },
              { id: "ambassador", label: "🤝 Ambassador Program" },
              { id: "concierge", label: "💬 Bespoke Concierge" },
              { id: "notifications", label: "🔔 FCM Notifications" },
              { id: "security", label: "🔐 Session Security" }
            ].map((tab) => (
              <button
                id={`btn-profile-tab-${tab.id}`}
                key={tab.id}
                onClick={() => setActiveProfileTab(tab.id as any)}
                className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex-shrink-0 cursor-pointer border ${
                  activeProfileTab === tab.id
                    ? "bg-black text-white border-black shadow-sm"
                    : "bg-white text-slate-500 border-slate-200/60 hover:text-black hover:border-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Primary Profile Tab Content Area (2 Cols on large screen, 1 Col on small) */}
            <div className="lg:col-span-2 space-y-6">

              {/* OVERVIEW DASHBOARD TAB */}
              {activeProfileTab === "dashboard" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-black uppercase tracking-wider border-b pb-3 font-mono">Elite Patron Privileges</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="flex gap-3 items-start p-4 bg-[#F7F7F7] rounded-2xl">
                        <Award className="h-5 w-5 text-[#34C759] mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-xs text-black block">White-Glove Shipping</span>
                          <span className="text-[11px] text-slate-500 block leading-normal mt-0.5">Complimentary express shipping and wooden-crated protective carriage.</span>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start p-4 bg-[#F7F7F7] rounded-2xl">
                        <Clock className="h-5 w-5 text-[#34C759] mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-xs text-black block">Extended 45-Day Returns</span>
                          <span className="text-[11px] text-slate-500 block leading-normal mt-0.5">Instant back-to-wallet refunds and complimentary home pick-up.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b pb-3">
                      <h3 className="text-sm font-bold text-black uppercase tracking-wider font-mono">Recent Transactions</h3>
                      <span className="text-[10px] text-slate-400">Showing last 2 activities</span>
                    </div>
                    <div className="divide-y divide-slate-100 space-y-3">
                      <div className="pt-3 first:pt-0 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-black block">Elite Patron Cashback Reward</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Earned 10% cash equivalent back on orders</span>
                        </div>
                        <span className="font-bold text-[#34C759] font-mono">+120 PTS</span>
                      </div>
                      <div className="pt-3 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-black block">Grand Welcome Credit</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Nayel Basket complimentary lifestyle credit</span>
                        </div>
                        <span className="font-bold text-black font-mono">+$250.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PURCHASE HISTORY TAB CONTAINER */}
              {activeProfileTab === "orders" && (
                <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider border-b pb-3 font-mono">My Active & Closed Orders ({orders.length})</h3>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-16 space-y-4">
                      <span className="text-4xl block">📦</span>
                      <p className="text-xs text-slate-400 font-light">You have no active or historical orders logged inside this patron account.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 space-y-4">
                    {orders.map((ord) => (
                      <div key={ord.id} className="pt-4 first:pt-0 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-xs text-black block">Order {ord.id}</span>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{new Date(ord.date).toLocaleDateString()}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-xs text-black block font-sans">${ord.total.toFixed(2)}</span>
                            <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded mt-1 font-mono ${
                              ord.status === "Delivered" ? "bg-[#34C759]/10 text-[#34C759]" : "bg-amber-400/10 text-amber-500"
                            }`}>
                              {ord.status}
                            </span>
                          </div>
                        </div>

                        {/* Timeline tracking panel inside orders */}
                        <div className="bg-[#F7F7F7] p-4 rounded-2xl border border-slate-100 space-y-3 text-xs">
                          <div className="flex justify-between font-semibold border-b pb-2 text-slate-600">
                            <span>Delivery OTP Verification:</span>
                            <span className="font-mono text-[#34C759] tracking-widest">{ord.otp}</span>
                          </div>
                          
                          <div className="space-y-2">
                            {ord.tracking.map((track, i) => (
                              <div key={i} className="flex gap-3 items-start">
                                <span className={`h-2.5 w-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                                  track.status === "completed" ? "bg-[#34C759]" : "bg-slate-300"
                                }`}></span>
                                <div className="min-w-0 flex-1">
                                  <span className={`font-semibold block text-[11px] ${track.status === "completed" ? "text-black" : "text-slate-400"}`}>{track.title}</span>
                                  <span className="text-[10px] text-slate-400 block font-light leading-normal">{track.description}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2 pt-2 border-t mt-2">
                            {ord.status !== "Cancelled" && ord.status !== "Returned" && (
                              <button
                                id={`btn-cancel-ord-${ord.id}`}
                                onClick={() => cancelOrder(ord.id)}
                                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-slate-200 text-neutral-900 rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-all"
                              >
                                Cancel Order
                              </button>
                            )}

                            {ord.status === "Delivered" && !ord.returnRequest && (
                              <button
                                id={`btn-init-return-${ord.id}`}
                                onClick={() => {
                                  setReturnProdId(ord.items[0]?.product.id || "");
                                  setReturnDetails("");
                                  setShowReturnForm(ord.id);
                                }}
                                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                              >
                                Initiate Return
                              </button>
                            )}
                          </div>

                          {/* Inline Return Form */}
                          {showReturnForm === ord.id && (
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                submitReturnRequest(ord.id, returnProdId, returnReason, returnDetails);
                                setShowReturnForm(false);
                              }}
                              className="bg-white border border-slate-100 p-4 rounded-xl mt-3 space-y-3 text-xs"
                            >
                              <span className="font-bold text-black block uppercase text-[10px] tracking-wider">Return Request Details</span>
                              
                              <div>
                                <label className="block text-[10px] text-slate-400 mb-1">Item to return</label>
                                <select
                                  id={`select-return-item-${ord.id}`}
                                  className="w-full bg-[#F7F7F7] border border-slate-200 rounded-lg p-2 focus:outline-none"
                                  value={returnProdId}
                                  onChange={(e) => setReturnProdId(e.target.value)}
                                >
                                  {ord.items.map((it) => (
                                    <option key={it.product.id} value={it.product.id}>{it.product.name}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-400 mb-1">Reason for Return</label>
                                <select
                                  id={`select-return-reason-${ord.id}`}
                                  className="w-full bg-[#F7F7F7] border border-slate-200 rounded-lg p-2 focus:outline-none"
                                  value={returnReason}
                                  onChange={(e) => setReturnReason(e.target.value)}
                                >
                                  <option value="Defective Item">Defective Item / Imperfection</option>
                                  <option value="Incorrect Scaling">Incorrect Dimension Scale</option>
                                  <option value="Aesthetic Misalignment">Aesthetic Misalignment</option>
                                  <option value="Delivery Delay">Late arrival</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-400 mb-1">Further Clarification</label>
                                <textarea
                                  id={`textarea-return-desc-${ord.id}`}
                                  rows={2}
                                  required
                                  placeholder="Detail materials, damages, scale discrepancies..."
                                  className="w-full bg-[#F7F7F7] border border-slate-200 rounded-lg p-2 focus:outline-none"
                                  value={returnDetails}
                                  onChange={(e) => setReturnDetails(e.target.value)}
                                />
                              </div>

                              <button
                                id={`btn-submit-return-${ord.id}`}
                                type="submit"
                                className="w-full bg-black text-white py-2 rounded-lg font-bold uppercase tracking-wider text-[10px]"
                              >
                                Submit Return Request
                              </button>
                            </form>
                          )}

                          {ord.returnRequest && (
                            <div className="bg-white p-3 rounded-xl border mt-3 flex justify-between items-center text-[10px]">
                              <div>
                                <span className="font-bold text-black block">Return Request {ord.returnRequest.id}</span>
                                <span className="text-slate-400 block mt-0.5">Reason: {ord.returnRequest.reason}</span>
                              </div>
                              <span className={`font-bold px-2 py-0.5 rounded uppercase font-mono ${
                                ord.returnRequest.status === "Approved" ? "bg-[#34C759]/10 text-[#34C759]" : "bg-slate-100 text-slate-500"
                              }`}>
                                {ord.returnRequest.status}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MY CURATIONS / WISHLIST TAB */}
            {activeProfileTab === "wishlist" && (
              <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-4 animate-fade-in">
                <h3 className="text-sm font-bold text-black uppercase tracking-wider border-b pb-3 font-mono">My Curated Favorites ({wishlist.length})</h3>
                
                {wishlist.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <span className="text-4xl block">❤️</span>
                    <p className="text-xs text-slate-400 font-light">Your curated wish list is empty. Explore items to build your sanctuary.</p>
                    <button
                      id="btn-wish-shop"
                      onClick={() => {
                        setSelectedCategory("All");
                        setActiveSection("categories");
                      }}
                      className="bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Find Inspiration
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {wishlist.map((prod) => (
                      <div key={prod.id} className="group border border-slate-100 rounded-3xl p-4 bg-[#F7F7F7] relative flex flex-col justify-between">
                        <button
                          id={`btn-remove-wish-${prod.id}`}
                          onClick={() => toggleWishlist(prod)}
                          className="absolute top-3 right-3 bg-white p-2 rounded-full text-slate-400 hover:text-red-500 shadow-sm cursor-pointer"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                        
                        <div className="space-y-3">
                          <div className="aspect-square rounded-2xl overflow-hidden bg-white">
                            <img src={prod.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">{prod.brand}</span>
                            <span className="text-xs font-semibold text-neutral-950 block truncate">{prod.name}</span>
                            <span className="text-xs font-bold text-neutral-950 block mt-0.5">${prod.price}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-3 mt-3 border-t border-slate-200/50">
                          <button
                            id={`btn-wish-view-${prod.id}`}
                            onClick={() => handleProductSelect(prod)}
                            className="flex-1 bg-white hover:bg-neutral-50 text-black border py-2 rounded-xl text-[10px] font-bold uppercase transition-all"
                          >
                            Detail Spec
                          </button>
                          <button
                            id={`btn-wish-cart-${prod.id}`}
                            onClick={() => addToCart(prod, 1)}
                            className="flex-1 bg-black hover:bg-neutral-800 text-white py-2 rounded-xl text-[10px] font-bold uppercase transition-all"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DELIVERY COORDINATES (ADDRESSES) TAB */}
            {activeProfileTab === "addresses" && (
              <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-6 animate-fade-in">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider font-mono">Saved Addresses ({addresses.length})</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="p-4 border border-slate-200 rounded-2xl bg-[#F7F7F7] relative space-y-2">
                      <button
                        id={`btn-remove-addr-${addr.id}`}
                        onClick={() => {
                          removeAddress(addr.id);
                          addNotification("📍 Address Removed", "Successfully deleted address coordination from your account.", "system");
                        }}
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-500 cursor-pointer animate-fade-in"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                      
                      <div className="space-y-1">
                        <span className="font-bold text-xs text-black block">{addr.fullName}</span>
                        <span className="text-[11px] text-slate-500 block leading-relaxed">{addr.streetAddress}, {addr.city}, {addr.state}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{addr.phone}</span>
                      </div>
                      {addr.isDefault && (
                        <span className="inline-block text-[8px] font-bold uppercase bg-black text-white px-2 py-0.5 rounded font-mono">DEFAULT</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add New Address Panel */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const data = new FormData(form);
                    addAddress({
                      id: Date.now().toString(),
                      fullName: data.get("fullName") as string,
                      streetAddress: data.get("streetAddress") as string,
                      city: data.get("city") as string,
                      state: data.get("state") as string,
                      phone: data.get("phone") as string,
                      isDefault: false
                    });
                    form.reset();
                    addNotification("📍 Address Appended", "A new delivery address coordinate has been verified.", "system");
                  }}
                  className="bg-[#F7F7F7] p-5 rounded-2xl border border-slate-100 space-y-4 text-xs"
                >
                  <span className="font-bold text-black block uppercase text-[10px] tracking-wider border-b pb-2">Add New Location</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Full Name</label>
                      <input name="fullName" type="text" required className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Phone Number</label>
                      <input name="phone" type="text" required className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Street Address</label>
                    <input name="streetAddress" type="text" required className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">City</label>
                      <input name="city" type="text" required className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">State / Zip</label>
                      <input name="state" type="text" required className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none" />
                    </div>
                  </div>
                  <button
                    id="btn-add-address-submit"
                    type="submit"
                    className="w-full bg-black hover:bg-neutral-800 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
                  >
                    Save Location Coordinate
                  </button>
                </form>
              </div>
            )}

            {/* COUPONS & PROMOS TAB */}
            {activeProfileTab === "coupons" && (
              <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-6 animate-fade-in">
                <h3 className="text-sm font-bold text-black uppercase tracking-wider border-b pb-3 font-mono">Available Promotions & Vouchers</h3>
                
                <div className="space-y-4">
                  {[
                    { code: "NAYEL20", value: "20% OFF", desc: "Patron celebration event. Apply across all hand-crafted collections.", type: "Percentage" },
                    { code: "DECOR15", value: "$15 OFF", desc: "Applies on orders starting above $50. Elegant lighting & vases.", type: "Flat Rate" },
                    { code: "FREESHIP", value: "FREE EXPRESS", desc: "No-charge white-glove crate dispatch globally.", type: "Shipping" },
                    { code: "GEMINI50", value: "50% OFF", desc: "Developer verification credentials voucher. Applies instantly.", type: "Exclusive" }
                  ].map((coup) => (
                    <div key={coup.code} className="bg-[#F7F7F7] border border-slate-200/60 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-black tracking-wide text-sm bg-white border border-slate-300 px-3 py-1 rounded-lg">{coup.code}</span>
                          <span className="text-[10px] font-bold text-[#34C759] bg-[#34C759]/10 px-2.5 py-0.5 rounded-full uppercase">{coup.value}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-sans mt-1.5">{coup.desc}</p>
                      </div>

                      <button
                        id={`btn-copy-coupon-${coup.code}`}
                        onClick={() => {
                          applyCoupon(coup.code);
                          addNotification("🎫 Coupon Applied", `Successfully loaded discount voucher: ${coup.code}`, "promo");
                        }}
                        className="bg-black hover:bg-neutral-800 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase cursor-pointer transition-all"
                      >
                        APPLY NOW
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AMBASSADOR REFERRAL TAB */}
            {activeProfileTab === "ambassador" && (
              <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-6 animate-fade-in">
                <div className="text-center space-y-2 py-4">
                  <span className="text-4xl block">🤝</span>
                  <h3 className="text-lg font-black text-black font-sans uppercase">Nayel Ambassador Network</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Gift design enthusiasts a complimentary $30 lifestyle credit. Receive $30 inside your wallet upon their first curated purchase.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#F7F7F7] p-5 rounded-2xl border text-center font-mono">
                    <span className="text-[9px] text-slate-400 block font-bold uppercase font-sans mb-1">Referral Code</span>
                    <span className="text-lg font-black text-black">NAYEL-SHARE-30</span>
                    <button
                      id="btn-copy-ref-code"
                      onClick={() => {
                        navigator.clipboard.writeText("NAYEL-SHARE-30");
                        addNotification("🔗 Link Copied", "Ambassador referral code copied to clipboard.", "promo");
                      }}
                      className="mt-2 text-[10px] font-bold text-black underline block cursor-pointer"
                    >
                      Copy Code
                    </button>
                  </div>
                  <div className="bg-[#F7F7F7] p-5 rounded-2xl border text-center font-mono">
                    <span className="text-[9px] text-slate-400 block font-bold uppercase font-sans mb-1">Successful Referrals</span>
                    <span className="text-lg font-black text-[#34C759]">4 Patron Friends</span>
                    <span className="text-[9px] text-slate-400 font-sans block mt-1">Total credit earned: $120.00</span>
                  </div>
                </div>
              </div>
            )}

            {/* BESPOKE CONCIERGE & CHAT SIMULATOR */}
            {activeProfileTab === "concierge" && (
              <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-6 animate-fade-in">
                <div className="border-b pb-3">
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider font-mono">Nayel Concierge Service</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Direct chat connectivity with expert interior design architects.</p>
                </div>

                {/* Chat messages history */}
                <div className="bg-[#F7F7F7] p-5 rounded-2xl border border-slate-100 space-y-4 min-h-[220px] flex flex-col justify-end">
                  <div className="space-y-3">
                    <div className="text-left max-w-sm animate-fade-in">
                      <div className="bg-white border p-3 rounded-2xl rounded-tl-none shadow-sm text-xs text-slate-600 leading-relaxed">
                        Welcome back Alex. This is Principal Architect Claire. I reviewed your living room layout blueprint calibration. Would you like to pair your warm oak coffee table with the Aurora ceramic vase trio or a burnished royal brass accent holder?
                      </div>
                      <span className="text-[9px] text-slate-400 ml-1 block mt-1 font-mono">Claire • 10:41 AM</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    id="input-concierge-msg"
                    placeholder="Ask our principal designer about fabrics, wood oils..."
                    className="flex-1 bg-[#F7F7F7] border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none"
                  />
                  <button
                    id="btn-send-concierge"
                    onClick={() => {
                      addNotification("💬 Concierge Logged", "Your query has been queued for architect review.", "system");
                      addWalletFunds(10); // surprise user for checking support!
                    }}
                    className="bg-black hover:bg-neutral-800 text-white px-5 rounded-xl text-xs font-bold uppercase cursor-pointer transition-all"
                  >
                    SEND
                  </button>
                </div>
              </div>
            )}

            {/* FIREBASE INTEGRATION & TESTING CONSOLE */}
            {activeProfileTab === "notifications" && (
              <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-6 animate-fade-in text-black">
                <div className="border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-black uppercase tracking-wider font-mono">Firebase Console Dashboard</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Configure, simulate and test FCM Push Notifications, Analytics and Crashlytics.</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#34C759] bg-[#34C759]/10 border border-[#34C759]/20 px-2.5 py-1 rounded-full uppercase font-mono">
                    Supabase Active Primary
                  </span>
                </div>

                {/* 1. Environment & Architecture Specifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#F7F7F7] p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                    <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Android Specifications</span>
                    <div className="space-y-1.5 font-sans">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Android Package ID:</span>
                        <span className="font-mono font-bold text-black select-all bg-white px-2 py-0.5 border rounded">com.nayelbasket.app</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Primary Backend:</span>
                        <span className="font-bold text-[#34C759]">Supabase DB (PostgreSQL)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Firebase Native Services:</span>
                        <span className="font-medium text-slate-800">FCM, Analytics, Crashlytics</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#F7F7F7] p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                    <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Permission & Target Status</span>
                    <div className="space-y-1.5 font-sans">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Browser Permissions:</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          notiPermission === "granted" ? "bg-[#34C759]/10 text-[#34C759]" : notiPermission === "denied" ? "bg-red-400/10 text-red-500" : "bg-slate-200 text-slate-600"
                        }`}>{notiPermission}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Platform Framework:</span>
                        <span className="font-mono text-slate-700">React 19 + Capacitor Hybrid</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Background Worker:</span>
                        <span className="text-[#34C759] font-medium">firebase-messaging-sw.js</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Push Notifications & FCM Token Registry */}
                <div className="bg-[#F7F7F7] p-5 rounded-2xl border border-slate-100 space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block font-sans">FCM Push Token Registry (Task 8)</span>
                    <button
                      id="btn-request-push-perms"
                      onClick={async () => {
                        const res = await requestNotificationPermission();
                        setNotiPermission(res);
                        setTelemetryLogs((prev) => [...prev, `[FCM] Notification request completed. Result: "${res}"`]);
                        if (res === "granted") {
                          addNotification("🔔 Notification Allowed", "Push notification permissions granted.", "system");
                        }
                      }}
                      className="px-3 py-1 bg-black text-white rounded-lg text-[10px] font-bold uppercase hover:bg-neutral-800 transition"
                    >
                      Request Permissions
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-white border p-3 rounded-xl flex items-center justify-between gap-3 font-mono text-[10px]">
                      <div className="truncate text-slate-600 flex-1">
                        {fcmToken ? fcmToken : "FCM Token not generated yet. Trigger generation below."}
                      </div>
                      {fcmToken && (
                        <button
                          id="btn-copy-fcm-token"
                          onClick={() => {
                            navigator.clipboard.writeText(fcmToken);
                            addNotification("📋 Token Copied", "FCM Device Token copied to clipboard successfully.", "system");
                            setTelemetryLogs((prev) => [...prev, `[FCM] Registration token copied to clipboard.`]);
                          }}
                          className="text-slate-400 hover:text-black transition cursor-pointer flex-shrink-0"
                          title="Copy Token"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        id="btn-generate-fcm-tok"
                        onClick={async () => {
                          setTelemetryLogs((prev) => [...prev, `[FCM] Starting registration token retrieval...`]);
                          const token = await getFcmToken();
                          if (token) {
                            setFcmTokenState(token);
                            localStorage.setItem("nb_fcm_token", token);
                            setTelemetryLogs((prev) => [...prev, `[FCM] Token synchronized: "${token.substring(0, 32)}..."`]);
                            addNotification("🔑 FCM Device Registered", "FCM Registration Token generated and cached successfully.", "system");
                          }
                        }}
                        className="px-4 py-2 bg-[#34C759] hover:bg-[#2eb14f] text-white rounded-xl text-[10px] font-bold uppercase transition"
                      >
                        Generate / Refresh FCM Token
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Push Messaging Simulation Toolkit (Task 9) */}
                <div className="border border-slate-100 rounded-2xl p-4 space-y-4">
                  <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block font-sans">FCM Lifecycle Push Simulator (Task 9)</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* FOREGROUND SIMULATOR */}
                    <div className="bg-[#F7F7F7] p-4 rounded-xl border flex flex-col justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-black block mb-1">Foreground State Push</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed">Fires an immediate push alert processed in-app while the user is actively viewing this page.</p>
                      </div>
                      <button
                        id="btn-sim-foreground-push"
                        onClick={() => {
                          setTelemetryLogs((prev) => [...prev, `[FCM Sim] Dispatched Foreground Notification request`]);
                          
                          // Trigger standard web standard native notify API
                          if (notiPermission === "granted") {
                            try {
                              new Notification("✨ Nayel Basket Curation Alert", {
                                body: "Exclusive Midnight Matte ceramic vase set is now 20% off!",
                                icon: "/assets/logo.png"
                              });
                            } catch (e) {
                              console.warn("Native browser Notification trigger blocked or rejected:", e);
                            }
                          }

                          // Trigger react foreground hook simulation
                          const fcmMsgPayload = {
                            notification: {
                              title: "✨ Nayel Basket Curation Alert",
                              body: "Exclusive Midnight Matte ceramic vase set is now 20% off!"
                            }
                          };
                          // Emit event
                          const event = new CustomEvent("nb-foreground-msg", { detail: fcmMsgPayload });
                          window.dispatchEvent(event);

                          // Local notification log
                          setNotificationLogs((prev) => [
                            {
                              id: Date.now().toString(),
                              title: "✨ Curation Alert (Foreground)",
                              body: "Exclusive Midnight Matte ceramic vase set is now 20% off!",
                              timestamp: new Date().toLocaleTimeString(),
                              type: "foreground"
                            },
                            ...prev
                          ]);
                          addNotification("✨ Curation Alert", "Exclusive Midnight Matte ceramic vase set is now 20% off!", "system");
                        }}
                        className="w-full py-2 bg-black text-white hover:bg-neutral-800 font-bold uppercase text-[9px] tracking-wider rounded-lg transition"
                      >
                        Simulate Foreground Push
                      </button>
                    </div>

                    {/* BACKGROUND SIMULATOR */}
                    <div className="bg-[#F7F7F7] p-4 rounded-xl border flex flex-col justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-black block mb-1">Background State (5s Delay)</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed">Schedules a background notification. Press simulate, then switch tabs or minimize browser immediately to test background execution!</p>
                      </div>
                      <button
                        id="btn-sim-background-push"
                        onClick={() => {
                          setTelemetryLogs((prev) => [...prev, `[FCM Sim] Scheduled background notification in 5 seconds. Minimize / hide tab now!`]);
                          addNotification("⏰ Background Task Scheduled", "Background notification scheduled in 5 seconds. Please minimize your window.", "system");
                          
                          setTimeout(() => {
                            if (document.visibilityState === "hidden") {
                              setTelemetryLogs((prev) => [...prev, `[FCM Sim] Document hidden. Background push triggered through Service Worker.`]);
                              if (notiPermission === "granted") {
                                try {
                                  new Notification("🔔 Elite Concierge Update", {
                                    body: "Architect Claire has approved your tailored walnut living room design suggestions.",
                                    icon: "/assets/logo.png"
                                  });
                                } catch (e) {
                                  navigator.serviceWorker.ready.then((reg) => {
                                    reg.showNotification("🔔 Elite Concierge Update", {
                                      body: "Architect Claire has approved your tailored walnut living room design suggestions."
                                    });
                                  });
                                }
                              }
                            } else {
                              setTelemetryLogs((prev) => [...prev, `[FCM Sim] Document visible. Fallback alert triggered (switch tabs next time).`]);
                              addNotification("🔔 Elite Concierge Update", "Architect Claire has approved your tailored walnut living room design suggestions.", "system");
                            }

                            setNotificationLogs((prev) => [
                              {
                                id: Date.now().toString(),
                                title: "🔔 Concierge Update (Background)",
                                body: "Architect Claire has approved your tailored walnut living room design suggestions.",
                                timestamp: new Date().toLocaleTimeString(),
                                type: "background"
                              },
                              ...prev
                            ]);
                          }, 5000);
                        }}
                        className="w-full py-2 bg-black text-white hover:bg-neutral-800 font-bold uppercase text-[9px] tracking-wider rounded-lg transition"
                      >
                        Simulate Background Push
                      </button>
                    </div>

                    {/* TERMINATED STATE SIMULATOR */}
                    <div className="bg-[#F7F7F7] p-4 rounded-xl border flex flex-col justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-black block mb-1">Terminated (Cold Boot) state</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed">Simulates launching a completely closed/terminated app from clicking a system tray notification, routing the user instantly to their orders.</p>
                      </div>
                      <button
                        id="btn-sim-terminated-push"
                        onClick={() => {
                          setTelemetryLogs((prev) => [...prev, `[Capacitor Native Sim] Cold boot initiated with notification payload`]);
                          setTelemetryLogs((prev) => [...prev, `[Capacitor Native Sim] Routing user: /orders-history`]);
                          
                          // Trigger mock cold-boot navigation routing behavior
                          setActiveProfileTab("orders");
                          addNotification("🚀 Cold Boot Successful", "Simulated launching terminated app. User routed to orders history.", "system");
                          
                          setNotificationLogs((prev) => [
                            {
                              id: Date.now().toString(),
                              title: "🚀 Cold Boot (Terminated App)",
                              body: "User launched terminated app, routed to purchases.",
                              timestamp: new Date().toLocaleTimeString(),
                              type: "terminated"
                            },
                            ...prev
                          ]);
                        }}
                        className="w-full py-2 bg-black text-white hover:bg-neutral-800 font-bold uppercase text-[9px] tracking-wider rounded-lg transition"
                      >
                        Simulate Terminated Boot
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Firebase Analytics & Crashlytics Integration Testing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CRASHLYTICS PANEL */}
                  <div className="border border-slate-100 p-4 rounded-2xl space-y-3 text-xs">
                    <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Firebase Crashlytics Test Console (Task 6)</span>
                    <div className="space-y-2">
                      <button
                        id="btn-test-fatal-crash"
                        onClick={() => {
                          const err = new Error("FATAL EXCEPTION: IndexOutOfBounds in native thread block com.nayelbasket.app");
                          logCrashlyticsError(err, true);
                          setTelemetryLogs((prev) => [...prev, `[Crashlytics] Logged fatal exception stack trace to server.`]);
                          addNotification("🐞 Fatal Crash Logged", "Simulated Android Application fatal crash logged in Crashlytics.", "system");
                        }}
                        className="w-full py-2 bg-red-500 hover:bg-red-600 text-white font-bold uppercase text-[9px] tracking-wider rounded-lg transition"
                      >
                        Trigger Fatal Crash Log
                      </button>

                      <button
                        id="btn-test-nonfatal-crash"
                        onClick={() => {
                          const err = new Error("NON-FATAL CAUGHT EXCEPTION: Supabase network timeout, using local SQLite cache");
                          logCrashlyticsError(err, false);
                          setTelemetryLogs((prev) => [...prev, `[Crashlytics] Logged caught exception log to console.`]);
                          addNotification("🐞 Non-Fatal Logged", "Simulated caught exception logged to Crashlytics.", "system");
                        }}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase text-[9px] tracking-wider rounded-lg transition"
                      >
                        Trigger Caught Exception Log
                      </button>
                    </div>
                  </div>

                  {/* ANALYTICS PANEL */}
                  <div className="border border-slate-100 p-4 rounded-2xl space-y-3 text-xs">
                    <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Firebase Analytics Dispatcher (Task 5)</span>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          placeholder="Event: view_item"
                          value={customEvent}
                          onChange={(e) => setCustomEvent(e.target.value)}
                          className="bg-[#F7F7F7] border border-slate-200 rounded-lg p-2 text-[10px] focus:outline-none"
                        />
                        <input
                          placeholder="Params: category:Living"
                          value={customEventParams}
                          onChange={(e) => setCustomEventParams(e.target.value)}
                          className="bg-[#F7F7F7] border border-slate-200 rounded-lg p-2 text-[10px] focus:outline-none"
                        />
                      </div>
                      <button
                        id="btn-dispatch-analytics"
                        onClick={() => {
                          const name = customEvent.trim() || "test_custom_event";
                          let paramsObj = { simulated_user: "alex_rivera" };
                          if (customEventParams) {
                            try {
                              const pair = customEventParams.split(":");
                              if (pair.length === 2) {
                                paramsObj[pair[0].trim()] = pair[1].trim();
                              }
                            } catch (e) {
                              console.warn("Error parsing event parameters:", e);
                            }
                          }
                          logAnalyticsEvent(name, paramsObj);
                          setTelemetryLogs((prev) => [...prev, `[Analytics] Logged Event "${name}" with params: ${JSON.stringify(paramsObj)}`]);
                          addNotification("📊 Event Dispatched", `Successfully tracked custom event: ${name}`, "system");
                          setCustomEvent("");
                          setCustomEventParams("");
                        }}
                        className="w-full py-2 bg-black text-white hover:bg-neutral-800 font-bold uppercase text-[9px] tracking-wider rounded-lg transition"
                      >
                        Dispatch Event
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5. Live Logs & Telemetry Console */}
                <div className="bg-neutral-900 rounded-2xl p-4 font-mono text-[9px] leading-relaxed text-[#34C759] space-y-2 border border-neutral-800">
                  <div className="flex justify-between items-center text-[10px] font-bold border-b border-neutral-800 pb-2 text-white">
                    <span>SYSTEM TELEMETRY TERMINAL LOG</span>
                    <button
                      id="btn-clear-telemetry"
                      onClick={() => setTelemetryLogs(["[System] Telemetry cleared."])}
                      className="text-neutral-400 hover:text-white uppercase tracking-wider text-[8px] cursor-pointer"
                    >
                      Clear Log
                    </button>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 scrollbar-thin">
                    {telemetryLogs.map((log, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="text-neutral-500 flex-shrink-0">[{new Date().toLocaleTimeString()}]</span>
                        <span className="break-all">{log}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Push Notification Receipts Ledger */}
                <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
                  <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Notification Recieved Ledger</span>
                  <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto pr-1">
                    {notificationLogs.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-[10px] font-light">
                        No push notifications captured in this session.
                      </div>
                    ) : (
                      notificationLogs.map((log) => (
                        <div key={log.id} className="py-2.5 flex justify-between items-start gap-3">
                          <div className="min-w-0">
                            <span className="font-bold text-black text-[11px] block">{log.title}</span>
                            <span className="text-slate-500 text-[10px] block mt-0.5 leading-normal">{log.body}</span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-[8px] text-slate-400 font-mono block">{log.timestamp}</span>
                            <span className={`inline-block text-[8px] font-black uppercase px-1 rounded mt-1 ${
                              log.type === "foreground" ? "bg-blue-400/10 text-blue-500" : log.type === "background" ? "bg-amber-400/10 text-amber-500" : "bg-purple-400/10 text-purple-500"
                            }`}>{log.type}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY & DEVICE SESSION LEDGER */}
            {activeProfileTab === "security" && (
              <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-6 animate-fade-in text-black">
                <div className="border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-black uppercase tracking-wider font-mono">Secured Patron Credentials</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Manage biometric WebAuthn keys, active device sessions, and login histories.</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#34C759] bg-[#34C759]/10 border border-[#34C759]/20 px-2.5 py-1 rounded-full uppercase font-mono">
                    Device Node Secure
                  </span>
                </div>

                {/* Biometrics Configuration Panel */}
                <div className="bg-[#F7F7F7] p-5 rounded-2xl border border-slate-100 space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[11px] text-black uppercase tracking-wider block font-sans">Biometric Credentials (Face ID / Fingerprint)</span>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Secure your connoisseur profile with lightning fast biometrics built directly on secure enclave frameworks.</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      isBiometricRegistered ? "bg-[#34C759]/10 text-[#34C759]" : "bg-neutral-200 text-slate-500 font-medium"
                    }`}>
                      {isBiometricRegistered ? "REGISTERED" : "INACTIVE"}
                    </span>
                  </div>

                  <button
                    id="btn-toggle-biometrics-reg"
                    onClick={() => {
                      if (isBiometricRegistered) {
                        setIsBiometricRegistered(false);
                        localStorage.setItem("nb_biometric_registered", "false");
                        addNotification("🛡️ Biometrics Removed", "WebAuthn biometric credentials successfully de-registered.", "system");
                      } else {
                        setBiometricPromptType("face");
                        setShowBiometricPrompt(true);
                        setTimeout(() => {
                          setShowBiometricPrompt(false);
                          setIsBiometricRegistered(true);
                          localStorage.setItem("nb_biometric_registered", "true");
                          addNotification("🛡️ Biometrics Registered", "Successfully registered WebAuthn biometric credentials inside local secure chip.", "system");
                        }, 2200);
                      }
                    }}
                    className={`w-full py-3 font-bold uppercase text-[10px] tracking-wider rounded-xl transition cursor-pointer ${
                      isBiometricRegistered 
                        ? "bg-red-500 hover:bg-red-600 text-white" 
                        : "bg-black hover:bg-neutral-800 text-white"
                    }`}
                  >
                    {isBiometricRegistered ? "DE-REGISTER BIOMETRICS" : "REGISTER DEVICE BIOMETRICS (WEBAUTHN)"}
                  </button>
                </div>

                {/* Connected Devices Session Manager */}
                <div className="space-y-3">
                  <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Connected Devices & Session Management</span>
                  <div className="space-y-2">
                    {sessionDevices.map((dev) => (
                      <div key={dev.id} className="bg-[#F7F7F7] border border-slate-100 p-4 rounded-2xl flex justify-between items-center gap-4 text-xs">
                        <div className="flex gap-3 items-center">
                          <div className="p-2 bg-white rounded-xl border flex-shrink-0 text-slate-500">
                            {dev.name.includes("iPhone") || dev.name.includes("iPad") ? "📱" : "💻"}
                          </div>
                          <div>
                            <span className="font-bold text-black block flex items-center gap-2">
                              {dev.name}
                              {dev.current && (
                                <span className="text-[8px] bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20 px-1.5 py-0.5 rounded uppercase font-mono">Current</span>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{dev.location} • IP: {dev.ip}</span>
                          </div>
                        </div>

                        {!dev.current && (
                          <button
                            id={`btn-revoke-session-${dev.id}`}
                            onClick={() => {
                              setSessionDevices((prev) => prev.filter((d) => d.id !== dev.id));
                              addNotification("🛡️ Session Revoked", `The device session for ${dev.name} was successfully terminated.`, "system");
                            }}
                            className="px-2.5 py-1 bg-red-400/10 hover:bg-red-400/15 text-red-500 border border-red-400/20 rounded-lg text-[9px] font-bold uppercase cursor-pointer"
                          >
                            REVOKE
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Audit Ledger (Login History) */}
                <div className="space-y-3">
                  <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Security Audit Log (Login History)</span>
                  <div className="bg-[#F7F7F7] border border-slate-100 p-4 rounded-2xl max-h-48 overflow-y-auto divide-y divide-slate-200/50">
                    {loginHistory.map((log, index) => (
                      <div key={index} className="py-2.5 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-black block">{log.device}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{log.location} • Status: {log.status}</span>
                        </div>
                        <span className="font-mono text-[9px] text-slate-400">{log.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            </div>

            {/* Right Side Column (Gateways & Settings) */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Management Gateways */}
              <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-4 animate-fade-in">
                <h3 className="text-sm font-bold text-black uppercase tracking-wider border-b pb-3 font-mono">Management Consoles</h3>
                <div className="space-y-2">
                  <button
                    id="btn-goto-seller"
                    onClick={onSelectSeller}
                    className="w-full py-4 bg-[#F7F7F7] hover:bg-neutral-100 border text-black text-xs font-bold rounded-2xl tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Compass className="h-4 w-4 text-[#34C759]" />
                    <span>ENTER SELLER PANEL</span>
                  </button>

                  <button
                    id="btn-goto-admin"
                    onClick={onSelectAdmin}
                    className="w-full py-4 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-2xl tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <ShieldCheck className="h-4 w-4 text-[#34C759]" />
                    <span>ENTER ADMIN CONSOLE</span>
                  </button>
                </div>
              </div>

              {/* Preferences Settings */}
              <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-black uppercase tracking-wider border-b pb-3 font-mono">App Preferences</h3>
                
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-black block">Haptic Interactions</span>
                      <span className="text-[10px] text-slate-400 font-light block mt-0.5">Delightful subtle UI touch clicks.</span>
                    </div>
                    <div className="w-10 h-6 bg-[#34C759] rounded-full p-1 flex items-center justify-end cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full shadow"></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-black block">High Contrast Mode</span>
                      <span className="text-[10px] text-slate-400 font-light block mt-0.5">Deep ink-black high-fidelity fonts.</span>
                    </div>
                    <div className="w-10 h-6 bg-[#34C759] rounded-full p-1 flex items-center justify-end cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full shadow"></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t pt-4">
                    <button
                      id="btn-profile-logout"
                      onClick={() => {
                        addNotification("🚪 Graceful Logout", "You have gracefully logged out. All session tokens cleared.", "system");
                        setCustomerUser(null);
                        localStorage.removeItem("nb_customer_user");
                        setActiveSection("home");
                      }}
                      className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-widest cursor-pointer"
                    >
                      LOG OUT ACCOUNT
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* AI STYLIST SECTION */}
      {activeSection === "ai" && (
        <div className="space-y-6 pb-16 animate-fade-in">
          <AIChat />
        </div>
      )}

    </div>
  );
};
