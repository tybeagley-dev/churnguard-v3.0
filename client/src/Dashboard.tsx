import { useState, useEffect } from "react";
  import { BarChart3, Settings, LogOut } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import BigQuerySummaryCards from "@/components/dashboard/bigquery-summary-cards";
  import HistoricalPerformance from "@/components/dashboard/HistoricalPerformance";
  import MonthlyTrends from "@/components/dashboard/MonthlyTrends";
  import EnhancedAccountTable from "@/components/dashboard/EnhancedAccountTable";
  import RiskScoringLegend from "@/components/dashboard/RiskScoringLegend";

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
  // Production mode: Use real API data
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState(45);

  // Mock analytics data for now
  const analytics = null;

  const fetchAccounts = async (period: "weekly" | "monthly") => {
    setLoading(true);
    try {
      const response = await fetch(`/api/accounts?period=${period}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.status}`);
      }
      const data = await response.json();
      setAccounts(data);
      console.log(`${period} accounts loaded:`, data.length);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      // Don't retry automatically to prevent reload loops
      setAccounts([]);
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

  // Initial data fetch
  useEffect(() => {
    fetchAccounts("weekly");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar matching 2.0 design exactly */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#0408e7]">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">ChurnGuard</h1>
            </div>
            
            {/* Navigation Links and Logout - Right Justified */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-8">
                <div className="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer text-primary bg-blue-50">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </div>
                <div className="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </div>
              </div>
              
              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="w-full">
          {/* Notification Bar - Matching 2.0 */}
          <div className="mb-6 bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Daily refresh already checked today
          </div>

          {/* Professional Summary Cards */}
          <div className="mb-8">
            <BigQuerySummaryCards analytics={analytics || null} />
          </div>

          {/* Historical Performance Charts */}
          <div className="mb-6">
            <HistoricalPerformance />
          </div>

          {/* Monthly Trends Bar Charts */}
          <div className="mb-6">
            <MonthlyTrends />
          </div>
          
          {/* Custom folder-style tabs */}
          <div className="flex justify-start">
            <div className="flex">
              <button
                onClick={() => handleTabChange("weekly")}
                className={`px-6 py-3 rounded-t-lg border-t border-l border-r font-medium text-sm transition-colors relative ${
                  activeTab === "weekly"
                    ? "bg-white text-gray-900 border-gray-300 z-10"
                    : "bg-gray-100 text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-50"
                }`}
                style={{ 
                  borderBottom: activeTab === "weekly" ? "1px solid white" : "1px solid #d1d5db",
                  marginBottom: "-1px"
                }}
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
                style={{ 
                  borderBottom: activeTab === "monthly" ? "1px solid white" : "1px solid #d1d5db",
                  marginBottom: "-1px"
                }}
              >
                Monthly View
              </button>
            </div>
          </div>
          
          {/* Tab content - directly connected to tabs */}
          <div className="bg-white border border-gray-300 rounded-lg rounded-tl-none -mt-px">
            <EnhancedAccountTable accounts={accounts} loading={loading} />
          </div>
        </div>

        {/* Risk Scoring Legend - The missing dropdown explainer sections */}
        <RiskScoringLegend />
      </main>
      
      {/* Footer matching 2.0 */}
      <footer className="text-center py-4 text-xs text-purple-800 border-t">
        Certified Bonesaw Product 🪚
      </footer>
    </div>
  );
}
