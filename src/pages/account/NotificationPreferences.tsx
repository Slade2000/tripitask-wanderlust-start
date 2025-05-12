
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BellRing, Mail, MessageSquare, Bell } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const NotificationPreferences = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for different notification types
  const [preferences, setPreferences] = useState({
    // App notifications
    newMessages: true,
    taskUpdates: true,
    offerUpdates: true,
    paymentUpdates: true,
    taskReminders: true,
    
    // Email notifications
    emailNewMessages: false,
    emailTaskUpdates: true,
    emailOfferUpdates: true,
    emailPaymentUpdates: true,
    emailTaskReminders: false,
    
    // Marketing notifications
    marketingApp: false,
    marketingEmail: false,
  });

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to database
    console.log("Saving notification preferences:", preferences);
    
    toast({
      title: "Preferences saved",
      description: "Your notification preferences have been updated.",
    });
    
    // Navigate back to account page
    navigate("/account");
  };

  return (
    <div className="bg-cream min-h-screen pb-8">
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
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell size={18} className="mr-2 text-gray-600" />
              App Notifications
            </CardTitle>
            <CardDescription>
              Control which notifications appear in your app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">New messages</p>
                <p className="text-sm text-gray-500">Get notified when you receive a new message</p>
              </div>
              <Switch 
                checked={preferences.newMessages} 
                onCheckedChange={() => handleToggle('newMessages')}
              />
            </div>
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Task updates</p>
                <p className="text-sm text-gray-500">Updates on tasks you've created or applied to</p>
              </div>
              <Switch 
                checked={preferences.taskUpdates} 
                onCheckedChange={() => handleToggle('taskUpdates')}
              />
            </div>
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Offer updates</p>
                <p className="text-sm text-gray-500">When your offers are accepted or rejected</p>
              </div>
              <Switch 
                checked={preferences.offerUpdates} 
                onCheckedChange={() => handleToggle('offerUpdates')}
              />
            </div>
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Payment updates</p>
                <p className="text-sm text-gray-500">Notifications about payments and invoices</p>
              </div>
              <Switch 
                checked={preferences.paymentUpdates} 
                onCheckedChange={() => handleToggle('paymentUpdates')}
              />
            </div>
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Task reminders</p>
                <p className="text-sm text-gray-500">Reminders about upcoming tasks</p>
              </div>
              <Switch 
                checked={preferences.taskReminders} 
                onCheckedChange={() => handleToggle('taskReminders')}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail size={18} className="mr-2 text-gray-600" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Choose which emails you'd like to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">New messages</p>
              </div>
              <Switch 
                checked={preferences.emailNewMessages} 
                onCheckedChange={() => handleToggle('emailNewMessages')}
              />
            </div>
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Task updates</p>
              </div>
              <Switch 
                checked={preferences.emailTaskUpdates} 
                onCheckedChange={() => handleToggle('emailTaskUpdates')}
              />
            </div>
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Offer updates</p>
              </div>
              <Switch 
                checked={preferences.emailOfferUpdates} 
                onCheckedChange={() => handleToggle('emailOfferUpdates')}
              />
            </div>
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Payment updates</p>
              </div>
              <Switch 
                checked={preferences.emailPaymentUpdates} 
                onCheckedChange={() => handleToggle('emailPaymentUpdates')}
              />
            </div>
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Task reminders</p>
              </div>
              <Switch 
                checked={preferences.emailTaskReminders} 
                onCheckedChange={() => handleToggle('emailTaskReminders')}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare size={18} className="mr-2 text-gray-600" />
              Marketing Communications
            </CardTitle>
            <CardDescription>
              Updates about new features and special offers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">In-app marketing</p>
                <p className="text-sm text-gray-500">Promotions and special offers in the app</p>
              </div>
              <Switch 
                checked={preferences.marketingApp} 
                onCheckedChange={() => handleToggle('marketingApp')}
              />
            </div>
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Marketing emails</p>
                <p className="text-sm text-gray-500">Newsletter and promotional emails</p>
              </div>
              <Switch 
                checked={preferences.marketingEmail} 
                onCheckedChange={() => handleToggle('marketingEmail')}
              />
            </div>
          </CardContent>
        </Card>
        
        <Button 
          className="w-full" 
          onClick={handleSave}
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
};

export default NotificationPreferences;
