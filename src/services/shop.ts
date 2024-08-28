import { getErrorMessage } from '@/utils/helpers';
import request from './index';

export interface CreateShopDataType {
  name: string;
  description: string;
  address: string[];
  cover_image: File;
  image: File;
  url?: string;
  currency?: string;
}
export interface EditShopDataType {
  uid: string;
  description: string;
  address: string[];
  url?: string;
  shop_website_link?: string;
  cover_image?: File | string;
  image?: File | string;

  currency?: string;
  name?: string;
}

export const createShopFn = async (data: CreateShopDataType) => {
  try {
    const newData = new FormData();
    newData.append('name', data.name);
    newData.append('description', data.description);
    newData.append('address[1]', data.address[0]);
    newData.append('address[2]', data.address[1]);
    newData.append('address[3]', data.address[2]);
    newData.append('address[4]', data.address[3]);
    newData.append('image', data.image);
    newData.append('cover_image', data.cover_image);

    if (data.url) {
      newData.append('url', data.url);
    }
    if (data.currency) {
      newData.append('currency', data.currency);
    }

    const res = await request.post('/shop', newData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const editShopFn = async (data: EditShopDataType) => {
  try {
    const newData = new FormData();
    newData.append('uid', data.uid);
    newData.append('description', data.description);
    newData.append('address[1]', data.address[0]);
    newData.append('address[2]', data.address[1]);
    newData.append('address[3]', data.address[2]);
    newData.append('address[4]', data.address[3]);
    // newData.append('image', data.image);
    // newData.append('cover_image', data.cover_image);

    if (data.url) {
      newData.append('url', data.url);
    }

    if (data.currency) {
      newData.append('currency', data.currency);
    }

    const res = await request.post('/shop/update', newData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const deleteShopFn = async (uid: string) => {
  try {
    const res = await request.post('/shop/delete', { uid });

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getShopsFn = async () => {
  try {
    const res = await request.get('/shop');

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getShopDetailsFn = async (uid: string) => {
  try {
    const res = await request.post('/shop/details', { uid });

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const approveShopForadmin = async (uid: string) => {
  try {
    const res = await request.post('/shop/update', { uid, status: 'approve' });

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
export const revokeShopApprovalForadmin = async (uid: string) => {
  try {
    const res = await request.post('/shop/update', {
      uid,
      status: 'disapprove',
    });

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// products

export const getShopProductsFn = async (uid: string) => {
  try {
    const res = await request.get(`/shop/product?uid=${uid}`);

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export interface CreateShopProductDataType {
  shop_uid: string;
  name: string;
  description: string;
  price: string;
  quantity: string;
  // cover_image: File;
  image: File;
}
export interface EditShopProductDataType {
  uid?: string; // product uid
  description: string;
  price: number;
  quantity: number;

  name?: string;
  cover_image?: File;
  image?: File;
}

export const createShopProductFn = async (data: CreateShopProductDataType) => {
  try {
    const newData = new FormData();
    newData.append('shop_uid', data.shop_uid);
    newData.append('name', data.name);
    newData.append('description', data.description);
    newData.append('price', data.price);
    newData.append('quantity', data.quantity);
    newData.append('image', data.image);
    // newData.append('cover_image', data.cover_image);

    const res = await request.post('/shop/product', newData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const editShopProductFn = async (data: EditShopProductDataType) => {
  try {
    const res = await request.post('/shop/product/update', data);

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getShopProductFn = async (uid: string) => {
  try {
    const res = await request.post('/shop/product/details', { uid });

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const deleteShopProductFn = async (uid: string) => {
  try {
    const res = await request.post('/shop/product/delete', { uid });

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
