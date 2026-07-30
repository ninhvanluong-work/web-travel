import { useEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const goongjs = require('@goongmaps/goong-js');

const MAPTILES_KEY = process.env.NEXT_PUBLIC_GOONG_MAPTILES_KEY;

interface GoongMapProps {
  pickup: { lat: number; lng: number; name: string };
  hub: { lat: number; lng: number };
}

export default function GoongMap({ pickup, hub }: GoongMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    goongjs.accessToken = MAPTILES_KEY;

    const map = new goongjs.Map({
      container: containerRef.current,
      style: 'https://tiles.goong.io/assets/goong_map_web.json',
      center: [pickup.lng, pickup.lat],
      zoom: 13,
    });

    map.on('load', () => {
      new goongjs.Marker({ color: '#0F6E56' })
        .setLngLat([pickup.lng, pickup.lat])
        .setPopup(new goongjs.Popup({ offset: 25 }).setText(pickup.name))
        .addTo(map);

      new goongjs.Marker({ color: '#FF8000' })
        .setLngLat([hub.lng, hub.lat])
        .setPopup(new goongjs.Popup({ offset: 25 }).setText('Tour Hub'))
        .addTo(map);

      const bounds = new goongjs.LngLatBounds([hub.lng, hub.lat], [pickup.lng, pickup.lat]);
      map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 800 });
    });

    return () => map.remove();
  }, [pickup.lat, pickup.lng, pickup.name, hub.lat, hub.lng]);

  return <div ref={containerRef} className="w-full h-full" />;
}
