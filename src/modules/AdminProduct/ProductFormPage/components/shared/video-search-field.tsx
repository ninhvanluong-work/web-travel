import { Film, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { getListVideo, getVideoById } from '@/api/video/requests';
import type { IVideo } from '@/api/video/types';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import type { ProductFormValues } from '@/lib/validations/product';

export function VideoSearchField() {
  const { control, watch, setValue } = useFormContext<ProductFormValues>();
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
    getListVideo({ query: debouncedQuery || undefined, pageSize: 20 })
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
          <FormLabel className="text-[13px] text-slate-500 font-medium">Tour Video</FormLabel>
          <div className="relative">
            <Input
              size="sm"
              fullWidth
              placeholder="Search videos..."
              prefix={<Film size={14} className="text-slate-400" />}
              suffix={
                field.value && selectedVideo ? (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-50 border border-brand-100 rounded-md max-w-[150px]">
                    <span className="text-[10px] text-brand-600 truncate font-semibold uppercase">
                      {selectedVideo.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setValue('videoId', null);
                        setSelectedVideo(null);
                      }}
                      className="text-brand-400 hover:text-brand-600 shrink-0"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ) : undefined
              }
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            {showDropdown && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 py-1 max-h-72 overflow-y-auto">
                {isSearching && <div className="py-6 text-center text-[11px] text-slate-400 italic">Searching...</div>}
                {!isSearching && results.length === 0 && (
                  <div className="py-6 text-center text-[12px] text-slate-400">No videos found</div>
                )}
                {!isSearching &&
                  results.map((video) => (
                    <button
                      key={video.id}
                      type="button"
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 text-left transition-colors"
                      onMouseDown={() => {
                        field.onChange(video.id);
                        setSelectedVideo(video);
                        setQuery('');
                        setShowDropdown(false);
                      }}
                    >
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden ring-1 ring-slate-200">
                        {video.thumbnail && <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <span className="text-[13px] text-slate-700 font-medium truncate">{video.title}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </FormItem>
      )}
    />
  );
}
