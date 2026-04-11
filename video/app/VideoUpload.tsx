'use client';

import { useState } from 'react';
import * as tus from 'tus-js-client';

interface UploadCredentials {
  videoId: string;
  libraryId: string;
  expirationTime: number;
  signature: string;
}

export function VideoUploader() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setProgress(0);

    // Get upload credentials from your API
    const response = await fetch('/api/upload/video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: file.name }),
    });

    if (!response.ok) {
      setUploading(false);
      throw new Error('Failed to get upload credentials');
    }

    const credentials = (await response.json()) as UploadCredentials;
    console.log(credentials);
    // Create TUS upload
    const upload = new tus.Upload(file, {
      endpoint: 'https://video.bunnycdn.com/tusupload',
      retryDelays: [0, 3000, 5000, 10000, 20000, 60000],
      headers: {
        AuthorizationSignature: credentials.signature,
        AuthorizationExpire: String(credentials.expirationTime),
        VideoId: credentials.videoId,
        LibraryId: credentials.libraryId,
      },
      metadata: {
        filetype: file.type,
        title: file.name,
      },
      onError(error) {
        console.error('Upload error:', error);
        setUploading(false);
      },
      onProgress(bytesUploaded, bytesTotal) {
        setProgress(Math.round((bytesUploaded / bytesTotal) * 100));
      },
      onSuccess() {
        const embedUrl = `https://iframe.mediadelivery.net/embed/${credentials.libraryId}/${credentials.videoId}`;
        setVideoUrl(embedUrl);
        setUploading(false);
      },
    });

    // Resume previous upload if available
    const previousUploads = await upload.findPreviousUploads();
    if (previousUploads.length) {
      upload.resumeFromPreviousUpload(previousUploads[0]);
    }

    upload.start();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  }

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleFileChange} disabled={uploading} />
      {uploading && <p>Uploading: {progress}%</p>}
      {videoUrl && <iframe src={videoUrl} width="640" height="360" allow="autoplay; fullscreen" />}
    </div>
  );
}
