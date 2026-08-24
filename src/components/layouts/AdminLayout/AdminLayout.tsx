import { useRouter } from 'next/router';
import { type ReactNode, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { ROUTE } from '@/types';

import AdminHeader from './AdminHeader';
import Sidebar from './Sidebar';

interface Props {
  children: ReactNode;
}

const AdminLayout = ({ children }: Props) => {
  const router = useRouter();
  const { isLoggedIn, isAdmin } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAdmin) {
      router.replace({ pathname: ROUTE.ADMIN_LOGIN, query: { callbackUrl: router.asPath } });
    }
  }, [mounted, isLoggedIn, isAdmin, router]);

  if (!mounted || !isAdmin) return null;

  return (
    <div className="flex h-screen bg-[#F1F5F9] dark:bg-gray-950 overflow-hidden">
      <Sidebar isCollapsed={isCollapsed} />
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-clip">
        <AdminHeader onToggle={() => setIsCollapsed(!isCollapsed)} />
        <main className="p-6">
          <div className="mx-auto max-w-[2420px]">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
