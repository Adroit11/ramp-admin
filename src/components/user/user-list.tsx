import Pagination from '@/components/ui/pagination';
import Image from 'next/image';
import { Table } from '@/components/ui/table';
import ActionButtons from '@/components/common/action-buttons';
import { siteSettings } from '@/settings/site.settings';
import {
  Category,
  MappedPaginatorInfo,
  SortOrder,
  User,
  UserPaginator,
} from '@/types';
import { useMeQuery } from '@/data/user';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import { useState } from 'react';
import TitleWithSort from '@/components/ui/title-with-sort';
import { NoDataFound } from '@/components/icons/no-data-found';
import Avatar from '@/components/common/avatar';
import Badge from '@/components/ui/badge/badge';
import { StoreOwnerDataType } from '@/types/users';
import { useMutation, useQueryClient } from 'react-query';
import {
  updateAdminDetailsFn,
  updateStoreOwnerDetailsFn,
} from '@/services/orders';
import { toast } from 'react-toastify';
import { getErrorMessage } from '@/utils/helpers';
import { CheckMarkCircle } from '../icons/checkmark-circle';
import { CloseFillIcon } from '../icons/close-fill';
import { EditIcon } from '../icons/edit';
import Modal from '../ui/modal/modal';
import Input from '../ui/input';
import Button from '../ui/button';

