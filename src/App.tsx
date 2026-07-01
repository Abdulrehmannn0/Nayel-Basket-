import { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { AdminLogin } from "./components/AdminLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { CustomerShop } from "./components/CustomerShop";
import { SellerPanel } from "./components/SellerPanel";
import { Navbar } from "./components/Navbar";
import { 
  Home as HomeIcon, 
  Layers, 
  Heart, 
  ShoppingBag, 
  User, 
  Sparkles,
  ArrowLeft
} from "lucide-react";

interface AdminUser {
  email: string;
  role: "super_admin" | "admin" | "manager" | "staff" | "customer";
}

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

function MainAppOrchestration() {
  const { currentPath, navigate } = useRoute();
  const { cart, wishlist } = useApp();

  // Active section inside the Customer Shop
  const [activeSection, setActiveSection] = useState<"home" | "categories" | "wishlist" | "cart" | "profile" | "ai">("home");
  const [showSellerPanel, setShowSellerPanel] = useState(false);

  // Admin session state
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem("nb_admin_user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (role: "super_admin" | "admin" | "manager" | "staff" | "customer", email: string) => {
    const newUser: AdminUser = { email, role };
    setUser(newUser);
    localStorage.setItem("nb_admin_user", JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("nb_admin_user");
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

        {user ? (
          <AdminDashboard adminUser={user} onLogout={handleLogout} />
        ) : (
          <div className="pt-16">
            <AdminLogin onLoginSuccess={handleLoginSuccess} />
          </div>
        )}
      </div>
    );
  }

  // Render Seller Panel Mode
  if (showSellerPanel) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] text-black font-sans antialiased">
        <SellerPanel onBack={() => setShowSellerPanel(false)} />
      </div>
    );
  }

  // Otherwise, render Customer Shopping App
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black font-sans antialiased pb-24 sm:pb-0">
      
      {/* Header Navbar */}
      <Navbar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        <CustomerShop 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          onSelectSeller={() => setShowSellerPanel(true)}
          onSelectAdmin={() => navigate("/admin")}
        />
      </main>

      {/* Mobile Sticky Floating Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-white/80 backdrop-blur-xl border border-slate-100 rounded-3xl py-3 px-6 shadow-2xl flex items-center justify-between">
        <button
          id="mobile-nav-home"
          onClick={() => setActiveSection("home")}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeSection === "home" ? "text-black scale-105" : "text-slate-400 hover:text-slate-600"}`}
        >
          <HomeIcon className="h-4.5 w-4.5 stroke-[2]" />
          <span className="text-[9px] font-bold uppercase tracking-wider font-sans">Home</span>
        </button>

        <button
          id="mobile-nav-catalog"
          onClick={() => setActiveSection("categories")}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeSection === "categories" ? "text-black scale-105" : "text-slate-400 hover:text-slate-600"}`}
        >
          <Layers className="h-4.5 w-4.5 stroke-[2]" />
          <span className="text-[9px] font-bold uppercase tracking-wider font-sans">Catalog</span>
        </button>

        <button
          id="mobile-nav-wishlist"
          onClick={() => setActiveSection("wishlist")}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all relative ${activeSection === "wishlist" ? "text-black scale-105" : "text-slate-400 hover:text-slate-600"}`}
        >
          <Heart className="h-4.5 w-4.5 stroke-[2]" />
          {wishlistCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-neutral-900 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full scale-90">
              {wishlistCount}
            </span>
          )}
          <span className="text-[9px] font-bold uppercase tracking-wider font-sans">Curated</span>
        </button>

        <button
          id="mobile-nav-cart"
          onClick={() => setActiveSection("cart")}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all relative ${activeSection === "cart" ? "text-black scale-105" : "text-slate-400 hover:text-slate-600"}`}
        >
          <ShoppingBag className="h-4.5 w-4.5 stroke-[2]" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-[#34C759] text-white text-[8px] font-black px-1.5 py-0.2 rounded-full scale-90">
              {cartCount}
            </span>
          )}
          <span className="text-[9px] font-bold uppercase tracking-wider font-sans">Bag</span>
        </button>

        <button
          id="mobile-nav-profile"
          onClick={() => setActiveSection("profile")}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeSection === "profile" ? "text-black scale-105" : "text-slate-400 hover:text-slate-600"}`}
        >
          <User className="h-4.5 w-4.5 stroke-[2]" />
          <span className="text-[9px] font-bold uppercase tracking-wider font-sans">Profile</span>
        </button>

        <button
          id="mobile-nav-ai"
          onClick={() => setActiveSection("ai")}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeSection === "ai" ? "text-black scale-105" : "text-slate-400 hover:text-slate-600"}`}
        >
          <Sparkles className="h-4.5 w-4.5 stroke-[2] text-[#34C759]" />
          <span className="text-[9px] font-bold uppercase tracking-wider font-sans text-[#34C759]">AI</span>
        </button>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppOrchestration />
    </AppProvider>
  );
}
