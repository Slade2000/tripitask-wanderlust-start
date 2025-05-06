
import React from 'react';

export default function EmptyOffers() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <div className="flex justify-end mb-4">
        <div className="bg-gray-100 p-4 rounded-3xl rounded-tr-none max-w-xs">
          <p className="text-gray-600">
            No offers yet. Hang tight! Service providers are checking your task.
          </p>
        </div>
      </div>
    </div>
  );
}
