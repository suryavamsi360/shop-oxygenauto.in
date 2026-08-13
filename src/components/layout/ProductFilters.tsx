import { useState } from "react";
import { ChevronDown, RotateCcw, SlidersHorizontal } from "lucide-react";

interface FilterState {
  maker: string;
  lineConfiguration: string;
  year: string;
  partCategory: string;
}

interface ProductFiltersProps {
  filters: FilterState;
  options: {
    makers: string[];
    lineConfigurations: string[];
    years: string[];
    partCategories: string[];
  };
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
}

interface SelectFilterProps {
  label: string;
  value: string;
  values: string[];
  onChange: (value: string) => void;
}

const SelectFilter = ({
  label,
  value,
  values,
  onChange,
}: SelectFilterProps) => {
  return (
    <label className="flex flex-col gap-1.5 text-[11px] font-bold uppercase text-[#68706A]">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 min-w-0 rounded-md border border-[#C9D0C8] bg-white px-3 text-sm font-medium normal-case text-[#202522] outline-none transition hover:border-[#9DA79E] focus:border-[#0D542B]"
      >
        <option value="">All</option>
        {values.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
};

const ProductFilters = ({
  filters,
  options,
  onFilterChange,
  onReset,
}: ProductFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasActiveFilters = Object.values(filters).some(
    (value) => value.trim().length > 0,
  );

  return (
    <section className="mb-8 border-y border-[#D7DCD5] bg-[#E9ECE6]/80 py-1">
      <div className="mb-1 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          aria-expanded={isExpanded}
          aria-controls="fitment-filter-fields"
          className="flex min-h-9 flex-1 items-center gap-2 text-left text-[#202522]"
        >
          <SlidersHorizontal size={17} />
          <h2 className="font-display text-lg font-semibold uppercase">
            Fitment filters
          </h2>
          <ChevronDown
            size={18}
            className={`ml-1 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-9 items-center gap-2 rounded-md px-2.5 text-xs font-semibold text-[#59615B] transition hover:bg-white hover:text-[#0D542B]"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        )}
      </div>

      <div
        id="fitment-filter-fields"
        hidden={!isExpanded}
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <SelectFilter
          label="Maker"
          value={filters.maker}
          values={options.makers}
          onChange={(value) => onFilterChange("maker", value)}
        />

        <SelectFilter
          label="Model"
          value={filters.lineConfiguration}
          values={options.lineConfigurations}
          onChange={(value) => onFilterChange("lineConfiguration", value)}
        />

        <SelectFilter
          label="Year"
          value={filters.year}
          values={options.years}
          onChange={(value) => onFilterChange("year", value)}
        />

        <SelectFilter
          label="Part Category"
          value={filters.partCategory}
          values={options.partCategories}
          onChange={(value) => onFilterChange("partCategory", value)}
        />
      </div>
    </section>
  );
};

export default ProductFilters;
