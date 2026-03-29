import { getDb } from "@/db";
import { subscriptions } from "@/db/schema";
import { requirePageAuth } from "@/lib/session";
import { eq } from "drizzle-orm";
import AppLayout from "@/components/app-layout";
import SubscriptionsClient from "@/components/subscriptions-client";

export default async function SubscriptionsPage() {
  const session = await requirePageAuth();
  const db = await getDb();

  const initialSubscriptions = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, session.userId))
    .orderBy(subscriptions.expireDate);

  return (
    <AppLayout>
      <SubscriptionsClient initialSubscriptions={initialSubscriptions} />
    </AppLayout>
  );
}
