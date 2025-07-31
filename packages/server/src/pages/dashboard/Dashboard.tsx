import { useState } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/src/lib/components/ui/dialog";
import Icon from "@/src/lib/components/custom/Icon";
import { Link } from "@tanstack/react-router";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import { cn, formatDate, truncateAddress } from "@/src/lib/utils";
import { useStore } from "@/src/lib/hooks/use-store";
import { copyToClipboard } from "@/utils";
import QRCode from "qrcode";
import { useEffect, useRef } from "react";
import type { Organization } from "../../../../../services/clients";
import { Image } from "@/src/lib/components/custom/Image";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  description?: string;
  gradient?: string;
}

function StatsCard({
  title,
  value,
  icon,
  trend,
  description,
}: StatsCardProps) {
  const link = `/dashboard/${title.toLowerCase()}`;

  return (
    <Link to={link} className="border relative overflow-hidden shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm rounded-lg">
      <div className={`absolute inset-0 bg-gradient-to-br from-primary/[0.08] to-secondary/[0.02]`} />
      <CardHeader className="relative pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center border border-primary/20">
              <Icon name={icon as any} className="size-6 text-primary" />
            </div>
            <CardTitle className="text-sm font-semibold text-foreground">
              {title}
            </CardTitle>
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${trend.positive
              ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
              : 'text-red-600 bg-red-50 dark:bg-red-950/30'
              }`}>
              <Icon
                name={trend.positive ? "TrendingUp" : "TrendingDown"}
                className="size-3"
              />
              <span className="font-medium">{trend.value}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative pt-0">
        <div className="text-3xl font-bold text-foreground mb-2">
          {value}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </CardContent>
    </Link>
  );
}

function QuickActionsSection() {
  return (
    <Card className="shadow-lg border bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-secondary/[0.02] rounded-lg" />
      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <div className="p-3">
            <Icon name="Zap" className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription className="mt-1">
              Get started with common tasks
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4 @container">
        <div className="grid grid-cols-1 @2xl:grid-cols-3 gap-4">
          <Button variant="outline" className="justify-start h-auto p-4 shadow-md hover:shadow-lg transition-all duration-200 border border-border/50 bg-gradient-to-r from-background to-background/50 backdrop-blur-sm" asChild>
            <Link to="/dashboard/agents">
              <div className="flex items-center gap-3">
                <div className="p-3">
                  <Icon name="Bot" className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Manage Agents</div>
                  <div className="text-xs text-muted-foreground">Configure AI agents</div>
                </div>
              </div>
            </Link>
          </Button>

          <Button variant="outline" className="justify-start h-auto p-4 shadow-md hover:shadow-lg transition-all duration-200 border border-border/50 bg-gradient-to-r from-background to-background/50 backdrop-blur-sm" asChild>
            <Link to="/dashboard/workflows">
              <div className="flex items-center gap-3">
                <div className="p-3">
                  <Icon name="GitBranch" className="size-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Build Workflows</div>
                  <div className="text-xs text-muted-foreground">Create automated flows</div>
                </div>
              </div>
            </Link>
          </Button>

          <Button variant="outline" className="justify-start h-auto p-4 shadow-md hover:shadow-lg transition-all duration-200 border border-border/50 bg-gradient-to-r from-background to-background/50 backdrop-blur-sm" asChild>
            <Link to="/dashboard/settings">
              <div className="flex items-center gap-3">
                <div className="p-3">
                  <Icon name="Settings" className="size-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Settings</div>
                  <div className="text-xs text-muted-foreground">Manage preferences</div>
                </div>
              </div>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentActivitySection() {
  return (
    <Card className="shadow-lg border bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-secondary/[0.02] rounded-lg" />
      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <div className="p-3">
            <Icon name="Activity" className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Recent Activity</CardTitle>
            <CardDescription className="mt-1">
              Your latest actions and updates
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-center py-16 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center mx-auto border border-border/50">
            <Icon name="Clock" className="size-8 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">No Recent Activity</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Your recent activities will appear here once you start using the platform.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrganizationDetailsSection({ organization }: { organization: Organization }) {
  if (!organization) {
    return (
      <Card className="shadow-lg border bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-secondary/[0.02] rounded-lg" />
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="p-3">
              <Icon name="Building2" className="size-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Organization Details</CardTitle>
              <CardDescription className="mt-1">
                Your organization information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-center py-16 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center mx-auto border border-border/50">
              <Icon name="LoaderCircle" className="size-8 text-muted-foreground animate-spin" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground">Loading Organization</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Fetching your organization details...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-secondary/[0.02] rounded-lg" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3">
              <Icon name="Building2" className="size-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Organization Details</CardTitle>
              <CardDescription className="mt-1">
                Your organization information and settings
              </CardDescription>
            </div>
          </div>

        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-6">
          {/* Organization Header */}
          <div className="flex items-center p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-border/50">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center border border-primary/20">
              <Icon name="Building2" className="size-8 text-primary" />
            </div>
            <div className="flex-1 ml-4">
              <h3 className="text-xl font-semibold text-foreground">
                {organization.name || 'Unnamed Organization'}
              </h3>

              <p className="text-sm text-muted-foreground">
                Organization ID: {organization.id || 'N/A'}
              </p>
            </div>

            <FundOrganizationDialog organization={organization} />

            <Button variant="outline" size="sm" asChild className="ml-2">
              <Link to="/dashboard/settings">
                <Icon name="Settings" className="size-4" />
                <p className="hidden md:block">Settings</p>
              </Link>
            </Button>
          </div>

          {/* Organization Details Grid */}
          <div>
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground">Address</span>
                  <span className="text-sm font-medium text-foreground">
                    {truncateAddress(organization.address)} <Button variant="ghost" size="icon" onClick={() => copyToClipboard(organization.address, "Organization Address")} className="size-4 ml-2">
                      <Icon name="Copy" className="size-4" />
                    </Button>
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground">UID</span>
                  <span className="text-sm font-medium text-foreground">
                    {truncateAddress(organization.organization_uid)} <Button variant="ghost" size="icon" onClick={() => copyToClipboard(organization.organization_uid, "Organization UID")} className="size-4 ml-2">
                      <Icon name="Copy" className="size-4" />
                    </Button>
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground">Owner</span>
                  <span className="text-sm font-medium text-foreground">
                    {truncateAddress(organization.owner)} <Button variant="ghost" size="icon" onClick={() => copyToClipboard(organization.owner, "Organization Owner")} className="size-4 ml-2">
                      <Icon name="Copy" className="size-4" />
                    </Button>
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground">Created at</span>
                  <span className="text-sm font-medium text-foreground">
                    {organization.created_at ? formatDate(organization.created_at, "MMM D, YYYY") : 'Unknown'}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FundOrganizationDialog({ organization }: { organization: Organization }) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (organization?.address && isDialogOpen) {
      const paymentUri = `ethereum:${organization.address}`;
      QRCode.toDataURL(paymentUri, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error, dataUrl) => {
        if (error) {
          console.error('Error generating QR code:', error);
        } else {
          console.log('QR code generated successfully');
          setQrCodeDataUrl(dataUrl);
        }
      });
    }
  }, [organization?.address, isDialogOpen]);

  if (!organization?.address) {
    return null;
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Icon name="QrCode" className="size-4" />
          <p className="hidden md:block">Fund Organization</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image src="/static/tether.svg" alt="USDT" className="size-5" />
            Fund Organization
          </DialogTitle>
          <DialogDescription>
            Send USDT to the organization wallet to fund it.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-2">
          <div className="flex justify-center">
            <div className="p-1 bg-white rounded-lg border border-border/50">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code for organization wallet"
                  className="w-48 h-48"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center">
                  <Icon name="LoaderCircle" className="size-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Wallet Address */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-foreground">Organization Wallet Address:</div>
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border/50">
              <code className="text-sm font-mono text-foreground flex-1 break-all">
                {organization.address}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(organization.address, "Organization Address")}
                className="size-8"
              >
                <Icon name="Copy" className="size-4" />
              </Button>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)} className="w-full">
            <Icon name="Wallet" className="size-4" />
            Use Connected Wallet
          </Button>

          {/* Instructions */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-foreground">How to fund:</div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">1</span>
                </div>
                <p>Open your wallet app (MetaMask, Rainbow, etc.)</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">2</span>
                </div>
                <p>Tap the QR code scanner or copy the address above</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">3</span>
                </div>
                <p>Send the desired amount of USDT to fund your organization</p>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <Icon name="Info" className="size-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p>You need to fund your organization wallet to use AI agents. The funds will be used to pay for agent operations and API calls.</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function DashboardPage() {
  const api = useHaitheApi();

  // Get profile data
  const profileQuery = api.profile();
  const profile = profileQuery.data;
  const { selectedOrganizationId } = useStore();
  const { data: organization } = api.getOrganization(selectedOrganizationId);
  const { data: agents } = api.getProjects(selectedOrganizationId);
  const { data: apiKeyLastIssued } = api.apiKeyLastIssued();


  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="space-y-3 flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-lg bg-gradient-to-br from-primary/5 to-primary/2 flex items-center justify-center border border-primary/20">
                  <Icon name="LayoutDashboard" className="size-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    Dashboard
                  </h1>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl">
                    {profile?.address ? `Registered since ${formatDate(profile?.registered, "MMM D, YYYY")}` : 'Manage your AI infrastructure and monitor performance'}
                  </p>
                </div>
              </div>

              <Button variant="outline" asChild>
                <Link to="/dashboard/generate-api-key">
                  <Icon name="Key" className={cn(
                    "size-4 text-orange-400",
                  )} />
                  <span className="hidden sm:inline bg-gradient-to-r from-orange-400 via-red-500 to-sky-400 bg-clip-text text-transparent">
                    {apiKeyLastIssued?.issued_at && apiKeyLastIssued?.issued_at !== 0 ? <span className="">API Key Enabled</span> : <span className="">Generate API Key</span>}
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatsCard
              title="Agents"
              value={agents?.length || 0}
              icon="Bot"
              description="Running agents"
            />
            <StatsCard
              title="Workflows"
              value="0"
              icon="GitBranch"
              description="Automated flows"
            />
          </div>

          {/* Organization Details Section */}
          {organization && <OrganizationDetailsSection organization={organization} />}

          {/* Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <QuickActionsSection />
            <RecentActivitySection />
          </div>
        </div>
      </div>
    </div>
  );
} 