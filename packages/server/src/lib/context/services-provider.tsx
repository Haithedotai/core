import HaitheClient from "../../../../../services/interface";
import { createContext, useContext } from "react";
import { useWalletClient } from "wagmi";

const HaitheContext = createContext<HaitheClient | null>(null);

export function ServicesProvider({ children }: { children: React.ReactNode }) {
    const { data: walletClient } = useWalletClient();

    if (!walletClient) {
        return null;
    }

    const client = new HaitheClient({
        walletClient: walletClient,
        baseUrl: process.env.BUN_PUBLIC_RUST_SERVER_URL!,
        debug: true,
    });

    return (
        <HaitheContext.Provider value={client}>
            {children}
        </HaitheContext.Provider>
    )
}

export const useHaitheClient = () => {
    const context = useContext(HaitheContext);
    if (!context) {
        throw new Error("useHaitheClient must be used within a ServicesProvider");
    }
    return context;
};