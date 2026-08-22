import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';

export function AdminLoginBranding() {
  const { t } = useTranslation('adminPage');

  return (
    <div
      className="relative flex w-1/2 flex-col items-center justify-center overflow-hidden"
      style={{ background: '#0A122A' }}
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
            'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '48px 48px',
        }}
      />

      {/* Blue radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(37,99,235,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Top-right corner accent */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-64 w-64"
        style={{
          background: 'radial-gradient(circle at top right, rgba(37,99,235,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Center content */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center px-16 text-center"
      >
        {/* Logo badge */}
        <div
          className="mb-7 flex h-[72px] w-[72px] items-center justify-center rounded-2xl"
          style={{
            background: 'rgba(37,99,235,0.15)',
            border: '1px solid rgba(37,99,235,0.35)',
            boxShadow: '0 0 40px rgba(37,99,235,0.15)',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9" style={{ color: '#93C5FD' }}>
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 className="mb-3 text-[1.875rem] font-bold tracking-tight" style={{ color: '#F1F5F9' }}>
          WebTravel Admin
        </h2>

        <div
          className="mb-5 h-[2px] w-12 rounded-full"
          style={{ background: 'linear-gradient(to right, transparent, #3B82F6, transparent)' }}
        />

        <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
          {t('adminLogin.brandSubtitle')}
        </p>
        <p className="mt-1 text-[0.8125rem]" style={{ color: '#475569' }}>
          {t('adminLogin.brandTagline')}
        </p>

        <div className="mt-10 flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: i === 2 ? '#3B82F6' : 'rgba(59,130,246,0.3)' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.07 }}
            />
          ))}
        </div>
      </motion.div>

      {/* Theme toggle — bottom right (decorative) */}
      <div className="absolute bottom-8 right-8 z-10">
        <button
          type="button"
          aria-label="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-full transition-all hover:brightness-125"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
