
import { Link } from "react-router-dom";
import { HelpCircle, Briefcase, LayoutDashboard, MessageSquare, User } from "lucide-react";
import { useUnreadMessageCount } from "@/hooks/useUnreadMessageCount";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
  badge?: number;
}

const NavItem = ({ icon, label, to, active = false, badge }: NavItemProps) => (
  <Link
    to={to}
    className={`flex flex-col items-center justify-center px-2 py-1 text-xs relative ${
      active
        ? "text-[#2563EB] font-medium"
        : "text-[#64748B] font-normal"
    }`}
  >
    <div className="mb-1 relative">
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-2 -right-2 bg-[#FF6B00] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </div>
    <span>{label}</span>
  </Link>
);

interface BottomNavProps {
  currentPath: string;
}

const BottomNav = ({ currentPath }: BottomNavProps) => {
  const { unreadCount } = useUnreadMessageCount();
  
  // Determine active state based on path patterns
  const isHome = currentPath === "/home" || currentPath === "/post-task";
  const isFindWork = currentPath === "/find-work" || currentPath.startsWith("/tasks/");
  const isDashboard = currentPath === "/dashboard";
  const isMessages = currentPath.startsWith("/messages");
  const isAccount = currentPath === "/account" || currentPath.startsWith("/account/");
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 py-2">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <NavItem
          icon={<HelpCircle size={24} />}
          label="Post a Task"
          to="/post-task"
          active={isHome}
        />
        <NavItem
          icon={<Briefcase size={24} />}
          label="Find Work"
          to="/find-work"
          active={isFindWork}
        />
        <NavItem
          icon={<LayoutDashboard size={24} />}
          label="Dashboard"
          to="/dashboard"
          active={isDashboard}
        />
        <NavItem
          icon={<MessageSquare size={24} />}
          label="Messages"
          to="/messages"
          active={isMessages}
          badge={unreadCount}
        />
        <NavItem
          icon={<User size={24} />}
          label="Account"
          to="/account"
          active={isAccount}
        />
      </div>
    </div>
  );
};

export default BottomNav;
