import { useState } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Input } from "@/src/lib/components/ui/input";
import { Label } from "@/src/lib/components/ui/label";
import { Textarea } from "@/src/lib/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/lib/components/ui/avatar";
import { Badge } from "@/src/lib/components/ui/badge";
import { Separator } from "@/src/lib/components/ui/separator";
import Icon from "@/src/lib/components/custom/Icon";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import { useStore } from "@/src/lib/hooks/use-store";
import { toast } from "sonner";

export default function ProfilePage() {
  const api = useHaitheApi();
  const profileQuery = api.profile();

  // Local store for profile data
  const {
    profile: localProfile,
    setProfileDisplayName,
    setProfileAbout,
    setProfilePicture,
    updateProfile
  } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    about: ''
  });

  // Loading state
  if (profileQuery.isLoading) {
    return (
      <div className="min-h-full bg-background">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0" />
          <div className="relative max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-lg bg-gradient-to-br from-primary/5 to-primary/2 flex items-center justify-center border border-primary/20">
                    <Icon name="LoaderCircle" className="size-8 text-primary animate-spin" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                      Profile
                    </h1>
                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl">
                      Loading your personal information and preferences...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (profileQuery.isError) {
    return (
      <div className="min-h-full bg-background">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0" />
          <div className="relative max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-lg bg-gradient-to-br from-destructive/5 to-destructive/2 flex items-center justify-center border border-destructive/20">
                    <Icon name="CircleAlert" className="size-8 text-destructive" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                      Profile
                    </h1>
                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl">
                      Failed to load profile information. Please try again.
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="lg" onClick={() => profileQuery.refetch()}>
                <Icon name="RefreshCw" className="size-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const profile = profileQuery.data;

  // Initialize edit form when entering edit mode
  const handleEditToggle = () => {
    if (!isEditing) {
      setEditForm({
        name: localProfile.displayName || '',
        about: localProfile.about || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    // Update local store with new values
    updateProfile({
      displayName: editForm.name,
      about: editForm.about
    });

    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  // Format date utility
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };

  // Use local profile data for display name, fallback to API or default
  const displayName = localProfile.displayName || (profile as any)?.name || (profile as any)?.username || 'Anonymous User';
  const aboutText = localProfile.about || 'No description provided';
  const profilePicture = localProfile.profilePicture || (profile as any)?.avatar || (profile as any)?.profile_picture;

  // API data for backend information  
  const walletAddress = profile?.address || (profile as any)?.wallet_address || '';
  const shortAddress = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '';

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-lg bg-gradient-to-br from-primary/5 to-primary/2 flex items-center justify-center border border-primary/20">
                  <Icon name="User" className="size-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    Profile
                  </h1>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl">
                    Manage your personal information and preferences
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="space-y-8">
          {/* Profile Hero Card */}
          <Card className="relative overflow-hidden shadow-lg border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] to-secondary/[0.02]" />
            <CardHeader className="relative pb-4 sm:pb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {/* Avatar Section */}
                  <div className="relative group self-center sm:self-auto">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300" />
                    <Avatar className="relative size-24 border-4 border-background shadow-xl">
                      <AvatarImage
                        src={profilePicture}
                        alt={displayName}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary/10 to-secondary/10 text-primary">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {/* Profile Info */}
                  <div className="space-y-2 flex-1 min-w-0 mt-2 sm:mt-0">
                    <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent break-words">
                      {displayName}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                      <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-full text-xs">
                        <Icon name="Wallet" className="size-4" />
                        <span className="font-mono text-sm">{shortAddress}</span>
                      </div>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-2 py-0.5 text-xs">
                        <Icon name="User" className="size-3 mr-1" />
                        {(profile as any)?.role || 'Member'}
                      </Badge>
                    </div>
                  </div>
                </div>
                {/* Edit Button */}
                <div className="flex shrink-0 justify-center sm:justify-end mt-4 sm:mt-0">
                  <Button
                    variant={isEditing ? "destructive" : "default"}
                    onClick={handleEditToggle}
                    className="shadow-lg transition-all duration-200 w-full sm:w-auto"
                  >
                    <Icon name={isEditing ? "X" : "Pencil"} className="size-4 mr-2" />
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Information - Takes up 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-secondary/[0.02] rounded-lg" />
                <CardHeader className="relative pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon name="User" className="size-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Basic Details</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-6">
                  {/* Name Field */}
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-semibold text-foreground">Display Name</Label>
                    <div className="mt-2">
                      {isEditing ? (
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter your display name"
                          className="bg-background/50 border-2 focus:border-primary/50 focus:bg-background transition-all duration-200"
                        />
                      ) : (
                        <div className="bg-gradient-to-r from-muted/30 to-muted/10 p-4 rounded-xl border border-border/50">
                          <p className="text-foreground font-medium">{displayName}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* About Field */}
                  <div className="space-y-3">
                    <Label htmlFor="about" className="text-sm font-semibold text-foreground">About</Label>
                    <div className="mt-2">
                      {isEditing ? (
                        <Textarea
                          id="about"
                          value={editForm.about}
                          onChange={(e) => setEditForm(prev => ({ ...prev, about: e.target.value }))}
                          placeholder="Tell us about yourself..."
                          rows={4}
                          className="bg-background/50 border-2 focus:border-primary/50 focus:bg-background transition-all duration-200 resize-none"
                        />
                      ) : (
                        <div className="bg-gradient-to-r from-muted/30 to-muted/10 p-4 rounded-xl border border-border/50 min-h-[120px]">
                          <p className="text-foreground leading-relaxed">{aboutText}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-3">
                      <Button
                        onClick={handleSave}
                        variant={"primary"}
                      >
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={handleEditToggle}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Account Details Sidebar */}
            <div className="space-y-6">
              <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-secondary/[0.02] rounded-lg" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3">
                    <div className="p-3">
                      <Icon name="Calendar" className="size-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Account Details</CardTitle>
                      <CardDescription className="mt-1">
                        Your membership information
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-6">
                  {/* Registration Date */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-foreground">Member Since</Label>
                    <div className="mt-2 flex items-center gap-3 p-3 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/50">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Icon name="Calendar" className="size-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {(profile as any)?.created_at || (profile as any)?.registration_date || profile?.registered
                          ? formatDate((profile as any).created_at || (profile as any).registration_date || profile?.registered)
                          : 'Date not available'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Last Login */}
                  {((profile as any)?.last_login || (profile as any)?.last_active) && (
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-foreground">Last Active</Label>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/50">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Icon name="Clock" className="size-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {formatDate((profile as any).last_login || (profile as any).last_active)}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 