
import React from "react";
import { Slider } from "@/components/ui/slider";

interface BudgetSliderProps {
  budgetRange: number[];
  setBudgetRange: (budget: number[]) => void;
}

const BudgetSlider: React.FC<BudgetSliderProps> = ({
  budgetRange,
  setBudgetRange,
}) => {
  return (
    <div className="mb-4">
      <label className="text-sm font-medium mb-1 block">
        Budget up to: ${budgetRange[0]}
      </label>
      <Slider 
        value={budgetRange}
        onValueChange={setBudgetRange}
        max={2000}
        step={50}
      />
    </div>
  );
};

export default BudgetSlider;
