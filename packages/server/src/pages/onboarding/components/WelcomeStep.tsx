import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Separator } from "@/src/lib/components/ui/separator";
import Icon from "@/src/lib/components/custom/Icon";

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <video 
            src="/static/haitheAI.mp4" 
            autoPlay 
            loop 
            muted 
            className="size-24 overflow-hidden rounded-sm object-cover" 
          />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold">Welcome to Haithe!</CardTitle>
          <CardDescription className="text-lg">
            Let's set up your workspace to get you started with AI development
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 rounded-lg bg-muted/10">
            <Icon name="Building2" className="size-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold">Create Organization</h3>
              <p className="text-sm text-muted-foreground">
                Set up your workspace for team collaboration
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 rounded-lg bg-muted/10">
            <Icon name="Zap" className="size-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold">Start Building</h3>
              <p className="text-sm text-muted-foreground">
                Access AI models and start creating projects
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button onClick={onNext} size="lg">
            Get Started
            <Icon name="ArrowRight" className="size-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 