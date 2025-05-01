
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  onLogout: () => Promise<void>;
}

const LogoutButton = ({ onLogout }: LogoutButtonProps) => {
  return (
    <div className="mt-6 px-4">
      <button 
        onClick={onLogout}
        className="flex items-center w-full px-4 py-4 bg-white rounded-lg shadow-sm"
      >
        <LogOut size={22} className="text-red-500 mr-4" />
        <span className="text-red-500 text-lg">Log Out</span>
      </button>
    </div>
  );
};

export default LogoutButton;
