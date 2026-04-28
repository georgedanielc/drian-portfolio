"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Work = {
  id: string;
  title: string;
  description: string;
  category: string;
  cover_image: string;
  images: string[];
  slug: string;
  created_at: string;
};

export default function WorkDetailPage() {
  const params = useParams();
  const category = (params?.category as string) ?? "";
  const slug = (params?.slug as string) ?? "";
  const router = useRouter();

  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const label = category.charAt(0).toUpperCase() + category.slice(1);

  useEffect(() => {
    const fetchWork = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("works")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) console.error(error);
      setWork(data);
      setLoading(false);
    };
    if (slug) fetchWork();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] flex flex-col">
        <nav className="relative flex items-center justify-center px-6 sm:px-10 py-4 sm:py-6 bg-white" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
          <span style={{ fontFamily: "var(--font-mono)", color: "#0157ba" }} className="text-lg sm:text-3xl tracking-wide font-medium">
            Drian Clemence Esquejo
          </span>
        </nav>
        <div className="max-w-4xl mx-auto w-full px-6 py-10">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-10" />
          <div className="h-96 bg-white rounded-xl animate-pulse mb-4" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
        </div>
      </main>
    );
  }

  if (!work) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center">
        <p className="text-gray-400 text-sm tracking-widest uppercase">Work not found</p>
        <button onClick={() => router.push("/")} className="mt-4 text-[11px] tracking-[0.14em] uppercase transition-colors duration-200" style={{ color: "#0157ba" }}>
          ← Back to Home
        </button>
      </main>
    );
  }

  const allImages = [work.cover_image, ...(work.images ?? [])].filter(Boolean);

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#111] flex flex-col">

      {/* Navbar */}
      <nav className="relative flex items-center justify-center px-6 sm:px-10 py-4 sm:py-6 bg-white" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <span style={{ fontFamily: "var(--font-mono)", color: "#0157ba" }} className="text-lg sm:text-3xl tracking-wide font-medium text-center">
          Drian Clemence Esquejo
        </span>
        <a href="mailto:hello@juandelacruz.com" className="sm:absolute sm:right-10 text-[11px] tracking-[0.14em] uppercase transition-colors duration-200" style={{ color: "#0157ba" }}>
          Contact
        </a>
      </nav>

      <div className="max-w-4xl mx-auto w-full px-6 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <button onClick={() => router.push("/")} className="text-[11px] tracking-[0.14em] uppercase text-gray-400 hover:text-[#0157ba] transition-colors duration-200">
            Home
          </button>
          <span className="text-gray-300 text-[11px]">→</span>
          <button onClick={() => router.push(`/${category}`)} className="text-[11px] tracking-[0.14em] uppercase text-gray-400 hover:text-[#0157ba] transition-colors duration-200">
            {label}
          </button>
          <span className="text-gray-300 text-[11px]">→</span>
          <span className="text-[11px] tracking-[0.14em] uppercase" style={{ color: "#0157ba" }}>
            {work.title}
          </span>
        </div>

        {/* Cover image */}
        <div className="w-full rounded-xl overflow-hidden shadow-sm mb-8 bg-white">
          <img
            src={work.cover_image}
            alt={work.title}
            className="w-full max-h-[520px] object-cover cursor-pointer hover:opacity-95 transition-opacity duration-200"
            onClick={() => setSelectedImage(work.cover_image)}
          />
        </div>

        {/* Title + description */}
        <div className="mb-10">
          <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 mb-2">{label}</p>
          <h1 className="text-3xl sm:text-4xl font-semibold mb-4">{work.title}</h1>
          {work.description && (
            <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">{work.description}</p>
          )}
        </div>

        {/* Additional images grid */}
        {work.images && work.images.length > 0 && (
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 mb-4">More</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {work.images.map((img, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden shadow-sm bg-white cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} alt={`${work.title} ${i + 1}`} className="w-full h-40 object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
<div className="mt-16 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
  <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 mb-2">Contact</p>
  <h2 className="text-2xl font-semibold mb-1">Get in Touch</h2>
  <p className="text-gray-400 text-sm mb-8">I'd love to hear from you! Send a message below.</p>

  <div className="flex flex-col gap-4">
    <div>
      <label className="text-[11px] tracking-[0.14em] uppercase text-gray-400 mb-2 block">Name</label>
      <input
        type="text"
        id="contact-name"
        placeholder="Your name"
        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0157ba] transition-colors duration-200"
      />
    </div>
    <div>
      <label className="text-[11px] tracking-[0.14em] uppercase text-gray-400 mb-2 block">Email</label>
      <input
        type="email"
        id="contact-email"
        placeholder="your@email.com"
        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0157ba] transition-colors duration-200"
      />
    </div>
    <div>
      <label className="text-[11px] tracking-[0.14em] uppercase text-gray-400 mb-2 block">Message</label>
      <textarea
        id="contact-message"
        placeholder="Tell me about your project..."
        rows={4}
        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0157ba] transition-colors duration-200 resize-none"
      />
    </div>
    <button
      onClick={() => {
        const name = (document.getElementById("contact-name") as HTMLInputElement).value;
        const email = (document.getElementById("contact-email") as HTMLInputElement).value;
        const message = (document.getElementById("contact-message") as HTMLTextAreaElement).value;
        const subject = encodeURIComponent("Portfolio Inquiry");
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
        const gmail = `https://mail.google.com/mail/?view=cm&to=drian.esquejo@gmail.com&su=${subject}&body=${body}`;
window.open(gmail, "_blank");
      }}
      className="w-full py-4 rounded-lg text-white text-[11px] tracking-[0.14em] uppercase transition-opacity duration-200 hover:opacity-80"
      style={{ backgroundColor: "#0157ba" }}
    >
      Send Message
    </button>
  </div>
</div>

        {/* Footer */}
        <footer className="mt-16 py-6 border-t border-gray-200 flex items-center justify-between">
          <p className="text-[11px] tracking-[0.1em] uppercase text-gray-400">&copy; 2025</p>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-[11px] tracking-[0.1em] uppercase text-gray-400 hover:text-[#0157ba] transition-colors duration-200">
            Instagram
          </a>
        </footer>

      </div>

      {/* FAB */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:border-[#0157ba] hover:text-[#0157ba] transition-all duration-200 text-gray-400"
      >
        ↑
      </button>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center px-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full view"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white/60 hover:text-white text-2xl transition-colors duration-200"
          >
            ✕
          </button>
        </div>
      )}

    </main>
  );
}