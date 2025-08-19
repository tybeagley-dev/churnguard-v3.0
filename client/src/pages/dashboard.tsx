import { useQuery } from "@tanstack/react-query";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import KPICards from "@/components/dashboard/KPICards";
import Charts from "@/components/dashboard/Charts";
import DataTable from "@/components/dashboard/DataTable";
import { Analytics, Transaction, Product } from "@shared/schema";
import { useState } from "react";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState("7d");
  const [category, setCategory] = useState("all");

  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Header />
      <div className="flex">
        <Sidebar 
          dateRange={dateRange}
          setDateRange={setDateRange}
          category={category}
          setCategory={setCategory}
        />
        <main className="flex-1 p-6 lg:p-8">
          <KPICards analytics={analytics} isLoading={analyticsLoading} />
          <Charts analytics={analytics} isLoading={analyticsLoading} />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            <div className="xl:col-span-2">
              {/* Performance chart is handled in Charts component */}
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Top Performing Products</h3>
              <div className="space-y-4">
                {productsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-slate-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  products?.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                          index === 0 ? 'bg-primary' : 
                          index === 1 ? 'bg-slate-400' : 
                          index === 2 ? 'bg-yellow-500' : 'bg-slate-400'
                        }`}>
                          {product.rank}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{product.name}</p>
                          <p className="text-sm text-slate-600">{product.sales.toLocaleString()} sales</p>
                        </div>
                      </div>
                      <span className="text-success font-semibold">${parseFloat(product.revenue).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <DataTable transactions={transactions} isLoading={transactionsLoading} />
        </main>
      </div>
    </div>
  );
}
