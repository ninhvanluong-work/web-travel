import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { useProductById } from '@/api/product';
import { mapApiToProductPage } from '@/modules/ProductPage/adapter';
import BookingSheet from '@/modules/ProductPage/components/booking-sheet';

const BookingPage: NextPage = () => {
  const router = useRouter();
  const { t } = useTranslation('productPage');
  const productId = router.query.id as string | undefined;

  const { data, isLoading, isError } = useProductById({
    variables: { id: productId! },
    enabled: !!productId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F6E56]" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
        <p className="text-[15px] font-semibold text-gray-800">Failed to load booking details.</p>
        <button
          onClick={() => router.push(`/product/${productId}`)}
          className="mt-4 px-6 py-2.5 bg-[#0F6E56] text-white rounded-full text-[14px] font-medium"
        >
          Go back
        </button>
      </div>
    );
  }

  const p = mapApiToProductPage(data, t);

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex justify-center overflow-hidden">
      {/* Mobile-first wrapper matching the main layout */}
      <div className="w-full max-w-[480px] h-[100dvh] bg-white shadow-lg relative flex flex-col overflow-hidden">
        <BookingSheet
          productName={p.name}
          duration={p.quickFacts.duration}
          adultPrice={p.salePrice}
          currency={p.currency}
          onClose={() => router.push(`/product/${productId}`)}
        />
      </div>
    </div>
  );
};

export default BookingPage;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'productPage'])),
    },
  };
}
