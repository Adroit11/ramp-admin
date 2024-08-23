import CreateOrUpdateProductForm from '@/components/product/product-form';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ShopLayout from '@/components/layouts/shop';
import {
  adminOnly,
  adminOwnerAndStaffOnly,
  getAuthCredentials,
  getUserAuthData,
  hasAccess,
} from '@/utils/auth-utils';
import { useProductQuery } from '@/data/product';
import { Config } from '@/config';
import shop from '@/components/layouts/shop';
import { Routes } from '@/config/routes';
import { useShopQuery } from '@/data/shop';
import { useMeQuery } from '@/data/user';
import Link from '@/components/ui/link';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from 'react-query';
import { getShopProductFn } from '@/services/shop';
import { useMemo } from 'react';
import { Product } from '@/types';
import { getErrorMessage } from '@/utils/helpers';

export default function UpdateProductPage() {
  const { query, locale } = useRouter();
  const { t } = useTranslation();
  const router = useRouter();
  // const { permissions } = getAuthCredentials();
  // const { data: me } = useMeQuery();
  const userAuthData = getUserAuthData();
  const { user, isLoading } = useAuth();

  const productQuery = useQuery(
    ['get_product', query.productSlug as string],
    () => {
      return getShopProductFn(query.productSlug as string);
    },
  );

  const productData = useMemo(() => {
    if (productQuery.data?.data) {
      return productQuery.data.data as Product;
    }

    return null;
  }, [productQuery.data, productQuery.isLoading]);

  // const { data: shopData } = useShopQuery({
  //   slug: query?.shop as string,
  // });
  // const shopId = shopData?.id!;
  // const {
  //   product,
  //   isLoading: loading,
  //   error,
  // } = useProductQuery({
  //   slug: query.productSlug as string,
  //   language:
  //     query.action!.toString() === 'edit' ? locale! : Config.defaultLanguage,
  // });
  if (productQuery.isLoading) return <Loader text={t('common:text-loading')} />;
  if (productQuery.isError)
    return <ErrorMessage message={getErrorMessage(productQuery.error)} />;

  // if (
  //   !hasAccess(adminOnly, permissions) &&
  //   // !me?.shops?.map((shop) => shop.id).includes(shopId) &&
  //   me?.managed_shop?.id != shopId
  // ) {
  //   router.replace(Routes.dashboard);
  // }
  return (
    <>
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-edit-product')}
        </h1>
      </div>
      <CreateOrUpdateProductForm initialValues={productData} />
    </>
  );
}
UpdateProductPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
UpdateProductPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
