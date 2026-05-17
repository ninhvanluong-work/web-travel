import { useState } from 'react';

import { VideoListTable } from './components/video-list-table';
import { VideoUploadCard } from './components/video-upload-card';

export default function AdminVideoPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <div className="px-6 py-4 bg-white border-b border-gray-100 shadow-sm">
        <h1 className="text-base font-bold text-gray-900">Quản lý Video</h1>
        <p className="text-xs text-gray-400 mt-0.5">Upload và quản lý video tour</p>
      </div>

      <div className="flex-1 p-6">
        <div className="grid grid-cols-[380px_1fr] gap-6 items-start">
          <div className="sticky top-6">
            <VideoUploadCard onUploaded={() => setRefreshKey((k) => k + 1)} />
          </div>
          <VideoListTable refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}
