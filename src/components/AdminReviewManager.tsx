import React, { useState, useEffect } from "react";
import { MessageSquare, Trash2, Star, RefreshCw, ThumbsUp, Search } from "lucide-react";
import { isSupabaseConnected, supabase } from "../lib/supabase";

interface Review {
  id: string;
  product_id: string;
  product_name?: string;
  user_name: string;
  rating: number;
  comment: string;
  likes: number;
  created_at: string;
}

export const AdminReviewManager: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      if (isSupabaseConnected()) {
        const { data, error } = await supabase
          .from("reviews")
          .select("*, products(name)")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) {
          setReviews(data.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.products?.name || "Premium Decor Object",
            user_name: item.user_name,
            rating: Number(item.rating || 5),
            comment: item.comment,
            likes: Number(item.likes || 0),
            created_at: item.created_at ? item.created_at.substring(0, 10) : new Date().toISOString().substring(0, 10)
          })));
        }
      } else {
        const cached = localStorage.getItem("nayel_reviews");
        if (cached) {
          setReviews(JSON.parse(cached));
        } else {
          const defaults: Review[] = [
            { id: "rev_1", product_id: "p1", product_name: "Artisanal Brass Vase", user_name: "Sophia Loren", rating: 5, comment: "Exquisite hand-burnished details. The brass catches natural light perfectly in my living room.", likes: 12, created_at: "2026-06-25" },
            { id: "rev_2", product_id: "p2", product_name: "Scandinavian Oak Coffee Table", user_name: "Julian Rivera", rating: 5, comment: "Excellent sturdy white oak joinery. Absolutely love the floating shelf lower level.", likes: 8, created_at: "2026-06-28" },
            { id: "rev_3", product_id: "p3", product_name: "Organic Clay Vessel", user_name: "Elena Pemberton", rating: 4, comment: "Slightly smaller than expected but beautiful earthy textures. High-end minimal feel.", likes: 3, created_at: "2026-06-29" }
          ];
          setReviews(defaults);
          localStorage.setItem("nayel_reviews", JSON.stringify(defaults));
        }
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer review?")) return;

    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase.from("reviews").delete().eq("id", id);
        if (error) throw error;
      }

      const updated = reviews.filter((r) => r.id !== id);
      setReviews(updated);
      localStorage.setItem("nayel_reviews", JSON.stringify(updated));
    } catch (err: any) {
      alert("Error deleting review: " + err.message);
    }
  };

  const filtered = reviews.filter(r => 
    r.user_name.toLowerCase().includes(search.toLowerCase()) ||
    r.comment.toLowerCase().includes(search.toLowerCase()) ||
    (r.product_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white p-6 border rounded-[2.5rem] shadow-sm space-y-6 animate-fade-in text-xs">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h3 className="text-sm font-black text-black uppercase tracking-tight flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#34C759]" />
            <span>Customer Feedback & Reviews</span>
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Moderate public catalog reviews, check ratings distribution, and handle feedback.</p>
        </div>
        <button onClick={fetchReviews} className="p-2 hover:bg-neutral-100 rounded-xl transition-all">
          <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <input
          placeholder="Filter reviews by product title, buyer name, or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#F7F7F7] pl-9 pr-4 py-3 rounded-xl border border-transparent focus:outline-none focus:bg-white text-black font-semibold text-[11px]"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 font-mono text-[10px]">Loading feedback...</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div key={r.id} className="p-5 border rounded-2xl bg-[#FCFCFC] flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black text-black uppercase">{r.user_name}</span>
                  <span className="text-[9px] text-slate-400 font-mono">on {r.created_at}</span>
                  <span className="text-[8px] font-mono font-bold bg-[#FAFBFD] px-2 py-0.5 rounded border text-slate-400 uppercase truncate max-w-xs">
                    Product: {r.product_name}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed font-sans">"{r.comment}"</p>

                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < r.rating ? "fill-[#34C759] text-[#34C759]" : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-start">
                <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>{r.likes} helpful</span>
                </span>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="p-1.5 border text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                  title="Remove review from catalog"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400 font-mono text-[10px]">No customer feedback found matching filters.</div>
          )}
        </div>
      )}
    </div>
  );
};
