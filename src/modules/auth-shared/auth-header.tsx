import Link from 'next/link';

import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AuthHeaderProps {
  backHref: string;
  className?: string;
}

export function AuthHeader({ backHref, className }: AuthHeaderProps) {
  return (
    <div className={cn('flex items-center px-5 h-[60px]', className)}>
      <Button variant="icon" size="icon" asChild className="w-10 h-10 rounded-full">
        <Link href={backHref}>
          <Icons.chevronLeft className="w-5 h-5 text-neutral-black" />
        </Link>
      </Button>
    </div>
  );
}
