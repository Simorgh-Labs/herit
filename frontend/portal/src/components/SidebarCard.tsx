import type { ReactNode } from 'react';

interface SidebarCardProps {
  children: ReactNode;
  className?: string;
}

export default function SidebarCard({ children, className = '' }: SidebarCardProps) {
  return (
    <div className={`bg-white rounded-2xl p-6 border border-gray-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
