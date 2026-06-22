import AgencyLayout from "@/layouts/agency/AgencyLayout";

export default function AgencyRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AgencyLayout>{children}</AgencyLayout>;
}
