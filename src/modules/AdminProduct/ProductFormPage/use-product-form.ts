import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  getProducts,
  type ItineraryFormValues,
  type OptionFormValues,
  type ProductFormValues,
  productSchema,
  saveProducts,
} from '@/lib/validations/product';
import { ROUTE } from '@/types/routes';

const DEFAULT_VALUES: ProductFormValues = {
  name: '',
  slug: '',
  code: '',
  description: '',
  destination_id: null,
  supplier_id: null,
  duration: 1,
  duration_type: 'day',
  highlight: '',
  include: '',
  exclude: '',
  min_price: 0,
  review_point: 0,
  status: 'draft',
  thumbnail: '',
  itinerary_image: '',
  images: [],
};

export function useProductForm(productId?: string) {
  const router = useRouter();
  const isEdit = !!productId;

  const [options, setOptions] = useState<OptionFormValues[]>([]);
  const [itineraries, setItineraries] = useState<ItineraryFormValues[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!isEdit) return;
    const found = getProducts().find((p) => p.id === productId);
    if (!found) return;
    form.reset({ ...found, images: (found.images ?? []).map((url) => ({ url })) });
    setOptions(found.options ?? []);
    setItineraries(found.itineraries ?? []);
  }, [isEdit, productId, form]);

  const onSubmit = (data: ProductFormValues) => {
    const products = getProducts();
    const imagesUrls = (data.images ?? []).map((img) => img.url).filter(Boolean);

    let suppliers: { id: string; name: string }[] = [];
    let destinations: { id: string; name: string }[] = [];
    try {
      suppliers = JSON.parse(localStorage.getItem('admin_suppliers') || '[]');
      destinations = JSON.parse(localStorage.getItem('admin_destinations') || '[]');
    } catch {
      /* ignore */
    }

    const supplier = suppliers.find((s) => s.id === data.supplier_id);
    const destination = destinations.find((d) => d.id === data.destination_id);
    const now = new Date().toISOString();

    if (isEdit) {
      const idx = products.findIndex((p) => p.id === productId);
      if (idx !== -1) {
        products[idx] = {
          ...products[idx],
          ...data,
          images: imagesUrls,
          options,
          itineraries,
          supplier,
          destination,
          updated_at: now,
        };
      }
    } else {
      products.unshift({
        ...data,
        images: imagesUrls,
        options,
        itineraries,
        supplier,
        destination,
        id: crypto.randomUUID(),
        created_at: now,
        updated_at: now,
      });
    }

    saveProducts(products);
    router.push(ROUTE.ADMIN_PRODUCTS);
  };

  return { form, isEdit, options, setOptions, itineraries, setItineraries, onSubmit };
}
