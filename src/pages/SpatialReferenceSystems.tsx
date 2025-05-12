
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SpatialRefSystemsViewer from '@/components/SpatialRefSystemsViewer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function SpatialReferenceSystems() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="mb-6">You need to be logged in to view spatial reference systems.</p>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Spatial Reference Systems</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <SpatialRefSystemsViewer />
      </div>
    </div>
  );
}
