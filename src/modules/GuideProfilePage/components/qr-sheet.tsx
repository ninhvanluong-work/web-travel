import { QRCodeSVG } from 'qrcode.react';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface QrSheetProps {
  open: boolean;
  onClose: () => void;
  guideId: string;
  guideName: string;
}

export default function QrSheet({ open, onClose, guideId, guideName }: QrSheetProps) {
  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/guide/${guideId}`;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-[15px] font-medium">Danh thiếp của {guideName}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-white rounded-xl border border-neutral-200">
            <QRCodeSVG value={profileUrl} size={180} fgColor="#0F1D33" bgColor="#FFFFFF" />
          </div>
          <p className="text-[12px] text-neutral-500 text-center">{profileUrl}</p>
          <p className="text-[11px] text-neutral-400 italic text-center">Quét mã để xem profile hướng dẫn viên</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
