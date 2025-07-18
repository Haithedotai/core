import { useState } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Input } from "@/src/lib/components/ui/input";
import { Textarea } from "@/src/lib/components/ui/textarea";
import { Card } from "@/src/lib/components/ui/card";
import { Label } from "@/src/lib/components/ui/label";
import Icon from "@/src/lib/components/custom/Icon";
import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "@tanstack/react-router";

type OnboardingStep = "organization" | "first-project";

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("organization");
  const [organizationData, setOrganizationData] = useState({
    name: "",
    description: "",
    website: "",
  });
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    model_type: "conversational" as const,
    privacy: "private" as const,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = usePrivy();
  const navigate = useNavigate();

  const handleOrganizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationData.name.trim()) return;
    
    setIsSubmitting(true);
    
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setCurrentStep("first-project");
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectData.name.trim()) return;
    
    setIsSubmitting(true);
    
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    
    // Navigate to dashboard
    window.location.href = "/dashboard";
  };

  const renderOrganizationStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Building" className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Create Your Organization</h1>
        <p className="text-muted-foreground text-lg">
          Start your AI journey by setting up your organization workspace
        </p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleOrganizationSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name *</Label>
            <Input
              id="org-name"
              placeholder="e.g., AI Research Lab"
              value={organizationData.name}
              onChange={(e) => setOrganizationData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <p className="text-sm text-muted-foreground">
              This will be the main workspace for your AI models and projects
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-description">Description</Label>
            <Textarea
              id="org-description"
              placeholder="What does your organization do? What kind of AI models will you create?"
              value={organizationData.description}
              onChange={(e) => setOrganizationData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-website">Website (Optional)</Label>
            <Input
              id="org-website"
              type="url"
              placeholder="https://yourcompany.com"
              value={organizationData.website}
              onChange={(e) => setOrganizationData(prev => ({ ...prev, website: e.target.value }))}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={!organizationData.name.trim() || isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Icon name="Loader" className="w-4 h-4 mr-2 animate-spin" />
                  Creating Organization...
                </>
              ) : (
                <>
                  Continue to Project Setup
                  <Icon name="ArrowRight" className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );

  const renderProjectStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Zap" className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Create Your First Project</h1>
        <p className="text-muted-foreground text-lg">
          Set up your first AI model project to get started
        </p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleProjectSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name *</Label>
            <Input
              id="project-name"
              placeholder="e.g., Customer Support AI"
              value={projectData.name}
              onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              placeholder="Describe what this AI model will do and how it will help users..."
              value={projectData.description}
              onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model-type">Model Type</Label>
              <select
                id="model-type"
                value={projectData.model_type}
                onChange={(e) => setProjectData(prev => ({ ...prev, model_type: e.target.value as any }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="conversational">Conversational AI</option>
                <option value="analysis">Analysis & Insights</option>
                <option value="generation">Content Generation</option>
                <option value="classification">Classification</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="privacy">Privacy</Label>
              <select
                id="privacy"
                value={projectData.privacy}
                onChange={(e) => setProjectData(prev => ({ ...prev, privacy: e.target.value as any }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="private">Private</option>
                <option value="organization">Organization</option>
                <option value="public">Public</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep("organization")}
            >
              <Icon name="ArrowLeft" className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <Button
              type="submit"
              disabled={!projectData.name.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Icon name="Loader" className="w-4 h-4 mr-2 animate-spin" />
                  Creating Project...
                </>
              ) : (
                <>
                  Complete Setup
                  <Icon name="Check" className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );

  return (
    <div className="min-h-full bg-background">
      {/* Header Section */}
      <div className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Getting Started</h1>
                <p className="text-muted-foreground text-lg">Set up your organization and first project</p>
              </div>
              
              {/* Progress Steps */}
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  currentStep === "organization" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  1
                </div>
                <div className="w-8 h-px bg-border"></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  currentStep === "first-project" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  2
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {currentStep === "organization" ? renderOrganizationStep() : renderProjectStep()}
      </div>
    </div>
  );
} 