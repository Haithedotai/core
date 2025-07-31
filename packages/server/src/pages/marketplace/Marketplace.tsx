import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../../lib/components/ui/button';
import MinimalFilters from './components/MinimalFilters';
import MarketplaceItemCard from './components/MarketplaceItemCard';
import { useHaitheApi } from '@/src/lib/hooks/use-haithe-api';
import { useMarketplaceStore } from '../../lib/hooks/use-store';
import type { Product } from '../../../../../services/shared/types';
import Icon from '@/src/lib/components/custom/Icon';

export default function MarketplacePage() {
  const navigate = useNavigate();
  const {
    filters,
    searchQuery,
    viewMode,
    favorites,
    setFilters,
    setSearchQuery,
    setViewMode,
    toggleFavorite,
    clearFilters
  } = useMarketplaceStore();
  const haithe = useHaitheApi();
  const { data: products, isLoading: isLoadingProducts } = haithe.getAllProducts();

  // Filter and search logic
  const filteredItems = useMemo(() => {
    let items = [...(products || [])];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.creator.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category && filters.category.length > 0) {
      items = items.filter(item => filters.category!.includes(item.category as any));
    }

    // Price range filter
    if (filters.priceRange) {
      items = items.filter(item =>
        item.price_per_call >= filters.priceRange!.min &&
        item.price_per_call <= filters.priceRange!.max
      );
    }

    // Sorting
    const sortBy = filters.sortBy || 'recent';
    items.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price_per_call - b.price_per_call;
        case 'price_high':
          return b.price_per_call - a.price_per_call;
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return items;
  }, [filters, searchQuery, products]);

  const handleItemClick = (item: Product) => {
    navigate({ to: '/marketplace/item/$id', params: { id: item.id.toString() } });
  };

  const handleFavorite = (itemId: number) => {
    toggleFavorite(itemId.toString());
  };

  const handlePurchase = (item: Product) => {
    // Mock purchase handler - replace with actual payment flow
    console.log('Purchasing item:', item);
    const priceInEth = item.price_per_call / 1e15; // Convert from wei to USDT
    alert(`Would purchase ${item.name} for ${priceInEth} USDT`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  return (
    <div className="h-full flex flex-col @container">
      {/* Minimal filters bar */}
      <div className="z-30 fixed top-[var(--navbar-height)] left-0 right-0 lg:left-[var(--sidebar-width)]">
        <MinimalFilters
          filters={filters}
          onFiltersChange={setFilters}
          itemCount={filteredItems.length}
          onSearch={handleSearch}
          searchQuery={searchQuery}
          setViewMode={setViewMode}
          viewMode={viewMode}
        />
      </div>

      {/* Main content area with responsive padding */}
      <div className="flex-1 mt-52 overflow-y-auto pt-8 pb-12">
        <div className="mx-auto px-8 w-full @container">

          {/* Items Grid/List - responsive columns */}
          {isLoadingProducts ? (
            <div className="text-center py-16">
              <Icon name="LoaderCircle" className="size-16 mb-4 w-full animate-spin" />
              <h3 className="text-lg @md:text-xl font-semibold mb-2">Loading products...</h3>
              <p className="text-muted-foreground mb-6 text-sm @md:text-base">
                Please wait while we fetch the latest marketplace items.
              </p>
            </div>
          ) : filteredItems.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 w-full @3xl:grid-cols-2 @5xl:grid-cols-3 gap-8'
                  : 'space-y-8'
              }
            >
              {filteredItems.map((item) => (
                <MarketplaceItemCard
                  key={item.id}
                  item={item}
                  onItemClick={handleItemClick}
                  onFavorite={handleFavorite}
                  isFavorited={favorites.includes(item.id.toString())}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Icon name="Bot" className="size-16 mb-4 w-full" />
              <h3 className="text-lg @md:text-xl font-semibold mb-1">
                {products && products.length === 0 ? 'No products available' : 'No items found'}
              </h3>
              <p className="text-muted-foreground mb-6 text-sm @md:text-base">
                {products && products.length === 0
                  ? 'There are currently no products in the marketplace.'
                  : 'Try adjusting your filters or search query to find more items.'
                }
              </p>
              <Button
                variant="outline"
                onClick={handleClearFilters}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}