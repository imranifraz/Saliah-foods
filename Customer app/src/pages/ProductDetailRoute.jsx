import { useParams } from "react-router-dom";
import { ProductDetailPage } from "./ProductDetailPage";

/** Remount PDP when slug changes so gallery/state refresh correctly. */
export function ProductDetailRoute() {
  const { productSlug } = useParams();
  return <ProductDetailPage key={productSlug} />;
}
