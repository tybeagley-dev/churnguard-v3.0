import { useState, useEffect } from "react";
  import { Users, AlertTriangle, DollarSign } from "lucide-react";
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

  useEffect(() => {
    fetchAccounts("weekly");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          ChurnGuard 
        </h1>
        <p className="text-gray-600">Restaurant churn risk monitoring</p>
      </header>

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
  );
}
