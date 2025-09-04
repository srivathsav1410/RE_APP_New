import React, { createContext, useState, useContext } from "react";

type User = {
  userId: string;
  userName: string;
  phoneNumber: string;
  userRole: string;
};

type Address = {
  street: string;
  city: string;
  state: string;
  pincode: string;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  address: Address | null;
  setAddress: (address: Address | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [address, setAddress] = useState<Address | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser, address, setAddress }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used inside UserProvider");
  return context;
};
