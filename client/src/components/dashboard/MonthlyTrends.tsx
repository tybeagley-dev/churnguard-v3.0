import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';

interface MonthlyTrendsData {
  month: string;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  total: number;
}

const MonthlyTrends = () => {
  const [activeView, setActiveView] = useState<'weekly' | 'monthly'>('weekly');

  // Fetch real monthly trends data
  const { data: monthlyData = [], isLoading, error } = useQuery({
    queryKey: ['monthly-trends'],
    queryFn: () => 
      fetch('/api/monthly-trends')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch monthly trends');
          return res.json();
        }),
  });

  const formatTooltipValue = (value: number, name: string) => {
    const labels: { [key: string]: string } = {
      highRisk: 'High Risk',
      mediumRisk: 'Medium Risk',
      lowRisk: 'Low Risk'
    };
    return [value.toLocaleString(), labels[name] || name];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Monthly Trends</h2>
        <p className="text-gray-600 text-sm">Total Accounts by Risk Level | Rolling 12 months</p>
      </div>

      {/* View Toggle Buttons */}
      <div className="flex justify-start mb-6">
        <div className="flex">
          <button
            onClick={() => setActiveView('weekly')}
            className={`px-6 py-3 rounded-t-lg border-t border-l border-r font-medium text-sm transition-colors relative ${
              activeView === 'weekly'
                ? 'bg-white text-gray-900 border-gray-300 z-10'
                : 'bg-gray-100 text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Weekly View
          </button>
          <button
            onClick={() => setActiveView('monthly')}
            className={`px-6 py-3 rounded-t-lg border-t border-l border-r font-medium text-sm transition-colors relative -ml-px ${
              activeView === 'monthly'
                ? 'bg-white text-gray-900 border-gray-300 z-10'
                : 'bg-gray-100 text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Monthly View
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-80">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading monthly trends...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500">Failed to load monthly trends</div>
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
              label={{ value: 'Number of Accounts', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={formatTooltipValue}
              labelStyle={{ color: '#374151', fontWeight: 'medium' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
            />
            
            {/* Stacked bars for risk levels */}
            <Bar 
              dataKey="highRisk" 
              stackId="risk"
              fill="#ef4444"
              name="High Risk"
              radius={[0, 0, 0, 0]}
            />
            <Bar 
              dataKey="mediumRisk" 
              stackId="risk"
              fill="#f59e0b"
              name="Medium Risk"
              radius={[0, 0, 0, 0]}
            />
            <Bar 
              dataKey="lowRisk" 
              stackId="risk"
              fill="#10b981"
              name="Low Risk"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        )}
      </div>

      {/* Risk Level Legend */}
      <div className="mt-4 flex justify-center space-x-8 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-700">High Risk</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-gray-700">Medium Risk</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-700">Low Risk</span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyTrends;