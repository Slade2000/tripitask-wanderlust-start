
import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  loading?: boolean;
}

export function StatCard({ title, value, icon, loading = false }: StatCardProps) {
  return (
    <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-2">
        <p className="text-gray-600 text-sm">{title}</p>
        {icon}
      </div>
      {loading ? (
        <Skeleton className="h-6 w-20" />
      ) : (
        <p className="text-xl font-semibold">{value}</p>
      )}
    </div>
  );
}
