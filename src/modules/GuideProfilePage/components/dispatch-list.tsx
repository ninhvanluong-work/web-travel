import type { GuideProfileData } from '../data/mock-guide';

interface DispatchListProps {
  dispatches: GuideProfileData['dispatches'];
}

export default function DispatchList({ dispatches }: DispatchListProps) {
  if (dispatches.length === 0) {
    return (
      <p className="text-caption2 text-neutral-400 italic text-center py-3 mt-2">
        Chưa có lệnh điều tour được xác nhận
      </p>
    );
  }

  return (
    <div className="mt-3 border border-neutral-200 rounded-md overflow-hidden">
      {dispatches.map((d, i) => (
        <div
          key={d.code}
          className={`flex items-center justify-between px-3 py-2.5 text-[12px] ${
            i < dispatches.length - 1 ? 'border-b border-neutral-200' : ''
          }`}
        >
          <div>
            <p className="font-medium text-neutral-900">{d.code}</p>
            <p className="text-neutral-500 mt-0.5">
              {d.tourName} · {d.date}
            </p>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              d.status === 'completed' ? 'bg-[#E1F5EE] text-[#085041]' : 'bg-[#FFF3D9] text-[#633806]'
            }`}
          >
            {d.status === 'completed' ? 'Hoàn thành' : 'Sắp tới'}
          </span>
        </div>
      ))}
    </div>
  );
}
