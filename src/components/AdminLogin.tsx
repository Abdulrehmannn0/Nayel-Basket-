import React, { useState } from "react";
import { KeyRound, ShieldAlert, Check } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: (role: "admin" | "manager" | "staff", email: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("admin@nayelbasket.com");
  const [password, setPassword] = useState("admin123");
  const [role, setRole] = useState<"admin" | "manager" | "staff">("admin");
  const [use2FA, setUse2FA] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Suggested credentials for ease of testing
  const credentials = {
    admin: { email: "admin@nayelbasket.com", pass: "admin123" },
    manager: { email: "manager@nayelbasket.com", pass: "manager123" },
    staff: { email: "staff@nayelbasket.com", pass: "staff123" },
  };

  const handleRolePreset = (selectedRole: "admin" | "manager" | "staff") => {
    setRole(selectedRole);
    setEmail(credentials[selectedRole].email);
    setPassword(credentials[selectedRole].pass);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      const preset = credentials[role];
      if (email === preset.email && password === preset.pass) {
        if (use2FA && totpCode.trim() !== "123456") {
          setError("Invalid 2FA Verification Token. (Hint: Use '123456')");
          setLoading(false);
          return;
        }
        onLoginSuccess(role, email);
      } else {
        setError("Invalid credentials for the selected role. Please try again.");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Green Accent Border */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#34C759]"></div>

        <div className="text-center space-y-2 mb-8 mt-2">
          <div className="h-12 w-12 bg-[#34C759]/10 rounded-2xl flex items-center justify-center mx-auto text-[#34C759]">
            <KeyRound className="h-6 w-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight font-sans">
            Nayel Basket
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
            Enterprise Management Gateway
          </p>
        </div>

        {/* Role Presets Selector */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#F7F7F7] rounded-2xl mb-6">
          {(["admin", "manager", "staff"] as const).map((r) => (
            <button
              key={r}
              type="button"
              id={`btn-login-role-${r}`}
              onClick={() => handleRolePreset(r)}
              className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                role === r
                  ? "bg-black text-white shadow-md"
                  : "text-slate-500 hover:text-black hover:bg-neutral-100"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 font-mono">
              Email Address
            </label>
            <input
              id="input-login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F7F7F7] border border-slate-200 focus:border-[#34C759] focus:bg-white px-4 py-3 rounded-xl text-xs font-medium text-black outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 font-mono">
              Account Password
            </label>
            <input
              id="input-login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F7F7F7] border border-slate-200 focus:border-[#34C759] focus:bg-white px-4 py-3 rounded-xl text-xs font-medium text-black outline-none transition-all"
            />
          </div>

          {/* 2FA Ready Switch */}
          <div className="flex justify-between items-center bg-[#F7F7F7] p-3 rounded-xl border border-slate-200/50">
            <div>
              <span className="text-[10px] font-bold text-black block uppercase tracking-wide">
                2FA Multi-Factor Required
              </span>
              <span className="text-[9px] text-slate-400 block font-light">
                Secured token gateway simulation
              </span>
            </div>
            <button
              id="toggle-login-2fa"
              type="button"
              onClick={() => {
                setUse2FA(!use2FA);
                if (!use2FA) setTotpCode("123456");
              }}
              className={`w-10 h-6 rounded-full p-1 flex items-center transition-all duration-300 cursor-pointer ${
                use2FA ? "bg-[#34C759] justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
            </button>
          </div>

          {use2FA && (
            <div className="animate-fade-in">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 font-mono">
                MFA Authentication Code (Enter '123456')
              </label>
              <input
                id="input-login-2fa"
                type="text"
                required
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                className="w-full bg-[#F7F7F7] border border-slate-200 focus:border-[#34C759] focus:bg-white px-4 py-3 rounded-xl text-xs font-mono font-bold text-center tracking-[0.4em] text-black outline-none transition-all"
              />
            </div>
          )}

          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-xl border border-rose-100 flex gap-2 items-start text-[11px] font-medium leading-relaxed">
              <ShieldAlert className="h-4 w-4 stroke-[2] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-[10px] pt-1">
            <button
              id="btn-forgot-password"
              type="button"
              onClick={() => alert("Credentials reset instructions have been forwarded to the primary admin SMTP inbox.")}
              className="text-slate-400 hover:text-[#34C759] font-mono uppercase tracking-wider font-bold cursor-pointer transition-all"
            >
              Forgot Password?
            </button>
            <span className="text-slate-400 font-mono text-[9px]">v4.0.0 Stable</span>
          </div>

          <button
            id="btn-login-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl uppercase tracking-widest cursor-pointer transition-all flex justify-center items-center gap-2 shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>VERIFY & ENTER PORTAL</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
