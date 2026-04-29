// src/pages/sub/MaintenanceRequestsPage.tsx
import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Search, Filter, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { maintenanceService } from '../../services/api';
import { Modal } from '../../components/shared/Modal';
import { useToast } from '../../components/shared/Toast';

const MaintenanceRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    equipmentName: '', issueDescription: '', priority: 'medium', requestedBy: '', dateNeeded: '',
  });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await maintenanceService.getRequests();
      const data = res.data?.data ?? res.data ?? [];
      setRequests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load maintenance requests');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.equipmentName.trim() || !form.issueDescription.trim()) {
      toastError('Equipment name and issue description are required');
      return;
    }
    setSubmitting(true);
    try {
      await maintenanceService.createRequest({
        equipmentName: form.equipmentName,
        description: form.issueDescription,
        priority: form.priority,
        requestedBy: form.requestedBy,
        dateNeeded: form.dateNeeded,
        status: 'pending',
        requestDate: new Date().toISOString(),
      });
      success('Maintenance request submitted');
      setShowModal(false);
      setForm({ equipmentName: '', issueDescription: '', priority: 'medium', requestedBy: '', dateNeeded: '' });
      fetchData();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to submit request');
    } finally { setSubmitting(false); }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  const priorityColors: Record<string, string> = {
    low: 'text-green-500', medium: 'text-yellow-500', high: 'text-orange-500', critical: 'text-red-600',
  };

  const filtered = requests
    .filter(r => (r.equipmentName ?? r.equipment ?? '').toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(r => statusFilter === 'all' || r.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Requests</h1>
          <p className="text-gray-500 mt-1">Track equipment maintenance requests</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} disabled={loading} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700">
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
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {loading && <div className="bg-white rounded-2xl p-8 shadow-sm flex justify-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No maintenance requests found</p>
          <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700">Create First Request</button>
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {filtered.map((req, i) => (
            <div key={req._id ?? req.id ?? i} className="p-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${priorityColors[req.priority] ?? 'text-gray-400'}`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{req.equipmentName ?? req.equipment}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[req.status] ?? 'bg-gray-100 text-gray-700'}`}>{req.status}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        req.priority === 'high' || req.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        req.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {req.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{req.description ?? req.issueDescription}</p>
                    <div className="flex gap-3 text-xs text-gray-400 mt-1">
                      {req.requestedBy && <span>By: {req.requestedBy}</span>}
                      {(req.dateNeeded ?? req.requestDate) && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(req.dateNeeded ?? req.requestDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Maintenance Request">
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'equipmentName', label: 'Equipment Name *', type: 'text', required: true, placeholder: 'CNC Machine #1, Assembly Line B...' },
            { id: 'issueDescription', label: 'Issue Description *', type: 'text', required: true, placeholder: 'Machine stopped, unusual noise...' },
            { id: 'requestedBy', label: 'Requested By', type: 'text', required: false, placeholder: 'Your name' },
            { id: 'dateNeeded', label: 'Date Needed', type: 'date', required: false, placeholder: '' },
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
              {['low', 'medium', 'high', 'critical'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaintenanceRequestsPage;
