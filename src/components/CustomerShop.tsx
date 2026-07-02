/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Product, CartItem, Address, Order } from "../types";
import { ProductCard } from "./ProductCard";
import { ProductDetail } from "./ProductDetail";
import { AIChat } from "./AIChat";
import { 
  onForegroundMessage,
  logAnalyticsEvent
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
  Plus,
  Compass,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Tag,
  Heart,
  Star,
  ChevronDown,
  X,
  Volume2,
  VolumeX,
  CheckCircle2,
  Cpu,
  Smartphone,
  Mic,
  Camera
} from "lucide-react";

interface CustomerShopProps {
  activeSection: "home" | "categories" | "wishlist" | "cart" | "profile" | "ai" | "orders";
  setActiveSection: (sec: "home" | "categories" | "wishlist" | "cart" | "profile" | "ai" | "orders") => void;
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
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    walletBalance,
    addWalletFunds,
    rewardPoints,
    recentlyViewed,
    addToRecentlyViewed,
    addNotification,
    theme,
    toggleTheme,
    themePreference,
    setThemePreference
  } = useApp();

  // Core States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeProfileTab, setActiveProfileTab] = useState<"dashboard" | "orders" | "addresses" | "coupons" | "security" | "telemetry" | "referral">("dashboard");

  // Payment gateway simulation states
  const [paymentStep, setPaymentStep] = useState<"idle" | "gateway_select" | "processing" | "success" | "failed">("idle");
  const [paymentGatewayType, setPaymentGatewayType] = useState<"Stripe" | "Razorpay" | "PhonePe" | "GPay" | "Paytm" | "COD">("Stripe");
  const [paymentLogs, setPaymentLogs] = useState<string[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState<Order | null>(null);
  const [testFailureToggle, setTestFailureToggle] = useState(false);
  const [showRefundTracker, setShowRefundTracker] = useState(false);
  const [refundTrackingId, setRefundTrackingId] = useState<string | null>(null);
  const [refundStatusStep, setRefundStatusStep] = useState<number>(0);

  // Referral states
  const [referralCode, setReferralCode] = useState(() => {
    const existing = localStorage.getItem("nb_referral_code");
    if (existing) return existing;
    const generated = `NAYEL-PATRON-${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem("nb_referral_code", generated);
    return generated;
  });
  const [referralWalletBalance, setReferralWalletBalance] = useState(() => {
    const existing = localStorage.getItem("nb_referral_wallet");
    return existing ? Number(existing) : 150; // default starting rewards
  });
  const [referralsHistory, setReferralsHistory] = useState([
    { name: "Aurelia Vance", date: "2026-06-15", status: "Completed", reward: 50 },
    { name: "Dorian Gray", date: "2026-06-28", status: "Pending purchase", reward: 0 },
    { name: "Seraphina Sterling", date: "2026-07-01", status: "Completed", reward: 50 }
  ]);

  // PWA Install States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    return window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true;
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else {
      addNotification("📱 PWA Installation Guide", "To install: click your browser's menu (or Share button on iOS Safari) and select 'Add to Home Screen' or 'Install App'.", "system");
    }
  };

  // Voice & Image search states
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [showImageSearchDrawer, setShowImageSearchDrawer] = useState(false);
  const [showCatalogScanner, setShowCatalogScanner] = useState(false);

  // Video Autoplay Hero Carousel state
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  // Flash Sale Countdown state
  const [countdownTime, setCountdownTime] = useState({ hours: 4, minutes: 34, seconds: 19 });

  // Custom logging / telemetry states
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>(["[System] Nayel Basket client loaded.", "[System] High-end aesthetics active."]);
  const [notificationLogs, setNotificationLogs] = useState<any[]>([]);

  // Biometrics simulation
  const [isBiometricRegistered, setIsBiometricRegistered] = useState(() => {
    return localStorage.getItem("nb_biometric_registered") === "true";
  });
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);

  // Address inputs
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddrName, setNewAddrName] = useState("");
  const [newAddrPhone, setNewAddrPhone] = useState("");
  const [newAddrStreet, setNewAddrStreet] = useState("");
  const [newAddrCity, setNewAddrCity] = useState("");
  const [newAddrState, setNewAddrState] = useState("");
  const [newAddrZip, setNewAddrZip] = useState("");

  // Checkout inputs
  const [checkoutAddressId, setCheckoutAddressId] = useState(addresses[0]?.id || "");
  const [checkoutPayment, setCheckoutPayment] = useState<"Card" | "UPI" | "COD" | "Wallet">("Card");
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [viewedOrder, setViewedOrder] = useState<Order | null>(null);

  // Reels (Inspiration videos) active states
  const [activeReelId, setActiveReelId] = useState<string | null>(null);
  const [showShopLookDrawer, setShowShopLookDrawer] = useState(false);
  const [lookProducts, setLookProducts] = useState<Product[]>([]);

  // Autoplay video items
  const heroVideos = [
    {
      url: "https://assets.mixkit.co/videos/preview/mixkit-decorating-a-warm-living-room-41561-large.mp4",
      title: "SLOW LIVING",
      subtitle: "Sanctuary Design",
      desc: "Warm earth tones, organic clay artifacts, and European solid oak."
    },
    {
      url: "https://assets.mixkit.co/videos/preview/mixkit-sunlight-on-a-modern-living-room-41564-large.mp4",
      title: "SPATIAL POETRY",
      subtitle: "Bespoke Furnishings",
      desc: "Handmade ceramic silhouettes and tailored textured coordinates."
    },
    {
      url: "https://assets.mixkit.co/videos/preview/mixkit-designer-arranging-organic-vases-on-table-41568-large.mp4",
      title: "ARCHITECTURAL HARMONY",
      subtitle: "Sculptural Lighting",
      desc: "Delicate mouth-blown glassware and ambient candlelit atmospheres."
    }
  ];

  // Categories list
  const categoriesList = [
    "All", 
    "Living Room", 
    "Bedroom", 
    "Dining", 
    "Kitchen", 
    "Lighting", 
    "Wall Decor", 
    "Plants", 
    "Furniture", 
    "Storage"
  ];

  // Category image lookups (95% visual luxury matching)
  const categoryImages: Record<string, string> = {
    "All": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=150&q=80",
    "Living Room": "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=150&q=80",
    "Bedroom": "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=150&q=80",
    "Dining": "https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&w=150&q=80",
    "Kitchen": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=150&q=80",
    "Lighting": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=150&q=80",
    "Wall Decor": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=150&q=80",
    "Plants": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=150&q=80",
    "Furniture": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=150&q=80",
    "Storage": "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=150&q=80"
  };

  // Curated inspiration lookbooks (stories / reels)
  const inspirationVideos = [
    {
      id: "insp_1",
      title: "Cozy Linen Sanctuary",
      category: "Bedroom",
      desc: "Layering tactile natural linen duvet sets with soft beige ceramic lighting.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hand-feeling-the-fabric-of-a-white-shirt-40742-large.mp4",
      posterUrl: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=300&q=80",
      items: ["6", "12"] // Product IDs
    },
    {
      id: "insp_2",
      title: "The Sculptural Coffee Ritual",
      category: "Living Room",
      desc: "Pristine morning sunlight cascading over amber clay pots and European oak surfaces.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-pouring-hot-water-into-a-french-press-43310-large.mp4",
      posterUrl: "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=300&q=80",
      items: ["1", "4", "13"]
    },
    {
      id: "insp_3",
      title: "Luminous Candlelit Feasts",
      category: "Dining",
      desc: "Styling stoneware plates and brass candle coordinates for slow twilight gatherings.",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-putting-a-candle-holder-on-the-dinner-table-41566-large.mp4",
      posterUrl: "https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&w=300&q=80",
      items: ["2", "5"]
    }
  ];

  // Auto transition hero video slides
  useEffect(() => {
    const videoTimer = setInterval(() => {
      setActiveVideoIndex((prev) => (prev + 1) % heroVideos.length);
    }, 8000);
    return () => clearInterval(videoTimer);
  }, []);

  // Ticking countdown effect for flash sale
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownTime((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 4, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync Foreground Push notifications via real FCM hooks
  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload) => {
      const title = payload.notification?.title || "New Curation Release";
      const body = payload.notification?.body || "A rare minimalist release is live.";
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
      addNotification(title, body, "system");
      setTelemetryLogs((prev) => [...prev, `[FCM] Notification: "${title}"`]);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Helpers
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    addToRecentlyViewed(product);
  };

  const handleApplyCouponCode = () => {
    if (!couponCodeInput.trim()) return;
    const success = applyCoupon(couponCodeInput.trim());
    if (success) {
      addNotification("🎟️ Promo Activated", `Coupon Code "${couponCodeInput.toUpperCase()}" applied successfully!`, "system");
      setCouponCodeInput("");
    } else {
      addNotification("⚠️ Invalid Voucher", `The code "${couponCodeInput}" is expired or invalid.`, "system");
    }
  };

  const handlePlaceSecureOrder = () => {
    const matchedAddress = addresses.find((a) => a.id === checkoutAddressId) || addresses[0];
    if (!matchedAddress) {
      addNotification("⚠️ Delivery Address Missing", "Please configure and select a shipping address.", "system");
      return;
    }
    // Set matching gateway type
    let targetGateway: "Stripe" | "Razorpay" | "PhonePe" | "GPay" | "Paytm" | "COD" = "Stripe";
    if (checkoutPayment === "UPI") targetGateway = "PhonePe";
    else if (checkoutPayment === "Wallet") targetGateway = "Paytm";
    else if (checkoutPayment === "COD") targetGateway = "COD";
    setPaymentGatewayType(targetGateway);
    setPaymentStep("gateway_select");
  };

  const triggerPaymentHandshake = (bypassFailure = false) => {
    setPaymentLogs([]);
    setPaymentStep("processing");

    const logsList = [
      "Establishing TLS 1.3 socket layer handshake with secure credentials...",
      "Generating ephemeral token keys using server-side security protocols...",
      "Verifying client-side CSRF and JWT authentication header layers...",
      "Performing velocity-based automated anti-fraud security scan...",
      "Contacting merchant bank clearing network to settle authorized balance..."
    ];

    logsList.forEach((log, idx) => {
      setTimeout(() => {
        setPaymentLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
      }, (idx + 1) * 500);
    });

    setTimeout(() => {
      const isFailed = testFailureToggle && !bypassFailure;
      if (isFailed) {
        setPaymentStep("failed");
        addNotification("❌ Payment Authorization Failed", "Transaction declined by card issuer bank node.", "system");
      } else {
        const matchedAddress = addresses.find((a) => a.id === checkoutAddressId) || addresses[0];
        const placed = placeOrder(matchedAddress || { id: "default", name: "Patron", phone: "+1", street: "Atelier Suite", city: "Nayel Node", state: "NY", zip: "10001" }, checkoutPayment);
        if (placed) {
          setViewedOrder(placed);
          setPaymentStep("success");
          logAnalyticsEvent("purchase_complete", { order_id: placed.id, total: placed.total });
          addNotification("✨ Order Placed Successfully", `Transaction ID: ${placed.id}. Ready to dispatch.`, "system");
        } else {
          setPaymentStep("failed");
          addNotification("❌ Order Placement Exception", "Fulfillment node rejected database lock.", "system");
        }
      }
    }, (logsList.length + 1) * 500);
  };

  const handleOpenShopLook = (itemIds: string[]) => {
    const matchedProds = products.filter((p) => itemIds.includes(p.id));
    setLookProducts(matchedProds);
    setShowShopLookDrawer(true);
  };

  // Filtered Products for Catalog
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery.trim() || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Hot Curated Products for Home View
  const homeTrendingProducts = products.slice(0, 4);

  // Suggested search matches for instant overlay typing
  const suggestedSearchMatches = searchQuery.trim() 
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  // Floating suggestion category matches
  const suggestedCategoryMatches = searchQuery.trim()
    ? categoriesList.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()) && c !== "All")
    : [];

  if (selectedProduct) {
    return (
      <ProductDetail 
        product={selectedProduct} 
        onBack={() => setSelectedProduct(null)} 
        onSelectProduct={handleProductSelect}
      />
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-white dark:bg-[#121212] transition-colors duration-300 pb-28">
      
      {/* 1. HOME SCREEN VIEW */}
      {activeSection === "home" && (
        <div className="animate-fade-in space-y-8">
          
          {/* SEARCH BAR AREA */}
          <div className="px-4 pt-5 relative z-40">
            <div className="relative">
              {/* Premium rounded search bar exactly like reference */}
              <div className="flex items-center w-full h-[52px] rounded-[26px] bg-[#F5F5F5] dark:bg-[#1A1A1A] border border-transparent dark:border-neutral-800 shadow-sm transition-all focus-within:shadow-md pr-4 pl-4.5">
                <Search className="h-5 w-5 text-slate-400 mr-2.5 flex-shrink-0" />
                <input
                  id="home-instant-search"
                  type="text"
                  placeholder="Search furniture, decor, lighting..."
                  className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none h-full font-sans"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition text-xs mr-2 cursor-pointer"
                  >
                    ✕
                  </button>
                )}

                {/* Voice Search Mic Button */}
                <button
                  id="btn-voice-search-trigger"
                  onClick={() => {
                    setIsVoiceSearching(true);
                    addNotification("🎤 Calibration Active", "Listening for premium conceptual cordinates...", "system");
                    setTimeout(() => {
                      setIsVoiceSearching(false);
                      const samples = ["Minimalist Ceramic Vase", "European Oak Armchair", "Amber Scented Candle"];
                      const chosen = samples[Math.floor(Math.random() * samples.length)];
                      setSearchQuery(chosen);
                    }, 2200);
                  }}
                  className="p-1.5 text-slate-400 hover:text-[#D4AF37] transition cursor-pointer mr-1"
                  title="Voice Search"
                >
                  <Mic className="h-5 w-5 stroke-[1.8]" />
                </button>

                {/* Image Search Camera Button */}
                <button
                  id="btn-image-search-trigger"
                  onClick={() => setShowImageSearchDrawer(true)}
                  className="p-1.5 text-slate-400 hover:text-[#D4AF37] transition cursor-pointer"
                  title="Image Search"
                >
                  <Camera className="h-5 w-5 stroke-[1.8]" />
                </button>
              </div>

              {/* FLOATING DROPDOWN SUGGESTIONS (Only when typing) */}
              {searchQuery.trim() && (
                <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#1C1C1C] border border-slate-100 dark:border-neutral-800 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_50px_rgba(0,0,0,0.45)] z-50 max-h-[360px] overflow-y-auto divide-y divide-slate-50 dark:divide-neutral-850 animate-fade-in">
                  {/* Category matches */}
                  {suggestedCategoryMatches.map((cat) => (
                    <div
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setActiveSection("categories");
                        setSearchQuery("");
                      }}
                      className="p-3.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-850 cursor-pointer flex justify-between items-center transition"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-[#D4AF37]">📁</span>
                        <span>Shop Category: <strong className="text-neutral-950 dark:text-white">{cat}</strong></span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  ))}

                  {/* Product matches */}
                  {suggestedSearchMatches.length > 0 ? (
                    suggestedSearchMatches.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          handleProductSelect(prod);
                          setSearchQuery("");
                        }}
                        className="p-3.5 hover:bg-slate-50 dark:hover:bg-neutral-850 cursor-pointer flex gap-3.5 items-center transition-colors"
                      >
                        <img 
                          src={prod.image} 
                          alt={prod.name}
                          className="w-11 h-11 object-cover rounded-lg border border-slate-100 dark:border-neutral-800 bg-slate-50" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">{prod.name}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans tracking-wide mt-0.5">{prod.category} • {prod.brand}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-neutral-900 dark:text-white">${prod.price}</span>
                          <span className="text-[8px] text-[#D4AF37] block font-semibold mt-0.5 uppercase tracking-wider">Inspect</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-xs font-light">
                      No curated coordinates found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* VOICE RECOGNITION WAVE ANIMATION */}
          {isVoiceSearching && (
            <div className="mx-4 bg-neutral-950 text-white rounded-2xl p-5 border border-neutral-800 text-center space-y-3 shadow-lg">
              <span className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-widest font-black block">Voice Decoder Active</span>
              <div className="flex justify-center items-center gap-1.5 py-1.5">
                <span className="w-1 bg-[#D4AF37] h-6 rounded-full animate-pulse"></span>
                <span className="w-1 bg-[#D4AF37] h-9 rounded-full animate-pulse delay-75"></span>
                <span className="w-1 bg-[#D4AF37] h-11 rounded-full animate-pulse delay-150"></span>
                <span className="w-1 bg-[#D4AF37] h-7 rounded-full animate-pulse delay-75"></span>
              </div>
              <p className="text-xs text-slate-300 font-light italic">"Listening... speak now..."</p>
            </div>
          )}

          {/* IMAGE SELECTION OVERLAY */}
          {showImageSearchDrawer && (
            <div className="mx-4 bg-white dark:bg-[#1A1A1A] border border-slate-100 dark:border-neutral-800 rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-neutral-850">
                <span className="text-[9px] font-bold text-[#D4AF37] tracking-wider uppercase font-sans">Visual Mood Analyzer</span>
                <button onClick={() => setShowImageSearchDrawer(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { query: "vessel", name: "Amber Pots", img: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=150&q=80" },
                  { query: "oak", name: "Oak Wood", img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=150&q=80" },
                  { query: "candle", name: "Scented lit", img: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=150&q=80" }
                ].map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSearchQuery(item.query);
                      setShowImageSearchDrawer(false);
                      addNotification("📷 Image Search Matches", `Matched visual style: ${item.name}`, "system");
                    }}
                    className="relative aspect-square rounded-lg overflow-hidden border border-slate-100 dark:border-neutral-800 cursor-pointer group"
                  >
                    <img src={item.img} alt={item.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition" />
                    <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                      <span className="text-[8px] font-bold text-white tracking-wide truncate">{item.name}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setSearchQuery("stoneware");
                  setShowImageSearchDrawer(false);
                  addNotification("📷 Gallery Image Imported", "Analyzed custom lookbook layout successfully.", "system");
                }}
                className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-[10px] uppercase text-center cursor-pointer"
              >
                Upload custom interior photo
              </button>
            </div>
          )}

          {/* CURATED SHORTCUT BUTTONS BELOW SEARCH */}
          <div className="grid grid-cols-2 gap-3 px-4">
            {/* AI Assistant Button */}
            <button
              onClick={() => {
                setActiveSection("ai");
                if (navigator.vibrate) navigator.vibrate(10);
              }}
              className="relative overflow-hidden group h-[54px] rounded-2xl bg-black dark:bg-[#1C1C1C] text-white flex items-center justify-center gap-2 cursor-pointer transition hover:bg-neutral-900 active:scale-95 shadow-sm border border-neutral-800/20"
            >
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-[#D4AF37] rounded-full filter blur-xl opacity-20 group-hover:opacity-40 transition-all duration-700"></div>
              <Sparkles className="h-4 w-4 text-[#D4AF37] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider font-sans text-neutral-100 group-hover:text-white transition">
                AI Assistant
              </span>
            </button>

            {/* Decor Ideas Button */}
            <button
              onClick={() => {
                setSelectedCategory("Wall Decor");
                setActiveSection("categories");
                if (navigator.vibrate) navigator.vibrate(10);
              }}
              className="h-[54px] rounded-2xl bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white flex items-center justify-center gap-2 cursor-pointer transition border border-neutral-100 dark:border-neutral-800/80 hover:bg-slate-50 dark:hover:bg-neutral-850 active:scale-95 shadow-sm"
            >
              <Compass className="h-4 w-4 text-[#D4AF37]" />
              <span className="text-xs font-bold uppercase tracking-wider font-sans">
                Decor Ideas
              </span>
            </button>
          </div>

          {/* LARGE AUTOPLAY HERO VIDEO CAROUSEL */}
          <div className="px-4 relative group">
            <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full rounded-3xl overflow-hidden shadow-xl bg-black">
              {heroVideos.map((v, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 transition-all duration-[1200ms] ease-in-out ${
                    i === activeVideoIndex ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-105 pointer-events-none"
                  }`}
                >
                  <video
                    src={v.url}
                    autoPlay
                    muted={isVideoMuted}
                    loop
                    playsInline
                    style={{ height: "225px" }}
                    className="w-full h-full object-cover filter brightness-[0.7]"
                  />
                  
                  {/* Luxury Typography Overlay */}
                  <div className="absolute inset-x-6 bottom-6 flex flex-col items-start text-white space-y-1 sm:space-y-2">
                    <span className="text-[9px] font-bold text-[#D4AF37] tracking-[0.25em] uppercase font-mono">
                      {v.title}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase leading-none">
                      {v.subtitle}
                    </h2>
                    <p className="text-[10px] sm:text-xs text-slate-300 font-light max-w-xs leading-relaxed truncate">
                      {v.desc}
                    </p>
                    <button
                      onClick={() => {
                        setActiveSection("categories");
                        if (navigator.vibrate) navigator.vibrate(10);
                      }}
                      className="mt-1.5 px-4.5 py-2 bg-white text-neutral-950 font-sans font-bold text-[9px] tracking-widest rounded-full uppercase hover:bg-[#D4AF37] hover:text-neutral-950 transition active:scale-95 shadow-lg flex items-center gap-1 cursor-pointer"
                    >
                      <span>CURATE SPACES</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Mute/Unmute Mic Trigger inside Video */}
              <button
                onClick={() => setIsVideoMuted(!isVideoMuted)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-black/60 transition active:scale-95 cursor-pointer"
                title="Mute / Unmute"
              >
                {isVideoMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>

              {/* Slide Navigation Dots */}
              <div className="absolute top-4 left-4 flex gap-1.5">
                {heroVideos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveVideoIndex(idx)}
                    className={`h-1.5 transition-all duration-500 rounded-full cursor-pointer ${
                      idx === activeVideoIndex ? "w-6 bg-[#D4AF37]" : "w-1.5 bg-white/45 hover:bg-white"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ROUND CATEGORY ICONS */}
          <div className="space-y-3">
            <div className="px-4 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-[0.15em] text-neutral-950 dark:text-white font-sans">
                Shop Departments
              </h3>
              <span className="text-[9px] text-[#D4AF37] font-bold tracking-wider uppercase">Swipe Left</span>
            </div>

            {/* Circular Category Avatars Row */}
            <div className="flex gap-4 overflow-x-auto px-4 py-2 scrollbar-none snap-x">
              {categoriesList.map((cat) => (
                <div
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setActiveSection("categories");
                    if (navigator.vibrate) navigator.vibrate(10);
                  }}
                  className="flex flex-col items-center space-y-2 cursor-pointer flex-shrink-0 snap-center group"
                >
                  <div className={`relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                    selectedCategory === cat 
                      ? "border-[#D4AF37] ring-4 ring-[#D4AF37]/10 scale-105 shadow-md" 
                      : "border-slate-100 dark:border-neutral-850 hover:border-slate-400 dark:hover:border-neutral-700 hover:scale-105"
                  }`}>
                    <img 
                      src={categoryImages[cat] || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=150&q=80"} 
                      alt={cat}
                      className="w-full h-full object-cover filter brightness-[0.85] group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-neutral-950/10 dark:bg-neutral-950/20"></div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-700 dark:text-slate-300 font-sans group-hover:text-[#D4AF37] transition">
                    {cat}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* FLASH CURATION HOUR (Limited curated items) */}
          <div className="mx-4 bg-[#FAF9F5] dark:bg-[#161616] rounded-3xl p-5 border border-[#EAE6D8]/50 dark:border-neutral-850/80 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-[#D4AF37]/10 rounded-full filter blur-2xl"></div>
            
            <div className="space-y-1.5 text-center md:text-left">
              <span className="text-[9px] font-black tracking-widest text-[#D4AF37] uppercase block font-mono">
                Flash Curation Event
              </span>
              <h4 className="text-sm font-black text-neutral-950 dark:text-white uppercase tracking-tight">
                25% Off Ceramic Cords
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                Rare production runs. Automatically applied at checkout gate.
              </p>
            </div>

            {/* Countdown timers */}
            <div className="flex gap-2 font-mono text-center">
              {[
                { label: "HRS", val: countdownTime.hours },
                { label: "MIN", val: countdownTime.minutes },
                { label: "SEC", val: countdownTime.seconds }
              ].map((c, i) => (
                <div key={i} className="bg-white dark:bg-[#1E1E1E] border border-neutral-200/50 dark:border-neutral-800 rounded-xl px-2.5 py-1.5 shadow-sm min-w-[50px]">
                  <span className="text-sm font-black text-neutral-950 dark:text-white block leading-none">
                    {c.val.toString().padStart(2, "0")}
                  </span>
                  <span className="text-[7px] text-slate-400 font-bold block mt-1 tracking-wider">{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CURATED PREMIUM PRODUCT CARDS GRID */}
          <div className="space-y-4 px-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-[0.15em] text-neutral-950 dark:text-white font-sans">
                Curated Coordinates
              </h3>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setActiveSection("categories");
                }}
                className="text-[10px] font-bold text-[#D4AF37] hover:underline uppercase cursor-pointer"
              >
                View all Catalog
              </button>
            </div>

            {/* 2-column beautiful cards layout */}
            <div className="grid grid-cols-2 gap-4">
              {homeTrendingProducts.map((prod) => (
                <div key={prod.id} className="h-full">
                  <ProductCard product={prod} onSelect={handleProductSelect} />
                </div>
              ))}
            </div>
          </div>

          {/* INSPIRATION REELS (Lookbook Videos) */}
          <div className="space-y-4">
            <div className="px-4 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-[0.15em] text-neutral-950 dark:text-white font-sans">
                Inspiration Videos
              </h3>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">Stories</span>
            </div>

            {/* Horizontal Reels List */}
            <div className="flex gap-4 overflow-x-auto px-4 py-1.5 scrollbar-none snap-x">
              {inspirationVideos.map((reel) => (
                <div
                  key={reel.id}
                  className="relative w-[180px] h-[310px] rounded-3xl overflow-hidden shadow-md flex-shrink-0 snap-center group border border-slate-100 dark:border-neutral-850/80 cursor-pointer"
                  onClick={() => handleOpenShopLook(reel.items)}
                >
                  <img 
                    src={reel.posterUrl} 
                    alt={reel.title}
                    className="absolute inset-0 w-full h-full object-cover filter brightness-[0.7] group-hover:scale-105 transition duration-500" 
                  />
                  
                  {/* Subtle pulsing play trigger */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg scale-90 group-hover:scale-100 transition duration-300">
                    <Play className="h-4.5 w-4.5 text-white fill-white ml-0.5" />
                  </div>

                  {/* Caption & Pill tag overlay */}
                  <div className="absolute inset-x-3.5 bottom-3.5 flex flex-col items-start space-y-1 text-white">
                    <span className="bg-[#D4AF37] text-neutral-950 text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                      {reel.category}
                    </span>
                    <h5 className="text-[11px] font-extrabold tracking-tight leading-snug line-clamp-2 uppercase">
                      {reel.title}
                    </h5>
                    <span className="text-[8px] text-[#D4AF37] font-bold mt-1 tracking-wider uppercase block bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                      Shop look
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* THE LUXURY LIVING EDITORIAL */}
          <div className="mx-4 bg-[#FAF9F6] dark:bg-[#161616] rounded-[2rem] p-6 border border-slate-100 dark:border-neutral-850/50 space-y-4 text-center">
            <span className="text-[9px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase block font-mono">
              The Aesthetic Philosophy
            </span>
            <h4 className="text-base font-black text-neutral-950 dark:text-white uppercase tracking-tight max-w-sm mx-auto leading-normal">
              Architecture should invoke spatial poetry, quiet contemplation, and spatial stillness.
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-light leading-relaxed max-w-xs mx-auto">
              Our curators hand-select solid oak, low-fired stoneware clay pots, and custom coordinates in limited quantities from European ateliers.
            </p>
            <div className="flex justify-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full opacity-60"></span>
              <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full opacity-30"></span>
            </div>
          </div>

        </div>
      )}

      {/* SHOP THE LOOK DRAWER FOR REELS */}
      {showShopLookDrawer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end animate-fade-in">
          <div className="bg-white dark:bg-[#181818] w-full max-h-[75vh] rounded-t-[2.5rem] p-6 space-y-4 overflow-y-auto animate-slide-up text-black dark:text-white">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-neutral-850 pb-3">
              <div>
                <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-wider block font-mono">Interactive Lookbook</span>
                <h4 className="text-sm font-black uppercase tracking-tight">Shop products from this video</h4>
              </div>
              <button 
                onClick={() => setShowShopLookDrawer(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {lookProducts.length > 0 ? (
                lookProducts.map((p) => (
                  <div 
                    key={p.id} 
                    className="flex gap-4 p-3 bg-[#FBFBFB] dark:bg-[#202020] rounded-2xl border border-slate-50 dark:border-neutral-850 hover:border-slate-200 transition cursor-pointer"
                    onClick={() => {
                      handleProductSelect(p);
                      setShowShopLookDrawer(false);
                    }}
                  >
                    <img 
                      src={p.image} 
                      alt={p.name}
                      className="w-16 h-16 object-cover rounded-xl border border-slate-100 dark:border-neutral-800 bg-slate-50" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{p.brand}</span>
                        <h5 className="text-xs font-bold text-neutral-900 dark:text-white truncate mt-0.5">{p.name}</h5>
                      </div>
                      <span className="text-xs font-mono font-black text-neutral-950 dark:text-white">${p.price}</span>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p, 1, p.sizes?.[0] || "Standard", p.colors?.[0] || "Natural");
                          addNotification("🛍️ Added to Bag", `${p.name} was added to your shopping bag.`, "system");
                        }}
                        className="px-3 py-1.5 bg-black dark:bg-[#D4AF37] text-white dark:text-neutral-950 text-[9px] font-black tracking-widest uppercase rounded-lg shadow-sm cursor-pointer"
                      >
                        ADD
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">No matching coordinates found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. CATALOG VIEW SCREEN */}
      {activeSection === "categories" && (
        <div className="animate-fade-in space-y-6 px-4 pt-5">
          <div className="space-y-1">
            <h1 className="text-xl font-black text-neutral-950 dark:text-white tracking-tight uppercase">Bespoke Catalog</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-light uppercase tracking-wide">
              Selected interior coordinates in low production quantities.
            </p>
          </div>

          {/* Search bar inside Catalog */}
          <div className="relative">
            <input
              id="input-catalog-search"
              type="text"
              placeholder="Search pieces, e.g. 'vase', 'oak', 'linen'..."
              className="w-full bg-[#F5F5F5] dark:bg-[#1A1A1A] border border-transparent dark:border-neutral-800 rounded-2xl px-4 py-3 pl-10 text-xs text-black dark:text-white focus:outline-none focus:bg-[#EAEAEA] dark:focus:bg-[#202020] transition font-sans"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Horizontal list of categories (pills style) */}
          <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-[10px] font-bold tracking-wider uppercase rounded-full transition cursor-pointer flex-shrink-0 ${
                  selectedCategory === cat
                    ? "bg-black dark:bg-[#D4AF37] text-white dark:text-neutral-950 shadow-md"
                    : "bg-[#F5F5F5] dark:bg-[#1A1A1A] text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-neutral-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Matching counts & active filters status */}
          <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500">
            <span>Showing {filteredProducts.length} items</span>
            <span>Category: {selectedCategory}</span>
          </div>

          {/* Catalog grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map((p) => (
                <div key={p.id}>
                  <ProductCard product={p} onSelect={handleProductSelect} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 space-y-3">
              <span className="text-3xl text-slate-300 block">📭</span>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-light uppercase tracking-wider">No matching coordinates found.</p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest"
              >
                RESET FILTERS
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. CURATED (WISHLIST) SCREEN VIEW */}
      {activeSection === "wishlist" && (
        <div className="animate-fade-in space-y-6 px-4 pt-5">
          <div className="space-y-1">
            <h1 className="text-xl font-black text-neutral-950 dark:text-white tracking-tight uppercase">Curated Favorites</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-light uppercase tracking-wide">
              Saved interior pieces you are styling for future projects.
            </p>
          </div>

          {wishlist.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {wishlist.map((p) => (
                <div key={p.id}>
                  <ProductCard product={p} onSelect={handleProductSelect} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 space-y-4">
              <div className="relative inline-block">
                <Heart className="h-12 w-12 text-slate-200 dark:text-neutral-800" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D4AF37]"></span>
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-950 dark:text-white">Curated List is Empty</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-light leading-relaxed max-w-xs mx-auto">
                  Browse the Slow Living Collection and tap the heart icon on pieces you love.
                </p>
              </div>
              <button
                onClick={() => setActiveSection("categories")}
                className="mt-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-[#D4AF37] dark:text-neutral-950 text-[9px] font-black tracking-widest rounded-xl uppercase transition active:scale-95"
              >
                CURATE NOW
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. CART & CHECKOUT SCREEN VIEW */}
      {activeSection === "cart" && (
        <div className="animate-fade-in space-y-6 px-4 pt-5">
          <div className="space-y-1">
            <h1 className="text-xl font-black text-neutral-950 dark:text-white tracking-tight uppercase">Shopping Bag</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-light uppercase tracking-wide">
              Selected interior coordinates prepared for delivery.
            </p>
          </div>

          {cart.length > 0 ? (
            <div className="space-y-6">
              
              {/* Product list */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div 
                    key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                    className="flex gap-4 p-3 bg-slate-50 dark:bg-[#1A1A1A] border border-neutral-100 dark:border-neutral-850 rounded-2xl relative"
                  >
                    <img 
                      src={item.product.image} 
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-xl border border-slate-200/50 dark:border-neutral-800 bg-white" 
                      referrerPolicy="no-referrer"
                    />
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">{item.product.name}</h4>
                        <div className="flex gap-2 text-[9px] text-slate-400 font-sans tracking-wide mt-1 uppercase font-semibold">
                          <span>Size: {item.selectedSize}</span>
                          <span>Color: {item.selectedColor}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs font-mono font-black text-neutral-950 dark:text-white">${item.product.price}</span>
                        
                        {/* Interactive Quantity Counters */}
                        <div className="flex items-center border border-slate-200 dark:border-neutral-850 rounded-lg overflow-hidden bg-white dark:bg-[#202020]">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                            className="px-2 py-1 text-xs font-extrabold hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-mono font-black text-neutral-950 dark:text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                            className="px-2 py-1 text-xs font-extrabold hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Trash micro trigger */}
                    <button
                      onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-500 cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Vouchers and Coupons Promo Section */}
              <div className="bg-slate-50 dark:bg-[#1A1A1A] border border-neutral-100 dark:border-neutral-850 rounded-2xl p-4.5 space-y-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Apply Voucher</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Voucher Code (e.g. VIPHOUSE)"
                    className="flex-1 bg-white dark:bg-[#202020] border border-slate-200 dark:border-neutral-850 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none uppercase font-mono tracking-widest text-black dark:text-white"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                  />
                  <button
                    onClick={handleApplyCouponCode}
                    className="px-4 py-2.5 bg-black dark:bg-[#D4AF37] text-white dark:text-neutral-950 text-[10px] font-black uppercase tracking-widest rounded-xl transition cursor-pointer"
                  >
                    APPLY
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between items-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 p-2.5 rounded-xl text-[10px] font-bold">
                    <span>Applied: {appliedCoupon.code} (-{appliedCoupon.discountPercent}% OFF)</span>
                    <button onClick={removeCoupon} className="text-xs text-rose-500 hover:underline">Remove</button>
                  </div>
                )}
              </div>

              {/* Delivery Address selection */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Shipping Address</span>
                {addresses.length > 0 ? (
                  <div className="space-y-2">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setCheckoutAddressId(addr.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition flex justify-between items-start ${
                          checkoutAddressId === addr.id
                            ? "bg-slate-50 dark:bg-neutral-850 border-[#D4AF37]"
                            : "bg-white dark:bg-[#1A1A1A] border-slate-100 dark:border-neutral-850/80"
                        }`}
                      >
                        <div className="text-xs">
                          <span className="font-extrabold text-neutral-900 dark:text-white block">{addr.name} ({addr.phone})</span>
                          <span className="text-slate-500 dark:text-slate-400 block mt-1 leading-normal font-light">
                            {addr.street}, {addr.city}, {addr.state} - {addr.zip}
                          </span>
                        </div>
                        {checkoutAddressId === addr.id && (
                          <CheckCircle2 className="h-4.5 w-4.5 text-[#D4AF37] flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 rounded-2xl text-[10px] font-bold text-center">
                    No shipping addresses configured. Configure one in profile.
                  </div>
                )}
              </div>

              {/* Secure Payment Options */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Payment Mode</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "Card", label: "Credit Card" },
                    { id: "UPI", label: "Instant UPI" },
                    { id: "COD", label: "Cash on Delivery" },
                    { id: "Wallet", label: `Bespoke Wallet ($${walletBalance})` }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setCheckoutPayment(p.id as any)}
                      className={`py-3 px-2 rounded-xl text-[10px] font-bold uppercase border cursor-pointer transition ${
                        checkoutPayment === p.id
                          ? "bg-black dark:bg-[#D4AF37] border-black dark:border-[#D4AF37] text-white dark:text-neutral-950"
                          : "bg-[#F5F5F5] dark:bg-[#1A1A1A] border-transparent text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price summary ledge */}
              <div className="border-t border-slate-100 dark:border-neutral-850 pt-4 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-mono text-neutral-950 dark:text-white">$
                    {cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between items-center text-emerald-500">
                    <span>Voucher Discount ({appliedCoupon.discountPercent}%)</span>
                    <span className="font-mono">-$
                      {Math.round(cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) * (appliedCoupon.discountPercent / 100))}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-slate-100 dark:border-neutral-850 pt-2 text-sm font-black uppercase">
                  <span className="text-neutral-900 dark:text-white">Est. Total</span>
                  <span className="font-mono text-neutral-950 dark:text-white">$
                    {Math.max(1, cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) - (appliedCoupon ? Math.round(cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) * (appliedCoupon.discountPercent / 100)) : 0))}
                  </span>
                </div>
              </div>

              {/* Place Secure Order CTA */}
              <button
                onClick={handlePlaceSecureOrder}
                className="w-full py-4 bg-black dark:bg-[#D4AF37] hover:bg-neutral-900 dark:hover:bg-[#C5A880] text-white dark:text-neutral-950 font-sans font-bold text-xs uppercase tracking-widest rounded-2xl transition active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Award className="h-4.5 w-4.5" />
                <span>PLACE SECURE ORDER</span>
              </button>

            </div>
          ) : (
            <div className="text-center py-20 space-y-4">
              <span className="text-4xl">👜</span>
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-950 dark:text-white">Your bag is empty</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-light max-w-xs mx-auto">
                  Browse the premium curated catalog and add handpicked architectural elements to your home.
                </p>
              </div>
              <button
                onClick={() => setActiveSection("categories")}
                className="px-5 py-2.5 bg-neutral-900 dark:bg-[#D4AF37] text-white dark:text-neutral-950 text-[9px] font-black uppercase tracking-widest rounded-xl transition"
              >
                EXPLORE CATALOG
              </button>
            </div>
          )}

          {/* ORDER SUCCESS POPUP DRAWER */}
          {viewedOrder && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white dark:bg-[#1C1C1C] max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-neutral-850 space-y-4 animate-fade-in text-black dark:text-white my-8">
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="h-6 w-6 stroke-[3]" />
                  </div>
                  <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest font-bold block">Transaction Secure</span>
                  <h4 className="text-base font-black uppercase tracking-tight">Order Confirmed</h4>
                </div>

                {/* Live Order Tracking Status Stepper */}
                <div className="bg-[#FAF9F5] dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 p-4 rounded-2xl space-y-3.5">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest block">Live Dispatch Tracking</span>
                    <span className="text-[8px] bg-[#D4AF37]/15 text-[#D4AF37] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">AIR PRIORITY</span>
                  </div>
                  <div className="space-y-3 text-[10px]">
                    {[
                      { status: "Order Logged", date: "Just now", desc: "Handshaked in secure ledger", checked: true, active: false },
                      { status: "Atelier Assembly", date: "Pending", desc: "Custom upholstery & waxing", checked: true, active: false },
                      { status: "Air Courier Transit", date: "Staged", desc: "Priority cargo routing", checked: false, active: true },
                      { status: "Final Node Delivery", date: "Est. 3 Days", desc: "White-glove unboxing service", checked: false, active: false }
                    ].map((step, idx) => (
                      <div key={idx} className="flex gap-3 relative">
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[8px] ${
                            step.checked ? "bg-[#D4AF37] text-white" : step.active ? "bg-black dark:bg-white text-white dark:text-black animate-pulse" : "bg-neutral-200 text-slate-400"
                          }`}>
                            {step.checked ? "✓" : idx + 1}
                          </div>
                          {idx < 3 && <div className={`w-[2px] h-8 -my-1 ${step.checked ? "bg-[#D4AF37]" : "bg-neutral-200"}`}></div>}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-neutral-900 dark:text-white uppercase">{step.status}</span>
                            <span className="text-[8px] text-slate-400 font-semibold">{step.date}</span>
                          </div>
                          <p className="text-[9px] text-slate-400 mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Core transaction metadata summary ledger */}
                <div className="bg-slate-50 dark:bg-neutral-850 p-4 rounded-2xl text-xs space-y-2">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-400">Order Reference</span>
                    <span className="font-mono font-bold text-neutral-950 dark:text-white truncate max-w-[140px]">{viewedOrder.id}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-400">Payment Gateway</span>
                    <span className="font-sans font-bold text-[#D4AF37] uppercase">{checkoutPayment} Gateway</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-400">Amount Settled</span>
                    <span className="font-mono font-bold text-neutral-950 dark:text-white">${viewedOrder.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fulfillment Center</span>
                    <span className="font-bold text-neutral-950 dark:text-white truncate max-w-[140px]">{viewedOrder.address.city}, {viewedOrder.address.state}</span>
                  </div>
                </div>

                {/* Custom Action Triggers (Invoice & Refund options) */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setShowInvoiceModal(viewedOrder)}
                    className="py-2.5 border border-[#D4AF37]/30 hover:border-[#D4AF37] bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-[9px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5"
                  >
                    📃 Download Invoice
                  </button>
                  <button
                    onClick={() => {
                      setRefundTrackingId(viewedOrder.id);
                      setRefundStatusStep(1);
                      setShowRefundTracker(true);
                      addNotification("🛡️ Refund Staged", `Fulfillment reversal lodged for Order ID ${viewedOrder.id}`, "system");
                    }}
                    className="py-2.5 border border-red-500/20 hover:border-red-500/40 bg-red-500/5 text-red-500 text-[9px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5"
                  >
                    🛡️ Request Refund
                  </button>
                </div>

                {/* Navigation triggers */}
                <div className="flex gap-2 pt-2 border-t">
                  <button
                    onClick={() => {
                      setViewedOrder(null);
                      setActiveSection("home");
                    }}
                    className="flex-1 py-3 bg-[#F5F5F5] dark:bg-neutral-800 text-neutral-900 dark:text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer hover:bg-[#EAEAEA] dark:hover:bg-neutral-750 transition"
                  >
                    SHOP MORE
                  </button>
                  <button
                    onClick={() => {
                      setViewedOrder(null);
                      setActiveProfileTab("orders");
                      setActiveSection("profile");
                    }}
                    className="flex-1 py-3 bg-black dark:bg-[#D4AF37] text-white dark:text-neutral-950 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-md hover:scale-102 transition"
                  >
                    MY LEDGER
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PAYMENT SANDBOX SIMULATOR SHEET (OVERLAY) */}
          {paymentStep !== "idle" && paymentStep !== "success" && (
            <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#1A1A1A] max-w-md w-full rounded-3xl p-6 shadow-2xl border border-[#D4AF37]/20 text-black dark:text-white space-y-5 animate-fade-in">
                
                {/* Mode Selectors */}
                {paymentStep === "gateway_select" && (
                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <span className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-widest font-bold block">Secure Gateway Node</span>
                      <h4 className="text-base font-black uppercase tracking-tight">Select Payment Router</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "Stripe", name: "Stripe", desc: "Credit/Debit Cards" },
                        { id: "Razorpay", name: "Razorpay", desc: "Netbanking Router" },
                        { id: "PhonePe", name: "PhonePe", desc: "UPI Gateway" },
                        { id: "GPay", name: "Google Pay", desc: "UPI Engine" },
                        { id: "Paytm", name: "Paytm", desc: "Wallet Hub" },
                        { id: "COD", name: "Cash on Delivery", desc: "Manual Ledger" }
                      ].map((gw) => (
                        <button
                          key={gw.id}
                          type="button"
                          onClick={() => setPaymentGatewayType(gw.id as any)}
                          className={`p-3 rounded-2xl border text-left cursor-pointer transition ${
                            paymentGatewayType === gw.id
                              ? "bg-[#FAF9F5] dark:bg-neutral-900 border-[#D4AF37]"
                              : "bg-white dark:bg-[#202020] border-transparent"
                          }`}
                        >
                          <span className="font-extrabold text-xs block text-neutral-900 dark:text-white">{gw.name}</span>
                          <span className="text-[8px] text-slate-400 uppercase tracking-wider block mt-1">{gw.desc}</span>
                        </button>
                      ))}
                    </div>

                    {/* Developer Configuration: Failure Simulator Toggle */}
                    <div className="bg-slate-50 dark:bg-neutral-900 p-4 rounded-2xl space-y-2 text-xs border">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold block text-neutral-900 dark:text-white uppercase text-[10px]">Developer Sandbox Control</span>
                          <span className="text-[8px] text-slate-400 mt-0.5">Toggle to simulate payment failure recovery path.</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={testFailureToggle} 
                            onChange={(e) => setTestFailureToggle(e.target.checked)}
                            className="sr-only peer" 
                          />
                          <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setPaymentStep("idle")}
                        className="flex-1 py-3 bg-[#F5F5F5] dark:bg-neutral-800 text-neutral-900 dark:text-white text-[10px] font-black uppercase rounded-xl cursor-pointer"
                      >
                        ABORT
                      </button>
                      <button
                        onClick={() => triggerPaymentHandshake(false)}
                        className="flex-1 py-3 bg-black dark:bg-[#D4AF37] text-white dark:text-neutral-950 text-[10px] font-black uppercase rounded-xl cursor-pointer font-sans"
                      >
                        INITIALIZE GATEWAY
                      </button>
                    </div>
                  </div>
                )}

                {/* Real-time Handshake Logs */}
                {paymentStep === "processing" && (
                  <div className="space-y-4">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 rounded-full border-4 border-dashed border-[#D4AF37] animate-spin mx-auto flex items-center justify-center">
                        🔒
                      </div>
                      <span className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-widest font-black block">LEDGER CLEARING ACTIVE</span>
                      <h4 className="text-sm font-black uppercase tracking-tight">Processing Handshake</h4>
                    </div>

                    <div className="bg-[#121212] text-emerald-400 font-mono text-[9px] p-4 rounded-xl border border-neutral-800 space-y-1.5 max-h-44 overflow-y-auto leading-relaxed">
                      {paymentLogs.length > 0 ? (
                        paymentLogs.map((log, idx) => (
                          <div key={idx} className="flex gap-2">
                            <span className="text-neutral-600 font-bold">[{idx + 1}]</span>
                            <span>{log}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-neutral-500 italic">Initializing secured connection...</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Failure Recovery Dialog with Retry option */}
                {paymentStep === "failed" && (
                  <div className="space-y-4 text-center">
                    <div className="mx-auto w-12 h-12 bg-rose-500/15 text-rose-500 rounded-full flex items-center justify-center text-xl font-bold">
                      ✕
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-rose-500 uppercase tracking-widest font-black block">TRANSACTION REJECTED</span>
                      <h4 className="text-base font-black uppercase tracking-tight">Authorization Declined</h4>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                      The card networks or sandbox simulator node reported a temporary lock. Rest assured your funds are secure. You can safely retry.
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setPaymentStep("idle");
                          addNotification("🛡️ Handshake Terminated", "Payment transaction safely rolled back.", "system");
                        }}
                        className="flex-1 py-3 bg-[#F5F5F5] dark:bg-neutral-800 text-neutral-900 dark:text-white text-[10px] font-black uppercase rounded-xl cursor-pointer"
                      >
                        CLOSE CART
                      </button>
                      <button
                        onClick={() => {
                          // Allow forcing a successful retry bypass
                          setTestFailureToggle(false);
                          triggerPaymentHandshake(true);
                        }}
                        className="flex-1 py-3 bg-black dark:bg-[#D4AF37] text-white dark:text-neutral-950 text-[10px] font-black uppercase rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        🔄 RETRY PAYMENT
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* INVOICE MODAL DOWNLOADABLE VIEW */}
          {showInvoiceModal && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#1E1E1E] max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-[#D4AF37]/20 text-neutral-900 dark:text-white space-y-5 animate-fade-in">
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <h3 className="font-extrabold text-sm uppercase tracking-widest text-[#D4AF37]">NAYEL BASKET LUXURY</h3>
                    <p className="text-[9px] text-slate-400 mt-0.5">Atelier Studio Logistics Node • NY</p>
                  </div>
                  <button 
                    onClick={() => setShowInvoiceModal(null)}
                    className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    ✕
                  </button>
                </div>

                {/* Printable Invoice Header */}
                <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-500">
                  <div className="space-y-1">
                    <span className="font-black uppercase text-[8px] text-slate-400 block">PATRON PROFILE</span>
                    <span className="font-bold text-neutral-900 dark:text-white block">{showInvoiceModal.address.name}</span>
                    <span>{showInvoiceModal.address.street}</span>
                    <span>{showInvoiceModal.address.city}, {showInvoiceModal.address.state} - {showInvoiceModal.address.zip}</span>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="font-black uppercase text-[8px] text-slate-400 block">LEDGER REFERENCE</span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white block truncate max-w-[150px] ml-auto">{showInvoiceModal.id}</span>
                    <span>Date: {new Date().toLocaleDateString()}</span>
                    <span className="text-[#34C759] font-bold block uppercase">STATUS: SECURE_SETTLED</span>
                  </div>
                </div>

                {/* Invoice Items Table */}
                <div className="border-t border-b py-3 text-[10px]">
                  <div className="grid grid-cols-3 font-extrabold text-[8px] text-slate-400 uppercase pb-2">
                    <span>Curated Coordinate</span>
                    <span className="text-center">Qty</span>
                    <span className="text-right">Settled Price</span>
                  </div>
                  <div className="space-y-2 text-slate-600 dark:text-slate-300">
                    {cart.map((c, index) => (
                      <div key={index} className="grid grid-cols-3">
                        <span className="font-semibold text-neutral-900 dark:text-white truncate">{c.product.name}</span>
                        <span className="text-center font-mono font-bold">{c.quantity}</span>
                        <span className="text-right font-mono font-bold">${c.product.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Math Ledger */}
                <div className="text-[10px] space-y-1.5 text-slate-500 max-w-xs ml-auto">
                  <div className="flex justify-between">
                    <span>Atelier Subtotal</span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white">${showInvoiceModal.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT Logistics Tax (0%)</span>
                    <span className="font-mono font-bold text-[#D4AF37]">Complimentary</span>
                  </div>
                  <div className="flex justify-between border-t pt-1.5 text-xs font-black uppercase text-neutral-900 dark:text-white">
                    <span>Settle Balance</span>
                    <span className="font-mono font-bold text-[#D4AF37]">${showInvoiceModal.total}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      alert(`Invoice saved securely to system files as NAYEL_INVOICE_${showInvoiceModal.id}.pdf`);
                      setShowInvoiceModal(null);
                    }}
                    className="flex-1 py-3 bg-black dark:bg-[#D4AF37] text-white dark:text-neutral-950 text-[10px] font-black uppercase rounded-xl cursor-pointer text-center"
                  >
                    📥 SAVE INVOICE AS PDF
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* REFUND LEDGER STEPS PROGRESS TRACKER */}
          {showRefundTracker && refundTrackingId && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#1E1E1E] max-w-md w-full rounded-3xl p-6 shadow-2xl border border-red-500/30 text-black dark:text-white space-y-4 animate-fade-in">
                <div className="flex justify-between items-center border-b pb-3">
                  <div>
                    <span className="text-[9px] font-mono text-red-500 uppercase tracking-widest font-bold block">REVERSAL PROTOCOL</span>
                    <h4 className="text-base font-black uppercase tracking-tight">Refund Audit Ledger</h4>
                  </div>
                  <button 
                    onClick={() => {
                      setShowRefundTracker(false);
                      setRefundTrackingId(null);
                    }}
                    className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-neutral-900 p-4.5 rounded-2xl text-[10px] space-y-3">
                  <div className="flex justify-between font-mono font-semibold border-b pb-1.5 text-[9px] text-slate-400 uppercase">
                    <span>Audit Stage</span>
                    <span>Status Tracker</span>
                  </div>
                  
                  {[
                    { title: "Fulfillment Revocation Requested", desc: "Digital handshake submitted", done: true },
                    { title: "Escrow Bank Settlement Handshake", desc: "Securing clearing node approval", done: true, pending: false },
                    { title: "Merchant Wallet Release Complete", desc: "Refunded to original source balance", done: false, pending: true }
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                          step.done ? "bg-red-500 text-white" : step.pending ? "bg-[#D4AF37] text-white animate-pulse" : "bg-neutral-200 text-slate-400"
                        }`}>
                          {step.done ? "✓" : idx + 1}
                        </div>
                        {idx < 2 && <div className="w-[2px] h-6 bg-neutral-200 my-0.5"></div>}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-neutral-900 dark:text-white uppercase text-[9px]">{step.title}</span>
                          {step.pending && <span className="text-[7px] text-[#D4AF37] font-black uppercase animate-pulse">PENDING CLOUD SYNC</span>}
                        </div>
                        <p className="text-[8px] text-slate-400 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setShowRefundTracker(false);
                    setRefundTrackingId(null);
                    addNotification("🛡️ Ledger Synced", "Escrow audit tracking completed safely.", "system");
                  }}
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-850 text-white font-bold uppercase tracking-wider text-[10px] rounded-xl cursor-pointer"
                >
                  CLOSE AUDIT LEDGER
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. AI STYLING CHAT VIEW SCREEN */}
      {activeSection === "ai" && (
        <div className="animate-fade-in h-[calc(100vh-140px)] flex flex-col pt-2">
          {/* Conversational stylist powered by server Gemini API */}
          <AIChat />
        </div>
      )}

      {/* 6. PROFILE & ACCOUNT MANAGEMENT SCREEN VIEW */}
      {activeSection === "profile" && (
        <div className="animate-fade-in space-y-6 px-4 pt-5">
          <div className="flex items-center gap-4 border-b border-slate-100 dark:border-neutral-850 pb-5">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-2xl font-black shadow-inner">
              👤
            </div>
            <div>
              <span className="text-[8px] bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-2 py-0.5 rounded-full font-bold uppercase font-sans tracking-widest">
                Elite Ambassador
              </span>
              <h2 className="text-lg font-black text-neutral-950 dark:text-white uppercase mt-1">Nayel Patron</h2>
              <p className="text-[10px] text-slate-400">patron@nayelbasket.luxury</p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#FAF9F5] dark:bg-[#1A1A1A] border border-[#EAE6D8]/50 dark:border-neutral-850/80 rounded-2xl p-4 text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Wallet Balance</span>
              <span className="text-xl font-mono font-black text-neutral-950 dark:text-white mt-1.5 block">${walletBalance}</span>
              <button
                onClick={() => {
                  addWalletFunds(150);
                  addNotification("💰 Wallet Top-Up", "Successfully topped up $150 via Simulated Apple Pay Gateway.", "system");
                }}
                className="mt-2 text-[8px] text-[#D4AF37] font-bold hover:underline uppercase block mx-auto"
              >
                + Top Up $150
              </button>
            </div>

            <div className="bg-[#FAF9F5] dark:bg-[#1A1A1A] border border-[#EAE6D8]/50 dark:border-neutral-850/80 rounded-2xl p-4 text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Reward Points</span>
              <span className="text-xl font-mono font-black text-[#D4AF37] mt-1.5 block">{rewardPoints} PTS</span>
              <span className="text-[7px] text-slate-400 uppercase tracking-wider block mt-1">Elite VIP Status</span>
            </div>
          </div>

          {/* Sub tabs Row inside profile (Apple ID Style) */}
          <div className="flex gap-1 border-b border-slate-100 dark:border-neutral-850 pb-1 overflow-x-auto scrollbar-none">
            {[
              { id: "dashboard", label: "Overview" },
              { id: "orders", label: "My Orders" },
              { id: "addresses", label: "Addresses" },
              { id: "coupons", label: "Vouchers" },
              { id: "security", label: "Security" },
              { id: "referral", label: "Referrals" },
              { id: "telemetry", label: "System Log" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveProfileTab(tab.id as any)}
                className={`px-3 py-2 text-[9px] font-bold uppercase tracking-wider border-b-2 transition cursor-pointer flex-shrink-0 ${
                  activeProfileTab === tab.id
                    ? "border-[#D4AF37] text-[#D4AF37]"
                    : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* PROFILE SUB SECTIONS */}
          <div className="space-y-4 animate-fade-in">
            
            {/* Tab: Overview (VIP Concierge & admin linkages) */}
            {activeProfileTab === "dashboard" && (
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-[#1A1A1A] p-4.5 rounded-2xl border border-neutral-100 dark:border-neutral-850 space-y-2 text-xs">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Patron benefits</span>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase">24/7 Digital Concierge Ready</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                    Stylists are available dynamically to coordinate spatial maps, layout suggestions, or custom upholstery parameters.
                  </p>
                </div>

                {/* PWA Installation Card */}
                <div className="bg-[#FAF9F5] dark:bg-[#1A1A1A] p-4.5 rounded-2xl border border-[#D4AF37]/30 space-y-3 text-xs">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest block w-max font-mono">
                        {isInstalled ? "Premium Standalone Active" : "Luxury Atelier Mobile"}
                      </span>
                      <h4 className="text-xs font-black uppercase text-neutral-900 dark:text-white mt-1">
                        {isInstalled ? "App Installed Successfully" : "Install Nayel Basket App"}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                        {isInstalled 
                          ? "You are running the high-performance standalone version with white-glove offline capability and swift spatial updates."
                          : "Pin Nayel Basket directly to your home screen. Experience zero-latency slow living catalog curation and full offline checkout reversibility."}
                      </p>
                    </div>
                  </div>
                  {!isInstalled && (
                    <button
                      onClick={triggerInstall}
                      className="w-full py-3 bg-black dark:bg-[#D4AF37] text-white dark:text-neutral-950 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-neutral-900 dark:hover:bg-[#cfa52f] transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                      <span>{isInstallable ? "Install App Now" : "Install App Guide"}</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">System Access Control</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={onSelectSeller}
                      className="py-3.5 bg-[#FAF9F5] dark:bg-[#161616] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-950 dark:text-white border border-[#EAE6D8]/50 dark:border-neutral-850 text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Compass className="h-3.5 w-3.5 text-[#D4AF37]" />
                      <span>Seller Portal</span>
                    </button>
                    <button
                      onClick={onSelectAdmin}
                      className="py-3.5 bg-[#FAF9F5] dark:bg-[#161616] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-950 dark:text-white border border-[#EAE6D8]/50 dark:border-neutral-850 text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Award className="h-3.5 w-3.5 text-[#D4AF37]" />
                      <span>Admin Gate</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: My Orders */}
            {activeProfileTab === "orders" && (
              <div className="space-y-3">
                {orders.length > 0 ? (
                  orders.map((o) => (
                    <div key={o.id} className="bg-[#FAF9F5] dark:bg-[#1A1A1A] border border-[#EAE6D8]/50 dark:border-neutral-850/80 p-4.5 rounded-2xl text-xs space-y-3">
                      <div className="flex justify-between border-b pb-2">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">Order ID</span>
                          <span className="font-mono text-neutral-950 dark:text-white truncate block max-w-[140px] mt-0.5">{o.id}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">Status</span>
                          <span className={`inline-block text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5 ${
                            o.status === "Pending" ? "bg-amber-400/15 text-amber-500" : o.status === "Delivered" ? "bg-emerald-400/15 text-emerald-500" : "bg-red-400/15 text-red-500"
                          }`}>{o.status}</span>
                        </div>
                      </div>

                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Amount Paid</span>
                        <span className="font-mono font-bold text-neutral-950 dark:text-white">${o.total}</span>
                      </div>

                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Dispatch Node</span>
                        <span className="font-bold text-neutral-900 dark:text-white">{o.address.city}, {o.address.state}</span>
                      </div>

                      {o.status === "Pending" && (
                        <button
                          onClick={() => {
                            cancelOrder(o.id);
                            addNotification("🛡️ Transaction Revoked", `Order ${o.id} was cancelled successfully. Funds refunded.`, "system");
                          }}
                          className="w-full py-2 bg-red-500/10 hover:bg-red-500/15 text-red-500 border border-red-500/25 rounded-xl font-bold uppercase text-[9px] cursor-pointer"
                        >
                          REVOKE ORDER & REFUND
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">No order logs found.</p>
                )}
              </div>
            )}

            {/* Tab: Addresses */}
            {activeProfileTab === "addresses" && (
              <div className="space-y-4">
                {addresses.map((a) => (
                  <div key={a.id} className="bg-slate-50 dark:bg-[#1A1A1A] p-4 rounded-2xl border border-neutral-100 dark:border-neutral-850 flex justify-between items-start text-xs">
                    <div className="space-y-1">
                      <span className="font-extrabold text-neutral-950 dark:text-white block">{a.name} ({a.phone})</span>
                      <span className="text-slate-500 dark:text-slate-400 block leading-normal">{a.street}, {a.city}, {a.state} - {a.zip}</span>
                    </div>
                    <button
                      onClick={() => {
                        removeAddress(a.id);
                        addNotification("🛡️ Address Removed", "Shipping node terminated successfully.", "system");
                      }}
                      className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                      title="Remove Address"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {!showAddressForm ? (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-neutral-800 hover:border-slate-400 rounded-2xl text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center cursor-pointer"
                  >
                    + Add Shipping Address
                  </button>
                ) : (
                  <div className="bg-slate-50 dark:bg-[#1A1A1A] p-5 rounded-2xl border border-neutral-100 dark:border-neutral-850 space-y-3.5 text-xs">
                    <h4 className="font-bold uppercase text-neutral-900 dark:text-white pb-1 border-b">Configure New Node</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        placeholder="Patron Full Name"
                        className="bg-white dark:bg-[#202020] border rounded-lg p-2 focus:outline-none"
                        value={newAddrName}
                        onChange={(e) => setNewAddrName(e.target.value)}
                      />
                      <input
                        placeholder="Contact Phone"
                        className="bg-white dark:bg-[#202020] border rounded-lg p-2 focus:outline-none"
                        value={newAddrPhone}
                        onChange={(e) => setNewAddrPhone(e.target.value)}
                      />
                    </div>
                    <input
                      placeholder="Street Details"
                      className="w-full bg-white dark:bg-[#202020] border rounded-lg p-2 focus:outline-none"
                      value={newAddrStreet}
                      onChange={(e) => setNewAddrStreet(e.target.value)}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        placeholder="City"
                        className="bg-white dark:bg-[#202020] border rounded-lg p-2 focus:outline-none"
                        value={newAddrCity}
                        onChange={(e) => setNewAddrCity(e.target.value)}
                      />
                      <input
                        placeholder="State"
                        className="bg-white dark:bg-[#202020] border rounded-lg p-2 focus:outline-none"
                        value={newAddrState}
                        onChange={(e) => setNewAddrState(e.target.value)}
                      />
                      <input
                        placeholder="Zip Code"
                        className="bg-white dark:bg-[#202020] border rounded-lg p-2 focus:outline-none"
                        value={newAddrZip}
                        onChange={(e) => setNewAddrZip(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAddressForm(false)}
                        className="flex-1 py-2 bg-neutral-200 text-slate-700 font-bold uppercase rounded-xl text-[9px]"
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={() => {
                          if (!newAddrName || !newAddrPhone || !newAddrStreet) return;
                          addAddress({
                            id: `addr_${Date.now()}`,
                            name: newAddrName,
                            phone: newAddrPhone,
                            street: newAddrStreet,
                            city: newAddrCity,
                            state: newAddrState,
                            zip: newAddrZip
                          });
                          setShowAddressForm(false);
                          addNotification("🛡️ Node Deployed", "Shipping address node logged successfully.", "system");
                        }}
                        className="flex-1 py-2 bg-black dark:bg-[#D4AF37] text-white dark:text-neutral-950 font-bold uppercase rounded-xl text-[9px]"
                      >
                        SAVE NODE
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Vouchers & Vouchers */}
            {activeProfileTab === "coupons" && (
              <div className="space-y-3">
                {[
                  { code: "VIPHOUSE", desc: "15% off any architectural furniture coordinates", min: "$200" },
                  { code: "SLOWLIVING", desc: "25% off high-end ceramic and stoneware pots", min: "None" },
                  { code: "ZARASTYLE", desc: "10% storewide premium spatial poetry elements", min: "None" }
                ].map((c) => (
                  <div 
                    key={c.code}
                    onClick={() => {
                      applyCoupon(c.code);
                      addNotification("🎟️ Voucher Pre-loaded", `Voucher ${c.code} is staged for checkout.`, "system");
                    }}
                    className="bg-[#FAF9F5] dark:bg-[#1A1A1A] border-2 border-dashed border-[#EAE6D8] dark:border-neutral-800 p-4.5 rounded-2xl flex justify-between items-center text-xs cursor-pointer hover:border-[#D4AF37] transition"
                  >
                    <div className="space-y-1">
                      <span className="font-mono font-black text-sm text-neutral-950 dark:text-white tracking-widest block">{c.code}</span>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-light leading-relaxed">{c.desc}</p>
                    </div>
                    <span className="text-[9px] text-[#D4AF37] font-bold uppercase tracking-wider border border-[#D4AF37]/20 px-2.5 py-1 rounded-full bg-[#D4AF37]/5">Staged</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Security */}
            {activeProfileTab === "security" && (
              <div className="bg-slate-50 dark:bg-[#1A1A1A] border border-neutral-100 dark:border-neutral-850 p-5 rounded-[2rem] space-y-6 text-xs text-black dark:text-white">
                <div className="border-b pb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider font-mono">Biometric Passkeys</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Secure your portfolio with device native touch sensors.</p>
                  </div>
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${isBiometricRegistered ? "bg-emerald-500/10 text-emerald-500" : "bg-neutral-200 text-slate-500"}`}>
                    {isBiometricRegistered ? "Active" : "Inactive"}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (isBiometricRegistered) {
                      setIsBiometricRegistered(false);
                      localStorage.setItem("nb_biometric_registered", "false");
                      addNotification("🛡️ WebAuthn De-registered", "Biometric credentials deactivated.", "system");
                    } else {
                      setShowBiometricPrompt(true);
                      setTimeout(() => {
                        setShowBiometricPrompt(false);
                        setIsBiometricRegistered(true);
                        localStorage.setItem("nb_biometric_registered", "true");
                        addNotification("🛡️ Passkey Registered", "WebAuthn face telemetry authenticated.", "system");
                      }, 2000);
                    }
                  }}
                  className={`w-full py-3.5 font-sans font-bold uppercase text-[9px] tracking-widest rounded-xl transition cursor-pointer ${
                    isBiometricRegistered ? "bg-red-500/10 text-red-500 hover:bg-red-500/15" : "bg-black dark:bg-[#D4AF37] text-white dark:text-neutral-950"
                  }`}
                >
                  {isBiometricRegistered ? "REMOVE BIOMETRIC KEY" : "REGISTER WEBAUTHN DEVICE PASSKEY"}
                </button>
              </div>
            )}

            {/* Tab: Referral program */}
            {activeProfileTab === "referral" && (
              <div className="space-y-5 animate-fade-in text-xs text-black dark:text-white">
                <div className="bg-[#FAF9F5] dark:bg-[#1C1C1C] border border-[#EAE6D8]/50 dark:border-neutral-850 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8px] bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest block w-max">
                        VIP Patron Rewards
                      </span>
                      <h3 className="text-xs font-black uppercase mt-1">Ambassador Network</h3>
                    </div>
                    <span className="font-mono font-black text-[#D4AF37] text-[13px]">${referralWalletBalance} Earned</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Gift your inner circle 15% off their curated collections, and harvest <strong>$50</strong> into your luxury ledger upon their completed shipment.
                  </p>
                </div>

                {/* Unique referral code card */}
                <div className="bg-slate-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-850 rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest block">Your Unique Invite Code</span>
                    <span className="font-mono text-xs font-black tracking-widest text-neutral-950 dark:text-white mt-1 block">{referralCode}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(referralCode);
                      addNotification("📋 Referral Copied", "Your exclusive ambassador code was copied to clipboard.", "system");
                    }}
                    className="px-4 py-2 bg-black dark:bg-[#D4AF37] text-white dark:text-neutral-950 text-[9px] font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    COPY
                  </button>
                </div>

                {/* Sharing Options */}
                <div className="space-y-2">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Broadcast Invite Link</span>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { id: "whatsapp", label: "WhatsApp", icon: "💬", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
                      { id: "instagram", label: "Instagram", icon: "📸", color: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
                      { id: "facebook", label: "Facebook", icon: "👥", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
                      { id: "telegram", label: "Telegram", icon: "✈️", color: "bg-sky-500/10 text-sky-500 border-sky-500/20" },
                      { id: "link", label: "Direct", icon: "🔗", color: "bg-neutral-500/10 text-neutral-500 border-neutral-500/20" }
                    ].map((platform) => (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => {
                          addNotification("📢 Broadcasted Invite", `Simulated invite shared via ${platform.label}.`, "system");
                        }}
                        className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 ${platform.color} cursor-pointer`}
                      >
                        <span className="text-lg">{platform.icon}</span>
                        <span className="text-[8px] font-black uppercase tracking-wider">{platform.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* History list */}
                <div className="space-y-2.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Ambassador Ledger</span>
                  <div className="space-y-2">
                    {referralsHistory.map((ref, idx) => (
                      <div key={idx} className="bg-[#FAF9F5] dark:bg-[#1A1A1A] border border-[#EAE6D8]/50 dark:border-neutral-850 p-3 rounded-2xl flex justify-between items-center">
                        <div>
                          <span className="font-bold text-neutral-900 dark:text-white block">{ref.name}</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">{ref.date}</span>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            ref.status === "Completed" ? "bg-emerald-400/15 text-emerald-500" : "bg-yellow-400/15 text-yellow-500"
                          }`}>{ref.status}</span>
                          <span className="font-mono font-bold text-[#D4AF37] block mt-1 text-[11px]">{ref.reward > 0 ? `+$${ref.reward}` : "--"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: System Log */}
            {activeProfileTab === "telemetry" && (
              <div className="space-y-4">
                <div className="bg-[#151515] text-[#34C759] font-mono text-[9px] p-4.5 rounded-2xl space-y-2 border border-neutral-800 leading-relaxed">
                  <div className="flex justify-between items-center text-[10px] text-white border-b border-neutral-800 pb-2">
                    <span>SYSTEM LEDGER</span>
                    <button onClick={() => setTelemetryLogs(["[System] Stacks re-staged."])} className="text-neutral-400 hover:text-white uppercase tracking-wider text-[8px]">Clear</button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {telemetryLogs.map((l, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-neutral-500 flex-shrink-0">[{new Date().toLocaleTimeString()}]</span>
                        <span className="break-all">{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* BIOMETRICS SIMULATION PROMPT */}
      {showBiometricPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 max-w-xs w-full text-center space-y-4 text-black dark:text-white">
            <div className="mx-auto w-16 h-16 rounded-full border-2 border-[#D4AF37]/30 flex items-center justify-center text-4xl animate-pulse">
              🛡️
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wider">Passkey Calibration</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">Authenticating with device enclave frameworks. Keep looking directly at your camera...</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
