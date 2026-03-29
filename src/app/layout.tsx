import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "GrowthGrid - AI Career Platform for Students & Job Seekers",
  description: "AI-powered platform for students and job seekers in India. Real job listings, government schemes, internships, hackathons, career roadmaps, and eligibility checking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 70px)' }}>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
