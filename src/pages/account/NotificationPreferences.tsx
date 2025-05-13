
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

interface NotificationState {
  email: {
    newMessages: boolean;
    taskUpdates: boolean;
    offerUpdates: boolean;
    paymentUpdates: boolean;
    marketing: boolean;
  };
  push: {
    newMessages: boolean;
    taskUpdates: boolean;
    offerUpdates: boolean;
    paymentUpdates: boolean;
  };
}

const NotificationPreferences = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  // State for notification toggles
  const [notifications, setNotifications] = useState<NotificationState>({
    email: {
      newMessages: true,
      taskUpdates: true,
      offerUpdates: true,
      paymentUpdates: true,
      marketing: false
    },
    push: {
      newMessages: true,
      taskUpdates: true,
      offerUpdates: true,
      paymentUpdates: true
    }
  });
  
  const handleToggle = (channelType: 'email' | 'push', field: string) => {
    setNotifications(prev => ({
      ...prev,
      [channelType]: {
        ...prev[channelType],
        [field]: !prev[channelType][field as keyof typeof prev[channelType]]
      }
    }));
  };
  
  const handleSave = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Notification preferences saved successfully");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-cream min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/account")}
          className="mr-2"
        >
          <ArrowLeft size={22} />
        </Button>
        <h1 className="text-xl font-semibold">Notification Preferences</h1>
      </div>
      
      <div className="px-4 py-6 space-y-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">Email Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-messages" className="flex-1">New messages</Label>
                <Switch 
                  id="email-messages"
                  checked={notifications.email.newMessages}
                  onCheckedChange={() => handleToggle('email', 'newMessages')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email-task-updates" className="flex-1">Task updates</Label>
                <Switch 
                  id="email-task-updates"
                  checked={notifications.email.taskUpdates}
                  onCheckedChange={() => handleToggle('email', 'taskUpdates')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email-offer-updates" className="flex-1">Offer updates</Label>
                <Switch 
                  id="email-offer-updates"
                  checked={notifications.email.offerUpdates}
                  onCheckedChange={() => handleToggle('email', 'offerUpdates')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email-payment-updates" className="flex-1">Payment updates</Label>
                <Switch 
                  id="email-payment-updates"
                  checked={notifications.email.paymentUpdates}
                  onCheckedChange={() => handleToggle('email', 'paymentUpdates')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email-marketing" className="flex-1">Marketing emails</Label>
                <Switch 
                  id="email-marketing"
                  checked={notifications.email.marketing}
                  onCheckedChange={() => handleToggle('email', 'marketing')}
                />
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <h2 className="text-lg font-medium mb-4">Push Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="push-messages" className="flex-1">New messages</Label>
                <Switch 
                  id="push-messages"
                  checked={notifications.push.newMessages}
                  onCheckedChange={() => handleToggle('push', 'newMessages')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="push-task-updates" className="flex-1">Task updates</Label>
                <Switch 
                  id="push-task-updates"
                  checked={notifications.push.taskUpdates}
                  onCheckedChange={() => handleToggle('push', 'taskUpdates')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="push-offer-updates" className="flex-1">Offer updates</Label>
                <Switch 
                  id="push-offer-updates"
                  checked={notifications.push.offerUpdates}
                  onCheckedChange={() => handleToggle('push', 'offerUpdates')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="push-payment-updates" className="flex-1">Payment updates</Label>
                <Switch 
                  id="push-payment-updates"
                  checked={notifications.push.paymentUpdates}
                  onCheckedChange={() => handleToggle('push', 'paymentUpdates')}
                />
              </div>
            </div>
            
            <Button 
              className="w-full mt-6" 
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Preferences"}
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <BottomNav currentPath={location.pathname} />
    </div>
  );
};

export default NotificationPreferences;
