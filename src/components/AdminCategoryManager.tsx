import React, { useState, useEffect } from "react";
import { Layers3, Plus, Trash2, Edit2, Check, RefreshCw, Eye, EyeOff, Search } from "lucide-react";
import { isSupabaseConnected, supabase } from "../lib/supabase";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  created_at?: string;
}

export const AdminCategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  // New Category states
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      if (isSupabaseConnected()) {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;
        setCategories(data || []);
      } else {
        // LocalStorage fallback
        const local = localStorage.getItem("nayel_categories");
        if (local) {
          setCategories(JSON.parse(local));
        } else {
          const defaults: Category[] = [
            { id: "Furniture", name: "Furniture", slug: "furniture", image_url: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=400&q=80" },
            { id: "Lighting", name: "Lighting", slug: "lighting", image_url: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=400&q=80" },
            { id: "Vases", name: "Vases & Pots", slug: "vases-pots", image_url: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=400&q=80" },
            { id: "Rugs", name: "Rugs & Carpets", slug: "rugs-carpets", image_url: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=400&q=80" },
            { id: "WallDecor", name: "Wall Decor", slug: "wall-decor", image_url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80" }
          ];
          setCategories(defaults);
          localStorage.setItem("nayel_categories", JSON.stringify(defaults));
        }
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const id = newId.trim() || newName.trim().replace(/\s+/g, "");

    const newCat: Category = {
      id,
      name: newName.trim(),
      slug,
      image_url: newImage.trim() || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80",
    };

    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase.from("categories").insert([newCat]);
        if (error) throw error;
      }
      const updated = [...categories, newCat];
      setCategories(updated);
      if (!isSupabaseConnected()) {
        localStorage.setItem("nayel_categories", JSON.stringify(updated));
      }

      setNewId("");
      setNewName("");
      setNewImage("");
    } catch (err: any) {
      alert("Error adding category: " + err.message);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !editingCat.name.trim()) return;

    const slug = editingCat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const updatedCat = { ...editingCat, slug };

    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase
          .from("categories")
          .update({
            name: updatedCat.name,
            slug: updatedCat.slug,
            image_url: updatedCat.image_url,
          })
          .eq("id", updatedCat.id);

        if (error) throw error;
      }

      const updated = categories.map((c) => (c.id === updatedCat.id ? updatedCat : c));
      setCategories(updated);
      if (!isSupabaseConnected()) {
        localStorage.setItem("nayel_categories", JSON.stringify(updated));
      }

      setEditingCat(null);
    } catch (err: any) {
      alert("Error updating category: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? All associated products may need to be updated.")) return;

    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase.from("categories").delete().eq("id", id);
        if (error) throw error;
      }

      const updated = categories.filter((c) => c.id !== id);
      setCategories(updated);
      if (!isSupabaseConnected()) {
        localStorage.setItem("nayel_categories", JSON.stringify(updated));
      }
    } catch (err: any) {
      alert("Error deleting category: " + err.message);
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
      {/* Table View */}
      <div className="lg:col-span-2 bg-white p-6 border rounded-[2.5rem] shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h3 className="text-sm font-black text-black uppercase tracking-tight flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-[#34C759]" />
              <span>Hierarchical Category Segments</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Control live storefront departments, catalog routes, and banner images.</p>
          </div>
          <button
            onClick={fetchCategories}
            className="p-2 hover:bg-neutral-100 rounded-xl transition-all"
            title="Refresh database"
          >
            <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F7F7F7] pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:outline-none focus:bg-white text-black font-semibold text-[11px]"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 font-mono text-[10px]">Synchronizing departments...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-slate-400 font-extrabold text-[9px] uppercase tracking-wider">
                  <th className="py-2">Preview</th>
                  <th className="py-2">Unique ID / Slug</th>
                  <th className="py-2">Display Title</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-600 font-medium">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3">
                      <img
                        src={c.image_url}
                        alt={c.name}
                        className="h-9 w-9 object-cover rounded-xl border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=100&q=80";
                        }}
                      />
                    </td>
                    <td className="py-3 font-mono text-[10px]">
                      <span className="block text-black font-semibold">{c.id}</span>
                      <span className="text-slate-400 text-[9px]">/{c.slug}</span>
                    </td>
                    <td className="py-3 font-bold text-black text-xs">{c.name}</td>
                    <td className="py-3 text-right space-x-1.5">
                      <button
                        onClick={() => setEditingCat(c)}
                        className="p-1.5 text-slate-500 hover:text-black border rounded-lg cursor-pointer"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 border rounded-lg cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-mono text-[10px]">
                      No category segments match search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor / Creation Sidebar */}
      <div className="bg-white p-6 border rounded-[2.5rem] shadow-sm flex flex-col h-fit">
        {editingCat ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="border-b pb-3 flex justify-between items-center">
              <h3 className="text-xs font-black text-black uppercase">Edit Segment</h3>
              <button
                type="button"
                onClick={() => setEditingCat(null)}
                className="text-[10px] text-rose-500 font-bold uppercase hover:underline"
              >
                Cancel
              </button>
            </div>
            <div>
              <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Unique Segment ID</label>
              <input
                disabled
                value={editingCat.id}
                className="w-full bg-slate-100 border p-2.5 rounded-xl font-mono text-slate-500 text-[11px] cursor-not-allowed outline-none"
              />
            </div>
            <div>
              <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Segment Title</label>
              <input
                required
                value={editingCat.name}
                onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl focus:outline-none focus:bg-white text-black font-semibold text-[11px]"
              />
            </div>
            <div>
              <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Bespoke Image URL</label>
              <input
                value={editingCat.image_url}
                onChange={(e) => setEditingCat({ ...editingCat, image_url: e.target.value })}
                className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl focus:outline-none text-slate-600 text-[11px]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-black hover:bg-[#34C759] text-white font-bold uppercase rounded-xl tracking-wider text-[10px] transition-all cursor-pointer shadow-md"
            >
              Commit Changes
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <h3 className="text-xs font-black text-black uppercase border-b pb-3">Create New Segment</h3>
            <div>
              <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Department ID (e.g. Accents)</label>
              <input
                placeholder="Auto-generated if left blank"
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl focus:outline-none font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Department Name</label>
              <input
                required
                placeholder="e.g. Sculptural Objects"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl focus:outline-none focus:bg-white text-black font-semibold text-[11px]"
              />
            </div>
            <div>
              <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Cover Image URL</label>
              <input
                placeholder="https://images.unsplash.com/photo-..."
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl focus:outline-none text-[11px]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-black hover:bg-[#34C759] text-white font-bold uppercase rounded-xl tracking-wider text-[10px] transition-all cursor-pointer shadow-md"
            >
              Inject Department
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
