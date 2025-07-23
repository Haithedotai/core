import { useHaitheApi } from "../../hooks/use-haithe-api";
import { useStore } from "../../hooks/use-store";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import Icon from "../custom/Icon";

export default function OrganizationSelector() {
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

  return (
    <Select
      value={selectedOrganizationId.toString()}
      onValueChange={(value) => setSelectedOrganizationId(parseInt(value))}
    >
      <SelectTrigger className="w-auto rounded-md border bg-background/50 hover:bg-accent/30 hover:text-accent-foreground">
        <div className="flex items-center gap-2">
          <Icon name="Building" className="size-4" />
          <SelectValue placeholder="Select organization">
            {currentOrganization?.name || "Select organization"}
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
      </SelectContent>
    </Select>
  );
} 