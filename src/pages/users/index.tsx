import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import Search from '@/components/common/search';
import UserList from '@/components/user/user-list';
import LinkButton from '@/components/ui/link-button';
import { useMemo, useState } from 'react';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useUsersQuery } from '@/data/user';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Routes } from '@/config/routes';
import { SortOrder } from '@/types';
import { adminOnly } from '@/utils/auth-utils';
import PageHeading from '@/components/common/page-heading';
import { useQuery } from 'react-query';
import { getAdminsFn, getStoreOwnersFn } from '@/services/orders';
import { AdminsDataType, StoreOwnerDataType } from '@/types/users';
import { getErrorMessage } from '@/utils/helpers';
import Button from '@/components/ui/button';

export default function AllUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<1 | 2>(1);

  const [page, setPage] = useState(1);
  const { t } = useTranslation();

  const [orderBy, setOrder] = useState('created_at');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);

  const storeOwnersQuery = useQuery(['get_store_owners'], () => {
    return getStoreOwnersFn();
  });
  const adminsQuery = useQuery(['get_admins'], () => {
    return getAdminsFn();
  });

  const storeOwners = useMemo(() => {
    if (storeOwnersQuery.data?.data) {
      if (searchTerm) {
        return (storeOwnersQuery.data.data as StoreOwnerDataType[])?.filter(
          (x) => x.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      return storeOwnersQuery.data.data as StoreOwnerDataType[];
    }
    return null;
  }, [storeOwnersQuery.isLoading, storeOwnersQuery.data, searchTerm]);

  const admins = useMemo(() => {
    if (adminsQuery.data?.data) {
      if (searchTerm) {
        return (adminsQuery.data.data as AdminsDataType[])?.filter((x) =>
          x.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }
      return adminsQuery.data.data as AdminsDataType[];
    }
    return null;
  }, [adminsQuery.isLoading, adminsQuery.data, searchTerm]);

  console.log('oooo', searchTerm);
  // const { users, paginatorInfo, loading, error } = useUsersQuery({
  //   limit: 20,
  //   page,
  //   name: searchTerm,
  //   orderBy,
  //   sortedBy,
  // });

  if (storeOwnersQuery.isLoading || adminsQuery.isLoading)
    return <Loader text={t('common:text-loading')} />;
  if (storeOwnersQuery.isError || adminsQuery.isError)
    return (
      <ErrorMessage
        message={getErrorMessage(storeOwnersQuery.error ?? adminsQuery.error)}
      />
    );

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    setPage(1);
  }

  function handlePagination(current: any) {
    setPage(current);
  }

  return (
    <>
      <Card className="mb-8 flex flex-col items-center md:flex-row">
        <div className=" w-full flex justify-center items-center gap-5">
          <Button
            variant={activeTab === 2 ? 'custom' : 'normal'}
            size="small"
            onClick={() => {
              setSearchTerm('');
              setActiveTab(1);
            }}
          >
            StoreOwners
          </Button>
          <Button
            variant={activeTab === 1 ? 'custom' : 'normal'}
            size="small"
            onClick={() => {
              setSearchTerm('');
              setActiveTab(2);
            }}
          >
            Admins
          </Button>
        </div>
      </Card>

      {activeTab === 1 ? (
        <>
          <Card className="mb-8 flex flex-col items-center md:flex-row">
            <div className="mb-4 md:mb-0 md:w-1/4">
              <PageHeading title={t('Store Owners')} />
            </div>

            <div className="flex w-full flex-col items-center space-y-4 ms-auto md:w-3/4 md:flex-row md:space-y-0 xl:w-2/4">
              <Search
                onSearch={handleSearch}
                placeholderText={t('form:input-placeholder-search-name')}
              />

              {/* <LinkButton
            href={`${Routes.user.create}`}
            className="h-12 w-full md:w-auto md:ms-6"
          >
            <span>+ {t('form:button-label-add-user')}</span>
          </LinkButton> */}
            </div>
          </Card>

          <UserList
            customers={storeOwners ?? []}
            paginatorInfo={null}
            onPagination={handlePagination}
            onOrder={setOrder}
            onSort={setColumn}
          />
        </>
      ) : (
        <>
          <Card className="mb-8 flex flex-col items-center md:flex-row">
            <div className="mb-4 md:mb-0 md:w-1/4">
              <PageHeading title={t('Admins')} />
            </div>

            <div className="flex w-full flex-col items-center space-y-4 ms-auto md:w-3/4 md:flex-row md:space-y-0 xl:w-2/4">
              <Search
                onSearch={handleSearch}
                placeholderText={t('form:input-placeholder-search-name')}
              />

              {/* <LinkButton
            href={`${Routes.user.create}`}
            className="h-12 w-full md:w-auto md:ms-6"
          >
            <span>+ {t('form:button-label-add-user')}</span>
          </LinkButton> */}
            </div>
          </Card>

          <UserList
            customers={admins ?? []}
            paginatorInfo={null}
            onPagination={handlePagination}
            onOrder={setOrder}
            onSort={setColumn}
            hideActions
          />
        </>
      )}
    </>
  );
}

AllUsersPage.authenticate = {
  permissions: adminOnly,
};
AllUsersPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
