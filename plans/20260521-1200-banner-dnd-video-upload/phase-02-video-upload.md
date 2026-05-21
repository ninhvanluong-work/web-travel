# Phase 2: Tus Video Upload in BannerItem

## UI Change: Video Mode Toggle

When `banner[index].type === 'video'`, replace static URL input with a mode toggle:

```
[ Nhúng link | Tải file ]   ← segmented toggle (local state)
```

- Default: `'link'` mode (existing URL input — no regression)
- `'upload'` mode: shows `BannerVideoUpload` dropzone
- After successful upload: `onChange(embedUrl)` → auto-switch back to `'link'` (shows iframe preview)
- Mode stored in `useState` inside `BannerItem` — not in form values

## BannerVideoUpload Component

Co-located in `banner-section.tsx`. Simplified `VideoUploadCard` — no name/description/tag inputs (auto-generated).

```tsx
const BANNER_MAX_SIZE = 100 * 1024 * 1024;
const BANNER_ALLOWED = ['video/mp4', 'video/quicktime'];

function BannerVideoUpload({
  value,
  onChange,
  onUploadDone,
}: {
  value: string;
  onChange: (url: string) => void;
  onUploadDone: () => void; // switches parent mode to 'link'
}) {
  const [uploadState, setUploadState] = useState<BannerUploadState>({ status: 'idle' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tusRef = useRef<tus.Upload | null>(null);

  // Cleanup on unmount
  useEffect(
    () => () => {
      tusRef.current?.abort();
    },
    []
  );

  async function handleFile(file: File) {
    if (!BANNER_ALLOWED.includes(file.type)) return showError('Chỉ hỗ trợ MP4, MOV');
    if (file.size > BANNER_MAX_SIZE) return showError('File quá lớn (tối đa 100 MB)');

    setUploadState({ status: 'preparing' });
    try {
      const credRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Product_Video_${Date.now()}` }),
      });
      if (!credRes.ok) throw new Error(`Upload init failed (${credRes.status})`);
      const { data: cred } = await credRes.json();
      const { videoId: bunnyVideoId, libraryId, expirationTime, signature } = cred;

      const tusInstance = new tus.Upload(file, {
        endpoint: process.env.NEXT_PUBLIC_BUNNY_TUS_ENDPOINT ?? 'https://video.bunnycdn.com/tusupload',
        retryDelays: [0, 3000, 5000, 10000],
        headers: {
          AuthorizationSignature: signature,
          AuthorizationExpire: String(expirationTime),
          VideoId: bunnyVideoId,
          LibraryId: libraryId,
        },
        metadata: { filetype: file.type, title: file.name },
        onProgress(uploaded, total) {
          setUploadState({ status: 'uploading', progress: Math.round((uploaded / total) * 100), tusInstance });
        },
        async onSuccess() {
          setUploadState({ status: 'processing' });
          try {
            await createVideo({
              name: file.name.substring(0, 50),
              guid: bunnyVideoId,
              thumbnail: '',
              description: 'Video banner sản phẩm',
              type: 'normal',
              tag: 'product_banner', // ← PENDING Q1 CONFIRMATION
            });
            const embedUrl = `https://player.mediadelivery.net/embed/${libraryId}/${bunnyVideoId}?autoplay=false&loop=true`;
            onChange(embedUrl);
            onUploadDone();
            setUploadState({ status: 'idle' });
          } catch {
            setUploadState({ status: 'error', message: 'Lưu DB thất bại, thử lại.' });
          }
        },
        onError(err) {
          setUploadState({ status: 'error', message: err.message });
        },
      });

      tusRef.current = tusInstance;
      tusInstance.start();
      setUploadState({ status: 'uploading', progress: 0, tusInstance });
    } catch (err) {
      setUploadState({ status: 'error', message: err instanceof Error ? err.message : 'Lỗi không xác định' });
    }
  }

  // ... render progress bar / dropzone / error UI
}
```

## BannerUploadState Type (local, not from upload-types.ts)

```ts
type BannerUploadState =
  | { status: 'idle' }
  | { status: 'preparing' }
  | { status: 'uploading'; progress: number; tusInstance: tus.Upload }
  | { status: 'processing' }
  | { status: 'error'; message: string };
```

Simpler than `UploadState` — no pause/resume (too complex for inline banner context).

## Progress UI (Compact)

```tsx
{
  uploadState.status === 'uploading' && (
    <div className="space-y-2 text-center p-4">
      <Loader2 className="animate-spin text-brand-500 mx-auto" size={20} />
      <p className="text-xs font-semibold text-slate-700">Đang tải lên... {uploadState.progress}%</p>
      <div className="w-32 h-1 bg-slate-200 rounded-full mx-auto overflow-hidden">
        <div
          className="h-full bg-brand-500 transition-all duration-300"
          style={{ width: `${uploadState.progress}%` }}
        />
      </div>
    </div>
  );
}
```

## Edge Cases

| Case                               | Handling                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| Unmount during upload              | `useEffect` cleanup calls `tusRef.current?.abort()`                            |
| `createVideo` fails after upload   | Show error with message; embedUrl not written to form                          |
| User switches mode while uploading | Warn or disable toggle during upload (disable toggle when `status !== 'idle'`) |
| MOV file                           | Accepted by `BANNER_ALLOWED` check; Bunny handles transcoding                  |

## Step-by-step

1. Add `NEXT_PUBLIC_BUNNY_TUS_ENDPOINT` to `.env.example`
2. Add mode toggle state to `BannerItem` (`useState<'link'|'upload'>`)
3. Wrap video URL field in conditional: `videoMode === 'link'` → existing `<Input>`, else `<BannerVideoUpload>`
4. Implement `BannerVideoUpload` with local `BannerUploadState`
5. On upload success → call `onUploadDone()` to flip mode back to `'link'`
6. Disable mode toggle button when upload in progress
