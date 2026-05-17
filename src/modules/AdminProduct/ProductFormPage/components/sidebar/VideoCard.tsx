import { Film, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { getListVideo, getVideoById } from '@/api/video/requests';
import type { IVideo } from '@/api/video/types';
import { FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { ProductFormValues } from '@/lib/validations/product';

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function VideoCard() {
  const { control, watch } = useFormContext<ProductFormValues>();
  const currentVideoId = watch('videoId');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<IVideo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  // Load selected video on edit mode
  useEffect(() => {
    if (!currentVideoId || selectedVideo?.id === currentVideoId) return;
    getVideoById(currentVideoId)
      .then(setSelectedVideo)
      .catch(() => null);
  }, [currentVideoId, selectedVideo?.id]);

  // Search videos
  useEffect(() => {
    setIsSearching(true);
    getListVideo({ query: debouncedQuery || undefined, pageSize: 10 })
      .then((data) => {
        setResults(data);
        setIsSearching(false);
      })
      .catch(() => setIsSearching(false));
  }, [debouncedQuery]);

  return (
    <div className="overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2.5">
        <span className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
          <Film size={13} className="text-rose-500" />
        </span>
        <span className="text-xs font-semibold text-gray-700 dark:text-white/90 tracking-wide">Video</span>
      </div>

      <div className="p-4 space-y-3">
        <FormField
          control={control}
          name="videoId"
          render={({ field }) => (
            <FormItem>
              {/* Search input */}
              <div className="relative">
                <Input
                  size="sm"
                  placeholder="Tìm video theo tên..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                />

                {/* Dropdown */}
                {showDropdown && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg ring-1 ring-black/10 overflow-hidden max-h-48 overflow-y-auto">
                    {isSearching && (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {!isSearching && results.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-4">Không có video</p>
                    )}
                    {!isSearching &&
                      results.length > 0 &&
                      results.map((video) => (
                        <button
                          key={video.id}
                          type="button"
                          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                          onMouseDown={() => {
                            field.onChange(video.id);
                            setSelectedVideo(video);
                            setQuery('');
                            setShowDropdown(false);
                          }}
                        >
                          <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden shrink-0">
                            {video.thumbnail ? (
                              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                            ) : (
                              <Film size={14} className="m-auto mt-1.5 text-gray-300" />
                            )}
                          </div>
                          <span className="text-xs text-gray-700 truncate">{video.title}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Selected video preview */}
              {field.value && selectedVideo && (
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 ring-1 ring-black/5 mt-2">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {selectedVideo.thumbnail ? (
                      <img
                        src={selectedVideo.thumbnail}
                        alt={selectedVideo.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Film size={16} className="m-auto mt-2 text-gray-300" />
                    )}
                  </div>
                  <span className="flex-1 text-xs text-gray-700 truncate font-medium">{selectedVideo.title}</span>
                  <button
                    type="button"
                    className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => {
                      field.onChange(null);
                      setSelectedVideo(null);
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
