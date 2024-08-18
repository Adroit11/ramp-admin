import { getUserFn } from '@/services/auth';
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
  shops: string[];
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
