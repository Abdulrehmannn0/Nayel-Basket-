/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Product } from "../types";
import { useApp } from "../context/AppContext";
import { Star, Heart, ShoppingBag, Plus } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { wishlist, toggleWishlist, addToCart } = useApp();
  const isWishlisted = wishlist.some((p) => p.id === product.id);

  const discountPercent = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, product.sizes?.[0] || "Standard", product.colors?.[0] || "Natural");
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onSelect(product)}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col h-full relative"
    >
      {/* Product Image Area */}
      <div className="relative aspect-square w-full bg-[#F7F7F7] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
        />

        {/* Wishlist Button */}
        <button
          id={`btn-wishlist-card-${product.id}`}
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm hover:scale-110 active:scale-90 transition-all cursor-pointer z-10 ${
            isWishlisted ? "text-[#34C759]" : "text-slate-400 hover:text-slate-950"
          }`}
        >
          <Heart className="h-4.5 w-4.5" fill={isWishlisted ? "#34C759" : "none"} strokeWidth={2} />
        </button>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-[#34C759] text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider">
            {discountPercent}% OFF
          </span>
        )}

        {/* Quick Add Overlay Button for Desktop */}
        <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden md:block">
          <button
            id={`btn-quickadd-card-${product.id}`}
            onClick={handleQuickAdd}
            className="w-full py-2.5 bg-black hover:bg-neutral-900 text-white text-xs font-semibold rounded-xl tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>QUICK ADD</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-grow space-y-2">
        <div className="flex items-center justify-between text-[10px] tracking-wider text-slate-400 font-medium uppercase font-sans">
          <span>{product.brand}</span>
          <div className="flex items-center gap-0.5 text-slate-700">
            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-slate-800">{product.rating.toFixed(1)}</span>
          </div>
        </div>

        <h3 className="font-semibold text-sm text-neutral-950 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-neutral-800 transition-colors">
          {product.name}
        </h3>

        {/* Price and Add Button for Mobile */}
        <div className="flex items-end justify-between pt-1 mt-auto">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-neutral-950 font-sans">${product.price}</span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through font-sans">${product.originalPrice}</span>
              )}
            </div>
          </div>

          {/* Touch-friendly Quick Add Button for Mobile */}
          <button
            id={`btn-mobadd-card-${product.id}`}
            onClick={handleQuickAdd}
            className="p-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-xl transition md:hidden cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
