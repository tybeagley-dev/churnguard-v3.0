import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, DollarSign, AlertTriangle, Activity } from "lucide-react";
import { DashboardAnalytics } from "@/hooks/use-risk-data";

interface BigQuerySummaryCardsProps {
  analytics: DashboardAnalytics | null;
}

export default function BigQuerySummaryCards({ analytics }: BigQuerySummaryCardsProps) {
  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatNumber = (num: number) =>
    new Intl.NumberFormat('en-US').format(Math.round(num));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Total Accounts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(analytics.totalAccounts)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Active restaurant clients
          </p>
        </CardContent>
      </Card>

      {/* High Risk Accounts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">High Risk</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatNumber(analytics.highRiskCount)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {analytics.totalAccounts > 0 ? ((analytics.highRiskCount / analytics.totalAccounts) * 100).toFixed(1) :
 0}% of total accounts
          </p>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Monthly recurring revenue
          </p>
        </CardContent>
      </Card>
    </div>
  );
}