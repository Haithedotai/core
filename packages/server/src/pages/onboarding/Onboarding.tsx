import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/src/lib/components/ui/button";
import { Input } from "@/src/lib/components/ui/input";
import { Label } from "@/src/lib/components/ui/label";
import { Textarea } from "@/src/lib/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Separator } from "@/src/lib/components/ui/separator";
import Icon from "@/src/lib/components/custom/Icon";
import { usePrivy } from "@privy-io/react-auth";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";

type OnboardingStep = 'welcome' | 'organization' | 'profile';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = usePrivy();
  const api = useHaitheApi();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');

  // Organization form state
  const [orgForm, setOrgForm] = useState({
    name: '',
    description: '',
    website: '',
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: '',
    company: '',
    location: '',
    website: '',
  });

  const getStepNumber = (step: OnboardingStep) => {
    switch (step) {
      case 'welcome': return 1;
      case 'organization': return 2;
      case 'profile': return 3;
      default: return 1;
    }
  };

  const canContinueOrganization = orgForm.name.trim().length > 0;
  const canContinueProfile = profileForm.name.trim().length > 0;

  const handleCompleteOnboarding = async () => {
    if (!user?.wallet?.address) return;

    try {
      // Step 1: Ensure user is logged in to HaitheClient
      if (!api.isLoggedIn()) {
        api.login.mutate();
      }
      
      // Step 3: Create organization if provided
      if (orgForm.name.trim()) {
        api.createOrganization.mutate(orgForm.name.trim());
      }

      // Step 4: Redirect to dashboard
      navigate({ to: "/dashboard" });
      
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const nextStep = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('organization');
        break;
      case 'organization':
        setCurrentStep('profile');
        break;
      case 'profile':
        handleCompleteOnboarding();
        break;
    }
  };

  const prevStep = () => {
    switch (currentStep) {
      case 'organization':
        setCurrentStep('welcome');
        break;
      case 'profile':
        setCurrentStep('organization');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Progress Indicator */}
        <div className="flex justify-center space-x-4">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= getStepNumber(currentStep)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step}
            </div>
          ))}
        </div>

        {/* Welcome Step */}
        {currentStep === 'welcome' && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome to Haithe!</CardTitle>
              <CardDescription>
                Let's get you set up with your AI infrastructure platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="Zap" className="size-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Connected Wallet</h3>
                  <p className="text-sm text-muted-foreground">
                    {user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 'No wallet connected'}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">What you'll get:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Icon name="Check" className="size-4 text-green-600" />
                    Create and manage AI agents
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="Check" className="size-4 text-green-600" />
                    Design complex workflows
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="Check" className="size-4 text-green-600" />
                    Access verified AI marketplace
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="Check" className="size-4 text-green-600" />
                    Analytics and monitoring
                  </li>
                </ul>
              </div>

              <Button onClick={nextStep} className="w-full">
                Get Started
                <Icon name="ArrowRight" className="size-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Organization Step */}
        {currentStep === 'organization' && (
          <Card>
            <CardHeader>
              <CardTitle>Create Organization</CardTitle>
              <CardDescription>
                Set up your organization to collaborate with team members (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  placeholder="e.g., Acme AI Labs"
                  value={orgForm.name}
                  onChange={(e) => setOrgForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgDescription">Description (Optional)</Label>
                <Textarea
                  id="orgDescription"
                  placeholder="What does your organization do?"
                  value={orgForm.description}
                  onChange={(e) => setOrgForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgWebsite">Website (Optional)</Label>
                <Input
                  id="orgWebsite"
                  type="url"
                  placeholder="https://example.com"
                  value={orgForm.website}
                  onChange={(e) => setOrgForm(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={prevStep} className="flex-1">
                  <Icon name="ArrowLeft" className="size-4 mr-2" />
                  Back
                </Button>
                <Button onClick={nextStep} disabled={!canContinueOrganization} className="flex-1">
                  Continue
                  <Icon name="ArrowRight" className="size-4 ml-2" />
                </Button>
              </div>

              <div className="text-center">
                <Button variant="link" onClick={() => {
                  setOrgForm({ name: '', description: '', website: '' });
                  nextStep();
                }}>
                  Skip for now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Step */}
        {currentStep === 'profile' && (
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                Help others discover and connect with you (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profileName">Display Name</Label>
                <Input
                  id="profileName"
                  placeholder="Your name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profileBio">Bio (Optional)</Label>
                <Textarea
                  id="profileBio"
                  placeholder="Tell us about yourself..."
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profileCompany">Company (Optional)</Label>
                  <Input
                    id="profileCompany"
                    placeholder="Company name"
                    value={profileForm.company}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profileLocation">Location (Optional)</Label>
                  <Input
                    id="profileLocation"
                    placeholder="City, Country"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profileWebsite">Website (Optional)</Label>
                <Input
                  id="profileWebsite"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={profileForm.website}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={prevStep} className="flex-1">
                  <Icon name="ArrowLeft" className="size-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleCompleteOnboarding} disabled={!canContinueProfile} className="flex-1">
                  Complete Setup
                  <Icon name="Check" className="size-4 ml-2" />
                </Button>
              </div>

              <div className="text-center">
                <Button variant="link" onClick={handleCompleteOnboarding}>
                  Skip for now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 