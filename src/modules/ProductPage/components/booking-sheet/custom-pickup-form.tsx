import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Map } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import type { ApiPickupLocation } from '@/api/option/types';
import { goongService, TOUR_HUB_COORDS } from '@/lib/goong';
import type { CustomPickupLocation } from '@/stores/BookingStore';
import { useBookingStore } from '@/stores/BookingStore';

import GoongAutocomplete, { type GoongSelectData } from './goong-autocomplete';
import MapPreviewSheet from './map-preview-sheet';

interface CustomPickupFormProps {
  pickupLocations: ApiPickupLocation[];
  currency: string;
}

export default function CustomPickupForm({ pickupLocations, currency }: CustomPickupFormProps) {
  const { t } = useTranslation('productPage');
  const [isMapOpen, setIsMapOpen] = useState(false);

  const packageType = useBookingStore.use.packageType();
  const customPickup = useBookingStore.use.customPickup();
  const setCustomPickup = useBookingStore.use.setCustomPickup();

  const basicPickupFee = currency === '₫' ? 100000 : 5;
  const distanceSurchargePerKm = currency === '₫' ? 20000 : 1;

  const handleSelect = async (data: GoongSelectData & { isPredefined?: boolean }) => {
    let distance = 0;
    let surcharge = 0;

    if (packageType === 'basic' && !data.isPredefined) {
      surcharge += basicPickupFee;
    }

    if (data.lat && data.lng) {
      const element = await goongService.getRoadDistance(TOUR_HUB_COORDS, { lat: data.lat, lng: data.lng });
      if (element && element.status === 'OK') {
        distance = element.distance.value;
        if (distance > 5000) {
          surcharge += Math.ceil((distance - 5000) / 1000) * distanceSurchargePerKm;
        }
      }
    }

    const pickup: CustomPickupLocation = {
      placeId: data.placeId,
      name: data.name,
      formattedAddress: data.address,
      lat: data.lat,
      lng: data.lng,
      distanceMeter: distance,
      surcharge,
    };
    setCustomPickup(pickup);
  };

  return (
    <div className="flex flex-col gap-3">
      <GoongAutocomplete
        defaultValue={customPickup?.formattedAddress || ''}
        onSelect={handleSelect}
        onClear={() => setCustomPickup(null)}
      />

      {/* Quick-suggest chips */}
      {pickupLocations.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[12px] text-[#666]">{t('booking.quickSuggest')}</span>
          {pickupLocations.slice(0, 3).map((point) => (
            <button
              key={point.id}
              onClick={() =>
                handleSelect({
                  placeId: point.id,
                  name: point.name,
                  address: point.address || point.name,
                  lat: TOUR_HUB_COORDS.lat,
                  lng: TOUR_HUB_COORDS.lng,
                  isPredefined: true,
                })
              }
              className="px-3 py-1.5 bg-[#F0F7F5] text-[#0F6E56] text-[12px] font-semibold rounded-full hover:bg-[#E0EFEA] transition-colors"
            >
              {point.name}
            </button>
          ))}
        </div>
      )}

      {/* View on map button */}
      <AnimatePresence>
        {customPickup?.lat && customPickup?.lng && (
          <motion.button
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            onClick={() => setIsMapOpen(true)}
            className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-white border border-[#0F6E56] rounded-[14px] text-[#0F6E56] text-[14px] font-semibold"
          >
            <Map size={18} />
            {t('booking.viewOnMap')}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Surcharge warning */}
      <AnimatePresence>
        {customPickup && customPickup.surcharge > 0 && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#FFF4EC] border border-[#FFE0C2] rounded-[12px] p-3.5 flex items-start gap-2.5 text-left"
          >
            <AlertTriangle className="text-[#FF8000] flex-shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-[13px] font-bold text-[#D46A00]">{t('booking.surchargeBanner')}</p>
              <p className="text-[12px] text-[#804000] mt-0.5 leading-relaxed">
                {t('booking.surchargeDetail', {
                  km: (customPickup.distanceMeter / 1000).toFixed(1),
                  amount:
                    currency === '₫'
                      ? `₫${customPickup.surcharge.toLocaleString('vi-VN')}`
                      : `$${customPickup.surcharge.toLocaleString('en-US')}`,
                })}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MapPreviewSheet
        isOpen={isMapOpen}
        pickup={
          customPickup?.lat && customPickup?.lng
            ? { lat: customPickup.lat, lng: customPickup.lng, name: customPickup.name }
            : null
        }
        onClose={() => setIsMapOpen(false)}
      />
    </div>
  );
}
