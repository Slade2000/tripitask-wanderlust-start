
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BudgetFilterProps {
  minBudget: string;
  setMinBudget: (value: string) => void;
  maxBudget: string;
  setMaxBudget: (value: string) => void;
  className?: string;
}

const BudgetFilter: React.FC<BudgetFilterProps> = ({
  minBudget,
  setMinBudget,
  maxBudget,
  setMaxBudget,
  className = "",
}) => {
  // Handle input changes with validation for numbers only
  const handleBudgetChange = (
    value: string,
    setter: (value: string) => void
  ) => {
    // Allow empty string or numbers only
    if (value === "" || /^\d+$/.test(value)) {
      setter(value);
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      <Label className="text-sm font-medium mb-2 block">Budget Range ($)</Label>
      <div className="flex items-center gap-2">
        <div className="w-full">
          <Input
            type="text"
            placeholder="Min"
            value={minBudget}
            onChange={(e) => handleBudgetChange(e.target.value, setMinBudget)}
            className="w-full"
          />
        </div>
        <span className="text-gray-500">to</span>
        <div className="w-full">
          <Input
            type="text"
            placeholder="Max"
            value={maxBudget}
            onChange={(e) => handleBudgetChange(e.target.value, setMaxBudget)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default BudgetFilter;
