import { useState, useMemo } from 'react';
import { ChevronDown, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import AccountDetailModal from './AccountDetailModal';

interface AccountData {
  account_id: string;
  account_name: string;
  csm_owner: string;
  status: 'LAUNCHED' | 'PAUSED' | 'PENDING';
  total_spend: number;
  spend_delta: number;
  total_texts_delivered: number;
  texts_delta: number;
  coupons_redeemed: number;
  redemptions_delta: number;
  active_subs_cnt: number;
  risk_level: 'high' | 'medium' | 'low';
}

interface EnhancedAccountTableProps {
  accounts: AccountData[];
  loading: boolean;
}

type SortField = keyof AccountData;
type SortDirection = 'asc' | 'desc';

const EnhancedAccountTable: React.FC<EnhancedAccountTableProps> = ({ accounts, loading }) => {
  const [timePeriod, setTimePeriod] = useState('Current WTD');
  const [selectedCSM, setSelectedCSM] = useState('All CSMs');
  const [sortField, setSortField] = useState<SortField>('account_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedAccountName, setSelectedAccountName] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const itemsPerPage = 25;

  // Extract unique CSMs for filter dropdown
  const uniqueCSMs = useMemo(() => {
    const csms = [...new Set(accounts.map(account => account.csm_owner).filter(Boolean))];
    return ['All CSMs', ...csms.sort()];
  }, [accounts]);

  // Filter accounts based on selected CSM
  const filteredAccounts = useMemo(() => {
    if (selectedCSM === 'All CSMs') return accounts;
    return accounts.filter(account => account.csm_owner === selectedCSM);
  }, [accounts, selectedCSM]);

  // Sort accounts
  const sortedAccounts = useMemo(() => {
    return [...filteredAccounts].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  }, [filteredAccounts, sortField, sortDirection]);

  // Paginate accounts
  const paginatedAccounts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAccounts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAccounts, currentPage]);

  const totalPages = Math.ceil(sortedAccounts.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRowClick = (account: AccountData) => {
    setSelectedAccountId(account.account_id);
    setSelectedAccountName(account.account_name);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedAccountId(null);
    setSelectedAccountName('');
  };

  const formatDelta = (delta: number) => {
    if (!delta) return null;
    const isPositive = delta > 0;
    return (
      <span className={`inline-flex items-center text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {Math.abs(delta)}
      </span>
    );
  };

  const getSortIcon = (field: SortField) => {
    if (sortField === field) {
      return <ArrowUpDown className="w-4 h-4 text-blue-500" />;
    }
    return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Account Metrics Overview</h2>
      <p className="text-gray-600 text-sm mb-4">Key performance indicators for all restaurant accounts</p>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Time Period:</label>
          <div className="relative">
            <select 
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>Current WTD</option>
              <option>Previous Week</option>
              <option>Current Month</option>
              <option>Previous Month</option>
            </select>
            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          <p className="text-xs text-gray-500 mt-1">Showing data for: Current Week to Date (through previous complete day)</p>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">CSM:</label>
          <div className="relative">
            <select 
              value={selectedCSM}
              onChange={(e) => setSelectedCSM(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {uniqueCSMs.map((csm) => (
                <option key={csm} value={csm}>{csm}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Showing {paginatedAccounts.length} of {sortedAccounts.length} accounts ({filteredAccounts.length} total)
          </p>
        </div>
      </div>

      {/* Enhanced Table */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading account data...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th 
                    onClick={() => handleSort('account_name')}
                    className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span>Account</span>
                      {getSortIcon('account_name')}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('csm_owner')}
                    className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span>CSM</span>
                      {getSortIcon('csm_owner')}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('status')}
                    className="text-center py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>Status</span>
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('total_spend')}
                    className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-end space-x-2">
                      <span>Total Spend</span>
                      {getSortIcon('total_spend')}
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Spend Δ</th>
                  <th 
                    onClick={() => handleSort('total_texts_delivered')}
                    className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-end space-x-2">
                      <span>Texts Delivered</span>
                      {getSortIcon('total_texts_delivered')}
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Texts Δ</th>
                  <th 
                    onClick={() => handleSort('coupons_redeemed')}
                    className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-end space-x-2">
                      <span>Redemptions</span>
                      {getSortIcon('coupons_redeemed')}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('risk_level')}
                    className="text-center py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>Risk</span>
                      {getSortIcon('risk_level')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedAccounts.map((account, index) => (
                  <tr
                    key={account.account_id}
                    onClick={() => handleRowClick(account)}
                    className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {account.account_name}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {account.csm_owner || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        account.status === 'LAUNCHED' 
                          ? 'bg-green-100 text-green-800'
                          : account.status === 'PAUSED'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {account.status || 'LAUNCHED'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      ${account.total_spend?.toLocaleString() || '0'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {formatDelta(account.spend_delta)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {account.total_texts_delivered?.toLocaleString() || '0'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {formatDelta(account.texts_delta)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {account.coupons_redeemed?.toLocaleString() || '0'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        account.risk_level === 'high'
                          ? 'bg-red-100 text-red-800'
                          : account.risk_level === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {account.risk_level || 'low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Showing {Math.min(paginatedAccounts.length, itemsPerPage)} of {sortedAccounts.length} accounts (Page {currentPage} of {totalPages})
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                  {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Account Detail Modal */}
      <AccountDetailModal
        accountId={selectedAccountId}
        accountName={selectedAccountName}
        isOpen={modalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default EnhancedAccountTable;