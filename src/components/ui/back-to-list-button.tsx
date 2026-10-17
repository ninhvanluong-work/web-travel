import { List } from 'lucide-react';
import { useRouter } from 'next/router';

import { Button } from '@/components/ui/button';

interface BackToListButtonProps {
  label: string;
  /** Navigate here on click (ignored when `onClick` is provided) */
  href?: string;
  /** Custom handler, e.g. to show an "unsaved changes" confirmation first */
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * Admin form header button. Saving keeps the user on the form page;
 * this is the explicit way back to the list.
 */
export function BackToListButton({ label, href, onClick, disabled }: BackToListButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) onClick();
    else if (href) router.push(href);
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="xs"
      rounded="md"
      blur={false}
      className="flex items-center gap-2 px-4 border border-gray-300"
      onClick={handleClick}
      disabled={disabled}
    >
      <List size={14} />
      {label}
    </Button>
  );
}
