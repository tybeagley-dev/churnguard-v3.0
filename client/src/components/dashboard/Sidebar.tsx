import { BarChart3, TrendingUp, Users, DollarSign, Settings } from "lucide-react";

interface SidebarProps {
  dateRange: string;
  setDateRange: (range: string) => void;
  category: string;
  setCategory: (category: string) => void;
}

export default function Sidebar({ dateRange, setDateRange, category, setCategory }: SidebarProps) {
  return (
    <aside className="hidden lg:block w-64 bg-white border-r border-slate-200 min-h-screen">
      <div className="p-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Quick Filters</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="sales">Sales</option>
              <option value="marketing">Marketing</option>
              <option value="support">Support</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="p-6 border-t border-slate-200">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Menu</h3>
        <nav className="space-y-2">
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-primary bg-blue-50 rounded-md">
            <BarChart3 className="w-4 h-4 mr-3" />
            Overview
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">
            <TrendingUp className="w-4 h-4 mr-3" />
            Performance
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">
            <Users className="w-4 h-4 mr-3" />
            Customers
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">
            <DollarSign className="w-4 h-4 mr-3" />
            Revenue
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">
            <Settings className="w-4 h-4 mr-3" />
            Settings
          </a>
        </nav>
      </div>
    </aside>
  );
}