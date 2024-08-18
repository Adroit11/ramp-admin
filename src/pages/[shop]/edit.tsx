import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ShopForm from '@/components/shop/shop-form';
import ShopLayout from '@/components/layouts/shop';
import {
  adminAndOwnerOnly,
  adminOnly,
  getAuthCredentials,
  getUserAuthData,
  hasAccess,
} from '@/utils/auth-utils';
import { useShopQuery } from '@/data/shop';
import { Routes } from '@/config/routes';
import { useMeQuery } from '@/data/user';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from 'react-query';
import { getShopDetailsFn } from '@/services/shop';
import { useMemo } from 'react';
import { GetShopDetailsTypeForOwner } from '@/types/shops';
import { convertShopAddres, getErrorMessage } from '@/utils/helpers';

export default function UpdateShopPage() {
  const router = useRouter();
  const userAuthData = getUserAuthData();
  const { user, isLoading } = useAuth();
  // const { permissions } = getAuthCredentials();
  // const { data: me } = useMeQuery();
  const { query } = useRouter();
  const { shop } = query;
  const { t } = useTranslation();
  // const {
  //   data,
  //   isLoading: loading,
  //   error,
  // } = useShopQuery({
  //   slug: shop as string,
  // });

  const getShopQuery = useQuery(['get_shop_detail', shop?.toString()], () => {
    return getShopDetailsFn(shop?.toString() ?? '');
  });

  const shopData = useMemo(() => {
    if (getShopQuery.data?.data) {
      return getShopQuery.data.data as GetShopDetailsTypeForOwner;
    }
    return null;
  }, [getShopQuery.isLoading, getShopQuery.data]);

  if (isLoading) return <Loader text={t('common:text-loading')} />;
  if (getShopQuery.isError)
    return <ErrorMessage message={getErrorMessage(getShopQuery.error)} />;

  if (!userAuthData?.permissions?.shops?.includes('create-shop')) {
    router.replace(Routes.dashboard);
  }
  return (
    <>
      <div className="flex py-5 border-b border-dashed border-border-base sm:py-8">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-edit-shop')}
        </h1>
      </div>
      {shopData ? (
        <ShopForm
          initialValues={{
            name: shopData.name,
            description: shopData.description,
            uid: shopData.uid,
            image: shopData.logo,
            cover_image: shopData.cover_image,
            address: Object.values(shopData.address),
          }}
        />
      ) : null}
    </>
  );
}
UpdateShopPage.authenticate = {
  permissions: adminAndOwnerOnly,
};
UpdateShopPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
