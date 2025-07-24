import { Button } from "@/src/lib/components/ui/button";
import { Input } from "@/src/lib/components/ui/input";
import { Label } from "@/src/lib/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Separator } from "@/src/lib/components/ui/separator";
import Icon from "@/src/lib/components/custom/Icon";

interface OrganizationStepProps {
  orgName: string;
  onOrgNameChange: (name: string) => void;
  canContinue: boolean;
  isCreating: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export default function OrganizationStep({ 
  onNext, 
  onPrev, 
  orgName, 
  onOrgNameChange, 
  canContinue, 
  isCreating 
}: OrganizationStepProps) {
  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <Icon name="Building2" className="size-10 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold">Create Your Organization</CardTitle>
          <CardDescription>
            Set up your workspace for managing AI projects and team collaboration
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName" className="text-sm font-medium">
              Organization Name *
            </Label>
            <Input
              id="orgName"
              placeholder="e.g., Acme Corp, My Startup"
              value={orgName}
              onChange={(e) => onOrgNameChange(e.target.value)}
              className="text-base mt-2"
            />
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onPrev}>
            <Icon name="ArrowLeft" className="size-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={onNext}
            disabled={!canContinue || isCreating}
            size="lg"
          >
            {isCreating ? (
              <div className="flex items-center">
                <Icon name="Loader" className="size-4 mr-2 animate-spin" />
                Creating...
              </div>
            ) : (
              <div className="flex items-center">
                <Icon name="CheckCheck" className="size-4 mr-2" />
                Finish Setup 
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 