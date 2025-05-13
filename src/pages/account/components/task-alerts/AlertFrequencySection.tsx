
import { Bell } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormLabel } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface AlertFrequencySectionProps {
  alertsEnabled?: boolean;
  setAlertsEnabled?: (enabled: boolean) => void;
  notificationMethod?: string;
  setNotificationMethod?: (method: string) => void;
  frequency?: string;
  setFrequency?: (frequency: string) => void;
  
  // For backward compatibility
  selectedFrequency?: string;
  options?: { value: string; label: string }[];
  onFrequencyChange?: (frequency: string) => void;
}

const AlertFrequencySection = ({
  alertsEnabled = true,
  setAlertsEnabled,
  notificationMethod = "both",
  setNotificationMethod,
  frequency = "daily",
  setFrequency,
  selectedFrequency,
  options,
  onFrequencyChange
}: AlertFrequencySectionProps) => {
  
  // Use the appropriate state or prop
  const currentFrequency = selectedFrequency || frequency;
  
  // Handle frequency change with proper fallback
  const handleFrequencyChange = (value: string) => {
    if (onFrequencyChange) {
      onFrequencyChange(value);
    } else if (setFrequency) {
      setFrequency(value);
    }
  };
  
  const frequencyOptions = options || [
    { value: "immediate", label: "Immediate alerts" },
    { value: "daily", label: "Daily digest" },
    { value: "weekly", label: "Weekly summary" }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Bell size={18} className="mr-2" />
            Alert Frequency
          </CardTitle>
          <Switch 
            checked={alertsEnabled} 
            onCheckedChange={setAlertsEnabled || (() => {})}
          />
        </div>
        <CardDescription>
          Choose how often you want to receive task alerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alertsEnabled && (
          <>
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Notification Method</h3>
              <RadioGroup 
                value={notificationMethod} 
                onValueChange={setNotificationMethod || (() => {})}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="app" id="app" />
                  <FormLabel htmlFor="app">App only</FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" />
                  <FormLabel htmlFor="email">Email only</FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" />
                  <FormLabel htmlFor="both">App & Email</FormLabel>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Alert Frequency</h3>
              <RadioGroup 
                value={currentFrequency} 
                onValueChange={handleFrequencyChange}
                className="flex flex-col space-y-2"
              >
                {frequencyOptions.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <FormLabel htmlFor={option.value}>{option.label}</FormLabel>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertFrequencySection;
