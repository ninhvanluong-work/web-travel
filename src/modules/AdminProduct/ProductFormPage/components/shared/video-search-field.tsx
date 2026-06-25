import { Film, Search, Upload, X } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { useInfiniteListVideoAdmin } from '@/api/video';
import { getVideoById } from '@/api/video/requests';
import type { IVideo } from '@/api/video/types';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import type { ProductFormValues } from '@/lib/validations/product';

import { VideoSearchDropdown } from './video-search-dropdown';
import { VideoUploadDialog } from './video-upload-dialog';

export function VideoSearchField({
  initialVideo,
}: {
  initialVideo?: { id: string; title: string; thumbnail: string } | null;
}) {
  const { control, watch, setValue } = useFormContext<ProductFormValues>();
  const currentVideoId = watch('videoId');
  const { t } = useTranslation('adminPage');

  const [query, setQuery] = useState('');
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
  const [showDropdown, setShowDropdown] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteListVideoAdmin({
    variables: { keyword: debouncedQuery || undefined, pageSize: 20 },
    enabled: showDropdown,
  });

  const results = data?.pages.flatMap((p) => p.items) ?? [];

  // Sync selectedVideo when the parent provides a different initialVideo (e.g. after async load).
  // Must NOT depend on selectedVideo?.id — that would override the user's own selection.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!initialVideo) return;
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
  }, [initialVideo?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!currentVideoId || selectedVideo?.id === currentVideoId) return;
    getVideoById(currentVideoId)
      .then((v) => v && setSelectedVideo(v))
      .catch(() => null);
  }, [currentVideoId, selectedVideo?.id]);

  return (
    <FormField
      control={control}
      name="videoId"
      render={({ field }) => (
        <FormItem className="space-y-1.5">
          <FormLabel className="text-[13px] text-slate-500 font-medium">{t('tourVideoLabel')}</FormLabel>

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
                  {t('tourVideoLinked')}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                rounded="md"
                className="w-6 h-6 shrink-0 text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                onClick={() => {
                  setValue('videoId', null);
                  setSelectedVideo(null);
                }}
              >
                <X size={12} />
              </Button>
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
                  placeholder={t('searchVideosPlaceholder')}
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
                  <VideoSearchDropdown
                    isLoading={isLoading}
                    results={results}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    fetchNextPage={fetchNextPage}
                    selectedId={field.value}
                    onSelect={(video) => {
                      field.onChange(video.id);
                      setSelectedVideo(video);
                      setQuery('');
                      setShowDropdown(false);
                    }}
                  />
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
                {t('uploadButton')}
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
