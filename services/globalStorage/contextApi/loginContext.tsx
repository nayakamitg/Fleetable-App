import { createContext, useContext, useState } from "react";
import { useSelector } from "react-redux";

const LoginContext = createContext({
    loggedIn: false,
    user: null,
    loading: false,
    error: null,
});

const LoginContextProvider = ({ children }: { children: React.ReactNode }) => {
    const { loggedIn ,user,loading,error } = useSelector((state: any) => state.login);
    return (
        <LoginContext.Provider value={{
            loggedIn,
            user,
            loading,
            error
        }}>
            {children}
        </LoginContext.Provider>
    );
};

const useLoginContext = () => {
    const context = useContext(LoginContext);
    if (!context) {
        throw new Error('useLoginContext must be used within a LoginContextProvider');
    }
    return context;
};

export { LoginContext, LoginContextProvider, useLoginContext };