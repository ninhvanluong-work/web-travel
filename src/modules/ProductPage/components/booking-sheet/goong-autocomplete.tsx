import { AnimatePresence, motion } from 'framer-motion';
import { Loader, MapPin, PenLine, Search } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useRef, useState } from 'react';

import { useDebounce } from '@/hooks/use-debounce';
import { goongService, type GoongSuggestion } from '@/lib/goong';

export interface GoongSelectData {
  placeId: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
}

interface GoongAutocompleteProps {
  onSelect: (data: GoongSelectData) => void;
  onClear: () => void;
  defaultValue?: string;
}

export default function GoongAutocomplete({ onSelect, onClear, defaultValue = '' }: GoongAutocompleteProps) {
  const { t } = useTranslation('productPage');
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<GoongSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [showNoResult, setShowNoResult] = useState(false);
  const sessionTokenRef = useRef(crypto.randomUUID());

  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    if (isManual || !debouncedQuery || debouncedQuery === defaultValue) {
      setSuggestions([]);
      setShowNoResult(false);
      return;
    }
    if (debouncedQuery.trim().length < 3) {
      setSuggestions([]);
      setShowNoResult(false);
      return;
    }
    const fetchSuggestions = async () => {
      setLoading(true);
      const res = await goongService.getSuggestions(debouncedQuery, sessionTokenRef.current);
      setSuggestions(res);
      setShowNoResult(res.length === 0);
      setLoading(false);
    };
    fetchSuggestions();
  }, [debouncedQuery, isManual, defaultValue]);

  const handleSelectSuggestion = async (item: GoongSuggestion) => {
    setLoading(true);
    setSuggestions([]);
    setShowNoResult(false);
    const detail = await goongService.getPlaceDetails(item.place_id, sessionTokenRef.current);
    if (detail) {
      onSelect({
        placeId: item.place_id,
        name: detail.name,
        address: detail.formatted_address,
        lat: detail.geometry?.location?.lat ?? null,
        lng: detail.geometry?.location?.lng ?? null,
      });
      setQuery(detail.name);
      sessionTokenRef.current = crypto.randomUUID();
    }
    setLoading(false);
  };

  const handleManualMode = () => {
    setIsManual(true);
    setSuggestions([]);
    setShowNoResult(false);
    if (query.trim()) {
      onSelect({
        placeId: 'manual',
        name: t('booking.manualAddressLabel'),
        address: query.trim(),
        lat: null,
        lng: null,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (isManual) {
      if (val.trim()) {
        onSelect({ placeId: 'manual', name: t('booking.manualAddressLabel'), address: val, lat: null, lng: null });
      } else {
        onClear();
      }
    }
  };

  const showDropdown = !isManual && (suggestions.length > 0 || showNoResult);

  return (
    <div className="w-full relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={isManual ? t('booking.manualPlaceholder') : t('booking.searchPlaceholder')}
          className="w-full pl-10 pr-10 py-3.5 border border-[#E5E5E5] rounded-[14px] text-[14px] focus:outline-none focus:border-[#0F6E56] transition-colors bg-white"
        />
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          {isManual ? <PenLine size={16} /> : <Search size={16} />}
        </span>
        {loading && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <Loader size={16} className="animate-spin text-[#0F6E56]" />
          </span>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.ul
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-20 w-full bg-white border border-[#E5E5E5] rounded-[14px] mt-1.5 shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-100"
          >
            {suggestions.map((item) => (
              <li
                key={item.place_id}
                onClick={() => handleSelectSuggestion(item)}
                className="flex items-start gap-3 px-4 py-3 hover:bg-[#F9F9F9] cursor-pointer transition-colors text-left"
              >
                <MapPin size={16} className="text-[#0F6E56] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[14px] font-semibold text-[#111]">{item.structured_formatting.main_text}</p>
                  <p className="text-[12px] text-[#666]">{item.structured_formatting.secondary_text}</p>
                </div>
              </li>
            ))}

            <li
              onClick={handleManualMode}
              className="flex items-center gap-2.5 px-4 py-3 text-[#0F6E56] hover:bg-[#F0F7F5] cursor-pointer font-medium text-[13px] border-t border-dashed border-[#0F6E56]/20"
            >
              <PenLine size={14} />
              <span>{t('booking.fallbackManual')}</span>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
