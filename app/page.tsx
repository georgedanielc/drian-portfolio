"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  { slug: "branding", label: "Branding", series: "01", accent: "#c8b89a" },
  { slug: "illustration", label: "Illustration", series: "02", accent: "#7fb5a0" },
  { slug: "social-media", label: "Social Media", series: "03", accent: "#a08fc8" },
  { slug: "photography", label: "Photography", series: "04", accent: "#f4a261" },
  { slug: "others", label: "Others", series: "05", accent: "#e76f51" },
];

export default function HomePage() {
  const router = useRouter();
  const cardsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

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
    const fetchCounts = async () => {
      const results = await Promise.all(
        CATEGORIES.map(async (cat) => {
          const { count } = await supabase
            .from("works")
            .select("*", { count: "exact", head: true })
            .eq("category", cat.slug);
          return { slug: cat.slug, count: count ?? 0 };
        })
      );
      const map: Record<string, number> = {};
      results.forEach((r) => (map[r.slug] = r.count));
      setCounts(map);
    };
    fetchCounts();
  }, []);

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

        <div className="pt-10 pb-8">
          <p className="text-[11px] tracking-[0.2em] uppercase mb-3" style={{ color: "#0157ba" }}>
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
                className="group text-left bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-300 overflow-hidden"
              >
                <div className="h-1 w-full" style={{ backgroundColor: "#0157ba" }} />
                <div className="p-7 sm:p-8">
                  <p className="text-[10px] tracking-[0.18em] uppercase text-gray-400 mb-2">
                    Series {cat.series}
                  </p>
                  <p className="text-2xl sm:text-3xl font-semibold text-[#111] mb-1">
                    {cat.label}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {counts[cat.slug] ?? 0} works
                  </p>
                  <div className="mt-6 flex justify-end">
                    <span className="text-gray-300 group-hover:text-[#0157ba] transition-all duration-300 text-2xl group-hover:translate-x-1 inline-block">
                      &#8594;
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <footer className="py-6 border-t border-gray-200 flex items-center justify-between">
          <p className="text-[11px] tracking-[0.1em] uppercase text-gray-400">&copy; 2025</p>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-[11px] tracking-[0.1em] uppercase text-gray-400 hover:text-[#0157ba] transition-colors duration-200">
            Instagram
          </a>
        </footer>

      </div>
    </main>
  );
}