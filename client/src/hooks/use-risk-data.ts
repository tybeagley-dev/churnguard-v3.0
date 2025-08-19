import { useQuery } from "@tanstack/react-query";

export interface DashboardAnalytics {
  totalAccounts: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  totalRevenue: number;
  revenueAtRisk: number;
  weeklyTrends: Array<{
    week: string;
    totalSpend: number;
    totalTexts: number;
    activeAccounts: number;
    churnedAccounts: number;
  }>;
}

export function useDashboardAnalytics() {
  return useQuery<DashboardAnalytics>({
    queryKey: ["/api/analytics/dashboard"],
  });
}
