// src/pages/sub/MaterialRequestsPage.tsx
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Clock, Building2, RefreshCw } from 'lucide-react';
import { inventoryService } from '../../services/api';
import { Modal } from '../../components/shared/Modal';
import { useToast } from '../../components/shared/Toast';

const MaterialRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    item: '', quantityRequested: '', requiredBy: '', department: '', notes: '',
  });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await inventoryService.getRequests();
      const data = res.data?.data ?? res.data ?? [];
      setRequests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load requests');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.item.trim() || !form.quantityRequested) {
      toastError('Item and quantity are required');
      return;
    }
    setSubmitting(true);
    try {
      await inventoryService.createRequest({
        item: form.item,
        quantityRequested: Number(form.quantityRequested),
        requiredBy: form.requiredBy,
        department: form.department,
        notes: form.notes,
        status: 'pending',
        requestDate: new Date().toISOString(),
      });
      success('Material request submitted');
      setShowModal(false);
      setForm({ item: '', quantityRequested: '', requiredBy: '', department: '', notes: '' });
      fetchData();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to submit request');
    } finally { setSubmitting(false); }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
  };

  const filtered = requests
    .filter(r => (r.item ?? r.itemId ?? '').toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(r => statusFilter === 'all' || r.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Material Requests</h1>
          <p className="text-gray-500 mt-1">Submit and track material procurement requests</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} disabled={loading} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            <Plus className="w-4 h-4" /> New Request
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search requests..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading && <div className="bg-white rounded-2xl p-8 shadow-sm flex justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No material requests found</p>
          <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Create First Request</button>
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {filtered.map((req, i) => (
            <div key={req._id ?? req.id ?? i} className="p-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{req.item ?? req.itemId}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[req.status] ?? 'bg-gray-100 text-gray-700'}`}>{req.status}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500 mt-1">
                    {req.department && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{req.department}</span>}
                    {req.requiredBy && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Required by: {new Date(req.requiredBy).toLocaleDateString()}</span>}
                  </div>
                  {req.notes && <p className="text-sm text-gray-500 mt-1">{req.notes}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-bold text-gray-900">{req.quantityRequested?.toLocaleString() ?? req.quantity}</p>
                  <p className="text-xs text-gray-500">units</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Material Request">
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'item', label: 'Item *', type: 'text', required: true, placeholder: 'Steel Sheets, Copper Wire...' },
            { id: 'quantityRequested', label: 'Quantity Requested *', type: 'number', required: true, placeholder: '100' },
            { id: 'requiredBy', label: 'Required By Date', type: 'date', required: false, placeholder: '' },
            { id: 'department', label: 'Department', type: 'text', required: false, placeholder: 'Production, Maintenance...' },
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
              rows={3} placeholder="Additional notes or specifications..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaterialRequestsPage;
