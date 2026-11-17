import { photoStyle } from "../data/products";

export default function ProductPhoto({ product }) {
  return <div role="img" aria-label={product.name} className="size-full bg-surface bg-no-repeat" style={photoStyle(product)} />;
}
