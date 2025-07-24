import HaitheClient from "../../../../../services/interface";
import { createContext, useContext } from "react";
import { useWalletClient } from "wagmi";

const HaitheContext = createContext<HaitheClient | null>(null);

export function ServicesProvider({ children }: { children: React.ReactNode }) {
    const { data: walletClient } = useWalletClient();

    // Always provide the context, but with null client when wallet is disconnected
    let client: HaitheClient | null = null;
    
    if (walletClient) {
        client = new HaitheClient({
            walletClient: walletClient,
            baseUrl: process.env.BUN_PUBLIC_RUST_SERVER_URL!,
            debug: true,
        })

        client.persistentStorage = localStorage;
    }

    return (
        <HaitheContext.Provider value={client}>
            {children}
        </HaitheContext.Provider>
    )
}

export const useHaitheClient = () => {
    return useContext(HaitheContext);
};