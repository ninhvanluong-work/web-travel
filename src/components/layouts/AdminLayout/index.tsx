import { BookOpen, LayoutDashboard, MapPin, Package, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';

import Logo from '@/components/ui/logo-dashboard';
import { cn } from '@/lib/utils';
import { ROUTE } from '@/types/routes';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Sản phẩm', href: ROUTE.ADMIN_PRODUCTS, icon: Package },
  { label: 'Nhà cung cấp', href: '/admin/suppliers', icon: Users },
  { label: 'Điểm đến', href: '/admin/destinations', icon: MapPin },
  { label: 'Đặt tour', href: '/admin/bookings', icon: BookOpen },
];

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { pathname } = useRouter();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-100">
          <Logo width={32} height={32} />
          <span className="font-bold text-sm text-gray-900 whitespace-nowrap">Travel Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ label, href, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  active ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                )}
              >
                <Icon size={16} className={active ? 'text-white' : 'text-gray-400'} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            ← Về trang chủ
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
