// src/pages/sub/BatchesPage.tsx
import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, Download, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { productionService, triggerDownload } from '../../services/api';
import { Modal } from '../../components/shared/Modal';
import { useToast } from '../../components/shared/Toast';

const BatchesPage: React.FC = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    productName: '', quantity: '', startDate: '', assignedLine: '', priority: 'medium',
  });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await productionService.getBatches();
      const data = res.data?.data ?? res.data ?? [];
      setBatches(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load batches');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await productionService.exportBatches();
      triggerDownload(new Blob([res.data]), 'batches-export.csv');
      success('Export downloaded');
    } catch { toastError('Export failed — endpoint may not be available'); }
    finally { setExporting(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productName.trim() || !form.quantity || !form.startDate) {
      toastError('Product name, quantity, and start date are required');
      return;
    }
    setSubmitting(true);
    try {
      await productionService.createBatch({
        productName: form.productName,
        quantity: Number(form.quantity),
        startDate: form.startDate,
        assignedLine: form.assignedLine,
        priority: form.priority,
        status: 'in-progress',
        workOrderId: `WO-${Date.now()}`,
        batchNumber: `BAT-${Date.now()}`,
      });
      success('Batch created successfully');
      setShowModal(false);
      setForm({ productName: '', quantity: '', startDate: '', assignedLine: '', priority: 'medium' });
      fetchData();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to create batch');
    } finally { setSubmitting(false); }
  };

  const statusColors: Record<string, string> = {
    'in-progress': 'bg-blue-100 text-blue-700',
    'in-production': 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    quarantined: 'bg-yellow-100 text-yellow-700',
    released: 'bg-purple-100 text-purple-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const filtered = batches
    .filter(b => (b.productName ?? b.product ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.batchNumber ?? '').toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(b => statusFilter === 'all' || b.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Batch Tracking</h1>
          <p className="text-gray-500 mt-1">Monitor all production batches</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} disabled={loading} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50">
            <Download className="w-4 h-4" /> {exporting ? 'Exporting...' : 'Export Data'}
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            <Plus className="w-4 h-4" /> New Batch
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search batches..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Status</option>
          <option value="in-production">In Production</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="quarantined">Quarantined</option>
          <option value="released">Released</option>
        </select>
      </div>

      {loading && <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No batches found</p>
          <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Create First Batch</button>
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {filtered.map((batch, i) => (
            <div key={batch._id ?? batch.id ?? i} className="p-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-100 rounded-xl flex-shrink-0">
                    <Package className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{batch.batchNumber ?? `BATCH-${i + 1}`}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[batch.status] ?? 'bg-gray-100 text-gray-700'}`}>{batch.status}</span>
                    </div>
                    <p className="text-sm text-gray-600">{batch.productName ?? batch.product}</p>
                    <div className="grid grid-cols-4 gap-4 mt-3 text-xs text-gray-500">
                      <div><p className="font-medium text-gray-700">{batch.quantity?.toLocaleString() ?? '—'}</p><p>Quantity</p></div>
                      <div><p className="font-medium text-gray-700">{batch.startDate ? new Date(batch.startDate).toLocaleDateString() : '—'}</p><p>Started</p></div>
                      <div><p className="font-medium text-gray-700">{batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'In Progress'}</p><p>Ended</p></div>
                      <div><p className={`font-medium ${batch.yield >= 95 ? 'text-green-600' : batch.yield > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>{batch.yield > 0 ? `${batch.yield}%` : '—'}</p><p>Yield</p></div>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {batch.qualityStatus === 'passed' ? <CheckCircle className="w-5 h-5 text-green-500" /> :
                    batch.qualityStatus === 'failed' ? <XCircle className="w-5 h-5 text-red-500" /> :
                    <Clock className="w-5 h-5 text-yellow-500" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Batch Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Start New Batch">
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'productName', label: 'Product Name *', type: 'text', required: true, placeholder: 'Industrial Gear Assembly' },
            { id: 'quantity', label: 'Quantity *', type: 'number', required: true, placeholder: '500' },
            { id: 'startDate', label: 'Start Date *', type: 'date', required: true, placeholder: '' },
            { id: 'assignedLine', label: 'Assigned Line', type: 'text', required: false, placeholder: 'Line A, CNC-01...' },
          ].map(f => (
            <div key={f.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} required={f.required} placeholder={f.placeholder}
                value={(form as any)[f.id]} onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {submitting ? 'Creating...' : 'Start Batch'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BatchesPage;
