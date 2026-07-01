import React, { useState, useEffect } from "react";
import { Grid, Plus, Trash2, ArrowUp, ArrowDown, RefreshCw, CheckCircle, Eye, EyeOff } from "lucide-react";
import { isSupabaseConnected, supabase } from "../lib/supabase";

interface HomepageSection {
  id: string;
  title: string;
  section_type: string;
  sort_order: number;
  is_visible: boolean;
  content_data: any;
}

export const AdminHomepageSectionManager: React.FC = () => {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [sectionType, setSectionType] = useState("carousel");
  const [sortOrder, setSortOrder] = useState("1");
  const [narrative, setNarrative] = useState("");

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      if (isSupabaseConnected()) {
        const { data, error } = await supabase
          .from("homepage_sections")
          .select("*")
          .order("sort_order", { ascending: true });

        if (error) throw error;
        if (data) {
          setSections(data.map((item: any) => ({
            id: item.id,
            title: item.title,
            section_type: item.section_type,
            sort_order: item.sort_order || 0,
            is_visible: item.is_visible,
            content_data: item.content_data || {}
          })));
        }
      } else {
        const cached = localStorage.getItem("nayel_sections");
        if (cached) {
          setSections(JSON.parse(cached));
        } else {
          const defaults: HomepageSection[] = [
            { id: "sec_1", title: "New Arrivals", section_type: "carousel", sort_order: 1, is_visible: true, content_data: { subtitle: "Fresh from the ateliers" } },
            { id: "sec_2", title: "Featured Collection", section_type: "grid", sort_order: 2, is_visible: true, content_data: { subtitle: "Architectural sanctuaries" } },
            { id: "sec_3", title: "Atelier Curations", section_type: "bento", sort_order: 3, is_visible: true, content_data: { subtitle: "Bespoke handcrafted excellence" } }
          ];
          setSections(defaults);
          localStorage.setItem("nayel_sections", JSON.stringify(defaults));
        }
      }
    } catch (err) {
      console.error("Failed to load homepage sections:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newSec: HomepageSection = {
      id: "sec_" + Date.now(),
      title: title.trim(),
      section_type: sectionType,
      sort_order: Number(sortOrder) || 1,
      is_visible: true,
      content_data: { subtitle: narrative.trim() || "Bespoke collections selection" }
    };

    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase.from("homepage_sections").insert([{
          title: newSec.title,
          section_type: newSec.section_type,
          sort_order: newSec.sort_order,
          is_visible: true,
          content_data: newSec.content_data
        }]);

        if (error) throw error;
      }

      const updated = [...sections, newSec].sort((a, b) => a.sort_order - b.sort_order);
      setSections(updated);
      localStorage.setItem("nayel_sections", JSON.stringify(updated));

      setTitle("");
      setNarrative("");
    } catch (err: any) {
      alert("Error adding homepage section: " + err.message);
    }
  };

  const handleToggleVisible = async (id: string) => {
    const matched = sections.find(s => s.id === id);
    if (!matched) return;

    const newVisibleState = !matched.is_visible;

    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase
          .from("homepage_sections")
          .update({ is_visible: newVisibleState })
          .eq("id", id);

        if (error) throw error;
      }

      const updated = sections.map((s) => (s.id === id ? { ...s, is_visible: newVisibleState } : s));
      setSections(updated);
      localStorage.setItem("nayel_sections", JSON.stringify(updated));
    } catch (err: any) {
      alert("Failed to toggle section: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this homepage section layout?")) return;

    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase.from("homepage_sections").delete().eq("id", id);
        if (error) throw error;
      }

      const updated = sections.filter((s) => s.id !== id);
      setSections(updated);
      localStorage.setItem("nayel_sections", JSON.stringify(updated));
    } catch (err: any) {
      alert("Failed to delete section: " + err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
      {/* Sections List */}
      <div className="lg:col-span-2 bg-white p-6 border rounded-[2.5rem] shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h3 className="text-sm font-black text-black uppercase tracking-tight flex items-center gap-2">
              <Grid className="h-5 w-5 text-[#34C759]" />
              <span>Homepage Layout Structure</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Edit store front landing order hierarchy, toggle grids, and config layouts.</p>
          </div>
          <button onClick={fetchSections} className="p-2 hover:bg-neutral-100 rounded-xl transition-all">
            <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 font-mono text-[10px]">Loading layouts...</div>
        ) : (
          <div className="space-y-3">
            {sections.map((s) => (
              <div key={s.id} className="p-4 border rounded-2xl bg-[#FCFCFC] flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">
                      Position {s.sort_order}
                    </span>
                    <span className="text-[8px] font-mono font-bold bg-[#34C759]/10 text-[#34C759] px-2 py-0.5 rounded uppercase">
                      {s.section_type} Layout
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-black uppercase mt-1 leading-tight">{s.title}</h4>
                  <span className="text-[9px] text-slate-400 block font-semibold italic">{s.content_data?.subtitle}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggleVisible(s.id)} className="p-1.5 border rounded-lg hover:bg-slate-50 cursor-pointer">
                    {s.is_visible ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 border rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {sections.length === 0 && (
              <div className="text-center py-12 text-slate-400 font-mono text-[10px]">No sections configured. Add layout block.</div>
            )}
          </div>
        )}
      </div>

      {/* Add Section */}
      <div className="bg-white p-6 border rounded-[2.5rem] shadow-sm h-fit">
        <form onSubmit={handleCreate} className="space-y-4">
          <h3 className="text-xs font-black text-black uppercase border-b pb-3">Append Layout Section</h3>

          <div>
            <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Section Title</label>
            <input
              required
              placeholder="e.g. Handmade Ceramic Wonders"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black font-semibold text-[11px] focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Marketing Narrative</label>
            <input
              placeholder="e.g. Curated pottery from handpicked artisans"
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-[11px] focus:outline-none focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Section Type</label>
              <select
                value={sectionType}
                onChange={(e) => setSectionType(e.target.value)}
                className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl font-bold"
              >
                <option value="carousel">Item Slider (Carousel)</option>
                <option value="grid">Flexible Grid</option>
                <option value="bento">Premium Bento Grid</option>
                <option value="hero">Hero Segment</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Display Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl font-mono text-center font-bold text-black"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-black hover:bg-[#34C759] text-white font-bold uppercase rounded-xl tracking-wider text-[10px] transition-all cursor-pointer shadow-md"
          >
            Append Layout Block
          </button>
        </form>
      </div>
    </div>
  );
};
