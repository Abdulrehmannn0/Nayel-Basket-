import React, { useState, useEffect } from "react";
import { TicketPercent, Plus, Trash2, Edit2, RefreshCw, CheckCircle, Search, ToggleLeft, ToggleRight } from "lucide-react";
import { isSupabaseConnected, supabase } from "../lib/supabase";
import { Coupon } from "../types";

export const AdminCouponManager: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingCoup, setEditingCoup] = useState<Coupon | null>(null);

  // New Coupon Form states
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"percentage" | "fixed">("percentage");
  const [newValue, setNewValue] = useState("20");
  const [newMinSpend, setNewMinSpend] = useState("80");
  const [newExpiry, setNewExpiry] = useState("2026-12-31");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      if (isSupabaseConnected()) {
        const { data, error } = await supabase
          .from("coupons")
          .select("*")
          .order("code", { ascending: true });

        if (error) throw error;
        if (data) {
          const formatted: Coupon[] = data.map((item: any) => ({
            id: item.id,
            code: item.code,
            type: item.type,
            value: Number(item.value),
            minSpend: Number(item.min_spend || 0),
            description: item.description || `${item.value}% discount voucher`,
            expiry: item.expiry_date ? item.expiry_date.substring(0, 10) : "2026-12-31",
            isActive: item.is_active
          }));
          setCoupons(formatted);
        }
      } else {
        const local = localStorage.getItem("nayel_coupons");
        if (local) {
          setCoupons(JSON.parse(local));
        } else {
          const defaults: Coupon[] = [
            { code: "NAYEL20", type: "percentage", value: 20, minSpend: 80, description: "Enjoy 20% off on exquisite home decor! Minimum purchase of $80.", expiry: "2026-12-31", isActive: true },
            { code: "DECOR15", type: "fixed", value: 15, minSpend: 50, description: "Save a flat $15 on our artisanal collections over $50.", expiry: "2026-12-31", isActive: true },
            { code: "FREESHIP", type: "percentage", value: 100, minSpend: 0, description: "Complimentary elite premium delivery, no minimum spend required.", expiry: "2026-12-31", isActive: true }
          ];
          setCoupons(defaults);
          localStorage.setItem("nayel_coupons", JSON.stringify(defaults));
        }
      }
    } catch (err) {
      console.error("Error loading coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const added: Coupon = {
      code: newCode.toUpperCase().trim(),
      type: newType,
      value: Number(newValue),
      minSpend: Number(newMinSpend),
      description: newDesc.trim() || `${newValue}${newType === "percentage" ? "%" : "$"} off all premium decors`,
      expiry: newExpiry,
      isActive: true
    };

    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase.from("coupons").insert([{
          code: added.code,
          type: added.type,
          value: added.value,
          min_spend: added.minSpend,
          description: added.description,
          expiry_date: new Date(added.expiry).toISOString(),
          is_active: true
        }]);

        if (error) throw error;
      }

      const updated = [added, ...coupons];
      setCoupons(updated);
      localStorage.setItem("nayel_coupons", JSON.stringify(updated));

      setNewCode("");
      setNewDesc("");
    } catch (err: any) {
      alert("Error adding coupon: " + err.message);
    }
  };

  const handleToggleActive = async (code: string) => {
    const matched = coupons.find(c => c.code === code);
    if (!matched) return;

    const newActiveState = !matched.isActive;

    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase
          .from("coupons")
          .update({ is_active: newActiveState })
          .eq("code", code);

        if (error) throw error;
      }

      const updated = coupons.map((c) => (c.code === code ? { ...c, isActive: newActiveState } : c));
      setCoupons(updated);
      localStorage.setItem("nayel_coupons", JSON.stringify(updated));
    } catch (err: any) {
      alert("Failed to toggle coupon status: " + err.message);
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`Are you sure you want to delete promo code ${code}?`)) return;

    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase.from("coupons").delete().eq("code", code);
        if (error) throw error;
      }

      const updated = coupons.filter((c) => c.code !== code);
      setCoupons(updated);
      localStorage.setItem("nayel_coupons", JSON.stringify(updated));
    } catch (err: any) {
      alert("Failed to delete coupon: " + err.message);
    }
  };

  const filtered = coupons.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase()) || 
    (c.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
      {/* Coupons Directory List */}
      <div className="lg:col-span-2 bg-white p-6 border rounded-[2.5rem] shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h3 className="text-sm font-black text-black uppercase tracking-tight flex items-center gap-2">
              <TicketPercent className="h-5 w-5 text-[#34C759]" />
              <span>Active Promotions & Coupons</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Control live vouchers, minimum spends, percentage or flat value markdowns.</p>
          </div>
          <button onClick={fetchCoupons} className="p-2 hover:bg-neutral-100 rounded-xl transition-all">
            <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            placeholder="Search coupon codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F7F7F7] pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:outline-none focus:bg-white text-black font-semibold text-[11px]"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 font-mono text-[10px]">Synchronizing campaign vouchers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b text-slate-400 font-extrabold text-[9px] uppercase tracking-wider">
                  <th className="py-2">Voucher Code</th>
                  <th className="py-2">Markdown Value</th>
                  <th className="py-2 text-center">Minimum spend</th>
                  <th className="py-2 text-center">Status</th>
                  <th className="py-2 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-600 font-medium">
                {filtered.map((c) => (
                  <tr key={c.code} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-mono">
                      <span className="block text-black font-black text-xs">#{c.code}</span>
                      <span className="text-[9px] text-slate-400 font-sans">{c.description}</span>
                    </td>
                    <td className="py-3 font-mono font-bold text-[#34C759]">
                      {c.type === "percentage" ? `${c.value}% OFF` : `$${c.value}.00 FLAT`}
                    </td>
                    <td className="py-3 text-center font-mono font-bold text-black">${c.minSpend}.00</td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => handleToggleActive(c.code)}
                        className="inline-flex items-center gap-1 cursor-pointer"
                        title={c.isActive ? "Deactivate code" : "Activate code"}
                      >
                        {c.isActive ? (
                          <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[8px] font-black font-mono">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 bg-slate-50 text-slate-400 border rounded text-[8px] font-black font-mono">
                            SUSPENDED
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDelete(c.code)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 border rounded-lg cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-mono text-[10px]">
                      No dynamic campaign vouchers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Coupon Block */}
      <div className="bg-white p-6 border rounded-[2.5rem] shadow-sm h-fit">
        <form onSubmit={handleCreate} className="space-y-4">
          <h3 className="text-xs font-black text-black uppercase border-b pb-3">Inject Campaign Voucher</h3>
          
          <div>
            <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Coupon Promo Code</label>
            <input
              required
              placeholder="e.g. SUMMER30"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl uppercase font-mono font-extrabold text-black text-center text-sm focus:outline-none focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Rebate Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl font-bold"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Price ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Markdown Value</label>
              <input
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl font-mono text-black text-center font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Minimum Cart Spend ($)</label>
            <input
              type="number"
              value={newMinSpend}
              onChange={(e) => setNewMinSpend(e.target.value)}
              className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl font-mono text-black font-semibold"
            />
          </div>

          <div>
            <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Expiry Date Threshold</label>
            <input
              type="date"
              value={newExpiry}
              onChange={(e) => setNewExpiry(e.target.value)}
              className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl font-mono text-black"
            />
          </div>

          <div>
            <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Voucher Subtitle Description</label>
            <input
              placeholder="e.g. Extra 30% savings on summer rugs"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-[11px]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-black hover:bg-[#34C759] text-white font-bold uppercase rounded-xl tracking-wider text-[10px] transition-all cursor-pointer shadow-md"
          >
            Deploy Coupon Voucher
          </button>
        </form>
      </div>
    </div>
  );
};
