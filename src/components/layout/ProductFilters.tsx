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
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-700 outline-none transition focus:border-slate-500"
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
  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-700">Filters</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
    </div>
  );
};

export default ProductFilters;
