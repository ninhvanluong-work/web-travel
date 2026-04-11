import { Film, Search } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';

import type { PageSizeOption } from './use-video-list-paged';
import { PAGE_SIZE_OPTIONS, useVideoListPaged } from './use-video-list-paged';
import { VideoTableRow } from './video-table-row';

interface Props {
  refreshKey: number;
}

export function VideoListTable({ refreshKey }: Props) {
  const { videos, isLoading, hasNext, page, pageSize, search, setSearch, setPageSize, nextPage, prevPage } =
    useVideoListPaged(refreshKey);

  function handleCopyEmbed(embedUrl: string) {
    navigator.clipboard
      .writeText(embedUrl)
      .then(() => {
        toast.success('Đã copy embed URL');
      })
      .catch(() => {
        toast.error('Không thể copy');
      });
  }

  const startIndex = (page - 1) * pageSize + 1;

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2.5">
        <span className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
          <Film size={13} className="text-indigo-600" />
        </span>
        <span className="text-sm font-semibold text-gray-700">Danh sách Video</span>
      </div>

      {/* Search + page size */}
      <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            size="sm"
            className="pl-8"
            placeholder="Tìm kiếm theo tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 outline-none cursor-pointer"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value) as PageSizeOption)}
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} / trang
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 font-medium">
              <th className="py-2.5 pl-4 pr-2 text-left w-8">#</th>
              <th className="py-2.5 px-2 text-left">Video</th>
              <th className="py-2.5 px-2 text-left w-20">Type</th>
              <th className="py-2.5 px-2 text-left w-24">Tag</th>
              <th className="py-2.5 px-2 text-center w-20">Upload</th>
              <th className="py-2.5 px-2 text-right w-20">Thích</th>
              <th className="py-2.5 pl-2 pr-4 text-center w-20">Embed</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-3 pl-4 pr-2">
                    <div className="h-3 w-4 rounded bg-gray-100 animate-pulse" />
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-7 rounded bg-gray-100 animate-pulse shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3 w-32 rounded bg-gray-100 animate-pulse" />
                        <div className="h-2.5 w-20 rounded bg-gray-100 animate-pulse" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="h-4 w-12 rounded-full bg-gray-100 animate-pulse" />
                  </td>
                  <td className="py-3 px-2">
                    <div className="h-4 w-16 rounded-full bg-gray-100 animate-pulse" />
                  </td>
                  <td className="py-3 px-2 text-center">
                    <div className="h-4 w-4 rounded-full bg-gray-100 animate-pulse mx-auto" />
                  </td>
                  <td className="py-3 px-2">
                    <div className="h-3 w-10 rounded bg-gray-100 animate-pulse ml-auto" />
                  </td>
                  <td className="py-3 pl-2 pr-4" />
                </tr>
              ))}
            {!isLoading && videos.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <Film size={28} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">
                    {search
                      ? `Không tìm thấy video nào với từ khóa "${search}".`
                      : 'Chưa có video nào. Hãy upload video đầu tiên.'}
                  </p>
                </td>
              </tr>
            )}
            {!isLoading &&
              videos.map((video, idx) => (
                <VideoTableRow key={video.id} video={video} index={startIndex + idx} onCopyEmbed={handleCopyEmbed} />
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
        <button
          type="button"
          className="text-xs text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          disabled={page === 1 || isLoading}
          onClick={prevPage}
        >
          ← Trang trước
        </button>
        <span className="text-xs text-gray-400">Trang {page}</span>
        <button
          type="button"
          className="text-xs text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          disabled={!hasNext || isLoading}
          onClick={nextPage}
        >
          Trang tiếp →
        </button>
      </div>
    </div>
  );
}
