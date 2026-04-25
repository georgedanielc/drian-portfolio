"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD!;

const CATEGORY_MAP: Record<string, string[]> = {
  branding: ["Logo Design", "Package Design", "Banner Design"],
  illustration: ["Digital Illustration", "Pen & Ink", "Digital Drawing"],
  "social-media": ["Social Media", "Pinterest Template", "Poster Design"],
  photography: ["Photography"],
  others: ["Others"],
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("branding");
  const [subcategory, setSubcategory] = useState(CATEGORY_MAP["branding"][0]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setAuthError("");
    } else {
      setAuthError("Wrong password.");
    }
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setSubcategory(CATEGORY_MAP[val][0]);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleExtraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExtraFiles(Array.from(e.target.files ?? []));
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { error } = await supabase.storage.from("works").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("works").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!title || !category) {
      setError("Title and category are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const slug = slugify(title) + "-" + Date.now();

      let coverUrl = "";
      if (coverFile) {
        coverUrl = await uploadFile(coverFile, `${category}/${slug}/cover-${coverFile.name}`);
      }

      const extraUrls: string[] = [];
      for (const file of extraFiles) {
        const url = await uploadFile(file, `${category}/${slug}/${file.name}`);
        extraUrls.push(url);
      }

      const { error: dbError } = await supabase.from("works").insert({
        title,
        description,
        category,
        subcategory,
        cover_image: coverUrl,
        images: extraUrls,
        slug,
      });

      if (dbError) throw dbError;

      setSuccess(true);
      setTitle("");
      setDescription("");
      setCategory("branding");
      setSubcategory(CATEGORY_MAP["branding"][0]);
      setCoverFile(null);
      setCoverPreview(null);
      setExtraFiles([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (!authed) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 w-full max-w-sm">
          <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 mb-6">Admin Access</p>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-[#111] outline-none focus:border-[#0157ba] transition-colors duration-200 mb-3"
          />
          {authError && <p className="text-red-400 text-[11px] mb-3">{authError}</p>}
          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-lg text-white text-[11px] tracking-[0.14em] uppercase transition-colors duration-200"
            style={{ backgroundColor: "#0157ba" }}
          >
            Enter
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#111] flex flex-col">

      <nav className="relative flex items-center justify-center px-6 sm:px-10 py-4 sm:py-6 bg-white" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <span style={{ fontFamily: "var(--font-mono)", color: "#111111" }} className="text-lg sm:text-3xl tracking-wide font-medium">
          Drian Clemence Esquejo
        </span>
        <button onClick={() => router.push("/")} className="sm:absolute sm:right-10 text-[11px] tracking-[0.14em] uppercase transition-colors duration-200" style={{ color: "#0157ba" }}>
          ← Home
        </button>
      </nav>

      <div className="max-w-2xl mx-auto w-full px-6 py-10">

        <div className="mb-10">
          <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 mb-2">Admin</p>
          <h1 className="text-3xl font-semibold">Upload Work</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6">

          {/* Title */}
          <div>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray-400 mb-2 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ttie ni George Malaki"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0157ba] transition-colors duration-200"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray-400 mb-2 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="hi po, Short description mo...."
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0157ba] transition-colors duration-200 resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray-400 mb-2 block">Category</label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0157ba] transition-colors duration-200 bg-white"
            >
              {Object.keys(CATEGORY_MAP).map((cat) => (
                <option key={cat} value={cat}>
                  {cat.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray-400 mb-2 block">Subcategory</label>
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0157ba] transition-colors duration-200 bg-white"
            >
              {CATEGORY_MAP[category].map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Cover image */}
          <div>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray-400 mb-2 block">Cover Image</label>
            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#0157ba] transition-colors duration-200 bg-gray-50">
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl text-gray-300">↑</span>
                <span className="text-[11px] tracking-[0.14em] uppercase text-gray-400">
                  {coverFile ? coverFile.name : "Click to upload"}
                </span>
              </div>
              <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
            </label>
            {coverPreview && (
              <img src={coverPreview} alt="Cover preview" className="mt-4 w-full h-48 object-cover rounded-lg border border-gray-100 shadow-sm" />
            )}
          </div>

          {/* Additional images */}
          <div>
            <label className="text-[11px] tracking-[0.14em] uppercase text-gray-400 mb-2 block">Additional Images</label>
            <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#0157ba] transition-colors duration-200 bg-gray-50">
              <span className="text-[11px] tracking-[0.14em] uppercase text-gray-400">
                {extraFiles.length > 0 ? `${extraFiles.length} file(s) selected` : "Click to upload multiple"}
              </span>
              <input type="file" accept="image/*" multiple onChange={handleExtraChange} className="hidden" />
            </label>
          </div>

          {error && <p className="text-red-400 text-[11px]">{error}</p>}

          {success && (
            <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3">
              <p className="text-green-600 text-[11px] tracking-widest uppercase">Work uploaded successfully!</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-4 rounded-lg text-white text-[11px] tracking-[0.14em] uppercase transition-opacity duration-200 disabled:opacity-50"
            style={{ backgroundColor: "#0157ba" }}
          >
            {saving ? "Uploading..." : "Save Work"}
          </button>

        </div>
      </div>
    </main>
  );
}