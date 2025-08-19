import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface HistoricalDataPoint {
  month: string;
  spendAdjusted: number;
  totalAccounts: number;
  totalRedemptions: number;
  totalSubscribers: number;
  totalTextsSent: number;
}

interface MetricToggle {
  key: keyof Omit<HistoricalDataPoint, 'month'>;
  label: string;
  color: string;
  enabled: boolean;
}

const HistoricalPerformance = () => {
  // Mock data matching 2.0's 12-month rolling pattern
  const historicalData: HistoricalDataPoint[] = [
    { month: 'Aug 2024', spendAdjusted: 3.5, totalAccounts: 800, totalRedemptions: 120, totalSubscribers: 1.2, totalTextsSent: 4.5 },
    { month: 'Sep 2024', spendAdjusted: 3.7, totalAccounts: 850, totalRedemptions: 140, totalSubscribers: 1.25, totalTextsSent: 4.7 },
    { month: 'Oct 2024', spendAdjusted: 4.1, totalAccounts: 900, totalRedemptions: 180, totalSubscribers: 1.3, totalTextsSent: 4.8 },
    { month: 'Nov 2024', spendAdjusted: 4.3, totalAccounts: 950, totalRedemptions: 200, totalSubscribers: 1.35, totalTextsSent: 4.9 },
    { month: 'Dec 2024', spendAdjusted: 4.5, totalAccounts: 980, totalRedemptions: 220, totalSubscribers: 1.4, totalTextsSent: 5.0 },
    { month: 'Jan 2025', spendAdjusted: 4.7, totalAccounts: 1000, totalRedemptions: 240, totalSubscribers: 1.45, totalTextsSent: 5.1 },
    { month: 'Feb 2025', spendAdjusted: 4.3, totalAccounts: 950, totalRedemptions: 210, totalSubscribers: 1.42, totalTextsSent: 4.9 },
    { month: 'Mar 2025', spendAdjusted: 4.6, totalAccounts: 980, totalRedemptions: 250, totalSubscribers: 1.48, totalTextsSent: 5.0 },
    { month: 'Apr 2025', spendAdjusted: 4.8, totalAccounts: 1020, totalRedemptions: 270, totalSubscribers: 1.5, totalTextsSent: 5.2 },
    { month: 'May 2025', spendAdjusted: 5.0, totalAccounts: 1050, totalRedemptions: 280, totalSubscribers: 1.52, totalTextsSent: 5.3 },
    { month: 'Jun 2025', spendAdjusted: 5.1, totalAccounts: 1080, totalRedemptions: 290, totalSubscribers: 1.55, totalTextsSent: 5.4 },
    { month: 'Jul 2025', spendAdjusted: 5.3, totalAccounts: 1100, totalRedemptions: 300, totalSubscribers: 1.58, totalTextsSent: 5.5 }
  ];

  const [metrics, setMetrics] = useState<MetricToggle[]>([
    { key: 'spendAdjusted', label: 'Spend Adjusted', color: '#8b5cf6', enabled: true },
    { key: 'totalAccounts', label: 'Total Accounts', color: '#f59e0b', enabled: true },
    { key: 'totalRedemptions', label: 'Total Redemptions', color: '#10b981', enabled: true },
    { key: 'totalSubscribers', label: 'Total Subscribers', color: '#3b82f6', enabled: true },
    { key: 'totalTextsSent', label: 'Total Texts Sent', color: '#ef4444', enabled: true }
  ]);

  const toggleMetric = (key: keyof Omit<HistoricalDataPoint, 'month'>) => {
    setMetrics(prev => prev.map(metric => 
      metric.key === key ? { ...metric, enabled: !metric.enabled } : metric
    ));
  };

  const formatValue = (value: number, key: string) => {
    if (key.includes('Spend') || key.includes('Subscribers')) {
      return `${value}M`;
    }
    if (key.includes('Texts')) {
      return `${value}M`;
    }
    return value.toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Historical Performance</h2>
        <p className="text-gray-600 text-sm">Performance Tracking Across Primary Metrics | Rolling 12 months</p>
      </div>

      {/* Metric Selection Toggles */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Select Metrics to Display:</p>
        <div className="flex flex-wrap gap-3">
          {metrics.map((metric) => (
            <button
              key={metric.key}
              onClick={() => toggleMetric(metric.key)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                metric.enabled
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: metric.enabled ? metric.color : '#d1d5db' }}
              />
              <span>{metric.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historicalData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              fontSize={12}
              tickMargin={10}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number, name: string) => [
                formatValue(value, name),
                metrics.find(m => m.key === name)?.label || name
              ]}
              labelStyle={{ color: '#374151', fontWeight: 'medium' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => metrics.find(m => m.key === value)?.label || value}
            />
            
            {/* Dynamic Lines based on enabled metrics */}
            {metrics
              .filter(metric => metric.enabled)
              .map((metric) => (
                <Line
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  stroke={metric.color}
                  strokeWidth={2}
                  dot={{ r: 4, fill: metric.color }}
                  activeDot={{ r: 6, fill: metric.color }}
                />
              ))
            }
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoricalPerformance;