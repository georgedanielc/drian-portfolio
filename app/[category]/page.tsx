"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 6;

const SUBCATEGORIES: Record<string, string[]> = {
  branding: ["All", "Logo Design", "Package Design", "Banner Design"],
  illustration: ["All", "Digital Illustration", "Pen & Ink", "Digital Drawing"],
  "social-media": ["All", "Social Media", "Pinterest Template", "Poster Design"],
  photography: ["All", "Photography"],
  others: ["All", "Others"],
};

type Work = {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  cover_image: string;
  slug: string;
  created_at: string;
};

export default function CategoryPage() {
  const params = useParams();
  const category = (params?.category as string) ?? "";
  const router = useRouter();

  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showFab, setShowFab] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const pageRef = useRef(0);

  const label = category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const subcategories = SUBCATEGORIES[category] ?? ["All"];

  const fetchWorks = useCallback(async (page: number, filter: string) => {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("works")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (filter !== "All") {
      query = query.eq("subcategory", filter);
    }

    const { data, error } = await query;
    if (error) console.error(error);
    return data ?? [];
  }, [category]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const data = await fetchWorks(0, activeFilter);
      setWorks(data);
      setHasMore(data.length === PAGE_SIZE);
      pageRef.current = 0;
      setLoading(false);
    };
    init();
  }, [fetchWorks, activeFilter]);

  useEffect(() => {
    const handleScroll = () => setShowFab(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = pageRef.current + 1;
    const data = await fetchWorks(nextPage, activeFilter);
    setWorks((prev) => [...prev, ...data]);
    setHasMore(data.length === PAGE_SIZE);
    pageRef.current = nextPage;
    setLoadingMore(false);
  };

  const handleFilter = (filter: string) => {
    setActiveFilter(filter);
    setWorks([]);
  };

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#111] flex flex-col">

      <nav className="relative flex flex-col sm:flex-row items-center justify-center px-6 sm:px-10 py-4 sm:py-6 bg-white gap-1 sm:gap-0" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <span style={{ fontFamily: "var(--font-mono)", color: "#111111" }} className="text-lg sm:text-3xl tracking-wide font-medium text-center">
          Drian Clemence Esquejo
        </span>
        <a href="mailto:hello@juandelacruz.com" className="sm:absolute sm:right-10 text-[11px] tracking-[0.14em] uppercase transition-colors duration-200" style={{ color: "#0157ba" }}>
          Contact
        </a>
      </nav>

      <div className="max-w-4xl mx-auto w-full flex flex-col flex-1 px-6 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <button onClick={() => router.push("/")} className="text-[11px] tracking-[0.14em] uppercase text-gray-400 hover:text-[#0157ba] transition-colors duration-200">
            Home
          </button>
          <span className="text-gray-300 text-[11px]">→</span>
          <span className="text-[11px] tracking-[0.14em] uppercase" style={{ color: "#0157ba" }}>
            {label}
          </span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 mb-2">Works</p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#111]">{label}</h1>
        </div>

        {/* Subcategory filters */}
        {subcategories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => handleFilter(sub)}
                className="px-4 py-2 rounded-full text-[11px] tracking-[0.12em] uppercase border transition-all duration-200"
                style={{
                  backgroundColor: activeFilter === sub ? "#0157ba" : "white",
                  color: activeFilter === sub ? "white" : "#888",
                  borderColor: activeFilter === sub ? "#0157ba" : "#e5e7eb",
                }}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : works.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-24">
            <p className="text-gray-400 text-sm tracking-widest uppercase">No works yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {works.map((work) => (
              <button
                key={work.id}
                onClick={() => router.push(`/${category}/${work.slug}`)}
                className="group text-left bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-300"
              >
                <div className="w-full h-48 bg-gray-100 overflow-hidden">
                  {work.cover_image ? (
                    <img src={work.cover_image} alt={work.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-300 text-xs uppercase tracking-widest">No image</span>
                    </div>
                  )}
                </div>
                <div className="h-1 w-full" style={{ backgroundColor: "#0157ba" }} />
                <div className="p-5">
                  {work.subcategory && (
                    <p className="text-[10px] tracking-[0.14em] uppercase text-gray-400 mb-1">{work.subcategory}</p>
                  )}
                  <p className="font-semibold text-[#111] mb-1">{work.title}</p>
                  <p className="text-[11px] text-gray-400 line-clamp-2">{work.description}</p>
                  <div className="mt-4 flex justify-end">
                    <span className="text-gray-300 group-hover:text-[#0157ba] transition-all duration-300 text-xl group-hover:translate-x-1 inline-block">
                      &#8594;
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-8 py-3 text-[11px] tracking-[0.14em] uppercase border border-gray-200 rounded-full text-gray-400 hover:border-[#0157ba] hover:text-[#0157ba] transition-all duration-200 disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}

        <footer className="mt-16 py-6 border-t border-gray-200 flex items-center justify-between">
          <p className="text-[11px] tracking-[0.1em] uppercase text-gray-400">&copy; 2025</p>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-[11px] tracking-[0.1em] uppercase text-gray-400 hover:text-[#0157ba] transition-colors duration-200">
            Instagram
          </a>
        </footer>

      </div>

      {showFab && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:border-[#0157ba] hover:text-[#0157ba] transition-all duration-200 text-gray-400"
        >
          ↑
        </button>
      )}

    </main>
  );
}