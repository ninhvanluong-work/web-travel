import { Editor } from '@tinymce/tinymce-react';
import { Film, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { useDestinationList, useSupplierList } from '@/api/product/lookup';
import { getListVideo, getVideoById } from '@/api/video/requests';
import type { IVideo } from '@/api/video/types';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DURATION_TYPES, generateSlug, type ProductFormValues } from '@/lib/validations/product';

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function BasicInfoSection({ isEdit }: { isEdit: boolean }) {
  const { control, setValue, watch } = useFormContext<ProductFormValues>();
  const nameValue = useWatch({ control, name: 'name' });
  const currentVideoId = watch('videoId');

  const { data: destinations = [] } = useDestinationList();
  const { data: suppliers = [] } = useSupplierList();

  // Video Search States
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<IVideo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!isEdit && nameValue) {
      setValue('slug', generateSlug(nameValue), { shouldValidate: false });
    }
  }, [isEdit, nameValue, setValue]);

  // Load selected video on edit mode
  useEffect(() => {
    if (!currentVideoId || selectedVideo?.id === currentVideoId) return;
    getVideoById(currentVideoId)
      .then((v) => v && setSelectedVideo(v))
      .catch(() => null);
  }, [currentVideoId, selectedVideo?.id]);

  // Search videos
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
    <div className="space-y-6">
      {/* Row 1: Tên tour | Danh mục */}
      <div className="flex flex-row gap-5">
        <div className="flex-1 min-w-0">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[13px] text-slate-500 font-medium">Tên tour</FormLabel>
                <FormControl>
                  <Input size="sm" placeholder="Nhập tên sản phẩm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <FormField
            control={control}
            name="destinationId"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[13px] text-slate-500 font-medium">Danh mục (Điểm đến)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                  <FormControl>
                    <SelectTrigger
                      inputSize="sm"
                      className="w-full bg-slate-50/50 border-slate-200 shadow-none hover:bg-slate-50 transition-colors"
                    >
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {destinations.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Row 2: Nhà cung cấp | Đường dẫn */}
      <div className="flex flex-row gap-5">
        <div className="flex-1 min-w-0">
          <FormField
            control={control}
            name="supplierId"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[13px] text-slate-500 font-medium">Nhà cung cấp</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                  <FormControl>
                    <SelectTrigger
                      inputSize="sm"
                      className="w-full bg-slate-50/50 border-slate-200 shadow-none hover:bg-slate-50 transition-colors"
                    >
                      <SelectValue placeholder="Chọn nhà cung cấp" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {suppliers.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <FormField
            control={control}
            name="slug"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[13px] text-slate-500 font-medium">Đường dẫn (URL)</FormLabel>
                <FormControl>
                  <Input
                    size="sm"
                    placeholder="slug-san-pham"
                    {...field}
                    className="bg-slate-50/50 text-slate-500 border-slate-200"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Row 3: Giá khởi điểm | Video tour */}
      <div className="flex flex-row gap-5">
        <div className="flex-1 min-w-0">
          <FormField
            control={control}
            name="minPrice"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[13px] text-slate-500 font-medium">Giá khởi điểm (VND)</FormLabel>
                <FormControl>
                  <Input type="number" size="sm" placeholder="2.500.000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
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
                    placeholder="Tìm video..."
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  />

                  {/* Selected video badge - repositioned for 2-column mode */}
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

                  {/* Dropdown search video */}
                  {showDropdown && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 py-1 max-h-48 overflow-y-auto">
                      {isSearching ? (
                        <div className="py-4 text-center text-[11px] text-slate-400 italic">Đang tìm dữ liệu...</div>
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
                              {video.thumbnail && (
                                <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                              )}
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
        </div>
      </div>

      {/* Row 4: Thời lượng | Đơn vị tính */}
      <div className="flex flex-row gap-5">
        <div className="flex-1 min-w-0">
          <FormField
            control={control}
            name="duration"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[13px] text-slate-500 font-medium">Thời lượng</FormLabel>
                <FormControl>
                  <Input type="number" size="sm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <FormField
            control={control}
            name="durationType"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[13px] text-slate-500 font-medium">Đơn vị tính</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger
                      inputSize="sm"
                      className="bg-slate-50/50 border-slate-200 shadow-none hover:bg-slate-50 transition-colors"
                    >
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DURATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Row 5: Mô tả */}
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem className="space-y-2 pt-2 border-t border-slate-100">
            <FormLabel className="text-[13px] text-slate-500 font-medium">Mô tả chi tiết tour</FormLabel>
            <FormControl>
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-theme-xs mt-1 ring-offset-white focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
                <Editor
                  tinymceScriptSrc="/tinymce/tinymce.min.js"
                  licenseKey="gpl"
                  value={field.value ?? ''}
                  onEditorChange={(content) => field.onChange(content)}
                  init={{
                    height: 280,
                    menubar: false,
                    statusbar: false,
                    branding: false,
                    promotion: false,
                    plugins: [
                      'advlist',
                      'autolink',
                      'lists',
                      'link',
                      'image',
                      'charmap',
                      'preview',
                      'searchreplace',
                      'wordcount',
                      'table',
                      'fullscreen',
                      'code',
                    ],
                    toolbar: 'undo redo | bold italic underline | bullist numlist | link image | fullscreen code',
                    content_style:
                      'body { font-family: Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 14px; color: #111827; line-height: 1.6; }',
                  }}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
