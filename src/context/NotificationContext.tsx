import { createContext, useContext, useState } from "react";

const NotificationContext = createContext({ 
  count: 0, 
  increment: () => {}, 
  markAsRead: (amount: number) => {} 
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [count, setCount] = useState(0);
  
  return (
    <NotificationContext.Provider value={{ 
      count, 
      increment: () => setCount(c => c + 1),
      markAsRead: (amount) => setCount(c => Math.max(0, c - amount)) 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
export const useNotification = () => useContext(NotificationContext);