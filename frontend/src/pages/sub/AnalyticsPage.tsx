// src/pages/sub/AnalyticsPage.tsx
import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/api';
import { BarChart3, TrendingUp, Calendar, RefreshCw } from 'lucide-react';

const ranges = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
];

const AnalyticsPage: React.FC = () => {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getAnalytics(range);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [range]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Performance trends and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            {ranges.map(r => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  range === r.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium">{error}</p>
          <p className="text-red-500 text-sm mt-1">Check that the backend analytics endpoint is available.</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Total Production', value: data.totalProduction ?? data.production ?? '—', icon: BarChart3, color: 'blue' },
              { label: 'Quality Rate', value: data.qualityRate != null ? `${data.qualityRate}%` : '—', icon: TrendingUp, color: 'green' },
              { label: 'Efficiency', value: data.efficiency != null ? `${data.efficiency}%` : '—', icon: Calendar, color: 'purple' },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className={`w-12 h-12 rounded-xl bg-${card.color}-100 flex items-center justify-center mb-4`}>
                  <card.icon className={`w-6 h-6 text-${card.color}-600`} />
                </div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Raw data display when charts library not configured */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Analytics Data ({range})</h3>
            <pre className="text-xs text-gray-600 overflow-x-auto bg-gray-50 p-4 rounded-xl">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {!loading && !error && !data && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No analytics data available</p>
          <p className="text-sm text-gray-400 mt-1">Data will appear once production activity is recorded.</p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
