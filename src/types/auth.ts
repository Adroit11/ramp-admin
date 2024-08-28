export interface UserAuthType {
  user: {
    id: number;
    uid: string;
    name: string;
    email: string;
    email_verified_at: string;
    created_at: string;
    updated_at: string;
    is_active: number;
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
  };
  token: string;
  refresh_token_code: string;
  permissions: {
    shops: Array<'view-shops' | 'create-shop'>;
    products: Array<'view-products' | 'create-product'>;
    orders: Array<'view-orders'>;
    transactions: Array<'view-transactions'>;
  };
  role: 'store_owner' | 'super_admin';
}

export interface CurrencyType {
  uid: string;
  name: string;
  code: string;
  exchange_rate: number;
}
