/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { 
  ShoppingBag, 
  Sparkles, 
  Bell, 
  X, 
  Search,
  Check, 
  AlertCircle,
  Cpu,
  Heart,
  User,
  Home,
  Layers,
  Sun,
  Moon,
  Menu,
  BookOpen,
  Settings,
  Shield,
  HelpCircle,
  MapPin,
  CreditCard,
  Tag,
  Globe,
  LogOut,
  ChevronDown,
  ChevronRight
} from "lucide-react";

interface NavbarProps {
  activeSection: "home" | "categories" | "wishlist" | "cart" | "profile" | "ai" | "orders";
  setActiveSection: (sec: "home" | "categories" | "wishlist" | "cart" | "profile" | "ai" | "orders") => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection, setActiveSection }) => {
  const { 
    notifications, 
    markNotificationAsRead, 
    searchQuery, 
    setSearchQuery,
    cart,
    theme,
    toggleTheme,
    themePreference,
    setThemePreference
  } = useApp();
  
  const [openNotifications, setOpenNotifications] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [greeting, setGreeting] = useState("Welcome");
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [customerUser, setCustomerUser] = useState<any>(() => {
    const saved = localStorage.getItem("nb_customer_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [isAppearanceExpanded, setIsAppearanceExpanded] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(() => localStorage.getItem("nb_lang") || "English");

  const unreadCount = notifications.filter((n) => !n.read).length;
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting("Good Morning");
    else if (hours < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const updateCustomerUser = () => {
      const saved = localStorage.getItem("nb_customer_user");
      setCustomerUser(saved ? JSON.parse(saved) : null);
    };

    window.addEventListener("customer-user-changed", updateCustomerUser);
    window.addEventListener("storage", updateCustomerUser);

    return () => {
      window.removeEventListener("customer-user-changed", updateCustomerUser);
      window.removeEventListener("storage", updateCustomerUser);
    };
  }, []);

  return (
    <>
      {/* Top Mobile-Native Bar */}
      <nav className="sticky top-0 z-40 bg-white dark:bg-[#111111] backdrop-blur-md border-b border-slate-100 dark:border-[#222222] text-black dark:text-white transition-colors duration-300 px-4 h-16 flex items-center justify-between relative">
        
        {/* Left Action: Hamburger Drawer Trigger */}
        <button
          id="btn-drawer-trigger"
          onClick={() => {
            setIsDrawerOpen(true);
            if (navigator.vibrate) navigator.vibrate(10);
          }}
          className="p-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800 active:scale-95 transition cursor-pointer"
        >
          <Menu className="h-5.5 w-5.5 stroke-[2]" />
        </button>

        {/* Centered App Branding */}
        <div 
          id="brand-logo-trigger"
          onClick={() => {
            setActiveSection("home");
            if (navigator.vibrate) navigator.vibrate(10);
          }}
          className="flex items-center gap-1.5 cursor-pointer select-none active:scale-95 transition absolute left-1/2 -translate-x-1/2"
        >
          <div className="bg-slate-950 dark:bg-slate-800 p-1.5 rounded-lg">
            <span className="text-white text-[9px] font-black font-sans leading-none block">NB</span>
          </div>
          <span className="text-[14px] font-black tracking-[0.2em] font-sans text-slate-950 dark:text-white uppercase">
            NAYEL BASKET
          </span>
        </div>

        {/* Right Actions: Notifications & Cart */}
        <div className="flex items-center gap-1">
          {/* Notifications Button */}
          <div className="relative">
            <button
              id="btn-notifications-header"
              onClick={() => {
                setOpenNotifications(!openNotifications);
                if (navigator.vibrate) navigator.vibrate(10);
              }}
              className={`p-2 rounded-full relative transition active:scale-95 cursor-pointer ${openNotifications ? "text-[#D4AF37]" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}`}
            >
              <Bell className="h-5.5 w-5.5 stroke-[1.8]" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-rose-500 border border-white dark:border-[#111111] animate-pulse"></span>
              )}
            </button>

            {/* Notifications Popover Dropdown (Mobile Optimized) */}
            {openNotifications && (
              <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-[#1A1A1A] border border-slate-100 dark:border-[#222222] rounded-2xl shadow-2xl z-50 divide-y divide-slate-100 dark:divide-[#222222] text-black dark:text-white max-h-80 overflow-hidden">
                <div className="p-3.5 flex items-center justify-between bg-slate-50/50 dark:bg-[#1A1A1A]/50">
                  <span className="font-extrabold text-[9px] uppercase tracking-wider text-slate-500">Notifications</span>
                  <button 
                    id="btn-close-notifications-header"
                    onClick={() => setOpenNotifications(false)} 
                    className="text-slate-400 hover:text-black dark:hover:text-white cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-50 dark:divide-[#222222]">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 font-light">
                      No notifications found.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-3.5 text-xs transition-colors cursor-pointer ${n.read ? "bg-white dark:bg-[#111111]" : "bg-amber-500/5 dark:bg-amber-500/10"}`}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                        }}
                      >
                        <div className="flex items-start gap-1 justify-between">
                          <span className="font-bold text-slate-900 dark:text-white text-[10.5px] leading-tight">
                            {n.title}
                          </span>
                          {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0 animate-pulse"></span>}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed text-[10px]">{n.description}</p>
                        <span className="text-[8px] text-slate-400 dark:text-slate-500 block mt-1 font-mono">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Shopping Cart Button */}
          <button
            id="btn-cart-header"
            onClick={() => {
              setActiveSection("cart");
              if (navigator.vibrate) navigator.vibrate(10);
            }}
            className={`p-2 rounded-full relative transition active:scale-95 cursor-pointer ${activeSection === "cart" ? "text-[#D4AF37]" : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"}`}
          >
            <ShoppingBag className="h-5.5 w-5.5 stroke-[1.8]" />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full shadow animate-pulse scale-90">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Side Slide-out Drawer Menu (Native Look & Feel) */}
      {isDrawerOpen && (
        <>
          {/* Backdrop Overlay */}
          <div 
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 transition-opacity duration-300"
          ></div>

          {/* Sliding Panel */}
          <div className="fixed left-0 top-0 bottom-0 w-[300px] bg-white dark:bg-[#111111] border-r border-slate-100 dark:border-[#222222] shadow-[20px_0_50px_rgba(0,0,0,0.15)] dark:shadow-[20px_0_50px_rgba(0,0,0,0.45)] z-50 flex flex-col justify-between overflow-hidden animate-slide-in-left transition-colors duration-300">
            
            {/* Drawer Header with Monogram & User Details */}
            <div className="p-6 bg-slate-950 dark:bg-slate-950/90 text-white flex flex-col gap-4 relative">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="flex items-center gap-3 mt-2">
                <div className="w-12 h-12 bg-white text-slate-950 rounded-xl flex items-center justify-center font-black text-xl shadow-md border border-neutral-200">
                  <span>NB</span>
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-widest text-white uppercase font-sans">NAYEL BASKET</h3>
                  <span className="text-[9px] text-[#D4AF37] font-mono font-bold tracking-wider uppercase block mt-0.5">EST. 2026</span>
                </div>
              </div>

              {customerUser ? (
                <div className="border-t border-white/10 pt-3 mt-1 text-left">
                  <span className="text-xs font-bold text-white block leading-tight">{customerUser.name}</span>
                  <span className="text-[9px] text-[#D4AF37] uppercase font-bold tracking-wider mt-0.5 inline-flex items-center gap-1">
                    👑 Elite {customerUser.tier.replace(" tier", "")} Connoisseur
                  </span>
                </div>
              ) : (
                <div className="border-t border-white/10 pt-3 mt-1 text-left flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-300 block">Guest Connoisseur</span>
                    <span className="text-[9px] text-slate-400 block font-sans">Auth required for bespoke orders</span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveSection("profile");
                      setIsDrawerOpen(false);
                    }}
                    className="bg-[#D4AF37] hover:bg-[#C5A880] text-slate-950 text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider transition cursor-pointer"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable Navigation Options - PREMIUM DETAILED LIST */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              
              {/* Home Showroom Link */}
              <button
                onClick={() => {
                  setActiveSection("home");
                  setIsDrawerOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                  activeSection === "home" 
                    ? "bg-slate-50 dark:bg-neutral-800 text-[#D4AF37]" 
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-850"
                }`}
              >
                <Home className="h-4.5 w-4.5 stroke-[1.8]" />
                <span>Home Showcase</span>
              </button>

              {/* Shop Catalog Link */}
              <button
                onClick={() => {
                  setActiveSection("categories");
                  setIsDrawerOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                  activeSection === "categories" 
                    ? "bg-slate-50 dark:bg-neutral-800 text-[#D4AF37]" 
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-850"
                }`}
              >
                <Layers className="h-4.5 w-4.5 stroke-[1.8]" />
                <span>Shop Catalog</span>
              </button>

              <div className="border-t border-slate-100 dark:border-[#222222] my-2"></div>

              {/* 1. My Profile */}
              <button
                onClick={() => {
                  setActiveSection("profile");
                  localStorage.setItem("nb_active_profile_tab", "dashboard");
                  window.dispatchEvent(new Event("nb-profile-tab-changed"));
                  setIsDrawerOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                  activeSection === "profile" && localStorage.getItem("nb_active_profile_tab") !== "addresses"
                    ? "bg-slate-50 dark:bg-neutral-800 text-[#D4AF37]" 
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-850"
                }`}
              >
                <User className="h-4.5 w-4.5 stroke-[1.8]" />
                <span>👤 My Profile</span>
              </button>

              {/* 2. My Orders */}
              <button
                onClick={() => {
                  setActiveSection("orders");
                  setIsDrawerOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                  activeSection === "orders" 
                    ? "bg-slate-50 dark:bg-neutral-800 text-[#D4AF37]" 
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-850"
                }`}
              >
                <ShoppingBag className="h-4.5 w-4.5 stroke-[1.8]" />
                <span>📦 My Orders</span>
              </button>

              {/* 3. Wishlist */}
              <button
                onClick={() => {
                  setActiveSection("wishlist");
                  setIsDrawerOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                  activeSection === "wishlist" 
                    ? "bg-slate-50 dark:bg-neutral-800 text-[#D4AF37]" 
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-850"
                }`}
              >
                <Heart className="h-4.5 w-4.5 stroke-[1.8]" />
                <span>❤️ Wishlist</span>
              </button>

              {/* 4. Addresses */}
              <button
                onClick={() => {
                  setActiveSection("profile");
                  localStorage.setItem("nb_active_profile_tab", "addresses");
                  window.dispatchEvent(new Event("nb-profile-tab-changed"));
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-850 transition text-left cursor-pointer"
              >
                <MapPin className="h-4.5 w-4.5 stroke-[1.8]" />
                <span>📍 Addresses</span>
              </button>

              {/* 5. Wallet */}
              <button
                onClick={() => {
                  setActiveSection("profile");
                  localStorage.setItem("nb_active_profile_tab", "dashboard");
                  window.dispatchEvent(new Event("nb-profile-tab-changed"));
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-850 transition text-left cursor-pointer"
              >
                <CreditCard className="h-4.5 w-4.5 stroke-[1.8]" />
                <span>💳 Wallet</span>
              </button>

              {/* 6. Coupons */}
              <button
                onClick={() => {
                  setActiveSection("profile");
                  localStorage.setItem("nb_active_profile_tab", "coupons");
                  window.dispatchEvent(new Event("nb-profile-tab-changed"));
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-850 transition text-left cursor-pointer"
              >
                <Tag className="h-4.5 w-4.5 stroke-[1.8]" />
                <span>🎁 Coupons</span>
              </button>

              {/* 7. Notifications */}
              <button
                onClick={() => {
                  setActiveSection("profile");
                  localStorage.setItem("nb_active_profile_tab", "notifications");
                  window.dispatchEvent(new Event("nb-profile-tab-changed"));
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-850 transition text-left cursor-pointer"
              >
                <Bell className="h-4.5 w-4.5 stroke-[1.8]" />
                <span>🔔 Notifications</span>
              </button>

              {/* 8. Language */}
              <button
                onClick={() => {
                  setIsLanguageOpen(true);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-850 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <Globe className="h-4.5 w-4.5 stroke-[1.8]" />
                  <span>🌐 Language</span>
                </div>
                <span className="text-[10px] text-[#D4AF37] font-sans font-semibold pr-1">{currentLanguage}</span>
              </button>

              {/* 9. Appearance with Immediate Accordion Trigger */}
              <div className="space-y-1">
                <button
                  onClick={() => setIsAppearanceExpanded(!isAppearanceExpanded)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-850 transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <Moon className="h-4.5 w-4.5 stroke-[1.8]" />
                    <span>🌙 Appearance</span>
                  </div>
                  {isAppearanceExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </button>
                
                {isAppearanceExpanded && (
                  <div className="pl-12 pr-4 py-1 space-y-1 animate-fade-in">
                    {[
                      { id: "light", label: "☀ Light Mode" },
                      { id: "dark", label: "🌙 Dark Mode" },
                      { id: "system", label: "📱 System Default" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setThemePreference(opt.id as any);
                          if (navigator.vibrate) navigator.vibrate(10);
                        }}
                        className={`w-full text-left py-1.5 px-3 text-[11px] font-bold rounded-lg transition-colors ${
                          themePreference === opt.id 
                            ? "bg-[#D4AF37]/10 text-[#D4AF37]" 
                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-neutral-850"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 10. Help / Story */}
              <button
                onClick={() => {
                  setIsAboutOpen(true);
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-850 transition text-left cursor-pointer"
              >
                <HelpCircle className="h-4.5 w-4.5 stroke-[1.8]" />
                <span>❓ Help</span>
              </button>

              {/* 11. Settings */}
              <button
                onClick={() => {
                  setActiveSection("profile");
                  localStorage.setItem("nb_active_profile_tab", "security");
                  window.dispatchEvent(new Event("nb-profile-tab-changed"));
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-850 transition text-left cursor-pointer"
              >
                <Settings className="h-4.5 w-4.5 stroke-[1.8]" />
                <span>⚙ Settings</span>
              </button>

              {/* 12. Logout */}
              {customerUser && (
                <button
                  onClick={() => {
                    localStorage.removeItem("nb_customer_user");
                    window.dispatchEvent(new Event("customer-user-changed"));
                    setActiveSection("home");
                    setIsDrawerOpen(false);
                    if (navigator.vibrate) navigator.vibrate(10);
                  }}
                  className="w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition text-left cursor-pointer"
                >
                  <LogOut className="h-4.5 w-4.5 stroke-[1.8]" />
                  <span>🚪 Logout</span>
                </button>
              )}

            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-slate-100 dark:border-[#222222] bg-slate-50/50 dark:bg-slate-950/20 text-center space-y-2">
              <p className="text-[9px] text-slate-400 font-medium font-sans italic leading-relaxed">
                "Curation is the calibration of physical spaces to echo inner spiritual layouts."
              </p>
            </div>

          </div>
        </>
      )}

      {/* Language Selection Bottom Sheet / Modal */}
      {isLanguageOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xs bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl border border-slate-100 dark:border-[#222222] p-5 animate-scale-up text-left text-neutral-900 dark:text-white">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3.5">Select Language</h3>
            <div className="space-y-1">
              {["English", "Français", "العربية", "Deutsch", "Español"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setCurrentLanguage(lang);
                    localStorage.setItem("nb_lang", lang);
                    setIsLanguageOpen(false);
                    if (navigator.vibrate) navigator.vibrate(10);
                  }}
                  className={`w-full flex items-center justify-between p-3 text-xs font-semibold rounded-xl transition ${
                    currentLanguage === lang 
                      ? "bg-[#D4AF37]/10 text-[#D4AF37]" 
                      : "hover:bg-slate-50 dark:hover:bg-neutral-850"
                  }`}
                >
                  <span>{lang}</span>
                  {currentLanguage === lang && <Check className="h-4 w-4 text-[#D4AF37]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* About Brand Story Sheet / Dialog */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col animate-scale-up text-left text-slate-900 dark:text-slate-100">
            
            {/* About Splash banner */}
            <div className="bg-slate-950 p-6 text-center text-white relative">
              <button
                onClick={() => setIsAboutOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="w-12 h-12 rounded-[1rem] bg-emerald-500 mx-auto flex items-center justify-center font-black text-slate-950 text-xl shadow-md mb-2">
                <span>NB</span>
              </div>
              <h2 className="text-md font-black tracking-widest uppercase">Nayel Basket</h2>
              <span className="text-[9px] text-emerald-400 font-mono tracking-widest block mt-0.5">THE ARTISANAL CRADLE</span>
            </div>

            {/* About content body */}
            <div className="p-6 space-y-4 max-h-[300px] overflow-y-auto font-sans leading-relaxed text-slate-600 dark:text-slate-300 text-xs">
              <p>
                Welcome to <strong>Nayel Basket</strong>, where we assemble furniture, lighting, and spatial curate setups that are far more than material decorations.
              </p>
              <p>
                Our philosophy centers around <strong>Bespoke Artisanal Luxury</strong>. Every single vase, clay sculpture, velvet tufted accent chair, or hand-loomed textile in our catalog is built by hand by master craftsmen across the world.
              </p>
              <p>
                By combining physical hand-assembly with <strong>Generative AI Spatial Calibration</strong>, we empower discerning curators to align physical geometry with colorways and lighting coordinates.
              </p>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-start gap-3">
                <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-950 dark:text-white text-[10px] uppercase">100% Sustainable</h4>
                  <p className="text-[9.5px] text-slate-400 mt-0.5 leading-tight">Every tree logged is re-planted. Materials are sustainably and ethically obtained.</p>
                </div>
              </div>
            </div>

            {/* Close footer */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                id="btn-close-about"
                onClick={() => setIsAboutOpen(false)}
                className="w-full bg-slate-950 hover:bg-slate-900 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white dark:text-slate-950 font-black py-3 rounded-2xl text-xs tracking-wider uppercase transition cursor-pointer shadow-md"
              >
                CONCLUDE READING
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
