import 'react-phone-number-input/style.css';

import * as React from 'react';
import ReactPhoneInput, { type Country } from 'react-phone-number-input';

import { cn } from '@/lib/utils';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  defaultCountry?: Country;
  placeholder?: string;
  className?: string;
}

export function PhoneInput({ value, onChange, defaultCountry = 'VN', placeholder, className }: PhoneInputProps) {
  return (
    <div className={cn('phone-input-wrapper', className)}>
      <ReactPhoneInput
        international
        countryCallingCodeEditable={false}
        defaultCountry={defaultCountry}
        value={value}
        onChange={(v) => onChange(v ?? '')}
        placeholder={placeholder}
      />
    </div>
  );
}
