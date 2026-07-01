import React, { useState, useEffect } from "react";
import { PackageCheck, AlertTriangle, ArrowUpRight, Search, SlidersHorizontal, RefreshCw, CheckCircle } from "lucide-react";
import { isSupabaseConnected, supabase } from "../lib/supabase";
import { Product } from "../types";

export const AdminInventoryManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      if (isSupabaseConnected()) {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;
        if (data) {
          const formatted: Product[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            brand: item.brand,
            price: Number(item.price),
            originalPrice: Number(item.original_price || item.price * 1.3),
            category: item.category,
            image: item.image,
            description: item.description,
            gallery: item.gallery || [item.image],
            rating: Number(item.rating || 4.5),
            reviewCount: Number(item.review_count || 12),
            stock: Number(item.stock_count || 0),
            sellerId: item.seller_id,
            sellerName: item.seller_name,
            features: item.features || [],
            sizes: item.sizes || [],
            colors: item.colors || [],
            reviews: [],
            qa: [],
            sku: item.sku || `NYL-${item.id.toUpperCase()}`,
            tags: item.tags || []
          }));
          setProducts(formatted);

          // unique categories
          const cats = Array.from(new Set(formatted.map(p => p.category)));
          setCategories(cats);
        }
      } else {
        // Fallback from localStorage
        const cached = localStorage.getItem("nayel_products");
        if (cached) {
          const pars = JSON.parse(cached);
          setProducts(pars);
          setCategories(Array.from(new Set(pars.map((p: any) => p.category))));
        }
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjust = async (id: string, newStock: number) => {
    if (newStock < 0) return;
    setUpdatingId(id);
    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase
          .from("products")
          .update({ stock_count: newStock })
          .eq("id", id);

        if (error) throw error;
      }

      const updated = products.map((p) => {
        if (p.id === id) {
          return { ...p, stock: newStock };
        }
        return p;
      });

      setProducts(updated);
      localStorage.setItem("nayel_products", JSON.stringify(updated));
    } catch (err: any) {
      alert("Failed to adjust inventory: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.sku.toLowerCase().includes(search.toLowerCase()) ||
                          p.brand.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchesLowStock = !lowStockFilter || p.stock < 10;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const lowStockCount = products.filter((p) => p.stock < 10).length;

  return (
    <div className="bg-white p-6 border rounded-[2.5rem] shadow-sm space-y-6 animate-fade-in text-xs">
      {/* Header stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h3 className="text-sm font-black text-black uppercase tracking-tight flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-[#34C759]" />
            <span>Master Inventory Registry</span>
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Adjust physical warehouse stocks, monitor low-stock warnings, and review SKUs.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-rose-50 border border-rose-100 rounded-2xl px-4 py-2.5 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            <div>
              <span className="block text-[9px] text-slate-400 uppercase font-black">Low-Stock Warnings</span>
              <span className="text-xs font-black text-rose-600 font-mono">{lowStockCount} items &lt; 10 units</span>
            </div>
          </div>

          <button
            onClick={fetchProducts}
            className="p-3 bg-[#F7F7F7] border text-black hover:bg-neutral-100 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            placeholder="Search items by Title, SKU or Brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F7F7F7] pl-9 pr-4 py-3 rounded-xl border border-transparent focus:outline-none focus:bg-white text-black font-semibold text-[11px]"
          />
        </div>

        {/* Category selector */}
        <div className="w-full md:w-56">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-[#F7F7F7] border border-transparent p-3 rounded-xl focus:outline-none text-black font-semibold"
          >
            <option value="all">All Catalog Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Low Stock Checkbox Toggle */}
        <button
          onClick={() => setLowStockFilter(!lowStockFilter)}
          className={`px-5 py-3 rounded-xl border font-bold uppercase transition-all text-[9px] tracking-wider cursor-pointer ${
            lowStockFilter 
              ? "bg-rose-600 text-white border-rose-600" 
              : "bg-[#F7F7F7] text-slate-600 border-transparent hover:text-black"
          }`}
        >
          {lowStockFilter ? "Showing Alerts Only" : "Show Alerts Only (<10)"}
        </button>
      </div>

      {/* Main Inventory list */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 font-mono text-[10px]">Loading product storage registers...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b text-slate-400 font-extrabold text-[9px] uppercase tracking-wider">
                <th className="py-3">Article</th>
                <th className="py-3">Bespoke SKU / Brand</th>
                <th className="py-3">Category</th>
                <th className="py-3 text-center">Remaining Stock</th>
                <th className="py-3 text-center">Warehouse Status</th>
                <th className="py-3 text-right">Quick Stock Override</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-600 font-medium">
              {filtered.map((p) => {
                const isLow = p.stock < 10;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="h-10 w-10 object-cover rounded-xl border" />
                      <div>
                        <span className="block font-bold text-black text-xs leading-tight">{p.name}</span>
                        <span className="text-[10px] text-slate-400">${p.price}.00</span>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-[10px]">
                      <span className="block text-black font-semibold">{p.sku}</span>
                      <span className="text-slate-400 text-[9px] font-sans">{p.brand}</span>
                    </td>
                    <td className="py-3 text-slate-500 font-semibold">{p.category}</td>
                    <td className="py-3 text-center font-mono text-black font-extrabold text-sm">{p.stock}</td>
                    <td className="py-3 text-center">
                      {isLow ? (
                        <span className="inline-block px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded text-[9px] font-black font-mono">
                          REPLENISH NEEDED
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[9px] font-black font-mono">
                          IN STOCK
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleStockAdjust(p.id, p.stock - 1)}
                          disabled={p.stock <= 0 || updatingId === p.id}
                          className="h-7 w-7 bg-[#F7F7F7] border hover:bg-neutral-200 text-black text-lg font-bold rounded-lg cursor-pointer flex items-center justify-center disabled:opacity-30"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={p.stock}
                          onChange={(e) => handleStockAdjust(p.id, Number(e.target.value))}
                          disabled={updatingId === p.id}
                          className="w-12 h-7 bg-[#F7F7F7] border text-center font-mono font-bold rounded-lg text-black focus:outline-none focus:bg-white focus:border-[#34C759]"
                        />
                        <button
                          onClick={() => handleStockAdjust(p.id, p.stock + 1)}
                          disabled={updatingId === p.id}
                          className="h-7 w-7 bg-[#F7F7F7] border hover:bg-neutral-200 text-black text-lg font-bold rounded-lg cursor-pointer flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-mono text-[10px]">
                    No warehouse items match selection filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
