import { useState } from "react";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import { useStore } from "@/src/lib/hooks/use-store";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/src/lib/components/ui/select";
import { Skeleton } from "@/src/lib/components/ui/skeleton";
import { Separator } from "@/src/lib/components/ui/separator";
import Icon from "@/src/lib/components/custom/Icon";
import CreateOrganizationDialog from "./CreateOrganizationDialog";

export default function OrganizationSelector() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const api = useHaitheApi();
  const { selectedOrganizationId, setSelectedOrganizationId } = useStore();
  const { data: userOrganizations, isLoading: isUserOrganizationsLoading } = api.getUserOrganizations();

  // Don't show if not logged in to Haithe
  if (!api.isLoggedIn()) {
    return null;
  }

  // Loading state
  if (isUserOrganizationsLoading) {
    return (
      <div className="flex items-center gap-2 py-2 px-4 rounded-md border bg-background/50">
        <Icon name="Users" className="size-4" />
        <Skeleton className="w-24 h-4 bg-muted" />
      </div>
    );
  }

  // No organizations available
  if (!userOrganizations || userOrganizations.length === 0) {
    return null;
  }

  // Find the selected organization or default to the first one
  const currentOrganization = userOrganizations.find(org => org.id === selectedOrganizationId) || userOrganizations[0];
  
  // Set default if none selected
  if (selectedOrganizationId === 0 && userOrganizations.length > 0) {
    setSelectedOrganizationId(userOrganizations[0].id);
  }

  const handleValueChange = (value: string) => {
    if (value === "create-new") {
      setIsCreateDialogOpen(true);
    } else {
      setSelectedOrganizationId(parseInt(value));
    }
  };

  return (
    <>
      <Select
        value={selectedOrganizationId.toString()}
        onValueChange={handleValueChange}
      >
        <SelectTrigger className="w-auto rounded-md border bg-background/50 hover:bg-accent/30 hover:text-accent-foreground">
          <div className="flex items-center gap-2">
            <Icon name="Building" className="size-4" />
            <SelectValue placeholder="Select organization">
              <p className="hidden md:block">{currentOrganization?.name || "Select organization"}</p>
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent className="">
          {userOrganizations.map((organization) => (
            <SelectItem 
              key={organization.id} 
              value={organization.id.toString()}
            >
              <div className="flex items-center gap-2">
                <Icon name="ChevronRight" className="size-4" />
                {organization.name}
              </div>
            </SelectItem>
          ))}
          
          <Separator className="my-1" />
          
          <SelectItem value="create-new">
            <div className="flex items-center gap-2 text-primary">
              <Icon name="Plus" className="size-4" />
              Create New Organization
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <CreateOrganizationDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </>
  );
} 