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
import { useAppStore } from "@/src/lib/stores/useAppStore";

type OnboardingStep = 'welcome' | 'organization' | 'profile';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = usePrivy();
  const { completeOnboarding, setCurrentUser, setCurrentOrganization, users } = useAppStore();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    try {
      // Complete onboarding with user and organization data
      const onboardedUser = await completeOnboarding(
        user.wallet.address,
        {
          name: profileForm.name,
          bio: profileForm.bio || null,
          email: user.email?.address || null,
          profile: {
            company: profileForm.company || undefined,
            location: profileForm.location || undefined,
            website: profileForm.website || undefined,
          }
        },
        {
          name: orgForm.name,
          description: orgForm.description || null,
          website: orgForm.website || null,
        }
      );

      // Set the current user
      setCurrentUser(onboardedUser);

      // Navigate to marketplace
      navigate({ to: '/marketplace' });
    } catch (error) {
      console.error('Onboarding failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderWelcomeStep = () => (
    <div className="space-y-10">
      <div className="text-center space-y-6">
        <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
          <Icon name="Zap" className="w-12 h-12 text-primary" />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-foreground leading-tight">Welcome to Haithe!</h2>
          <p className="text-muted-foreground text-xl leading-relaxed">
            Let's get you set up with your organization and profile
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 @md/main:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
            <Icon name="Store" className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-semibold text-base mb-2 leading-relaxed">Create & Sell</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Build AI tools and knowledge bases for others to use
          </p>
        </Card>

        <Card className="p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
            <Icon name="ShoppingCart" className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-semibold text-base mb-2 leading-relaxed">Buy & Build</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Purchase AI components and create custom workflows
          </p>
        </Card>

        <Card className="p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
            <Icon name="Shield" className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-semibold text-base mb-2 leading-relaxed">Validate & Verify</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Help ensure quality and security of AI components
          </p>
        </Card>
      </div>

      <div className="text-center space-y-6">
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          You can use Haithe for any or all of these purposes. Let's start with setting up your organization.
        </p>
        <Button
          onClick={() => setCurrentStep('organization')}
          className="w-full max-w-sm h-12 text-base"
        >
          Get Started
          <Icon name="ArrowRight" className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderOrganizationStep = () => (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-foreground leading-tight">Create Your Organization</h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Set up your organization to start using the platform
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="orgName" className="text-base">Organization Name *</Label>
          <Input
            id="orgName"
            value={orgForm.name}
            onChange={(e) => setOrgForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Acme Corporation"
            className="h-12 text-base"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor="orgDescription" className="text-base">Description</Label>
          <Textarea
            id="orgDescription"
            value={orgForm.description}
            onChange={(e) => setOrgForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of your organization..."
            className="text-base resize-none"
            rows={4}
          />
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor="orgWebsite" className="text-base">Website</Label>
          <Input
            id="orgWebsite"
            type="url"
            value={orgForm.website}
            onChange={(e) => setOrgForm(prev => ({ ...prev, website: e.target.value }))}
            placeholder="https://example.com"
            className="h-12 text-base"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('welcome')}
          className="flex-1 h-12 text-base"
        >
          <Icon name="ArrowLeft" className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={() => setCurrentStep('profile')}
          disabled={!canContinueOrganization}
          className="flex-1 h-12 text-base"
        >
          Continue
          <Icon name="ArrowRight" className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderProfileStep = () => (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-foreground leading-tight">Complete Your Profile</h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Tell others about yourself and your work
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="userName" className="text-base">Your Name *</Label>
          <Input
            id="userName"
            value={profileForm.name}
            onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., John Doe"
            className="h-12 text-base"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor="userBio" className="text-base">Bio</Label>
          <Textarea
            id="userBio"
            value={profileForm.bio}
            onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell us about yourself and your expertise..."
            className="text-base resize-none"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 @md/main:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="userCompany" className="text-base">Company</Label>
            <Input
              id="userCompany"
              value={profileForm.company}
              onChange={(e) => setProfileForm(prev => ({ ...prev, company: e.target.value }))}
              placeholder="Your company name"
              className="h-12 text-base"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="userLocation" className="text-base">Location</Label>
            <Input
              id="userLocation"
              value={profileForm.location}
              onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., San Francisco, CA"
              className="h-12 text-base"
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor="userWebsite" className="text-base">Personal Website</Label>
          <Input
            id="userWebsite"
            type="url"
            value={profileForm.website}
            onChange={(e) => setProfileForm(prev => ({ ...prev, website: e.target.value }))}
            placeholder="https://yoursite.com"
            className="h-12 text-base"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('organization')}
          className="flex-1 h-12 text-base"
        >
          <Icon name="ArrowLeft" className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleCompleteOnboarding}
          disabled={!canContinueProfile || loading}
          className="flex-1 h-12 text-base"
        >
          {loading ? (
            <>
              <Icon name="Loader" className="w-4 h-4 mr-2 animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              Complete Setup
              <Icon name="Check" className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-10">
            <div className="flex items-center justify-center gap-6 mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${getStepNumber(currentStep) >= step
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    {getStepNumber(currentStep) > step ? (
                      <Icon name="Check" className="size-4" />
                    ) : (
                      step
                    )}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-16 h-0.5 mx-3 transition-colors ${getStepNumber(currentStep) > step ? 'bg-primary' : 'bg-muted'
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <CardTitle className="text-3xl">
                {currentStep === 'welcome' && 'Welcome to Haithe'}
                {currentStep === 'organization' && 'Organization Setup'}
                {currentStep === 'profile' && 'Profile Setup'}
              </CardTitle>
              <CardDescription className="text-base">
                {currentStep === 'welcome' && 'Your gateway to AI collaboration'}
                {currentStep === 'organization' && 'Step 2 of 3'}
                {currentStep === 'profile' && 'Step 3 of 3'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-0 pb-10">
            {currentStep === 'welcome' && renderWelcomeStep()}
            {currentStep === 'organization' && renderOrganizationStep()}
            {currentStep === 'profile' && renderProfileStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 