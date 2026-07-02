import React from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers3,
  Bookmark,
  ReceiptText,
  Users2,
  PackageCheck,
  MessageSquare,
  TicketPercent,
  Flame,
  Zap,
  Sliders,
  Home,
  MonitorPlay,
  Heart,
  BookOpen,
  Bell,
  Wallet,
  UserPlus,
  BarChart,
  FileSpreadsheet,
  Search,
  Truck,
  RotateCcw,
  DollarSign,
  Settings,
  ShieldAlert,
  Lock,
  LogOut,
  ChevronLeft,
  Menu
} from "lucide-react";

export type AdminTab =
  | "dashboard"
  | "products"
  | "categories"
  | "collections"
  | "orders"
  | "customers"
  | "inventory"
  | "reviews"
  | "coupons"
  | "offers"
  | "flash_sale"
  | "banners"
  | "homepage"
  | "videos"
  | "testimonials"
  | "blogs"
  | "notifications"
  | "wallet"
  | "referral"
  | "analytics"
  | "reports"
  | "seo"
  | "shipping"
  | "returns"
  | "refunds"
  | "settings"
  | "admins"
  | "roles"
  | "logout";

interface SidebarItem {
  id: AdminTab;
  label: string;
  icon: any;
}

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  adminUser: { email: string; role: "super_admin" | "admin" | "manager" | "staff" | "customer" };
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  adminUser,
  onLogout,
  isOpen,
  setIsOpen
}) => {
  const sidebarItems: SidebarItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: ShoppingBag },
    { id: "categories", label: "Categories", icon: Layers3 },
    { id: "collections", label: "Collections", icon: Bookmark },
    { id: "orders", label: "Orders", icon: ReceiptText },
    { id: "customers", label: "Customers", icon: Users2 },
    { id: "inventory", label: "Inventory", icon: PackageCheck },
    { id: "reviews", label: "Reviews", icon: MessageSquare },
    { id: "coupons", label: "Coupons", icon: TicketPercent },
    { id: "offers", label: "Offers", icon: Flame },
    { id: "flash_sale", label: "Flash Sale", icon: Zap },
    { id: "banners", label: "Banners", icon: Sliders },
    { id: "homepage", label: "Homepage", icon: Home },
    { id: "videos", label: "Videos", icon: MonitorPlay },
    { id: "testimonials", label: "Testimonials", icon: Heart },
    { id: "blogs", label: "Blogs", icon: BookOpen },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "wallet", label: "Wallet Logs", icon: Wallet },
    { id: "referral", label: "Referral Program", icon: UserPlus },
    { id: "analytics", label: "Analytics Stats", icon: BarChart },
    { id: "reports", label: "Reports Generator", icon: FileSpreadsheet },
    { id: "seo", label: "SEO Config", icon: Search },
    { id: "shipping", label: "Shipping Logistics", icon: Truck },
    { id: "returns", label: "Returns Manager", icon: RotateCcw },
    { id: "refunds", label: "Refunds Portal", icon: DollarSign },
    { id: "settings", label: "Global Settings", icon: Settings },
    { id: "admins", label: "Admins Roster", icon: ShieldAlert },
    { id: "roles", label: "Roles & Permissions", icon: Lock },
  ];

  const handleTabClick = (tab: AdminTab) => {
    if (tab === "logout") {
      onLogout();
    } else {
      setActiveTab(tab);
    }
    // Close sidebar on mobile after clicking
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          id="sidebar-overlay"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-all animate-fade-in"
        ></div>
      )}

      {/* Main Sidebar Wrapper */}
      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-slate-100 shadow-xl transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header area */}
        <div className="flex items-center justify-between p-4 border-b border-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="bg-neutral-950 w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center p-0.5 shadow-sm border border-neutral-800 shrink-0">
              <img src="/icon.svg" alt="Nayel Basket" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <span className="font-sans font-black text-black text-[13px] tracking-tight uppercase block leading-none">
                Nayel Basket
              </span>
              <span className="text-[8px] font-bold text-[#34C759] tracking-wider uppercase block mt-1 font-mono">
                Enterprise Dashboard
              </span>
            </div>
          </div>
          <button
            id="btn-close-sidebar"
            onClick={() => setIsOpen(false)}
            className="lg:hidden h-8 w-8 bg-[#F7F7F7] hover:bg-neutral-100 rounded-full flex items-center justify-center text-slate-500 hover:text-black cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Sidebar Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 scrollbar-thin">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#34C759]/10 text-[#34C759] border-l-4 border-[#34C759] font-black"
                    : "text-slate-500 hover:text-black hover:bg-slate-50"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 stroke-[2] ${isSelected ? "text-[#34C759]" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Active Administrator details & Logout at bottom */}
        <div className="p-4 bg-[#F7F7F7] m-4 rounded-[1.5rem] border border-slate-100 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-black text-white font-bold flex items-center justify-center text-xs uppercase font-mono shadow-md">
              {adminUser.role.substring(0, 2)}
            </div>
            <div className="truncate flex-1">
              <span className="block text-[10px] font-extrabold text-black uppercase tracking-wider leading-tight">
                {adminUser.role} Portal
              </span>
              <span className="block text-[9px] text-slate-400 font-mono truncate">
                {adminUser.email}
              </span>
            </div>
          </div>

          <button
            id="btn-sidebar-logout"
            onClick={onLogout}
            className="w-full py-2 bg-white hover:bg-rose-50 border border-slate-200 text-rose-500 text-[10px] font-bold uppercase rounded-xl tracking-widest flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>LOG OUT</span>
          </button>
        </div>
      </aside>
    </>
  );
};
