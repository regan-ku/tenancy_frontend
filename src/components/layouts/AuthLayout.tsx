import React from "react";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-surface-muted">
      {/* Left Branding Panel (Hidden on mobile/tablet) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-dark to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative Aurora Blurs */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary font-bold text-xl">
              T
            </div>
            <span className="text-2xl font-bold text-white">Tennacy</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-extrabold text-white leading-tight">
            {title}
          </h1>
          <p className="text-lg text-white/80">{subtitle}</p>
          <div className="space-y-4 pt-4">
            <FeatureItem
              icon="🏢"
              text="Manage properties, units, and tenants effortlessly."
            />
            <FeatureItem
              icon="💰"
              text="Automated rent collection and financial tracking."
            />
            <FeatureItem
              icon="🛠️"
              text="Streamline maintenance and operational workflows."
            />
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          © 2026 Tennacy. All rights reserved.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 p-8 sm:p-12 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo (Only shows on small screens) */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
                T
              </div>
              <span className="text-2xl font-bold text-primary-dark">
                Tennacy
              </span>
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg backdrop-blur-sm">
        {icon}
      </div>
      <p className="text-white/90 font-medium">{text}</p>
    </div>
  );
}
