import { Product } from '.';

export interface OrderType {
  uid: string;
  tracking_number: string;
  quantity: 1;
  amount: 2000;
  total: 2000;
  note: string;
  customer: null;
  shipping_address: string;
  billing_address: {
    '%22address%22': string;
    '%22city%22': string;
    '%22state%22': string;
    '%22country%22': string;
  };
  order_status: string;
  payment_status: string;
  shop: {
    id: 10;
    uid: string;
    owner_id: 5;
    name: string;
    slug: string;
    description: string;
    cover_image: string;
    logo: string;
    is_active: 0;
    address: {
      '%22address%22': string;
      '%22city%22': string;
      '%22state%22': string;
      '%22country%22': string;
    };
    created_at: string;
    updated_at: string;
  };
  products: Product[];
}
