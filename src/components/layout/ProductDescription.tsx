import type { ProductItem } from "../../types/product";

type ProductDescriptionView = Pick<ProductItem, "description">;

interface ProductDescriptionProps {
  product: ProductDescriptionView;
}

const ProductDescription = ({ product }: ProductDescriptionProps) => {
  return (
    <section className="my-14 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 pt-4 sm:px-6">
        <div className="inline-flex rounded-t-xl border border-b-0 border-slate-200 bg-slate-900 px-5 py-3 text-sm font-semibold tracking-wide text-white">
          Description
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6 sm:py-8">
        <h2 className="text-lg font-semibold text-slate-900">
          Product Description
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600 sm:text-base">
          {product.description}
        </p>
      </div>
    </section>
  );
};

export default ProductDescription;
