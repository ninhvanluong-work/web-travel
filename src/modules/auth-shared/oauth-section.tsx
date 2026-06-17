import { useTranslation } from 'next-i18next';

import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';

interface OAuthSectionProps {
  namespace: 'signIn' | 'signUp';
}

export function OAuthSection({ namespace }: OAuthSectionProps) {
  const { t } = useTranslation('authPage');

  return (
    <div className="flex flex-col gap-3 mb-5">
      <Button
        variant="outline"
        size="icon"
        fullWidth
        blur={false}
        className="h-[52px] rounded-xl gap-3 text-caption1 font-medium font-dinpro"
      >
        <Icons.google className="w-[18px] h-[18px] shrink-0" />
        <span>{t(`${namespace}.googleButton`)}</span>
      </Button>

      <div className="flex items-center gap-3 mt-1">
        <div className="flex-1 h-px bg-neutral-200" />
        <span className="text-body4 text-neutral-400 font-dinpro">{t(`${namespace}.orDivider`)}</span>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>
    </div>
  );
}
