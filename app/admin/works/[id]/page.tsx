"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import imageCompression from "browser-image-compression";

const CATEGORY_MAP: Record<string, string[]> = {
  branding: ["Logo Design", "Package Design", "Banner Design"],
  illustration: ["Digital Illustration", "Pen & Ink", "Digital Drawing"],
  "social-media": ["Social Media", "Pinterest Template", "Poster Design"],
  photography: ["Photography"],
  others: ["Others"],
};

function getStoragePath(url: string): string {
  const marker = "/object/public/works/";
  const idx = url.indexOf(marker);
  return idx !== -1 ? url.slice(idx + marker.length) : "";
}

export default function EditWorkPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("branding");
  const [subcategory, setSubcategory] = useState("");
  const [existingCover, setExistingCover] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [newCoverPreview, setNewCoverPreview] = useState<string | null>(null);
  const [newExtraFiles, setNewExtraFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  useEffect(() => {
    const isAuthed = localStorage.getItem("admin_authed") === "true";
    if (!isAuthed) router.replace("/admin");
  }, []);

  useEffect(() => {
    const fetchWork = async () => {
      const { data } = await supabase.from("works").select("*").eq("id", id).single();
      if (!data) { router.replace("/admin/works"); return; }
      setTitle(data.title);
      setDescription(data.description ?? "");
      setCategory(data.category);
      setSubcategory(data.subcategory);
      setExistingCover(data.cover_image);
      setExistingImages(data.images ?? []);
      setLoading(false);
    };
    if (id) fetchWork();
  }, [id]);

  const compressImage = async (file: File): Promise<File> => {
    return await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { error } = await supabase.storage.from("works").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("works").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!title || !category) { setError("Title and category are required."); return; }
    setSaving(true);
    setError("");
    try {
      let coverUrl = existingCover;

      // Replace cover if new one selected
      if (newCoverFile) {
        if (existingCover) await supabase.storage.from("works").remove([getStoragePath(existingCover)]);
        const compressed = await compressImage(newCoverFile);
        coverUrl = await uploadFile(compressed, `${category}/${id}/cover-${newCoverFile.name}`);
      }

      // Remove deleted extra images from storage
      if (removedImages.length > 0) {
        await supabase.storage.from("works").remove(removedImages.map(getStoragePath));
      }

      // Upload new extra images
      const newUrls: string[] = [];
      for (const file of newExtraFiles) {
        const compressed = await compressImage(file);
        const url = await uploadFile(compressed, `${category}/${id}/${file.name}`);
        newUrls.push(url);
      }

      const updatedImages = [
        ...existingImages.filter((img) => !removedImages.includes(img)),
        ...newUrls,
      ];

      await supabase.from("works").update({
        title,
        description,
        category,
        subcategory,
        cover_image: coverUrl,
        images: updatedImages,
      }).eq("id", id);

      setSuccess(true);
      setTimeout(() => router.push("/admin/works"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <main className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
      <p className="text-gray-400 text-[11px] tracking-widest uppercase">Loading...</p>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#111] flex flex-col">
      <nav className="relative flex items-center justify-center px-6 sm:px-10 py-4 sm:py-6 bg-white" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <span style={{ fontFamily: "var(--font-mono)", color: "#111111" }} className="text-lg sm:text-3xl tracking-wide font-medium">
          Drian Clemence Esquejo
        </span>
        <div className="sm:absolute sm:right-10 flex items-center gap-4">
          <button onClick={() => router.push("/admin/works")} className="text-[11px] tracking-[0.14em] uppercase" style={{ color: "#0157ba" }}>
            ← Works
          </button>
          <button onClick={() => { localStorage.removeItem("admin_authed"); router.replace("/admin"); }} className="text-[11px] tracking-[0.14em] uppercase text-gray-400 hover:text-red-400 transition-colors duration-200">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto w-full px-6 py-10">
        <div className="mb-10">
          <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 mb-2">Admin</p>
          <h1 className="text-3xl font-semibold">Edit Work</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6">
          {/* Title */}
          <div>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray-400 mb-2 block">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0157ba] transition-colors duration-200" />
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray-400 mb-2 block">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0157ba] transition-colors duration-200 resize-none" />
          </div>

          {/* Category */}
          <div>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray-400 mb-2 block">Category</label>
            <select value={category} onChange={(e) => { setCategory(e.target.value); setSubcategory(CATEGORY_MAP[e.target.value][0]); }} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0157ba] transition-colors duration-200 bg-white">
              {Object.keys(CATEGORY_MAP).map((cat) => (
                <option key={cat} value={cat}>{cat.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray-400 mb-2 block">Subcategory</label>
            <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0157ba] transition-colors duration-200 bg-white">
              {CATEGORY_MAP[category].map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Cover image */}
          <div>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray-400 mb-2 block">Cover Image</label>
            {existingCover && !newCoverPreview && (
              <img src={existingCover} alt="Current cover" className="w-full h-48 object-cover rounded-lg border border-gray-100 shadow-sm mb-3" />
            )}
            {newCoverPreview && (
              <img src={newCoverPreview} alt="New cover" className="w-full h-48 object-cover rounded-lg border border-gray-100 shadow-sm mb-3" />
            )}
            <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#0157ba] transition-colors duration-200 bg-gray-50">
              <span className="text-[11px] tracking-[0.14em] uppercase text-gray-400">
                {newCoverFile ? newCoverFile.name : "Click to replace cover"}
              </span>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setNewCoverFile(file);
                setNewCoverPreview(URL.createObjectURL(file));
              }} className="hidden" />
            </label>
          </div>

          {/* Existing extra images */}
          {existingImages.length > 0 && (
            <div>
              <label className="text-[11px] tracking-[0.14em] uppercase text-gray-400 mb-2 block">Current Images</label>
              <div className="grid grid-cols-3 gap-2">
                {existingImages.map((img, i) => (
                  <div key={i} className={`relative rounded-lg overflow-hidden border ${removedImages.includes(img) ? "opacity-30 border-red-300" : "border-gray-100"}`}>
                    <img src={img} alt={`Image ${i + 1}`} className="w-full h-24 object-cover" />
                    <button
                      onClick={() => setRemovedImages((prev) =>
                        prev.includes(img) ? prev.filter((r) => r !== img) : [...prev, img]
                      )}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white shadow text-[10px] flex items-center justify-center text-gray-400 hover:text-red-400"
                    >
                      {removedImages.includes(img) ? "↩" : "✕"}
                    </button>
                  </div>
                ))}
              </div>
              {removedImages.length > 0 && (
                <p className="text-[10px] text-red-400 mt-2">{removedImages.length} image(s) will be removed on save</p>
              )}
            </div>
          )}

          {/* New extra images */}
          <div>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray-400 mb-2 block">Add More Images</label>
            <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#0157ba] transition-colors duration-200 bg-gray-50">
              <span className="text-[11px] tracking-[0.14em] uppercase text-gray-400">
                {newExtraFiles.length > 0 ? `${newExtraFiles.length} file(s) selected` : "Click to upload more"}
              </span>
              <input type="file" accept="image/*" multiple onChange={(e) => setNewExtraFiles(Array.from(e.target.files ?? []))} className="hidden" />
            </label>
          </div>

          {error && <p className="text-red-400 text-[11px]">{error}</p>}
          {success && (
            <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3">
              <p className="text-green-600 text-[11px] tracking-widest uppercase">Saved! Redirecting...</p>
            </div>
          )}

          <button onClick={handleSave} disabled={saving} className="w-full py-4 rounded-lg text-white text-[11px] tracking-[0.14em] uppercase transition-opacity duration-200 disabled:opacity-50" style={{ backgroundColor: "#0157ba" }}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </main>
  );
}