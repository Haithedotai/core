import { useEffect } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Skeleton } from "@/src/lib/components/ui/skeleton";
import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "@tanstack/react-router";

// Components
import ProgressIndicator from "./components/ProgressIndicator";
import WelcomeStep from "./components/WelcomeStep";
import OrganizationStep from "./components/OrganizationStep";

// Hooks
import { useOnboardingFlow } from "./useOnboardingFlow";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { ready, authenticated } = usePrivy();
  
  const {
    currentStep,
    isCreating,
    canContinue,
    hasOrganizations,
    isUserOrganizationsLoading,
    isHaitheLoggedIn,
    onboardingData,
    nextStep,
    prevStep,
    skipOnboarding,
    setOnboardingOrgName
  } = useOnboardingFlow();

  // Check authentication and organization status
  useEffect(() => {
    // If user is not authenticated, redirect to home
    if (ready && !authenticated) {
      navigate({ to: "/" });
      return;
    }

    // If user is authenticated but not logged into Haithe, redirect to home (Connect component will handle Haithe login)
    if (ready && authenticated && !isHaitheLoggedIn) {
      navigate({ to: "/" });
      return;
    }

    // If user is authenticated and has organizations, redirect to dashboard
    if (ready && authenticated && isHaitheLoggedIn && !isUserOrganizationsLoading && hasOrganizations) {
      navigate({ to: "/dashboard" });
      return;
    }
  }, [ready, authenticated, isHaitheLoggedIn, hasOrganizations, isUserOrganizationsLoading, navigate]);

  // Loading state while checking authentication and organizations
  if (!ready || !isHaitheLoggedIn || isUserOrganizationsLoading) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8">
          <div className="flex items-center justify-center">
            <Skeleton className="w-64 h-8 bg-muted" />
          </div>
          <div className="space-y-4">
            <Skeleton className="w-full h-64 bg-muted rounded-lg" />
            <Skeleton className="w-full h-12 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (will be redirected)
  if (!authenticated) {
    return null;
  }

  // If not logged into Haithe, don't render anything (will be redirected)
  if (!isHaitheLoggedIn) {
    return null;
  }

  // If user already has organizations, don't render anything (will be redirected)
  if (hasOrganizations) {
    return null;
  }

  return (
    <div className="min-h-full bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={currentStep} totalSteps={2} />

        {/* Current Step Component */}
        {currentStep === 'welcome' && (
          <WelcomeStep onNext={nextStep} />
        )}

        {currentStep === 'organization' && (
          <OrganizationStep
            onNext={nextStep}
            onPrev={prevStep}
            orgName={onboardingData.orgName}
            onOrgNameChange={setOnboardingOrgName}
            canContinue={canContinue}
            isCreating={isCreating}
          />
        )}
      </div>
    </div>
  );
} 