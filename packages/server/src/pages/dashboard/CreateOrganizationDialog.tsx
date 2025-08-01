import { useState } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Input } from "@/src/lib/components/ui/input";
import { Label } from "@/src/lib/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/lib/components/ui/dialog";
import Icon from "@/src/lib/components/custom/Icon";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import { useStore } from "@/src/lib/hooks/use-store";

interface CreateOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateOrganizationDialog({
  open,
  onOpenChange,
}: CreateOrganizationDialogProps) {
  const [orgName, setOrgName] = useState("");
  const api = useHaitheApi();
  const { setSelectedOrganizationId, setSelectedOrg } = useStore();
  const createOrganizationMutation = api.createOrganization;

  const handleCreate = async () => {
    if (!orgName.trim()) return;

    try {
      const newOrg = await createOrganizationMutation.mutateAsync(orgName.trim());
      
      // Switch to the newly created organization
      if (newOrg?.id) {
        setSelectedOrg(newOrg);
        setSelectedOrganizationId(newOrg.id);
      }
      
      // Reset form and close dialog
      setOrgName("");
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the mutation
      console.error("Failed to create organization:", error);
    }
  };

  const handleCancel = () => {
    setOrgName("");
    onOpenChange(false);
  };

  const canCreate = orgName.trim().length > 0 && !createOrganizationMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Icon name="Building2" className="size-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-xl font-bold">Create Organization</DialogTitle>
            <DialogDescription>
              Set up a new workspace for your team
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="orgName" className="text-sm font-medium">
              Organization Name *
            </Label>
            <Input
              id="orgName"
              placeholder="e.g., Acme Corp, My Startup"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canCreate) {
                  handleCreate();
                }
              }}
              className="text-base mt-2"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!canCreate}
            >
              {createOrganizationMutation.isPending ? (
                <div className="flex items-center">
                  <Icon name="Loader" className="size-4 mr-2 animate-spin" />
                  Creating...
                </div>
              ) : (
                <div className="flex items-center">
                  <Icon name="Plus" className="size-4 mr-2" />
                  Create
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 