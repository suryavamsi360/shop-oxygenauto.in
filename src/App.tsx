import { useEffect } from "react";

import AppRoutes from "./routes/AppRoutes";
import { useProductStore } from "./store/productStore";

function App() {
  const loadProducts = useProductStore((state) => state.loadProducts);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  return <AppRoutes />;
}

export default App;
