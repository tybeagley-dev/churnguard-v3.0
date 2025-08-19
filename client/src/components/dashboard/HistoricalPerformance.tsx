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
  // Production mode: Fetch real historical performance data
  const { data: historicalData = [], isLoading, error } = useQuery({
    queryKey: ['historical-performance'],
    queryFn: () => 
      fetch('/api/historical-performance')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch historical performance');
          return res.json();
        }),
    retry: false,
    refetchOnWindowFocus: false,
  });

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
        <p className="text-gray-600 text-sm">Performance Tracking Across Primary Metrics | Rolling 12 months</p>
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