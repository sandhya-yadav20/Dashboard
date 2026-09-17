import type { Metadata } from "next";
import { Caveat, Nunito } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { IssuesProvider } from "@/lib/issues-context";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CampusFix v2.0 — Doodle Board",
  description: "Real-time campus repairs notice board",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} ${caveat.variable} h-full`}>
      <body className="min-h-full antialiased">
        <AuthProvider>
          <IssuesProvider>{children}</IssuesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
