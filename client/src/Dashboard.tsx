import { useState, useEffect } from "react";
  import { Users, AlertTriangle, DollarSign, RefreshCw, Settings, LogOut, BarChart3 } from "lucide-react";
  import BigQuerySummaryCards from "@/components/dashboard/bigquery-summary-cards";
  import { useDashboardAnalytics } from "@/hooks/use-ri";

interface AccountData {
  account_id: string;
  account_name: string;
  csm_owner: string;
  total_spend: number;
  total_texts_delivered: number;
  coupons_redeemed: number;
  active_subs_cnt: number;
  spend_delta?: number;
  risk_level?: "high" | "medium" | "low";
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

      {/* Tab Controls */}
      <div className="flex justify-start mb-4">
        <div className="flex">
          <button
            onClick={() => handleTabChange("weekly")}
            className={`px-6 py-3 rounded-t-lg border-t border-l border-r font-medium text-sm transition-colors relative ${
              activeTab === "weekly"
                ? "bg-white text-gray-900 border-gray-300 z-10"
                : "bg-gray-100 text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Weekly View
          </button>
          <button
            onClick={() => handleTabChange("monthly")}
            className={`px-6 py-3 rounded-t-lg border-t border-l border-r font-medium text-sm transition-colors relative -ml-px ${
              activeTab === "monthly"
                ? "bg-white text-gray-900 border-gray-300 z-10"
                : "bg-gray-100 text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Monthly View
          </button>
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          {activeTab === "weekly" ? "Weekly" : "Monthly"} Account Metrics
        </h2>

        {loading && (
          <p className="text-gray-500">Loading {activeTab} data...</p>
        )}

        {!loading && accounts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-medium">Account</th>
                  <th className="text-left py-2 px-4 font-medium">CSM</th>
                  <th className="text-right py-2 px-4 font-medium">Spend</th>
                  <th className="text-right py-2 px-4 font-medium">Texts</th>
                  <th className="text-right py-2 px-4 font-medium">Coupons</th>
                  <th className="text-right py-2 px-4 font-medium">Subs</th>
                  <th className="text-center py-2 px-4 font-medium">Risk</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr
                    key={account.account_id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-2 px-4 font-medium">
                      {account.account_name}
                    </td>
                    <td className="py-2 px-4 text-gray-600">
                      {account.csm_owner}
                    </td>
                    <td className="py-2 px-4 text-right">
                      ${account.total_spend.toLocaleString()}
                    </td>
                    <td className="py-2 px-4 text-right">
                      {account.total_texts_delivered.toLocaleString()}
                    </td>
                    <td className="py-2 px-4 text-right">
                      {account.coupons_redeemed.toLocaleString()}
                    </td>
                    <td className="py-2 px-4 text-right">
                      {account.active_subs_cnt.toLocaleString()}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          account.risk_level === "high"
                            ? "bg-red-100 text-red-800"
                            : account.risk_level === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {account.risk_level || "low"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && accounts.length === 0 && (
          <p className="text-gray-500">No {activeTab} data available</p>
        )}
      </div>
      </div>
    </div>
  );
}
