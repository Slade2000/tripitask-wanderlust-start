
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { applyReviewsMigration } from "@/services/migrations/runReviewsMigration";
import { toast } from "sonner";

export default function ApplyMigrations() {
  const handleApplyMigration = async () => {
    try {
      await applyReviewsMigration();
      toast.info("Please follow the instructions in the documentation to apply the migration.");
    } catch (error) {
      console.error("Error requesting migration:", error);
      toast.error("Failed to initiate migration process.");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Database Migrations</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Reviews Foreign Key Migration</CardTitle>
          <CardDescription>
            Apply foreign key constraints to the reviews table to fix relationship issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            This migration adds foreign key constraints between the reviews table and profiles/tasks tables.
            These constraints are necessary for proper relationship queries.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded p-4 text-amber-800">
            <p className="text-sm font-medium">Important:</p>
            <p className="text-xs mt-1">
              To apply this migration, please follow the instructions in the documentation.
              You will need to execute the SQL script using the Supabase Dashboard or CLI.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleApplyMigration}>View Migration Instructions</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
