import React, { useState, useEffect } from "react";
import { KeyRound, ShieldAlert, Check, Fingerprint, ShieldCheck } from "lucide-react";
import { isSupabaseConnected, signInUser } from "../lib/supabase";

interface AdminLoginProps {
  onLoginSuccess: (role: "super_admin" | "admin" | "manager" | "staff" | "customer", email: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("admin@nayelbasket.com");
  const [password, setPassword] = useState("admin123");
  const [role, setRole] = useState<"super_admin" | "admin" | "manager" | "staff" | "customer">("admin");
  const [use2FA, setUse2FA] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("nb_remember_me") === "true";
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [biometricScanning, setBiometricScanning] = useState(false);

  // Suggested credentials for ease of testing all 5 roles
  const credentials = {
    super_admin: { email: "super_admin@nayelbasket.com", pass: "super123" },
    admin: { email: "admin@nayelbasket.com", pass: "admin123" },
    manager: { email: "manager@nayelbasket.com", pass: "manager123" },
    staff: { email: "staff@nayelbasket.com", pass: "staff123" },
    customer: { email: "customer@nayelbasket.com", pass: "customer123" },
  };

  useEffect(() => {
    if (rememberMe) {
      localStorage.setItem("nb_remember_me", "true");
    } else {
      localStorage.removeItem("nb_remember_me");
    }
  }, [rememberMe]);

  const handleRolePreset = (selectedRole: "super_admin" | "admin" | "manager" | "staff" | "customer") => {
    setRole(selectedRole);
    setEmail(credentials[selectedRole].email);
    setPassword(credentials[selectedRole].pass);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isSupabaseConnected()) {
      const { data, error: authError } = await signInUser(email, password);
      if (authError) {
        setError(authError.message || "Invalid credentials. Authentication failed.");
        setLoading(false);
        return;
      }
      
      let detectedRole: "super_admin" | "admin" | "manager" | "staff" | "customer" = "admin";
      if (email.includes("super")) detectedRole = "super_admin";
      else if (email.includes("manager")) detectedRole = "manager";
      else if (email.includes("staff")) detectedRole = "staff";
      else if (email.includes("customer")) detectedRole = "customer";
      
      onLoginSuccess(detectedRole, email);
      setLoading(false);
      return;
    }

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

  // Secure biometric authenticator simulation flow for FaceID / Fingerprint / WebAuthn
  const handleBiometricUnlock = async () => {
    setBiometricScanning(true);
    setError("");
    
    // WebAuthn API availability check
    const hasWebAuthn = !!window.PublicKeyCredential;
    console.log("WebAuthn API state:", hasWebAuthn);

    setTimeout(() => {
      setBiometricScanning(false);
      const preset = credentials[role];
      setEmail(preset.email);
      setPassword(preset.pass);
      onLoginSuccess(role, preset.email);
    }, 1200);
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

        {/* 5-Role Presets Selector Grid */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-[#F7F7F7] rounded-xl mb-6 text-center">
          {(["super_admin", "admin", "manager", "staff", "customer"] as const).map((r) => (
            <button
              key={r}
              type="button"
              id={`btn-login-role-${r}`}
              onClick={() => handleRolePreset(r)}
              title={r.replace("_", " ").toUpperCase()}
              className={`py-2 px-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter transition-all cursor-pointer truncate ${
                role === r
                  ? "bg-black text-white shadow-md"
                  : "text-slate-400 hover:text-black hover:bg-neutral-100"
              }`}
            >
              {r === "super_admin" ? "Super" : r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
              className="w-full bg-[#F7F7F7] border border-slate-200 focus:border-[#34C759] focus:bg-white px-4 py-3 rounded-xl text-xs font-semibold text-black outline-none transition-all"
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
              className="w-full bg-[#F7F7F7] border border-slate-200 focus:border-[#34C759] focus:bg-white px-4 py-3 rounded-xl text-xs font-semibold text-black outline-none transition-all"
            />
          </div>

          {/* Remember Me & 2FA Toggles */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex justify-between items-center bg-[#F7F7F7] p-2.5 rounded-xl border border-slate-200/50">
              <div>
                <span className="text-[9px] font-bold text-black block uppercase tracking-wide">
                  Remember Me
                </span>
              </div>
              <button
                id="toggle-remember-me"
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-8 h-5 rounded-full p-0.5 flex items-center transition-all duration-300 cursor-pointer ${
                  rememberMe ? "bg-[#34C759] justify-end" : "bg-slate-300 justify-start"
                }`}
              >
                <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm"></div>
              </button>
            </div>

            <div className="flex justify-between items-center bg-[#F7F7F7] p-2.5 rounded-xl border border-slate-200/50">
              <div>
                <span className="text-[9px] font-bold text-black block uppercase tracking-wide">
                  Require 2FA
                </span>
              </div>
              <button
                id="toggle-login-2fa"
                type="button"
                onClick={() => {
                  setUse2FA(!use2FA);
                  if (!use2FA) setTotpCode("123456");
                }}
                className={`w-8 h-5 rounded-full p-0.5 flex items-center transition-all duration-300 cursor-pointer ${
                  use2FA ? "bg-[#34C759] justify-end" : "bg-slate-300 justify-start"
                }`}
              >
                <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm"></div>
              </button>
            </div>
          </div>

          {use2FA && (
            <div className="animate-fade-in">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 font-mono">
                MFA Token (Enter '123456')
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

          <div className="flex justify-between items-center text-[10px] pt-1 font-mono">
            <button
              id="btn-forgot-password"
              type="button"
              onClick={() => alert("Credentials reset instructions have been dispatched securely to the administrator inbox.")}
              className="text-slate-400 hover:text-[#34C759] uppercase tracking-wider font-bold cursor-pointer transition-all"
            >
              Reset Password?
            </button>
            <span className="text-slate-400 text-[9px]">v4.2.0 Active</span>
          </div>

          <div className="space-y-2 pt-2">
            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading || biometricScanning}
              className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl uppercase tracking-widest cursor-pointer transition-all flex justify-center items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <span>VERIFY & ENTER PORTAL</span>
              )}
            </button>

            {/* PASSKEYS & BIOMETRIC UNLOCK BUTTON */}
            <button
              type="button"
              onClick={handleBiometricUnlock}
              disabled={loading || biometricScanning}
              className="w-full py-3 bg-neutral-50 hover:bg-[#34C759]/10 text-slate-700 hover:text-[#34C759] border border-slate-200 font-bold text-[10px] rounded-xl uppercase tracking-widest cursor-pointer transition-all flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {biometricScanning ? (
                <span className="h-3.5 w-3.5 border-2 border-[#34C759] border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Fingerprint className="h-4 w-4" />
              )}
              <span>{biometricScanning ? "SCANNING FINGERPRINT..." : "BIOMETRIC UNLOCK (PASSKEY)"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
