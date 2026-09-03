import { useEffect, useState } from "react";
import { Download, X, Share, SquarePlus } from "lucide-react";

const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);
const isInStandaloneMode = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    const alreadyDismissed = sessionStorage.getItem("wtb_install_dismissed");
    if (alreadyDismissed || isInStandaloneMode()) return;

    if (isIos()) {
      // iOS Safari has no beforeinstallprompt event at all — show
      // manual "Add to Home Screen" instructions instead.
      setShowIosInstructions(true);
      setVisible(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem("wtb_install_dismissed", "1");
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-2xl bg-navy flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src="/logo.png"
              alt="Swiss Meridian Bank"
              className="h-full w-full object-cover"
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-navy-900 text-sm">
              Install Swiss Meridian Bank
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {showIosInstructions
                ? "Add to your home screen for quick, one-tap access anytime"
                : "Install for faster access, offline support, and a full-screen experience"}
            </p>
          </div>
          <button
            onClick={dismiss}
            className="text-slate-400 hover:text-navy transition shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {showIosInstructions ? (
          <div className="mt-3 bg-slate-50 rounded-xl p-3 space-y-2">
            <p className="text-xs text-slate-600 flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-navy text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                1
              </span>
              Tap the <Share size={14} className="inline text-navy" /> Share
              icon in Safari's toolbar
            </p>
            <p className="text-xs text-slate-600 flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-navy text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                2
              </span>
              Scroll down and tap{" "}
              <SquarePlus size={14} className="inline text-navy" /> "Add to Home
              Screen"
            </p>
          </div>
        ) : (
          <button
            onClick={install}
            className="w-full mt-3 bg-navy hover:bg-navy-700 text-white font-semibold rounded-xl py-2.5 flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <Download size={16} /> Install App
          </button>
        )}
      </div>
    </div>
  );
};

export default InstallPrompt;
