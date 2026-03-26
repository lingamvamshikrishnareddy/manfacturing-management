import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices, getInvoice, InvoiceData } from '../services/api/subscriptionAPI';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Invoice Print / Download ─────────────────────────────────────────────────
function printInvoice(invoice: InvoiceData) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: #fff; color: #1e293b; padding: 48px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; }
    .brand { font-size: 22px; font-weight: 800; color: #7c3aed; }
    .brand small { display: block; font-size: 12px; font-weight: 400; color: #64748b; margin-top: 2px; }
    .invoice-meta { text-align: right; }
    .invoice-meta h2 { font-size: 28px; font-weight: 800; color: #0f172a; }
    .invoice-meta p { font-size: 13px; color: #64748b; margin-top: 2px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background: #dcfce7; color: #16a34a; margin-top: 6px; }
    .divider { height: 1px; background: #e2e8f0; margin: 32px 0; }
    .table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    .table th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; padding: 0 0 12px; }
    .table td { padding: 14px 0; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
    .amount-row { font-size: 16px; font-weight: 700; }
    .total-section { margin-top: 24px; padding: 20px; background: #f8fafc; border-radius: 12px; }
    .total-row { display: flex; justify-content: space-between; font-size: 14px; color: #64748b; margin-bottom: 8px; }
    .total-row.grand { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; }
    .footer { margin-top: 48px; font-size: 12px; color: #94a3b8; text-align: center; }
    @media print { body { padding: 0; } @page { margin: 20mm; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Manufacturing MMS<small>Manufacturing Management System</small></div>
    </div>
    <div class="invoice-meta">
      <h2>INVOICE</h2>
      <p>${invoice.invoiceNumber}</p>
      <p>Issued: ${formatDate(invoice.issuedAt)}</p>
      ${invoice.paidAt ? `<div class="badge">PAID</div>` : ''}
    </div>
  </div>

  <div class="divider"></div>

  <div style="display:flex;justify-content:space-between;margin-bottom:32px;">
    <div>
      <p style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:8px;">Billed To</p>
      <p style="font-weight:700;font-size:15px;">Account Holder</p>
    </div>
    <div style="text-align:right;">
      <p style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:8px;">Payment Method</p>
      <p style="font-weight:700;font-size:15px;">${invoice.paymentGateway === 'razorpay' ? 'Razorpay' : 'Dodo Payments'}</p>
      ${invoice.paymentId ? `<p style="font-size:12px;color:#94a3b8;margin-top:2px;">ID: ${invoice.paymentId}</p>` : ''}
    </div>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th>Description</th>
        <th>Period</th>
        <th>Billing</th>
        <th style="text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${invoice.planName} Plan Subscription</td>
        <td>${formatDate(invoice.periodStart)} – ${formatDate(invoice.periodEnd)}</td>
        <td style="text-transform:capitalize;">${invoice.interval}</td>
        <td style="text-align:right;" class="amount-row">${fmt(invoice.amount, invoice.currency)}</td>
      </tr>
    </tbody>
  </table>

  <div class="total-section">
    <div class="total-row"><span>Subtotal</span><span>${fmt(invoice.amount, invoice.currency)}</span></div>
    <div class="total-row"><span>Tax (GST)</span><span>Included</span></div>
    <div class="total-row grand"><span>Total Paid</span><span>${fmt(invoice.amount, invoice.currency)}</span></div>
  </div>

  <div class="footer">
    <p>Thank you for your business!</p>
    <p>Manufacturing MMS · support@mms.com · www.mms.com</p>
  </div>

  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, { bg: string; color: string }> = {
    paid: { bg: '#dcfce7', color: '#16a34a' },
    pending: { bg: '#fef9c3', color: '#ca8a04' },
    cancelled: { bg: '#fee2e2', color: '#dc2626' },
  };
  const c = colors[status] || colors.pending;
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: 11,
      fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
      background: c.bg, color: c.color,
    }}>
      {status}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const InvoiceHistory: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  const fetchInvoices = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await getInvoices(page);
      if (data) {
        setInvoices(data.invoices || []);
        setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvoices(1); }, [fetchInvoices]);

  const handleDownload = async (invoiceId: string) => {
    setDownloading(invoiceId);
    try {
      const inv = await getInvoice(invoiceId);
      if (inv) printInvoice(inv);
    } catch {
      alert('Failed to load invoice');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', margin: 0 }}>Invoice History</h1>
            <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>
              {pagination.total} invoice{pagination.total !== 1 ? 's' : ''} total
            </p>
          </div>
          <button
            onClick={() => navigate('/subscription')}
            style={{
              padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff',
              fontWeight: 700, fontSize: 14,
            }}
          >
            ← Back to Subscription
          </button>
        </div>

        {/* Table */}
        <div style={{
          background: '#fff', borderRadius: 18, overflow: 'hidden',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr 0.8fr 0.8fr auto',
            padding: '14px 24px', background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
          }}>
            {['Invoice', 'Date', 'Plan', 'Amount', 'Status', 'Action'].map((h) => (
              <div key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: '#94a3b8' }}>
                {h}
              </div>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
              <div style={{
                width: 36, height: 36, border: '4px solid #e2e8f0', borderTopColor: '#7c3aed',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              Loading invoices…
            </div>
          ) : invoices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🧾</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: '#1e293b', marginBottom: 6 }}>No invoices yet</div>
              <div style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20 }}>
                Your invoices will appear here after your first payment.
              </div>
              <button
                onClick={() => navigate('/subscription')}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff',
                  fontWeight: 700, fontSize: 14,
                }}
              >
                View Plans
              </button>
            </div>
          ) : (
            invoices.map((inv, i) => (
              <div
                key={inv._id}
                style={{
                  display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr 0.8fr 0.8fr auto',
                  padding: '16px 24px', alignItems: 'center',
                  borderBottom: i < invoices.length - 1 ? '1px solid #f1f5f9' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#fafafa'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{inv.invoiceNumber}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                    {inv.paymentGateway === 'razorpay' ? '🟣 Razorpay' : '🔵 Dodo'}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#475569' }}>{formatDate(inv.issuedAt)}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{inv.planName}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{fmt(inv.amount, inv.currency)}</div>
                <div><StatusBadge status={inv.status} /></div>
                <div>
                  <button
                    onClick={() => handleDownload(inv._id)}
                    disabled={downloading === inv._id}
                    title="Download / Print Invoice"
                    style={{
                      padding: '7px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0',
                      background: '#fff', cursor: downloading === inv._id ? 'wait' : 'pointer',
                      fontSize: 13, fontWeight: 600, color: '#7c3aed',
                      display: 'flex', alignItems: 'center', gap: 6,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.background = '#7c3aed';
                      el.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.background = '#fff';
                      el.style.color = '#7c3aed';
                    }}
                  >
                    {downloading === inv._id ? '⏳' : '⬇'} PDF
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => fetchInvoices(p)}
                style={{
                  width: 36, height: 36, borderRadius: 8, border: '1.5px solid',
                  borderColor: p === pagination.page ? '#7c3aed' : '#e2e8f0',
                  background: p === pagination.page ? '#7c3aed' : '#fff',
                  color: p === pagination.page ? '#fff' : '#475569',
                  cursor: 'pointer', fontWeight: 600, fontSize: 14,
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceHistory;
