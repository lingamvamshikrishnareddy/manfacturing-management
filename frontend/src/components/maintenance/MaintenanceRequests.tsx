// components/maintenance/MaintenanceRequests.tsx — Real API integration
import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Search, Filter, AlertTriangle, Clock, User } from 'lucide-react';
import { maintenanceService } from '../../services/api';
import { Modal } from '../shared/Modal';
import { useToast } from '../shared/Toast';
import { CardSkeleton } from '../ui/Skeleton';

const MaintenanceRequests: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    equipmentName: '', description: '', priority: 'medium', requestedBy: '', dateNeeded: '',
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
    if (!form.equipmentName.trim() || !form.description.trim()) {
      toastError('Equipment name and description are required');
      return;
    }
    setSubmitting(true);
    try {
      await maintenanceService.createRequest({
        equipmentName: form.equipmentName,
        description: form.description,
        priority: form.priority,
        requestedBy: form.requestedBy,
        dateNeeded: form.dateNeeded,
        status: 'pending',
        requestDate: new Date().toISOString(),
      });
      success('Maintenance request submitted');
      setShowModal(false);
      setForm({ equipmentName: '', description: '', priority: 'medium', requestedBy: '', dateNeeded: '' });
      fetchData();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to submit request');
    } finally { setSubmitting(false); }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
      case 'in-progress': return { bg: 'bg-blue-100', text: 'text-blue-700' };
      case 'completed': return { bg: 'bg-green-100', text: 'text-green-700' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high': case 'critical': return { bg: 'bg-red-100', text: 'text-red-700' };
      case 'medium': return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
      default: return { bg: 'bg-green-100', text: 'text-green-700' };
    }
  };

  const filteredRequests = requests
    .filter(req => (req.equipmentName ?? req.equipment ?? '').toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(req => statusFilter === 'all' || req.status === statusFilter);

  if (loading) return <div className="bg-white rounded-2xl shadow-card p-6"><CardSkeleton /></div>;
  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">{error}<button onClick={fetchData} className="ml-3 underline text-sm">Retry</button></div>;

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 rounded-xl"><Wrench className="h-5 w-5 text-orange-600" /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Maintenance Requests</h2>
              <p className="text-sm text-gray-500">{filteredRequests.length} requests</p>
            </div>
          </div>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> New Request
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search requests..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Wrench className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>No maintenance requests</p>
          </div>
        ) : filteredRequests.map((request, index) => {
          const statusStyles = getStatusStyles(request.status);
          const priorityStyles = getPriorityStyles(request.priority);
          return (
            <div key={request._id ?? request.id ?? index}
              className="p-4 hover:bg-gray-50 transition-colors duration-200 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 p-2 rounded-xl ${
                    request.status === 'pending' ? 'bg-yellow-100' :
                    request.status === 'in-progress' ? 'bg-blue-100' : 'bg-green-100'}`}>
                    {request.priority === 'high' || request.priority === 'critical'
                      ? <AlertTriangle className="h-5 w-5 text-red-500" />
                      : <Wrench className="h-5 w-5 text-gray-500" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{request.equipmentName ?? request.equipment}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles.bg} ${statusStyles.text}`}>
                        {request.status?.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className={`px-2 py-0.5 rounded ${priorityStyles.bg} ${priorityStyles.text}`}>{request.priority}</span>
                      {request.requestType && <span>{request.requestType}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {request.requestedBy && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                      <User className="w-4 h-4" /><span>{request.requestedBy}</span>
                    </div>
                  )}
                  {(request.requestDate ?? request.dateNeeded) && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(request.requestDate ?? request.dateNeeded).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Request Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Maintenance Request">
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'equipmentName', label: 'Equipment Name *', type: 'text', required: true, placeholder: 'CNC Machine #1' },
            { id: 'description', label: 'Issue Description *', type: 'text', required: true, placeholder: 'Describe the issue...' },
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

export default MaintenanceRequests;
