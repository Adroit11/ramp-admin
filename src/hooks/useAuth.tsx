import { getUserFn } from '@/services/auth';
import { Shop } from '@/types';
import { useState } from 'react';
import { useQuery } from 'react-query';

export interface UserDetailsType {
  id: number;
  uid: string;
  name: string;
  email: string;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
  is_active: number;
  role: 'super_admin' | 'store_owner';
  permissions: {
    shops: Array<'view-shops' | 'create-shop'>;
    products: Array<'view-products' | 'create-product'>;
    orders: Array<'view-orders'>;
    transactions: Array<'view-transactions'>;
    users: Array<'view-users' | 'create-user'>;
    admins: Array<'view-admins' | 'create-admin'>;
  };
  roles: {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    pivot: {
      model_type: string;
      model_id: number;
      role_id: number;
    };
  }[];
  shops: Shop[];
  statistics: {
    total_products: number;
    total_shops: number;
    total_orders: number;
  };
}

export const useAuth = () => {
  const [user, setUser] = useState<UserDetailsType | null>(null);

  const getUserQuery = useQuery(
    ['get_user_details'],
    () => {
      return getUserFn();
    },
    {
      refetchInterval: false,
      retry: false,
      onSuccess: (data) => {
        setUser(data?.data);
      },
    },
  );

  return {
    user,
    ...getUserQuery,
  };
};
