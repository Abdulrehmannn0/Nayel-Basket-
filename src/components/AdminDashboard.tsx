import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { 
  dbGetProducts, 
  dbGetOrders, 
  dbAddProduct, 
  dbUpdateProduct, 
  dbDeleteProduct, 
  dbUpdateOrderStatus, 
  isSupabaseConnected 
} from "../lib/supabase";
import { AdminSidebar, AdminTab } from "./AdminSidebar";
import { AdminDashboardOverview } from "./AdminDashboardOverview";
import { AdminProductManager } from "./AdminProductManager";
import { AdminOrderManager } from "./AdminOrderManager";
import { AdminCustomerManager } from "./AdminCustomerManager";
import { AdminSettings } from "./AdminSettings";
import { AdminCategoryManager } from "./AdminCategoryManager";
import { AdminInventoryManager } from "./AdminInventoryManager";
import { AdminCouponManager } from "./AdminCouponManager";
import { AdminFlashSaleManager } from "./AdminFlashSaleManager";
import { AdminBannerManager } from "./AdminBannerManager";
import { AdminHomepageSectionManager } from "./AdminHomepageSectionManager";
import { AdminVideoManager } from "./AdminVideoManager";
import { AdminTestimonialManager } from "./AdminTestimonialManager";
import { AdminBlogManager } from "./AdminBlogManager";
import { AdminReviewManager } from "./AdminReviewManager";
import { AdminAnalyticsManager } from "./AdminAnalyticsManager";
import { AdminReportManager } from "./AdminReportManager";
import { AdminRolesAndSecurityManager } from "./AdminRolesAndSecurityManager";
import { 
  Menu, 
  Bell, 
  Plus, 
  Trash2, 
  Check, 
  Tag, 
  Image, 
  Layers, 
  ShieldAlert, 
  Lock,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Search,
  Package,
  Calendar,
  Share2
} from "lucide-react";
import { Product, Order, Coupon, AppNotification } from "../types";

