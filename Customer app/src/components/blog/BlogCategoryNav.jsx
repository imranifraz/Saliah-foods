export function BlogCategoryNav({ categories, active, onSelect }) {
  return (
    <nav className="blog-categories" aria-label="Filter articles by category">
      <ul className="blog-categories__list">
        {categories.map((cat) => {
          const isActive = active === cat;
          return (
            <li key={cat}>
              <button
                type="button"
                className={`blog-categories__pill ${isActive ? "blog-categories__pill--active" : ""}`}
                onClick={() => onSelect(cat)}
                aria-pressed={isActive}
              >
                {cat}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
