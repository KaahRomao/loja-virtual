import { useState } from "react";
import { Package } from "lucide-react";
import { productImages } from "../data/productImages";
import { cx } from "./ui/styles";

export default function ProductPhoto({ product, photo, className, eager = false }) {
  const image = photo ?? productImages(product)[0];
  const [failedUrl, setFailedUrl] = useState(null);

  if (image && failedUrl !== image.url) {
    return (
      <img
        src={image.url}
        alt={image.alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className={cx("size-full bg-cream object-contain", className)}
        onError={() => setFailedUrl(image.url)}
      />
    );
  }

  return (
    <div role="img" aria-label={product.name + " — foto indisponível"} className="grid size-full place-items-center bg-cream text-primary">
      <Package size={32} aria-hidden="true" />
    </div>
  );
}
