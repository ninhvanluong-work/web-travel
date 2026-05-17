import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useCreateProduct, useProductById, useUpdateProduct } from '@/api/product';
import {
  type ItineraryFormValues,
  type OptionFormValues,
  type ProductFormValues,
  productSchema,
} from '@/lib/validations/product';
import { ROUTE } from '@/types/routes';

import { useProductDraft } from './use-product-draft';

const DEFAULT_VALUES: ProductFormValues = {
  name: '',
  slug: '',
  description: '',
  destinationId: null,
  supplierId: null,
  duration: 1,
  durationType: 'day',
  highlight: '',
  include: '',
  exclude: '',
  minPrice: 0,
  status: 'draft',
  thumbnail: '',
  itineraryImage: '',
  images: [],
  videoId: null,
};

export function useProductForm(productId?: string) {
  const router = useRouter();
  const isEdit = !!productId;

  const [itineraries, setItineraries] = useState<ItineraryFormValues[]>([]);
  const [options, setOptions] = useState<OptionFormValues[]>([]);

  const { data: productData } = useProductById({ variables: { id: productId! }, enabled: isEdit }, undefined);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const draft = useProductDraft(productId, form, itineraries, options);

  useEffect(() => {
    if (!productData) return;
    form.reset({
      name: productData.name,
      slug: productData.slug ?? '',
      description: productData.description,
      destinationId: productData.destinationId,
      supplierId: productData.supplierId,
      duration: productData.duration,
      durationType: productData.durationType,
      highlight: productData.highlight,
      include: productData.include,
      exclude: productData.exclude,
      minPrice: Number(productData.minPrice) || 0,
      status: productData.status,
      thumbnail: productData.thumbnail,
      itineraryImage: productData.itineraryImage,
      images: (productData.images ?? []).map((url) => ({ url })),
      videoId: (productData as any).videoId ?? null,
    });
  }, [productData, form]);

  const createMutation = useCreateProduct({
    onSuccess: () => {
      draft.clearDraftOnSuccess();
      toast.success('Tạo tour thành công');
      router.push(ROUTE.ADMIN_PRODUCTS);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Có lỗi xảy ra, vui lòng thử lại');
    },
  });

  const updateMutation = useUpdateProduct({
    onSuccess: () => {
      draft.clearDraftOnSuccess();
      toast.success('Cập nhật tour thành công');
      router.push(ROUTE.ADMIN_PRODUCTS);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Có lỗi xảy ra, vui lòng thử lại');
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    if (isEdit) {
      updateMutation.mutate({ id: productId!, values: data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return { form, isEdit, productData, itineraries, setItineraries, options, setOptions, onSubmit, isPending, draft };
}
