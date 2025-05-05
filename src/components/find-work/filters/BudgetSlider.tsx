
import React from "react";
import { Slider } from "@/components/ui/slider";

interface BudgetSliderProps {
  budgetRange: number[];
  setBudgetRange: (budget: number[]) => void;
  maxBudget?: number;
  step?: number;
  className?: string;
  label?: string;
}

const BudgetSlider: React.FC<BudgetSliderProps> = ({
  budgetRange,
  setBudgetRange,
  maxBudget = 2000,
  step = 50,
  className = "",
  label = "Budget up to",
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="text-sm font-medium mb-1 block">
        {label}: ${budgetRange[0]}
      </label>
      <Slider 
        value={budgetRange}
        onValueChange={setBudgetRange}
        max={maxBudget}
        step={step}
      />
    </div>
  );
};

export default BudgetSlider;
