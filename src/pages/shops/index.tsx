import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ShopList from '@/components/shop/shop-list';
import { useMemo, useState } from 'react';
import Search from '@/components/common/search';
import { adminOnly } from '@/utils/auth-utils';
import { useShopsQuery } from '@/data/shop';
import { Shop, SortOrder } from '@/types';
import PageHeading from '@/components/common/page-heading';
import { useQuery } from 'react-query';
import { getShopsFn } from '@/services/shop';
import { getErrorMessage } from '@/utils/helpers';

export default function AllShopPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [orderBy, setOrder] = useState('created_at');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);
  // const { shops, paginatorInfo, loading, error } = useShopsQuery({
  //   name: searchTerm,
  //   limit: 10,
  //   page,
  //   orderBy,
  //   sortedBy,
  // });

  const shopsQuery = useQuery(['get_shops'], () => {
    return getShopsFn();
  });

  const shopsData = useMemo(() => {
    if (shopsQuery.data?.data) {
      if (searchTerm) {
        return (shopsQuery.data.data as Shop[])?.filter(
          (x) => x.name?.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }
      return shopsQuery.data.data;
    }

    return null;
  }, [shopsQuery.isLoading, shopsQuery.data, searchTerm]);

  if (shopsQuery.isLoading) return <Loader text={t('common:text-loading')} />;
  if (shopsQuery.isError)
    return <ErrorMessage message={getErrorMessage(shopsQuery.error)} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
  }

  function handlePagination(current: any) {
    setPage(current);
  }
  return (
    <>
      <Card className="mb-8 flex flex-col items-center justify-between md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/4">
          <PageHeading title={t('common:sidebar-nav-item-shops')} />
        </div>

        <div className="flex w-full flex-col items-center ms-auto md:w-1/2 md:flex-row">
          <Search
            onSearch={handleSearch}
            placeholderText={t('form:input-placeholder-search-name')}
          />
        </div>
      </Card>
      <ShopList
        shops={shopsData}
        paginatorInfo={null}
        onPagination={handlePagination}
        onOrder={setOrder}
        onSort={setColumn}
      />
    </>
  );
}
AllShopPage.authenticate = {
  permissions: adminOnly,
};
AllShopPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
