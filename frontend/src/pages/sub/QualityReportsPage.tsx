// src/pages/sub/QualityReportsPage.tsx
import React, { useState, useEffect } from 'react';
import { BarChart3, Download, RefreshCw, FileText } from 'lucide-react';
import { qualityService, triggerDownload } from '../../services/api';
import { useToast } from '../../components/shared/Toast';

const QualityReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const { success, error: toastError } = useToast();

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await qualityService.getReports();
      const data = res.data?.data ?? res.data ?? [];
      setReports(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load quality reports');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await qualityService.exportReports();
      triggerDownload(new Blob([res.data]), 'quality-reports.csv');
      success('Quality reports exported');
    } catch { toastError('Export failed — endpoint may not be available yet'); }
    finally { setExporting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quality Reports</h1>
          <p className="text-gray-500 mt-1">Quality analysis and performance reports</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} disabled={loading} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 px-4 py-2 border border-green-200 text-green-600 rounded-xl hover:bg-green-50">
            <Download className="w-4 h-4" />{exporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      {loading && <div className="bg-white rounded-2xl p-8 shadow-sm flex justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>}
      {!loading && !error && reports.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No quality reports available</p>
          <p className="text-sm text-gray-400 mt-1">Reports are generated from inspections and defect data.</p>
        </div>
      )}
      {!loading && !error && reports.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {reports.map((r, i) => (
            <div key={r._id ?? r.id ?? i} className="p-5 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{r.title ?? r.name ?? `Quality Report ${i + 1}`}</h3>
                  {r.createdAt && <p className="text-sm text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>}
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QualityReportsPage;
