import { clearStorage, getUserAuthData } from '@/utils/auth-utils';
import { API_BASE_URL } from '@/utils/helpers';
import axios from 'axios';

const options = {
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json,text/plain,*/*',
    'Content-Type': 'application/json',
  },
};

const request = axios.create(options);

request.interceptors.request.use(
  (config) => {
    const user = getUserAuthData();

    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
      config.headers['X-Auth-Header'] = user.token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

request.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    try {
      const errorData = error?.response?.data;

      if (
        errorData?.message === 'Unauthenticated.' ||
        error.response?.status === 401
      ) {
        clearStorage();
        window.location.reload();
      }

      return Promise.reject(error);
    } catch (error) {
      return Promise.reject(error);
    }
  },
);

export default request;
