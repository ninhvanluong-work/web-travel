import { useDisclosure } from '@mantine/hooks';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

import { Icons } from '@/assets/icons';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useLogout } from '@/hooks/useLogout';
import { useUserStore } from '@/stores/UserStore';
import { ROUTE } from '@/types';

function getInitials(name?: string | null, firstName?: string, lastName?: string): string {
  const full = name ?? [firstName, lastName].filter(Boolean).join(' ');
  if (!full) return '?';
  return full
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getDisplayName(name?: string | null, firstName?: string, lastName?: string, email?: string): string {
  return (name ?? [firstName, lastName].filter(Boolean).join(' ')) || email || '';
}

const stagger = {
  hidden: { opacity: 0, y: 8 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.22, ease: 'easeOut' },
  }),
};

export default function UserMenu() {
  const { t } = useTranslation('homePage');
  const [open, { toggle, close }] = useDisclosure(false);
  const user = useUserStore.use.user();
  const accessToken = useUserStore.use.accessToken();
  const { handleLogout, isLoading } = useLogout();

  const isLoggedIn = !!accessToken;
  const initials = getInitials(user?.name, user?.firstName, user?.lastName);
  const displayName = getDisplayName(user?.name, user?.firstName, user?.lastName, user?.email);

  if (!isLoggedIn) {
    return (
      <Link
        href={ROUTE.SIGN_IN}
        className="fixed top-4 left-4 z-40 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-white text-xs font-semibold border border-white/20 active:scale-95 transition-transform"
      >
        {t('userMenu.signIn')}
      </Link>
    );
  }

  return (
    <>
      <motion.button
        onClick={toggle}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.12 }}
        className="fixed top-4 left-4 z-40 h-11 w-11 rounded-full bg-black/40 backdrop-blur-md border border-white/25 flex items-center justify-center text-white text-[15px] font-bold shadow-lg"
        aria-label="User menu"
      >
        {initials}
      </motion.button>

      <Sheet open={open} onOpenChange={toggle}>
        <SheetContent side="bottom" className="rounded-t-3xl pb-safe bg-white px-0 pt-0 border-0 shadow-2xl">
          <SheetHeader className="sr-only">
            <SheetTitle>{t('userMenu.account')}</SheetTitle>
            <SheetDescription>{t('userMenu.accountDesc')}</SheetDescription>
          </SheetHeader>

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-9 h-1 rounded-full bg-neutral-200" />
          </div>

          <div className="px-5 pt-4 pb-6 space-y-1">
            {/* Profile section */}
            <motion.div
              custom={0}
              variants={stagger}
              initial="hidden"
              animate="show"
              className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-neutral-50"
            >
              {/* Gradient avatar */}
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center text-white text-[18px] font-bold shrink-0 shadow-md">
                {initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[15px] font-semibold text-neutral-900 truncate leading-tight">{displayName}</span>
                <span className="text-[12px] text-neutral-400 truncate mt-0.5">{user?.email}</span>
              </div>
            </motion.div>

            {/* Divider */}
            <div className="pt-2" />

            {/* Logout row */}
            <motion.button
              custom={1}
              variants={stagger}
              initial="hidden"
              animate="show"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                close();
                handleLogout();
              }}
              disabled={isLoading}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-50 text-red-600 active:bg-red-100 transition-colors disabled:opacity-50"
            >
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                {isLoading ? <Icons.spinner className="h-5 w-5 animate-spin" /> : <Icons.logout size={20} />}
              </div>
              <span className="text-[15px] font-semibold">{t('userMenu.signOut')}</span>
              <Icons.chevronRight size={18} className="ml-auto text-red-300" />
            </motion.button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
