// app/marketplace/page.tsx
import { redirect } from "next/navigation";

export default function MarketplaceRedirect() {
  // Instantly redirect anyone visiting /marketplace to the root homepage (/)
  redirect("/");
}