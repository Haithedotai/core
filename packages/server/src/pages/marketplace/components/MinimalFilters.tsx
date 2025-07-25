import { useState } from 'react';
import { Filter, SlidersHorizontal, X, Search, Grid, List } from 'lucide-react';
import { Button } from '../../../lib/components/ui/button';
import { Badge } from '../../../lib/components/ui/badge';
import { Input } from '../../../lib/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../lib/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../../../lib/components/ui/popover';
import { Checkbox } from '../../../lib/components/ui/checkbox';
import type { MarketplaceFilters, MarketplaceItemType } from '../types';

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
  { value: 'popular', label: 'Most Popular', shortLabel: 'Popular' },
  { value: 'price_low', label: 'Price: Low to High', shortLabel: 'Price ↑' },
  { value: 'price_high', label: 'Price: High to Low', shortLabel: 'Price ↓' },
  { value: 'rating', label: 'Highest Rated', shortLabel: 'Rating' },
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

  const toggleItemType = (type: MarketplaceItemType) => {
    const currentTypes = filters.type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    updateFilters({ type: newTypes.length > 0 ? newTypes : undefined });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;
  const activeFilterCount = (filters.type?.length || 0) +
    (filters.category?.length || 0) +
    (filters.tags?.length || 0) +
    (filters.verified ? 1 : 0) +
    (filters.featured ? 1 : 0) +
    (filters.priceRange ? 1 : 0) +
    (filters.rating ? 1 : 0);

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

            {/* More filters popover */}
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 relative">
                  <SlidersHorizontal className="size-4 @md:mr-2" />
                  <span className="hidden @md:inline">Filters</span>
                  {activeFilterCount > 0 && (
                    <Badge variant="destructive" className="ml-1 @md:ml-2 h-4 min-w-4 text-xs p-0 flex items-center justify-center">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Additional Filters</h4>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                        <X className="size-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>

                  {/* Price range */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price Range</label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={filters.priceRange?.max === 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilters({ priceRange: { min: 0, max: 1 } })}
                        className="text-xs"
                      >
                        Under 1 ETH
                      </Button>
                      <Button
                        variant={filters.priceRange?.min === 1 && filters.priceRange?.max === 5 ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilters({ priceRange: { min: 1, max: 5 } })}
                        className="text-xs"
                      >
                        1-5 ETH
                      </Button>
                      <Button
                        variant={filters.priceRange?.min === 5 ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilters({ priceRange: { min: 5, max: 100 } })}
                        className="text-xs"
                      >
                        5+ ETH
                      </Button>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="verified-filter"
                        checked={filters.verified || false}
                        onCheckedChange={(checked) => updateFilters({ verified: checked ? true : undefined })}
                      />
                      <label htmlFor="verified-filter" className="text-sm cursor-pointer">
                        Verified items only
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="featured-filter"
                        checked={filters.featured || false}
                        onCheckedChange={(checked) => updateFilters({ featured: checked ? true : undefined })}
                      />
                      <label htmlFor="featured-filter" className="text-sm cursor-pointer">
                        Featured items only
                      </label>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
} 