import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Switch } from "@/src/lib/components/ui/switch";
import { Badge } from "@/src/lib/components/ui/badge";
import { Button } from "@/src/lib/components/ui/button";
import { Input } from "@/src/lib/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/src/lib/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/lib/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/lib/components/ui/select";
import { Label } from "@/src/lib/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/src/lib/components/ui/alert-dialog";
import Icon from "@/src/lib/components/custom/Icon";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import { useStore } from "@/src/lib/hooks/use-store";
import { toast } from "sonner";
import { formatEther } from "viem";
import DashboardHeader from "../Header";
import { Separator } from "@/src/lib/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/lib/components/ui/tabs";
import { useState } from "react";

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
  
  // Organization members state
  const { data: organizationMembers, isLoading: isLoadingMembers, refetch: refetchMembers } = haithe.getOrganizationMembers(selectedOrganizationId);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [newMemberAddress, setNewMemberAddress] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"admin" | "member">("member");
  
  // Get organization balance and expenditure
  const { data: organizationBalance, isLoading: isLoadingBalance } = haithe.organizationBalance(selectedOrganizationId);
  const { data: organizationExpenditure, isLoading: isLoadingExpenditure } = haithe.getOrganizationExpenditure(selectedOrganizationId);

  console.log({ availableModels });

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

  // Organization members management functions
  const handleAddMember = async () => {
    if (!selectedOrganizationId) {
      toast.error('No organization selected');
      return;
    }

    if (!newMemberAddress.trim()) {
      toast.error('Please enter a valid wallet address');
      return;
    }

    try {
      await haithe.addOrganizationMember.mutateAsync({
        orgId: selectedOrganizationId,
        address: newMemberAddress.trim(),
        role: newMemberRole
      });
      
      setNewMemberAddress("");
      setNewMemberRole("member");
      setIsAddMemberDialogOpen(false);
      await refetchMembers();
    } catch (error) {
      console.error('Failed to add member:', error);
      // Error handling is already done in the mutation hooks
    }
  };

  const handleUpdateMemberRole = async (address: string, newRole: "admin" | "member") => {
    if (!selectedOrganizationId) {
      toast.error('No organization selected');
      return;
    }

    try {
      await haithe.updateOrganizationMemberRole.mutateAsync({
        orgId: selectedOrganizationId,
        address,
        role: newRole
      });
      await refetchMembers();
    } catch (error) {
      console.error('Failed to update member role:', error);
      // Error handling is already done in the mutation hooks
    }
  };

  const handleRemoveMember = async (address: string) => {
    if (!selectedOrganizationId) {
      toast.error('No organization selected');
      return;
    }

    try {
      await haithe.removeOrganizationMember.mutateAsync({
        orgId: selectedOrganizationId,
        address
      });
      await refetchMembers();
    } catch (error) {
      console.error('Failed to remove member:', error);
      // Error handling is already done in the mutation hooks
    }
  };

  // Format balance and expenditure values
  const formatBalance = (balanceData: { balance: number } | undefined) => {
    if (!balanceData) return "0.00";
    return (balanceData.balance / 1e18).toFixed(6);
  };

  const formatExpenditure = (expenditureData: { expenditure: number } | undefined) => {
    if (!expenditureData) return "0.00";
    return (expenditureData.expenditure / 1e18).toFixed(6);
  };

  // Process API data to add recommended flag
  const processedModels = availableModels?.map((model: LLMModel) => ({
    ...model,
    recommended: model.name === "kimi-k2-0711-preview" // Mark Kimi K2 as recommended
  })) || [];

  const featuredModel = processedModels.find((model: LLMModel) => model.recommended);
  const otherModels = processedModels.filter((model: LLMModel) => !model.recommended);

  // Show loading state if data is not yet available
  if (isLoadingAvailable || isLoadingEnabled || isLoadingMembers || isLoadingBalance || isLoadingExpenditure) {
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

  console.log({
    availableModels
  })

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
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        <DashboardHeader 
          title="Settings"
          subtitle="Manage your organization settings and LLM model preferences"
          iconName="Settings"
        />
      </div>

      <Separator className="bg-border/50" />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="models" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="models" className="flex items-center gap-2">
              <Icon name="Bot" className="size-4" />
              <p className="hidden md:block">LLM Models</p>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Icon name="Users" className="size-4" />
              <p className="hidden md:block">Members</p>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <Icon name="CreditCard" className="size-4" />
              <p className="hidden md:block">Billing</p>
            </TabsTrigger>
          </TabsList>

          {/* LLM Models Tab */}
          <TabsContent value="models" className="space-y-6">
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
                          <p className="text-sm font-medium text-foreground">${formatEther(BigInt(model.price_per_call))}</p>
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
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground">Organization Members</h2>
                <p className="text-muted-foreground text-sm">
                  Manage who has access to your organization and their permissions.
                </p>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Current Members</CardTitle>
                      <CardDescription className="text-sm">
                        {organizationMembers?.length || 0} member{organizationMembers?.length !== 1 ? 's' : ''} in your organization
                      </CardDescription>
                    </div>
                    <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                          <Icon name="Plus" className="size-4" />
                          Add Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Organization Member</DialogTitle>
                          <DialogDescription>
                            Add a new member to your organization by their wallet address.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="member-address">Wallet Address</Label>
                            <Input
                              id="member-address"
                              placeholder="0x..."
                              value={newMemberAddress}
                              onChange={(e) => setNewMemberAddress(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="member-role">Role</Label>
                            <Select value={newMemberRole} onValueChange={(value: "admin" | "member") => setNewMemberRole(value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleAddMember}
                            disabled={haithe.addOrganizationMember.isPending || !newMemberAddress.trim()}
                          >
                            {haithe.addOrganizationMember.isPending ? (
                              <>
                                <Icon name="LoaderCircle" className="size-4 animate-spin mr-2" />
                                Adding...
                              </>
                            ) : (
                              'Add Member'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {organizationMembers && organizationMembers.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Address</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {organizationMembers.map((member: any) => (
                          <TableRow key={member.address}>
                            <TableCell className="font-mono text-sm">
                              {member.address.slice(0, 6)}...{member.address.slice(-4)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                                  {member.role}
                                </Badge>
                                <Select 
                                  value={member.role} 
                                  onValueChange={(value: "admin" | "member") => handleUpdateMemberRole(member.address, value)}
                                  disabled={haithe.updateOrganizationMemberRole.isPending}
                                >
                                  <SelectTrigger className="w-24 h-7">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                    <Icon name="Trash2" className="size-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Member</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove {member.address.slice(0, 6)}...{member.address.slice(-4)} from your organization? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRemoveMember(member.address)}
                                      disabled={haithe.removeOrganizationMember.isPending}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {haithe.removeOrganizationMember.isPending ? (
                                        <>
                                          <Icon name="LoaderCircle" className="size-4 animate-spin mr-2" />
                                          Removing...
                                        </>
                                      ) : (
                                        'Remove Member'
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Icon name="Users" className="size-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No members found</p>
                      <p className="text-sm text-muted-foreground">Add your first organization member to get started.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground">Billing & Usage</h2>
                <p className="text-muted-foreground text-sm">
                  Monitor your organization's usage and billing information.
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Organization Balance</CardTitle>
                    <Icon name="Wallet" className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatBalance(organizationBalance)} USDT</div>
                    <p className="text-xs text-muted-foreground">
                      Available funds
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenditure</CardTitle>
                    <Icon name="TrendingDown" className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatExpenditure(organizationExpenditure)} USDT</div>
                    <p className="text-xs text-muted-foreground">
                      Total spent to date
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Enabled Models</CardTitle>
                    <Icon name="Bot" className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{enabledModels?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Active LLM models
                    </p>
                  </CardContent>
                </Card>
              </div>


            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 