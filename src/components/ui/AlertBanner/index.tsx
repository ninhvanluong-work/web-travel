import Link from 'next/link';
import React from 'react';

import AlertErrorIcon from '@/assets/svg/alert-error.svg';
import AlertInfoIcon from '@/assets/svg/alert-info.svg';
import AlertSuccessIcon from '@/assets/svg/alert-success.svg';
import AlertWarningIcon from '@/assets/svg/alert-warning.svg';

interface AlertBannerProps {
  variant: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  showLink?: boolean;
  linkHref?: string;
  linkText?: string;
}

const variantClasses: Record<AlertBannerProps['variant'], { container: string; icon: string }> = {
  success: {
    container: 'border-success-500 bg-success-50 dark:border-success-500/30 dark:bg-success-500/15',
    icon: 'text-success-500',
  },
  error: {
    container: 'border-error-500 bg-error-50 dark:border-error-500/30 dark:bg-error-500/15',
    icon: 'text-error-500',
  },
  warning: {
    container: 'border-warning-500 bg-warning-50 dark:border-warning-500/30 dark:bg-warning-500/15',
    icon: 'text-warning-500',
  },
  info: {
    container: 'border-blue-light-500 bg-blue-light-50 dark:border-blue-light-500/30 dark:bg-blue-light-500/15',
    icon: 'text-blue-light-500',
  },
};

const icons: Record<AlertBannerProps['variant'], React.ElementType> = {
  success: AlertSuccessIcon,
  error: AlertErrorIcon,
  warning: AlertWarningIcon,
  info: AlertInfoIcon,
};

const AlertBanner: React.FC<AlertBannerProps> = ({
  variant,
  title,
  message,
  showLink = false,
  linkHref = '#',
  linkText = 'Learn more',
}) => {
  const { container, icon } = variantClasses[variant];
  const IconComponent = icons[variant];

  return (
    <div className={`rounded-xl border p-4 ${container}`}>
      <div className="flex items-start gap-3">
        <div className={`-mt-0.5 ${icon}`}>
          <IconComponent className="fill-current" width={24} height={24} />
        </div>

        <div>
          <h4 className="mb-1 text-sm font-semibold text-gray-800 dark:text-white/90">{title}</h4>

          <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>

          {showLink && (
            <Link
              href={linkHref}
              className="mt-3 inline-block text-sm font-medium text-gray-500 underline dark:text-gray-400"
            >
              {linkText}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertBanner;
