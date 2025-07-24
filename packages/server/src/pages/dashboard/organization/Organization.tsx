import { useState } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Switch } from "@/src/lib/components/ui/switch";
import { Badge } from "@/src/lib/components/ui/badge";
import { Separator } from "@/src/lib/components/ui/separator";
import Icon from "@/src/lib/components/custom/Icon";

interface LLMModel {
  id: string;
  name: string;
  provider: string;
  recommended?: boolean;
}

const llmModels: LLMModel[] = [
  // Kimi Models (Featured)
  { id: "kimi-k2", name: "Kimi K2", provider: "Kimi", recommended: true },

  // Other Models
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "Google" },
  { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", provider: "Google" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google" },
  { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite", provider: "Google" },
  { id: "gpt-o3", name: "GPT-o3", provider: "OpenAI" },
  { id: "gpt-o3-mini", name: "GPT-o3 Mini", provider: "OpenAI" },
  { id: "gpt-o4-mini", name: "GPT-o4 Mini", provider: "OpenAI" },
  { id: "gpt-4.1-nano", name: "GPT-4.1 Nano", provider: "OpenAI" },
  { id: "gpt-4.1-mini", name: "GPT-4.1 Mini", provider: "OpenAI" },
  { id: "deepseek-chat", name: "DeepSeek Chat", provider: "DeepSeek" },
  { id: "deepseek-reasoner", name: "DeepSeek Reasoner", provider: "DeepSeek" },
];

export default function OrganizationPage() {
  const [enabledModels, setEnabledModels] = useState<Set<string>>(new Set(["kimi-k2"]));

  const toggleModel = (modelId: string) => {
    const newEnabledModels = new Set(enabledModels);
    if (newEnabledModels.has(modelId)) {
      newEnabledModels.delete(modelId);
    } else {
      newEnabledModels.add(modelId);
    }
    setEnabledModels(newEnabledModels);
  };

  const featuredModel = llmModels.find(model => model.recommended);
  const otherModels = llmModels.filter(model => !model.recommended);

  const getProviderLogo = (provider: string) => {
    switch (provider) {
      case "Google":
        return "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/google-gemini-icon.svg";
      case "OpenAI":
        return "https://plugins.jetbrains.com/files/21671/668761/icon/default.svg";
      case "DeepSeek":
        return "https://cdn.worldvectorlogo.com/logos/deepseek-2.svg";
      case "Kimi":
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
      case "Kimi": return "Star";
      default: return "Bot";
    }
  };

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground leading-tight">Organization</h1>
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
                            {featuredModel.name}
                          </h3>
                          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-orange-400/20 via-red-500/20 to-sky-400/20 border-orange-400/30">
                            Recommended
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Model ID: {featuredModel.id}</p>
                      </div>
                    </div>
                    <Switch
                      checked={enabledModels.has(featuredModel.id)}
                      onCheckedChange={() => toggleModel(featuredModel.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Other Models - Compact Grid */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Other Available Models</CardTitle>
                <CardDescription className="text-sm">
                  {otherModels.length} additional models from Google, OpenAI, and DeepSeek
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2">
                  {otherModels.map((model, index) => (
                    <div key={model.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-muted flex items-center justify-center min-w-[28px] min-h-[28px]">
                          {renderProviderLogo(model.provider, "size-3.5", enabledModels.has(model.id))}
                          <Icon name={getProviderIcon(model.provider)} className={`size-3.5 text-muted-foreground transition-all duration-300 hidden ${enabledModels.has(model.id) ? '' : 'grayscale opacity-60'}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-foreground truncate">{model.name}</span>
                            <span className="text-xs text-muted-foreground">({model.provider})</span>
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={enabledModels.has(model.id)}
                        onCheckedChange={() => toggleModel(model.id)}
                        className="scale-75"
                      />
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
                        {enabledModels.size} model{enabledModels.size !== 1 ? 's' : ''} enabled
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Available to all organization members
                      </p>
                    </div>
                  </div>
                  <Button size="sm">
                    <Icon name="Save" className="size-3.5 mr-1.5" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 