import { getUserAuthData } from '@/utils/auth-utils';
import AppLayout from '@/components/layouts/app';
import { GetServerSideProps } from 'next';
import { Routes } from '@/config/routes';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CurrencyType } from '@/types/auth';
import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import { useTranslation } from 'react-i18next';
import Search from '@/components/common/search';
import { useMemo, useState } from 'react';
import { useIsRTL } from '@/utils/locals';
import { MappedPaginatorInfo, SortOrder } from '@/types';
import TitleWithSort from '@/components/ui/title-with-sort';
import Table from 'rc-table';
import { NoDataFound } from '@/components/icons/no-data-found';
import { useCurrency } from '@/hooks/useCurrency';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';
import { getErrorMessage } from '@/utils/helpers';
import { EditIcon } from '@/components/icons/edit';
import { TrashIcon } from '@/components/icons/trash';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal/modal';
import Input from '@/components/ui/input';

type IProps = {
  orders:
    | {
        name: string;
        uid: string;
        code: string;
        exchange_rate: string;
      }[]
    | undefined;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (current: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;
};

export default function Currencies() {
  const { t } = useTranslation();
  const [orderBy, setOrder] = useState('created_at');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);
  const [searchTerm, setSearchTerm] = useState('');
  const rowExpandable = (record: any) => record.children?.length;
  const { alignLeft, alignRight } = useIsRTL();
  // const { permissions } = getAuthCredentials();
  const userAuthData = getUserAuthData();
  const [sortingObj, setSortingObj] = useState<{
    sort: SortOrder;
    column: string | null;
  }>({
    sort: SortOrder.Desc,
    column: null,
  });
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [currencyToMange, setCurrencyToMange] = useState<CurrencyType | null>(
    null,
  );
  const [currencyToAdd, setCurrencyToAdd] = useState<CurrencyType | null>(null);

  const { currencies, get, create, edit, deleteCurrency } =
    useCurrency(onModalClose);

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
  }

  const onHeaderClick = (column: string | null) => ({
    onClick: () => {
      setColumn((currentSortDirection: SortOrder) =>
        currentSortDirection === SortOrder.Desc
          ? SortOrder.Asc
          : SortOrder.Desc,
      );
      setOrder(column!);

      setSortingObj({
        sort:
          sortingObj.sort === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc,
        column: column,
      });
    },
  });

  function onModalClose() {
    setOpenCreateModal(false);
    setOpenDeleteModal(false);
    setCurrencyToAdd(null);
    setCurrencyToMange(null);
  }

  const columns = useMemo(() => {
    const cols = [
      {
        title: (
          <TitleWithSort
            title={t('Currency Name')}
            ascending={
              sortingObj.sort === SortOrder.Asc && sortingObj.column === 'name'
            }
            isActive={sortingObj.column === 'name'}
          />
        ),
        dataIndex: 'name',
        key: 'name',
        align: alignLeft,
        width: 250,
        onHeaderCell: () => onHeaderClick('name'),
        // render: (logo: any, record: any) => (
        //   <Image
        //     src={logo?.thumbnail ?? siteSettings.product.placeholder}
        //     alt={record?.name}
        //     width={42}
        //     height={42}
        //     className="overflow-hidden rounded"
        //   />
        // ),
        // render: (customer: any) => (
        //   <div className="flex items-center">
        //     {/* <Avatar name={customer.name} src={customer?.profile.avatar.thumbnail} /> */}
        //     <Avatar name={customer?.name} />
        //     <div className="flex flex-col whitespace-nowrap font-medium ms-2">
        //       {customer?.name ? customer?.name : t('common:text-guest')}
        //       <span className="text-[13px] font-normal text-gray-500/80">
        //         {customer?.email}
        //       </span>
        //     </div>
        //   </div>
        // ),
      },
      {
        title: t('code'),
        dataIndex: 'code',
        key: 'code',
        align: 'center',
        // render: (products: Product) => <span>{products.length}</span>,
      },
      {
        title: (
          <TitleWithSort
            title={t('Exchange Rate')}
            ascending={
              sortingObj?.sort === SortOrder?.Asc &&
              sortingObj?.column === 'exchange_rate'
            }
            isActive={sortingObj?.column === 'exchange_rate'}
            className="cursor-pointer"
          />
        ),
        dataIndex: 'exchange_rate',
        key: 'exchange_rate',
        align: 'center',
        width: 120,
        onHeaderCell: () => onHeaderClick('exchnage_rate'),
      },
      {
        title: t('table:table-item-actions'),
        dataIndex: 'uid',
        key: 'actions',
        align: alignRight,
        width: 180,
        // @ts-ignore
        render: (uid: string, item: CurrencyType) => {
          return (
            <div className="inline-flex w-auto items-center gap-5">
              <button
                onClick={() => {
                  setCurrencyToMange(item);
                  setOpenCreateModal(true);
                }}
                className="text-accent transition duration-200 hover:text-accent-hover focus:outline-none"
                title={t('Edit Currency')}
                disabled={edit.isLoading}
              >
                <EditIcon width={16} />
              </button>

              <button
                onClick={() => {
                  setCurrencyToMange(item);
                  setOpenDeleteModal(true);
                }}
                className="text-red-500 transition duration-200 hover:text-red-600 focus:outline-none"
                title={t('Delete Currency')}
                disabled={deleteCurrency.isLoading}
              >
                <TrashIcon width={16} />
              </button>
            </div>
          );
        },
      },
    ];

    return cols;
  }, []);

  if (get.isLoading) return <Loader text={t('common:text-loading')} />;
  if (get.isError || userAuthData?.role === 'store_owner')
    return (
      <ErrorMessage
        message={
          userAuthData?.role === 'store_owner'
            ? 'RESTRICTED'
            : getErrorMessage(get.error)
        }
      />
    );

  return (
    <>
      <Card className="mb-8 flex flex-col items-center justify-between md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/4">
          <PageHeading title={t('Manage Currencies')} />
        </div>

        <div className="flex w-full flex-row items-center md:w-1/2">
          <Search
            onSearch={handleSearch}
            className="w-full"
            placeholderText={t('Search by currency name')}
          />

          <Button
            className="h-12 w-full md:w-auto md:ms-6"
            onClick={() => {
              setOpenCreateModal(true);
            }}
          >
            <span>+ {t('Add Currency')}</span>
          </Button>
        </div>
      </Card>

      <div className="mb-6 overflow-hidden rounded shadow">
        <Table
          //@ts-ignore
          columns={columns}
          emptyText={() => (
            <div className="flex flex-col items-center py-7">
              <NoDataFound className="w-52" />
              <div className="mb-1 pt-6 text-base font-semibold text-heading">
                {t('table:empty-table-data')}
              </div>
              <p className="text-[13px]">{t('table:empty-table-sorry-text')}</p>
            </div>
          )}
          data={currencies ?? []}
          rowKey="uid"
          scroll={{ x: 1000 }}
          expandable={{
            expandedRowRender: () => '',
            rowExpandable: rowExpandable,
          }}
        />
      </div>

      {/* create modal */}
      <Modal open={openCreateModal} onClose={onModalClose}>
        <div className="m-auto w-full max-w-md rounded-md bg-light p-4 pb-6 sm:w-[24rem] md:rounded-xl">
          <h3 className="font-semibold pt-5 pb-1 text-center text-lg">
            {currencyToMange ? 'Edit Currency' : 'Create Currency'}
          </h3>
          <div className="h-full w-full text-center">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (currencyToMange) {
                  edit.mutate({
                    uid: currencyToMange.uid,
                    exchange_rate: currencyToMange.exchange_rate,
                  });
                } else {
                  if (currencyToAdd)
                    create.mutate({
                      code: currencyToAdd?.code!,
                      exchange_rate: currencyToAdd.exchange_rate!,
                      name: currencyToAdd.name!,
                    });
                }
              }}
            >
              <div className="py-6">
                <Input
                  label={'Currency Name'}
                  name="currency_name"
                  variant="outline"
                  className="mb-5 flex flex-col items-start"
                  defaultValue={currencyToMange?.name}
                  disabled={!!currencyToMange?.name}
                  onChange={(e) => {
                    //  @ts-ignore
                    setCurrencyToAdd((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }));
                  }}
                  required
                />
                <Input
                  label={'Currency Code(3 letter ISO code)'}
                  name="currency_code"
                  variant="outline"
                  className="mb-5 flex flex-col items-start"
                  defaultValue={currencyToMange?.code}
                  disabled={!!currencyToMange?.code}
                  onChange={(e) => {
                    //  @ts-ignore
                    setCurrencyToAdd((prev) => ({
                      ...prev,
                      code: e.target.value,
                    }));
                  }}
                  required
                />
                <Input
                  label={'Exchange Rate'}
                  name="exchange_rate"
                  //   type="number"
                  variant="outline"
                  className="mb-5 flex flex-col items-start"
                  defaultValue={currencyToMange?.exchange_rate}
                  onChange={(e) => {
                    if (currencyToMange) {
                      //  @ts-ignore
                      setCurrencyToMange((prev) => ({
                        ...prev,
                        exchange_rate: e.target.value,
                      }));
                    } else {
                      //  @ts-ignore
                      setCurrencyToAdd((prev) => ({
                        ...prev,
                        exchange_rate: e.target.value,
                      }));
                    }
                  }}
                  required
                />

                <div className="mt-6">
                  <Button
                    className="!px-10"
                    loading={edit.isLoading || create.isLoading}
                  >
                    {currencyToMange ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Modal>

      {/* delete modal */}
      <Modal open={openDeleteModal} onClose={onModalClose}>
        <div className="m-auto w-full max-w-md rounded-md bg-light p-4 pb-6 sm:w-[24rem] md:rounded-xl">
          <h3 className="font-semibold pt-5 pb-3 text-center text-lg">
            {'Delete Currency'}
          </h3>
          <p className="text-center mb-16 px-4 text-gray-700">
            <span className="text-red-500 font-semibold">NOTE:</span>: this
            should only be used on <strong>recently created currencies</strong>{' '}
            that have not been used by stores
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              className="w-full sm:flex-1"
              variant="outline"
              onClick={onModalClose}
              disabled={deleteCurrency.isLoading}
            >
              Cancel
            </Button>
            <Button
              className="w-full sm:flex-1 bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (currencyToMange) deleteCurrency.mutate(currencyToMange.uid);
              }}
              loading={deleteCurrency.isLoading}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

Currencies.Layout = AppLayout;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { locale } = ctx;
  // TODO: Improve it
  const generateRedirectUrl = Routes.login;
  // const generateRedirectUrl =
  //   locale !== Config.defaultLanguage
  //     ? `/${locale}${Routes.login}`
  //     : Routes.login;
  // const { token, permissions } = getAuthCredentials(ctx);
  // if (
  //   !isAuthenticated({ token, permissions }) ||
  //   !hasAccess(allowedRoles, permissions)
  // ) {

  if (!getUserAuthData(ctx) || getUserAuthData(ctx)?.role !== 'super_admin') {
    return {
      redirect: {
        destination:
          getUserAuthData(ctx)?.role !== 'super_admin'
            ? '/'
            : generateRedirectUrl,
        permanent: false,
      },
    };
  }
  if (locale) {
    return {
      props: {
        ...(await serverSideTranslations('en', [
          'common',
          'form',
          'table',
          'widgets',
        ])),
        userPermissions: [],
        userAuthData: getUserAuthData(ctx),
      },
    };
  }
  return {
    props: {
      userPermissions: getUserAuthData(ctx) ? [getUserAuthData(ctx)?.role] : [],
      userAuthData: getUserAuthData(ctx),
    },
  };
};
