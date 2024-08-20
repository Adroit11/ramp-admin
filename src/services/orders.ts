import { getErrorMessage } from '@/utils/helpers';
import request from './index';

export const getAdminsFn = async () => {
  try {
    const res = await request.get('/user/admin');

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getStoreOwnersFn = async () => {
  try {
    const res = await request.get('/user/store-owner');

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export interface UpdateStoreOwnerDetailsType {
  uid: string;

  status?: 'approve' | 'disapprove';
  name?: string;
  email?: string;
}

export const updateStoreOwnerDetailsFn = async (
  data: UpdateStoreOwnerDetailsType,
) => {
  try {
    const res = await request.post('/user/store-owner/update', data);

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// ORDERS

export const getOrders = async () => {
  try {
    const res = await request.get('/orders');

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
export const getOrderDetailFn = async (uid: string) => {
  try {
    const res = await request.post('/shop/orders/details', { uid });

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
export const updateOrderDetailFn = async (data: {
  uid: string;
  payment_status?: string;
  order_status?: string;
}) => {
  try {
    const res = await request.post('/shop/orders/update', data);

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
