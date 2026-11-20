import { motion } from "framer-motion";
// From Amicro (MIT, see ./LICENSE): https://github.com/Subhan-code/Amicro--Micro-transitions-
import React from "react";

interface FadeUpProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  yOffset?: number;
  className?: string;
}

export function FadeUp({
  children,
  duration = 0.6,
  delay = 0,
  yOffset = 20,
  className = "",
}: FadeUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1] as const, // easeOutExpo
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
