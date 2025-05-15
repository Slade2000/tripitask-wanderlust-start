
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { applyReviewsMigration } from "@/services/migrations/runReviewsMigration";
import { toast } from "sonner";

export default function ApplyMigrations() {
  const [isApplying, setIsApplying] = useState(false);
  
  const handleApplyMigration = async () => {
    try {
      setIsApplying(true);
      const success = await applyReviewsMigration();
      
      if (success) {
        toast.success("Foreign key constraints added successfully!");
      }
    } catch (error: any) {
      console.error("Error executing migration:", error);
      toast.error(`Failed to apply migration: ${error.message || 'Unknown error'}`);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Database Migrations</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Reviews Foreign Key Migration</CardTitle>
          <CardDescription>
            Add foreign key constraints to the reviews table to fix relationship issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            This migration adds foreign key constraints between the reviews table and profiles/tasks tables.
            These constraints are necessary for proper relationship queries.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded p-4 text-amber-800">
            <p className="text-sm font-medium">Warning:</p>
            <p className="text-xs mt-1">
              This operation cannot be undone. Make sure you have a database backup before proceeding.
              The migration will fail if there are any existing reviews with invalid profile or task references.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleApplyMigration} 
            disabled={isApplying}
          >
            {isApplying ? "Applying Migration..." : "Apply Foreign Key Migration"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
