import LandlordLayout from "@/layouts/Landlord/LandlordLayout";

export default function LandlordRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LandlordLayout>{children}</LandlordLayout>;
}
