
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface MenuItem {
  icon: React.ReactNode;
  title: string;
  description?: string;
  path: string;
  onClick?: () => void;
}

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
}

const MenuSection = ({ title, items }: MenuSectionProps) => {
  const navigate = useNavigate();

  const handleItemClick = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick();
    } else {
      navigate(item.path);
    }
  };

  return (
    <div className="mt-6 px-4">
      <h2 className="text-sm uppercase text-gray-500 font-medium mb-2">{title}</h2>
      
      <div className="bg-white rounded-lg shadow-sm">
        {items.map((item, index) => (
          <button 
            key={item.title}
            onClick={() => handleItemClick(item)}
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
