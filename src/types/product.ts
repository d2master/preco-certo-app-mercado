export interface Product {
  id: string;
  code: string;
  name: string;
  brand?: string;
  image?: string;
  quantity: number;
  price: number;
}

export interface ProductFromAPI {
  code: string;
  product: {
    product_name?: string;
    brands?: string;
    image_url?: string;
    image_front_url?: string;
  };
  status: number;
  status_verbose: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  products: Product[];
  createdAt: string;
  completedAt?: string;
  total: number;
}