import type { ProgressIndicatorProps } from "../types";

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const getStepNumber = (step: string) => {
    return step === 'welcome' ? 1 : 2;
  };

  const currentStepNumber = getStepNumber(currentStep);

  return (
    <div className="flex items-center justify-center space-x-4">
      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium border-2 ${
        currentStepNumber >= 1
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background text-muted-foreground border-border'
      }`}>
        1
      </div>
      <div className={`h-1 w-16 rounded ${
        currentStepNumber >= 2 ? 'bg-primary' : 'bg-border'
      }`} />
      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium border-2 ${
        currentStepNumber >= 2
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background text-muted-foreground border-border'
      }`}>
        2
      </div>
    </div>
  );
} 