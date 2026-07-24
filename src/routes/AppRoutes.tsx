import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "../components/layout/Layout";

import Products from "../pages/Products";
import ProductDetails from "../pages/ProductDetails";
import Cart from "../pages/Cart";
import OrderSuccess from "../pages/OrderSuccess";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Products />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:itemId" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/orders" element={<OrderSuccess />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
