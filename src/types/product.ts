export interface CompatibilityItem {
  maker: string;
  line: string;
  model: string;
  configuration: string;
  year: string;
  fuel: string;
  engineVolume: string;
  bodyType: string;
}

export interface ProductListItem {
  id: string;
  itemId: string;
  name: string;
  stockQuantity: number;
  mrp: number;
  price: number;
  discountPercent: number;
  images: string[];
  maker: string;
  model: string;
  className: string;
  configuration: string;
  year: string;
  fuel: string;
  category: string;
  subCategory: string;
}

export interface ProductItem extends ProductListItem {
  description: string;
  partNumber: string;
  condition: string;
  compatibilityList: CompatibilityItem[];
  createdAt: string;
  updatedAt: string;
}
