interface FilterState {
  maker: string;
  model: string;
  configuration: string;
  year: string;
  fuel: string;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  isLoading: boolean;
}

interface InputFilterProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const InputFilter = ({ label, value, onChange }: InputFilterProps) => {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
      {label}
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`Enter ${label.toLowerCase()}`}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-700 outline-none transition focus:border-slate-500"
      />
    </label>
  );
};

const ProductFilters = ({
  filters,
  onFilterChange,
  onSearch,
  onReset,
  isLoading,
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
          <button
            type="button"
            onClick={onSearch}
            disabled={isLoading}
            className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <InputFilter
          label="Maker"
          value={filters.maker}
          onChange={(value) => onFilterChange("maker", value)}
        />

        <InputFilter
          label="Model"
          value={filters.model}
          onChange={(value) => onFilterChange("model", value)}
        />

        <InputFilter
          label="Configuration"
          value={filters.configuration}
          onChange={(value) => onFilterChange("configuration", value)}
        />

        <InputFilter
          label="Year"
          value={filters.year}
          onChange={(value) => onFilterChange("year", value)}
        />

        <InputFilter
          label="Fuel"
          value={filters.fuel}
          onChange={(value) => onFilterChange("fuel", value)}
        />
      </div>
    </div>
  );
};

export default ProductFilters;
