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

  // Demo mode: Use mock data instead of API calls to prevent reload loops
  const monthlyData = [
    { month: 'Jan', highRisk: 23, mediumRisk: 45, lowRisk: 77, total: 145 },
    { month: 'Feb', highRisk: 19, mediumRisk: 48, lowRisk: 85, total: 152 },
    { month: 'Mar', highRisk: 26, mediumRisk: 42, lowRisk: 80, total: 148 },
    { month: 'Apr', highRisk: 21, mediumRisk: 52, lowRisk: 86, total: 159 },
    { month: 'May', highRisk: 18, mediumRisk: 49, lowRisk: 89, total: 156 },
    { month: 'Jun', highRisk: 24, mediumRisk: 55, lowRisk: 84, total: 163 },
    { month: 'Jul', highRisk: 22, mediumRisk: 58, lowRisk: 87, total: 167 },
    { month: 'Aug', highRisk: 27, mediumRisk: 46, lowRisk: 88, total: 161 },
    { month: 'Sep', highRisk: 20, mediumRisk: 61, lowRisk: 90, total: 171 },
    { month: 'Oct', highRisk: 25, mediumRisk: 63, lowRisk: 87, total: 175 },
    { month: 'Nov', highRisk: 23, mediumRisk: 57, lowRisk: 85, total: 165 },
    { month: 'Dec', highRisk: 19, mediumRisk: 68, lowRisk: 95, total: 182 }
  ];
  const isLoading = false;
  const error = null;

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
        <h2 className="text-xl font-semibold mb-6">Monthly Trends</h2>
        <p className="text-gray-600 text-sm">Total Accounts by Risk Level | Rolling 12 months (Demo Mode)</p>
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
    </div>
  );
};

export default MonthlyTrends;