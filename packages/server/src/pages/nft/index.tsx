import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "@tanstack/react-router";
import { cn } from "../../lib/utils";
import Icon from "@/src/lib/components/custom/Icon";
import type { icons } from "lucide-react";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/src/lib/components/ui/button";

// --- Hooks ---

const useCountdown = (targetDate: Date) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const calculate = () => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            }
        };

        const timer = setInterval(calculate, 1000);
        calculate();
        return () => clearInterval(timer);
    }, [targetDate]);

    return timeLeft;
};

// --- Components ---

const CountdownUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center mx-4 md:mx-8">
        <div className="relative h-14 md:h-24 overflow-hidden flex items-center justify-center">
            <AnimatePresence mode="popLayout">
                <motion.span
                    key={value}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                    }}
                    className="text-5xl md:text-8xl font-bold font-mono tracking-tighter text-foreground block"
                >
                    {value.toString().padStart(2, '0')}
                </motion.span>
            </AnimatePresence>
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground mt-2">
            {label}
        </span>
    </div>
);

const NightSky = () => {
    const stars = [
        { size: 2, x: "15%", y: "25%", delay: 0, duration: 3, brightness: "bright" },
        { size: 1, x: "85%", y: "15%", delay: 1, duration: 4, brightness: "dim" },
        { size: 3, x: "25%", y: "70%", delay: 2, duration: 2, brightness: "bright" },
        { size: 2, x: "75%", y: "80%", delay: 0.5, duration: 5, brightness: "medium" },
        { size: 1, x: "50%", y: "10%", delay: 3, duration: 3, brightness: "dim" },
        { size: 4, x: "90%", y: "60%", delay: 1.5, duration: 4, brightness: "bright" },
        { size: 2, x: "10%", y: "50%", delay: 2.5, duration: 3, brightness: "medium" },
        { size: 3, x: "70%", y: "30%", delay: 0.8, duration: 6, brightness: "bright" },
    ];

    const getStarBrightness = (brightness: string) => {
        switch (brightness) {
            case "bright": return { opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] };
            case "medium": return { opacity: [0.2, 0.8, 0.2], scale: [1, 1.2, 1] };
            case "dim": return { opacity: [0.1, 0.5, 0.1], scale: [1, 1.1, 1] };
            default: return { opacity: [0.2, 0.7, 0.2], scale: [1, 1.2, 1] };
        }
    };

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
            {stars.map((star) => {
                const brightness = getStarBrightness(star.brightness);
                return (
                    <motion.div
                        key={`star-${star.x}-${star.y}`}
                        className="absolute rounded-full bg-white shadow-lg"
                        style={{
                            width: `${star.size * 2}px`,
                            height: `${star.size * 2}px`,
                            left: star.x,
                            top: star.y,
                            boxShadow: `0 0 ${star.size * 3}px rgba(255, 255, 255, 0.8)`,
                        }}
                        animate={{ opacity: brightness.opacity, scale: brightness.scale }}
                        transition={{ duration: star.duration, delay: star.delay, repeat: Infinity, ease: "easeInOut" }}
                    />
                );
            })}
        </div>
    );
};


