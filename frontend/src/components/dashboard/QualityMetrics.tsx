// components/dashboard/QualityMetrics.tsx
import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Shield, CheckCircle, XCircle, ClipboardCheck, ArrowRight } from 'lucide-react';
import { ChartSkeleton } from '../ui/Skeleton';

interface QualityData {
  date: string;
  defectRate: number;
  passRate: number;
  inspectionCount: number;
}

const QualityMetrics: React.FC = () => {
  const [metrics, setMetrics] = React.useState<QualityData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = React.useState<'day' | 'week' | 'month'>('week');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const mockData: QualityData[] = [
        { date: 'Mon', defectRate: 2.3, passRate: 97.7, inspectionCount: 150 },
        { date: 'Tue', defectRate: 1.8, passRate: 98.2, inspectionCount: 160 },
        { date: 'Wed', defectRate: 2.1, passRate: 97.9, inspectionCount: 145 },
        { date: 'Thu', defectRate: 1.5, passRate: 98.5, inspectionCount: 170 },
        { date: 'Fri', defectRate: 1.9, passRate: 98.1, inspectionCount: 155 },
        { date: 'Sat', defectRate: 1.2, passRate: 98.8, inspectionCount: 120 },
        { date: 'Sun', defectRate: 1.4, passRate: 98.6, inspectionCount: 95 },
      ];
      setMetrics(mockData);
      setLoading(false);
    }, 800);
  }, [selectedPeriod]);

  const avgPassRate = metrics.length > 0 
    ? (metrics.reduce((acc, curr) => acc + curr.passRate, 0) / metrics.length).toFixed(1)
    : '0';
  
  const avgDefectRate = metrics.length > 0 
    ? (metrics.reduce((acc, curr) => acc + curr.defectRate, 0) / metrics.length).toFixed(1)
    : '0';

  const totalInspections = metrics.reduce((acc, curr) => acc + curr.inspectionCount, 0);

  const periodOptions = [
    { value: 'day', label: 'Daily' },
    { value: 'week', label: 'Weekly' },
    { value: 'month', label: 'Monthly' },
  ];

  const statCards = [
    {
      title: 'Average Pass Rate',
      value: `${avgPassRate}%`,
      trend: '+0.5%',
      trendUp: true,
      icon: CheckCircle,
      color: 'green',
    },
    {
      title: 'Defect Rate',
      value: `${avgDefectRate}%`,
      trend: '-0.3%',
      trendUp: true,
      icon: XCircle,
      color: 'red',
    },
    {
      title: 'Total Inspections',
      value: totalInspections.toString(),
      trend: '+12',
      trendUp: true,
      icon: ClipboardCheck,
      color: 'blue',
    },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card">
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-100 rounded-xl">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Quality Metrics</h2>
              <p className="text-sm text-gray-500">Real-time quality performance</p>
            </div>
          </div>
          
          {/* Period Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedPeriod(option.value as 'day' | 'week' | 'month')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedPeriod === option.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {statCards.map((stat, index) => (
            <div 
              key={stat.title}
              className="bg-gray-50 rounded-xl p-3 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-1">
                <stat.icon className={`w-4 h-4 text-${stat.color}-500`} />
                <span className={`text-xs font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend}
                </span>
              </div>
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Trend Analysis</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={metrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="passRateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="defectRateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Area 
              type="monotone" 
              dataKey="passRate" 
              name="Pass Rate"
              stroke="#22c55e" 
              strokeWidth={2}
              fill="url(#passRateGradient)"
            />
            <Area 
              type="monotone" 
              dataKey="defectRate" 
              name="Defect Rate"
              stroke="#ef4444" 
              strokeWidth={2}
              fill="url(#defectRateGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <button className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
          View Detailed Report <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default QualityMetrics;
