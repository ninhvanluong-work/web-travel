import { useState } from 'react';

import type { IProduct } from '@/api/product';
import { useDeleteProduct, usePatchProductStatus } from '@/api/product';
import { useAlertStore } from '@/stores/use-alert-store';

type ProductStatus = 'draft' | 'published' | 'hidden';

export function useProductListActions(refetch: () => void) {
  const [deleteTarget, setDeleteTarget] = useState<IProduct | null>(null);

  const { addAlert } = useAlertStore.getState();

  const patchStatus = usePatchProductStatus({
    onSuccess: () => refetch(),
    onError: () => addAlert({ type: 'error', title: 'Failed to update status' }),
  });

  const deleteMutation = useDeleteProduct({
    onSuccess: () => {
      addAlert({ type: 'success', title: 'Tour deleted' });
      setDeleteTarget(null);
      refetch();
    },
    onError: () => addAlert({ type: 'error', title: 'Failed to delete tour' }),
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
