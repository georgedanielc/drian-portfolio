"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Work = {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  cover_image: string;
  images: string[];
  slug: string;
  created_at: string;
};

function getStoragePath(url: string): string {
  const marker = "/object/public/works/";
  const idx = url.indexOf(marker);
  return idx !== -1 ? url.slice(idx + marker.length) : "";
}

export default function ManageWorksPage() {
  const router = useRouter();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const isAuthed = localStorage.getItem("admin_authed") === "true";
    if (!isAuthed) router.replace("/admin");
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("works")
        .select("*")
        .order("created_at", { ascending: false });
      setWorks(data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleDelete = async (work: Work) => {
    if (!confirm(`Delete "${work.title}"? This cannot be undone.`)) return;
    setDeletingId(work.id);
    try {
      // Collect all storage paths
      const paths: string[] = [];
      if (work.cover_image) paths.push(getStoragePath(work.cover_image));
      (work.images ?? []).forEach((img) => {
        const p = getStoragePath(img);
        if (p) paths.push(p);
      });

      // Delete from storage
      if (paths.length > 0) {
        await supabase.storage.from("works").remove(paths);
      }

      // Delete from DB
      await supabase.from("works").delete().eq("id", work.id);
      setWorks((prev) => prev.filter((w) => w.id !== work.id));
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#111] flex flex-col">
      <nav className="relative flex items-center justify-center px-6 sm:px-10 py-4 sm:py-6 bg-white" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <span style={{ fontFamily: "var(--font-mono)", color: "#111111" }} className="text-lg sm:text-3xl tracking-wide font-medium">
          Drian Clemence Esquejo
        </span>
        <div className="sm:absolute sm:right-10 flex items-center gap-4">
          <button onClick={() => router.push("/admin")} className="text-[11px] tracking-[0.14em] uppercase transition-colors duration-200" style={{ color: "#0157ba" }}>
            ← Admin
          </button>
          <button onClick={() => { localStorage.removeItem("admin_authed"); router.replace("/admin"); }} className="text-[11px] tracking-[0.14em] uppercase text-gray-400 hover:text-red-400 transition-colors duration-200">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto w-full px-6 py-10">
        <div className="mb-10">
          <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 mb-2">Admin</p>
          <h1 className="text-3xl font-semibold">Manage Works</h1>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-16 animate-pulse" />
            ))}
          </div>
        ) : works.length === 0 ? (
          <p className="text-gray-400 text-sm tracking-widest uppercase">No works yet</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-[10px] tracking-[0.18em] uppercase text-gray-400 font-normal">Title</th>
                  <th className="text-left px-6 py-4 text-[10px] tracking-[0.18em] uppercase text-gray-400 font-normal hidden sm:table-cell">Category</th>
                  <th className="text-left px-6 py-4 text-[10px] tracking-[0.18em] uppercase text-gray-400 font-normal hidden sm:table-cell">Subcategory</th>
                  <th className="text-left px-6 py-4 text-[10px] tracking-[0.18em] uppercase text-gray-400 font-normal hidden sm:table-cell">Date</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody>
                {works.map((work) => (
                  <tr key={work.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 font-medium text-[#111]">{work.title}</td>
                    <td className="px-6 py-4 text-gray-400 text-[11px] uppercase tracking-wider hidden sm:table-cell">{work.category}</td>
                    <td className="px-6 py-4 text-gray-400 text-[11px] uppercase tracking-wider hidden sm:table-cell">{work.subcategory}</td>
                    <td className="px-6 py-4 text-gray-400 text-[11px] hidden sm:table-cell">
                      {new Date(work.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 justify-end">
                        <button
                          onClick={() => router.push(`/admin/works/${work.id}`)}
                          className="text-[11px] tracking-[0.14em] uppercase transition-colors duration-200"
                          style={{ color: "#0157ba" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(work)}
                          disabled={deletingId === work.id}
                          className="text-[11px] tracking-[0.14em] uppercase text-gray-400 hover:text-red-400 transition-colors duration-200 disabled:opacity-50"
                        >
                          {deletingId === work.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}