type IProps = {
  customers: StoreOwnerDataType[];
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (current: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;

  isAdmin?: boolean;
};
const UserList = ({
  customers,
  paginatorInfo,
  isAdmin,
  onPagination,
  onSort,
  onOrder,
}: IProps) => {
  const [openModals, setOpenModals] = useState({
    approvedStoreOwner: false,
    revokeStoreOwner: false,
    updateStoreOwner: false,
    approveAdmin: false,
    revokeAdmin: false,
  });
  const [storeOwner, setStoreOwner] = useState<{
    name: string;
    email: string;
    uid: string;
  } | null>(null);
  const [loadingIndex, setLoadingIndex] = useState('');

  const { t } = useTranslation();
  const { alignLeft } = useIsRTL();
  const [sortingObj, setSortingObj] = useState<{
    sort: SortOrder;
    column: any | null;
  }>({
    sort: SortOrder.Desc,
    column: null,
  });
  const queryClient = useQueryClient();

  const onHeaderClick = (column: any | null) => ({
    onClick: () => {
      onSort((currentSortDirection: SortOrder) =>
        currentSortDirection === SortOrder.Desc
          ? SortOrder.Asc
          : SortOrder.Desc,
      );

      onOrder(column);

      setSortingObj({
        sort:
          sortingObj.sort === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc,
        column: column,
      });
    },
  });

  const updateStoreOwner = useMutation({
    mutationFn: updateStoreOwnerDetailsFn,
    onSuccess: () => {
      toast.success('Update successful');
      setOpenModals({
        approvedStoreOwner: false,
        revokeStoreOwner: false,
        updateStoreOwner: false,
        approveAdmin: false,
        revokeAdmin: false,
      });
      setStoreOwner(null);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
    onSettled: () => {
      queryClient.invalidateQueries('get_store_owners');
      setLoadingIndex('');
    },
  });

  const handleUserStatus = (status: boolean, uid: string) => {
    if (isAdmin) {
      updateAdmin.mutate({
        uid,
        status: status ? 'approve' : 'disapprove',
      });
    } else {
      updateStoreOwner.mutate({
        uid,
        status: status ? 'approve' : 'disapprove',
      });
    }
  };

  const updateAdmin = useMutation({
    mutationFn: updateAdminDetailsFn,
    onSuccess: () => {
      toast.success('Update successful');
      setOpenModals({
        approvedStoreOwner: false,
        revokeStoreOwner: false,
        updateStoreOwner: false,
        approveAdmin: false,
        revokeAdmin: false,
      });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
    onSettled: () => {
      queryClient.invalidateQueries('get_admins');
      setLoadingIndex('');
    },
  });

  const columns = [
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-id')}
          ascending={
            sortingObj.sort === SortOrder.Asc && sortingObj.column === 'id'
          }
          isActive={sortingObj.column === 'id'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'id',
      key: 'id',
      align: alignLeft,
      width: 150,
      onHeaderCell: () => onHeaderClick('id'),
      render: (id: number) => `#${t('table:table-item-id')}: ${id}`,
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-title')}
          ascending={
            sortingObj.sort === SortOrder.Asc && sortingObj.column === 'id'
          }
          isActive={sortingObj.column === 'id'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'name',
      key: 'name',
      align: alignLeft,
      width: 250,
      ellipsis: true,
      onHeaderCell: () => onHeaderClick('name'),
      render: (
        name: string,
        { profile, email }: { profile: any; email: string },
      ) => (
        <div className="flex items-center">
          <Avatar name={name} src={profile?.avatar?.thumbnail} />
          <div className="flex flex-col whitespace-nowrap font-medium ms-2">
            {name}
            <span className="text-[13px] font-normal text-gray-500/80">
              {email}
            </span>
          </div>
        </div>
      ),
    },
    // {
    //   title: t('table:table-item-permissions'),
    //   dataIndex: 'permissions',
    //   key: 'permissions',
    //   align: alignLeft,
    //   width: 300,
    //   render: (permissions: any) => {
    //     return (
    //       <div className="flex flex-wrap gap-1.5 whitespace-nowrap">
    //         {permissions?.map(
    //           ({ name, index }: { name: string; index: number }) => (
    //             <span
    //               key={index}
    //               className="rounded bg-gray-200/50 px-2.5 py-1"
    //             >
    //               {name}
    //             </span>
    //           ),
    //         )}
    //       </div>
    //     );
    //   },
    // },
    // {
    //   title: t('table:table-item-available_wallet_points'),
    //   dataIndex: ['wallet', 'available_points'],
    //   key: 'available_wallet_points',
    //   align: 'center',
    //   width: 150,
    // },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-status')}
          ascending={
            sortingObj.sort === SortOrder.Asc &&
            sortingObj.column === 'is_active'
          }
          isActive={sortingObj.column === 'is_active'}
        />
      ),
      width: 150,
      className: 'cursor-pointer',
      dataIndex: 'is_active',
      key: 'is_active',
      align: 'center',
      onHeaderCell: () => onHeaderClick('is_active'),
      render: (is_active: boolean) => (
        <Badge
          textKey={is_active ? 'common:text-active' : 'common:text-inactive'}
          color={
            is_active
              ? 'bg-accent/10 !text-accent'
              : 'bg-status-failed/10 text-status-failed'
          }
        />
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'uid',
      key: 'actions',
      align: 'right',
      width: 120,
      render: function Render(uid: string, item: StoreOwnerDataType) {
        return (
          <div className="inline-flex w-auto items-center gap-3">
            {!item.is_active ? (
              <button
                onClick={() => {
                  setLoadingIndex(uid);
                  handleUserStatus(true, uid);
                }}
                className="text-accent transition duration-200 hover:text-accent-hover focus:outline-none"
                title={t('Approve admin status')}
                disabled={updateAdmin.isLoading || updateStoreOwner.isLoading}
              >
                {(updateAdmin.isLoading || updateStoreOwner.isLoading) &&
                loadingIndex === uid ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <CheckMarkCircle width={16} />
                )}
              </button>
            ) : (
              <button
                onClick={() => {
                  setLoadingIndex(uid);
                  handleUserStatus(false, uid);
                }}
                className="text-red-500 transition duration-200 hover:text-red-600 focus:outline-none"
                title={t('Revoke admin status')}
                disabled={updateAdmin.isLoading || updateStoreOwner.isLoading}
              >
                {(updateAdmin.isLoading || updateStoreOwner.isLoading) &&
                loadingIndex === uid ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <CloseFillIcon width={16} />
                )}
              </button>
            )}

            {/* edit store owner */}
            {!isAdmin ? (
              <button
                onClick={() => {
                  setStoreOwner({
                    name: item.name,
                    email: item.email,
                    uid: item.uid,
                  });
                  setOpenModals((prev) => ({
                    ...prev,
                    updateStoreOwner: true,
                  }));
                }}
                className="text-body transition duration-200 hover:text-heading focus:outline-none"
                title={t('common:text-edit')}
              >
                <EditIcon width={16} />
              </button>
            ) : null}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="mb-6 overflow-hidden rounded shadow">
        <Table
          // @ts-ignore
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
          data={customers}
          rowKey="id"
          scroll={{ x: 1000 }}
        />
      </div>

      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.currentPage}
            pageSize={paginatorInfo.perPage}
            onChange={onPagination}
          />
        </div>
      )}

      {/* storeowner update - modal*/}
      <Modal
        open={openModals.updateStoreOwner}
        onClose={() => {
          setOpenModals((prev) => ({
            ...prev,
            updateStoreOwner: false,
          }));
        }}
      >
        <div className="m-auto w-full max-w-md rounded-md bg-light p-4 pb-6 sm:w-[24rem] md:rounded-xl">
          <div className="h-full w-full text-center">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (storeOwner) updateStoreOwner.mutate(storeOwner);
              }}
            >
              <div className="py-6">
                <Input
                  label={'Store Owner Name'}
                  name="store_owner_name"
                  variant="outline"
                  className="mb-5 flex flex-col items-start"
                  defaultValue={storeOwner?.name}
                  onChange={(e) => {
                    if (storeOwner)
                      // @ts-ignore
                      setStoreOwner((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                  }}
                  required
                />
                <Input
                  label={'Store Owner Email'}
                  name="store_owner_email"
                  type={'email'}
                  variant="outline"
                  className="mb-5 flex flex-col items-start"
                  defaultValue={storeOwner?.email}
                  onChange={(e) => {
                    if (storeOwner)
                      // @ts-ignore
                      setStoreOwner((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }));
                  }}
                  required
                />

                <div className="mt-6">
                  <Button
                    className="!px-10"
                    loading={updateStoreOwner.isLoading}
                  >
                    Update
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UserList;
