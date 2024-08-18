import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { useMeQuery } from '@/data/user';
import ShopCard from '@/components/shop/shop-card';
import {
  adminOnly,
  getAuthCredentials,
  getUserAuthData,
  hasAccess,
} from '@/utils/auth-utils';
import NotFound from '@/components/ui/not-found';
import { isEmpty } from 'lodash';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from 'react-query';
import { getShopsFn } from '@/services/shop';
import { getErrorMessage } from '@/utils/helpers';
import { useMemo } from 'react';
import { GetShopsTypeForOwner } from '@/types/shops';
import { Shop } from '@/types';

const ShopList = () => {
  const { t } = useTranslation();
  // const { data, isLoading: loading, error } = useMeQuery();
  const { user, isLoading } = useAuth();
  const userAuthData = getUserAuthData();
  // const { permissions } = getAuthCredentials();
  // let permission = hasAccess(adminOnly, permissions);

  const getShopsQuery = useQuery(['get_shops'], () => {
    return getShopsFn();
  });

  const shopsList = useMemo(() => {
    if (getShopsQuery.data?.data && getShopsQuery.data.data?.length > 0) {
      return getShopsQuery.data.data as Shop[];
    }

    return [];
  }, [getShopsQuery.isLoading, getShopsQuery.data]);

  if (getShopsQuery.isLoading)
    return <Loader text={t('common:text-loading')} />;
  if (getShopsQuery.isError)
    return <ErrorMessage message={getErrorMessage(getShopsQuery.error)} />;

  return (
    <>
      {userAuthData?.permissions?.shops?.includes('view-shops') ? (
        <div className="mb-5 border-b border-dashed border-border-base pb-5 md:mb-8 md:pb-7 ">
          <h1 className="text-lg font-semibold text-heading">
            {t('common:sidebar-nav-item-my-shops')}
          </h1>
        </div>
      ) : null}

      {getShopsQuery.data ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4">
          {shopsList?.map((myShop: any, idx: number) => (
            <ShopCard shop={myShop} key={idx} />
          ))}
        </div>
      ) : null}

      {!getShopsQuery.isLoading && !shopsList.length ? (
        <NotFound
          image="/no-shop-found.svg"
          text="text-no-shop-found"
          className="mx-auto w-7/12"
        />
      ) : null}

      {/* {!!data?.managed_shop ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4">
          <ShopCard shop={data?.managed_shop} />
        </div>
      ) : null} */}
    </>
  );
};

export default ShopList;
