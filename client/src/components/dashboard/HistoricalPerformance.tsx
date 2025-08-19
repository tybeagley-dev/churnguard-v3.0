import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery } from '@tanstack/react-query';

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
  // Demo mode: Use mock data instead of API calls to prevent reload loops
  const historicalData = [
    { month: 'Jan 2024', spendAdjusted: 2.8, totalAccounts: 145, totalRedemptions: 89, totalSubscribers: 12.4, totalTextsSent: 45 },
    { month: 'Feb 2024', spendAdjusted: 3.1, totalAccounts: 152, totalRedemptions: 94, totalSubscribers: 13.1, totalTextsSent: 48 },
    { month: 'Mar 2024', spendAdjusted: 2.9, totalAccounts: 148, totalRedemptions: 87, totalSubscribers: 12.8, totalTextsSent: 44 },
    { month: 'Apr 2024', spendAdjusted: 3.4, totalAccounts: 159, totalRedemptions: 102, totalSubscribers: 14.2, totalTextsSent: 52 },
    { month: 'May 2024', spendAdjusted: 3.2, totalAccounts: 156, totalRedemptions: 98, totalSubscribers: 13.7, totalTextsSent: 49 },
    { month: 'Jun 2024', spendAdjusted: 3.6, totalAccounts: 163, totalRedemptions: 108, totalSubscribers: 15.1, totalTextsSent: 55 },
    { month: 'Jul 2024', spendAdjusted: 3.8, totalAccounts: 167, totalRedemptions: 112, totalSubscribers: 15.8, totalTextsSent: 58 },
    { month: 'Aug 2024', spendAdjusted: 3.5, totalAccounts: 161, totalRedemptions: 105, totalSubscribers: 14.9, totalTextsSent: 54 },
    { month: 'Sep 2024', spendAdjusted: 3.9, totalAccounts: 171, totalRedemptions: 118, totalSubscribers: 16.2, totalTextsSent: 61 },
    { month: 'Oct 2024', spendAdjusted: 4.1, totalAccounts: 175, totalRedemptions: 125, totalSubscribers: 17.1, totalTextsSent: 64 },
    { month: 'Nov 2024', spendAdjusted: 3.7, totalAccounts: 165, totalRedemptions: 115, totalSubscribers: 15.6, totalTextsSent: 57 },
    { month: 'Dec 2024', spendAdjusted: 4.3, totalAccounts: 182, totalRedemptions: 135, totalSubscribers: 18.4, totalTextsSent: 68 }
  ];
  const isLoading = false;
  const error = null;

  const [metrics, setMetrics] = useState<MetricToggle[]>([
    { key: 'spendAdjusted', label: 'Spend Adjusted', color: '#8b5cf6', enabled: true },
    { key: 'totalAccounts', label: 'Total Accounts', color: '#f97316', enabled: true },
    { key: 'totalRedemptions', label: 'Total Redemptions', color: '#16a34a', enabled: true },
    { key: 'totalSubscribers', label: 'Total Subscribers', color: '#2563eb', enabled: true },
    { key: 'totalTextsSent', label: 'Total Texts Sent', color: '#dc2626', enabled: true }
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
        <h2 className="text-xl font-semibold mb-6">Historical Performance</h2>
        <p className="text-gray-600 text-sm">Performance Tracking Across Primary Metrics | Rolling 12 months (Demo Mode)</p>
      </div>

      {/* Metric Selection Toggles - Matching 2.0 checkboxes */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">Select Metrics to Display:</p>
        <div className="flex flex-wrap gap-4">
          {metrics.map((metric) => (
            <div key={metric.key} className="flex items-center space-x-2">
              <Checkbox
                id={metric.key}
                checked={metric.enabled}
                onCheckedChange={() => toggleMetric(metric.key)}
              />
              <label
                htmlFor={metric.key}
                className="text-sm font-medium cursor-pointer"
                style={{ color: metric.color }}
              >
                {metric.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-96">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading historical data...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500">Failed to load historical data</div>
          </div>
        ) : (
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
            
            {/* Dynamic Lines based on enabled metrics - Matching 2.0 styling */}
            {metrics
              .filter(metric => metric.enabled)
              .map((metric) => (
                <Line
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  stroke={metric.color}
                  strokeWidth={3}
                  dot={{ fill: metric.color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: metric.color }}
                />
              ))
            }
          </LineChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default HistoricalPerformance;