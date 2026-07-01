import React, { useState, useEffect } from "react";
import { Image, Plus, Trash2, Edit, RefreshCw, CheckCircle, Search, Eye, EyeOff } from "lucide-react";
import { isSupabaseConnected, supabase } from "../lib/supabase";

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  position: number;
  is_active: boolean;
}

export const AdminBannerManager: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [position, setPosition] = useState("1");

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      if (isSupabaseConnected()) {
        const { data, error } = await supabase
          .from("banners")
          .select("*")
          .order("position", { ascending: true });

        if (error) throw error;
        if (data) {
          setBanners(data.map((item: any) => ({
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
            image_url: item.image_url,
            link_url: item.link_url,
            position: item.position || 0,
            is_active: item.is_active
          })));
        }
      } else {
        const cached = localStorage.getItem("nayel_banners");
        if (cached) {
          setBanners(JSON.parse(cached));
        } else {
          const defaults: Banner[] = [
            { id: "ban_1", title: "Summer Solstice Curation", subtitle: "Artisanal hand-burnished brass & organic clay vessels.", image_url: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1200&q=80", link_url: "/shop", position: 1, is_active: true },
            { id: "ban_2", title: "Scandinavian Solid White Oak", subtitle: "Crafted with floating lower oak shelves.", image_url: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=1200&q=80", link_url: "/shop", position: 2, is_active: true }
          ];
          setBanners(defaults);
          localStorage.setItem("nayel_banners", JSON.stringify(defaults));
        }
      }
    } catch (err) {
      console.error("Failed to load banners:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    const newBanner: Banner = {
      id: "ban_" + Date.now(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      image_url: imageUrl.trim(),
      link_url: linkUrl.trim() || "/shop",
      position: Number(position) || 1,
      is_active: true
    };

    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase.from("banners").insert([{
          title: newBanner.title,
          subtitle: newBanner.subtitle,
          image_url: newBanner.image_url,
          link_url: newBanner.link_url,
          position: newBanner.position,
          is_active: true
        }]);

        if (error) throw error;
      }

      const updated = [...banners, newBanner].sort((a, b) => a.position - b.position);
      setBanners(updated);
      localStorage.setItem("nayel_banners", JSON.stringify(updated));

      setTitle("");
      setSubtitle("");
      setImageUrl("");
      setLinkUrl("");
    } catch (err: any) {
      alert("Error adding banner: " + err.message);
    }
  };

  const handleToggleBanner = async (id: string) => {
    const matched = banners.find(b => b.id === id);
    if (!matched) return;

    const newActiveState = !matched.is_active;

    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase
          .from("banners")
          .update({ is_active: newActiveState })
          .eq("id", id);

        if (error) throw error;
      }

      const updated = banners.map((b) => (b.id === id ? { ...b, is_active: newActiveState } : b));
      setBanners(updated);
      localStorage.setItem("nayel_banners", JSON.stringify(updated));
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase.from("banners").delete().eq("id", id);
        if (error) throw error;
      }

      const updated = banners.filter((b) => b.id !== id);
      setBanners(updated);
      localStorage.setItem("nayel_banners", JSON.stringify(updated));
    } catch (err: any) {
      alert("Error deleting banner: " + err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
      {/* Banner list */}
      <div className="lg:col-span-2 bg-white p-6 border rounded-[2.5rem] shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h3 className="text-sm font-black text-black uppercase tracking-tight flex items-center gap-2">
              <Image className="h-5 w-5 text-[#34C759]" />
              <span>Homepage Slider Banners</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Define hero carousel slider imagery, headline copy, and redirection links.</p>
          </div>
          <button onClick={fetchBanners} className="p-2 hover:bg-neutral-100 rounded-xl transition-all">
            <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 font-mono text-[10px]">Loading banners...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {banners.map((b) => (
              <div key={b.id} className="border rounded-2xl overflow-hidden shadow-sm bg-[#FCFCFC] flex flex-col md:flex-row">
                <img src={b.image_url} alt={b.title} className="w-full md:w-48 h-32 object-cover border-r" />
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[8px] font-mono font-bold bg-[#FAFBFD] px-2 py-0.5 rounded border text-slate-400 uppercase">
                          Position {b.position}
                        </span>
                        <h4 className="text-xs font-black text-black uppercase mt-1 leading-tight">{b.title}</h4>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => handleToggleBanner(b.id)} className="p-1 border rounded hover:bg-slate-50">
                          {b.is_active ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5 text-slate-400" />}
                        </button>
                        <button onClick={() => handleDeleteBanner(b.id)} className="p-1 border rounded text-rose-600 hover:bg-rose-50">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 italic leading-tight">{b.subtitle}</p>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 truncate">Link: {b.link_url}</span>
                </div>
              </div>
            ))}
            {banners.length === 0 && (
              <div className="text-center py-12 text-slate-400 font-mono text-[10px]">No slider banners active. Add one.</div>
            )}
          </div>
        )}
      </div>

      {/* Deploy new Banner */}
      <div className="bg-white p-6 border rounded-[2.5rem] shadow-sm h-fit">
        <form onSubmit={handleCreateBanner} className="space-y-4">
          <h3 className="text-xs font-black text-black uppercase border-b pb-3">Deploy Hero Banner</h3>

          <div>
            <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Headline Title</label>
            <input
              required
              placeholder="e.g. Master Atelier Curations"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black font-semibold text-[11px] focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Narrative Subtitle</label>
            <input
              required
              placeholder="e.g. Handmade ceramic objects crafted in Denmark"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-[11px] focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Banner Image URL</label>
            <input
              required
              placeholder="https://images.unsplash.com/photo-..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl font-mono text-[11px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Action Link URL</label>
              <input
                placeholder="/shop"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Slider Position</label>
              <input
                type="number"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl font-mono font-bold text-center text-black"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-black hover:bg-[#34C759] text-white font-bold uppercase rounded-xl tracking-wider text-[10px] transition-all cursor-pointer shadow-md"
          >
            Deploy Banner Slide
          </button>
        </form>
      </div>
    </div>
  );
};
