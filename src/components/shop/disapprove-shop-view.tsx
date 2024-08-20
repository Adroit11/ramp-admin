import ConfirmationCard from '@/components/common/confirmation-card';
import { CheckMarkCircle } from '@/components/icons/checkmark-circle';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDisApproveShopMutation } from '@/data/shop';
import { publishProductForadmin } from '@/services/products';
import { revokeShopApprovalForadmin } from '@/services/shop';
import { getErrorMessage } from '@/utils/helpers';
import { useTranslation } from 'next-i18next';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

const ProductDeleteView = ({ isProduct }: { isProduct?: boolean }) => {
  const queryClient = useQueryClient();

  const { t } = useTranslation();
  // const { mutate: disApproveShopById, isLoading: loading } =
  //   useDisApproveShopMutation();

  const { data: modalData } = useModalState();
  const { closeModal } = useModalAction();

  const disapprove = useMutation({
    mutationFn: revokeShopApprovalForadmin,
    onSuccess: () => {
      toast.success('Disapproved');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
    onSettled: () => {
      queryClient.invalidateQueries('get_shops');
      closeModal();
    },
  });
  const publishProduct = useMutation({
    mutationFn: publishProductForadmin,
    onSuccess: () => {
      toast.success('Unpublished!');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
    onSettled: () => {
      queryClient.invalidateQueries('get_shop_products');
      closeModal();
    },
  });

  async function handleDelete() {
    // disApproveShopById(
    //   { id: modalData as string },
    //   {
    //     onSettled: () => {

    //     },
    //   },
    // );
    if (isProduct) {
      publishProduct.mutate({ uid: modalData, status: false });
    } else {
      disapprove.mutate(modalData);
    }
  }

  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleDelete}
      deleteBtnLoading={disapprove.isLoading || publishProduct.isLoading}
      deleteBtnText="text-shop-approve-button"
      icon={<CheckMarkCircle className="m-auto mt-4 h-10 w-10 text-accent" />}
      deleteBtnClassName="!bg-accent focus:outline-none hover:!bg-accent-hover focus:!bg-accent-hover"
      cancelBtnClassName="!bg-red-600 focus:outline-none hover:!bg-red-700 focus:!bg-red-700"
      title={isProduct ? 'UnPublish this product?' : 'text-disapprove-shop'}
      description={isProduct ? '' : t('text-shop-disapprove-description')}
    />
  );
};

export default ProductDeleteView;
