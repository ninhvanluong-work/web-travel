import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useCreateProduct, useProductById, useUpdateProduct, useUpdateProductStatus } from '@/api/product';
import { type ProductFormValues, productSchema, READ_BEFORE_KEY_OPTIONS } from '@/lib/validations/product';
import { useAlertStore } from '@/stores/use-alert-store';
import { ROUTE } from '@/types';

import { useProductDraft } from './use-product-draft';

const DEFAULT_VALUES: ProductFormValues = {
  name: '',
  slug: '',
  description: '',
  destinationId: null,
  supplierId: null,
  tourGuideIds: [],
  highlight: '',
  include: '',
  exclude: '',
  minPrice: 0,
  currency: 'VND',
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
  options: [],
  departureTimes: [],
  pickupLocations: [],
  units: [],
};

export function useProductForm(productId?: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation('adminPage');
  const isEdit = !!productId;

  const invalidateList = () => {
    queryClient.removeQueries({ queryKey: ['/product'] });
    queryClient.removeQueries({ queryKey: ['/product/detail'] });
  };

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
      highlight: productData.highlight,
      include: productData.include,
      exclude: productData.exclude,
      minPrice: Number(productData.minPrice) || 0,
      currency: (productData.currency as 'VND' | 'USD') ?? 'VND',
      status: productData.status,
      thumbnail: productData.thumbnail,
      itineraryImage: productData.itineraryImage,
      images: (productData.images ?? []).map((url) => ({ url })),
      videoId: productData.heroVideo?.id ?? null,
      shortDescription: productData.shortDescription ?? null,
      tags: (productData.tags ?? []).map((tag) => ({ id: tag.id, name: tag.name })),
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
      options: (productData.options ?? []).map((o) => ({
        id: o.id,
        title: o.title,
        isActive: o.status === 'active',
        currency: o.currency ?? 'VND',
        description: o.description ?? null,
        include: o.include ?? [],
      })),
      departureTimes: (productData.departureTimes ?? []).map((d) => ({
        id: d.id,
        time: d.time.slice(0, 5),
        label: d.label ?? '',
        note: d.note ?? '',
        isActive: d.isActive,
        order: d.order,
      })),
      pickupLocations: (productData.pickupLocations ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        address: p.address ?? '',
        mapUrl: p.mapUrl ?? '',
        isPopular: p.isPopular,
      })),
      units: (productData.units ?? []).map((u) => ({
        id: u.id,
        name: u.name,
        note: u.note ?? '',
      })),
    });
  }, [productData, form]);

  const { addAlert } = useAlertStore.getState();

  const createMutation = useCreateProduct();

  const updateMutation = useUpdateProduct({
    onError: (err: any) => {
      addAlert({ type: 'error', title: err?.response?.data?.message ?? t('genericError') });
    },
  });

  const updateStatusMutation = useUpdateProductStatus({
    onError: (err: any) => {
      addAlert({ type: 'error', title: err?.response?.data?.message ?? t('updateStatusFailed') });
    },
  });

  const handleCreateNew = async (data: ProductFormValues) => {
    try {
      await createMutation.mutateAsync(data);
      draft.clearDraftOnSuccess();
      invalidateList();
      addAlert({ type: 'success', title: t('tourCreatedSuccess') });
      router.push(ROUTE.ADMIN_PRODUCTS);
    } catch (err: any) {
      addAlert({ type: 'error', title: err?.response?.data?.message ?? t('genericError') });
    }
  };

  const onSubmit = (data: ProductFormValues) => {
    if (isEdit) {
      updateMutation.mutate(
        { id: productId!, values: data },
        {
          onSuccess: () => {
            draft.clearDraftOnSuccess();
            invalidateList();
            addAlert({ type: 'success', title: t('tourUpdatedSuccess') });
            router.push(ROUTE.ADMIN_PRODUCTS);
          },
        }
      );
    } else {
      handleCreateNew(data);
    }
  };

  const onPublish = (data: ProductFormValues) => {
    if (!isEdit) {
      handleCreateNew(data);
      return;
    }
    updateMutation.mutate(
      { id: productId!, values: data },
      {
        onSuccess: () =>
          updateStatusMutation.mutate(
            { id: productId!, status: 'published' },
            {
              onSuccess: () => {
                draft.clearDraftOnSuccess();
                invalidateList();
                addAlert({ type: 'success', title: t('tourPublishedSuccess') });
                router.push(ROUTE.ADMIN_PRODUCTS);
              },
            }
          ),
      }
    );
  };

  const onValidationError = () => addAlert({ type: 'error', title: t('tourValidationError') });

  const handlePublish = form.handleSubmit(onPublish, onValidationError);

  const handleHide = form.handleSubmit((data) => {
    updateMutation.mutate(
      { id: productId!, values: data },
      {
        onSuccess: () =>
          updateStatusMutation.mutate(
            { id: productId!, status: 'hidden' },
            {
              onSuccess: () => {
                draft.clearDraftOnSuccess();
                invalidateList();
                addAlert({ type: 'success', title: t('tourHiddenSuccess') });
                router.push(ROUTE.ADMIN_PRODUCTS);
              },
            }
          ),
      }
    );
  }, onValidationError);

  const isPending = createMutation.isPending || updateMutation.isPending || updateStatusMutation.isPending;

  return { form, isEdit, productData, onSubmit, onPublish, handlePublish, handleHide, isPending, draft };
}
