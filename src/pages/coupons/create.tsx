import Layout from '@/components/layouts/admin';
// import CouponCreateOrUpdateForm from '@/components/coupon/coupon-form';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function CreateCouponPage() {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-create-coupon')}
        </h1>
      </div>
      {/* <CouponCreateOrUpdateForm /> */}
    </>
  );
}
CreateCouponPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
