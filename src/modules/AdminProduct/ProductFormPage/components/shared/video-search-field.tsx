import { Check, Film, Search, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { getListVideo, getVideoById } from '@/api/video/requests';
import type { IVideo } from '@/api/video/types';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import type { ProductFormValues } from '@/lib/validations/product';

import { VideoUploadDialog } from './video-upload-dialog';

export function VideoSearchField({
  initialVideo,
}: {
  initialVideo?: { id: string; title: string; thumbnail: string } | null;
}) {
  const { control, watch, setValue } = useFormContext<ProductFormValues>();
  const currentVideoId = watch('videoId');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<IVideo | null>(() => {
    if (!initialVideo) return null;
    return {
      id: initialVideo.id,
      slug: '',
      title: initialVideo.title,
      link: '',
      shortUrl: '',
      embedUrl: '',
      thumbnail: initialVideo.thumbnail,
      description: '',
      likeCount: 0,
      tag: null,
      type: null,
      uploadingStatus: null,
      product: null,
    };
  });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!initialVideo || selectedVideo?.id === initialVideo.id) return;
    setSelectedVideo({
      id: initialVideo.id,
      slug: '',
      title: initialVideo.title,
      link: '',
      shortUrl: '',
      embedUrl: '',
      thumbnail: initialVideo.thumbnail,
      description: '',
      likeCount: 0,
      tag: null,
      type: null,
      uploadingStatus: null,
      product: null,
    });
  }, [initialVideo, selectedVideo?.id]);

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
        <FormItem className="space-y-1.5">
          <FormLabel className="text-[13px] text-slate-500 font-medium">Tour Video</FormLabel>

          {field.value && selectedVideo ? (
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 group hover:border-brand-200 hover:bg-brand-50/30 transition-colors">
              <div className="w-14 h-9 rounded-lg overflow-hidden bg-slate-200 shrink-0 ring-1 ring-black/5">
                {selectedVideo.thumbnail ? (
                  <img src={selectedVideo.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film size={13} className="text-slate-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-slate-700 truncate leading-tight">{selectedVideo.title}</p>
                <p className="text-[10px] text-brand-500 font-medium mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 inline-block" />
                  Linked
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setValue('videoId', null);
                  setSelectedVideo(null);
                }}
                className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                />
                <Input
                  size="sm"
                  fullWidth
                  placeholder="Search videos..."
                  className="pl-9"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                />

                {showDropdown && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1 max-h-60 overflow-y-auto">
                    {isSearching && (
                      <div className="flex items-center justify-center gap-2 py-5">
                        <div className="w-3.5 h-3.5 border-2 border-slate-200 border-t-brand-400 rounded-full animate-spin" />
                        <span className="text-[11px] text-slate-400">Searching...</span>
                      </div>
                    )}

                    {!isSearching && results.length === 0 && (
                      <div className="py-5 flex flex-col items-center gap-1.5">
                        <Film size={20} className="text-slate-300" />
                        <span className="text-[12px] text-slate-400">No videos found</span>
                      </div>
                    )}

                    {!isSearching &&
                      results.map((video) => (
                        <button
                          key={video.id}
                          type="button"
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left transition-colors group/item"
                          onMouseDown={() => {
                            field.onChange(video.id);
                            setSelectedVideo(video);
                            setQuery('');
                            setShowDropdown(false);
                          }}
                        >
                          <div className="w-14 h-9 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden ring-1 ring-slate-200 group-hover/item:ring-brand-200 transition-all">
                            {video.thumbnail ? (
                              <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Film size={12} className="text-slate-300" />
                              </div>
                            )}
                          </div>
                          <span className="text-[13px] text-slate-700 font-medium truncate flex-1">{video.title}</span>
                          {field.value === video.id && <Check size={13} className="text-brand-500 shrink-0" />}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="secondary"
                rounded="md"
                blur={false}
                className="shrink-0 px-3 py-1.5 text-xs gap-1.5"
                onClick={() => setIsUploadOpen(true)}
              >
                <Upload size={13} />
                Upload
              </Button>

              <VideoUploadDialog
                open={isUploadOpen}
                onOpenChange={setIsUploadOpen}
                onUploadSuccess={(dbVideo) => {
                  setValue('videoId', dbVideo.id);
                  setSelectedVideo({
                    id: dbVideo.id,
                    slug: dbVideo.slug,
                    title: dbVideo.name,
                    link: dbVideo.url,
                    shortUrl: dbVideo.shortUrl,
                    embedUrl: dbVideo.embedUrl,
                    thumbnail: dbVideo.thumbnail,
                    description: dbVideo.description,
                    likeCount: dbVideo.like,
                    tag: dbVideo.tag,
                    type: dbVideo.type,
                    uploadingStatus: dbVideo.uploadingStatus,
                    product: null,
                  });
                }}
              />
            </div>
          )}
        </FormItem>
      )}
    />
  );
}