export const NFTPage = () => {
    // Setting target to 7 days from now for demo
    const [target] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    const { days, hours, minutes, seconds } = useCountdown(target);

    const { authenticated, login: privyLogin } = usePrivy();
    const api = useHaitheApi();
    const { signupToWaitlist } = api;
    const [email, setEmail] = useState("");
    const [showInput, setShowInput] = useState(false);

    // Sync showInput with auth state
    const isHaitheLoggedIn = api.isLoggedIn();

    const handleInitialClick = () => {
        if (!authenticated || !isHaitheLoggedIn) {
            localStorage.clear();
            privyLogin();
            return;
        }
        setShowInput(true);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        signupToWaitlist.mutate(email, {
            onSuccess: () => {
                setEmail("");
                setShowInput(false);
            }
        });
    };

    return (
        <div className="relative h-screen min-h-[600px] w-full bg-black overflow-hidden font-manrope flex flex-col justify-between p-6 md:p-12 text-white">
            {/* Haithe Logo - Top Left */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="fixed top-8 left-8 md:top-12 md:left-12 z-[100]"
            >
                <Link to="/" className="group flex items-center gap-3">
                    <div className="relative h-10 w-10 flex items-center justify-center">
                        <div className="absolute inset-0 bg-white/10 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700 opacity-0 group-hover:opacity-100" />
                        <img
                            src="/static/haitheLogo.webp"
                            alt="Haithe Logo"
                            className="w-9 h-9 object-cover rounded-full relative z-10 hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        />
                    </div>
                    <span className="text-2xl font-medium tracking-tight text-white/90 group-hover:text-white transition-colors">Haithe</span>
                </Link>
            </motion.div>
            {/* ... Background Layers ... */}
            <div className="absolute inset-0 z-0">
                <video
                    className="absolute top-0 left-0 w-full h-full object-cover opacity-20"
                    autoPlay
                    muted
                    loop
                    playsInline
                    src="/static/haitheAI.mp4"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90" />
                <NightSky />
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />
            </div>

            {/* 1. Header Section */}
            <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="relative z-10 flex flex-col items-center"
            >
                <div className="flex relative mb-8">
                    {[
                        { src: "/static/metis.svg", title: "Metis" },
                        { src: "/static/alith.webp", title: "Alith" },
                        { src: "/static/hyp-3.webp", title: "Hyperion" },
                    ].map((logo) => (
                        <motion.img
                            key={logo.title}
                            src={logo.src}
                            alt={logo.title}
                            title={logo.title}
                            className={cn(
                                "size-16 object-cover rounded-full bg-secondary p-0.5 border-2 border-white/10 shadow-xl",
                                logo.title !== "Metis" && "-ml-3"
                            )}
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 4, delay: Math.random(), repeat: Infinity, ease: "easeInOut" }}
                        />
                    ))}
                </div>

                <div className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-[10px] md:text-xs mb-4 backdrop-blur-sm hover:bg-white/8 transition-all duration-200">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mr-3 animate-pulse" />
                    <span className="text-white/80 font-bold uppercase tracking-[0.3em]">
                        Haithe NFT Launch
                    </span>
                </div>
            </motion.div>

            {/* 2. Central Hero (Countdown) */}
            <div className="relative z-10 flex flex-col items-center">
                <motion.div
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="flex flex-col items-center justify-center p-8 md:p-12 rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-md"
                >
                    <div className="flex items-center">
                        <CountdownUnit value={days} label="Days" />
                        <span className="text-3xl md:text-6xl font-light text-white/10 mt-[-20px] md:mt-[-40px] px-1 md:px-2">:</span>
                        <CountdownUnit value={hours} label="Hours" />
                        <span className="text-3xl md:text-6xl font-light text-white/10 mt-[-20px] md:mt-[-40px] px-1 md:px-2">:</span>
                        <CountdownUnit value={minutes} label="Minutes" />
                        <span className="text-3xl md:text-6xl font-light text-white/10 mt-[-20px] md:mt-[-40px] px-1 md:px-2">:</span>
                        <CountdownUnit value={seconds} label="Seconds" />
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-12 text-4xl md:text-6xl lg:text-7xl font-light text-center max-w-4xl tracking-tight leading-none"
                >
                    The many faces of <span className="bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-transparent font-semibold">Haithe.</span>
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 flex items-center gap-3 px-4 py-2 border border-blue-500/20 rounded-full bg-blue-500/5 backdrop-blur-sm"
                >
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_12px_rgba(96,165,250,0.8)]" />
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-blue-300">NFT Collection Loading</span>
                </motion.div>
            </div>

            {/* 3. Bottom Footer (Features & CTA) */}
            <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-white/5">

                {/* Compact Feature Row */}
                <motion.div
                    initial="initial"
                    animate="animate"
                    transition={{ staggerChildren: 0.05, delayChildren: 0.5 }}
                    className="flex flex-wrap justify-center md:justify-start gap-x-10 gap-y-4"
                >
                    {[
                        { icon: "User" as keyof typeof icons, title: "Identity", color: "text-blue-400" },
                        { icon: "Rabbit" as keyof typeof icons, title: "Rare", color: "text-purple-400" },
                        { icon: "Palette" as keyof typeof icons, title: "Unique", color: "text-pink-400" },
                        { icon: "ImagePlay" as keyof typeof icons, title: "Fun", color: "text-orange-400" }
                    ].map((item) => (
                        <motion.div
                            key={item.title}
                            variants={{ initial: { y: 10, opacity: 0 }, animate: { y: 0, opacity: 1 } }}
                            className="flex items-center gap-3 group translate-y-0 hover:translate-y-[-2px] transition-transform duration-300"
                        >
                            <div className={cn("p-1.5 rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors uppercase", item.color)}>
                                <Icon name={item.icon} className="w-4 h-4" />
                            </div>
                            <span className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-white/50 group-hover:text-white transition-colors">{item.title}</span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Main CTA */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col items-center md:items-end w-full md:w-auto"
                >
                    <AnimatePresence mode="wait">
                        {(!authenticated || !isHaitheLoggedIn || !showInput) ? (
                            <Button
                                variant="pill"
                                size="pill"
                                asChild
                                onClick={handleInitialClick}
                                className="z-10"
                            >
                                <motion.button
                                    key="join-btn"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    type="button"
                                >
                                    {(!authenticated || !isHaitheLoggedIn) ? "Connect Wallet" : "Join Waitlist"}
                                    <span className="absolute right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-6px] group-hover:translate-x-0">→</span>
                                </motion.button>
                            </Button>
                        ) : (
                            <motion.form
                                key="email-form"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                onSubmit={handleSignup}
                                className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 p-1 rounded-full w-full max-w-[300px]"
                            >
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-transparent border-none outline-none px-4 py-2 text-xs w-full placeholder:text-white/30"
                                    required
                                />
                                <button
                                    disabled={signupToWaitlist.isPending}
                                    type="submit"
                                    className="bg-white text-black text-[9px] font-bold uppercase tracking-widest px-4 py-2 rounded-full hover:bg-white/90 transition-colors disabled:opacity-50"
                                >
                                    {signupToWaitlist.isPending ? "..." : "Join"}
                                </button>
                            </motion.form>
                        )
                        }
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};