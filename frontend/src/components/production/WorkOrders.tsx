// components/production/WorkOrders.tsx — Real API integration
import React, { useState, useEffect } from 'react';
import { Clipboard, Plus, Search, Filter, Clock, Users, AlertTriangle } from 'lucide-react';
import { productionService } from '../../services/api';
import { Modal } from '../shared/Modal';
import { useToast } from '../shared/Toast';
import { CardSkeleton } from '../ui/Skeleton';

const WorkOrders: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    product: '', quantity: '', dueDate: '', priority: 'medium', assignedTo: '',
  });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await productionService.getWorkOrders();
      const data = res.data?.workOrders ?? res.data?.data ?? res.data ?? [];
      setWorkOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load work orders');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product.trim() || !form.quantity || !form.dueDate) {
      toastError('Product, quantity, and due date are required');
      return;
    }
    setSubmitting(true);
    try {
      await productionService.createWorkOrder({
        workOrderId: `WO-${Date.now()}`,
        productName: form.product,
        quantity: Number(form.quantity),
        dueDate: form.dueDate,
        priority: form.priority,
        assignedTo: form.assignedTo ? form.assignedTo.split(',').map((s: string) => s.trim()) : [],
        status: 'pending',
        startDate: new Date().toISOString(),
      });
      success('Work order created');
      setShowModal(false);
      setForm({ product: '', quantity: '', dueDate: '', priority: 'medium', assignedTo: '' });
      fetchData();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to create work order');
    } finally { setSubmitting(false); }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const filtered = workOrders
    .filter(o => (o.productName ?? '').toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(o => statusFilter === 'all' || o.status === statusFilter);

  if (loading) return <div className="bg-white rounded-2xl shadow-card p-6"><CardSkeleton /></div>;
  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">{error}<button onClick={fetchData} className="ml-3 underline text-sm">Retry</button></div>;

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 rounded-xl"><Clipboard className="h-5 w-5 text-purple-600" /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Work Orders</h2>
              <p className="text-sm text-gray-500">{filtered.length} orders</p>
            </div>
          </div>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Create Work Order
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search work orders..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
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
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Clipboard className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>No work orders found</p>
          </div>
        ) : filtered.map((order, i) => (
          <div key={order._id ?? order.id ?? i} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${order.priority === 'high' ? 'text-red-500' : order.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'}`} />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{order.workOrderId ?? order.orderNumber}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] ?? 'bg-gray-100 text-gray-700'}`}>{order.status}</span>
                  </div>
                  <p className="text-sm text-gray-600">{order.productName ?? order.product}</p>
                  <div className="flex gap-3 text-xs text-gray-400 mt-1">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Due: {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : '—'}</span>
                    {(order.assignedTo?.length > 0 || order.assignedEmployees?.length > 0) && (
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{(order.assignedTo ?? order.assignedEmployees ?? []).length} assigned</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">{order.quantity?.toLocaleString()}</p>
                <p className="text-xs text-gray-500">units</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Work Order">
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'product', label: 'Product *', type: 'text', required: true, placeholder: 'Industrial Gear Assembly' },
            { id: 'quantity', label: 'Quantity *', type: 'number', required: true, placeholder: '500' },
            { id: 'dueDate', label: 'Due Date *', type: 'date', required: true, placeholder: '' },
            { id: 'assignedTo', label: 'Assigned To (comma-separated)', type: 'text', required: false, placeholder: 'John Doe, Jane Smith' },
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
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WorkOrders;
