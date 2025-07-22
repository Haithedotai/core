import { Button } from "@/src/lib/components/ui/button";
import Icon from "@/src/lib/components/custom/Icon";

export default function SettingsPage() {
  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-foreground leading-tight">Settings</h1>
            <p className="text-muted-foreground text-xl leading-relaxed">
              Configure your account preferences and platform settings
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center py-20 space-y-8">
          <Icon name="Settings" className="size-20 text-muted-foreground mx-auto" />
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold leading-relaxed">Settings Page</h3>
            <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
              This page is under development. Coming soon!
            </p>
          </div>
          <Button variant="outline" size="lg">
            <Icon name="ArrowLeft" className="size-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
} 