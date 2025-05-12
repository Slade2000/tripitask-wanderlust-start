
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useState } from "react";

// Import pages
import WelcomePage from "./pages/Welcome";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import PostTask from "./pages/PostTask";
import FindWork from "./pages/FindWork";
import MyJobs from "./pages/MyJobs";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/Messages";
import MessageDetail from "./pages/MessageDetail";
import Account from "./pages/Account";
import TaskOffers from "./pages/TaskOffers";
import TaskDetail from "./pages/TaskDetail";
import SubmitOffer from "./pages/SubmitOffer";
import SpatialReferenceSystems from "./pages/SpatialReferenceSystems";

// Import account-related pages
import NotificationPreferences from "./pages/account/NotificationPreferences";
import PersonalInformation from "./pages/account/PersonalInformation";
import TaskAlerts from "./pages/account/TaskAlerts";

const App = () => {
  // Create a new QueryClient instance inside the component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider>
              <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/home" element={<Home />} />
                <Route path="/welcome-after-login" element={<Home />} />
                <Route path="/post-task" element={<PostTask />} />
                <Route path="/find-work" element={<FindWork />} />
                <Route path="/my-jobs" element={<MyJobs />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tasks/:taskId" element={<TaskDetail />} />
                <Route path="/tasks/:taskId/submit-offer" element={<SubmitOffer />} />
                <Route path="/tasks/:taskId/offers" element={<TaskOffers />} />
                <Route path="/messages" element={<Messages />} />
                {/* Support both task-based and user-based message routes */}
                <Route path="/messages/:taskId" element={<MessageDetail />} />
                <Route path="/messages/user/:userId" element={<MessageDetail />} />
                
                {/* Account section routes */}
                <Route path="/account" element={<Account />} />
                <Route path="/account/notifications" element={<NotificationPreferences />} />
                <Route path="/account/personal" element={<PersonalInformation />} />
                <Route path="/account/alerts" element={<TaskAlerts />} />
                
                <Route path="/spatial-reference-systems" element={<SpatialReferenceSystems />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
