import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../../../lib/components/ui/button';
import { useHaitheApi } from '@/src/lib/hooks/use-haithe-api';
import type { CreatorDetails } from 'services';
import Icon from '@/src/lib/components/custom/Icon';
import CreatorCard from './CreatorCard.tsx';

export default function CreatorShowcasePage() {
  const navigate = useNavigate();
  const { data: creators, isLoading: isLoadingCreators } = useHaitheApi().getAllCreators();

  const handleCreatorClick = (creator: CreatorDetails) => {
    navigate({ to: '/marketplace/profile/$id', params: { id: creator.wallet_address } });
  };

  return (
    <div className="h-full flex flex-col @container">
      {/* Header section */}
      <div className="flex-1 overflow-y-auto pt-8 pb-12">
        <div className="mx-auto px-8 w-full @container">

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Discover Creators</h1>
            <p className="text-muted-foreground">
              Explore talented creators and their AI marketplace offerings
            </p>
          </div>

          {/* Creators Grid/List */}
          {isLoadingCreators ? (
            <div className="text-center py-16">
              <Icon name="LoaderCircle" className="size-16 mb-4 w-full animate-spin" />
              <h3 className="text-lg @md:text-xl font-semibold mb-2">Loading creators...</h3>
              <p className="text-muted-foreground mb-6 text-sm @md:text-base">
                Please wait while we fetch the latest creators.
              </p>
            </div>
          ) : creators && creators.length > 0 ? (
            <div className="grid grid-cols-1 @2xl:grid-cols-2 @4xl:grid-cols-3 gap-8">
              {creators.map((creator) => (
                <CreatorCard
                  key={creator.wallet_address}
                  creator={creator}
                  onCreatorClick={handleCreatorClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Icon name="Users" className="size-16 mb-4 w-full" />
              <h3 className="text-lg @md:text-xl font-semibold mb-1">
                No creators found
              </h3>
              <p className="text-muted-foreground mb-6 text-sm @md:text-base">
                There are currently no creators in the marketplace.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate({ to: "/marketplace/become-a-creator" })}
              >
                Become a Creator
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
