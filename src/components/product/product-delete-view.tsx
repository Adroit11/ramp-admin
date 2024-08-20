import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDeleteProductMutation } from '@/data/product';
import { deleteShopProductFn } from '@/services/shop';
import { getErrorMessage } from '@/utils/helpers';
import { useMutation } from 'react-query';
import { toast } from 'react-toastify';

const ProductDeleteView = () => {
  const { mutate: deleteProduct, isLoading: loading } =
    useDeleteProductMutation();
  const { data } = useModalState();
  const { closeModal } = useModalAction();

  const deleteMutation = useMutation({
    mutationFn: deleteShopProductFn,
    onSuccess: () => {
      toast.success('Deleted successfully');
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err));
    },
  });

  async function handleDelete() {
    try {
      // deleteProduct({ id: data });
      deleteMutation.mutate(data);
      closeModal();
    } catch (error) {
      closeModal();
      getErrorMessage(error);
    }
  }

  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleDelete}
      deleteBtnLoading={loading}
    />
  );
};

export default ProductDeleteView;
