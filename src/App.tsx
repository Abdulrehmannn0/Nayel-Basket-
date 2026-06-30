import { useState } from "react";
import { AppProvider } from "./context/AppContext";
import { AdminLogin } from "./components/AdminLogin";
import { AdminDashboard } from "./components/AdminDashboard";

interface AdminUser {
  email: string;
  role: "admin" | "manager" | "staff";
}

function RootApp() {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem("nb_admin_user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (role: "admin" | "manager" | "staff", email: string) => {
    const newUser: AdminUser = { email, role };
    setUser(newUser);
    localStorage.setItem("nb_admin_user", JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("nb_admin_user");
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black font-sans antialiased">
      {user ? (
        <AdminDashboard adminUser={user} onLogout={handleLogout} />
      ) : (
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RootApp />
    </AppProvider>
  );
}
