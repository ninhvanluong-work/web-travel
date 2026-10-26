import { Info, Lock } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useFormContext, useWatch } from 'react-hook-form';

import { USER_ROLES, type UserRole } from '@/api/user/types';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AdminUserFormValues } from '@/lib/validations/admin-user';

import { PasswordField } from '../../../components/password-field';
import { USER_NS } from '../../../constants';

const labelClass = 'text-[13px] text-slate-500 font-medium';

interface AccountSectionProps {
  isEdit: boolean;
  /** Roles the actor may pick; others are listed but disabled */
  roleOptions: UserRole[];
  /** Why the role cannot be changed, if it cannot */
  roleLockReason: string | null;
  autoFocusEmail: boolean;
}

export function AccountSection({ isEdit, roleOptions, roleLockReason, autoFocusEmail }: AccountSectionProps) {
  const { control } = useFormContext<AdminUserFormValues>();
  const { t } = useTranslation(USER_NS);
  const role = useWatch({ control, name: 'role' });

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className={labelClass}>
              {t('emailLabel')} {isEdit ? null : <span className="text-red-500">*</span>}
            </FormLabel>
            <FormControl>
              <Input
                size="sm"
                type="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="off"
                autoFocus={autoFocusEmail}
                placeholder={t('emailPlaceholder')}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className={labelClass}>{t('nameLabel')}</FormLabel>
            <FormControl>
              <Input size="sm" autoComplete="off" placeholder={t('namePlaceholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="role"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className={labelClass}>{t('roleLabel')}</FormLabel>
            {/* Radix emits '' when its item set changes under it (e.g. after form.reset), so the
                item list stays fixed and empty values are ignored */}
            <Select
              value={field.value}
              onValueChange={(value) => value && field.onChange(value)}
              disabled={!!roleLockReason}
            >
              <FormControl>
                <SelectTrigger className="h-11 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {USER_ROLES.map((r) => (
                  <SelectItem key={r} value={r} disabled={r !== role && !roleOptions.includes(r)}>
                    {t(`role_${r}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {roleLockReason ? (
              <p className="flex items-center gap-1.5 text-xs text-gray-500">
                <Lock size={12} />
                {roleLockReason}
              </p>
            ) : null}
            <FormMessage />
          </FormItem>
        )}
      />

      {role === 'tour_guide' && !isEdit ? (
        <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-800 ring-1 ring-amber-200">
          <Info size={14} className="mt-px shrink-0" />
          {t('tourGuideWarning')}
        </p>
      ) : null}

      {isEdit ? null : (
        <FormField
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className={labelClass}>
                {t('passwordLabel')} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <PasswordField value={field.value ?? ''} onChange={field.onChange} invalid={!!fieldState.error} />
              </FormControl>
              {fieldState.error ? null : <p className="text-xs text-gray-400">{t('passwordHint')}</p>}
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
