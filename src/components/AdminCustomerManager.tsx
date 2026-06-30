import React, { useState } from "react";
import { 
  Users2, 
  Search, 
  MapPin, 
  Wallet, 
  Gift, 
  Coins, 
  ReceiptText, 
  Ticket, 
  ArrowUpRight,
  Plus,
  CoinsIcon
} from "lucide-react";
import { Order } from "../types";

interface CustomerManagerProps {
  orders: Order[];
  walletBalance: number;
  addWalletFunds: (amt: number) => void;
  rewardPoints: number;
  addRewardPoints: (pts: number) => void;
}

interface SimulatedCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
  wallet: number;
  rewards: number;
  city: string;
  avatar: string;
  tier: "VIP Patron" | "Elite Collector" | "Standard";
}

export const AdminCustomerManager: React.FC<CustomerManagerProps> = ({
  orders,
  walletBalance,
  addWalletFunds,
  rewardPoints,
  addRewardPoints
}) => {
  const [search, setSearch] = useState("");
  const [selectedCust, setSelectedCust] = useState<SimulatedCustomer | null>(null);

  // Funds adjust controllers
  const [fundAmt, setFundAmt] = useState("50");
  const [pointAmt, setPointAmt] = useState("100");

  const [customers, setCustomers] = useState<SimulatedCustomer[]>([
    { id: "cust_1", name: "Alex Rivera", email: "alex.rivera@gmail.com", phone: "+1 (555) 321-9876", joinedDate: "2026-01-15", wallet: 150.00, rewards: 250, city: "San Francisco, CA", avatar: "A", tier: "VIP Patron" },
    { id: "cust_2", name: "Sophia Loren", email: "sophia@lorenarchitects.com", phone: "+1 (555) 890-1234", joinedDate: "2026-03-02", wallet: 420.00, rewards: 850, city: "Los Angeles, CA", avatar: "S", tier: "Elite Collector" },
    { id: "cust_3", name: "Julian Rivera", email: "julian@riveradesigns.co", phone: "+1 (555) 543-2109", joinedDate: "2026-04-10", wallet: 75.00, rewards: 120, city: "New York, NY", avatar: "J", tier: "Standard" },
    { id: "cust_4", name: "Marc Jacobs", email: "marc@jacobsdecor.net", phone: "+1 (555) 888-9999", joinedDate: "2026-05-22", wallet: 1250.00, rewards: 3400, city: "Chicago, IL", avatar: "M", tier: "VIP Patron" }
  ]);

  // Adjust Wallet Balance
  const handleAdjustFunds = (isAdd: boolean) => {
    if (!selectedCust) return;
    const delta = Number(fundAmt);
    if (isNaN(delta) || delta <= 0) return;

    const finalDelta = isAdd ? delta : -delta;

    // If adjusting the logged in user (Alex Rivera), synchronize with standard wallet context!
    if (selectedCust.id === "cust_1") {
      addWalletFunds(finalDelta);
    }

    setCustomers(prev => prev.map(c => {
      if (c.id === selectedCust.id) {
        const updated = { ...c, wallet: Math.max(0, c.wallet + finalDelta) };
        setSelectedCust(updated);
        return updated;
      }
      return c;
    }));
    setFundAmt("50");
  };

  // Adjust Reward Points
  const handleAdjustPoints = (isAdd: boolean) => {
    if (!selectedCust) return;
    const delta = Number(pointAmt);
    if (isNaN(delta) || delta <= 0) return;

    const finalDelta = isAdd ? delta : -delta;

    // Sync with AppContext if logged in
    if (selectedCust.id === "cust_1") {
      addRewardPoints(finalDelta);
    }

    setCustomers(prev => prev.map(c => {
      if (c.id === selectedCust.id) {
        const updated = { ...c, rewards: Math.max(0, c.rewards + finalDelta) };
        setSelectedCust(updated);
        return updated;
      }
      return c;
    }));
    setPointAmt("100");
  };

  const filteredCustomers = customers.filter(c => {
    return c.name.toLowerCase().includes(search.toLowerCase()) || 
           c.email.toLowerCase().includes(search.toLowerCase()) ||
           c.city.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      
      {/* 1. Left: Searchable list of Customers */}
      <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h3 className="text-sm font-black text-black uppercase tracking-tight">VIP Patrons Directory</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Manage collector relationships, ledger balances, and custom reward levels.</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="input-customer-search"
            placeholder="Search by name, email, shipping locale..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F7F7F7] text-xs font-medium text-black pl-10 pr-4 py-3 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-[#34C759]"
          />
        </div>

        {/* Customers Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b text-slate-400 font-extrabold text-[9px] uppercase tracking-wider">
                <th className="py-3 px-2">Collector</th>
                <th className="py-3 px-2">Locale</th>
                <th className="py-3 px-2 text-right">Wallet Balance</th>
                <th className="py-3 px-2 text-right">Reward Points</th>
                <th className="py-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              {filteredCustomers.map(c => {
                const liveWallet = c.id === "cust_1" ? walletBalance : c.wallet;
                const livePoints = c.id === "cust_1" ? rewardPoints : c.rewards;
                return (
                  <tr key={c.id} className="hover:bg-[#FCFDFE]">
                    <td className="py-3.5 px-2">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-black text-white font-bold flex items-center justify-center text-xs font-mono">
                          {c.avatar}
                        </div>
                        <div>
                          <span className="font-extrabold text-black block text-xs">{c.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{c.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-2 font-semibold text-slate-700">
                      📍 {c.city}
                    </td>
                    <td className="py-3.5 px-2 text-right font-mono font-extrabold text-black">
                      ${liveWallet.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-2 text-right font-mono font-bold text-slate-500">
                      ✨ {livePoints}
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <button
                        id={`btn-select-cust-${c.id}`}
                        onClick={() => setSelectedCust(c)}
                        className="px-2.5 py-1.5 bg-neutral-50 hover:bg-[#34C759]/10 text-slate-600 hover:text-[#34C759] font-bold text-[9px] uppercase tracking-wider rounded-lg border cursor-pointer transition-all"
                      >
                        Ledger Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Right: Customer detail profile card & ledger adjustments */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm">
        {selectedCust ? (
          <div className="space-y-6 animate-fade-in">
            {/* Header Profile */}
            <div className="border-b pb-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-black text-white font-black flex items-center justify-center text-lg font-mono shadow-md">
                {selectedCust.avatar}
              </div>
              <div>
                <span className="text-sm font-black text-black block">{selectedCust.name}</span>
                <span className="text-[9px] font-bold text-[#34C759] bg-[#34C759]/10 px-2 py-0.5 rounded uppercase font-mono mt-1 inline-block">
                  {selectedCust.tier}
                </span>
              </div>
            </div>

            {/* General metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-4 bg-[#F7F7F7] rounded-2xl border">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Wallet Funds</span>
                <span className="text-sm font-black text-black block">
                  ${(selectedCust.id === "cust_1" ? walletBalance : selectedCust.wallet).toFixed(2)}
                </span>
              </div>
              <div className="p-4 bg-[#F7F7F7] rounded-2xl border">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Reward Points</span>
                <span className="text-sm font-black text-slate-600 block">
                  ✨ {selectedCust.id === "cust_1" ? rewardPoints : selectedCust.rewards} PTS
                </span>
              </div>
            </div>

            {/* Wallet Balance adjustment form */}
            <div className="bg-[#FAFBFD] p-5 rounded-[1.8rem] border border-slate-100 space-y-3">
              <span className="block text-[10px] font-bold text-black uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-[#34C759]" />
                <span>Adjust Wallet Balances</span>
              </span>
              <div className="flex gap-2">
                <input
                  id="input-adjust-funds-amt"
                  type="number"
                  value={fundAmt}
                  onChange={e => setFundAmt(e.target.value)}
                  className="w-20 bg-white border p-2 rounded-xl text-xs font-mono font-bold text-center text-black focus:outline-none focus:border-[#34C759]"
                />
                <button
                  id="btn-add-funds"
                  onClick={() => handleAdjustFunds(true)}
                  className="flex-1 py-2 bg-[#34C759] text-white text-[9px] font-bold uppercase rounded-xl tracking-wider hover:opacity-90 cursor-pointer"
                >
                  Add Credits
                </button>
                <button
                  id="btn-deduct-funds"
                  onClick={() => handleAdjustFunds(false)}
                  className="flex-1 py-2 bg-rose-600 text-white text-[9px] font-bold uppercase rounded-xl tracking-wider hover:opacity-90 cursor-pointer"
                >
                  Deduct
                </button>
              </div>
            </div>

            {/* Rewards Points adjustment form */}
            <div className="bg-[#FAFBFD] p-5 rounded-[1.8rem] border border-slate-100 space-y-3">
              <span className="block text-[10px] font-bold text-black uppercase tracking-widest font-mono flex items-center gap-1.5">
                <CoinsIcon className="h-4 w-4 text-amber-500" />
                <span>Adjust Reward Points</span>
              </span>
              <div className="flex gap-2">
                <input
                  id="input-adjust-points-amt"
                  type="number"
                  value={pointAmt}
                  onChange={e => setPointAmt(e.target.value)}
                  className="w-20 bg-white border p-2 rounded-xl text-xs font-mono font-bold text-center text-black focus:outline-none focus:border-[#34C759]"
                />
                <button
                  id="btn-add-points"
                  onClick={() => handleAdjustPoints(true)}
                  className="flex-1 py-2 bg-amber-500 text-white text-[9px] font-bold uppercase rounded-xl tracking-wider hover:opacity-90 cursor-pointer"
                >
                  Add Points
                </button>
                <button
                  id="btn-deduct-points"
                  onClick={() => handleAdjustPoints(false)}
                  className="flex-1 py-2 bg-neutral-600 text-white text-[9px] font-bold uppercase rounded-xl tracking-wider hover:opacity-90 cursor-pointer"
                >
                  Deduct
                </button>
              </div>
            </div>

            {/* Profile properties */}
            <div className="border-t pt-4 space-y-2 text-[11px] leading-relaxed">
              <div className="flex justify-between">
                <span className="text-slate-400">Patron ID:</span>
                <span className="font-mono text-black font-bold">{selectedCust.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Joined Date:</span>
                <span className="text-black font-medium">{selectedCust.joinedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Primary Contact:</span>
                <span className="text-black font-medium">{selectedCust.phone}</span>
              </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-20 text-slate-400 space-y-2">
            <Users2 className="h-10 w-10 text-slate-300 stroke-[1.5]" />
            <span className="text-xs font-bold uppercase tracking-wider">No Patron Selected</span>
            <p className="text-[10px] max-w-xs leading-relaxed font-medium">Select a collector from the directory on the left to review metrics and adjust accounts.</p>
          </div>
        )}
      </div>

    </div>
  );
};
