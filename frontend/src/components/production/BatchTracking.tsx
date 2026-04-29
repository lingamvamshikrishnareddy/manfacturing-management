// components/production/BatchTracking.tsx — Real API integration
import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { productionService, triggerDownload } from '../../services/api';
import { Modal } from '../shared/Modal';
import { useToast } from '../shared/Toast';
import { CardSkeleton } from '../ui/Skeleton';

const BatchTracking: React.FC = () => {
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
    productName: '', quantity: '', startDate: '', line: '', priority: 'medium',
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
    } catch { toastError('Export not available'); }
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
        assignedLine: form.line,
        priority: form.priority,
        status: 'in-progress',
        workOrderId: `WO-${Date.now()}`,
        batchNumber: `BAT-${Date.now()}`,
      });
      success('Batch created');
      setShowModal(false);
      setForm({ productName: '', quantity: '', startDate: '', line: '', priority: 'medium' });
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
    .filter(b => (b.productName ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.batchNumber ?? '').toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(b => statusFilter === 'all' || b.status === statusFilter);

  if (loading) return <div className="bg-white rounded-2xl shadow-card p-6"><CardSkeleton /></div>;
  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">{error}<button onClick={fetchData} className="ml-3 underline text-sm">Retry</button></div>;

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 rounded-xl"><Package className="h-5 w-5 text-indigo-600" /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Batch Tracking</h2>
              <p className="text-sm text-gray-500">{filtered.length} batches</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExport} disabled={exporting}
              className="inline-flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
              <Download className="w-4 h-4" />{exporting ? '...' : 'Export'}
            </button>
            <button onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> New Batch
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search batches..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="in-production">In Production</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="quarantined">Quarantined</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>No batches found</p>
          </div>
        ) : filtered.map((batch, i) => (
          <div key={batch._id ?? batch.id ?? i} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{batch.batchNumber ?? `BATCH-${i + 1}`}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[batch.status] ?? 'bg-gray-100 text-gray-700'}`}>{batch.status}</span>
                </div>
                <p className="text-sm text-gray-600">{batch.productName}</p>
                <div className="grid grid-cols-3 gap-4 mt-2 text-xs text-gray-500">
                  <div><span className="font-medium text-gray-700">{batch.quantity?.toLocaleString()}</span> units</div>
                  <div>Started: {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : '—'}</div>
                  <div>Yield: {batch.yield > 0 ? `${batch.yield}%` : '—'}</div>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Start New Batch">
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'productName', label: 'Product Name *', type: 'text', required: true, placeholder: 'Industrial Gear Assembly' },
            { id: 'quantity', label: 'Quantity *', type: 'number', required: true, placeholder: '500' },
            { id: 'startDate', label: 'Start Date *', type: 'date', required: true, placeholder: '' },
            { id: 'line', label: 'Assigned Line', type: 'text', required: false, placeholder: 'Line A, CNC-01...' },
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

export default BatchTracking;
