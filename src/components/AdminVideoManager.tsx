import React, { useState, useEffect } from "react";
import { Film, Plus, Trash2, Edit, RefreshCw, CheckCircle, Search, Eye, EyeOff } from "lucide-react";
import { isSupabaseConnected, supabase } from "../lib/supabase";

interface Video {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string;
  likes_count: number;
  views_count: number;
  is_active: boolean;
}

export const AdminVideoManager: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      if (isSupabaseConnected()) {
        const { data, error } = await supabase
          .from("videos")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) {
          setVideos(data.map((item: any) => ({
            id: item.id,
            title: item.title,
            video_url: item.video_url,
            thumbnail_url: item.thumbnail_url || "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=400&q=80",
            likes_count: item.likes_count || 0,
            views_count: item.views_count || 0,
            is_active: item.is_active
          })));
        }
      } else {
        const cached = localStorage.getItem("nayel_videos");
        if (cached) {
          setVideos(JSON.parse(cached));
        } else {
          const defaults: Video[] = [
            { id: "v_1", title: "Unboxing the Ceramic Trio Vase", video_url: "https://assets.mixkit.co/videos/preview/mixkit-decorating-a-warm-living-room-41561-large.mp4", thumbnail_url: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=400&q=80", likes_count: 320, views_count: 1840, is_active: true },
            { id: "v_2", title: "Staging the Modern Oak Table", video_url: "https://assets.mixkit.co/videos/preview/mixkit-sunlight-on-a-cozy-living-room-with-plants-41559-large.mp4", thumbnail_url: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=400&q=80", likes_count: 480, views_count: 2450, is_active: true }
          ];
          setVideos(defaults);
          localStorage.setItem("nayel_videos", JSON.stringify(defaults));
        }
      }
    } catch (err) {
      console.error("Failed to load videos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) return;

    const newVideo: Video = {
      id: "vid_" + Date.now(),
      title: title.trim(),
      video_url: videoUrl.trim(),
      thumbnail_url: thumbnailUrl.trim() || "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=400&q=80",
      likes_count: 0,
      views_count: 0,
      is_active: true
    };

    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase.from("videos").insert([{
          title: newVideo.title,
          video_url: newVideo.video_url,
          thumbnail_url: newVideo.thumbnail_url,
          likes_count: 0,
          views_count: 0,
          is_active: true
        }]);

        if (error) throw error;
      }

      const updated = [newVideo, ...videos];
      setVideos(updated);
      localStorage.setItem("nayel_videos", JSON.stringify(updated));

      setTitle("");
      setVideoUrl("");
      setThumbnailUrl("");
    } catch (err: any) {
      alert("Error adding video: " + err.message);
    }
  };

  const handleToggleActive = async (id: string) => {
    const matched = videos.find(v => v.id === id);
    if (!matched) return;

    const newActiveState = !matched.is_active;

    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase
          .from("videos")
          .update({ is_active: newActiveState })
          .eq("id", id);

        if (error) throw error;
      }

      const updated = videos.map((v) => (v.id === id ? { ...v, is_active: newActiveState } : v));
      setVideos(updated);
      localStorage.setItem("nayel_videos", JSON.stringify(updated));
    } catch (err: any) {
      alert("Error updating video status: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video testimonial?")) return;

    try {
      if (isSupabaseConnected()) {
        const { error } = await supabase.from("videos").delete().eq("id", id);
        if (error) throw error;
      }

      const updated = videos.filter((v) => v.id !== id);
      setVideos(updated);
      localStorage.setItem("nayel_videos", JSON.stringify(updated));
    } catch (err: any) {
      alert("Error deleting video: " + err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
      {/* Video Testimonials List */}
      <div className="lg:col-span-2 bg-white p-6 border rounded-[2.5rem] shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h3 className="text-sm font-black text-black uppercase tracking-tight flex items-center gap-2">
              <Film className="h-5 w-5 text-[#34C759]" />
              <span>Bespoke Video Showings</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Control streamable customer unboxing clips, walkthroughs, and organic social likes.</p>
          </div>
          <button onClick={fetchVideos} className="p-2 hover:bg-neutral-100 rounded-xl transition-all">
            <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 font-mono text-[10px]">Loading stream library...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {videos.map((v) => (
              <div key={v.id} className="border rounded-2xl overflow-hidden shadow-sm bg-[#FCFCFC] flex flex-col md:flex-row">
                <div className="relative w-full md:w-48 h-32 bg-slate-100 border-r flex items-center justify-center">
                  <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <span className="p-2 bg-white/90 rounded-full shadow text-black font-mono font-bold text-[8px] tracking-widest">
                      PLAY
                    </span>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-black text-black uppercase leading-tight">{v.title}</h4>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => handleToggleActive(v.id)} className="p-1 border rounded hover:bg-slate-50 cursor-pointer">
                          {v.is_active ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5 text-slate-400" />}
                        </button>
                        <button onClick={() => handleDelete(v.id)} className="p-1 border text-rose-600 rounded hover:bg-rose-50 cursor-pointer">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 block truncate mt-1">URL: {v.video_url}</span>
                  </div>

                  <div className="flex gap-4 font-mono text-[10px] text-slate-500 border-t pt-2">
                    <span>Views: {v.views_count}</span>
                    <span>Likes: {v.likes_count}</span>
                  </div>
                </div>
              </div>
            ))}
            {videos.length === 0 && (
              <div className="text-center py-12 text-slate-400 font-mono text-[10px]">No videos active in library. Add one.</div>
            )}
          </div>
        )}
      </div>

      {/* Add video */}
      <div className="bg-white p-6 border rounded-[2.5rem] shadow-sm h-fit">
        <form onSubmit={handleCreate} className="space-y-4">
          <h3 className="text-xs font-black text-black uppercase border-b pb-3">Deploy Interactive Video</h3>

          <div>
            <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Video Headline Title</label>
            <input
              required
              placeholder="e.g. Setting up the Floating Oak Sideboard"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl text-black font-semibold text-[11px] focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Streamable Video URL (.mp4)</label>
            <input
              required
              placeholder="https://assets.mixkit.co/videos/preview/..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block text-[9px] text-slate-400 uppercase font-black mb-1">Thumbnail Preview Image URL</label>
            <input
              placeholder="https://images.unsplash.com/photo-..."
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="w-full bg-[#F7F7F7] border p-2.5 rounded-xl font-mono text-[11px]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-black hover:bg-[#34C759] text-white font-bold uppercase rounded-xl tracking-wider text-[10px] transition-all cursor-pointer shadow-md"
          >
            Deploy Interactive Video
          </button>
        </form>
      </div>
    </div>
  );
};
