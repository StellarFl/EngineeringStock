import type { Metadata } from "next";

import { EngineeringDashboard } from "@/components/engineering/engineering-dashboard";

export const metadata: Metadata = {
  title: "Overview",
  description: "Engineering inventory, project, and equipment metrics.",
};


export default function DashboardPage() {
  return <EngineeringDashboard />;
}
