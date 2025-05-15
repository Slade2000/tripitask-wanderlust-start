
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { toast } from 'sonner';

interface NetworkStatusContextType {
  isOnline: boolean;
  isConnectionSlow: boolean;
}

const NetworkStatusContext = createContext<NetworkStatusContextType>({
  isOnline: true,
  isConnectionSlow: false,
});

export const useNetworkStatus = () => useContext(NetworkStatusContext);

interface NetworkStatusProviderProps {
  children: ReactNode;
}

export const NetworkStatusProvider: React.FC<NetworkStatusProviderProps> = ({ 
  children 
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isConnectionSlow, setIsConnectionSlow] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Reconnected to the network.');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline. Some features may be unavailable.');
    };

    // Check connection speed periodically but don't show toast notification
    const checkConnectionSpeed = async () => {
      try {
        const startTime = Date.now();
        const response = await fetch('/favicon.ico', { 
          cache: 'no-store',
          method: 'HEAD' 
        });
        
        if (response.ok) {
          const endTime = Date.now();
          const duration = endTime - startTime;
          const isSlow = duration > 1000; // Consider slow if > 1 second
          
          if (isSlow !== isConnectionSlow) {
            setIsConnectionSlow(isSlow);
            // Removed the toast notification for slow connection
          }
        }
      } catch (error) {
        console.error('Error checking connection speed:', error);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check connection speed initially and then every 30 seconds
    const intervalId = setInterval(checkConnectionSpeed, 30000);
    checkConnectionSpeed();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [isConnectionSlow]);

  return (
    <NetworkStatusContext.Provider value={{ isOnline, isConnectionSlow }}>
      {children}
    </NetworkStatusContext.Provider>
  );
};

export default NetworkStatusProvider;
