// components/inventory/StockLevels.tsx — Real API integration
import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { inventoryService } from '../../services/api';
import { Modal } from '../shared/Modal';
import { useToast } from '../shared/Toast';
import { CardSkeleton } from '../ui/Skeleton';

const StockLevels: React.FC = () => {
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    itemName: '', category: '', quantity: '', unit: '', reorderLevel: '', unitCost: '',
  });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      let res;
      try { res = await inventoryService.getItems(); }
      catch { res = await inventoryService.getStock(); }
      const data = res.data?.data ?? res.data ?? [];
      setStockItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load inventory');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemName.trim() || !form.quantity) { toastError('Item name and quantity are required'); return; }
    setSubmitting(true);
    try {
      await inventoryService.createItem({
        itemName: form.itemName,
        category: form.category,
        quantity: Number(form.quantity),
        unit: form.unit,
        minQuantity: Number(form.reorderLevel) || 0,
        unitPrice: Number(form.unitCost) || 0,
        location: 'Warehouse',
        supplier: 'TBD',
      });
      success('Item added to inventory');
      setShowModal(false);
      setForm({ itemName: '', category: '', quantity: '', unit: '', reorderLevel: '', unitCost: '' });
      fetchData();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to add item');
    } finally { setSubmitting(false); }
  };

  const getStatus = (item: any) => {
    const qty = item.quantity ?? item.currentStock ?? 0;
    const min = item.minQuantity ?? item.minStock ?? 0;
    const max = item.maxQuantity ?? item.maxStock ?? 100;
    if (qty <= min) return 'low';
    if (qty >= max * 0.9) return 'full';
    return 'normal';
  };

  const statusStyles = {
    low: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500', badge: 'bg-red-100 text-red-700', bar: 'bg-red-500' },
    full: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500', badge: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500' },
    normal: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-500', badge: 'bg-green-100 text-green-700', bar: 'bg-green-500' },
  };

  const filteredItems = stockItems
    .filter(item => (item.itemName ?? item.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(item => filterStatus === 'all' || getStatus(item) === filterStatus);

  if (loading) return <div className="bg-white rounded-2xl shadow-card p-6"><CardSkeleton /></div>;
  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">{error}<button onClick={fetchData} className="ml-3 underline text-sm">Retry</button></div>;

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl"><Package className="h-5 w-5 text-blue-600" /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Stock Levels</h2>
              <p className="text-sm text-gray-500">{filteredItems.length} items</p>
            </div>
          </div>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search items..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="low">Low Stock</option>
              <option value="normal">Normal</option>
              <option value="full">Full</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stock List */}
      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>No inventory items found</p>
          </div>
        ) : filteredItems.map((item, i) => {
          const st = getStatus(item);
          const styles = statusStyles[st];
          const qty = item.quantity ?? item.currentStock ?? 0;
          const max = item.maxQuantity ?? item.maxStock ?? 100;
          const pct = Math.min((qty / (max || 100)) * 100, 100);
          return (
            <div key={item._id ?? item.id ?? i} className="p-4 hover:bg-gray-50 transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 p-2 rounded-xl ${styles.bg}`}>
                    {st === 'low' ? <AlertTriangle className={`h-5 w-5 ${styles.icon}`} /> :
                      st === 'full' ? <TrendingUp className={`h-5 w-5 ${styles.icon}`} /> :
                        <CheckCircle className={`h-5 w-5 ${styles.icon}`} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{item.itemName ?? item.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.badge}`}>
                        {st === 'low' ? 'Low Stock' : st === 'full' ? 'Full' : 'Normal'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{item.category ?? 'Uncategorized'}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{item.location ?? 'Warehouse'}</span>
                      <span>•</span>
                      <span>{item.supplier ?? 'Unknown'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{qty.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{item.unit ?? 'units'}</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Stock Level</span>
                  <span className="font-medium text-gray-700">{pct.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${styles.bar}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Item Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Inventory Item">
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'itemName', label: 'Item Name *', type: 'text', required: true, placeholder: 'Steel Sheets' },
            { id: 'category', label: 'Category', type: 'text', required: false, placeholder: 'Raw Material, Component...' },
            { id: 'quantity', label: 'Quantity *', type: 'number', required: true, placeholder: '100' },
            { id: 'unit', label: 'Unit', type: 'text', required: false, placeholder: 'kg, sheets, pieces...' },
            { id: 'reorderLevel', label: 'Reorder Level', type: 'number', required: false, placeholder: '20' },
            { id: 'unitCost', label: 'Unit Cost ($)', type: 'number', required: false, placeholder: '25.50' },
          ].map(f => (
            <div key={f.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} required={f.required} placeholder={f.placeholder}
                value={(form as any)[f.id]} onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {submitting ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StockLevels;
