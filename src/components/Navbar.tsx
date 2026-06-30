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
  Cpu
} from "lucide-react";

interface NavbarProps {
  onBackToHome: () => void;
  onSelectAi: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onBackToHome, onSelectAi }) => {
  const { 
    notifications, 
    markNotificationAsRead, 
    searchQuery, 
    setSearchQuery 
  } = useApp();
  
  const [openNotifications, setOpenNotifications] = useState(false);
  const [greeting, setGreeting] = useState("Welcome");
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);

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

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 text-black">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between py-4 sm:py-5 h-20">
          
          {/* Brand Logo & Name */}
          <div 
            id="brand-logo-trigger"
            className="flex flex-col items-start cursor-pointer group" 
            onClick={onBackToHome}
          >
            <div className="flex items-center gap-2">
              <div className="bg-black p-1.5 rounded-lg transition-transform duration-300 group-hover:scale-105">
                <ShoppingBag className="h-4 w-4 text-white stroke-[2]" />
              </div>
              <span className="text-sm font-black tracking-[0.15em] font-sans text-black uppercase">
                NAYEL BASKET
              </span>
            </div>
            
            {/* Greeting text below logo */}
            <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-1 animate-fade-in">
              {greeting}, connoisseur
            </span>
          </div>

          {/* Search bar centered with rounded premium design */}
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <div className="relative w-full">
              <input
                id="header-search-input"
                type="text"
                placeholder="Search bespoke furniture, lighting, wall decor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-black/50 focus:bg-white text-xs px-4 py-2.5 pl-10 rounded-full transition-all duration-300 outline-none text-black placeholder-slate-400"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 stroke-[2]" />
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
            
            {/* AI Assistant Button (Display "Coming Soon" elegantly next to or inside) */}
            <div className="relative group">
              <button
                id="btn-ai-assistant-header"
                onClick={onSelectAi}
                className="p-2.5 text-slate-600 hover:text-black bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-100 transition duration-300 relative cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4 text-[#34C759] animate-pulse" />
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#34C759] bg-[#34C759]/10 px-2 py-0.5 rounded-full border border-[#34C759]/20">
                  Coming Soon
                </span>
              </button>
              
              {/* Tooltip on hover */}
              <div className="absolute right-0 top-full mt-2 w-52 bg-black text-white text-[10px] p-2.5 rounded-xl shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 leading-relaxed font-sans">
                Our bespoke <strong className="text-[#34C759]">AI Stylist</strong> will calibrate placement using real-time camera logic. Click to preview.
              </div>
            </div>

            {/* Notifications Button */}
            <div className="relative">
              <button
                id="btn-notifications-header"
                onClick={() => setOpenNotifications(!openNotifications)}
                className="p-2.5 text-slate-600 hover:text-black bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-100 transition relative cursor-pointer"
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
