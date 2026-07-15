interface Product {
  description: string;
}

interface ProductDescriptionProps {
  product: Product;
}

const ProductDescription = ({ product }: ProductDescriptionProps) => {
  return (
    <div className="my-18 text-sm text-slate-600">
      <p className="max-w-xl">{product.description}</p>
    </div>
  );
};

export default ProductDescription;
