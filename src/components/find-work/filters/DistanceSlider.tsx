
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
        max={500}
        step={10}
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>0 km</span>
        <span>250 km</span>
        <span>500 km</span>
      </div>
    </div>
  );
};

export default DistanceSlider;
