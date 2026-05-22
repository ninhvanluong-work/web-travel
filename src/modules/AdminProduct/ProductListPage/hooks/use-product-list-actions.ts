import { useState } from 'react';
import { toast } from 'sonner';

import type { IProduct } from '@/api/product';
import { useDeleteProduct, usePatchProductStatus } from '@/api/product';

type ProductStatus = 'draft' | 'published' | 'hidden';

export function useProductListActions(refetch: () => void) {
  const [deleteTarget, setDeleteTarget] = useState<IProduct | null>(null);

  const patchStatus = usePatchProductStatus({
    onSuccess: () => refetch(),
    onError: () => toast.error('Failed to update status'),
  });

  const deleteMutation = useDeleteProduct({
    onSuccess: () => {
      toast.success('Tour deleted');
      setDeleteTarget(null);
      refetch();
    },
    onError: () => toast.error('Failed to delete tour'),
  });

  const handleChangeStatus = (product: IProduct, status: ProductStatus) => {
    patchStatus.mutate({ id: product.id, status });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate({ id: deleteTarget.id });
  };

  return { deleteTarget, setDeleteTarget, handleChangeStatus, handleDeleteConfirm };
}
