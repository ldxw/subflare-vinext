import { z } from "zod";

export const BILLING_CYCLE_VALUES = ["daily", "monthly", "quarterly", "yearly", "once"] as const;

export type BillingCycleValue = (typeof BILLING_CYCLE_VALUES)[number];

export function addBillingCycleCountIssue(
  data: { billingCycle: BillingCycleValue; billingCycleCount?: number },
  ctx: z.RefinementCtx,
  message: string,
) {
  if (data.billingCycle !== "once" && data.billingCycleCount == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["billingCycleCount"],
      message,
    });
  }
}

export function normalizeBillingCycleCount(data: {
  billingCycle: BillingCycleValue;
  billingCycleCount?: number;
}) {
  return data.billingCycle === "once" ? 1 : data.billingCycleCount;
}

export function normalizeAutoRenew(data: {
  billingCycle: BillingCycleValue;
  autoRenew?: boolean;
}) {
  return data.billingCycle === "once" ? false : data.autoRenew;
}
