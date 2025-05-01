import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import {
  CreditCard,
  Bell,
  User,
  ChartBar,
  AlarmClock,
  List,
  Users,
  HelpCircle,
  ContactIcon
} from "lucide-react";

import AccountHeader from "@/components/account/AccountHeader";
import MenuSection from "@/components/account/MenuSection";
import LogoutButton from "@/components/account/LogoutButton";
import { MenuItem } from "@/components/account/MenuSection";

const Account = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [notificationCount] = useState(7);

  // For debugging
  useEffect(() => {
    console.log("Current user:", user);
    console.log("Current profile:", profile);
  }, [user, profile]);

  // Get user's full name with multiple fallbacks
  const userName = 
    // Try profile full_name first
    profile?.full_name || 
    // Try combining first and last name from profile
    (profile?.first_name ? 
      `${profile.first_name} ${profile.last_name || ''}`.trim() : null) ||
    // Try user metadata full_name
    (user?.user_metadata?.full_name as string) ||
    // Try combining first and last name from user metadata
    (user?.user_metadata?.first_name ? 
      `${user.user_metadata.first_name as string} ${user.user_metadata.last_name || ''}`.trim() : null) ||
    // Final fallback
    "User";

  // Navigation handlers for each section
  const handleNavigation = (path: string) => {
    // This would navigate to specific pages in a real app
    console.log(`Navigating to: ${path}`);
  };
  
  // Account settings section items
  const accountSettingsItems: MenuItem[] = [
    {
      icon: <CreditCard size={22} className="text-gray-500 mr-4" />,
      title: "Payment options",
      path: '/account/payment',
      onClick: () => handleNavigation('/account/payment')
    },
    {
      icon: <Bell size={22} className="text-gray-500 mr-4" />,
      title: "Notification preferences",
      path: '/account/notifications',
      onClick: () => handleNavigation('/account/notifications')
    },
    {
      icon: <User size={22} className="text-gray-500 mr-4" />,
      title: "Personal information",
      path: '/account/personal',
      onClick: () => handleNavigation('/account/personal')
    }
  ];

  // Earning money section items
  const earningMoneyItems: MenuItem[] = [
    {
      icon: <ChartBar size={22} className="text-gray-500 mr-4" />,
      title: "My dashboard",
      path: '/account/dashboard',
      onClick: () => handleNavigation('/account/dashboard')
    },
    {
      icon: <AlarmClock size={22} className="text-gray-500 mr-4" />,
      title: "Set up task alerts",
      description: "Get notified when new tasks match your skills",
      path: '/account/alerts',
      onClick: () => handleNavigation('/account/alerts')
    },
    {
      icon: <List size={22} className="text-gray-500 mr-4" />,
      title: "List my services",
      description: "Create listings for your services so customers come to you",
      path: '/account/services',
      onClick: () => handleNavigation('/account/services')
    }
  ];

  // Help and support section items
  const helpSupportItems: MenuItem[] = [
    {
      icon: <HelpCircle size={22} className="text-gray-500 mr-4" />,
      title: "Frequently asked questions",
      path: '/account/faq',
      onClick: () => handleNavigation('/account/faq')
    },
    {
      icon: <Users size={22} className="text-gray-500 mr-4" />,
      title: "Community guidelines",
      path: '/account/community',
      onClick: () => handleNavigation('/account/community')
    },
    {
      icon: <ContactIcon size={22} className="text-gray-500 mr-4" />,
      title: "Contact us",
      path: '/account/contact',
      onClick: () => handleNavigation('/account/contact')
    }
  ];

  return (
    <div className="min-h-screen bg-cream pb-20">
      <AccountHeader userName={userName} notificationCount={notificationCount} />

      <div className="pb-4">
        <MenuSection title="Account Settings" items={accountSettingsItems} />
        <MenuSection title="Earning Money" items={earningMoneyItems} />
        <MenuSection title="Help and Support" items={helpSupportItems} />
        <LogoutButton onLogout={signOut} />
      </div>

      <BottomNav currentPath={location.pathname} />
    </div>
  );
};

export default Account;
