
import React from "react";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import SearchBar from "./SearchBar";

interface SearchFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterOpen: boolean;
  toggleFilters: () => void;
  onRefresh: () => void;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  filterOpen,
  toggleFilters,
  onRefresh,
}) => {
  return (
    <div className="flex gap-2 mb-4">
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <Button 
        variant={filterOpen ? "default" : "outline"} 
        size="icon" 
        onClick={toggleFilters}
        className="flex-shrink-0"
      >
        <Filter className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline"
        size="sm"
        onClick={onRefresh}
        className="flex-shrink-0 hidden md:flex"
      >
        Refresh
      </Button>
    </div>
  );
};

export default SearchFilterBar;
