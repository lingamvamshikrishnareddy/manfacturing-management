// src/pages/sub/WorkOrdersPage.tsx
import React, { useState, useEffect } from 'react';
import { Clipboard, Plus, Search, Filter, AlertTriangle, Clock, Users, RefreshCw } from 'lucide-react';
import { productionService } from '../../services/api';
import { Modal } from '../../components/shared/Modal';
import { useToast } from '../../components/shared/Toast';

const WorkOrdersPage: React.FC = () => {
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
      const workOrderId = `WO-${Date.now()}`;
      await productionService.createWorkOrder({
        workOrderId,
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
    delayed: 'bg-orange-100 text-orange-700',
  };

  const filtered = workOrders
    .filter(o => (o.productName ?? o.product ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.workOrderId ?? o.orderNumber ?? '').toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(o => statusFilter === 'all' || o.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Work Orders</h1>
          <p className="text-gray-500 mt-1">Manage production work orders</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} disabled={loading} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Create Work Order
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search work orders..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
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
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading && <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <Clipboard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No work orders found</p>
          <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Create First Work Order</button>
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {filtered.map((order, i) => (
            <div key={order._id ?? order.id ?? i} className="p-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${order.priority === 'high' ? 'text-red-500' : order.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'}`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{order.workOrderId ?? order.orderNumber}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{order.productName ?? order.product}</p>
                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : '—'}</span>
                      {(order.assignedTo?.length > 0 || order.assignedEmployees?.length > 0) && (
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {(order.assignedTo ?? order.assignedEmployees ?? []).length} assigned</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-bold text-gray-900">{order.quantity?.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">units</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Work Order Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Work Order">
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'product', label: 'Product *', type: 'text', required: true, placeholder: 'Industrial Gear Assembly' },
            { id: 'quantity', label: 'Quantity *', type: 'number', required: true, placeholder: '500' },
            { id: 'dueDate', label: 'Due Date *', type: 'date', required: true, placeholder: '' },
            { id: 'assignedTo', label: 'Assigned To (comma-separated)', type: 'text', required: false, placeholder: 'John Doe, Jane Smith' },
          ].map(f => (
            <div key={f.id}>
              <label htmlFor={f.id} className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input id={f.id} type={f.type} required={f.required} placeholder={f.placeholder}
                value={(form as any)[f.id]} onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                min={f.type === 'number' ? 1 : undefined}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
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

export default WorkOrdersPage;
