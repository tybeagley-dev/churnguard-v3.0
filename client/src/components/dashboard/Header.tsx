import { Bell } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <nav className="hidden md:flex space-x-6 ml-8">
            <a href="#" className="text-primary font-medium border-b-2 border-primary pb-1">
              Dashboard
            </a>
            <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">
              Reports
            </a>
            <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">
              Analytics
            </a>
            <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">
              Settings
            </a>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>
          <div className="flex items-center space-x-3">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32" 
              alt="User avatar" 
              className="w-8 h-8 rounded-full"
            />
            <span className="text-slate-700 font-medium">John Smith</span>
          </div>
        </div>
      </div>
    </header>
  );
}