import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Switch } from "@/src/lib/components/ui/switch";
import { Badge } from "@/src/lib/components/ui/badge";
import Icon from "@/src/lib/components/custom/Icon";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import { useStore } from "@/src/lib/hooks/use-store";
import { toast } from "sonner";

interface LLMModel {
  id: number;
  name: string;
  display_name: string;
  provider: string;
  is_active: boolean;
  price_per_call: number;
  recommended?: boolean;
}

export default function SettingsPage() {
  const haithe = useHaitheApi();
  const { selectedOrganizationId } = useStore();
  const { data: availableModels, isLoading: isLoadingAvailable } = haithe.getAvailableModels();
  const { data: enabledModels, isLoading: isLoadingEnabled, refetch: refetchEnabled } = haithe.getEnabledModels(selectedOrganizationId);

  // Helper function to check if a model is enabled
  const isModelEnabled = (modelId: number) => {
    return enabledModels?.some((model: any) => model.id === modelId) || false;
  };

  const toggleModel = async (modelId: number) => {
    if (!selectedOrganizationId) {
      toast.error('No organization selected');
      return;
    }

    try {
      if (isModelEnabled(modelId)) {
        await haithe.disableModel.mutateAsync({ orgId: selectedOrganizationId, modelId });
      } else {
        await haithe.enableModel.mutateAsync({ orgId: selectedOrganizationId, modelId });
      }

      // Refetch enabled models after successful operation
      await refetchEnabled();
    } catch (error) {
      console.error('Failed to toggle model:', error);
      // Error handling is already done in the mutation hooks
    }
  };

  // Process API data to add recommended flag
  const processedModels = availableModels?.map((model: LLMModel) => ({
    ...model,
    recommended: model.name === "kimi-k2-0711-preview" // Mark Kimi K2 as recommended
  })) || [];

  const featuredModel = processedModels.find((model: LLMModel) => model.recommended);
  const otherModels = processedModels.filter((model: LLMModel) => !model.recommended);

  // Show loading state if data is not yet available
  if (isLoadingAvailable || isLoadingEnabled) {
    return (
      <div className="min-h-full bg-background">
        <div className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground leading-tight">Settings</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Manage your organization settings and LLM model preferences
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Icon name="LoaderCircle" className="size-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading available models...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getProviderLogo = (provider: string) => {
    switch (provider) {
      case "Google":
        return "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/google-gemini-icon.svg";
      case "OpenAI":
        return "https://plugins.jetbrains.com/files/21671/668761/icon/default.svg";
      case "DeepSeek":
        return "https://cdn.worldvectorlogo.com/logos/deepseek-2.svg";
      case "Haithe":
        return "https://pbs.twimg.com/media/Gv-AY7eXEAAIM-l.jpg";
      default:
        return null;
    }
  };

  const renderProviderLogo = (provider: string, className: string, enabled: boolean = true) => {
    const logoUrl = getProviderLogo(provider);
    if (logoUrl) {
      return (
        <img
          src={logoUrl}
          alt={`${provider} logo`}
          className={`${className} transition-all duration-300 ${enabled ? '' : 'grayscale opacity-60'}`}
          onError={(e) => {
            // Fallback to icon if logo fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
      );
    }
    return null;
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "Google": return "Sparkles";
      case "OpenAI": return "Zap";
      case "DeepSeek": return "Brain";
      case "Haithe": return "Star";
      default: return "Bot";
    }
  };

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground leading-tight">Settings</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Manage your organization settings and LLM model preferences
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* LLM Models Section */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-foreground">LLM Models</h2>
              <p className="text-muted-foreground text-sm">
                Configure which AI models are available for your organization members.
              </p>
            </div>

            {/* Featured Model - Kimi K2 */}
            {featuredModel && (
              <Card className="relative overflow-hidden bg-gradient-to-r from-orange-400/10 via-red-500/10 to-sky-400/10 border-2 border-transparent bg-clip-padding">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-500 to-sky-400 opacity-20 rounded-xl"></div>
                <div className="absolute inset-[2px] bg-card rounded-[10px]"></div>
                <CardContent className="relative pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold bg-gradient-to-r from-orange-400 via-red-500 to-sky-400 bg-clip-text text-transparent">
                            {featuredModel.display_name}
                          </h3>
                          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-orange-400/20 via-red-500/20 to-sky-400/20 border-orange-400/30">
                            Recommended
                          </Badge>
                          {!featuredModel.is_active && (
                            <Badge variant="destructive" className="text-xs">
                              Temporarily Unavailable
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">Model ID: {featuredModel.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">${featuredModel.price_per_call.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">per call</p>
                      </div>
                      <Switch
                        checked={isModelEnabled(featuredModel.id)}
                        onCheckedChange={() => toggleModel(featuredModel.id)}
                        disabled={haithe.enableModel.isPending || haithe.disableModel.isPending}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Other Models - Compact Grid */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Other Available Models</CardTitle>
                <CardDescription className="text-sm">
                  {otherModels.length} additional models from Google, OpenAI, DeepSeek, and Haithe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2">
                  {otherModels.map((model, index) => (
                    <div key={model.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-muted flex items-center justify-center min-w-[28px] min-h-[28px]">
                          {renderProviderLogo(model.provider, "size-3.5", isModelEnabled(model.id))}
                          <Icon name={getProviderIcon(model.provider)} className={`size-3.5 text-muted-foreground transition-all duration-300 hidden ${isModelEnabled(model.id) ? '' : 'grayscale opacity-60'}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-foreground truncate">{model.display_name}</span>
                            <span className="text-xs text-muted-foreground">({model.provider})</span>
                            {!model.is_active && (
                              <Badge variant="outline" className="text-xs bg-amber-500/20 border-muted/50">
                                Temporarily Unavailable
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">${model.price_per_call.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">per call</p>
                        </div>
                        <Switch
                          checked={isModelEnabled(model.id)}
                          onCheckedChange={() => toggleModel(model.id)}
                          disabled={haithe.enableModel.isPending || haithe.disableModel.isPending || !model.is_active}
                          className="scale-75"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="bg-accent/30 border-accent/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-accent">
                      <Icon name="Check" className="size-4 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {enabledModels?.length || 0} model{enabledModels?.length !== 1 ? 's' : ''} enabled
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Available to all organization members
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 