
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import LocationSearchInput from "@/components/location/LocationSearchInput";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import { useState } from "react";

interface BasicProfileInfoProps {
  fullName: string;
  businessName: string;
  tradeRegistryNumber: string;
  location: string;
  about: string;
  services: string;
  onChange: (name: string, value: string) => void;
  disabled: boolean;
}

const BasicProfileInfo = ({
  fullName,
  businessName,
  tradeRegistryNumber,
  location,
  about,
  services,
  onChange,
  disabled
}: BasicProfileInfoProps) => {
  // Use the location search hook for Google Places integration
  const { 
    searchTerm, 
    setSearchTerm, 
    suggestions, 
    isLoading: locationLoading,
    resetSearch
  } = useLocationSearch({
    initialTerm: location,
    debounceTime: 300
  });
  
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange(name, value);
  };
  
  const handleLocationSelect = (selectedLocation: string) => {
    onChange('location', selectedLocation);
    resetSearch();
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <Input
          id="full_name"
          name="full_name"
          value={fullName}
          onChange={handleChange}
          disabled={disabled}
          placeholder="Your full name"
        />
      </div>
      
      <div>
        <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-1">
          Business Name
        </label>
        <Input
          id="business_name"
          name="business_name"
          value={businessName}
          onChange={handleChange}
          disabled={disabled}
          placeholder="Your business name"
        />
      </div>
      
      <div>
        <label htmlFor="trade_registry_number" className="block text-sm font-medium text-gray-700 mb-1">
          Trade Registry Number
        </label>
        <Input
          id="trade_registry_number"
          name="trade_registry_number"
          value={tradeRegistryNumber}
          onChange={handleChange}
          disabled={disabled}
          placeholder="Your trade registry number"
        />
      </div>
      
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <LocationSearchInput
          searchTerm={searchTerm || location}
          setSearchTerm={(term) => {
            setSearchTerm(term);
            onChange('location', term);
          }}
          suggestions={suggestions}
          isLoading={locationLoading}
          showSuggestions={showLocationSuggestions}
          setShowSuggestions={setShowLocationSuggestions}
          onLocationSelect={handleLocationSelect}
          label=""
          placeholder="Enter your location"
          disabled={disabled}
        />
      </div>
      
      <div>
        <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-1">
          About Me
        </label>
        <Textarea
          id="about"
          name="about"
          value={about}
          onChange={handleChange}
          disabled={disabled}
          placeholder="Tell clients about yourself and your services"
          rows={4}
        />
      </div>
      
      <div>
        <label htmlFor="services" className="block text-sm font-medium text-gray-700 mb-1">
          Services (comma separated)
        </label>
        <Input
          id="services"
          name="services"
          value={services}
          onChange={handleChange}
          disabled={disabled}
          placeholder="e.g. Plumbing, Electrical, Carpentry"
        />
      </div>
    </div>
  );
};

export default BasicProfileInfo;
