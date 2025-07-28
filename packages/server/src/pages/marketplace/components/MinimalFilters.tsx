import { useState } from 'react';
import { SlidersHorizontal, X, Search, Grid, List } from 'lucide-react';
import { Button } from '../../../lib/components/ui/button';
import { Badge } from '../../../lib/components/ui/badge';
import { Input } from '../../../lib/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../lib/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../../../lib/components/ui/popover';

interface MarketplaceFilters {
  category?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  sortBy?: 'recent' | 'price_low' | 'price_high';
}

interface MinimalFiltersProps {
  filters: MarketplaceFilters;
  onFiltersChange: (filters: MarketplaceFilters) => void;
  itemCount: number;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  setViewMode: (viewMode: 'grid' | 'list') => void;
  viewMode: 'grid' | 'list';
}

const sortOptions = [
  { value: 'recent', label: 'Recently Added', shortLabel: 'Recent' },
  { value: 'price_low', label: 'Price: Low to High', shortLabel: 'Price ↑' },
  { value: 'price_high', label: 'Price: High to Low', shortLabel: 'Price ↓' },
];

export default function MinimalFilters({
  filters,
  onFiltersChange,
  itemCount,
  onSearch,
  searchQuery,
  setViewMode,
  viewMode
}: MinimalFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const updateFilters = (updates: Partial<MarketplaceFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };



  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;
  const activeFilterCount = (filters.category?.length || 0) +
    (filters.priceRange ? 1 : 0);

  const currentSort = sortOptions.find(option => option.value === (filters.sortBy || 'recent'));

  return (
    <div className="border-b px-8 bg-background/95 backdrop-blur-sm @container">
      <div className="flex items-center justify-between my-4">
        <div>
          <h1 className="text-xl @xl:text-2xl font-bold">Browse Assets</h1>
          <p className="text-sm text-muted-foreground">
            Discover and purchase AI-powered assets
          </p>
        </div>


        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="size-4" />
            <span className="hidden @md:ml-2 @md:inline">Grid</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="size-4" />
            <span className="hidden @md:ml-2 @md:inline">List</span>
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
        <Input
          type="text"
          placeholder="Search AI assets..."
          value={searchQuery || ''}
          onChange={(e) => onSearch?.(e.target.value)}
          className="pl-10 h-10 w-full"
        />
      </div>

      {/* Filter controls */}
      <div className=" py-4 space-y-4 @lg:space-y-0">
        {/* Top row - Results count and sort */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{itemCount}</span> items
          </div>

          <div className="flex items-center gap-2">
            {/* Quick type filters - responsive layout */}
            <div className="flex flex-wrap gap-2 @lg:gap-3">
              {/* Clear all filters - only show if there are active filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground flex-shrink-0"
                >
                  <X className="size-3 mr-1" />
                  Clear all
                </Button>
              )}
            </div>

            {/* Sort dropdown - responsive labels */}
            <Select
              value={filters.sortBy || 'recent'}
              onValueChange={(value) => updateFilters({ sortBy: value as any })}
            >
              <SelectTrigger className="w-auto h-8 text-xs @md:text-sm">
                <SelectValue>
                  <span className="@md:hidden">{currentSort?.shortLabel}</span>
                  <span className="hidden @md:inline">{currentSort?.label}</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
} 