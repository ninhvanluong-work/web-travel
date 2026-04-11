import { CheckCircle2, Copy, Film, Loader2, XCircle } from 'lucide-react';

import type { IVideo } from '@/api/video/types';

interface Props {
  video: IVideo;
  index: number;
  onCopyEmbed: (embedUrl: string) => void;
}

function TypeBadge({ type }: { type: 'hero' | 'normal' | null }) {
  if (!type) return <span className="text-gray-300">—</span>;
  if (type === 'hero') {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600">
        hero
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">
      normal
    </span>
  );
}

function UploadStatusIcon({ status }: { status: number | null }) {
  if (status === null) return <span className="text-gray-300">—</span>;
  if (status === 4) return <CheckCircle2 size={14} className="text-emerald-500 mx-auto" />;
  if (status < 0) return <XCircle size={14} className="text-rose-500 mx-auto" />;
  return <Loader2 size={14} className="text-amber-500 animate-spin mx-auto" />;
}

export function VideoTableRow({ video, index, onCopyEmbed }: Props) {
  return (
    <tr className="border-b border-gray-50 hover:bg-slate-50 transition-colors group text-xs">
      {/* # */}
      <td className="py-3 pl-4 pr-2 text-gray-400 tabular-nums">{index}</td>

      {/* Video: thumbnail + name + description */}
      <td className="py-3 px-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-7 rounded bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
            {video.thumbnail ? (
              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
            ) : (
              <Film size={13} className="text-gray-300" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-800 truncate max-w-[180px]">{video.title}</p>
            {video.description && <p className="text-gray-400 truncate max-w-[180px]">{video.description}</p>}
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="py-3 px-2">
        <TypeBadge type={video.type} />
      </td>

      {/* Tag */}
      <td className="py-3 px-2">
        {video.tag ? (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 max-w-[80px] truncate">
            {video.tag}
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>

      {/* Upload status */}
      <td className="py-3 px-2 text-center">
        <UploadStatusIcon status={video.uploadingStatus} />
      </td>

      {/* Thích */}
      <td className="py-3 px-2 text-right text-gray-500 tabular-nums">
        {video.likeCount > 0 ? video.likeCount.toLocaleString() : <span className="text-gray-300">0</span>}
      </td>

      {/* Embed button */}
      <td className="py-3 pl-2 pr-4 text-center">
        {video.embedUrl ? (
          <button
            type="button"
            title="Copy embed URL"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            onClick={() => onCopyEmbed(video.embedUrl)}
          >
            <Copy size={10} />
            Embed
          </button>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
    </tr>
  );
}
