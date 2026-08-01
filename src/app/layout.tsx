import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Ensure your tailwind/css file is imported here
import MainLayoutWrapper from "@/components/layouts/MainLayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tennacy | Unified Property Management & Marketplace",
  description: "Discover rental homes, commercial spaces, and short stays. Manage properties seamlessly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {/* 
          This wrapper handles the Navbar, Footer, and Wizard-hiding logic globally.
          Every page inside {children} is now automatically wrapped by it.
        */}
        <MainLayoutWrapper>
          {children}
        </MainLayoutWrapper>
      </body>
    </html>
  );
}