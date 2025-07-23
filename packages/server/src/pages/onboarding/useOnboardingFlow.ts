import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { usePrivy } from "@privy-io/react-auth";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import { useStore } from "@/src/lib/hooks/use-store";

export function useOnboardingFlow() {
  const navigate = useNavigate();
  const { user } = usePrivy();
  const api = useHaitheApi();
  const {
    onboardingData,
    setOnboardingOrgName,
    completeOnboarding,
    clearOnboardingData
  } = useStore();

  const [currentStep, setCurrentStep] = useState<'welcome' | 'organization'>('welcome');
  const [isCreating, setIsCreating] = useState(false);

  // Check if user has any organizations (new user check)
  const { data: userOrganizations, isLoading: isUserOrganizationsLoading } = api.getUserOrganizations();
  const hasOrganizations = userOrganizations && userOrganizations.length > 0;

  // Check Haithe authentication state
  const isHaitheLoggedIn = api.isLoggedIn();

  const canContinue = onboardingData.orgName.trim().length > 0;

  const handleCompleteOnboarding = async () => {
    if (!user?.wallet?.address || !onboardingData.orgName.trim()) return;

    setIsCreating(true);
    try {
      // Create organization using the stored name
      await api.createOrganization.mutateAsync(onboardingData.orgName.trim());

      // Mark onboarding as completed in store
      completeOnboarding();

      // Redirect to dashboard
      navigate({ to: "/dashboard" });

    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 'welcome') {
      setCurrentStep('organization');
    } else if (currentStep === 'organization') {
      handleCompleteOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep === 'organization') {
      setCurrentStep('welcome');
    }
  };

  const skipOnboarding = () => {
    clearOnboardingData();
    navigate({ to: "/dashboard" });
  };

  const getStepNumber = (step: 'welcome' | 'organization') => {
    return step === 'welcome' ? 1 : 2;
  };

  return {
    // State
    currentStep,
    isCreating,
    canContinue,
    hasOrganizations,
    isUserOrganizationsLoading,
    isHaitheLoggedIn,
    onboardingData,
    
    // Actions
    nextStep,
    prevStep,
    skipOnboarding,
    setOnboardingOrgName,
    
    // Helpers
    getStepNumber
  };
} 