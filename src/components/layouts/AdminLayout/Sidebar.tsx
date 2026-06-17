import 'animate.css';

import { Film, LayoutDashboard, LogOut, Package, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import Logo from '@/components/ui/logo-dashboard';
import { cn } from '@/lib/utils';
import { ROUTE } from '@/types/routes';

interface SidebarProps {
  isCollapsed?: boolean;
}

const NAV_ITEMS = [
  { labelKey: 'dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { labelKey: 'products', href: ROUTE.ADMIN_PRODUCTS, icon: Package },
  { labelKey: 'guides', href: ROUTE.ADMIN_GUIDES, icon: Users },
  { labelKey: 'videos', href: ROUTE.ADMIN_VIDEOS, icon: Film },
];

function Sidebar({ isCollapsed }: SidebarProps) {
  const router = useRouter();
  const { t } = useTranslation('adminPage');

  return (
    <aside
      className={cn(
        'group/sidebar flex-shrink-0 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 z-50',
        isCollapsed ? 'w-[96px] hover:w-[280px] hover:shadow-2xl' : 'w-[280px]'
      )}
    >
      {/* Logo */}
      <div className="h-20 flex items-center justify-center border-b border-gray-200 dark:border-gray-800 overflow-hidden whitespace-nowrap">
        <Logo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-[6px] p-[16px]">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact ? router.pathname === item.href : router.pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-[16px] rounded-xl px-[20px] py-[14px] text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-main text-white'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900'
                  )}
                >
                  <Icon className="h-[24px] w-[24px] flex-shrink-0" />
                  <span
                    className={cn(
                      'whitespace-nowrap overflow-hidden transition-all duration-300',
                      isCollapsed
                        ? 'hidden group-hover/sidebar:inline-block animate__animated animate__slideInLeft animate__faster'
                        : 'inline-block'
                    )}
                  >
                    {t(item.labelKey)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-[16px] overflow-hidden">
        <button className="flex w-full items-center gap-[16px] rounded-xl px-[20px] py-[14px] text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900 whitespace-nowrap">
          <LogOut className="h-[24px] w-[24px] flex-shrink-0" />
          <span
            className={cn(
              'transition-all duration-300',
              isCollapsed
                ? 'hidden group-hover/sidebar:inline-block animate__animated animate__slideInLeft animate__faster'
                : 'inline-block'
            )}
          >
            {t('logout')}
          </span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
