"use client"

import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

interface Step {
  id: string
  title: string
  description: string
}

interface ProgressStepsProps {
  steps: Step[]
  currentStep: number
  onStepClick: (step: number) => void
  className?: string
}

export function ProgressSteps({ steps, currentStep, onStepClick, className }: ProgressStepsProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="hidden md:flex">
        <div className="w-full flex items-center">
          {steps.map((step, index) => (
            <div key={step.id} className="relative flex-1">
              <div
                className={cn(
                  "flex items-center justify-center",
                  index < steps.length - 1 &&
                    "after:content-[''] after:absolute after:top-1/2 after:w-full after:h-0.5 after:bg-muted-foreground/30 after:translate-y-px",
                  index <= currentStep && "after:bg-primary",
                )}
              >
                <button
                  type="button"
                  onClick={() => onStepClick(index)}
                  className={cn(
                    "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background transition-colors",
                    index < currentStep
                      ? "border-primary bg-primary text-primary-foreground"
                      : index === currentStep
                        ? "border-primary text-primary"
                        : "border-muted-foreground/30 text-muted-foreground",
                  )}
                >
                  {index < currentStep ? <CheckIcon className="h-5 w-5" /> : <span>{index + 1}</span>}
                </button>
              </div>
              <div className="mt-2 text-center">
                <div
                  className={cn("text-sm font-medium", index <= currentStep ? "text-primary" : "text-muted-foreground")}
                >
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground hidden lg:block">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        <div className="flex justify-between mb-2">
          <div className="text-sm font-medium">{steps[currentStep].title}</div>
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
        <div className="w-full bg-muted-foreground/30 rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">{steps[currentStep].description}</div>
      </div>
    </div>
  )
}
