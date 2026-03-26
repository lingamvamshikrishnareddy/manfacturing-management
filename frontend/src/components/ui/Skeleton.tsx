// components/ui/Skeleton.tsx
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'default',
  width,
  height,
  ...props
}) => {
  const baseStyles = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]';
  
  const variants = {
    default: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      style={{
        width: width,
        height: height,
      }}
      {...props}
    />
  );
};

// Card Skeleton
interface CardSkeletonProps {
  showHeader?: boolean;
  showContent?: boolean;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  showHeader = true,
  showContent = true,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-card p-6 space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width={150} height={24} />
          <Skeleton variant="circular" width={32} height={32} />
        </div>
      )}
      {showContent && (
        <div className="space-y-3">
          <Skeleton variant="text" width="100%" height={16} />
          <Skeleton variant="text" width="80%" height={16} />
          <Skeleton variant="text" width="60%" height={16} />
        </div>
      )}
    </div>
  );
};

// Table Row Skeleton
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => {
  return (
    <tr className="animate-fade-in-up">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <Skeleton variant="text" height={16} />
        </td>
      ))}
    </tr>
  );
};

// KPI Card Skeleton
export const KPICardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="text" width={100} height={16} />
        <Skeleton variant="circular" width={40} height={40} />
      </div>
      <Skeleton variant="text" width={80} height={36} className="mb-2" />
      <Skeleton variant="text" width={60} height={14} />
    </div>
  );
};

// Chart Skeleton
export const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton variant="text" width={150} height={20} />
        <div className="flex gap-2">
          <Skeleton variant="circular" width={60} height={24} />
          <Skeleton variant="circular" width={60} height={24} />
        </div>
      </div>
      <Skeleton variant="default" width="100%" height={250} />
    </div>
  );
};

// Profile Card Skeleton
export const ProfileCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={60} height={60} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width={120} height={18} />
          <Skeleton variant="text" width={80} height={14} />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton variant="text" width="100%" height={14} />
        <Skeleton variant="text" width="80%" height={14} />
      </div>
    </div>
  );
};

export default Skeleton;
