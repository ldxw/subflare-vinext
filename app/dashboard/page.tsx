import { requirePageAuth } from "@/lib/session";
import AppLayout from "@/components/app-layout";
import DashboardClient from "@/components/dashboard-client";
import { getDashboardSummary } from "@/lib/dashboard";
import { getExchangeRates } from "@/lib/exchange-rates";

export default async function DashboardPage() {
  const session = await requirePageAuth();
  const [initialData, initialExchangeRates] = await Promise.all([
    getDashboardSummary(session.userId),
    getExchangeRates(),
  ]);

  return (
    <AppLayout>
      <DashboardClient initialData={initialData} initialExchangeRates={initialExchangeRates} />
    </AppLayout>
  );
}
