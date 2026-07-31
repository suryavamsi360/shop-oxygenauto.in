import ProductSkeleton from "../common/ProductSkeleton";

interface LoadingProps {
  variant?: "default" | "catalog";
}

const Loading = ({ variant = "default" }: LoadingProps) => {
  if (variant === "catalog") {
    return (
      <div
        className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5"
        aria-label="Loading products"
      >
        {Array.from({ length: 8 }, (_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div
        className="size-10 animate-spin rounded-full border-3 border-[#D7DCD5] border-t-[#0D542B]"
        aria-label="Loading"
      />
    </div>
  );
};

export default Loading;
