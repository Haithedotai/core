import HaitheClient from "../../../../../services/interface";
import { createContext, useContext } from "react";
import { useWalletClient } from "wagmi";

interface HaitheContextValue {
  client: HaitheClient | null;
  isInitialized: boolean;
}

const HaitheContext = createContext<HaitheContextValue>({ client: null, isInitialized: false });

export function ServicesProvider({ children }: { children: React.ReactNode }) {
    const { data: walletClient } = useWalletClient();

    // Always provide the context, but with null client when wallet is disconnected
    let client: HaitheClient | null = null;
    let isInitialized = false;
    
    if (walletClient) {
        console.log('ServicesProvider: Creating HaitheClient');
        console.log('ServicesProvider: localStorage authToken:', localStorage.getItem('authToken'));
        
        client = new HaitheClient({
            walletClient: walletClient,
            baseUrl: process.env.BUN_PUBLIC_RUST_SERVER_URL!,
            debug: true,
        });

        // Set persistent storage immediately during initialization
        console.log('ServicesProvider: Setting persistent storage');
        console.log('ServicesProvider: Auth state before setting storage:', {
            isLoggedIn: client.isLoggedIn(),
            hasToken: !!client.getAuthToken()
        });
        
        client.persistentStorage = localStorage;
        
        // Mark as initialized immediately after setting persistent storage
        isInitialized = true;
        
        // Log current auth state
        console.log('ServicesProvider: Auth state after setting storage:', {
            isLoggedIn: client.isLoggedIn(),
            hasToken: !!client.getAuthToken(),
            authToken: client.getAuthToken()?.substring(0, 20) + '...',
            isInitialized
        });
    }

    return (
        <HaitheContext.Provider value={{ client, isInitialized }}>
            {children}
        </HaitheContext.Provider>
    );
}

export function useHaitheClient(): HaitheClient | null {
    const context = useContext(HaitheContext);
    return context.client;
}

export function useHaitheContext(): HaitheContextValue {
    return useContext(HaitheContext);
}