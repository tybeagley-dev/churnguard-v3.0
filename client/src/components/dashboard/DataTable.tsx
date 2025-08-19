import { useState } from "react";
import { AlertTriangle, TrendingUp, TrendingDown, ChevronLeft,
ChevronRight, Search } from "lucide-react";

interface ChurnGuardAccount {
  id: number;
  name: string;
  location: string;
  monthlyRevenue: number;
  currentSpend: number;
  previousSpend: number;
  textsSent: number;
  couponsRedeemed: number;
  subscriberCount: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  csmName: string;
  flags: string[];
}

interface DataTableProps {
  accounts?: ChurnGuardAccount[];
  isLoading: boolean;
}

export default function DataTable({ accounts = [], isLoading }: 
DataTableProps) {
  const [activeTab, setActiveTab] = useState("weekly");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string;
direction: 'asc' | 'desc' } | null>(null);

  const itemsPerPage = 10;

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction
 === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||

account.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.csmName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = a[sortConfig.key as keyof ChurnGuardAccount];
    const bValue = b[sortConfig.key as keyof ChurnGuardAccount];

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedAccounts.length /
itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAccounts = sortedAccounts.slice(startIndex,
endIndex);

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getSpendTrend = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      percentage: change.toFixed(1),
      isPositive: change >= 0,
      icon: change >= 0 ? TrendingUp : TrendingDown
    };
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border 
border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold 
text-slate-900">ChurnGuard Account Metrics</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-slate-200 rounded 
animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border 
border-slate-200">
      {/* Header with Tabs */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold 
text-slate-900">ChurnGuard Account Metrics</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300
rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
focus:border-transparent"
            />
            <Search className="w-4 h-4 absolute left-3 top-3 
text-slate-400" />
          </div>
        </div>

        {/* Custom folder-style tabs */}
        <div className="flex justify-start">
          <div className="flex">
            <button
              onClick={() => setActiveTab("weekly")}
              className={`px-6 py-3 rounded-t-lg border-t border-l
border-r font-medium text-sm transition-colors relative ${
                activeTab === "weekly"
                  ? "bg-white text-slate-900 border-slate-300 z-10"
                  : "bg-slate-100 text-slate-600 border-slate-200
hover:text-slate-900 hover:bg-slate-50"
              }`}
              style={{
                borderBottom: activeTab === "weekly" ? "1px solid
white" : "1px solid #d1d5db",
                marginBottom: "-1px"
              }}
            >
              Weekly View
            </button>
            <button
              onClick={() => setActiveTab("monthly")}
              className={`px-6 py-3 rounded-t-lg border-t border-l
border-r font-medium text-sm transition-colors relative -ml-px ${
                activeTab === "monthly"
                  ? "bg-white text-slate-900 border-slate-300 z-10"
                  : "bg-slate-100 text-slate-600 border-slate-200
hover:text-slate-900 hover:bg-slate-50"
              }`}
              style={{
                borderBottom: activeTab === "monthly" ? "1px solid
white" : "1px solid #d1d5db",
                marginBottom: "-1px"
              }}
            >
              Monthly View
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto" style={{ borderTop: "1px 
solid #d1d5db" }}>
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium 
text-slate-500 uppercase tracking-wider cursor-pointer 
hover:bg-slate-100"
                onClick={() => handleSort('name')}
              >
                Restaurant
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium 
text-slate-500 uppercase tracking-wider cursor-pointer 
hover:bg-slate-100"
                onClick={() => handleSort('riskScore')}
              >
                Risk Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium
 text-slate-500 uppercase tracking-wider">
                {activeTab === "weekly" ? "Weekly Spend" : "Monthly
Revenue"}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium
 text-slate-500 uppercase tracking-wider">
                Engagement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium
 text-slate-500 uppercase tracking-wider">
                CSM
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium
 text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {currentAccounts.map((account) => {
              const trend = getSpendTrend(account.currentSpend,
account.previousSpend);
              const TrendIcon = trend.icon;

              return (
                <tr key={account.id} className="hover:bg-slate-50 
transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium 
text-slate-900">{account.name}</div>
                      <div className="text-sm 
text-slate-500">{account.location}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-semibold 
text-slate-900 mr-2">
                        {account.riskScore}
                      </span>
                      <span className={`px-2 py-1 text-xs 
font-medium rounded-full border 
${getRiskBadgeColor(account.riskLevel)}`}>
                        {account.riskLevel.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold 
text-slate-900">
                      ${account.currentSpend.toLocaleString()}
                    </div>
                    <div className="flex items-center text-xs">
                      <TrendIcon className={`w-3 h-3 mr-1 
${trend.isPositive ? 'text-green-500' : 'text-red-500'}`} />
                      <span className={trend.isPositive ? 
'text-green-600' : 'text-red-600'}>
                        {trend.percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {account.textsSent} texts |
{account.couponsRedeemed} coupons
                    </div>
                    <div className="text-xs text-slate-500">
                      {account.subscriberCount} subscribers
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm
 text-slate-900">
                    {account.csmName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm
 font-medium">
                    <button className="text-blue-600 
hover:text-blue-900 mr-3">View Details</button>
                    {account.riskLevel === 'high' && (
                      <button className="text-red-600 
hover:text-red-900">
                        <AlertTriangle className="w-4 h-4 inline 
mr-1" />
                        Alert
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-slate-200 flex 
items-center justify-between">
        <div className="text-sm text-slate-600">
          Showing <span className="font-medium">{startIndex +
1}</span> to{' '}
          <span className="font-medium">{Math.min(endIndex,
sortedAccounts.length)}</span> of{' '}
          <span 
className="font-medium">{sortedAccounts.length}</span> restaurants
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1,
 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm font-medium text-slate-600
hover:text-slate-900 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) =>
 {
            const pageNumber = i + 1;
            return (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`px-3 py-1 text-sm font-medium rounded-md
 ${
                  currentPage === pageNumber
                    ? 'text-white bg-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1,
 totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm font-medium text-slate-600
hover:text-slate-900 disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}