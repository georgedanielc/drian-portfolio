import { DM_Mono, Poppins } from "next/font/google";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
});


const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-bricolage",
});

export const metadata = {
  title: "Drian — Graphic Designer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${mono.variable} ${poppins.variable} ${bricolage.variable}`} style={{ fontFamily: "var(--font-poppins)" }}>
        {children}
      </body>
    </html>
  );
}