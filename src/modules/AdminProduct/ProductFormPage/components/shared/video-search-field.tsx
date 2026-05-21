import { Film, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { getListVideo, getVideoById } from '@/api/video/requests';
import type { IVideo } from '@/api/video/types';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
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

export function VideoSearchField() {
  const { control, watch } = useFormContext<ProductFormValues>();
  const currentVideoId = watch('videoId');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<IVideo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!currentVideoId || selectedVideo?.id === currentVideoId) return;
    getVideoById(currentVideoId)
      .then((v) => v && setSelectedVideo(v))
      .catch(() => null);
  }, [currentVideoId, selectedVideo?.id]);

  useEffect(() => {
    if (!debouncedQuery && !showDropdown) return;
    setIsSearching(true);
    getListVideo({ query: debouncedQuery || undefined, pageSize: 10 })
      .then((data) => {
        setResults(data);
        setIsSearching(false);
      })
      .catch(() => setIsSearching(false));
  }, [debouncedQuery, showDropdown]);

  return (
    <FormField
      control={control}
      name="videoId"
      render={({ field }) => (
        <FormItem className="space-y-1.5 relative">
          <FormLabel className="text-[13px] text-slate-500 font-medium">Video tour</FormLabel>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors">
              <Film size={14} />
            </div>
            <Input
              size="sm"
              className="pl-9 pr-24"
              placeholder="Tim video..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            {field.value && selectedVideo && (
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-0.5 bg-brand-50 border border-brand-100 rounded-md max-w-[150px]">
                <span className="text-[10px] text-brand-600 truncate font-semibold uppercase">
                  {selectedVideo.title}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    field.onChange(null);
                    setSelectedVideo(null);
                  }}
                  className="text-brand-400 hover:text-brand-600"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            {showDropdown && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 py-1 max-h-48 overflow-y-auto">
                {isSearching ? (
                  <div className="py-4 text-center text-[11px] text-slate-400 italic">Dang tim du lieu...</div>
                ) : (
                  results.map((video) => (
                    <button
                      key={video.id}
                      type="button"
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left transition-colors"
                      onMouseDown={() => {
                        field.onChange(video.id);
                        setSelectedVideo(video);
                        setQuery('');
                        setShowDropdown(false);
                      }}
                    >
                      <div className="w-8 h-8 rounded bg-slate-100 flex-shrink-0 overflow-hidden ring-1 ring-slate-200">
                        {video.thumbnail && <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <span className="text-[13px] text-slate-700 truncate">{video.title}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </FormItem>
      )}
    />
  );
}
