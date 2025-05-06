
import React from 'react';
import { Hourglass } from "lucide-react";

export default function EmptyOffers() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md text-center">
      <div className="flex flex-col items-center justify-center gap-4 max-w-md mx-auto">
        <Hourglass className="h-12 w-12 text-teal animate-pulse" />
        <h3 className="text-xl font-semibold text-gray-800">No offers yet</h3>
        <p className="text-gray-600">
          Hang tight! Service providers are checking your task and may submit offers soon.
        </p>
        <div className="bg-teal/10 p-4 rounded-lg mt-2">
          <p className="text-sm text-teal">
            Tip: Tasks with clear descriptions and photos usually receive offers faster.
          </p>
        </div>
      </div>
    </div>
  );
}
