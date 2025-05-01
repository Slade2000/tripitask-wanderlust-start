
import { useState } from "react";
import { useLocation } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import {
  CreditCard,
  Bell,
  User,
  HelpCircle,
  FileText,
  LogOut,
  Lock,
  Phone,
  Shield
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";

const Account = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("payment");
  
  // Sample form for notification preferences
  const notificationForm = useForm();
  
  // Sample notification preferences
  const notificationTypes = [
    { id: "transactional", label: "Transactional" },
    { id: "taskUpdates", label: "Task Updates" },
    { id: "taskReminders", label: "Task Reminders" },
    { id: "keywordAlerts", label: "Keyword Task Alerts" },
    { id: "recommendedTasks", label: "Recommended Task Alerts" },
    { id: "helpfulInfo", label: "Helpful Information" },
    { id: "newsletters", label: "Updates & Newsletters" }
  ];

  return (
    <div className="min-h-screen bg-cream p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-teal mb-6 text-center">
          Account
        </h1>
        
        <Tabs 
          defaultValue="payment" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="payment" className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              <span className="hidden md:inline">Payment</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1">
              <Bell className="h-4 w-4" />
              <span className="hidden md:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span className="hidden md:inline">Profile</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Payment Options Tab */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Payment Options</CardTitle>
                <CardDescription>
                  Manage your payment methods and view your payment history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="payment-history">
                    <AccordionTrigger>Payment History</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Earned</h3>
                          <div className="text-sm text-gray-500">
                            Your payment history will appear here.
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <h3 className="font-semibold mb-2">Outgoing</h3>
                          <div className="text-sm text-gray-500">
                            Your payment history will appear here.
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="update-methods">
                    <AccordionTrigger>Update Payment Methods</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Make Payments</h3>
                          <Button variant="outline" className="w-full sm:w-auto">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Add Payment Method
                          </Button>
                        </div>
                        <Separator />
                        <div>
                          <h3 className="font-semibold mb-2">Receive Payments</h3>
                          <Button variant="outline" className="w-full sm:w-auto">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Add Bank Account
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notification Preferences Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control what notifications you receive
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <div className="space-y-4">
                    {notificationTypes.map((type) => (
                      <FormField
                        key={type.id}
                        control={notificationForm.control}
                        name={type.id}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>{type.label}</FormLabel>
                              <FormDescription>
                                Receive notifications about {type.label.toLowerCase()}
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </Form>
              </CardContent>
            </Card>
            
            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Set Up Task Alerts</CardTitle>
                  <CardDescription>
                    Get notified when new tasks match your criteria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Bell className="h-4 w-4 mr-2" />
                    Create New Alert
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>List My Services</CardTitle>
                  <CardDescription>
                    Showcase the services you offer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Manage Services
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Manage your account details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    Mobile Verification
                  </Button>
                  
                  <Button variant="destructive" className="w-full justify-start">
                    Delete My Account
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Help & Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("faq")}>
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Frequently Asked Questions
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("contact")}>
                    Contact Us
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Insurance & Legal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("insurance")}>
                    <Shield className="h-4 w-4 mr-2" />
                    Insurance Protection
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("privacy")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Privacy Policy
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("terms")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Terms and Conditions
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start text-red-500">
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Additional tabs for secondary screens */}
          <TabsContent value="faq">
            <Card>
              <CardHeader className="flex flex-row items-center">
                <Button 
                  variant="ghost" 
                  className="mr-2" 
                  onClick={() => setActiveTab("profile")}
                >
                  ←
                </Button>
                <div>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>
                    Find answers to common questions
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="faq-1">
                    <AccordionTrigger>How do I post a task?</AccordionTrigger>
                    <AccordionContent>
                      You can post a task by clicking on the "Help Me" tab at the bottom of the screen and following the steps.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-2">
                    <AccordionTrigger>How do payments work?</AccordionTrigger>
                    <AccordionContent>
                      Payments are securely processed through our platform. You can add payment methods in your account settings.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-3">
                    <AccordionTrigger>How can I become a service provider?</AccordionTrigger>
                    <AccordionContent>
                      You can offer your services by listing them in the "List My Services" section of your account.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contact">
            <Card>
              <CardHeader className="flex flex-row items-center">
                <Button 
                  variant="ghost" 
                  className="mr-2" 
                  onClick={() => setActiveTab("profile")}
                >
                  ←
                </Button>
                <div>
                  <CardTitle>Contact Us</CardTitle>
                  <CardDescription>
                    Get in touch with our support team
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>For any questions or assistance, please contact our support team:</p>
                  <p>Email: support@example.com</p>
                  <p>Phone: 1-800-123-4567</p>
                  <p>Hours: Monday - Friday, 9am - 5pm</p>
                  
                  <Button className="w-full sm:w-auto">
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="insurance">
            <Card>
              <CardHeader className="flex flex-row items-center">
                <Button 
                  variant="ghost" 
                  className="mr-2" 
                  onClick={() => setActiveTab("profile")}
                >
                  ←
                </Button>
                <div>
                  <CardTitle>Insurance Protection</CardTitle>
                  <CardDescription>
                    Information about our insurance coverage
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>Our platform offers insurance protection for tasks performed through our service.</p>
                  <p>Coverage includes:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Property damage up to $1,000,000</li>
                    <li>Personal injury coverage</li>
                    <li>Professional liability</li>
                  </ul>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy">
            <Card>
              <CardHeader className="flex flex-row items-center">
                <Button 
                  variant="ghost" 
                  className="mr-2" 
                  onClick={() => setActiveTab("profile")}
                >
                  ←
                </Button>
                <div>
                  <CardTitle>Privacy Policy</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>Last updated: May 1, 2025</p>
                  <p>This privacy policy describes how we collect, use, and share your personal information.</p>
                  <h3 className="text-lg font-semibold">Information We Collect</h3>
                  <p>We collect information you provide directly to us, information we collect when you use our services, and information we collect from third parties.</p>
                  <h3 className="text-lg font-semibold">How We Use Your Information</h3>
                  <p>We use the information we collect to provide, maintain, and improve our services, to process transactions, to communicate with you, and for other purposes with your consent.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="terms">
            <Card>
              <CardHeader className="flex flex-row items-center">
                <Button 
                  variant="ghost" 
                  className="mr-2" 
                  onClick={() => setActiveTab("profile")}
                >
                  ←
                </Button>
                <div>
                  <CardTitle>Terms and Conditions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>Last updated: May 1, 2025</p>
                  <p>These terms and conditions outline the rules and regulations for the use of our platform.</p>
                  <h3 className="text-lg font-semibold">Acceptance of Terms</h3>
                  <p>By accessing and using our service, you accept and agree to be bound by these Terms and Conditions.</p>
                  <h3 className="text-lg font-semibold">User Accounts</h3>
                  <p>You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav currentPath={location.pathname} />
    </div>
  );
};

export default Account;
