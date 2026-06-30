import React, { useState } from "react";
import { 
  Settings, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  Mail, 
  MessageSquare, 
  Search, 
  Info,
  Save,
  Check
} from "lucide-react";

export const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"general" | "payments" | "shipping" | "firebase" | "integrations">("general");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // General Settings States
  const [siteTitle, setSiteTitle] = useState("Nayel Basket | Exquisite Home Decor");
  const [metaDescription, setMetaDescription] = useState("Premium hand-selected decor selection cast to elevate architectural sanctuaries.");
  const [appVersion, setAppVersion] = useState("4.2.0-stable");

  // Payment states
  const [stripeSecret, setStripeSecret] = useState("sk_live_51MszHGKJH8uYh81h4G...");
  const [stripePublishable, setStripePublishable] = useState("pk_live_51MszHGKJH8u...");
  const [razorpayKey, setRazorpayKey] = useState("rzp_live_Ghy7YhnUj987H");

  // Shipping rules
  const [flatShippingRate, setFlatShippingRate] = useState("15.00");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("150.00");
  const [taxRatePercentage, setTaxRatePercentage] = useState("8.00");

  // Firebase states
  const [firebaseConfig, setFirebaseConfig] = useState(JSON.stringify({
    apiKey: "AIzaSyAs-GhyT98Ujnm8YhnT65",
    authDomain: "nayel-basket.firebaseapp.com",
    projectId: "nayel-basket",
    storageBucket: "nayel-basket.appspot.com",
    messagingSenderId: "88734612983"
  }, null, 2));

  // Additional API parameters
  const [smtpServer, setSmtpServer] = useState("smtp.nayelbasket.com");
  const [smtpPort, setSmtpPort] = useState("465");
  const [twilioSid, setTwilioSid] = useState("AC78g6t7yfhu89yhn7yhn89hy");
  const [whatsappApiUrl, setWhatsappApiUrl] = useState("https://api.whatsapp.com/send?phone=123");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
      
      {/* 1. Sub Tabs Navigation */}
      <div className="bg-white border border-slate-100 p-5 rounded-[2.5rem] shadow-sm flex flex-col space-y-1.5 h-fit">
        <button
          id="btn-settings-general"
          onClick={() => setActiveTab("general")}
          className={`px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-left transition-all cursor-pointer flex items-center gap-2.5 ${
            activeTab === "general" ? "bg-black text-white" : "text-slate-500 hover:text-black hover:bg-slate-50"
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>General & Branding</span>
        </button>

        <button
          id="btn-settings-payments"
          onClick={() => setActiveTab("payments")}
          className={`px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-left transition-all cursor-pointer flex items-center gap-2.5 ${
            activeTab === "payments" ? "bg-black text-white" : "text-slate-500 hover:text-black hover:bg-slate-50"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Payment Gateways</span>
        </button>

        <button
          id="btn-settings-shipping"
          onClick={() => setActiveTab("shipping")}
          className={`px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-left transition-all cursor-pointer flex items-center gap-2.5 ${
            activeTab === "shipping" ? "bg-black text-white" : "text-slate-500 hover:text-black hover:bg-slate-50"
          }`}
        >
          <Truck className="h-4 w-4" />
          <span>Logistics & Taxes</span>
        </button>

        <button
          id="btn-settings-firebase"
          onClick={() => setActiveTab("firebase")}
          className={`px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-left transition-all cursor-pointer flex items-center gap-2.5 ${
            activeTab === "firebase" ? "bg-black text-white" : "text-slate-500 hover:text-black hover:bg-slate-50"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Firebase SDK Cloud</span>
        </button>

        <button
          id="btn-settings-integrations"
          onClick={() => setActiveTab("integrations")}
          className={`px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-left transition-all cursor-pointer flex items-center gap-2.5 ${
            activeTab === "integrations" ? "bg-black text-white" : "text-slate-500 hover:text-black hover:bg-slate-50"
          }`}
        >
          <Mail className="h-4 w-4" />
          <span>Snail & API Integrations</span>
        </button>
      </div>

      {/* 2. Settings Parameters Panel */}
      <div className="lg:col-span-3 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
        
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-fade-in text-xs">
              <div className="border-b pb-4">
                <h3 className="text-sm font-black text-black uppercase tracking-tight">General Site Branding</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Define corporate SEO anchors, site icons, and application versions.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Site Title (Metadata)</label>
                  <input value={siteTitle} onChange={e => setSiteTitle(e.target.value)} className="w-full bg-[#F7F7F7] border p-3 rounded-xl focus:outline-none focus:bg-white focus:border-[#34C759]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Meta SEO Description</label>
                  <textarea rows={3} value={metaDescription} onChange={e => setMetaDescription(e.target.value)} className="w-full bg-[#F7F7F7] border p-3 rounded-xl focus:outline-none focus:bg-white focus:border-[#34C759]"></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Global Theme Preset</label>
                    <select className="w-full bg-[#F7F7F7] border p-3 rounded-xl focus:outline-none">
                      <option value="light">Premium High-Contrast White (Default)</option>
                      <option value="dark">Charcoal Luxury Dark</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Installed Version</label>
                    <input disabled value={appVersion} className="w-full bg-[#F7F7F7] border p-3 rounded-xl font-mono text-slate-400 cursor-not-allowed" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === "payments" && (
            <div className="space-y-6 animate-fade-in text-xs">
              <div className="border-b pb-4">
                <h3 className="text-sm font-black text-black uppercase tracking-tight">Transactional Payment Gateways</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Configure live encryption keys for Stripe and local merchant payment tokens.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Stripe Live Secret Key (Hidden)</label>
                  <input type="password" value={stripeSecret} onChange={e => setStripeSecret(e.target.value)} className="w-full bg-[#F7F7F7] border p-3 rounded-xl font-mono text-black focus:outline-none focus:bg-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Stripe Publishable Token</label>
                  <input value={stripePublishable} onChange={e => setStripePublishable(e.target.value)} className="w-full bg-[#F7F7F7] border p-3 rounded-xl font-mono text-black focus:outline-none focus:bg-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Razorpay Premium MID Key</label>
                  <input value={razorpayKey} onChange={e => setRazorpayKey(e.target.value)} className="w-full bg-[#F7F7F7] border p-3 rounded-xl font-mono text-black focus:outline-none focus:bg-white" />
                </div>
              </div>
            </div>
          )}

          {/* Shipping & Tax Tab */}
          {activeTab === "shipping" && (
            <div className="space-y-6 animate-fade-in text-xs">
              <div className="border-b pb-4">
                <h3 className="text-sm font-black text-black uppercase tracking-tight">Global Logistics & Tariffs</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Configure white-glove shipping rates, VAT percentages, and premium criteria boundaries.</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Flat Shipping Fee ($)</label>
                  <input type="number" step="0.5" value={flatShippingRate} onChange={e => setFlatShippingRate(e.target.value)} className="w-full bg-[#F7F7F7] border p-3 rounded-xl font-mono text-black focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Free Crate Limit ($)</label>
                  <input type="number" step="10" value={freeShippingThreshold} onChange={e => setFreeShippingThreshold(e.target.value)} className="w-full bg-[#F7F7F7] border p-3 rounded-xl font-mono text-black focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">GST / Tax Index (%)</label>
                  <input type="number" step="0.1" value={taxRatePercentage} onChange={e => setTaxRatePercentage(e.target.value)} className="w-full bg-[#F7F7F7] border p-3 rounded-xl font-mono text-black focus:outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* Firebase SDK Config */}
          {activeTab === "firebase" && (
            <div className="space-y-6 animate-fade-in text-xs">
              <div className="border-b pb-4">
                <h3 className="text-sm font-black text-black uppercase tracking-tight">Firebase Cloud SDK Credentials</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Inject standard service credentials to secure real-time push notifications.</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Service Account JSON Blueprint</label>
                <textarea rows={8} value={firebaseConfig} onChange={e => setFirebaseConfig(e.target.value)} className="w-full bg-neutral-900 text-[#34C759] font-mono border p-4 rounded-xl focus:outline-none"></textarea>
              </div>
            </div>
          )}

          {/* Snail & API Integrations */}
          {activeTab === "integrations" && (
            <div className="space-y-6 animate-fade-in text-xs">
              <div className="border-b pb-4">
                <h3 className="text-sm font-black text-black uppercase tracking-tight">API Communications & Channels</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Configure SMTP configurations, Twilio SMS and Whatsapp API parameters.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">SMTP Host server</label>
                  <input value={smtpServer} onChange={e => setSmtpServer(e.target.value)} className="w-full bg-[#F7F7F7] border p-3 rounded-xl font-mono text-black focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">SMTP Secure Port</label>
                  <input value={smtpPort} onChange={e => setSmtpPort(e.target.value)} className="w-full bg-[#F7F7F7] border p-3 rounded-xl font-mono text-black focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Twilio SID (Hidden)</label>
                  <input type="password" value={twilioSid} onChange={e => setTwilioSid(e.target.value)} className="w-full bg-[#F7F7F7] border p-3 rounded-xl font-mono text-black focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">WhatsApp Send API Endpoint</label>
                  <input value={whatsappApiUrl} onChange={e => setWhatsappApiUrl(e.target.value)} className="w-full bg-[#F7F7F7] border p-3 rounded-xl font-mono text-black focus:outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* Action Trigger Save Button */}
          <div className="pt-6 border-t flex justify-between items-center">
            {saveSuccess ? (
              <span className="text-emerald-600 font-extrabold flex items-center gap-1.5 text-xs font-mono animate-bounce">
                <Check className="h-4 w-4" />
                <span>SAVED TO ENTERPRISE CLOUD!</span>
              </span>
            ) : (
              <div className="text-[10px] text-slate-400 font-mono">
                Last backed up: Just now
              </div>
            )}
            
            <button
              id="btn-settings-save"
              type="submit"
              className="px-6 py-3 bg-black hover:bg-[#34C759] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-1.5 shadow-lg transition-all"
            >
              <Save className="h-4 w-4" />
              <span>Commit Settings</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
