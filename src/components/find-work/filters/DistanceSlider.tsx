
import React from "react";
import { Slider } from "@/components/ui/slider";

interface DistanceSliderProps {
  distanceRadius: number[];
  setDistanceRadius: (radius: number[]) => void;
}

const DistanceSlider: React.FC<DistanceSliderProps> = ({
  distanceRadius,
  setDistanceRadius,
}) => {
  return (
    <div className="mb-4">
      <label className="text-sm font-medium mb-1 block">
        Distance Radius: {distanceRadius[0]} km
      </label>
      <Slider 
        value={distanceRadius}
        onValueChange={setDistanceRadius}
        max={100}
        step={5}
      />
    </div>
  );
};

export default DistanceSlider;
