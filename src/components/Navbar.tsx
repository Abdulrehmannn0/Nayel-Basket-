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
  Moon
} from "lucide-react";

interface NavbarProps {
  activeSection: "home" | "categories" | "wishlist" | "cart" | "profile" | "ai";
  setActiveSection: (sec: "home" | "categories" | "wishlist" | "cart" | "profile" | "ai") => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection, setActiveSection }) => {
  const { 
    notifications, 
    markNotificationAsRead, 
    searchQuery, 
    setSearchQuery,
    cart,
    wishlist,
    theme,
    toggleTheme
  } = useApp();
  
  const [openNotifications, setOpenNotifications] = useState(false);
  const [greeting, setGreeting] = useState("Welcome");
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [customerUser, setCustomerUser] = useState<any>(() => {
    const saved = localStorage.getItem("nb_customer_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting("Good Morning");
    } else if (hours < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }

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

  const unreadCount = notifications.filter((n) => !n.read).length;
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-900 text-black dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between py-4 sm:py-5 h-20">
          
          {/* Brand Logo & Name */}
          <div 
            id="brand-logo-trigger"
            className="flex flex-col items-start cursor-pointer group" 
            onClick={() => setActiveSection("home")}
          >
            <div className="flex items-center gap-2">
              <div className="bg-black dark:bg-slate-800 p-1.5 rounded-lg transition-transform duration-300 group-hover:scale-105">
                <ShoppingBag className="h-4 w-4 text-white stroke-[2]" />
              </div>
              <span className="text-sm font-black tracking-[0.15em] font-sans text-black dark:text-white uppercase">
                NAYEL BASKET
              </span>
            </div>
            
            {/* Greeting text below logo */}
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide mt-1 animate-fade-in">
              {greeting}, connoisseur
            </span>
          </div>

          {/* Desktop Central Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.15em] font-sans">
            <button
              id="nav-link-home"
              onClick={() => setActiveSection("home")}
              className={`hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer ${activeSection === "home" ? "text-black dark:text-white border-b-2 border-black dark:border-white pb-1.5" : "text-slate-400"}`}
            >
              Home
            </button>
            <button
              id="nav-link-categories"
              onClick={() => setActiveSection("categories")}
              className={`hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer ${activeSection === "categories" ? "text-black dark:text-white border-b-2 border-black dark:border-white pb-1.5" : "text-slate-400"}`}
            >
              Catalog
            </button>
            <button
              id="nav-link-wishlist"
              onClick={() => setActiveSection("wishlist")}
              className={`hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer flex items-center gap-1 ${activeSection === "wishlist" ? "text-black dark:text-white border-b-2 border-black dark:border-white pb-1.5" : "text-slate-400"}`}
            >
              <span>Curations</span>
              {wishlistCount > 0 && (
                <span className="bg-neutral-200 dark:bg-slate-800 text-neutral-800 dark:text-slate-200 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button
              id="nav-link-cart"
              onClick={() => setActiveSection("cart")}
              className={`hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer flex items-center gap-1.5 ${activeSection === "cart" ? "text-black dark:text-white border-b-2 border-black dark:border-white pb-1.5" : "text-slate-400"}`}
            >
              <span>Bag</span>
              {cartCount > 0 ? (
                <span className="bg-[#34C759] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                  {cartCount}
                </span>
              ) : (
                <span className="text-slate-300 dark:text-slate-600 font-light">0</span>
              )}
            </button>
            <button
              id="nav-link-profile"
              onClick={() => setActiveSection("profile")}
              className={`hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer ${activeSection === "profile" ? "text-black dark:text-white border-b-2 border-black dark:border-white pb-1.5" : "text-slate-400"}`}
            >
              Profile
            </button>
          </div>

          {/* Search bar centered with rounded premium design */}
          <div className="hidden md:flex flex-1 max-w-xs mx-4 relative">
            <div className="relative w-full">
              <input
                id="header-search-input"
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 focus:border-black/50 dark:focus:border-white/50 focus:bg-white dark:focus:bg-slate-950 text-xs px-4 py-2 pl-9 rounded-full transition-all duration-300 outline-none text-black dark:text-white placeholder-slate-400"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500 stroke-[2]" />
              {searchQuery && (
                <button
                  id="btn-clear-search"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* User Metrics & QuickActions (Top Right) */}
          <div className="flex items-center gap-4">

            {/* Guest / Profile Status Badge */}
            <button
              id="btn-navbar-profile-badge"
              onClick={() => setActiveSection("profile")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition duration-300 cursor-pointer ${
                customerUser 
                  ? "bg-slate-50 hover:bg-slate-100 border-slate-200/80" 
                  : "bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/20 text-amber-600"
              }`}
            >
              <div className="relative flex items-center justify-center">
                {customerUser ? (
                  <div className="w-5.5 h-5.5 bg-neutral-900 text-white rounded-full flex items-center justify-center text-[9px] font-black uppercase font-mono">
                    {customerUser.name.split(" ").map((n: any) => n[0]).join("").substring(0, 2)}
                  </div>
                ) : (
                  <div className="w-5.5 h-5.5 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                    👤
                  </div>
                )}
                {isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#34C759] border-2 border-white rounded-full"></span>
                )}
              </div>
              <div className="text-left hidden sm:block">
                {customerUser ? (
                  <div>
                    <span className="text-[10px] font-black text-black font-sans leading-tight block">
                      {customerUser.name.split(" ")[0]}
                    </span>
                    <span className="text-[8px] font-bold text-[#34C759] uppercase tracking-wider font-mono block leading-none mt-0.5">
                      {customerUser.tier.replace(" tier", "")}
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] font-black text-amber-800 leading-tight block">
                      GUEST PATRON
                    </span>
                    <span className="text-[8px] font-bold text-amber-500/80 uppercase tracking-widest font-sans block leading-none mt-0.5">
                      TAP TO AUTH
                    </span>
                  </div>
                )}
              </div>
            </button>
            
            {/* AI Assistant Button */}
            <div className="relative group">
              <button
                id="btn-ai-assistant-header"
                onClick={() => setActiveSection("ai")}
                className={`p-2 sm:p-2.5 rounded-full border transition duration-300 relative cursor-pointer flex items-center gap-1.5 ${activeSection === "ai" ? "bg-[#34C759]/10 border-[#34C759]/30 text-black dark:text-white" : "text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800"}`}
              >
                <Sparkles className="h-4 w-4 text-[#34C759] animate-pulse" />
                <span className="hidden sm:inline text-[9px] uppercase font-bold tracking-widest text-[#34C759] bg-[#34C759]/10 px-2 py-0.5 rounded-full border border-[#34C759]/20">
                  AI Stylist
                </span>
              </button>
              
              {/* Tooltip on hover */}
              <div className="absolute right-0 top-full mt-2 w-52 bg-black text-white text-[10px] p-2.5 rounded-xl shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 leading-relaxed font-sans">
                Our bespoke <strong className="text-[#34C759]">AI Stylist</strong> will calibrate spacing and suggest pairing. Click to chat!
              </div>
            </div>

            {/* Premium Theme Switcher Button */}
            <button
              id="btn-theme-toggle-header"
              type="button"
              onClick={toggleTheme}
              className="p-2.5 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 transition cursor-pointer"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            </button>

            {/* Notifications Button */}
            <div className="relative">
              <button
                id="btn-notifications-header"
                onClick={() => setOpenNotifications(!openNotifications)}
                className="p-2.5 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 transition relative cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {openNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 divide-y divide-slate-100 text-black">
                  <div className="p-4 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-slate-500">Inbox Notifications</span>
                    <button 
                      id="btn-close-notifications-header"
                      onClick={() => setOpenNotifications(false)} 
                      className="text-slate-400 hover:text-black cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 font-light">
                        No notifications found.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={`p-4 text-xs transition-colors cursor-pointer hover:bg-slate-50/40 ${n.read ? "bg-white" : "bg-[#34C759]/5"}`}
                          onClick={() => {
                            markNotificationAsRead(n.id);
                          }}
                        >
                          <div className="flex items-start gap-2 justify-between">
                            <span className="font-bold text-black text-[11px] leading-tight">
                              {n.title}
                            </span>
                            {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-[#34C759] mt-1 flex-shrink-0 animate-pulse"></span>}
                          </div>
                          <p className="text-slate-500 mt-1 leading-relaxed text-[10px] font-sans">{n.description}</p>
                          <span className="text-[8px] text-slate-400 block mt-1.5 font-mono">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Search input block */}
        <div className="md:hidden pb-4">
          <div className="relative w-full">
            <input
              id="header-search-mobile"
              type="text"
              placeholder="Search furniture, decor, lighting..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-black/50 focus:bg-white text-xs px-4 py-2.5 pl-10 rounded-full transition-all outline-none text-black placeholder-slate-400"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 stroke-[2]" />
            {searchQuery && (
              <button
                id="btn-clear-search-mobile"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
};
