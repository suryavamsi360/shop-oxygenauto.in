import type { ProductItem } from "../../types/product";

type ProductTestingView = Pick<
  ProductItem,
  | "itemId"
  | "inventoryCreatedTime"
  | "inventoryLastModifiedTime"
  | "compatibilityList"
>;

interface ProductTestingInfoProps {
  product: ProductTestingView;
}

const ProductTestingInfo = ({ product }: ProductTestingInfoProps) => {
  const rows = [
    { label: "Item ID", value: product.itemId },

    {
      label: "Compatibility Rows",
      value: String(product.compatibilityList?.length ?? 0),
    },
  ];

  return (
    <section className="my-14 rounded-2xl border border-amber-200 bg-amber-50 shadow-sm">
      <div className="border-b border-amber-200 px-4 pt-4 sm:px-6">
        <div className="inline-flex rounded-t-xl border border-b-0 border-amber-200 bg-amber-600 px-5 py-3 text-sm font-semibold tracking-wide text-white">
          Testing Data
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Part Identifiers
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Internal identifiers exposed temporarily for testing and QA.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {rows.map((row) => (
            <div
              key={row.label}
              className="rounded-xl border border-amber-200 bg-white px-4 py-4 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                {row.label}
              </p>
              <p className="mt-2 break-all rounded-lg bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100">
                {row.value || "N/A"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductTestingInfo;
