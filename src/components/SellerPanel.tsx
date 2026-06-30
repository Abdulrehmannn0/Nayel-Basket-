/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Product } from "../types";
import { 
  Plus, 
  Store, 
  DollarSign, 
  TrendingUp, 
  Check, 
  Upload, 
  Trash,
  ChevronLeft
} from "lucide-react";

interface SellerPanelProps {
  onBack: () => void;
}

export const SellerPanel: React.FC<SellerPanelProps> = ({ onBack }) => {
  const { products, sellerStats, addSellerProduct, updateProductStock, addNotification } = useApp();

  // Create Product form states
  const [prodName, setProdName] = useState("");
  const [prodBrand, setProdBrand] = useState("");
  const [prodPrice, setProdPrice] = useState("180");
  const [prodOrigPrice, setProdOrigPrice] = useState("240");
  const [prodCategory, setProdCategory] = useState("Furniture");
  const [prodDescription, setProdDescription] = useState("");
  const [prodStock, setProdStock] = useState("25");
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["Mid-Scale Curation"]);
  const [selectedColors, setSelectedColors] = useState<string[]>(["Polished Brass"]);
  const [prodImageUrl, setProdImageUrl] = useState("https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=600&q=80");
  const [prodSpecs, setProdSpecs] = useState("Solid handcrafted brass construct\nFine brushed non-corrosive finish");

  const [dragActive, setDragActive] = useState(false);

  // Filter products that belong to the current merchant/active
  const myProducts = products;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setProdImageUrl("https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=600&q=80");
    addNotification("📸 Image Ingested", "Premium product picture processed into secure seller storage.", "system");
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodBrand.trim() || !prodDescription.trim()) {
      alert("Please populate all crucial product specification parameters.");
      return;
    }

    const priceNum = parseFloat(prodPrice);
    const origPriceNum = parseFloat(prodOrigPrice);
    const stockNum = parseInt(prodStock, 10);

    const newProd: Product = {
      id: `prod_custom_${Date.now()}`,
      name: prodName,
      brand: prodBrand,
      sku: `NB-${Date.now().toString().slice(-5).toUpperCase()}`,
      description: prodDescription,
      price: isNaN(priceNum) ? 149 : priceNum,
      originalPrice: isNaN(origPriceNum) ? 199 : origPriceNum,
      category: prodCategory,
      image: prodImageUrl,
      rating: 5.0,
      reviewCount: 0,
      stock: isNaN(stockNum) ? 15 : stockNum,
      sellerId: "seller_active",
      sellerName: "My Active Merchant Store",
      features: prodSpecs.split("\n").filter((f) => f.trim().length > 0),
      sizes: selectedSizes,
      colors: selectedColors,
      reviews: [],
      qa: []
    };

    addSellerProduct(newProd);

    // clear fields
    setProdName("");
    setProdBrand("");
    setProdPrice("180");
    setProdOrigPrice("240");
    setProdCategory("Furniture");
    setProdDescription("");
    setProdStock("25");
    setProdSpecs("Solid handcrafted brass construct\nFine brushed non-corrosive finish");
  };

  return (
    <div className="space-y-8 pb-16 bg-white animate-fade-in text-black">
      
      {/* Back Button and Title Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <button
            id="btn-seller-back"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-black mb-2 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
            <span>Return to shop</span>
          </button>
          <h1 className="text-2xl font-bold text-black uppercase tracking-tight flex items-center gap-2">
            <Store className="h-6 w-6 text-[#34C759]" />
            Seller Merchant Studio
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Bespoke retail operations, custom metadata catalogs, stock levels, and instant clearing records.
          </p>
        </div>
      </div>

      {/* Metrics Dashboards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#F7F7F7] border border-slate-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Total Merchant Volume</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-black font-sans">${sellerStats.totalSales.toFixed(2)}</span>
            <span className="text-xs text-[#34C759] font-bold flex items-center gap-0.5 font-sans">
              <TrendingUp className="h-3 w-3" /> +18.5%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1 font-sans">Refreshed just now</span>
        </div>

        <div className="bg-[#F7F7F7] border border-slate-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Pending Clearing Ledger</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-neutral-800 font-sans">${sellerStats.pendingSettlement.toFixed(2)}</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1 font-sans">Clearing on next weekly batch</span>
        </div>

        <div className="bg-[#F7F7F7] border border-slate-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Customer Reviews Index</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-black font-sans">{sellerStats.rating} / 5</span>
            <span className="text-xs text-[#34C759] font-bold font-sans">Excellent</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1 font-sans">Based on active buyer ratings</span>
        </div>

        <div className="bg-[#F7F7F7] border border-slate-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-[#34C759] uppercase tracking-widest block font-sans">Settlement Wallet Balance</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-[#34C759] font-sans">${sellerStats.walletBalance.toFixed(2)}</span>
          </div>
          <span className="text-[10px] text-[#34C759]/80 block mt-1 font-sans">Instant payouts unlocked</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form Column: Product Upload with Drag-and-Drop */}
        <div className="lg:col-span-1 bg-white border border-slate-100 p-6 rounded-3xl shadow-lg shadow-slate-100/50 space-y-6">
          <div>
            <span className="text-[10px] font-bold text-[#34C759] uppercase tracking-widest flex items-center gap-1.5 font-mono">
              <Store className="h-3.5 w-3.5 animate-pulse text-[#34C759]" />
              ADD NEW LISTING
            </span>
            <h2 className="text-lg font-bold text-neutral-950 mt-1">Configure Luxury Product</h2>
            <p className="text-xs text-slate-400 mt-1">Deploy handcrafted pieces globally. Uploaded items populate the Customer Shop directory immediately.</p>
          </div>

          <form onSubmit={handleCreateProduct} className="space-y-4">
            
            {/* Integrated Drag-and-drop area */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                dragActive 
                  ? "border-[#34C759] bg-[#34C759]/5" 
                  : "border-slate-200 bg-[#F7F7F7]/50 hover:border-black"
              }`}
            >
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-neutral-800">Drag & drop product imagery here</p>
              <p className="text-[10px] text-slate-400 mt-1">Supports PNG, JPEG, SVG up to 10MB</p>
              <div className="mt-3">
                <span className="text-[10px] bg-white border border-slate-200 px-3 py-1 rounded-lg text-slate-500 hover:text-black hover:border-black transition cursor-pointer">
                  Or click select
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Product Name</label>
                <input
                  id="input-seller-name"
                  type="text"
                  required
                  placeholder="e.g. Royal Brass Candelabra"
                  className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black font-sans"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Brand / Artisan</label>
                <input
                  id="input-seller-brand"
                  type="text"
                  required
                  placeholder="e.g. Atelier Nayel"
                  className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black font-sans"
                  value={prodBrand}
                  onChange={(e) => setProdBrand(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sale Price ($)</label>
                <input
                  id="input-seller-price"
                  type="number"
                  required
                  className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-black focus:outline-none focus:border-black"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Orig Price ($)</label>
                <input
                  id="input-seller-orig-price"
                  type="number"
                  required
                  className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-400 focus:outline-none focus:border-black"
                  value={prodOrigPrice}
                  onChange={(e) => setProdOrigPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Stock Units</label>
                <input
                  id="input-seller-stock"
                  type="number"
                  required
                  className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-black focus:outline-none focus:border-black"
                  value={prodStock}
                  onChange={(e) => setProdStock(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Product Department</label>
              <select
                id="select-seller-category"
                className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-black focus:outline-none focus:border-black"
                value={prodCategory}
                onChange={(e) => setProdCategory(e.target.value)}
              >
                <option value="Furniture">Furniture</option>
                <option value="Lighting">Lighting</option>
                <option value="Vases & Pots">Vases & Pots</option>
                <option value="Rugs & Carpets">Rugs & Carpets</option>
                <option value="Wall Decor">Wall Decor</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description Overview</label>
              <textarea
                id="textarea-seller-desc"
                required
                rows={3}
                placeholder="Detail materials, dimensions, custom designs, styling hints..."
                className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black font-sans"
                value={prodDescription}
                onChange={(e) => setProdDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Specifications (Line by line)</label>
              <textarea
                id="textarea-seller-specs"
                rows={2}
                placeholder="Solid handcrafted European Oak construct&#10;Non-toxic protective vegetable oil seal"
                className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none font-sans focus:border-black"
                value={prodSpecs}
                onChange={(e) => setProdSpecs(e.target.value)}
              />
            </div>

            <button
              id="btn-seller-publish"
              type="submit"
              className="w-full bg-[#34C759] hover:bg-[#2eb04e] text-white font-bold py-3.5 rounded-2xl text-xs transition-all shadow-lg shadow-[#34C759]/20 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Deploy Listing To Store</span>
            </button>
          </form>
        </div>

        {/* Right Columns: Inventory management table & Payout ledgers */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Inventory List */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-lg shadow-slate-100/50 space-y-4">
            <h3 className="font-bold text-black text-sm uppercase tracking-wider">Active Store Catalog Inventory ({myProducts.length})</h3>
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-600">
                <thead>
                  <tr className="bg-[#F7F7F7] border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                    <th className="p-3">Decor Item</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Price</th>
                    <th className="p-3 text-center">In-Stock Reserve</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {myProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 font-light">
                        No product items uploaded yet under your custom store registry.
                      </td>
                    </tr>
                  ) : (
                    myProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="p-3 font-bold text-black">{p.name}</td>
                        <td className="p-3 font-mono text-slate-400 font-semibold">{p.sku}</td>
                        <td className="p-3 font-mono font-bold text-black">${p.price}</td>
                        <td className="p-3 text-center">
                          <input
                            id={`input-stock-level-${p.id}`}
                            type="number"
                            min="0"
                            className="bg-[#F7F7F7] border border-slate-200 rounded-lg text-center text-black px-2 py-1 w-16 font-mono font-bold focus:border-black focus:outline-none"
                            value={p.stock}
                            onChange={(e) => updateProductStock(p.id, parseInt(e.target.value, 10) || 0)}
                          />
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-[9px] bg-[#34C759]/10 text-[#34C759] px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                            ACTIVE
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Wallet Payouts History Logs */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-lg shadow-slate-100/50 space-y-4">
            <h3 className="font-bold text-black text-sm uppercase tracking-wider">Settlements & Payout Ledger</h3>
            <div className="divide-y divide-slate-100 space-y-3">
              {sellerStats.transactions.map((tx) => (
                <div key={tx.id} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-black block">{tx.description}</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(tx.timestamp).toLocaleDateString()} • {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold text-sm ${tx.type === "credit" ? "text-[#34C759]" : "text-rose-500"}`}>
                      {tx.type === "credit" ? "+" : "-"}${tx.amount.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-slate-400 block uppercase font-mono mt-0.5">{tx.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
