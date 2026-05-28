import { createContext, useContext, useState } from "react";

interface NotificationContextType {
  count: number;
  increment: () => void;
  markAsRead: (amount: number) => void;
  setCount: (n: number) => void;
}

const NotificationContext = createContext<NotificationContextType>({ 
  count: 0, 
  increment: () => {}, 
  markAsRead: (_amount: number) => {},
  setCount: (_n: number) => {},
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [count, setCountState] = useState(0);
  
  return (
    <NotificationContext.Provider value={{ 
      count, 
      increment: () => setCountState(c => c + 1),
      markAsRead: (amount) => setCountState(c => Math.max(0, c - amount)),
      // setCount dipakai AppLayout untuk seed initial count dari DB
      setCount: (n) => setCountState(n),
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
