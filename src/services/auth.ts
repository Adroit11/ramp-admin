import { getErrorMessage } from '@/utils/helpers';
import request from './index';

export interface SignupDataType {
  name: string;
  email: string;
  password: string;
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
