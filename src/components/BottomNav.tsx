
import { Link } from "react-router-dom";
import { HelpCircle, Briefcase, List, MessageSquare, User } from "lucide-react";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
}

const NavItem = ({ icon, label, to, active = false }: NavItemProps) => (
  <Link
    to={to}
    className={`flex flex-col items-center justify-center px-2 py-1 text-xs ${
      active
        ? "text-gold font-medium"
        : "text-cream font-normal hover:text-gold"
    }`}
  >
    <div className="mb-1">{icon}</div>
    <span>{label}</span>
  </Link>
);

interface BottomNavProps {
  currentPath: string;
}

const BottomNav = ({ currentPath }: BottomNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-teal-dark border-t border-teal-light/30 py-2">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <NavItem
          icon={<HelpCircle size={20} />}
          label="Help Me"
          to="/post-task"
          active={currentPath === "/post-task"}
        />
        <NavItem
          icon={<Briefcase size={20} />}
          label="Find Jobs"
          to="/find-work"
          active={currentPath === "/find-work"}
        />
        <NavItem
          icon={<List size={20} />}
          label="My Jobs"
          to="/my-jobs"
          active={currentPath === "/my-jobs"}
        />
        <NavItem
          icon={<MessageSquare size={20} />}
          label="Messages"
          to="/messages"
          active={currentPath === "/messages"}
        />
        <NavItem
          icon={<User size={20} />}
          label="Account"
          to="/account"
          active={currentPath === "/account"}
        />
      </div>
    </div>
  );
};

export default BottomNav;
