"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

import { Mail } from "lucide-react";

const CATEGORIES = [
  { slug: "branding", label: "Branding", series: "01", accent: "#0157ba" },
  { slug: "illustration", label: "Illustration", series: "02", accent: "#0157ba" },
  { slug: "social-media", label: "Social Media", series: "03", accent: "#0157ba" },
  { slug: "photography", label: "Photography", series: "04", accent: "#0157ba" },
  { slug: "others", label: "Others", series: "05", accent: "#0157ba" },
];

export default function HomePage() {
  const router = useRouter();
  const cardsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [covers, setCovers] = useState<Record<string, string>>({});
  const [subcats, setSubcats] = useState<Record<string, string[]>>({});

  useEffect(() => {
    cardsRef.current.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
      setTimeout(() => {
        el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, 120 + i * 80);
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
  const results = await Promise.all(
    CATEGORIES.map(async (cat) => {
      const { count } = await supabase
        .from("works")
        .select("*", { count: "exact", head: true })
        .eq("category", cat.slug);

      const { data: coverData } = await supabase
        .from("works")
        .select("cover_image")
        .eq("category", cat.slug)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const { data: subcatData } = await supabase
        .from("works")
        .select("subcategory")
        .eq("category", cat.slug);

      const uniqueSubcats = [...new Set((subcatData ?? []).map((w) => w.subcategory).filter(Boolean))];

      return {
        slug: cat.slug,
        count: count ?? 0,
        cover: coverData?.cover_image ?? null,
        subcats: uniqueSubcats,
      };
    })
  );

  const countMap: Record<string, number> = {};
  const coverMap: Record<string, string> = {};
  const subcatMap: Record<string, string[]> = {};

  results.forEach((r) => {
    countMap[r.slug] = r.count;
    if (r.cover) coverMap[r.slug] = r.cover;
    subcatMap[r.slug] = r.subcats;
  });

  setCounts(countMap);
  setCovers(coverMap);
  setSubcats(subcatMap);
};
fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-[#f4f4f0] text-[#111] flex flex-col">

      <nav className="sticky top-0 z-50 flex items-center justify-center px-6 sm:px-10 py-2 sm:py-3 bg-black" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
  <span style={{ fontFamily: "var(--font-bricolage)", color: "white" }} className="text-2xl sm:text-5xl tracking-wide font-semibold text-center">
    Drian Esquejo
  </span>
  <a href="mailto:georgedanielcavas@gmai.com" className="absolute right-10 flex items-center gap-2 transition-colors duration-200 hover:opacity-70" style={{ color: "white" }}>
    <Mail size={28} />
  </a>
</nav>

      <div className="max-w-4xl mx-auto w-full flex flex-col flex-1 px-6 py-10">

        <div className="pt-2 pb-4 sm:pt-0 sm:pb-8 ">
          <p className="text-[11px] tracking-[0.2em] uppercase mb-3" style={{ fontFamily: "var(--font-mono)", color: "#111111" }}>
            Graphic Designer — Manila
          </p>
        </div>

        <section className="flex-1 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.slug}
                ref={(el) => { cardsRef.current[i] = el; }}
                onClick={() => router.push(`/${cat.slug}`)}
                className="group text-left rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus:outline-none overflow-hidden relative min-h-[360px]  flex flex-col justify-end"
              >
                {/* Blurred bg */}
                {covers[cat.slug] ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center scale-110 transition-transform duration-500 group-hover:scale-125"
                    style={{
                      backgroundImage: `url(${covers[cat.slug]})`,
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "#0157ba22" }}>
                    <span className="text-[10px] tracking-[0.18em] uppercase text-gray-400 text-center">No works yet</span>
                  </div>
                )}

                {/* Details at bottom */}
                <div className="relative z-10 bg-white">
                  <div className="h-1 w-full" style={{ backgroundColor: cat.accent }} />
                  <div className="p-6">
                    <p className="text-2xl sm:text-3xl font-semibold text-[#111] mb-1">
                      {cat.label}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {counts[cat.slug] ?? 0} works
                    </p>
                    {subcats[cat.slug]?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {subcats[cat.slug].map((sub) => (
                          <span
                          key={sub}
                          onClick={(e) => {
                            e.stopPropagation(); 
                            router.push(`/${cat.slug}?filter=${encodeURIComponent(sub)}`);
                          }}
                          className="text-[9px] tracking-[0.12em] uppercase px-2 py-1 rounded-full border border-gray-200 text-gray-400 hover:border-[#0157ba] hover:text-[#0157ba] transition-all duration-200 cursor-pointer"
                        >
                          {sub}
                        </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <footer className="py-6 border-t border-gray-200 flex items-center justify-between">
          <p className="text-[11px] tracking-[0.1em] uppercase text-gray-400">&copy; 2026 &middot; GCavas</p>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-[11px] tracking-[0.1em] uppercase text-gray-400 hover:text-[#0157ba] transition-colors duration-200">
            Instagram
          </a>
        </footer>

      </div>
    </main>
  );
}