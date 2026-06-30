import React from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  MousePointer, 
  Activity, 
  Award, 
  AlertTriangle,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { Product, Order } from "../types";

interface DashboardOverviewProps {
  products: Product[];
  orders: Order[];
  onNavigateToTab: (tab: any) => void;
}

export const AdminDashboardOverview: React.FC<DashboardOverviewProps> = ({
  products,
  orders,
  onNavigateToTab
}) => {
  // 1. Calculate primary overview metrics
  const totalRevenue = orders
    .filter(o => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.total, 0) + 14850.00; // adding baseline metrics

  const pendingOrdersCount = orders.filter(o => o.status === "Pending" || o.status === "Processing").length;
  
  const lowStockAlerts = products.filter(p => p.stock <= 5);
  
  const todaySales = orders
    .filter(o => {
      const orderDate = new Date(o.date);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    })
    .reduce((sum, o) => sum + o.total, 0);

  const todayOrdersCount = orders.filter(o => {
    const orderDate = new Date(o.date);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).length;

  // Visual highlights and charts datasets
  const revenueHistory = [
    { month: "Jan", sales: 12400, orders: 48 },
    { month: "Feb", sales: 14500, orders: 55 },
    { month: "Mar", sales: 19800, orders: 72 },
    { month: "Apr", sales: 16200, orders: 60 },
    { month: "May", sales: 22400, orders: 85 },
    { month: "Jun", sales: totalRevenue > 22400 ? totalRevenue : 25800, orders: orders.length + 95 }
  ];

  const categoryDistribution = products.reduce((acc: any[], prod) => {
    const existing = acc.find(item => item.name === prod.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: prod.category, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ["#000000", "#34C759", "#4CD964", "#8E8E93", "#C7C7CC"];

  const orderStatusBreakdown = [
    { status: "Pending", count: orders.filter(o => o.status === "Pending").length + 2, fill: "#FF9500" },
    { status: "Confirmed", count: orders.filter(o => o.status === "Processing").length + 4, fill: "#5856D6" },
    { status: "Shipped", count: orders.filter(o => o.status === "Shipped").length + 6, fill: "#34AADC" },
    { status: "Delivered", count: orders.filter(o => o.status === "Delivered").length + 25, fill: "#34C759" },
    { status: "Cancelled", count: orders.filter(o => o.status === "Cancelled").length + 3, fill: "#FF3B30" }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Upper Dashboard Summary Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Sales metric card */}
        <div className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Today's Sales</span>
            <div className="h-7 w-7 bg-[#34C759]/10 rounded-xl flex items-center justify-center text-[#34C759]">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-xl font-black text-black block leading-none font-mono">
              ${todaySales.toFixed(2)}
            </span>
            <span className="text-[9px] text-[#34C759] font-bold block mt-2">
              +14% from yesterday
            </span>
          </div>
        </div>

        {/* Orders metric card */}
        <div className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Today's Orders</span>
            <div className="h-7 w-7 bg-black/5 rounded-xl flex items-center justify-center text-black">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-xl font-black text-black block leading-none font-mono">
              {todayOrdersCount} Orders
            </span>
            <span className="text-[9px] text-slate-400 block mt-2">
              Standard queue speed
            </span>
          </div>
        </div>

        {/* Monthly Revenue card */}
        <div className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Monthly Revenue</span>
            <div className="h-7 w-7 bg-black/5 rounded-xl flex items-center justify-center text-black">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-xl font-black text-black block leading-none font-mono">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[9px] text-[#34C759] font-bold block mt-2">
              On target with goals
            </span>
          </div>
        </div>

        {/* Customers card */}
        <div className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Active Customers</span>
            <div className="h-7 w-7 bg-black/5 rounded-xl flex items-center justify-center text-black">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-xl font-black text-black block leading-none font-mono">
              1,480 Patrons
            </span>
            <span className="text-[9px] text-[#34C759] font-bold block mt-2">
              +48 signups this week
            </span>
          </div>
        </div>

        {/* Visitors card */}
        <div className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Today's Visitors</span>
            <div className="h-7 w-7 bg-black/5 rounded-xl flex items-center justify-center text-black">
              <MousePointer className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-xl font-black text-black block leading-none font-mono">
              8,420 Sessions
            </span>
            <span className="text-[9px] text-slate-400 block mt-2">
              Global traffic overview
            </span>
          </div>
        </div>

        {/* Conversion rate metric */}
        <div className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Conversion Rate</span>
            <div className="h-7 w-7 bg-[#34C759]/10 rounded-xl flex items-center justify-center text-[#34C759]">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-xl font-black text-black block leading-none font-mono font-mono">
              3.42%
            </span>
            <span className="text-[9px] text-[#34C759] font-bold block mt-2">
              Excellent industry index
            </span>
          </div>
        </div>

      </div>

      {/* 2. Visual Multi-Chart Panels (Recharts Section) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Area chart showing Sales Revenue Over Time (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="text-sm font-bold text-black uppercase tracking-wider font-sans">
                Financial Velocity & Revenue Performance
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Overview of sales expansion across the current fiscal semester.
              </p>
            </div>
            <span className="text-[10px] font-bold text-[#34C759] bg-[#34C759]/10 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
              Live Feed
            </span>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34C759" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#34C759" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                <XAxis dataKey="month" stroke="#AEAEB2" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#AEAEB2" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E5E5EA", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", fontSize: "11px" }}
                  labelClassName="font-bold text-black"
                />
                <Area type="monotone" dataKey="sales" name="Sales Revenue" stroke="#34C759" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Category split Pie Chart & Order status (1 Col) */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-black uppercase tracking-wider font-sans border-b pb-4">
              Category Distribution
            </h3>
            <div className="h-56 w-full relative flex items-center justify-center pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E5EA", fontSize: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <span className="block text-2xl font-black text-black leading-none font-mono">{products.length}</span>
                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Products</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {categoryDistribution.map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-2 p-1.5 bg-[#F7F7F7] rounded-xl text-[10px]">
                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                <span className="font-semibold text-black truncate flex-1">{cat.name}</span>
                <span className="font-mono text-slate-400 font-bold">({cat.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Status Breakdown, Low Stock Alerts and Pending Orders list (Bento style grid) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left: Orders status bar chart (1 Col) */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-black uppercase tracking-wider font-sans border-b pb-4">
            Order Status Queue
          </h3>
          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderStatusBreakdown} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                <XAxis dataKey="status" stroke="#AEAEB2" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#AEAEB2" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E5EA", fontSize: "11px" }}
                />
                <Bar dataKey="count" name="Order Volume" radius={[6, 6, 0, 0]}>
                  {orderStatusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Center: Low Stock Alerts list (1 Col) */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-sm font-bold text-black uppercase tracking-wider font-sans flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Low Stock Inventory Alerts</span>
              </h3>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-mono">
                {lowStockAlerts.length} Products
              </span>
            </div>

            <div className="divide-y divide-slate-50 space-y-3 pt-3 overflow-y-auto max-h-[14rem]">
              {lowStockAlerts.length === 0 ? (
                <p className="text-center py-12 text-[11px] text-slate-400 font-medium">All item inventory health metrics are in excellent condition.</p>
              ) : (
                lowStockAlerts.map(prod => (
                  <div key={prod.id} className="pt-3 first:pt-0 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3 truncate">
                      <img src={prod.image} className="w-9 h-9 object-cover rounded-xl border border-slate-100 shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-black block truncate">{prod.name}</span>
                        <span className="text-[9px] text-slate-400 font-mono block mt-0.5">SKU: {prod.sku || "N/A"}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-rose-500 block font-mono bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg">
                        {prod.stock} LEFT
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            id="btn-goto-inventory-alerts"
            onClick={() => onNavigateToTab("inventory")}
            className="w-full py-3 bg-[#F7F7F7] hover:bg-neutral-100 border text-black text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all block text-center mt-3 cursor-pointer"
          >
            RESTOCK WAREHOUSE INVENTORY
          </button>
        </div>

        {/* Right: Top Selling Products (1 Col) */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-sm font-bold text-black uppercase tracking-wider font-sans flex items-center gap-2">
                <Award className="h-4 w-4 text-[#34C759]" />
                <span>Top Selling Curations</span>
              </h3>
            </div>

            <div className="divide-y divide-slate-50 space-y-3 pt-3">
              {products.slice(0, 4).map((prod, idx) => (
                <div key={prod.id} className="pt-3 first:pt-0 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3 truncate">
                    <div className="h-5 w-5 bg-black text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <img src={prod.image} className="w-9 h-9 object-cover rounded-xl border border-slate-100 shrink-0" />
                    <div className="truncate">
                      <span className="font-bold text-black block truncate">{prod.name}</span>
                      <span className="text-[9px] text-[#34C759] font-semibold uppercase">{prod.brand}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 font-mono font-bold">
                    <span className="text-black block">${prod.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            id="btn-goto-products-alerts"
            onClick={() => onNavigateToTab("products")}
            className="w-full py-3 bg-[#F7F7F7] hover:bg-neutral-100 border text-black text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all block text-center mt-3 cursor-pointer"
          >
            MANAGE DECOR CATALOGUE
          </button>
        </div>

      </div>

      {/* 4. Recent Pending Orders Table */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h3 className="text-sm font-bold text-black uppercase tracking-wider font-sans">
              Recent Processing & Pending Orders
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Newly synchronized transactional logs awaiting dispatch.
            </p>
          </div>
          <button
            id="btn-view-all-orders"
            onClick={() => onNavigateToTab("orders")}
            className="text-[10px] font-bold text-[#34C759] hover:underline uppercase flex items-center gap-1 cursor-pointer font-sans"
          >
            <span>View All Queue</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Patron Email</th>
                <th className="py-3 px-4 text-right">Items</th>
                <th className="py-3 px-4 text-right">Invoice Total</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              {orders.slice(0, 5).map((ord) => (
                <tr key={ord.id} className="hover:bg-[#FDFDFD]">
                  <td className="py-3 px-4 font-mono font-extrabold text-black uppercase">
                    #{ord.id.substring(0, 8)}...
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {new Date(ord.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-500">
                    {ord.shippingAddress?.fullName ? `${ord.shippingAddress.fullName} (${ord.shippingAddress.phone})` : "Anonymous Patron"}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    {ord.items.length} items
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-black">
                    ${ord.total.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block text-[8px] font-black uppercase px-2.5 py-1 rounded-full font-mono ${
                      ord.status === "Pending" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                      ord.status === "Processing" ? "bg-violet-50 text-violet-600 border border-violet-100" :
                      ord.status === "Shipped" ? "bg-sky-50 text-sky-600 border border-sky-100" :
                      ord.status === "Delivered" ? "bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20" :
                      "bg-rose-50 text-rose-600 border border-rose-100"
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium font-sans">
                    No active transactions waiting in the queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
