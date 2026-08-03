import { useMemo, useState } from "react";
import type { CompatibilityItem } from "../../types/product";

interface Product {
  compatibilityList?: CompatibilityItem[];
}

interface ProductCompatibilityListProps {
  product: Product;
}

const ProductCompatibilityList = ({
  product,
}: ProductCompatibilityListProps) => {
  const [showAll, setShowAll] = useState(false);
  const rowsPerPage = 20;

  const compareText = (left: string, right: string) => {
    return left.localeCompare(right, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  };

  const sortedCompatibilityList = useMemo(() => {
    const rows = [...(product.compatibilityList ?? [])];

    return [...rows].sort((left, right) => {
      const makerCompare = compareText(left.maker || "", right.maker || "");
      if (makerCompare !== 0) {
        return makerCompare;
      }

      const lineCompare = compareText(left.line || "", right.line || "");
      if (lineCompare !== 0) {
        return lineCompare;
      }

      const modelCompare = compareText(left.model || "", right.model || "");
      if (modelCompare !== 0) {
        return modelCompare;
      }

      const configurationCompare = compareText(
        left.configuration || "",
        right.configuration || "",
      );
      if (configurationCompare !== 0) {
        return configurationCompare;
      }

      const yearCompare = compareText(left.year || "", right.year || "");
      if (yearCompare !== 0) {
        return yearCompare;
      }

      return compareText(left.fuel || "", right.fuel || "");
    });
  }, [product.compatibilityList]);

  const visibleCompatibilityList = useMemo(() => {
    if (showAll) {
      return sortedCompatibilityList;
    }

    return sortedCompatibilityList.slice(0, rowsPerPage);
  }, [sortedCompatibilityList, showAll]);

  const handleToggleViewAll = () => {
    setShowAll(true);
  };

  return (
    <section className="my-14 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 pt-4 sm:px-6">
        <div className="inline-flex rounded-t-xl border border-b-0 border-slate-200 bg-slate-900 px-5 py-3 text-sm font-semibold tracking-wide text-white">
          Compatibility List
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Compatible Vehicles
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              All known maker and model combinations supported for this item.
            </p>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            {sortedCompatibilityList.length} matches
          </div>
        </div>

        {sortedCompatibilityList.length > 0 ? (
          <div className="mt-6">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Maker</th>
                      <th className="px-4 py-3">Line</th>
                      <th className="px-4 py-3">Model</th>
                      <th className="px-4 py-3">Configuration</th>
                      <th className="px-4 py-3">Year</th>
                      <th className="px-4 py-3">Fuel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {visibleCompatibilityList.map((compatibility, index) => (
                      <tr
                        key={`${compatibility.maker}-${compatibility.model}-${compatibility.configuration}-${compatibility.year}-${index}`}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {compatibility.maker || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {compatibility.line || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {compatibility.model || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {compatibility.configuration || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {compatibility.year || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {compatibility.fuel || "-"}
                        </td>
                      </tr>
                    ))}
                    {!showAll &&
                      sortedCompatibilityList.length > rowsPerPage && (
                        <tr className="bg-slate-50/60">
                          <td
                            colSpan={6}
                            className="px-4 py-4 text-center text-sm text-slate-600"
                          >
                            <button
                              type="button"
                              onClick={handleToggleViewAll}
                              className="font-semibold text-slate-900 underline decoration-slate-400 underline-offset-4 transition hover:text-slate-700"
                            >
                              Show All
                            </button>
                          </td>
                        </tr>
                      )}
                    {sortedCompatibilityList.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-sm text-slate-500"
                        >
                          No compatibility entries available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Compatibility details are not available for this product yet.
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductCompatibilityList;