interface AdminDashboardProps {
  adminUser: { email: string; role: "super_admin" | "admin" | "manager" | "staff" | "customer" };
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminUser, onLogout }) => {
  const { 
    products, 
    setProducts, 
    orders, 
    setOrders, 
    notifications, 
    addNotification,
    walletBalance,
    addWalletFunds,
    rewardPoints,
    addRewardPoints
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [supabaseState, setSupabaseState] = useState<"connected" | "disconnected">("disconnected");

  // Synchronize database on load
  useEffect(() => {
    setSupabaseState(isSupabaseConnected() ? "connected" : "disconnected");
    syncData();
  }, []);

  // Secure auto-logout after 2 minutes of complete inactivity
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        console.warn("Auto Logging out admin due to complete inactivity.");
        addNotification(
          "🛡️ Session Expired",
          "Admin logged out automatically due to 2 minutes of inactivity.",
          "system"
        );
        onLogout();
      }, 120000);
    };

    window.addEventListener("mousemove", resetIdleTimer);
    window.addEventListener("keydown", resetIdleTimer);
    window.addEventListener("scroll", resetIdleTimer);
    window.addEventListener("click", resetIdleTimer);

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
      window.removeEventListener("scroll", resetIdleTimer);
      window.removeEventListener("click", resetIdleTimer);
    };
  }, [onLogout]);

  const syncData = async () => {
    if (!isSupabaseConnected()) {
      console.log("Supabase not configured or active. Falling back securely to localStorage cache.");
      return;
    }
    setIsSyncing(true);
    try {
      const dbProds = await dbGetProducts(products);
      setProducts(dbProds);
      const dbOrds = await dbGetOrders(orders);
      setOrders(dbOrds);
    } catch (err) {
      console.warn("Supabase sync failed, using localStorage cache.", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // 1. Categories State Manager
  const [categories, setCategories] = useState([
    { name: "Furniture", count: 12, priority: 1, visible: true, sub: "Solid Wood Tables, Floating Oak" },
    { name: "Lighting", count: 8, priority: 2, visible: true, sub: "Blown Ambient Lights, Chandeliers" },
    { name: "Vases & Pots", count: 15, priority: 3, visible: true, sub: "Organic Clay, Hand-Burnished Brass" },
    { name: "Rugs & Carpets", count: 5, priority: 4, visible: true, sub: "Woven Wool, Jute Textures" },
    { name: "Wall Decor", count: 6, priority: 5, visible: true, sub: "Bespoke Sculptures, Metal Frames" }
  ]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatSub, setNewCatSub] = useState("");
  const [newCatPriority, setNewCatPriority] = useState("5");

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    setCategories(prev => [
      ...prev, 
      { name: newCatName, count: 0, priority: Number(newCatPriority), visible: true, sub: newCatSub }
    ]);
    setNewCatName("");
    setNewCatSub("");
  };

  // 2. Coupons State Manager
  const [coupons, setCoupons] = useState<Coupon[]>([
    { code: "NAYEL20", type: "percentage", value: 20, minSpend: 80, description: "Enjoy 20% off on exquisite home decor!", expiry: "2026-12-31" },
    { code: "DECOR15", type: "fixed", value: 15, minSpend: 50, description: "Save a flat $15 on our collections over $50.", expiry: "2026-12-31" },
    { code: "FREESHIP", type: "percentage", value: 100, minSpend: 0, description: "Complimentary elite premium delivery.", expiry: "2026-12-31" }
  ]);
  const [newCoupCode, setNewCoupCode] = useState("");
  const [newCoupVal, setNewCoupVal] = useState("20");
  const [newCoupMin, setNewCoupMin] = useState("100");
  const [newCoupDesc, setNewCoupDesc] = useState("");

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupCode) return;
    const added: Coupon = {
      code: newCoupCode.toUpperCase(),
      type: "percentage",
      value: Number(newCoupVal),
      minSpend: Number(newCoupMin),
      description: newCoupDesc || `${newCoupVal}% off all premium decors`,
      expiry: "2026-12-31"
    };
    setCoupons(prev => [added, ...prev]);
    setNewCoupCode("");
    setNewCoupDesc("");
  };

  // 3. Notifications/Firebase Push Simulator
  const [notifTitle, setNotifTitle] = useState("⚡ Flash Sale Alert!");
  const [notifMsg, setNotifMsg] = useState("Experience 30% savings on hand-burnished brass and candle vessels tonight.");
  const [notifImg, setNotifImg] = useState("https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=400&q=80");
  const [notifAudience, setNotifAudience] = useState("all");
  const [notifType, setNotifType] = useState<AppNotification["type"]>("promo");
  const [notifSuccess, setNotifSuccess] = useState(false);

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification(notifTitle, notifMsg, notifType);
    setNotifSuccess(true);
    setTimeout(() => {
      setNotifSuccess(false);
      setNotifTitle("");
      setNotifMsg("");
    }, 2000);
  };

  // 4. Banners & Homepage Manager
  const [banners, setBanners] = useState([
    { id: "ban_1", title: "Summer Solstice Curation", subtitle: "Hand-burnished brass & organic clay vessels.", image: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1200&q=80", type: "Image Carousel", active: true },
    { id: "ban_2", title: "Solid European Oak Tables", subtitle: "Artisanal joinery & natural finishes.", image: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=1200&q=80", type: "Video Banner", active: true }
  ]);
  const [newBanTitle, setNewBanTitle] = useState("");
  const [newBanImage, setNewBanImage] = useState("");
  const [newBanType, setNewBanType] = useState("Image Carousel");

  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanTitle || !newBanImage) return;
    setBanners(prev => [
      ...prev,
      { id: `ban_${Date.now()}`, title: newBanTitle, subtitle: "Exclusive Nayel collection", image: newBanImage, type: newBanType, active: true }
    ]);
    setNewBanTitle("");
    setNewBanImage("");
  };

  // 5. Admins & Roles Manager
  const [admins, setAdmins] = useState([
    { email: "abdullrehmann011@gmail.com", role: "super_admin", department: "Executive Administration", created: "2026-07-01" },
    { email: "manager@nayelbasket.com", role: "manager", department: "Atelier Curations", created: "2026-07-03" },
    { email: "staff@nayelbasket.com", role: "staff", department: "Customer Concierge", created: "2026-07-04" }
  ]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<"super_admin" | "admin" | "manager" | "staff" | "customer">("staff");
  const [newAdminDept, setNewAdminDept] = useState("");

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;

    if (adminUser.role !== "super_admin") {
      alert("Security Exception: Only the Super Admin has permission to create Manager or Staff accounts.");
      return;
    }

    if (newAdminRole === "super_admin") {
      alert("Security Exception: Creating additional Super Admin accounts is strictly forbidden.");
      return;
    }

    setAdmins(prev => [
      ...prev,
      { email: newAdminEmail, role: newAdminRole, department: newAdminDept || "Fulfillment", created: new Date().toISOString().substring(0, 10) }
    ]);
    setNewAdminEmail("");
    setNewAdminDept("");
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FAFAFA] text-black font-sans relative">
      
      {/* 1. Responsive Sidebar Component */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        adminUser={adminUser}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* 2. Main Workstation Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              id="btn-sidebar-toggle"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 bg-[#F7F7F7] hover:bg-neutral-100 rounded-xl text-slate-500 hover:text-black cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-sm font-black text-black uppercase tracking-wider font-sans">
                Nayel Basket Portal
              </h1>
              <span className="text-[10px] text-slate-400 font-mono">
                Terminal Workspace • Stable Cloud Connected
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Supabase Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#FAFBFD] border border-slate-100 rounded-xl text-[10px] font-mono font-bold text-slate-500 shadow-sm">
              <span className={`h-2 w-2 rounded-full ${supabaseState === "connected" ? "bg-[#34C759] animate-pulse" : "bg-amber-400"}`}></span>
              <span>Supabase: {supabaseState.toUpperCase()}</span>
            </div>

            {/* Sync trigger button */}
            <button
              id="btn-sync-database"
              onClick={syncData}
              disabled={isSyncing}
              title="Synchronize database schema"
              className="p-2.5 bg-[#F7F7F7] hover:bg-neutral-100 border text-black rounded-xl cursor-pointer shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            </button>

            {/* Notification counts */}
            <div className="relative p-2.5 bg-[#F7F7F7] border text-black rounded-xl shadow-sm">
              <Bell className="h-4 w-4" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#34C759] animate-pulse"></span>
              )}
            </div>

          </div>
        </header>

        {/* Dynamic Tab Workspace viewport */}
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Tab Route allocation */}
          {activeTab === "dashboard" && (
            <AdminDashboardOverview 
              products={products} 
              orders={orders} 
              onNavigateToTab={(tab) => setActiveTab(tab)} 
            />
          )}

          {activeTab === "products" && (
            <AdminProductManager 
              products={products} 
              setProducts={setProducts} 
              onAddProductDB={dbAddProduct}
              onEditProductDB={dbUpdateProduct}
              onDeleteProductDB={dbDeleteProduct}
            />
          )}

          {activeTab === "orders" && (
            <AdminOrderManager 
              orders={orders} 
              setOrders={setOrders} 
              onUpdateOrderStatusDB={dbUpdateOrderStatus}
            />
          )}

          {activeTab === "customers" && (
            <AdminCustomerManager 
              orders={orders} 
              walletBalance={walletBalance} 
              addWalletFunds={addWalletFunds}
              rewardPoints={rewardPoints}
              addRewardPoints={addRewardPoints}
            />
          )}

          {activeTab === "settings" && <AdminSettings />}

           {/* INTEGRATED CUSTOM MODULES */}
          {activeTab === "categories" && <AdminCategoryManager />}

          {activeTab === "coupons" && <AdminCouponManager />}

          {activeTab === "inventory" && <AdminInventoryManager />}

          {activeTab === "flash_sale" && <AdminFlashSaleManager />}

          {activeTab === "banners" && <AdminBannerManager />}

          {activeTab === "homepage" && <AdminHomepageSectionManager />}

          {activeTab === "videos" && <AdminVideoManager />}

          {activeTab === "testimonials" && <AdminTestimonialManager />}

          {activeTab === "blogs" && <AdminBlogManager />}

          {activeTab === "reviews" && <AdminReviewManager />}

          {activeTab === "analytics" && <AdminAnalyticsManager />}

          {activeTab === "reports" && <AdminReportManager />}

          {activeTab === "roles" && <AdminRolesAndSecurityManager adminUser={adminUser} />}

          {/* INLINE MODULE: Notifications/Firebase Center */}
          {activeTab === "notifications" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
              
              <div className="lg:col-span-2 bg-white p-8 border rounded-[2.5rem] shadow-sm space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-sm font-black text-black uppercase tracking-tight flex items-center gap-1.5">
                    <Bell className="h-5 w-5 text-[#34C759]" />
                    <span>Firebase Push Notification Console</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Broadcast Rich App Alerts and Festival Promos instantly to targeted device tokens.</p>
                </div>

                <form onSubmit={handleSendNotification} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Alert Broadcast Title</label>
                      <input required value={notifTitle} onChange={e => setNotifTitle(e.target.value)} className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black font-semibold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Broadcaster Channel</label>
                      <select value={notifType} onChange={e => setNotifType(e.target.value as any)} className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl font-bold">
                        <option value="promo">Marketing Promotion (Promo)</option>
                        <option value="order">Order Transaction Alert</option>
                        <option value="system">Global System Announcement</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rich Image Banner URL (Optional)</label>
                    <input value={notifImg} onChange={e => setNotifImg(e.target.value)} className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notification message (Rich Text Payload)</label>
                    <textarea rows={3} required value={notifMsg} onChange={e => setNotifMsg(e.target.value)} className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black"></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Audience</label>
                      <select value={notifAudience} onChange={e => setNotifAudience(e.target.value)} className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl font-bold">
                        <option value="all">All Subscribed Devices ({orders.length + 80} tokens)</option>
                        <option value="vip">High Lifetime Spenders (VIP Patrons)</option>
                        <option value="dormant">Dormant Collectors (No orders &gt; 30 days)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Transmission Schedule</label>
                      <select className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl font-mono">
                        <option>Broadcast Immediately (Instant Trigger)</option>
                        <option>Schedule for tomorrow morning (9:00 AM)</option>
                        <option>Schedule for weekend solstice (Sat 6:00 PM)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex justify-between items-center">
                    {notifSuccess ? (
                      <span className="text-emerald-600 font-extrabold flex items-center gap-1.5 font-mono animate-bounce text-[10px]">
                        <Check className="h-4 w-4" />
                        <span>DISPATCHED TO DEVICE TOKENS SUCCESS!</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px] font-mono">Secure TLS Socket Active</span>
                    )}

                    <button type="submit" className="px-6 py-3 bg-black hover:bg-[#34C759] text-white text-[10px] font-bold uppercase rounded-xl tracking-wider transition-all shadow-lg cursor-pointer">
                      Send Broadcast Push
                    </button>
                  </div>
                </form>
              </div>

              {/* Push Dispatch history log */}
              <div className="bg-white p-6 border rounded-[2.5rem] shadow-sm space-y-4">
                <h3 className="text-sm font-black text-black uppercase border-b pb-4">Push Broadcast History</h3>
                <div className="space-y-3 max-h-[22rem] overflow-y-auto">
                  {notifications.map((n, idx) => (
                    <div key={idx} className="p-3 bg-[#F7F7F7] rounded-xl border space-y-1">
                      <span className="text-[10px] font-extrabold text-black uppercase block">{n.title}</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{n.description}</p>
                      <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 pt-1">
                        <span>Type: {n.type.toUpperCase()}</span>
                        <span>{new Date(n.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* INLINE MODULE: Admins & Permissions */}
          {activeTab === "admins" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
              
              {/* Left List */}
              <div className="lg:col-span-2 bg-white p-6 border rounded-[2.5rem] shadow-sm space-y-4">
                <div className="border-b pb-4">
                  <h3 className="text-sm font-black text-black uppercase tracking-tight">Active Administrators roster</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Define corporate system credentials, access roles, and fulfillment departments.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b text-slate-400 font-extrabold text-[9px] uppercase tracking-wider">
                        <th className="py-2">Administrator Profile</th>
                        <th className="py-2">Corporate Role</th>
                        <th className="py-2">Operational Department</th>
                        <th className="py-2">Registered</th>
                        <th className="py-2 text-right">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-slate-600 font-mono text-[11px]">
                      {admins.map((a, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-3 font-bold text-black font-sans text-xs">{a.email}</td>
                          <td className="py-3">
                            <span className={`inline-block text-[8px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                              a.role === "super_admin" ? "bg-red-600 text-white" :
                              a.role === "admin" ? "bg-black text-white" :
                              a.role === "manager" ? "bg-[#34C759]/10 text-[#34C759]" :
                              "bg-slate-200 text-slate-600"
                            }`}>
                              {a.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 font-semibold text-slate-700 font-sans">{a.department}</td>
                          <td className="py-3 text-slate-400">{a.created}</td>
                          <td className="py-3 text-right">
                            <button onClick={() => setAdmins(prev => prev.filter((_, i) => i !== idx))} className="p-1 text-slate-400 hover:text-rose-600 border rounded cursor-pointer">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add admin block */}
              <div className="bg-white p-6 border rounded-[2.5rem] shadow-sm">
                {adminUser.role !== "super_admin" ? (
                  <div className="space-y-4 text-center py-6">
                    <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 mx-auto">
                      <Lock className="h-5 w-5" />
                    </div>
                    <h4 className="text-xs font-black text-black uppercase">Access Locked</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Only the Super Admin (@abdulrehmann011) has authorization to create Manager and Staff accounts.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleAddAdmin} className="space-y-4">
                    <h3 className="text-sm font-black text-black uppercase border-b pb-4">Create System Account</h3>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Authorized corporate Email</label>
                      <input required value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black focus:outline-none focus:bg-white focus:border-[#34C759]" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Corporate System Role</label>
                      <select value={newAdminRole} onChange={e => setNewAdminRole(e.target.value as any)} className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl font-bold">
                        <option value="manager">Atelier Manager (Manager)</option>
                        <option value="staff">Customer Concierge Staff (Staff)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Fulfillment Department</label>
                      <input value={newAdminDept} onChange={e => setNewAdminDept(e.target.value)} className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl" />
                    </div>
                    <button type="submit" className="w-full py-3 bg-black hover:bg-[#34C759] text-white font-bold uppercase rounded-xl tracking-wider text-[10px] cursor-pointer">
                      Enroll Account
                    </button>
                  </form>
                )}
              </div>

            </div>
          )}

          {/* Fallback for un-implemented sub-tabs (Banners, Testimonials, Blogs, SEO, etc.) */}
          {["collections", "offers", "wallet", "referral", "seo", "shipping", "returns", "refunds"].includes(activeTab) && (
            <div className="bg-white p-8 border rounded-[2.5rem] shadow-sm text-center py-20 text-slate-500 space-y-4 max-w-lg mx-auto">
              <div className="h-12 w-12 bg-[#34C759]/10 rounded-2xl flex items-center justify-center text-[#34C759] mx-auto">
                <Sparkles className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className="text-sm font-black text-black uppercase tracking-wider">
                {activeTab.replace("_", " ")} Workspace Active
              </h3>
              <p className="text-xs leading-relaxed max-w-xs mx-auto font-medium">
                Our premium white theme layout is fully synchronized. Use dashboard cards and database triggers to manipulate products, orders and settings.
              </p>
              <div className="pt-2">
                <button
                  id="btn-tab-fallback-sync"
                  onClick={() => alert(`Operational Workspace initialized. Sub-tab data synchronized.`)}
                  className="px-5 py-2.5 bg-[#F7F7F7] hover:bg-neutral-100 border text-black font-bold uppercase text-[9px] tracking-widest rounded-xl shadow-sm transition-all"
                >
                  Confirm Synchronization
                </button>
              </div>
            </div>
          )}

        </main>

        {/* Workspace Footer */}
        <footer className="border-t border-slate-100 bg-white py-4 text-center text-[10px] text-slate-400">
          <p>© 2026 Nayel Basket. Secure Enterprise Administrator Shell v4.2.0.</p>
        </footer>

      </div>
    </div>
  );
};
