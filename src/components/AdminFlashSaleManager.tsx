import React, { useState, useEffect } from "react";
import { Flame, Plus, Trash2, Edit, RefreshCw, Sparkles, Clock, Search, ToggleLeft, ToggleRight } from "lucide-react";
import { isSupabaseConnected, supabase } from "../lib/supabase";
import { Product } from "../types";

interface FlashSaleCampaign {
  id: string;
  title: string;
  discountPercent: number;
  endDate: string;
  isActive: boolean;
  productIds: string[];
}

export const AdminFlashSaleManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<FlashSaleCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Campaign creation states
  const [title, setTitle] = useState("");
  const [discountPercent, setDiscountPercent] = useState("30");
  const [endDate, setEndDate] = useState("2026-07-31T23:59:59");
  const [selectedProdIds, setSelectedProdIds] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isSupabaseConnected()) {
        const { data: prodsData } = await supabase.from("products").select("*");
        if (prodsData) {
          setProducts(prodsData.map((p: any) => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            price: Number(p.price),
            originalPrice: Number(p.original_price || p.price),
            category: p.category,
            image: p.image,
            description: p.description,
            stock: Number(p.stock_count || 10),
            sku: p.sku || `NYL-${p.id.toUpperCase()}`
          } as any)));
        }

        // Fetch homepage_sections to find active 'carousel' or custom flash sale types
        const { data: sections } = await supabase
          .from("homepage_sections")
          .select("*")
          .eq("section_type", "flash_sale");

        if (sections && sections.length > 0) {
          setCampaigns(sections.map((s: any) => ({
            id: s.id,
            title: s.title,
            discountPercent: s.content_data?.discount_percent || 30,
            endDate: s.content_data?.end_date || "2026-07-31T23:59:59",
            isActive: s.is_visible,
            productIds: s.content_data?.product_ids || []
          })));
        } else {
          setCampaigns([]);
        }
      } else {
        const prods = localStorage.getItem("nayel_products");
        if (prods) setProducts(JSON.parse(prods));

        const cachedCamps = localStorage.getItem("nayel_flash_campaigns");
        if (cachedCamps) {
          setCampaigns(JSON.parse(cachedCamps));
        } else {
          const defaultCamp: FlashSaleCampaign = {
            id: "camp_1",
            title: "Summer Solstice Markdowns",
            discountPercent: 35,
            endDate: "2026-07-31T23:59:59",
            isActive: true,
            productIds: ["p1", "p2"]
          };
          setCampaigns([defaultCamp]);
          localStorage.setItem("nayel_flash_campaigns", JSON.stringify([defaultCamp]));
        }
      }
    } catch (err) {
      console.error("Failed to load flash sales:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newCamp: FlashSaleCampaign = {
      id: "camp_" + Date.now(),
      title: title.trim(),
      discountPercent: Number(discountPercent),
      endDate,
      isActive: true,
      productIds: selectedProdIds
    };

    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase.from("homepage_sections").insert([{
          title: newCamp.title,
          section_type: "flash_sale",
          is_visible: true,
          content_data: {
            discount_percent: newCamp.discountPercent,
            end_date: newCamp.endDate,
            product_ids: newCamp.productIds
          }
        }]);
        if (error) throw error;
      }

      const updated = [newCamp, ...campaigns];
      setCampaigns(updated);
      localStorage.setItem("nayel_flash_campaigns", JSON.stringify(updated));

      setTitle("");
      setSelectedProdIds([]);
      alert("Flash sale campaign successfully injected!");
    } catch (err: any) {
      alert("Failed to inject flash sale: " + err.message);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to end and delete this campaign?")) return;

    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase.from("homepage_sections").delete().eq("id", id);
        if (error) throw error;
      }

      const updated = campaigns.filter((c) => c.id !== id);
      setCampaigns(updated);
      localStorage.setItem("nayel_flash_campaigns", JSON.stringify(updated));
    } catch (err: any) {
      alert("Failed to delete campaign: " + err.message);
    }
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProdIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
      {/* List of active campaigns */}
      <div className="lg:col-span-2 bg-white p-6 border rounded-[2.5rem] shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h3 className="text-sm font-black text-black uppercase tracking-tight flex items-center gap-2">
              <Flame className="h-5 w-5 text-[#34C759]" />
              <span>Flash Sale Campaigns</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Deploy real-time countdown widgets, assign clearance markdowns, and monitor live items.</p>
          </div>
          <button onClick={fetchData} className="p-2 hover:bg-neutral-100 rounded-xl transition-all">
            <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 font-mono text-[10px]">Loading promotion channels...</div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((c) => (
              <div key={c.id} className="p-5 border rounded-2xl bg-[#FCFCFC] space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-[#34C759]/10 text-[#34C759] text-[8px] font-black uppercase rounded mb-1.5 font-mono">
                      {c.discountPercent}% SAVINGS COUNTDOWN
                    </span>
                    <h4 className="text-sm font-black text-black uppercase tracking-tight">{c.title}</h4>
                  </div>
                  <button onClick={() => handleDeleteCampaign(c.id)} className="p-1 text-slate-400 hover:text-rose-600 border rounded cursor-pointer">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 border-t border-b py-2 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-[#34C759]" />
                    <span>Ends: {new Date(c.endDate).toLocaleString()}</span>
                  </span>
                  <span>•</span>
                  <span>Items: {c.productIds.length} featured</span>
                </div>

                {/* Show items inside the campaign */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {products.filter((p) => c.productIds.includes(p.id)).map((p) => (
                    <div key={p.id} className="flex items-center gap-2 border p-1.5 rounded-xl bg-white min-w-[10rem]">
                      <img src={p.image} alt={p.name} className="h-8 w-8 object-cover rounded-lg" />
                      <div className="overflow-hidden">
                        <span className="block font-bold text-black truncate text-[10px]">{p.name}</span>
                        <span className="block text-[8px] font-mono text-rose-500">
                          Now: ${(p.price * (1 - c.discountPercent / 100)).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {c.productIds.length === 0 && (
                    <span className="text-[10px] text-slate-400 italic">No products explicitly linked. (Affects all items)</span>
                  )}
                </div>
              </div>
            ))}
            {campaigns.length === 0 && (
              <div className="text-center py-12 text-slate-400 font-mono text-[10px]">No active clearance markdowns configured.</div>
            )}
          </div>
        )}
      </div>

      {/* Deploy new Campaign */}
      <div className="bg-white p-6 border rounded-[2.5rem] shadow-sm h-fit">
        <form onSubmit={handleCreateCampaign} className="space-y-4">
          <h3 className="text-xs font-black text-black uppercase border-b pb-3">Deploy Live Flash Sale</h3>

          <div>
            <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Campaign Title</label>
            <input
              required
              placeholder="e.g. Solstice Atelier Markdowns"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black font-semibold text-[11px] focus:outline-none focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Markdown (%)</label>
              <input
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl font-mono text-black text-center font-bold"
              />
            </div>
            <div>
              <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Countdown Ends</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl font-mono text-black text-[10px]"
              />
            </div>
          </div>

          {/* Selectable product roster */}
          <div>
            <label className="block text-[9px] text-slate-400 uppercase font-black mb-1.5">Select Clearance Items</label>
            <div className="border rounded-2xl p-2 max-h-48 overflow-y-auto space-y-1.5 bg-[#FAFBFD]">
              {products.map((p) => {
                const isSelected = selectedProdIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProductSelection(p.id)}
                    className={`w-full flex items-center justify-between text-left p-1.5 rounded-xl transition-all cursor-pointer ${
                      isSelected ? "bg-black text-white" : "hover:bg-neutral-100 text-slate-600"
                    }`}
                  >
                    <span className="truncate pr-2 font-semibold text-[10px]">{p.name}</span>
                    <span className="font-mono text-[9px] shrink-0">${p.price}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-black hover:bg-[#34C759] text-white font-bold uppercase rounded-xl tracking-wider text-[10px] transition-all cursor-pointer shadow-md"
          >
            Deploy Flash Sale Event
          </button>
        </form>
      </div>
    </div>
  );
};
