import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Trash2, Edit, RefreshCw, CheckCircle, Search, Eye, EyeOff } from "lucide-react";
import { isSupabaseConnected, supabase } from "../lib/supabase";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  author_name: string;
  tags: string[];
  is_published: boolean;
}

export const AdminBlogManager: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [authorName, setAuthorName] = useState("");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      if (isSupabaseConnected()) {
        const { data, error } = await supabase
          .from("blogs")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) {
          setBlogs(data.map((item: any) => ({
            id: item.id,
            title: item.title,
            slug: item.slug,
            excerpt: item.excerpt || "",
            content: item.content || "",
            image_url: item.image_url || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80",
            author_name: item.author_name || "Nayel Editorial",
            tags: item.tags || [],
            is_published: item.is_published
          })));
        }
      } else {
        const cached = localStorage.getItem("nayel_blogs");
        if (cached) {
          setBlogs(JSON.parse(cached));
        } else {
          const defaults: BlogPost[] = [
            { id: "b_1", title: "The Philosophy of Organic Clay Vases", slug: "philosophy-organic-clay-vases", excerpt: "Exploring the tactile allure and natural burnished finishes of modern European potters.", content: "Full text content about clay vases, design aesthetic and handcraft history.", image_url: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80", author_name: "Deven Rivera", tags: ["Atelier", "Design"], is_published: true },
            { id: "b_2", title: "Scandinavian Oak Joinery Guide", slug: "scandinavian-oak-joinery-guide", excerpt: "Why solid oak and floatable lower shelves dominate the modern architect sanctuary.", content: "Full text guide on white European solid oak joinery principles, floating shelf structures.", image_url: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=800&q=80", author_name: "Marc Jacobs", tags: ["Furniture", "Sanctuary"], is_published: true }
          ];
          setBlogs(defaults);
          localStorage.setItem("nayel_blogs", JSON.stringify(defaults));
        }
      }
    } catch (err) {
      console.error("Failed to load blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const newBlog: BlogPost = {
      id: "blog_" + Date.now(),
      title: title.trim(),
      slug,
      excerpt: excerpt.trim() || title.trim().substring(0, 80) + "...",
      content: content.trim(),
      image_url: imageUrl.trim() || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80",
      author_name: authorName.trim() || "Nayel Curator",
      tags: ["Atelier", "Editorial"],
      is_published: true
    };

    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase.from("blogs").insert([{
          title: newBlog.title,
          slug: newBlog.slug,
          excerpt: newBlog.excerpt,
          content: newBlog.content,
          image_url: newBlog.image_url,
          author_name: newBlog.author_name,
          tags: newBlog.tags,
          is_published: true
        }]);

        if (error) throw error;
      }

      const updated = [newBlog, ...blogs];
      setBlogs(updated);
      localStorage.setItem("nayel_blogs", JSON.stringify(updated));

      setTitle("");
      setExcerpt("");
      setContent("");
      setImageUrl("");
      setAuthorName("");
    } catch (err: any) {
      alert("Error publishing article: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this editorial article?")) return;

    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase.from("blogs").delete().eq("id", id);
        if (error) throw error;
      }

      const updated = blogs.filter((b) => b.id !== id);
      setBlogs(updated);
      localStorage.setItem("nayel_blogs", JSON.stringify(updated));
    } catch (err: any) {
      alert("Failed to delete blog article: " + err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
      {/* Editorial Posts List */}
      <div className="lg:col-span-2 bg-white p-6 border rounded-[2.5rem] shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h3 className="text-sm font-black text-black uppercase tracking-tight flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#34C759]" />
              <span>Design Journals & Editorial</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Author organic lifestyle journals, style essays, and curation notes for design enthusiasts.</p>
          </div>
          <button onClick={fetchBlogs} className="p-2 hover:bg-neutral-100 rounded-xl transition-all">
            <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 font-mono text-[10px]">Loading design journals...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {blogs.map((b) => (
              <div key={b.id} className="border rounded-2xl overflow-hidden shadow-sm bg-[#FCFCFC] flex flex-col md:flex-row">
                <img src={b.image_url} alt={b.title} className="w-full md:w-48 h-32 object-cover border-r" />
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-xs font-black text-black uppercase leading-tight">{b.title}</h4>
                      <button onClick={() => handleDelete(b.id)} className="p-1 border text-rose-600 rounded hover:bg-rose-50 cursor-pointer shrink-0">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 italic leading-tight">{b.excerpt}</p>
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 border-t pt-2 mt-2">
                    <span>By: {b.author_name}</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-black uppercase text-[8px] text-slate-600">
                      PUBLISHED
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {blogs.length === 0 && (
              <div className="text-center py-12 text-slate-400 font-mono text-[10px]">No design journals written. Add editorial.</div>
            )}
          </div>
        )}
      </div>

      {/* Write blog */}
      <div className="bg-white p-6 border rounded-[2.5rem] shadow-sm h-fit">
        <form onSubmit={handleCreate} className="space-y-4">
          <h3 className="text-xs font-black text-black uppercase border-b pb-3">Draft Editorial Post</h3>

          <div>
            <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Article Headline Title</label>
            <input
              required
              placeholder="e.g. Modernist European Clay Sanctuary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black font-semibold text-[11px] focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Author Name / Pen</label>
            <input
              placeholder="e.g. Deven Rivera"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black text-[11px] focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Journal Cover Image URL</label>
            <input
              placeholder="https://images.unsplash.com/photo-..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Excerpt Summary</label>
            <input
              placeholder="Brief teaser text for the blog directory listing..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-[11px] focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Body Content (Rich Text / MD)</label>
            <textarea
              required
              rows={5}
              placeholder="Draft the complete article body..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-[11px] text-black"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-black hover:bg-[#34C759] text-white font-bold uppercase rounded-xl tracking-wider text-[10px] transition-all cursor-pointer shadow-md"
          >
            Deploy Editorial Post
          </button>
        </form>
      </div>
    </div>
  );
};
