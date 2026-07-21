import React, { createContext, useContext } from 'react';

const AdvancedChatContext = createContext();

export const useAdvancedChat = () => {
  return useContext(AdvancedChatContext);
};

export const AdvancedChatProvider = ({ value, children }) => {
  return (
    <AdvancedChatContext.Provider value={value}>
      {children}
    </AdvancedChatContext.Provider>
  );
};

export default AdvancedChatContext;
