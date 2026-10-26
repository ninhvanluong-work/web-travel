import { Check, Copy, Eye, EyeOff, Wand2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { forwardRef, useState } from 'react';

import { generateRandomPassword } from '@/lib/password';
import { cn } from '@/lib/utils';
import { USER_PASSWORD_MAX } from '@/lib/validations/admin-user';

import { USER_NS } from '../constants';

interface PasswordFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  'aria-describedby'?: string;
}

const iconBtnClass =
  'flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:opacity-50 dark:hover:bg-white/10';

/** Password input with show/hide, generate and copy. Never trims or normalizes the value. */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ id, value, onChange, invalid, disabled, 'aria-describedby': describedBy }, ref) => {
    const { t } = useTranslation(USER_NS);
    const [visible, setVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = () => {
      onChange(generateRandomPassword(12));
      // Show it so the admin can read/copy what was generated
      setVisible(true);
    };

    const handleCopy = async () => {
      if (!value) return;
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        // Clipboard unavailable (insecure context): the value is still visible to copy manually
      }
    };

    return (
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            ref={ref}
            id={id}
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            maxLength={USER_PASSWORD_MAX}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            placeholder={t('passwordPlaceholder')}
            className={cn(
              'w-full h-11 pl-[14px] pr-20 rounded-lg border text-sm text-gray-800 bg-white outline-none transition-colors placeholder:font-light focus-visible:border-brand-300 focus-visible:ring-2 focus-visible:ring-brand-500/10 disabled:opacity-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white/90',
              invalid ? 'border-red-400' : 'border-input'
            )}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <button
              type="button"
              className={iconBtnClass}
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? t('hidePassword') : t('showPassword')}
              disabled={disabled}
            >
              {visible ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button
              type="button"
              className={iconBtnClass}
              onClick={handleCopy}
              aria-label={copied ? t('copied') : t('copyPassword')}
              disabled={disabled || !value}
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={disabled}
          className="h-11 shrink-0 inline-flex items-center gap-1.5 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          <Wand2 size={14} />
          {t('generatePassword')}
        </button>
      </div>
    );
  }
);
PasswordField.displayName = 'PasswordField';
