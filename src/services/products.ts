import { getErrorMessage } from '@/utils/helpers';
import request from './index';

export const publishProductForadmin = async ({
  uid,
  status,
}: {
  uid: string;
  status: boolean;
}) => {
  try {
    const res = await request.post('/shop/product/update', {
      uid,
      status: status ? 'publish' : 'unpublish',
    });

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
