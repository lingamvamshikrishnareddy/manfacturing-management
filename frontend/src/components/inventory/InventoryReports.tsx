import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Download, Calendar, RefreshCw } from 'lucide-react';

interface InventoryReport {
  date: string;
  totalValue: number;
  itemCount: number;
  lowStock: number;
  turnoverRate: number;
  categories: {
    name: string;
    value: number;
    percentage: number;
  }[];
}

interface MovementData {
  date: string;
  received: number;
  shipped: number;
  returned: number;
}

const InventoryReports: React.FC = () => {
  const [reportData, setReportData] = React.useState<InventoryReport | null>(null);
  const [movementData, setMovementData] = React.useState<MovementData[]>([]);
  const [dateRange, setDateRange] = React.useState<'week' | 'month' | 'quarter'>('month');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setIsLoading(true);
    // TODO: Replace with actual API call
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockReport: InventoryReport = {
      date: new Date().toISOString(),
      totalValue: 1250000,
      itemCount: 1500,
      lowStock: 23,
      turnoverRate: 4.2,
      categories: [
        { name: 'Raw Materials', value: 450000, percentage: 36 },
        { name: 'Work in Progress', value: 300000, percentage: 24 },
        { name: 'Finished Goods', value: 500000, percentage: 40 }
      ]
    };

    const mockMovement: MovementData[] = [
      { date: '2024-01-01', received: 150, shipped: 120, returned: 5 },
      { date: '2024-01-02', received: 180, shipped: 160, returned: 8 },
      // Add more mock data...
    ];

    setReportData(mockReport);
    setMovementData(mockMovement);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold">Inventory Reports</h2>
          <p className="text-sm text-gray-500">Inventory analysis and trends</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => fetchReportData()}
            className="p-2 hover:bg-gray-100 rounded-lg"
            disabled={isLoading}
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
          <select
            className="border rounded-lg px-3 py-2"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as 'week' | 'month' | 'quarter')}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
          </select>
        </div>
      </div>

      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm text-gray-500">Total Inventory Value</h3>
            <p className="text-2xl font-semibold mt-1">
              ${reportData.totalValue.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm text-gray-500">Total Items</h3>
            <p className="text-2xl font-semibold mt-1">
              {reportData.itemCount.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm text-gray-500">Low Stock Items</h3>
            <p className="text-2xl font-semibold mt-1 text-yellow-600">
              {reportData.lowStock}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm text-gray-500">Inventory Turnover</h3>
            <p className="text-2xl font-semibold mt-1">
              {reportData.turnoverRate.toFixed(1)}x
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-medium mb-4">Inventory Movement</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={movementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="received" stroke="#10B981" name="Received" />
              <Line type="monotone" dataKey="shipped" stroke="#3B82F6" name="Shipped" />
              <Line type="monotone" dataKey="returned" stroke="#EF4444" name="Returned" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-medium mb-4">Inventory by Category</h3>
          {reportData && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.categories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6" name="Value ($)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryReports;