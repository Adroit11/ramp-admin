export interface GetShopsTypeForOwner {
  id: number;
  uid: string;
  owner_id: number;
  name: string;
  slug: string;
  description: string;
  cover_image: string;
  logo: string;
  is_active: number;
  address: string[];
  created_at: string;
  updated_at: string;
}

export interface GetShopDetailsTypeForOwner {
  id: number;
  uid: string;
  owner_id: number;
  owner: {
    id: number;
    uid: string;
    name: string;
    email: string;
    email_verified_at: string;
    is_active: number;
    created_at: string;
    updated_at: string;
  };
  name: string;
  slug: string;
  description: string;
  cover_image: string;
  logo: string;
  is_active: number;
  address: Record<string, string>;
  created_at: string;
  updated_at: string;
  shop_website_link: string;
}

export interface GetShopProductTypeForOwner {
  id: number;
  name: string;
  slug: string;
  product_type: string;
  shop: {
    id: number;
    uid: string;
    owner_id: number;
    name: string;
    slug: string;
    description: string;
    cover_image: string;
    logo: string;
    is_active: number;
    address: string[];
    created_at: string;
    updated_at: string;
  };
  selling_price: null;
  image: string;
  status: 'publish' | 'draft';
  price: number;
  quantity: number;
  visibility: number;
}
