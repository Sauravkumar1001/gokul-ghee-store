import { motion, useReducedMotion } from 'framer-motion';

export const GG_EASE = [0.22, 1, 0.36, 1];
export const GG_VIEWPORT = { once: true, amount: 'some' };

/**
 * Scroll-triggered / mount Fade-Up animation respecting prefers-reduced-motion.
 */
export function FadeUp({
  children,
  delay = 0,
  duration = 0.55,
  distance = 22,
  inView = true,
  className = '',
  as = 'div',
  ...props
}) {
  const prefersReduced = useReducedMotion();
  const MotionTag = motion[as] || motion.div;

  const initial = prefersReduced ? { opacity: 0 } : { opacity: 0, y: distance };
  const target = prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 };
  const transition = {
    duration: prefersReduced ? 0.15 : duration,
    delay: prefersReduced ? 0 : delay,
    ease: GG_EASE,
  };

  if (!inView) {
    return (
      <MotionTag
        initial={initial}
        animate={target}
        transition={transition}
        className={className}
        {...props}
      >
        {children}
      </MotionTag>
    );
  }

  return (
    <MotionTag
      initial={initial}
      whileInView={target}
      viewport={GG_VIEWPORT}
      transition={transition}
      className={className}
      {...props}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Directional Reveal helper respecting prefers-reduced-motion.
 */
export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 24,
  className = '',
  ...props
}) {
  const prefersReduced = useReducedMotion();

  const offset = prefersReduced
    ? {}
    : direction === 'left'
    ? { x: -distance }
    : direction === 'right'
    ? { x: distance }
    : direction === 'down'
    ? { y: -distance }
    : direction === 'none'
    ? {}
    : { y: distance };

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={GG_VIEWPORT}
      transition={{
        duration: prefersReduced ? 0.15 : duration,
        delay: prefersReduced ? 0 : delay,
        ease: GG_EASE,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Container coordinating staggered entrance of StaggerItem children.
 */
export function StaggerGroup({
  children,
  staggerDelay = 0.08,
  delayChildren = 0.05,
  inView = true,
  className = '',
  ...props
}) {
  const prefersReduced = useReducedMotion();

  const variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReduced ? 0 : staggerDelay,
        delayChildren: prefersReduced ? 0 : delayChildren,
      },
    },
  };

  if (!inView) {
    return (
      <motion.div
        variants={variants}
        initial="hidden"
        animate="visible"
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={GG_VIEWPORT}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, distance = 18, className = '', ...props }) {
  const prefersReduced = useReducedMotion();

  const variants = {
    hidden: prefersReduced ? { opacity: 0 } : { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReduced ? 0.15 : 0.5,
        ease: GG_EASE,
      },
    },
  };

  return (
    <motion.div variants={variants} className={className} {...props}>
      {children}
    </motion.div>
  );
}
