
import { Bell } from "lucide-react";

interface AccountHeaderProps {
  userName: string;
  notificationCount: number;
}

const AccountHeader = ({ userName, notificationCount }: AccountHeaderProps) => {
  return (
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
  );
};

export default AccountHeader;
