
import { Bell } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormLabel } from "@/components/ui/form";
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface AlertFrequencySectionProps {
  alertsEnabled: boolean;
  setAlertsEnabled: (enabled: boolean) => void;
  notificationMethod: string;
  setNotificationMethod: (method: string) => void;
  frequency: string;
  setFrequency: (frequency: string) => void;
}

const AlertFrequencySection = ({
  alertsEnabled,
  setAlertsEnabled,
  notificationMethod,
  setNotificationMethod,
  frequency,
  setFrequency
}: AlertFrequencySectionProps) => {
  return (
    <>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Bell size={18} className="mr-2" />
            Task Alerts
          </CardTitle>
          <Switch 
            checked={alertsEnabled} 
            onCheckedChange={setAlertsEnabled}
          />
        </div>
        <CardDescription>
          Get notified when new tasks match your criteria
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alertsEnabled && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Notification Method</h3>
              <RadioGroup 
                value={notificationMethod} 
                onValueChange={setNotificationMethod}
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
                value={frequency} 
                onValueChange={setFrequency}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="immediate" id="immediate" />
                  <FormLabel htmlFor="immediate">Immediate alerts</FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="daily" />
                  <FormLabel htmlFor="daily">Daily digest</FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <FormLabel htmlFor="weekly">Weekly summary</FormLabel>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}
      </CardContent>
    </>
  );
};

export default AlertFrequencySection;
