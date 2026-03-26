import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  actions
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {actions && <div className="flex items-center gap-4">{actions}</div>}
      </div>
      {children}
    </div>
  );
};

export default DashboardLayout;