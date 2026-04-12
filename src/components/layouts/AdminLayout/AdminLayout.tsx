import { type ReactNode, useState } from 'react';

import AdminHeader from './AdminHeader';
import Sidebar from './Sidebar';

interface Props {
  children: ReactNode;
}

const AdminLayout = ({ children }: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#F1F5F9] dark:bg-gray-950 overflow-hidden">
      {/* Sidebar - Fixed Left */}
      <Sidebar isCollapsed={isCollapsed} />

      {/* Main Area (Header + Content) - Right Column */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <AdminHeader onToggle={() => setIsCollapsed(!isCollapsed)} />
        <main className="p-4 md:p-6 2xl:p-10">
          <div className="mx-auto max-w-[2420px]">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
