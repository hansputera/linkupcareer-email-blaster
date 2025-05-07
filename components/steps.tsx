"use client"

import { type ReactNode, createContext, useContext } from "react"
import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

interface StepsContextValue {
  activeStep: number
  setActiveStep: (step: number) => void
}

const StepsContext = createContext<StepsContextValue | null>(null)

export function useSteps() {
  const context = useContext(StepsContext)
  if (!context) {
    throw new Error("useSteps must be used within a Steps component")
  }
  return context
}

interface StepsProps {
  activeStep: number
  setActiveStep: (step: number) => void
  children: ReactNode
}

export function Steps({ activeStep, setActiveStep, children }: StepsProps) {
  return (
    <StepsContext.Provider value={{ activeStep, setActiveStep }}>
      <div className="space-y-8">{children}</div>
    </StepsContext.Provider>
  )
}

interface StepProps {
  title: string
  description?: string
  completed?: boolean
  children: ReactNode
}

export function Step({ title, description, completed = false, children }: StepProps) {
  const { activeStep, setActiveStep } = useSteps()
  const stepIndex = Array.from(StepsContext["_currentValue"].children || []).indexOf(children)
  const isActive = activeStep === stepIndex

  return (
    <div className={cn("transition-all duration-200", !isActive && "opacity-60")}>
      <div className="flex items-start gap-4 mb-4 cursor-pointer" onClick={() => setActiveStep(stepIndex)}>
        <div className="relative">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border text-center",
              isActive && "border-primary bg-primary text-primary-foreground",
              completed && "border-green-500 bg-green-500 text-white",
            )}
          >
            {completed ? <CheckIcon className="h-4 w-4" /> : stepIndex + 1}
          </div>
          {stepIndex < Array.from(StepsContext["_currentValue"].children || []).length - 1 && (
            <div className="absolute left-1/2 top-8 h-[calc(100%-2rem)] w-px -translate-x-1/2 bg-border" />
          )}
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className={cn("ml-12", !isActive && "hidden")}>{children}</div>
    </div>
  )
}
