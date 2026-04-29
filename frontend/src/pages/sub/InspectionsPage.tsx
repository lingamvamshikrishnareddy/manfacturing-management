// src/pages/sub/InspectionsPage.tsx
import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Plus, Search, Filter, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { qualityService } from '../../services/api';
import { Modal } from '../../components/shared/Modal';
import { useToast } from '../../components/shared/Toast';

const InspectionsPage: React.FC = () => {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    inspectionType: 'incoming', product: '', inspector: '', date: '', notes: '',
  });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await qualityService.getInspections();
      const data = res.data?.data ?? res.data ?? [];
      setInspections(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load inspections');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product.trim() || !form.inspector.trim() || !form.date) {
      toastError('Product, inspector, and date are required');
      return;
    }
    setSubmitting(true);
    try {
      await qualityService.createInspection({
        inspectionType: form.inspectionType,
        batchId: form.product,
        inspectedBy: form.inspector,
        inspectionDate: form.date,
        notes: form.notes,
        status: 'open',
        defectType: 'General',
        severity: 'low',
      });
      success('Inspection created');
      setShowModal(false);
      setForm({ inspectionType: 'incoming', product: '', inspector: '', date: '', notes: '' });
      fetchData();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to create inspection');
    } finally { setSubmitting(false); }
  };

  const handleMarkStatus = async (id: string, status: string) => {
    try {
      await qualityService.updateInspection(id, { status });
      success(`Inspection marked as ${status}`);
      fetchData();
    } catch { toastError('Failed to update inspection'); }
  };

  const statusIcons: Record<string, React.ReactNode> = {
    passed: <CheckCircle className="w-5 h-5 text-green-500" />,
    failed: <XCircle className="w-5 h-5 text-red-500" />,
    open: <Clock className="w-5 h-5 text-yellow-500" />,
    in_progress: <Clock className="w-5 h-5 text-blue-500" />,
    resolved: <CheckCircle className="w-5 h-5 text-green-500" />,
    closed: <CheckCircle className="w-5 h-5 text-gray-400" />,
  };

  const filtered = inspections
    .filter(i => (i.batchId ?? i.product ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.inspectedBy ?? i.inspector ?? '').toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(i => statusFilter === 'all' || i.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quality Inspections</h1>
          <p className="text-gray-500 mt-1">Track and manage quality checks</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} disabled={loading} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            <Plus className="w-4 h-4" /> New Inspection
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search inspections..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {loading && <div className="bg-white rounded-2xl p-8 shadow-sm flex justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No inspections found</p>
          <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Create First Inspection</button>
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {filtered.map((insp, i) => (
            <div key={insp._id ?? insp.id ?? i} className="p-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{statusIcons[insp.status] ?? <Clock className="w-5 h-5 text-gray-400" />}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{insp.batchId ?? insp.product ?? 'Unknown Batch'}</h3>
                    <p className="text-sm text-gray-500">Inspector: {insp.inspectedBy ?? '—'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{insp.inspectionDate ? new Date(insp.inspectionDate).toLocaleDateString() : '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                    insp.status === 'resolved' || insp.status === 'closed' ? 'bg-green-100 text-green-700' :
                    insp.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'}`}>
                    {insp.status?.replace('_', ' ')}
                  </span>
                  {insp.status === 'open' && (
                    <div className="flex gap-1">
                      <button onClick={() => handleMarkStatus(insp._id ?? insp.id, 'resolved')}
                        className="p-1.5 hover:bg-green-50 rounded-lg transition-colors" title="Mark Resolved">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </button>
                      <button onClick={() => handleMarkStatus(insp._id ?? insp.id, 'closed')}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Close">
                        <XCircle className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Quality Inspection">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Type</label>
            <select value={form.inspectionType} onChange={e => setForm(p => ({ ...p, inspectionType: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none">
              {['incoming', 'in-process', 'final', 'outgoing'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          {[
            { id: 'product', label: 'Product / Batch ID *', type: 'text', required: true, placeholder: 'BAT-2024-001' },
            { id: 'inspector', label: 'Inspector *', type: 'text', required: true, placeholder: 'Jane Smith' },
            { id: 'date', label: 'Inspection Date *', type: 'date', required: true, placeholder: '' },
          ].map(f => (
            <div key={f.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} required={f.required} placeholder={f.placeholder}
                value={(form as any)[f.id]} onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              rows={3} placeholder="Inspection notes..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {submitting ? 'Creating...' : 'Create Inspection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InspectionsPage;
