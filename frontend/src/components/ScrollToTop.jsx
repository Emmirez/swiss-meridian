import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollToTop();
    const raf = requestAnimationFrame(scrollToTop);
    const timeout = setTimeout(scrollToTop, 50);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;