import { Form } from '@/components/ui/form/form';
import Button from '@/components/ui/button';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import Input from '@/components/ui/input';
import { useTranslation } from 'next-i18next';
import { useApproveShopMutation } from '@/data/shop';
import { useMutation, useQueryClient } from 'react-query';
import { approveShopForadmin } from '@/services/shop';
import { toast } from 'react-toastify';
import { getErrorMessage } from '@/utils/helpers';
import { publishProductForadmin } from '@/services/products';

type FormValues = {
  admin_commission_rate: number;
};

const ApproveShopView = ({ isProduct }: { isProduct?: boolean }) => {
  const queryClient = useQueryClient();

  const { t } = useTranslation();
  // const { mutate: approveShopMutation, isLoading: loading } =
  //   useApproveShopMutation();

  const { data: shopId } = useModalState();
  const { closeModal } = useModalAction();

  const approve = useMutation({
    mutationFn: approveShopForadmin,
    onSuccess: () => {
      toast.success('Approved');
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
      toast.success('Published!');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
    onSettled: () => {
      queryClient.invalidateQueries('get_shop_products');
      closeModal();
    },
  });
  function onSubmit({ admin_commission_rate }: FormValues) {
    // approveShopMutation({
    //   id: shopId as string,
    //   admin_commission_rate: Number(admin_commission_rate),
    // });
    if (isProduct) {
      publishProduct.mutate({ uid: shopId, status: true });
    } else {
      approve.mutate(shopId);
    }
  }

  return (
    <Form<FormValues> onSubmit={onSubmit}>
      {({ register, formState: { errors } }) => (
        <div className="m-auto flex w-full max-w-sm flex-col rounded bg-light p-5 sm:w-[24rem]">
          <p className="text-center mb-12 text-xl font-semibold">
            {isProduct ? 'Publish Product' : 'Approve Shop'}
          </p>
          {/* <Input
            label={t('form:input-label-admin-commission-rate')}
            {...register('admin_commission_rate', {
              required: 'You must need to set your commission rate',
            })}
            defaultValue="10"
            variant="outline"
            className="mb-4"
            error={t(errors.admin_commission_rate?.message!)}
          /> */}
          <Button
            type="submit"
            loading={approve.isLoading || publishProduct.isLoading}
            disabled={approve.isLoading || publishProduct.isLoading}
            className="mx-auto"
          >
            {t('Confirm')}
          </Button>
        </div>
      )}
    </Form>
  );
};

export default ApproveShopView;
