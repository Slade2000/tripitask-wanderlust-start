
import { ChevronRight } from "lucide-react";

export interface MenuItem {
  icon: React.ReactNode;
  title: string;
  description?: string;
  path: string;
  onClick: () => void;
}

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
}

const MenuSection = ({ title, items }: MenuSectionProps) => {
  return (
    <div className="mt-6 px-4">
      <h2 className="text-sm uppercase text-gray-500 font-medium mb-2">{title}</h2>
      
      <div className="bg-white rounded-lg shadow-sm">
        {items.map((item, index) => (
          <button 
            key={item.title}
            onClick={item.onClick}
            className={`flex items-center justify-between w-full px-4 py-4 ${
              index !== items.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <div className="flex flex-col items-start">
              <div className="flex items-center">
                {item.icon}
                <span className="text-[#1A1F2C] text-lg">{item.title}</span>
              </div>
              {item.description && (
                <p className="text-gray-500 text-sm ml-10">{item.description}</p>
              )}
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default MenuSection;
