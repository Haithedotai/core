import React from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import { Button } from "@/src/lib/components/ui/button";
import Icon from "@/src/lib/components/custom/Icon";
import { Link } from "@tanstack/react-router";
import Connect from "@/src/lib/components/app/Connect";
import Loader from "./Loader";

export interface ProtectionRequirements {
  walletConnected?: boolean;
  signedInToHaithe?: boolean;
  hasOrg?: boolean;
  hasProfile?: boolean;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirements: ProtectionRequirements;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requirements,
  redirectTo = "/"
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { ready, authenticated, user } = usePrivy();
  const api = useHaitheApi();

  // Get data needed for checks
  const { data: userOrganizations, isLoading: isUserOrganizationsLoading } = api.getUserOrganizations();
  const profileQuery = api.profile();
  const isHaitheLoggedIn = api.isLoggedIn();
  const isClientInitialized = api.isClientInitialized();

  useEffect(() => {
    // console.log('ProtectedRoute useEffect:', {
    //   ready,
    //   isClientInitialized,
    //   authenticated,
    //   isHaitheLoggedIn,
    //   requirements,
    //   userOrganizations: userOrganizations?.length,
    //   isUserOrganizationsLoading,
    //   profileData: !!profileQuery.data,
    //   profilePending: profileQuery.isPending
    // });

    if (!ready || !isClientInitialized) return; // Wait for both Privy and client to be ready

    // Check wallet connection requirement
    if (requirements.walletConnected && !authenticated) {
      console.log('Redirecting: wallet not connected');
      navigate({ to: redirectTo });
      return;
    }

    // Check Haithe authentication requirement
    if (requirements.signedInToHaithe && (!authenticated || !isHaitheLoggedIn)) {
      console.log('Redirecting: not signed in to Haithe', { authenticated, isHaitheLoggedIn });
      navigate({ to: redirectTo });
      return;
    }

    // Check organization membership requirement
    if (requirements.hasOrg && authenticated && isHaitheLoggedIn && !isUserOrganizationsLoading) {
      const hasOrganizations = userOrganizations && userOrganizations.length > 0;
      if (!hasOrganizations) {
        console.log('Redirecting: no organizations');
        navigate({ to: "/onboarding" });
        return;
      }
    }

    // Check profile requirement
    if (requirements.hasProfile && authenticated && isHaitheLoggedIn && !profileQuery.isPending) {
      if (!profileQuery.data) {
        console.log('Redirecting: no profile data');
        navigate({ to: "/onboarding" });
        return;
      }
    }

    console.log('ProtectedRoute: All checks passed, staying on current route');
  }, [
    ready,
    isClientInitialized,
    authenticated,
    isHaitheLoggedIn,
    userOrganizations,
    isUserOrganizationsLoading,
    profileQuery.data,
    profileQuery.isPending,
    navigate,
    redirectTo,
    requirements
  ]);

  // Show loading while checking requirements
  const isLoading =
    !ready ||
    !isClientInitialized ||
    (requirements.signedInToHaithe && isUserOrganizationsLoading) ||
    (requirements.hasProfile && profileQuery.isPending);

  if (isLoading) {
    return (<Loader />);
  }

  // Show wallet connection required
  if (requirements.walletConnected && !authenticated) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Icon name="Wallet" className="size-16 text-muted-foreground mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-medium">Wallet Connection Required</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Please connect your wallet to access this page.
            </p>
            <div className="flex mt-4 justify-center">
              <Connect />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show Haithe authentication required
  if (requirements.signedInToHaithe && (!authenticated || !isHaitheLoggedIn)) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Icon name="Users" className="size-16 text-muted-foreground mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-medium">Authentication Required</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Please connect your wallet and complete authentication to access this page.
            </p>
            <div className="flex mt-4 justify-center">
              <Connect />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show organization membership required
  if (requirements.hasOrg && authenticated && isHaitheLoggedIn) {
    const hasOrganizations = userOrganizations && userOrganizations.length > 0;
    if (!hasOrganizations) {
      return (
        <div className="min-h-full bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <Icon name="Building2" className="size-16 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <h3 className="text-xl font-medium">Organization Required</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                You need to be part of an organization to access this page. Complete your onboarding to create or join an organization.
              </p>
            </div>
            <Button asChild>
              <Link to="/onboarding">Complete Onboarding</Link>
            </Button>
          </div>
        </div>
      );
    }
  }

  // Show profile required
  if (requirements.hasProfile && authenticated && isHaitheLoggedIn && !profileQuery.data) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Icon name="User" className="size-16 text-muted-foreground mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-medium">Profile Setup Required</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Complete your profile setup to access this page.
            </p>
          </div>
          <Button asChild>
            <Link to="/onboarding">Complete Setup</Link>
          </Button>
        </div>
      </div>
    );
  }

  // All requirements met, render children
  return <>{children}</>;
}

// Higher-order component wrapper similar to withPageErrorBoundary
export function withProtectedRoute<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  requirements: ProtectionRequirements,
  redirectTo?: string
) {
  return function ProtectedComponent(props: T) {
    return (
      <ProtectedRoute requirements={requirements} redirectTo={redirectTo}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
} 