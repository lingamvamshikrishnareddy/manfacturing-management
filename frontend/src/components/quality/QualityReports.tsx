import React, { useState } from 'react';
import { Table } from '../shared/Table';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { FileText, Download, Filter } from 'lucide-react';

interface QualityReport {
  id: string;
  reportName: string;
  type: string;
  date: string;
  department: string;
  status: string;
  author: string;
  findings: string;
}

const QualityReports: React.FC = () => {
  const [reports, setReports] = useState<QualityReport[]>([
    {
      id: '1',
      reportName: 'Monthly Quality Audit',
      type: 'Audit',
      date: '2024-03-01',
      department: 'Production',
      status: 'Completed',
      author: 'Sarah Johnson',
      findings: 'All quality standards met'
    },
    // Add more sample data as needed
  ]);

  const columns = [
    { key: 'reportName', title: 'Report Name', sortable: true },
    { key: 'type', title: 'Type', sortable: true },
    { key: 'date', title: 'Date', sortable: true },
    { key: 'department', title: 'Department', sortable: true },
    { key: 'status', title: 'Status', sortable: true },
    { key: 'author', title: 'Author', sortable: true },
    {
      key: 'actions',
      title: 'Actions',
      render: () => (
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      )
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Quality Reports</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              New Report
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table 
          columns={columns}
          data={reports}
          onSort={(key, direction) => {
            const sorted = [...reports].sort((a, b) => {
              if (direction === 'asc') {
                return a[key as keyof QualityReport] > b[key as keyof QualityReport] ? 1 : -1;
              }
              return a[key as keyof QualityReport] < b[key as keyof QualityReport] ? 1 : -1;
            });
            setReports(sorted);
          }}
        />
      </CardContent>
    </Card>
  );
};

export default QualityReports;