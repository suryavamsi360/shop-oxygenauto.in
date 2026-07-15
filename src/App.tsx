import { useEffect } from "react";

import { useProductStore } from "./store/productStore";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const loadProducts = useProductStore((state) => state.loadProducts);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  return <AppRoutes />;
}

export default App;
