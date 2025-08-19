import { useState, useEffect } from "react";
  import { Users, AlertTriangle, DollarSign, RefreshCw, Settings, LogOut, BarChart3 } from "lucide-react";
  import BigQuerySummaryCards from "@/components/dashboard/bigquery-summary-cards";
  import HistoricalPerformance from "@/components/dashboard/HistoricalPerformance";
  import MonthlyTrends from "@/components/dashboard/MonthlyTrends";
  import EnhancedAccountTable from "@/components/dashboard/EnhancedAccountTable";
  import { useDashboardAnalytics } from "@/hooks/use-ri";

interface AccountData {
  account_id: string;
  account_name: string;
  csm_owner: string;
  status: 'LAUNCHED' | 'PAUSED' | 'PENDING';
  total_spend: number;
  spend_delta: number;
  total_texts_delivered: number;
  texts_delta: number;
  coupons_redeemed: number;
  redemptions_delta: number;
  active_subs_cnt: number;
  risk_level: "high" | "medium" | "low";
}

export default function Dashboard() {
  console.log("Dashboard component is rendering!");

  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState(45);

  // Add the professional analytics hook
  const { data: analytics, isLoading: analyticsLoading } = useDashboardAnalytics();

  const fetchAccounts = async (period: "weekly" | "monthly") => {
    setLoading(true);
    try {
      const response = await fetch(`/api/accounts?period=${period}`);
      const data = await response.json();
      setAccounts(data);
      console.log(`${period} accounts loaded:`, data.length);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: "weekly" | "monthly") => {
    setActiveTab(tab);
    fetchAccounts(tab);
  };

  // Auto-refresh countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          setRefreshing(true);
          fetchAccounts(activeTab);
          setTimeout(() => setRefreshing(false), 2000);
          return 45; // Reset countdown
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    fetchAccounts("weekly");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header matching 2.0 design */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">ChurnGuard</h1>
            </div>
            
            {/* Refresh indicator matching 2.0 */}
            <div className="flex items-center space-x-2 text-sm">
              <RefreshCw className={`h-4 w-4 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-blue-600">
                {refreshing ? 'Refreshing latest data...' : `Refreshing latest data... ~${refreshCountdown}s`}
              </span>
            </div>
          </div>

          {/* Right side - Navigation */}
          <div className="flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              <button className="flex items-center space-x-2 text-blue-600 font-medium">
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="p-6">

      {/* Professional Summary Cards */}
      <BigQuerySummaryCards analytics={analytics || null} />

      {/* Historical Performance Charts */}
      <HistoricalPerformance />

      {/* Monthly Trends Bar Charts */}
      <MonthlyTrends />

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">High Risk</p>
                <p className="text-3xl font-bold text-red-600">
                  {accounts.filter((a) => a.risk_level === "high").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-green-600">
                  $
                  {accounts
                    .reduce((sum, a) => sum + a.total_spend, 0)
                    .toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Account Data Table */}
      <EnhancedAccountTable accounts={accounts} loading={loading} />
      </div>
    </div>
  );
}
