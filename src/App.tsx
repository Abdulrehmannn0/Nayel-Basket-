import { useState, useEffect, lazy, Suspense } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar } from "./components/Navbar";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home as HomeIcon, 
  Layers, 
  Heart, 
  ShoppingBag, 
  User, 
  Sparkles,
  ArrowLeft,
  ClipboardList
} from "lucide-react";

// Lazy-loaded components for lightning-fast initial load times
const AdminLogin = lazy(() => import("./components/AdminLogin").then(m => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import("./components/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const CustomerShop = lazy(() => import("./components/CustomerShop").then(m => ({ default: m.CustomerShop })));
const SellerPanel = lazy(() => import("./components/SellerPanel").then(m => ({ default: m.SellerPanel })));

interface AdminUser {
  email: string;
  role: "super_admin" | "admin" | "manager" | "staff" | "customer";
}

// Premium visual preloader fallback
const ShimmerLoader = () => (
  <div className="flex flex-col items-center justify-center p-12 space-y-4 w-full h-full min-h-[400px]">
    <div className="w-16 h-16 border-2 border-[#22C55E]/10 border-t-[#22C55E] rounded-full animate-spin"></div>
    <span className="text-[10px] font-mono tracking-[0.2em] text-[#22C55E] animate-pulse">
      Curating Space Configuration...
    </span>
  </div>
);

// Simple reactive router hook for zero-dependency client-side routing
function useRoute() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen to standard popstate
    window.addEventListener("popstate", handleLocationChange);
    // Listen to our custom pushstate event
    window.addEventListener("pushstate-changed", handleLocationChange);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("pushstate-changed", handleLocationChange);
    };
  }, []);

  const navigate = (path: string) => {
    window.history.pushState(null, "", path);
    setCurrentPath(path);
    window.dispatchEvent(new Event("pushstate-changed"));
  };

  return { currentPath, navigate };
}

// Simple high-performance symmetric encryption for local session payloads
function encryptSession(data: any): string {
  const json = JSON.stringify(data);
  const shifted = json.split("").map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ (42 + (i % 7)))).join("");
  return btoa(unescape(encodeURIComponent(shifted)));
}

function decryptSession(encrypted: string): any {
  try {
    const decoded = decodeURIComponent(escape(atob(encrypted)));
    const unshifted = decoded.split("").map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ (42 + (i % 7)))).join("");
    return JSON.parse(unshifted);
  } catch (err) {
    return null;
  }
}

