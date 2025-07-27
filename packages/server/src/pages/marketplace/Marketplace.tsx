import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Grid, List } from 'lucide-react';
import { Button } from '../../lib/components/ui/button';
import type { MarketplaceFilters as MarketplaceFiltersType, MarketplaceItem } from './types';
import { mockMarketplaceData } from './mockData';
import MinimalFilters from './components/MinimalFilters';
import MarketplaceItemCard from './components/MarketplaceItemCard';
import MarketplaceSidebar from './components/MarketplaceSidebar';

export default function MarketplacePage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<MarketplaceFiltersType>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Filter and search logic
  const filteredItems = useMemo(() => {
    let items = [...mockMarketplaceData];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query)) ||
        item.creator.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (filters.type && filters.type.length > 0) {
      items = items.filter(item => filters.type!.includes(item.type));
    }

    // Category filter
    if (filters.category && filters.category.length > 0) {
      items = items.filter(item => filters.category!.includes(item.category));
    }

    // Price range filter
    if (filters.priceRange) {
      items = items.filter(item =>
        item.price.amount >= filters.priceRange!.min &&
        item.price.amount <= filters.priceRange!.max
      );
    }

    // Rating filter
    if (filters.rating) {
      items = items.filter(item => item.rating.average >= filters.rating!);
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      items = items.filter(item =>
        filters.tags!.some(tag => item.tags.includes(tag))
      );
    }

    // Verified filter
    if (filters.verified) {
      items = items.filter(item => item.verified);
    }

    // Featured filter
    if (filters.featured) {
      items = items.filter(item => item.featured);
    }

    // Sorting
    const sortBy = filters.sortBy || 'recent';
    items.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.stats.downloads - a.stats.downloads;
        case 'price_low':
          return a.price.amount - b.price.amount;
        case 'price_high':
          return b.price.amount - a.price.amount;
        case 'rating':
          return b.rating.average - a.rating.average;
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return items;
  }, [filters, searchQuery]);

  const handleItemClick = (item: MarketplaceItem) => {
    navigate({ to: '/marketplace/item/$id', params: { id: item.id } });
  };

  const handleFavorite = (itemId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      return newFavorites;
    });
  };

  const handlePurchase = (item: MarketplaceItem) => {
    // Mock purchase handler - replace with actual payment flow
    console.log('Purchasing item:', item);
    alert(`Would purchase ${item.name} for ${item.price.amount} ${item.price.currency}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
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
      <div className="flex-1 mt-52 overflow-y-auto pt-6 pb-12">
        <div className="mx-auto px-8 w-full @container">

          {/* Items Grid/List - responsive columns */}
          {filteredItems.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 w-full @xl:grid-cols-2 @4xl:grid-cols-4 gap-4 @md:gap-6'
                  : 'space-y-4'
              }
            >
              {filteredItems.map((item) => (
                <MarketplaceItemCard
                  key={item.id}
                  item={item}
                  onItemClick={handleItemClick}
                  onFavorite={handleFavorite}
                  isFavorited={favorites.has(item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-4xl @md:text-6xl mb-4">🤖</div>
              <h3 className="text-lg @md:text-xl font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground mb-6 text-sm @md:text-base">
                Try adjusting your filters or search query to find more items.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({});
                  setSearchQuery('');
                }}
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