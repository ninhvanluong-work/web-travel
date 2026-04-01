import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { IProduct } from '@/api/product';

interface DeleteConfirmDialogProps {
  target: IProduct | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({ target, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  return (
    <AlertDialog
      open={!!target}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn xóa sản phẩm &quot;{target?.name}&quot; không? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 text-white hover:bg-red-700">
            Xóa sản phẩm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
