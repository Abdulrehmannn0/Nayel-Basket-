/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Product } from "../types";
import { useApp } from "../context/AppContext";
import { Star, Heart, ShoppingBag, Plus, Sparkles, CheckCircle2 } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { wishlist, toggleWishlist, addToCart, theme, addNotification } = useApp();
  const isWishlisted = wishlist.some((p) => p.id === product.id);

  const discountPercent = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) {
      addNotification("⚠️ Out of Stock", `${product.name} is temporarily sold out.`, "system");
      return;
    }
    addToCart(product, 1, product.sizes?.[0] || "Standard", product.colors?.[0] || "Natural");
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  // Helper to generate a consistent Delivery ETA based on product ID
  const getDeliveryETA = () => {
    const daysOffset = (product.id.charCodeAt(product.id.length - 1) % 3) + 2; // 2 to 4 days
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    const options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
    return `Delivered by ${date.toLocaleDateString("en-US", options)}`;
  };

  // Helper to render Stock Status
  const renderStockStatus = () => {
    if (product.stock <= 0) {
      return (
        <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
          Sold Out
        </span>
      );
    }
    if (product.stock <= 3) {
      return (
        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full animate-pulse">
          Only {product.stock} left
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
        In Stock
      </span>
    );
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onSelect(product)}
      className="group bg-white dark:bg-slate-900/60 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 cursor-pointer flex flex-col h-full relative"
    >
      {/* Product Image Area */}
      <div className="relative aspect-[4/5] w-full bg-[#FBFBFB] dark:bg-slate-950/40 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Top Badges & Triggers overlay */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
          {/* Discount Badge */}
          {discountPercent > 0 ? (
            <span className="pointer-events-auto bg-black dark:bg-emerald-500 text-white text-[9px] font-black tracking-wider px-2.5 py-1 rounded-full uppercase shadow-md font-sans">
              -{discountPercent}%
            </span>
          ) : (
            <span className="pointer-events-auto bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[8px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase font-mono">
              CURATED
            </span>
          )}

          {/* Wishlist Trigger */}
          <button
            id={`btn-wishlist-card-${product.id}`}
            onClick={handleWishlist}
            className={`pointer-events-auto p-2 rounded-full backdrop-blur-md shadow-lg transform active:scale-95 hover:scale-110 transition-all duration-300 cursor-pointer ${
              isWishlisted 
                ? "bg-rose-500/10 dark:bg-rose-500/20 text-rose-500" 
                : "bg-white/80 dark:bg-slate-900/80 text-slate-400 hover:text-rose-500 hover:bg-rose-500/5"
            }`}
          >
            <Heart className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} strokeWidth={isWishlisted ? 0 : 2} />
          </button>
        </div>

        {/* Quick Add Overlay Button for Desktop */}
        <div className="absolute inset-x-4 bottom-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden md:block z-10">
          <button
            id={`btn-quickadd-card-${product.id}`}
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className={`w-full py-3 text-xs font-bold rounded-2xl tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase ${
              product.stock <= 0
                ? "bg-slate-200 dark:bg-slate-850 text-slate-400 cursor-not-allowed"
                : "bg-black hover:bg-neutral-900 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white"
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>{product.stock <= 0 ? "SOLD OUT" : "QUICK BAG"}</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-5 flex flex-col flex-grow space-y-3 bg-white dark:bg-slate-900/30">
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-[0.15em] text-slate-400 dark:text-slate-500 font-bold uppercase font-sans">
            {product.brand}
          </span>
          {renderStockStatus()}
        </div>

        <div className="space-y-1">
          <h3 className="font-semibold text-[13px] text-neutral-900 dark:text-neutral-100 leading-snug line-clamp-2 min-h-[2.2rem] group-hover:text-emerald-500 transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-2.5 w-2.5 ${i < Math.floor(product.rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-slate-700"}`} 
                />
              ))}
            </div>
            <span className="font-semibold text-neutral-800 dark:text-neutral-300 text-[11px]">{product.rating.toFixed(1)}</span>
            <span className="text-[10px]">({product.reviewCount || 15} reviews)</span>
          </div>
        </div>

        {/* Delivery ETA */}
        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-sans border-t border-slate-50 dark:border-slate-800/50 pt-2.5">
          <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
          <span>{getDeliveryETA()}</span>
        </div>

        {/* Price and Add Button for Mobile */}
        <div className="flex items-center justify-between pt-1 mt-auto">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-neutral-950 dark:text-white font-sans">${product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 dark:text-slate-600 line-through font-sans font-light">${product.originalPrice}</span>
            )}
          </div>

          {/* Touch-friendly Quick Add Button for Mobile */}
          <button
            id={`btn-mobadd-card-${product.id}`}
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className={`p-2 rounded-xl transition md:hidden cursor-pointer ${
              product.stock <= 0
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                : "bg-neutral-100 hover:bg-neutral-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-neutral-900 dark:text-white"
            }`}
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
