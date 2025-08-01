import { Button } from "@/src/lib/components/ui/button";
import Icon from "@/src/lib/components/custom/Icon";
import DashboardHeader from "../Header";
import { Separator } from "@/src/lib/components/ui/separator";

export default function AnalyticsPage() {
  return (
    <div className="min-h-full bg-background">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        <DashboardHeader
          title="Analytics"
          subtitle="View insights and performance metrics"
          iconName="TrendingUp"
        />
      </div>

      <Separator className="bg-border/50" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-16">
          <Icon name="TrendingUp" className="size-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Analytics</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            This page is under development. Coming soon...
          </p>
        </div>
      </div>
    </div>
  );
} 