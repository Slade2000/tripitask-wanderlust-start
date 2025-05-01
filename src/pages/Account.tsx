
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import {
  CreditCard,
  Bell,
  User,
  ChevronRight,
  HelpCircle,
  MessageSquare,
  Shield,
  ChartBar,
  AlarmClock,
  List,
  Users,
  ContactIcon,
  LogOut
} from "lucide-react";

const Account = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [notificationCount] = useState(7);

  // Get user's full name or fallback to a placeholder
  const userName = profile?.full_name || "User";

  // Navigation handlers for each section
  const handleNavigation = (path: string) => {
    // This would navigate to specific pages in a real app
    console.log(`Navigating to: ${path}`);
  };
  
  // Handle logout
  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-cream pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1A1F2C]">{userName}</h1>
          <div className="relative">
            <Bell size={24} className="text-[#1A1F2C]" />
            {notificationCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#FF6B00] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="pb-4">
        {/* Account Settings Section */}
        <div className="mt-6 px-4">
          <h2 className="text-sm uppercase text-gray-500 font-medium mb-2">Account Settings</h2>
          
          <div className="bg-white rounded-lg shadow-sm">
            <button 
              onClick={() => handleNavigation('/account/payment')}
              className="flex items-center justify-between w-full px-4 py-4 border-b border-gray-100"
            >
              <div className="flex items-center">
                <CreditCard size={22} className="text-gray-500 mr-4" />
                <span className="text-[#1A1F2C] text-lg">Payment options</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button 
              onClick={() => handleNavigation('/account/notifications')}
              className="flex items-center justify-between w-full px-4 py-4 border-b border-gray-100"
            >
              <div className="flex items-center">
                <Bell size={22} className="text-gray-500 mr-4" />
                <span className="text-[#1A1F2C] text-lg">Notification preferences</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button 
              onClick={() => handleNavigation('/account/personal')}
              className="flex items-center justify-between w-full px-4 py-4"
            >
              <div className="flex items-center">
                <User size={22} className="text-gray-500 mr-4" />
                <span className="text-[#1A1F2C] text-lg">Personal information</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Earning Money Section */}
        <div className="mt-6 px-4">
          <h2 className="text-sm uppercase text-gray-500 font-medium mb-2">Earning Money</h2>
          
          <div className="bg-white rounded-lg shadow-sm">
            <button 
              onClick={() => handleNavigation('/account/dashboard')}
              className="flex items-center justify-between w-full px-4 py-4 border-b border-gray-100"
            >
              <div className="flex items-center">
                <ChartBar size={22} className="text-gray-500 mr-4" />
                <span className="text-[#1A1F2C] text-lg">My dashboard</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button 
              onClick={() => handleNavigation('/account/alerts')}
              className="flex items-center justify-between w-full px-4 py-4 border-b border-gray-100"
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center">
                  <AlarmClock size={22} className="text-gray-500 mr-4" />
                  <span className="text-[#1A1F2C] text-lg">Set up task alerts</span>
                </div>
                <p className="text-gray-500 text-sm ml-10">Get notified when new tasks match your skills</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button 
              onClick={() => handleNavigation('/account/services')}
              className="flex items-center justify-between w-full px-4 py-4"
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center">
                  <List size={22} className="text-gray-500 mr-4" />
                  <span className="text-[#1A1F2C] text-lg">List my services</span>
                </div>
                <p className="text-gray-500 text-sm ml-10">Create listings for your services so customers come to you</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Help and Support Section */}
        <div className="mt-6 px-4">
          <h2 className="text-sm uppercase text-gray-500 font-medium mb-2">Help and Support</h2>
          
          <div className="bg-white rounded-lg shadow-sm">
            <button 
              onClick={() => handleNavigation('/account/faq')}
              className="flex items-center justify-between w-full px-4 py-4 border-b border-gray-100"
            >
              <div className="flex items-center">
                <HelpCircle size={22} className="text-gray-500 mr-4" />
                <span className="text-[#1A1F2C] text-lg">Frequently asked questions</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button 
              onClick={() => handleNavigation('/account/community')}
              className="flex items-center justify-between w-full px-4 py-4 border-b border-gray-100"
            >
              <div className="flex items-center">
                <Users size={22} className="text-gray-500 mr-4" />
                <span className="text-[#1A1F2C] text-lg">Community guidelines</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button 
              onClick={() => handleNavigation('/account/contact')}
              className="flex items-center justify-between w-full px-4 py-4"
            >
              <div className="flex items-center">
                <ContactIcon size={22} className="text-gray-500 mr-4" />
                <span className="text-[#1A1F2C] text-lg">Contact us</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Log Out Button */}
        <div className="mt-6 px-4">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-4 bg-white rounded-lg shadow-sm"
          >
            <LogOut size={22} className="text-red-500 mr-4" />
            <span className="text-red-500 text-lg">Log Out</span>
          </button>
        </div>
      </div>

      <BottomNav currentPath={location.pathname} />
    </div>
  );
};

export default Account;
