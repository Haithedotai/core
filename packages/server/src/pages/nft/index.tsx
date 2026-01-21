import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "@tanstack/react-router";
import { cn } from "../../lib/utils";
import Icon from "@/src/lib/components/custom/Icon";
import type { icons } from "lucide-react";


const NightSky = ({ isHovering }: { isHovering?: boolean }) => {
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
                        animate={{
                            opacity: isHovering ? [0.6, 1, 0.6] : brightness.opacity,
                            scale: isHovering ? [1, 1.8, 1] : brightness.scale
                        }}
                        transition={{
                            duration: isHovering ? star.duration / 2 : star.duration,
                            delay: star.delay,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                );
            })}
        </div>
    );
};


export const NFTPage = () => {


    const [isHovering, setIsHovering] = useState(false);

    return (
        <div className="relative h-screen min-h-[600px] w-full bg-black overflow-hidden font-manrope text-white">
            <motion.div
                animate={isHovering ? {
                    x: [0, -1, 1, -1, 1, 0],
                    y: [0, 1, -1, 1, -1, 0],
                } : {}}
                transition={{
                    duration: 0.2,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="relative h-full w-full flex flex-col justify-between p-6 md:p-12"
            >
                {/* Haithe Logo - Top Left */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="fixed top-6 left-6 md:top-12 md:left-12 z-[100]"
                >
                    <Link to="/" className="group flex items-center gap-2 md:gap-3">
                        <div className="relative h-8 w-8 md:h-10 md:w-10 flex items-center justify-center">
                            <div className="absolute inset-0 bg-white/10 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700 opacity-0 group-hover:opacity-100" />
                            <img
                                src="/static/haitheLogo.webp"
                                alt="Haithe Logo"
                                className="w-7 h-7 md:w-9 md:h-9 object-cover rounded-full relative z-10 hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                            />
                        </div>
                        <span className="text-lg md:text-2xl font-medium tracking-tight text-white/90 group-hover:text-white transition-colors hidden sm:block">Haithe</span>
                    </Link>
                </motion.div>
                {/* ... Background Layers ... */}
                <div className="absolute inset-0 z-0">
                    <motion.video
                        animate={{
                            opacity: isHovering ? 0.4 : 0.2,
                            scale: isHovering ? 1.05 : 1
                        }}
                        transition={{ duration: 0.5 }}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        src="/static/haitheAI.mp4"
                    />
                    <motion.div
                        animate={{
                            backgroundColor: isHovering ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.8)"
                        }}
                        className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/90 shadow-[inset_0_0_100px_rgba(255,235,183,0.1)]"
                    />
                    <NightSky isHovering={isHovering} />
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                    />
                    {/* Reactive Launch Glow */}
                    <AnimatePresence>
                        {isHovering && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1.2 }}
                                exit={{ opacity: 0, scale: 1.5 }}
                                className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,235,183,0.15)_0%,transparent_70%)] pointer-events-none"
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* 1. Header Section */}
                <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="relative z-10 flex flex-col items-center mt-12 md:mt-0"
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
                    <motion.a
                        href="https://opensea.io/collection/haithedotai/overview"
                        target="_blank"
                        rel="noopener noreferrer"
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 17
                        }}
                        className="relative group w-full max-w-lg px-8 py-6 md:py-10 rounded-2xl md:rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden hover:border-white/20 transition-all flex items-center justify-center"
                    >
                        {/* Animated Shine Effect */}
                        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                        {/* Glow Backlight */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-orange-600/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <span className="relative z-10 text-5xl md:text-9xl font-black tracking-tighter bg-gradient-to-br from-[#FFEBB7] via-[#E1C07E] to-[#AD8E3D] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(225,192,126,0.3)] select-none">
                            MINT
                        </span>

                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.a>

                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-6 md:mt-12 text-3xl md:text-6xl lg:text-7xl font-light text-center max-w-4xl tracking-tight leading-[1.1]"
                    >
                        The many faces of <span className="bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-transparent font-semibold">Haithe.</span>
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-8 flex items-center gap-3 px-4 py-2 border border-amber-500/20 rounded-full bg-amber-500/5 backdrop-blur-sm"
                    >
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-amber-300">NFT Collection Loading</span>
                    </motion.div>
                </div>

                {/* 3. Bottom Footer (Features & CTA) */}
                <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-white/5">

                    {/* Compact Feature Row */}
                    <motion.div
                        initial="initial"
                        animate="animate"
                        transition={{ staggerChildren: 0.05, delayChildren: 0.5 }}
                        className="grid grid-cols-2 md:flex md:flex-wrap justify-center md:justify-start gap-x-8 md:gap-x-10 gap-y-4 md:gap-y-6"
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
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] uppercase tracking-widest font-bold text-white/50">Chain Verified</span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};