import {
  createCurrencyFn,
  deleteCurrencyFn,
  editCurrencyFn,
  getCurrenciesFn,
} from '@/services/auth';
import { CurrencyType } from '@/types/auth';
import { getErrorMessage } from '@/utils/helpers';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

export const useCurrency = (onClose?: () => void) => {
  const [currencies, setCurrencies] = useState<CurrencyType[] | null>(null);
  const queryClient = useQueryClient();
  const getCurrencyQuery = useQuery(
    ['get_currencies'],
    () => {
      return getCurrenciesFn();
    },
    {
      refetchInterval: false,
      retry: false,
      onSuccess: (data) => {
        setCurrencies(data?.data);
      },
    },
  );

  const editCurrency = useMutation({
    mutationFn: editCurrencyFn,
    onSuccess: () => {
      toast.success('Updated successfully');
      onClose && onClose();
    },
    onError: (err: Error) => {
      toast.error(getErrorMessage(err));
    },
    onSettled: () => {
      queryClient.invalidateQueries('get_currencies');
    },
  });
  const createCurrency = useMutation({
    mutationFn: createCurrencyFn,
    onSuccess: () => {
      toast.success('Created successfully');
      onClose && onClose();
    },
    onError: (err: Error) => {
      toast.error(getErrorMessage(err));
    },
    onSettled: () => {
      queryClient.invalidateQueries('get_currencies');
    },
  });
  const deleteCurrencyMutation = useMutation({
    mutationFn: deleteCurrencyFn,
    onSuccess: () => {
      toast.success('Deleted successfully');
      onClose && onClose();
    },
    onError: (err: Error) => {
      toast.error(getErrorMessage(err));
    },
    onSettled: () => {
      queryClient.invalidateQueries('get_currencies');
    },
  });

  return {
    currencies,
    get: { ...getCurrencyQuery },
    edit: { ...editCurrency },
    create: { ...createCurrency },
    deleteCurrency: { ...deleteCurrencyMutation },
  };
};
