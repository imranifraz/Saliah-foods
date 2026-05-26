content = r"""import { Link, useParams } from "react-router-dom";
import { getCategoryById } from "../data/productMenu";
import { ProductCard } from "../components/ui/ProductCard";

export function ProductListingPage() {
  const { categoryId } = useParams();
  const category = getCategoryById(categoryId);

  if (!category) {
    return (
      <motion.div className="mx-auto max-w-[1440px] px-4 py-28 sm:px-5 md:px-10">
        <h1 className="font-display text-2xl font-medium text-emerald-900">Category not found</h1>
        <Link to="/" className="mt-4 inline-block font-body text-sm text-emerald-800 underline">
          Back to home
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div className="bg-cream-50 pb-20 pt-28 md:pt-32">
      <motion.div className="mx-auto max-w-[1440px] px-4 sm:px-5 md:px-10">
        <nav className="font-body text-xs text-emerald-900/50" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-emerald-800">Home</Link>
          <span className="mx-2">/</span>
          <span>Products</span>
          <span className="mx-2">/</span>
          <span className="text-emerald-900">{category.label}</span>
        </nav>
        <header className="mt-6 max-w-2xl">
          <h1 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium text-emerald-900">
            {category.label}
          </h1>
          <p className="mt-3 font-body text-base text-emerald-900/65">{category.description}</p>
        </header>
        <motion.div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {category.products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              showPackSize
              showTagline={Boolean(product.tagline)}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
"""
# Replace all motion.div with div in the template string above - use explicit div in source
content = content.replace("motion.div", "div")
open("src/pages/ProductListingPage.jsx", "w", encoding="utf-8").write(content)
print("written")
