import { Users, AlertTriangle, DollarSign, Activity, TrendingUp,
  TrendingDown } from 'lucide-react';

  interface ChurnGuardAnalytics {
    totalAccounts: number;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
    totalRevenue: number;
    revenueAtRisk: number;
    avgRiskScore: number;
    churnRate: number;
    trendDirection: 'up' | 'down' | 'stable';
    trendPercentage: number;
  }

  interface KPICardsProps {
    analytics?: ChurnGuardAnalytics;
    isLoading: boolean;
  }

  export default function KPICards({ analytics, isLoading }: 
  KPICardsProps) {
    if (isLoading) {
      return (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold 
  text-slate-900">ChurnGuard Dashboard</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 
  lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm 
  border border-slate-200 p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-8 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (!analytics) {
      return (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold 
  text-slate-900">ChurnGuard Dashboard</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 
  lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="bg-white rounded-lg shadow-sm border 
  border-slate-200 p-6">
              <div className="text-center text-gray-500">Loading
  ChurnGuard data...</div>
            </div>
          </div>
        </div>
      );
    }

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const formatNumber = (num: number) => {
      return new Intl.NumberFormat('en-US').format(num);
    };

    const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
      switch (direction) {
        case 'up':
          return <TrendingUp className="h-3 w-3 text-red-500 mr-1" />;
        case 'down':
          return <TrendingDown className="h-3 w-3 text-green-500 mr-1"
   />;
        default:
          return <Activity className="h-3 w-3 text-gray-500 mr-1" />;
      }
    };

    const getTrendColor = (direction: 'up' | 'down' | 'stable') => {
      switch (direction) {
        case 'up':
          return 'text-red-500';
        case 'down':
          return 'text-green-500';
        default:
          return 'text-gray-500';
      }
    };

    const riskScoreColor = analytics.avgRiskScore >= 70 ?
  'text-red-600' :
                          analytics.avgRiskScore >= 50 ?
  'text-yellow-600' : 'text-green-600';

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">ChurnGuard
   Dashboard</h2>
          <div className="text-sm text-slate-600">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
   xl:grid-cols-6 gap-4">
          {/* Total Accounts */}
          <div className="bg-white rounded-lg shadow-sm border 
  border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Total
   Accounts</h3>
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {formatNumber(analytics.totalAccounts)}
            </div>
            <p className="text-xs text-slate-500">Active
  restaurants</p>
          </div>

          {/* High Risk Count */}
          <div className="bg-white rounded-lg shadow-sm border 
  border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">High
  Risk</h3>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-600 mb-1">
              {formatNumber(analytics.highRiskCount)}
            </div>
            <p className="text-xs text-slate-500">
              {((analytics.highRiskCount / analytics.totalAccounts) *
  100).toFixed(1)}% of total
            </p>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow-sm border 
  border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Total
   Revenue</h3>
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatCurrency(analytics.totalRevenue)}
            </div>
            <div className="flex items-center text-xs">
              {getTrendIcon(analytics.trendDirection)}
              <span 
  className={getTrendColor(analytics.trendDirection)}>
                {analytics.trendPercentage > 0 ? '+' :
  ''}{analytics.trendPercentage.toFixed(1)}%
              </span>
              <span className="text-slate-500 ml-1">vs last
  month</span>
            </div>
          </div>

          {/* Revenue at Risk */}
          <div className="bg-white rounded-lg shadow-sm border 
  border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium 
  text-slate-600">Revenue at Risk</h3>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {formatCurrency(analytics.revenueAtRisk)}
            </div>
            <p className="text-xs text-slate-500">
              {((analytics.revenueAtRisk / analytics.totalRevenue) *
  100).toFixed(1)}% of total
            </p>
          </div>

          {/* Average Risk Score */}
          <div className="bg-white rounded-lg shadow-sm border 
  border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Avg
  Risk Score</h3>
              <Activity className="h-4 w-4 text-purple-500" />
            </div>
            <div className={`text-2xl font-bold mb-1 
  ${riskScoreColor}`}>
              {analytics.avgRiskScore.toFixed(1)}
            </div>
            <p className="text-xs text-slate-500">
              {analytics.avgRiskScore >= 70 ? 'High Risk' :
               analytics.avgRiskScore >= 50 ? 'Medium Risk' : 'Low Risk'} avg
            </p>
          </div>

          {/* Churn Rate */}
          <div className="bg-white rounded-lg shadow-sm border 
  border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Churn
   Rate</h3>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-600 mb-1">
              {analytics.churnRate.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-500">30-day churn
  rate</p>
          </div>
        </div>
      </div>
    );
  }