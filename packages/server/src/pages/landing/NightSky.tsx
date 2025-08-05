import { motion } from "framer-motion";

// Night Sky Component - Optimized for Performance
const NightSky = () => {
  // Reduced number of stars for better performance
  const stars = [
    { size: 2, x: "15%", y: "25%", delay: 0, duration: 3, brightness: "bright" },
    { size: 1, x: "85%", y: "15%", delay: 1, duration: 4, brightness: "dim" },
    { size: 3, x: "25%", y: "70%", delay: 2, duration: 2, brightness: "bright" },
    { size: 2, x: "75%", y: "80%", delay: 0.5, duration: 5, brightness: "medium" },
    { size: 1, x: "50%", y: "10%", delay: 3, duration: 3, brightness: "dim" },
    { size: 4, x: "90%", y: "60%", delay: 1.5, duration: 4, brightness: "bright" },
    { size: 2, x: "10%", y: "50%", delay: 2.5, duration: 3, brightness: "medium" },
    { size: 3, x: "70%", y: "30%", delay: 0.8, duration: 6, brightness: "bright" },
    { size: 1, x: "35%", y: "85%", delay: 1.2, duration: 4, brightness: "dim" },
    { size: 2, x: "60%", y: "45%", delay: 2.8, duration: 3, brightness: "medium" },
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
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Twinkling Stars - Optimized with CSS animations */}
      {stars.map((star, index) => {
        const brightness = getStarBrightness(star.brightness);
        return (
          <motion.div
            key={`star-${index}`}
            className="absolute rounded-full bg-white shadow-lg"
            style={{
              width: `${star.size * 2}px`,
              height: `${star.size * 2}px`,
              left: star.x,
              top: star.y,
              boxShadow: `0 0 ${star.size * 3}px rgba(255, 255, 255, 0.8)`,
              willChange: 'opacity, transform',
              transform: 'translate3d(0, 0, 0)', // Force GPU acceleration
            }}
            animate={{
              opacity: brightness.opacity,
              scale: brightness.scale,
            }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* Static Stars - Non-animated for better performance */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={`static-star-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.2,
              boxShadow: `0 0 ${Math.random() * 3 + 1}px rgba(255, 255, 255, 0.6)`,
            }}
          />
        ))}
      </div>

      {/* Constellation Lines - Static for performance */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.05 }}>
        <defs>
          <linearGradient id="constellationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.2)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </linearGradient>
        </defs>
        <line x1="15%" y1="25%" x2="25%" y2="70%" stroke="url(#constellationGradient)" strokeWidth="0.5" />
        <line x1="85%" y1="15%" x2="75%" y2="80%" stroke="url(#constellationGradient)" strokeWidth="0.5" />
        <line x1="50%" y1="10%" x2="70%" y2="30%" stroke="url(#constellationGradient)" strokeWidth="0.5" />
      </svg>
    </div>
  );
};

export default NightSky; 