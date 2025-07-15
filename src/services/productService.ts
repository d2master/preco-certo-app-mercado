import { ProductFromAPI } from '@/types/product';

const OPENFOODFACTS_API = 'https://world.openfoodfacts.org/api/v0/product';

export const getProductByBarcode = async (barcode: string): Promise<ProductFromAPI | null> => {
  try {
    const response = await fetch(`${OPENFOODFACTS_API}/${barcode}.json`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

export const formatProductFromAPI = (apiProduct: ProductFromAPI) => {
  const product = apiProduct.product;
  return {
    id: `${apiProduct.code}-${Date.now()}`,
    code: apiProduct.code,
    name: product?.product_name || 'Produto não identificado',
    brand: product?.brands || undefined,
    image: product?.image_front_url || product?.image_url || undefined,
    quantity: 1,
    price: 0
  };
};