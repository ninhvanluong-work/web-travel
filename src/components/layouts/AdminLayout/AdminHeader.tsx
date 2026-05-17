import React from 'react';

import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';

interface Props {
  onToggle: () => void;
}

const AdminHeader = ({ onToggle }: Props) => {
  return (
    <header className="sticky top-0 z-40 flex w-full bg-white border-b border-gray-200 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between grow px-4 py-4 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 lg:gap-4">
          <Button
            variant="ghost"
            size="xs"
            onClick={onToggle}
            blur={false}
            className="h-10 w-10 p-0 hover:bg-gray-50 dark:hover:bg-gray-800 border-none"
          >
            <Icons.menu size={24} className="text-gray-600 dark:text-gray-400" />
          </Button>

          <div className="hidden sm:block">{/* Title removed per user request */}</div>
        </div>

        <div className="flex items-center gap-3">
          {/* Placeholder for future user/notification items to match TailAdmin layout */}
          <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
