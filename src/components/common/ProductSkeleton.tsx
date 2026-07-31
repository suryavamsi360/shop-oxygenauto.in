const ProductSkeleton = () => (
  <div className="overflow-hidden rounded-lg border border-[#D7DCD5] bg-white">
    <div className="aspect-square animate-pulse bg-[#E9ECE6]" />
    <div className="space-y-2 p-3">
      <div className="h-4 w-4/5 animate-pulse rounded bg-[#E1E5DF]" />
      <div className="h-3 w-2/5 animate-pulse rounded bg-[#E9ECE6]" />
      <div className="h-6 w-1/2 animate-pulse rounded bg-[#E1E5DF]" />
      <div className="h-8 w-full animate-pulse rounded-md bg-[#DCE3DC]" />
    </div>
  </div>
);

export default ProductSkeleton;