function MainAppOrchestration() {
  const { currentPath, navigate } = useRoute();
  const { cart, wishlist, theme } = useApp();

  // Active section inside the Customer Shop (added "orders")
  const [activeSection, setActiveSection] = useState<"home" | "categories" | "wishlist" | "cart" | "profile" | "ai" | "orders" >("home");
  const [showSellerPanel, setShowSellerPanel] = useState(false);

  // Splash Screen State (persisted per session so it only plays on fresh load)
  const [showSplash, setShowSplash] = useState(() => {
    const played = sessionStorage.getItem("nb_splash_played");
    return played ? false : true;
  });

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        setActiveSection("home");
        sessionStorage.setItem("nb_splash_played", "true");
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  // Admin session state using encrypted sessions
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem("nb_admin_session_secure");
    return saved ? decryptSession(saved) : null;
  });

  const handleLoginSuccess = (role: "super_admin" | "admin" | "manager" | "staff" | "customer", email: string) => {
    const newUser: AdminUser = { email, role };
    setUser(newUser);
    localStorage.setItem("nb_admin_session_secure", encryptSession(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("nb_admin_session_secure");
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  // Decide what to render based on URL Path
  const isAdminRoute = currentPath.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] text-black font-sans antialiased relative">
        {/* Float action button to go back to shop */}
        <button
          id="btn-admin-to-shop"
          onClick={() => navigate("/")}
          className="fixed top-4 left-4 z-50 bg-white hover:bg-neutral-50 border border-slate-200 text-black text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-1.5 shadow-md cursor-pointer transition duration-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>BACK TO SHOP</span>
        </button>

        <Suspense fallback={<ShimmerLoader />}>
          {user ? (
            <AdminDashboard adminUser={user} onLogout={handleLogout} />
          ) : (
            <div className="pt-16">
              <AdminLogin onLoginSuccess={handleLoginSuccess} />
            </div>
          )}
        </Suspense>
      </div>
    );
  }

  // Render Seller Panel Mode
  if (showSellerPanel) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] text-black font-sans antialiased">
        <Suspense fallback={<ShimmerLoader />}>
          <SellerPanel onBack={() => setShowSellerPanel(false)} />
        </Suspense>
      </div>
    );
  }

  return (
    <>
      {/* Splash Screen Animation */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
            className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center text-center p-8 select-none transition-colors duration-500 ${
              theme === "dark" ? "bg-[#0D0D0D]" : "bg-[#FFFFFF]"
            }`}
          >
            <motion.div
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: [0.75, 1.05, 1], opacity: 1 }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              {/* Official Nayel Basket logo with high-fidelity vector */}
              <div className="relative w-36 h-36 md:w-40 md:h-40 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center p-2 bg-neutral-950 dark:bg-black border border-neutral-800">
                <img 
                  src="/icon-512.jpg" 
                  alt="Nayel Basket" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="mt-8 space-y-2">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-[0.25em] text-neutral-900 dark:text-[#22C55E] uppercase font-sans">
                  Nayel Basket
                </h1>
                <p className="text-xs md:text-sm font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-[0.2em] font-mono">
                  Premium Home Decor & Furniture
                </p>
              </div>

              {/* Premium Loading Animation */}
              <div className="w-56 h-1 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden mt-10 relative">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                  className="absolute inset-y-0 left-0 bg-[#22C55E] w-full rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main App Desktop-First Shell with translate-z-0 trick to clamp fixed elements inside the mock viewport */}
      <div className="min-h-screen bg-neutral-100 dark:bg-[#111111] flex flex-col justify-center items-center font-sans antialiased text-black dark:text-white transition-colors duration-300">
        <div className="w-full max-w-[480px] min-h-screen md:min-h-[92vh] md:max-h-[92vh] md:my-4 bg-white dark:bg-[#111111] shadow-2xl relative flex flex-col overflow-hidden md:rounded-[2.5rem] md:border-8 border-slate-900 dark:border-[#222222] transform translate-z-0">
          
          {/* Header Navbar */}
          <Navbar 
            activeSection={activeSection} 
            setActiveSection={setActiveSection} 
          />

          {/* Main Scrollable Content Area */}
          <main className="flex-1 overflow-y-auto scrollbar-hide pb-28">
            <Suspense fallback={<ShimmerLoader />}>
              <CustomerShop 
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                onSelectSeller={() => setShowSellerPanel(true)}
                onSelectAdmin={() => navigate("/admin")}
              />
            </Suspense>
          </main>

          {/* Mobile-Native Bottom Floating Navigation Bar with Premium iOS/Android Safe Area Styling */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-xl border border-slate-200/40 dark:border-neutral-850 rounded-3xl py-3 px-4 shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_50px_rgba(0,0,0,0.5)] flex items-center justify-between transition-all duration-300 pb-[calc(12px+env(safe-area-inset-bottom))]">
            <button
              id="mobile-nav-home"
              onClick={() => {
                setActiveSection("home");
                if (navigator.vibrate) navigator.vibrate(10);
              }}
              className="flex flex-col items-center gap-1 cursor-pointer transition-all relative flex-1"
            >
              <div className={`transition-all duration-300 flex flex-col items-center ${activeSection === "home" ? "text-[#22C55E] scale-110" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"}`}>
                <HomeIcon className="h-5 w-5 stroke-[2.2]" />
                <span className="text-[8.5px] font-bold uppercase tracking-wider font-sans mt-0.5">Home</span>
              </div>
              {activeSection === "home" && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-fade-in" />
              )}
            </button>

            <button
              id="mobile-nav-catalog"
              onClick={() => {
                setActiveSection("categories");
                if (navigator.vibrate) navigator.vibrate(10);
              }}
              className="flex flex-col items-center gap-1 cursor-pointer transition-all relative flex-1"
            >
              <div className={`transition-all duration-300 flex flex-col items-center ${activeSection === "categories" ? "text-[#22C55E] scale-110" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"}`}>
                <Layers className="h-5 w-5 stroke-[2.2]" />
                <span className="text-[8.5px] font-bold uppercase tracking-wider font-sans mt-0.5">Catalog</span>
              </div>
              {activeSection === "categories" && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-fade-in" />
              )}
            </button>

            <button
              id="mobile-nav-ai"
              onClick={() => {
                setActiveSection("ai");
                if (navigator.vibrate) navigator.vibrate(10);
              }}
              className="flex flex-col items-center gap-1 cursor-pointer transition-all relative flex-1"
            >
              <div className={`transition-all duration-300 flex flex-col items-center ${activeSection === "ai" ? "text-[#22C55E] scale-110" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"}`}>
                <div className="relative">
                  <Sparkles className="h-5 w-5 stroke-[2.2] text-[#22C55E] dark:text-[#22C55E]" />
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
                  </span>
                </div>
                <span className="text-[8.5px] font-bold uppercase tracking-wider font-sans mt-0.5">AI Styling</span>
              </div>
              {activeSection === "ai" && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-fade-in" />
              )}
            </button>

            <button
              id="mobile-nav-wishlist"
              onClick={() => {
                setActiveSection("wishlist");
                if (navigator.vibrate) navigator.vibrate(10);
              }}
              className="flex flex-col items-center gap-1 cursor-pointer transition-all relative flex-1"
            >
              <div className={`transition-all duration-300 flex flex-col items-center ${activeSection === "wishlist" ? "text-[#22C55E] scale-110" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"}`}>
                <div className="relative">
                  <Heart className="h-5 w-5 stroke-[2.2]" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full scale-90">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <span className="text-[8.5px] font-bold uppercase tracking-wider font-sans mt-0.5">Curated</span>
              </div>
              {activeSection === "wishlist" && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-fade-in" />
              )}
            </button>

            <button
              id="mobile-nav-cart"
              onClick={() => {
                setActiveSection("cart");
                if (navigator.vibrate) navigator.vibrate(10);
              }}
              className="flex flex-col items-center gap-1 cursor-pointer transition-all relative flex-1"
            >
              <div className={`transition-all duration-300 flex flex-col items-center ${activeSection === "cart" ? "text-[#22C55E] scale-110" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"}`}>
                <div className="relative">
                  <ShoppingBag className="h-5 w-5 stroke-[2.2]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[#22C55E] text-neutral-950 text-[8px] font-black px-1.5 py-0.2 rounded-full scale-90">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[8.5px] font-bold uppercase tracking-wider font-sans mt-0.5">Bag</span>
              </div>
              {activeSection === "cart" && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-fade-in" />
              )}
            </button>

            <button
              id="mobile-nav-profile"
              onClick={() => {
                setActiveSection("profile");
                if (navigator.vibrate) navigator.vibrate(10);
              }}
              className="flex flex-col items-center gap-1 cursor-pointer transition-all relative flex-1"
            >
              <div className={`transition-all duration-300 flex flex-col items-center ${activeSection === "profile" ? "text-[#22C55E] scale-110" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"}`}>
                <User className="h-5 w-5 stroke-[2.2]" />
                <span className="text-[8.5px] font-bold uppercase tracking-wider font-sans mt-0.5">Profile</span>
              </div>
              {activeSection === "profile" && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-fade-in" />
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppOrchestration />
    </AppProvider>
  );
}

