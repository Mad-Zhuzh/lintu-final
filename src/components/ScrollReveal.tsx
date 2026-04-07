import { useEffect, useRef, type ReactNode, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  delay?: 0 | 1 | 2 | 3;
}

export const ScrollReveal = ({ children, delay = 0, className, ...props }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("animate-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("animate-on-scroll", delay && `delay-${delay}`, className)}
      {...props}
    >
      {children}
    </div>
  );
};
