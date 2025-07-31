import { useState } from "react";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/src/lib/components/ui/dialog";
import Icon from "@/src/lib/components/custom/Icon";
import { copyToClipboard } from "@/utils";
import { Link } from "@tanstack/react-router";
import { formatDateTime } from "@/src/lib/utils/date";

export default function GenerateAPIKeyPage() {
  const haithe = useHaitheApi();
  const generateApiKeyMutation = haithe.generateApiKey;
  const disableApiKeyMutation = haithe.disableApiKey;
  const [generatedApiKey, setGeneratedApiKey] = useState<{ api_key: string; message: string; issued_at: number } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { data: apiKeyLastIssued, refetch: refetchApiKeyLastIssued, isSuccess: isApiKeyLastIssuedSuccess } = haithe.apiKeyLastIssued();

  const handleGenerateApiKey = async () => {
    try {
      const apiKey = await generateApiKeyMutation.mutateAsync();
      setGeneratedApiKey(apiKey);
      refetchApiKeyLastIssued();
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Failed to generate API key:", error);
    }
  };

  const handleCopyApiKey = () => {
    if (generatedApiKey) {
      copyToClipboard(generatedApiKey.api_key, "API Key", setCopiedField);
    }
  };

  const handleDisableApiKey = async () => {
    try {
      await disableApiKeyMutation.mutateAsync();
      refetchApiKeyLastIssued();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to disable API key:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Icon name="Key" className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl font-semibold">Haithe API Key</CardTitle>
          <CardDescription>
            Manage your Haithe API key. This key will only be shown once.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            {isApiKeyLastIssuedSuccess && apiKeyLastIssued?.issued_at !== 0 ? (
              <div>
                <div className="flex items-start space-x-3">
                  <Icon name="CircleCheck" className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">API Key Enabled</p>
                    <p>You have already generated an API key. You need to disable it to generate a new one.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 mt-4">
                  <Icon name="Clock" className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Last Issued At</p>
                    <p>{formatDateTime(new Date(apiKeyLastIssued?.issued_at * 1000 || 0))}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-3">
                <Icon name="TriangleAlert" className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">No API Key Generated</p>
                  <p>You can generate a new API key to start using the Haithe API.</p>
                </div>
              </div>
            )}
          </div>

          {isApiKeyLastIssuedSuccess && apiKeyLastIssued?.issued_at !== 0 ? (
            <Button
              onClick={handleDisableApiKey}
              className="w-full"
              disabled={disableApiKeyMutation.isPending}
            >
              {disableApiKeyMutation.isPending ? (
                <>
                  <Icon name="LoaderCircle" className="h-4 w-4 animate-spin" />
                  Disabling...
                </>
              ) : (
                <>
                  <Icon name="Trash" className="h-4 w-4 text-red-500" />
                  Disable API Key
                </>
              )}
            </Button>) : (
            <Button
              onClick={handleGenerateApiKey}
              className="w-full"
              disabled={generateApiKeyMutation.isPending}
            >
              {generateApiKeyMutation.isPending ? (
                <>
                  <Icon name="LoaderCircle" className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Icon name="Plus" className="h-4 w-4" />
                  Generate API Key
                </>
              )}
            </Button>

          )}
        </CardContent>
      </Card>


      <Link to="/dashboard" className="mt-4 text-sm underline underline-offset-2 hover:text-muted-foreground transition-colors" >
        Back to Dashboard
      </Link>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Key" className="h-5 w-5 text-primary" />
              API Key Generated
            </DialogTitle>
            <DialogDescription>
              Your API key has been generated successfully. Copy it now as it won't be shown again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">API Key</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyApiKey}
                  className="h-8 w-8 p-0"
                >
                  {copiedField === "API Key" ? (
                    <Icon name="CircleCheck" className="h-4 w-4 text-green-500" />
                  ) : (
                    <Icon name="Copy" className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="mt-2">
                <code className="block w-full break-all rounded bg-background p-3 text-sm font-mono text-foreground">
                  {generatedApiKey?.api_key}
                </code>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Issued At</span>
                <Icon name="Clock" className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-1">
                <p className="text-sm text-foreground">
                  {generatedApiKey?.issued_at ? formatDateTime(new Date(generatedApiKey.issued_at * 1000)) : ''}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 dark:bg-amber-950/20 dark:border-amber-800">
              <div className="flex items-start space-x-3">
                <Icon name="TriangleAlert" className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">Keep it safe!</p>
                  <p className="text-amber-700 dark:text-amber-300">
                    This is the only time you'll see this API key. Store it securely in your application.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button className="" onClick={() => setIsDialogOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}