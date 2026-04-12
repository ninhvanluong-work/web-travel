import { Film, LayoutDashboard, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import Logo from '@/components/ui/logo-dashboard';
import { cn } from '@/lib/utils';
import { ROUTE } from '@/types/routes';

interface SidebarProps {
  isCollapsed?: boolean;
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Sản phẩm', href: ROUTE.ADMIN_PRODUCTS, icon: Package },
  { label: 'Video', href: ROUTE.ADMIN_VIDEOS, icon: Film },
];

function Sidebar({ isCollapsed }: SidebarProps) {
  const router = useRouter();

  return (
    <aside
      className={cn(
        'flex-shrink-0 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-full sm:w-64'
      )}
    >
      {/* Logo */}
      <div className="h-20 flex items-center justify-center border-b border-gray-200 dark:border-gray-800">
        <Logo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1 p-4">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact ? router.pathname === item.href : router.pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-main text-white'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className={cn('hidden sm:inline', isCollapsed && 'sm:hidden')}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <button className="w-full rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900">
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
