import { getErrorMessage } from '@/utils/helpers';
import request from './index';

export interface SignupDataType {
  name: string;
  email: string;
  password: string;
  currency?: string;
}
export interface LoginDataType {
  email: string;
  password: string;
}

export const registerFn = async (data: SignupDataType) => {
  try {
    const res = await request.post('/auth/register', data);

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const loginFn = async (data: LoginDataType) => {
  try {
    const res = await request.post('/auth/login', data);

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getUserFn = async () => {
  try {
    const res = await request.get('/auth/user');

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getCurrenciesFn = async () => {
  try {
    const res = await request.get('/settings/currencies');

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const createCurrencyFn = async (data: {
  code: string;
  name: string;
  exchange_rate: number;
}) => {
  try {
    const res = await request.post('/settings', data);

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
export const editCurrencyFn = async (data: {
  uid: string;
  exchange_rate: number;
}) => {
  try {
    const res = await request.post('/settings/update', data);

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
export const deleteCurrencyFn = async (uid: string) => {
  try {
    const res = await request.post('/settings/delete', { uid });

    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
