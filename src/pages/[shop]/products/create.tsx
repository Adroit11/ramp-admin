import ShopLayout from '@/components/layouts/shop';
import CreateOrUpdateProductForm from '@/components/product/product-form';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  adminOnly,
  adminOwnerAndStaffOnly,
  getAuthCredentials,
  getUserAuthData,
  hasAccess,
} from '@/utils/auth-utils';
import { Routes } from '@/config/routes';
import { useShopQuery } from '@/data/shop';
import { useMeQuery } from '@/data/user';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from 'react-query';
import { getShopDetailsFn } from '@/services/shop';
import { useMemo } from 'react';
import { GetShopDetailsTypeForOwner } from '@/types/shops';

export default function CreateProductPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    query: { shop },
  } = useRouter();
  // const { permissions } = getAuthCredentials();
  // const { data: me } = useMeQuery();
  const userAuthData = getUserAuthData();
  const { user, isLoading } = useAuth();
  // const { data: shopData } = useShopQuery({
  //   slug: shop as string,
  // });
  // const shopId = shopData?.id!;
  if (!userAuthData?.permissions?.products.includes('create-product')) {
    router.replace(Routes.dashboard);
  }

  const getShopQuery = useQuery(['get_shop_detail', shop?.toString()], () => {
    return getShopDetailsFn(shop?.toString() ?? '');
  });

  const shopData = useMemo(() => {
    if (getShopQuery.data?.data) {
      return getShopQuery.data.data as GetShopDetailsTypeForOwner;
    }
    return null;
  }, [getShopQuery.isLoading, getShopQuery.data]);

  return (
    <>
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-create-product')}
        </h1>
      </div>
      <CreateOrUpdateProductForm />
    </>
  );
}
CreateProductPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
CreateProductPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
