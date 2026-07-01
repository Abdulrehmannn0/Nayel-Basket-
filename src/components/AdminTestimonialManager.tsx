import React, { useState, useEffect } from "react";
import { MessageSquare, Plus, Trash2, Edit, RefreshCw, Star, Search, CheckCircle, Award } from "lucide-react";
import { isSupabaseConnected, supabase } from "../lib/supabase";

interface Testimonial {
  id: string;
  user_name: string;
  avatar_url: string;
  comment: string;
  rating: number;
  designation: string;
  is_featured: boolean;
}

export const AdminTestimonialManager: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [userName, setUserName] = useState("");
  const [designation, setDesignation] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState("5");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      if (isSupabaseConnected()) {
        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) {
          setTestimonials(data.map((item: any) => ({
            id: item.id,
            user_name: item.user_name,
            avatar_url: item.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
            comment: item.comment,
            rating: Number(item.rating || 5),
            designation: item.designation || "Connoisseur",
            is_featured: item.is_featured
          })));
        }
      } else {
        const cached = localStorage.getItem("nayel_testimonials");
        if (cached) {
          setTestimonials(JSON.parse(cached));
        } else {
          const defaults: Testimonial[] = [
            { id: "t_1", user_name: "Sophia Loren", avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80", comment: "The ceramic trio series completely transformed my dining space. Impeccable minimalism and organic textures.", rating: 5, designation: "Interior Designer", is_featured: true },
            { id: "t_2", user_name: "Julian Rivera", avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80", comment: "The european oak joinery is flawless. Masterful craft you can actually feel on daily interactions.", rating: 5, designation: "Architecture Collector", is_featured: true }
          ];
          setTestimonials(defaults);
          localStorage.setItem("nayel_testimonials", JSON.stringify(defaults));
        }
      }
    } catch (err) {
      console.error("Failed to load testimonials:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) return;

    const newTest: Testimonial = {
      id: "test_" + Date.now(),
      user_name: userName.trim(),
      avatar_url: avatarUrl.trim() || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
      comment: comment.trim(),
      rating: Number(rating),
      designation: designation.trim() || "Elite Collector",
      is_featured: true
    };

    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase.from("testimonials").insert([{
          user_name: newTest.user_name,
          avatar_url: newTest.avatar_url,
          comment: newTest.comment,
          rating: newTest.rating,
          designation: newTest.designation,
          is_featured: true
        }]);

        if (error) throw error;
      }

      const updated = [newTest, ...testimonials];
      setTestimonials(updated);
      localStorage.setItem("nayel_testimonials", JSON.stringify(updated));

      setUserName("");
      setDesignation("");
      setComment("");
      setAvatarUrl("");
    } catch (err: any) {
      alert("Error adding testimonial: " + err.message);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    const matched = testimonials.find(t => t.id === id);
    if (!matched) return;

    const newFeaturedState = !matched.is_featured;

    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase
          .from("testimonials")
          .update({ is_featured: newFeaturedState })
          .eq("id", id);

        if (error) throw error;
      }

      const updated = testimonials.map((t) => (t.id === id ? { ...t, is_featured: newFeaturedState } : t));
      setTestimonials(updated);
      localStorage.setItem("nayel_testimonials", JSON.stringify(updated));
    } catch (err: any) {
      alert("Failed to toggle highlight state: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial recommendation?")) return;

    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase.from("testimonials").delete().eq("id", id);
        if (error) throw error;
      }

      const updated = testimonials.filter((t) => t.id !== id);
      setTestimonials(updated);
      localStorage.setItem("nayel_testimonials", JSON.stringify(updated));
    } catch (err: any) {
      alert("Error deleting testimonial: " + err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
      {/* Testimonials List */}
      <div className="lg:col-span-2 bg-white p-6 border rounded-[2.5rem] shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h3 className="text-sm font-black text-black uppercase tracking-tight flex items-center gap-2">
              <Award className="h-5 w-5 text-[#34C759]" />
              <span>Collector Testimonials</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Approve, highlight, and manage high-end customer recommendations on the home gallery.</p>
          </div>
          <button onClick={fetchTestimonials} className="p-2 hover:bg-neutral-100 rounded-xl transition-all">
            <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 font-mono text-[10px]">Loading recommendations...</div>
        ) : (
          <div className="space-y-4">
            {testimonials.map((t) => (
              <div key={t.id} className="p-5 border rounded-2xl bg-[#FCFCFC] flex items-start gap-4">
                <img src={t.avatar_url} alt={t.user_name} className="h-10 w-10 rounded-full object-cover border" />
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-black text-black uppercase leading-tight">{t.user_name}</h4>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{t.designation}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleToggleFeatured(t.id)} className="p-1 border rounded hover:bg-slate-50 cursor-pointer">
                        {t.is_featured ? <Star className="h-3.5 w-3.5 fill-[#34C759] text-[#34C759]" /> : <Star className="h-3.5 w-3.5 text-slate-300" />}
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="p-1 border text-rose-600 rounded hover:bg-rose-50 cursor-pointer">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed italic">"{t.comment}"</p>

                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-[#34C759] text-[#34C759]" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {testimonials.length === 0 && (
              <div className="text-center py-12 text-slate-400 font-mono text-[10px]">No testimonials registered. Add recommendation.</div>
            )}
          </div>
        )}
      </div>

      {/* Add testimonial */}
      <div className="bg-white p-6 border rounded-[2.5rem] shadow-sm h-fit">
        <form onSubmit={handleCreate} className="space-y-4">
          <h3 className="text-xs font-black text-black uppercase border-b pb-3">Inject Recommendation</h3>

          <div>
            <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Collector Name</label>
            <input
              required
              placeholder="e.g. Sophia Loren"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black font-semibold text-[11px] focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Corporate / Design Title</label>
            <input
              placeholder="e.g. Lead Architect at Loren Studio"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-[11px] focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Profile Photo URL</label>
            <input
              placeholder="https://images.unsplash.com/photo-..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl font-mono text-[11px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Rating Stars</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl font-bold text-center text-black"
              >
                <option value="5">5 Stars Excellent</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Collector's Commentary</label>
            <textarea
              required
              rows={4}
              placeholder="Provide the unedited praise quote..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-[11px] text-black"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-black hover:bg-[#34C759] text-white font-bold uppercase rounded-xl tracking-wider text-[10px] transition-all cursor-pointer shadow-md"
          >
            Deploy Testimonial
          </button>
        </form>
      </div>
    </div>
  );
};
