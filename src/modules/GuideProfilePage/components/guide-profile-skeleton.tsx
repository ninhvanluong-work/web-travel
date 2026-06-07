import { Skeleton } from '@/components/ui/skeleton';

export default function GuideProfileSkeleton() {
  return (
    <div className="bg-[#F3F3F7] h-full overflow-y-auto scrollbar-hide">
      <Skeleton className="h-[280px] w-full rounded-none" />

      <div className="bg-white border-b border-neutral-200 p-[18px] flex gap-[10px]">
        <Skeleton className="flex-1 h-11 rounded-md" />
        <Skeleton className="w-11 h-11 rounded-md" />
        <Skeleton className="w-11 h-11 rounded-md" />
      </div>

      <div className="bg-white border-b border-neutral-200 py-[22px] px-[18px]">
        <Skeleton className="h-3 w-40 mb-3 rounded" />
        <Skeleton className="h-4 w-full mb-2 rounded" />
        <Skeleton className="h-4 w-full mb-2 rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
      </div>

      <div className="bg-white border-b border-neutral-200 py-[22px] px-[18px]">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <Skeleton className="h-7 w-14 mx-auto mb-2 rounded" />
              <Skeleton className="h-3 w-16 mx-auto rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-neutral-100 border-b border-neutral-200 py-[22px] px-[18px]">
        <Skeleton className="h-3 w-36 mb-3 rounded" />
        {[0, 1].map((i) => (
          <div key={i} className="bg-white rounded-lg p-3.5 mb-2">
            <Skeleton className="h-4 w-40 mb-2 rounded" />
            <Skeleton className="h-3 w-full mb-1.5 rounded" />
            <Skeleton className="h-3 w-5/6 rounded" />
          </div>
        ))}
      </div>

      <div className="bg-white border-b border-neutral-200 py-[22px] px-[18px]">
        <Skeleton className="h-4 w-32 mb-4 rounded" />
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <div className="flex justify-between mb-1.5">
                <Skeleton className="h-3 w-28 rounded" />
                <Skeleton className="h-3 w-8 rounded" />
              </div>
              <Skeleton className="h-[4px] w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
