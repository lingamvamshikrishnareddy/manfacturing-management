// src/pages/sub/DefectsPage.tsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Search, Filter, RefreshCw } from 'lucide-react';
import { qualityService } from '../../services/api';
import { Modal } from '../../components/shared/Modal';
import { useToast } from '../../components/shared/Toast';

const DefectsPage: React.FC = () => {
  const [defects, setDefects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    defectType: '', severity: 'medium', batch: '', description: '', detectedBy: '', date: '',
  });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await qualityService.getDefects();
      const data = res.data?.data ?? res.data ?? [];
      setDefects(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load defects');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.defectType.trim() || !form.batch.trim()) {
      toastError('Defect type and batch/product are required');
      return;
    }
    setSubmitting(true);
    try {
      await qualityService.createDefect({
        defectType: form.defectType,
        severity: form.severity,
        batchId: form.batch,
        description: form.description,
        inspectedBy: form.detectedBy,
        inspectionDate: form.date || new Date().toISOString(),
        status: 'open',
      });
      success('Defect reported successfully');
      setShowModal(false);
      setForm({ defectType: '', severity: 'medium', batch: '', description: '', detectedBy: '', date: '' });
      fetchData();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to report defect');
    } finally { setSubmitting(false); }
  };

  const severityStyles: Record<string, string> = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  };

  const filtered = defects
    .filter(d => (d.defectType ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.batchId ?? '').toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(d => severityFilter === 'all' || d.severity === severityFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Defect Tracking</h1>
          <p className="text-gray-500 mt-1">Monitor and analyze production defects</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} disabled={loading} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">
            <Plus className="w-4 h-4" /> Report Defect
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search defects..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {loading && <div className="bg-white rounded-2xl p-8 shadow-sm flex justify-center"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No defects reported — great quality!</p>
          <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">Report a Defect</button>
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {filtered.map((d, i) => (
            <div key={d._id ?? d.id ?? i} className="p-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    d.severity === 'critical' ? 'text-red-600' :
                    d.severity === 'high' ? 'text-orange-500' :
                    d.severity === 'medium' ? 'text-yellow-500' : 'text-green-500'}`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{d.defectType}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityStyles[d.severity] ?? 'bg-gray-100 text-gray-700'}`}>
                        {d.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Batch: {d.batchId ?? '—'}</p>
                    {d.description && <p className="text-xs text-gray-500 mt-1">{d.description}</p>}
                    <div className="flex gap-3 text-xs text-gray-400 mt-1">
                      {d.inspectedBy && <span>By: {d.inspectedBy}</span>}
                      {d.inspectionDate && <span>{new Date(d.inspectionDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 capitalize ${
                  d.status === 'resolved' || d.status === 'closed' ? 'bg-green-100 text-green-700' :
                  d.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {d.status?.replace('_', ' ') ?? 'open'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Report Defect">
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'defectType', label: 'Defect Type *', type: 'text', required: true, placeholder: 'Surface Crack, Dimensional Error...' },
            { id: 'batch', label: 'Batch / Product *', type: 'text', required: true, placeholder: 'BAT-2024-001' },
            { id: 'detectedBy', label: 'Detected By', type: 'text', required: false, placeholder: 'Inspector name' },
            { id: 'date', label: 'Date', type: 'date', required: false, placeholder: '' },
          ].map(f => (
            <div key={f.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} required={f.required} placeholder={f.placeholder}
                value={(form as any)[f.id]} onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none">
              {['low', 'medium', 'high', 'critical'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3} placeholder="Describe the defect..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {submitting ? 'Reporting...' : 'Report Defect'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DefectsPage;
