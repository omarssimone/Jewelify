import React, { createContext, useContext, useState } from "react";

const HeaderContext = createContext(null);

export const HeaderProvider = ({ children }) => {
  const [left, setLeft] = useState(null);
  const [right, setRight] = useState(null);

  return (
    <HeaderContext.Provider value={{ left, right, setLeft, setRight }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  const ctx = useContext(HeaderContext);
  if (!ctx) throw new Error("useHeader must be used within HeaderProvider");
  return ctx;
};

export default HeaderContext;
