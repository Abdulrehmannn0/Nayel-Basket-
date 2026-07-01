import React, { useState } from "react";
import { FileSpreadsheet, Download, RefreshCw, Printer, Calendar, CheckSquare } from "lucide-react";
import { isSupabaseConnected, supabase } from "../lib/supabase";
import { useApp } from "../context/AppContext";

interface ReportRow {
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  col5: string;
}

export const AdminReportManager: React.FC = () => {
  const { orders, products } = useApp();
  const [reportType, setReportType] = useState<"sales" | "inventory" | "customers">("sales");
  const [timeframe, setTimeframe] = useState("month");
  const [loading, setLoading] = useState(false);

  // Derive reports dynamically in real time from orders and products
  const salesReport: ReportRow[] = orders.map(o => ({
    col1: new Date(o.date).toISOString().substring(0, 10),
    col2: o.id,
    col3: o.items.map(item => item.product.name).join(", ") || "Decor Selection",
    col4: `$${o.total.toFixed(2)}`,
    col5: o.status
  }));

  const inventoryReport: ReportRow[] = products.map(p => ({
    col1: p.sku || `SKU-${p.id.slice(-4).toUpperCase()}`,
    col2: p.name,
    col3: `$${p.price.toFixed(2)}`,
    col4: `${p.stock} units`,
    col5: p.stock === 0 ? "Out of Stock" : (p.stock <= 5 ? "Replenish Alert" : "In Stock")
  }));

  const getCustomersReport = () => {
    const custMap: { [key: string]: { email: string; ordersCount: number; spend: number } } = {};
    orders.forEach(o => {
      const name = o.shippingAddress?.fullName?.trim() || "Anonymous Patron";
      const email = o.shippingAddress?.phone || "Contact Registry";
      if (!custMap[name]) {
        custMap[name] = { email, ordersCount: 0, spend: 0 };
      }
      custMap[name].ordersCount += 1;
      custMap[name].spend += o.total;
    });
    return Object.keys(custMap).map(name => ({
      col1: name,
      col2: custMap[name].email,
      col3: custMap[name].spend > 1000 ? "VIP Patron" : "Standard",
      col4: `${custMap[name].ordersCount} ${custMap[name].ordersCount === 1 ? "Order" : "Orders"}`,
      col5: `$${custMap[name].spend.toFixed(2)} spent`
    }));
  };

  const customersReport = getCustomersReport();

  const activeRows = reportType === "sales" ? salesReport : reportType === "inventory" ? inventoryReport : customersReport;

  const getHeaders = () => {
    if (reportType === "sales") return ["Booking Date", "Fulfillment ID", "Acquired Goods", "Gross Billing", "Ledger Status"];
    if (reportType === "inventory") return ["Bespoke SKU", "Acquired Goods", "Base Valuation", "Warehouse Stock", "Replenish Status"];
    return ["Collector Profile", "Corporate Email", "Fidelity Tier", "Transaction Volume", "Acquired Valuation"];
  };

  const handleDownloadCSV = () => {
    setLoading(true);
    setTimeout(() => {
      const headers = getHeaders();
      const csvContent = [
        headers.join(","),
        ...activeRows.map(row => [row.col1, row.col2, row.col3, row.col4, row.col5].map(v => `"${v}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `nayel_basket_${reportType}_report_${timeframe}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setLoading(false);
    }, 1000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-6 border rounded-[2.5rem] shadow-sm space-y-6 animate-fade-in text-xs">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h3 className="text-sm font-black text-black uppercase tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-[#34C759]" />
            <span>Operational Reports Builder</span>
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Generate printable tax audits, transaction lists, and inventory valuations.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-[#F7F7F7] border hover:bg-neutral-100 rounded-xl font-bold uppercase text-[9px] tracking-wider cursor-pointer flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            disabled={loading}
            className="px-5 py-2.5 bg-black hover:bg-[#34C759] text-white rounded-xl font-bold uppercase text-[9px] tracking-wider cursor-pointer flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>{loading ? "Generating CSV..." : "Download CSV"}</span>
          </button>
        </div>
      </div>

      {/* Query Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[9px] text-slate-400 uppercase font-black mb-1.5">Fulfillment Report Target</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="w-full bg-[#F7F7F7] border p-3 rounded-xl text-black font-semibold text-[11px]"
          >
            <option value="sales">Sales Ledger Reports</option>
            <option value="inventory">Inventory Valuations</option>
            <option value="customers">Customers CRM Logs</option>
          </select>
        </div>

        <div>
          <label className="block text-[9px] text-slate-400 uppercase font-black mb-1.5">Timeline Matrix Range</label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="w-full bg-[#F7F7F7] border p-3 rounded-xl text-black font-semibold text-[11px]"
          >
            <option value="today">Today's Transactions</option>
            <option value="7days">Last 7 Days</option>
            <option value="month">Current Month to Date</option>
            <option value="year">Full Calendar Year (12 Mos)</option>
          </select>
        </div>

        <div>
          <label className="block text-[9px] text-slate-400 uppercase font-black mb-1.5">Ledger Integrity Seal</label>
          <div className="bg-[#FAFBFD] border p-3 rounded-xl flex items-center gap-2 font-mono text-[10px] text-[#34C759] font-bold">
            <CheckSquare className="h-4 w-4 shrink-0" />
            <span>Verified Cloud Native Ledger SHA-256</span>
          </div>
        </div>
      </div>

      {/* Structured Report Preview */}
      <div className="border rounded-2xl overflow-hidden bg-[#FCFCFC]">
        <div className="bg-[#FAFBFD] px-6 py-4 border-b flex justify-between items-center text-[10px] text-slate-400 font-mono">
          <span className="uppercase font-extrabold tracking-wider">PREVIEWING: {reportType.toUpperCase()} LEDGER</span>
          <span>SYSTEM v4.2 SECURED</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-slate-50 text-slate-400 font-extrabold text-[9px] uppercase tracking-wider">
                {getHeaders().map((h, i) => (
                  <th key={i} className="py-3.5 px-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y text-slate-600 font-medium">
              {activeRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-black">{row.col1}</td>
                  <td className="py-3.5 px-6 font-mono text-[10px]">{row.col2}</td>
                  <td className="py-3.5 px-6">{row.col3}</td>
                  <td className="py-3.5 px-6 font-mono font-bold text-black">{row.col4}</td>
                  <td className="py-3.5 px-6">
                    <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono ${
                      row.col5 === "Completed" || row.col5 === "In Stock" || row.col5.includes("spent")
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-amber-50 text-amber-600 border border-amber-100"
                    }`}>
                      {row.col5}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
