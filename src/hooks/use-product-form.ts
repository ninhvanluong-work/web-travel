import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useCreateProduct, useProductById, usePublishProduct, useUpdateProduct } from '@/api/product';
import { type ProductFormValues, productSchema, READ_BEFORE_KEY_OPTIONS } from '@/lib/validations/product';
import { ROUTE } from '@/types/routes';

import { useProductDraft } from './use-product-draft';

const DEFAULT_VALUES: ProductFormValues = {
  name: '',
  slug: '',
  description: '',
  destinationId: null,
  supplierId: null,
  tourGuideIds: [],
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
  shortDescription: null,
  tags: [],
  banner: [],
  elementIds: [],
  experiences: [],
  itineraries: [],
  readBefores: READ_BEFORE_KEY_OPTIONS.map((opt) => ({ key: opt.value, description: '' })),
};

export function useProductForm(productId?: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!productId;

  const invalidateList = () => queryClient.removeQueries({ queryKey: ['/product'] });

  const { data: productData } = useProductById({ variables: { id: productId! }, enabled: isEdit }, undefined);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const draft = useProductDraft(productId, form);

  useEffect(() => {
    if (!productData) return;
    form.reset({
      name: productData.name,
      slug: productData.slug ?? '',
      description: productData.description,
      destinationId: productData.destinationId,
      supplierId: productData.supplierId,
      tourGuideIds: (productData.tourGuides ?? []).map((g) => g.id),
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
      videoId: (productData as any).heroVideoId ?? (productData as any).videoId ?? null,
      shortDescription: productData.shortDescription ?? null,
      tags: (productData.tags ?? []).map((t) => ({ id: t.id, name: t.name })),
      banner: (productData.banner ?? []).map((b) => ({ url: b.url, type: b.type })),
      elementIds: (productData.elements ?? []).map((e) => e.id),
      experiences: (productData.experience ?? []).map((e) => ({
        imageUrl: e.imageUrl,
        title: e.title,
        content: e.content,
      })),
      itineraries: (productData.itineraries ?? []).map((it) => ({
        id: it.id,
        name: it.name,
        featuredName: it.featuredName ?? '',
        order: it.order,
        description: it.description ?? '',
      })),
      readBefores: READ_BEFORE_KEY_OPTIONS.map((opt) => {
        const found = (productData.readBefore ?? []).find((r) => r.key === opt.value);
        return { key: opt.value, description: found?.description ?? '' };
      }),
    });
  }, [productData, form]);

  const createMutation = useCreateProduct({
    onSuccess: () => {
      draft.clearDraftOnSuccess();
      invalidateList();
      toast.success('Tour created successfully');
      router.push(ROUTE.ADMIN_PRODUCTS);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'An error occurred, please try again');
    },
  });

  const updateMutation = useUpdateProduct({
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'An error occurred, please try again');
    },
  });

  const publishMutation = usePublishProduct({
    onSuccess: () => {
      draft.clearDraftOnSuccess();
      invalidateList();
      toast.success('Tour published successfully');
      router.push(ROUTE.ADMIN_PRODUCTS);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to publish tour');
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    if (isEdit) {
      updateMutation.mutate(
        { id: productId!, values: data },
        {
          onSuccess: () => {
            draft.clearDraftOnSuccess();
            invalidateList();
            toast.success('Tour updated successfully');
            router.push(ROUTE.ADMIN_PRODUCTS);
          },
        }
      );
    } else {
      createMutation.mutate(data);
    }
  };

  const onPublish = (data: ProductFormValues) => {
    if (!isEdit) {
      createMutation.mutate(data);
      return;
    }
    updateMutation.mutate(
      { id: productId!, values: data },
      { onSuccess: () => publishMutation.mutate({ id: productId! }) }
    );
  };

  const isPending = createMutation.isPending || updateMutation.isPending || publishMutation.isPending;

  return { form, isEdit, productData, onSubmit, onPublish, isPending, draft };
}
