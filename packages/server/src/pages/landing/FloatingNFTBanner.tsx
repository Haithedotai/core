import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Button } from "@/src/lib/components/ui/button";

export const FloatingNFTBanner = () => {
    return (
        <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 1, ease: "circInOut", type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-28 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[90vw] md:max-w-xl px-4 group"
        >
            <div className="relative p-[1px] overflow-hidden rounded-2xl">
                {/* Rotating Border Trace */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,rgba(255,255,255,0.4)_330deg,transparent_360deg)]"
                />

                <div className="relative overflow-hidden rounded-2xl bg-[#161616] border border-white/10 backdrop-blur-3xl p-3 md:p-4 flex items-center justify-between gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    {/* Periodic Flash Effect */}
                    <motion.div
                        initial={{ left: "-100%" }}
                        animate={{ left: "200%" }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "loop",
                            ease: "easeInOut",
                            repeatDelay: 3,
                        }}
                        className="absolute inset-y-0 w-1/2 pointer-events-none bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-30deg] z-20"
                    />

                    {/* Background Ambient Pulse */}
                    <motion.div
                        animate={{ opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"
                    />

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center p-1 backdrop-blur-sm">
                                <motion.img
                                    src="/static/haitheLogo.webp"
                                    className="w-full h-full object-cover rounded-xl shadow-2xl"
                                />
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-black animate-pulse" />
                        </div>

                        <div className="flex flex-col">
                            <h4 className="text-white font-bold text-sm tracking-tight leading-none">Haithe NFT Mint</h4>
                            <p className="text-white/40 text-[9px] uppercase tracking-[0.2em] font-black mt-1.5 flex items-center gap-2">
                                Waitlist now open
                            </p>
                        </div>
                    </div>

                    <Button
                        asChild
                        variant="pill"
                        size="pill"
                        className="relative z-10"
                    >
                        <Link to="/mint">
                            Secure Spot
                            <span className="absolute right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-6px] group-hover:translate-x-0">→</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};
