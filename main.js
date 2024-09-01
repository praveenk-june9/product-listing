document.addEventListener("DOMContentLoaded", () => {
  const apiEndpoint = "https://fakestoreapi.com/products";
  const toggleFiltersButton = document.getElementById("toggle-filters");
  const filtersContainer = document.getElementById("filters");
  const productList = document.getElementById("product-list");
  const loadMoreButton = document.getElementById("load-more");
  const searchBar = document.getElementById("search-bar");
  const categoryFilter = document.getElementById("category-filter");
  const priceFilter = document.getElementById("price-filter");
  const ratingFilter = document.getElementById("rating-filter");
  const sortFilter = document.getElementById("sort-filter");
  const resultCount = document.getElementById("result-count");
  const productListSkeleton = document.getElementById("product-list-skeleton");
  const heroContentTitle = document.getElementById("hero-content");
  let products = [];
  let filteredProducts = [];
  let displayedProducts = 0;
  const loadCount = 10;

  toggleFiltersButton.addEventListener("click", () => {
    if (filtersContainer.classList.contains("filter-panel__controls--open")) {
      filtersContainer.classList.remove("filter-panel__controls--open");
      toggleFiltersButton.textContent = "Show Filters";
    } else {
      filtersContainer.classList.add("filter-panel__controls--open");
      toggleFiltersButton.textContent = "Hide Filters";
    }
  });

  const showLoading = () => {
    productList.innerHTML = "";
    const shimmerWrapper = document.createElement("div");
    shimmerWrapper.className = "shimmer-wrapper";
    for (let i = 0; i < loadCount; i++) {
      const shimmer = document.createElement("div");
      shimmer.className = "shimmer";
      shimmerWrapper.appendChild(shimmer);
    }
    productListSkeleton.appendChild(shimmerWrapper);
  };

  const hideLoading = () => {
    productListSkeleton.innerHTML = "";
  };

  const fetchProducts = async () => {
    try {
      showLoading();
      const response = await fetch(apiEndpoint);
      if (!response.ok) throw new Error('Network response was not ok');
      products = await response.json();
      filteredProducts = [...products];
      populateCategoryFilter();
      applyFiltersAndSort();
    } catch (error) {
      showError("Failed to load products. Please try again later.");
    } finally {
      hideLoading();
    }
  };

  const populateCategoryFilter = () => {
    const categories = [...new Set(products.map(product => product.category))];
    categoryFilter.innerHTML = '<option value="all">All Categories</option>'; // Reset the category filter

    categories.forEach(category => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
      categoryFilter.appendChild(option);
    });
  };

  const applyFiltersAndSort = () => {
    filteredProducts = products;

    const selectedCategory = categoryFilter.value;
    heroContentTitle.textContent = selectedCategory;
    if (selectedCategory !== "all") {
      filteredProducts = filteredProducts.filter(product => product.category === selectedCategory);
    }

    const selectedPriceRange = priceFilter.value;
    if (selectedPriceRange !== "all") {
      filteredProducts = filteredProducts.filter(product => {
        const price = product.price;
        if (selectedPriceRange === "0-50") return price < 50;
        if (selectedPriceRange === "50-100") return price >= 50 && price <= 100;
        if (selectedPriceRange === "100-200") return price >= 100 && price <= 200;
        if (selectedPriceRange === "200+") return price > 200;
      });
    }

    const selectedRating = ratingFilter.value;
    if (selectedRating !== "all") {
      filteredProducts = filteredProducts.filter(product => {
        const rating = product.rating.rate;
        if (selectedRating === "awesome") return rating >= 4;
        if (selectedRating === "good") return rating >= 3 && rating < 4;
        if (selectedRating === "bad") return rating >= 2 && rating < 3;
        if (selectedRating === "terrible") return rating < 2;
      });
    }

    const searchTerm = searchBar.value.toLowerCase();
    if (searchTerm) {
      filteredProducts = filteredProducts.filter(product =>
        product.title.toLowerCase().includes(searchTerm)
      );
    }

    const selectedSort = sortFilter.value;
    if (selectedSort === "low-to-high") {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (selectedSort === "high-to-low") {
      filteredProducts.sort((a, b) => b.price - a.price);
    }

    displayedProducts = 0;
    renderProducts();
  };

  const renderProducts = () => {
    const endIndex = displayedProducts + loadCount;
    const productsToDisplay = filteredProducts.slice(displayedProducts, endIndex);

    if (displayedProducts === 0) {
      productList.innerHTML = '';
    }

    productsToDisplay.forEach(product => {
      const productElement = document.createElement("div");
      productElement.className = "product__card";
      productElement.innerHTML = `
        <div class="product__image-container">
          <img class="product__image" src="${product.image}" alt="${product.title}" loading="lazy" height="200" width="200">
        </div>
        <div class="product__info">
          <h2 class="product__title">${product.title}</h2>
          <div class="product__details">
            <p class="product__price">$${product.price}</p>
            <p class="product__rating">${product.rating.rate} <span class="product__rating-icon">&#x2605;</span> </p>
          </div>
        </div>
      `;
      productList.appendChild(productElement);
    });

    displayedProducts += productsToDisplay.length;

    if (displayedProducts >= filteredProducts.length) {
      loadMoreButton.style.display = "none";
    } else {
      loadMoreButton.style.display = "block";
    }

    resultCount.textContent = `Showing ${displayedProducts} result(s)`;
  };

  const showError = (message) => {
    const errorElement = document.createElement("p");
    errorElement.textContent = message;
    errorElement.style.color = 'red';
    productList.appendChild(errorElement);
  };

  categoryFilter.addEventListener("change", applyFiltersAndSort);
  priceFilter.addEventListener("change", applyFiltersAndSort);
  sortFilter.addEventListener("change", applyFiltersAndSort);
  ratingFilter.addEventListener("change", applyFiltersAndSort);
  searchBar.addEventListener("input", applyFiltersAndSort);

  loadMoreButton.addEventListener("click", () => {
    renderProducts();
    loadMoreButton.focus();
  });

  fetchProducts();
});
