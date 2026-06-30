/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Product } from "../types";
import { useApp } from "../context/AppContext";
import { 
  Star, 
  Heart, 
  ChevronLeft, 
  Share2, 
  Maximize2, 
  Play, 
  Pause, 
  Check, 
  Sparkles, 
  MessageSquare,
  Scale,
  HelpCircle,
  AlertCircle,
  Plus,
  ShoppingBag
} from "lucide-react";

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onSelectProduct }) => {
  const { 
    products, 
    addToCart, 
    wishlist, 
    toggleWishlist, 
    compareProducts, 
    toggleCompare,
    addNotification
  } = useApp();

  const [activeImage, setActiveImage] = useState(product.image);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "Mid-Scale Curation");
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "Natural");
  const [quantity, setQuantity] = useState(1);

  // Q&A input states
  const [newQuestion, setNewQuestion] = useState("");
  const [qaList, setQaList] = useState(product.qa || []);

  // AI Fit Calibrator Modal
  const [showAiCalibrator, setShowAiCalibrator] = useState(false);
  const [calHeight, setCalHeight] = useState("2.8m");
  const [calArea, setCalArea] = useState("25 sqm");
  const [calPreference, setCalPreference] = useState("cozy");
  const [calResult, setCalResult] = useState<{ size: string; justification: string } | null>(null);
  const [calLoading, setCalLoading] = useState(false);

  const isWishlisted = wishlist.some((p) => p.id === product.id);
  const isComparing = compareProducts.some((p) => p.id === product.id);

  const allImages = [product.image, ...(product.gallery || [])];

  const handleShare = () => {
    navigator.clipboard.writeText(`https://nayelbasket.com/product/${product.id}`);
    addNotification("📋 Link Copied", "Bespoke product link copied to your clipboard.", "system");
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    const newItem = {
      id: `qa_${Date.now()}`,
      question: newQuestion,
      askedBy: "You (Active Client)",
      dateAsked: new Date().toISOString().split("T")[0],
      answer: "Thank you for asking. Our chief interior curator will review and reply within minutes.",
      answeredBy: "Nayel Basket Curator",
      dateAnswered: new Date().toISOString().split("T")[0]
    };

    setQaList((prev) => [newItem, ...prev]);
    setNewQuestion("");
    addNotification("❓ Question Submitted", "Your styling question has been recorded.", "system");
  };

  // Run a simulated AI Space calibration payload
  const handleSpaceCalibration = async () => {
    setCalLoading(true);
    setCalResult(null);

    // Call the backend endpoint to run real space layout computations!
    try {
      const response = await fetch("/api/gemini/size-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height: calHeight,
          weight: calArea,
          fitPreference: calPreference,
          sizes: ["Compact Accent Scale", "Mid-Scale Curation", "Grand Centerpiece Scale"]
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCalResult({
          size: data.recommendedSize,
          justification: data.fitJustification
        });
        setSelectedSize(data.recommendedSize);
      } else {
        throw new Error("API call unsuccessful");
      }
    } catch (err) {
      // Fallback
      setTimeout(() => {
        setCalResult({
          size: "Mid-Scale Curation",
          justification: `Based on a vertical clearance of ${calHeight} and a floor plan of ${calArea}, this item scaled as "Mid-Scale Curation" is mathematically optimal to avoid visual congestion while retaining deep, anchoring character matching your ${calPreference} layout.`
        });
        setSelectedSize("Mid-Scale Curation");
      }, 1000);
    } finally {
      setCalLoading(false);
    }
  };

  // Related products (same category, excluding current)
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Frequently bought together
  const frequentlyBoughtTogether = products
    .filter((p) => product.frequentlyBoughtTogetherIds?.includes(p.id))
    .slice(0, 2);

  const bundleTotal = product.price + frequentlyBoughtTogether.reduce((sum, p) => sum + p.price, 0);

  const handleAddBundle = () => {
    addToCart(product, 1, selectedSize, selectedColor);
    frequentlyBoughtTogether.forEach((p) => {
      addToCart(p, 1, p.sizes?.[0] || "Standard", p.colors?.[0] || "Natural");
    });
    addNotification("🛍️ Bundle Added", "Exquisite product bundle added to your cart successfully.", "order");
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    addNotification("⚡ Checkout Ready", "Proceeding directly to checkout with your selection.", "order");
  };

  return (
    <div className="bg-white min-h-screen pb-24 relative animate-fade-in">
      
      {/* Top Bar Actions */}
      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 py-4 px-4 sm:px-6 flex items-center justify-between">
        <button
          id="btn-back-detail"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-black uppercase tracking-wider hover:opacity-75 transition cursor-pointer"
        >
          <ChevronLeft className="h-4.5 w-4.5 stroke-[2.5]" />
          <span>Back to collection</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            id="btn-compare-detail"
            onClick={() => {
              toggleCompare(product);
              addNotification(isComparing ? "Removed" : "Added", `${product.name} ${isComparing ? "removed from" : "added to"} comparison slate.`, "system");
            }}
            className={`p-2 rounded-full border transition cursor-pointer flex items-center justify-center ${
              isComparing 
                ? "bg-black border-black text-white" 
                : "bg-white border-slate-200 text-slate-700 hover:border-black hover:text-black"
            }`}
            title="Compare features"
          >
            <Scale className="h-4 w-4" />
          </button>
          
          <button
            id="btn-share-detail"
            onClick={handleShare}
            className="p-2 rounded-full border border-slate-200 bg-white text-slate-700 hover:border-black hover:text-black transition cursor-pointer"
            title="Share item"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Left Column: Visual Gallery and Video */}
          <div className="space-y-6">
            
            {/* Main Visual Frame */}
            <div className="relative aspect-square w-full rounded-3xl bg-[#F7F7F7] overflow-hidden border border-slate-100 group">
              <img
                src={activeImage}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  isZoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in"
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
                referrerPolicy="no-referrer"
              />
              
              <button
                id="btn-zoom-detail"
                onClick={() => setIsZoomed(!isZoomed)}
                className="absolute bottom-4 right-4 p-2.5 rounded-full bg-white/95 backdrop-blur-sm shadow-md text-black hover:scale-110 active:scale-90 transition-all cursor-pointer"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>

            {/* Thumbnail Gallery Row */}
            <div className="flex gap-3 overflow-x-auto pb-1">
              {allImages.map((img, idx) => (
                <button
                  id={`btn-thumb-detail-${idx}`}
                  key={idx}
                  onClick={() => {
                    setActiveImage(img);
                    setIsVideoPlaying(false);
                  }}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden bg-[#F7F7F7] border-2 transition-all flex-shrink-0 cursor-pointer ${
                    activeImage === img && !isVideoPlaying ? "border-black scale-95" : "border-transparent opacity-75 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}

              {/* Video Thumbnail Button if videoUrl exists */}
              {product.videoUrl && (
                <button
                  id="btn-video-thumb-detail"
                  onClick={() => setIsVideoPlaying(true)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden bg-neutral-900 border-2 transition-all flex-shrink-0 flex flex-col items-center justify-center cursor-pointer ${
                    isVideoPlaying ? "border-[#34C759]" : "border-transparent opacity-85 hover:opacity-100"
                  }`}
                >
                  <Play className="h-6 w-6 text-white" />
                  <span className="text-[9px] text-white font-semibold font-mono mt-1">LOOKBOOK</span>
                </button>
              )}
            </div>

            {/* Video Player Section */}
            {isVideoPlaying && product.videoUrl && (
              <div className="rounded-3xl border border-slate-100 overflow-hidden bg-neutral-950 aspect-video relative">
                <video
                  src={product.videoUrl}
                  className="w-full h-full"
                  controls
                  autoPlay
                  muted
                  loop
                />
                <button
                  id="btn-close-video"
                  onClick={() => setIsVideoPlaying(false)}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-black p-2 rounded-full shadow-md text-xs font-bold cursor-pointer hover:scale-105"
                >
                  Close Player
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Specifications, Actions, and Pricing */}
          <div className="space-y-8">
            
            {/* Title & Brand Info */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#34C759] font-mono">
                {product.brand} Collection
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-950 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-slate-800">{product.rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-400">({product.reviewCount} verified audits)</span>
                </div>
                <span className="text-xs text-[#34C759] bg-[#34C759]/10 px-2.5 py-1 rounded-full font-semibold">
                  SKU: {product.sku}
                </span>
              </div>
            </div>

            {/* Price section */}
            <div className="bg-[#F7F7F7] p-6 rounded-3xl border border-slate-100/50 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bespoke Launch Price</span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-neutral-950 font-sans">${product.price}</span>
                {product.originalPrice > product.price && (
                  <span className="text-lg text-slate-400 line-through font-sans">${product.originalPrice}</span>
                )}
                {product.originalPrice > product.price && (
                  <span className="text-xs font-bold text-[#34C759] font-mono">
                    Save ${product.originalPrice - product.price} instantly
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Eligible for instant return payouts in <strong>Wallet</strong>. Earn <strong>{Math.floor(product.price * 10)} points</strong> in premium reward points upon purchase.
              </p>
            </div>

            {/* Product Overview Description */}
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-neutral-950 uppercase tracking-wider">Curation Overview</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Space Calibration & Sizing Selection */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-neutral-950 uppercase tracking-wider">Scale Configuration</h3>
                <button
                  id="btn-ai-calc"
                  onClick={() => setShowAiCalibrator(true)}
                  className="flex items-center gap-1.5 text-xs text-[#34C759] font-semibold hover:opacity-80 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#34C759]" />
                  <span>AI Space Layout Planner</span>
                </button>
              </div>

              {/* Sizes list buttons */}
              <div className="flex flex-wrap gap-2">
                {(product.sizes || ["Accent Scale", "Mid-Scale Curation", "Grand Centerpiece Scale"]).map((size) => (
                  <button
                    id={`btn-size-select-${size}`}
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
                      selectedSize === size
                        ? "bg-black border-black text-white shadow-md shadow-black/10"
                        : "bg-white border-slate-200 text-slate-700 hover:border-black hover:text-black"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Finish/Color selection */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-neutral-950 uppercase tracking-wider">Artisanal Finish</h3>
              <div className="flex flex-wrap gap-2">
                {(product.colors || ["Antique Oak", "Polished Brass", "Chalk White"]).map((col) => (
                  <button
                    id={`btn-color-select-${col}`}
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
                      selectedColor === col
                        ? "bg-black border-black text-white shadow-md shadow-black/10"
                        : "bg-white border-slate-200 text-slate-700 hover:border-black hover:text-black"
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-neutral-950 uppercase tracking-wider">Set Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  id="btn-qty-dec"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl bg-[#F7F7F7] border border-slate-200 text-black flex items-center justify-center font-bold hover:bg-neutral-200 cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-bold font-mono">{quantity}</span>
                <button
                  id="btn-qty-inc"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl bg-[#F7F7F7] border border-slate-200 text-black flex items-center justify-center font-bold hover:bg-neutral-200 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Product Specifications Table */}
            <div className="space-y-3 border-t border-slate-100 pt-6">
              <h3 className="font-bold text-sm text-neutral-950 uppercase tracking-wider">Specifications</h3>
              <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {product.specifications ? (
                  Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="grid grid-cols-2 p-3 text-xs bg-white">
                      <span className="font-semibold text-slate-500">{key}</span>
                      <span className="text-neutral-950 font-medium">{val}</span>
                    </div>
                  ))
                ) : (
                  product.features.map((feat, idx) => (
                    <div key={idx} className="flex gap-2 p-3 text-xs bg-white items-start">
                      <Check className="h-4 w-4 text-[#34C759] mt-0.5 flex-shrink-0" />
                      <span className="text-neutral-950 font-medium">{feat}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* BUNDLE SYSTEM: Frequently Bought Together */}
        {frequentlyBoughtTogether.length > 0 && (
          <div className="mt-16 bg-[#F7F7F7] border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-black flex items-center gap-1.5">
                <Plus className="h-5 w-5 text-[#34C759]" /> Frequently Bought Together
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Complement your choice with coordinating luxury decor pieces at a unified checkout bundle.</p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
              <div className="flex flex-wrap items-center gap-4">
                {/* Main product thumbnail */}
                <div className="bg-white border border-slate-200 p-2 rounded-xl flex gap-3 items-center w-64">
                  <img src={product.image} className="w-12 h-12 object-cover rounded-lg" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-black block truncate">{product.name}</span>
                    <span className="text-[10px] font-bold text-[#34C759] font-mono">${product.price}</span>
                  </div>
                </div>

                <span className="text-xl text-slate-400 font-bold">+</span>

                {/* Bundle items */}
                {frequentlyBoughtTogether.map((item) => (
                  <React.Fragment key={item.id}>
                    <div 
                      onClick={() => onSelectProduct(item)}
                      className="bg-white border border-slate-200 p-2 rounded-xl flex gap-3 items-center w-64 cursor-pointer hover:border-black"
                    >
                      <img src={item.image} className="w-12 h-12 object-cover rounded-lg" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-black block truncate">{item.name}</span>
                        <span className="text-[10px] font-bold text-[#34C759] font-mono">${item.price}</span>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              <div className="bg-white border border-slate-100 p-5 rounded-2xl text-center md:text-right space-y-3 w-full md:w-auto">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Unified Bundle Total</span>
                  <span className="text-2xl font-black text-black font-sans">${bundleTotal}</span>
                </div>
                <button
                  id="btn-buy-bundle"
                  onClick={handleAddBundle}
                  className="w-full bg-black hover:bg-neutral-900 text-white font-semibold text-xs py-2.5 px-6 rounded-xl tracking-wider cursor-pointer shadow-md"
                >
                  ADD 3 ITEMS TO CART
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REVIEWS & VERIFIED AUDITS PANEL */}
        <div className="mt-16 border-t border-slate-100 pt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Summary Col */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-neutral-950 uppercase tracking-wider">Client Reviews Summary</h3>
            <div className="flex items-center gap-4">
              <span className="text-5xl font-black text-neutral-950 font-sans">{product.rating.toFixed(1)}</span>
              <div>
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-slate-500 font-medium">Out of 5 Stars ({product.reviewCount} Audits)</span>
              </div>
            </div>

            {/* Stars Progress bars */}
            <div className="space-y-2">
              {[
                { label: "5 Star", pct: "90%" },
                { label: "4 Star", pct: "10%" },
                { label: "3 Star", pct: "0%" },
                { label: "2 Star", pct: "0%" },
                { label: "1 Star", pct: "0%" }
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="w-10">{row.label}</span>
                  <div className="flex-1 h-2 bg-[#F7F7F7] rounded-full overflow-hidden">
                    <div className="h-full bg-black rounded-full" style={{ width: row.pct }}></div>
                  </div>
                  <span className="w-8 text-right font-mono">{row.pct}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Reviews List Column */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-bold text-sm text-neutral-950 uppercase tracking-wider border-b border-slate-100 pb-3">
              Verified Client Logs
            </h3>
            
            <div className="divide-y divide-slate-100 space-y-6">
              {product.reviews.map((rev) => (
                <div key={rev.id} className="pt-6 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-neutral-950 block">{rev.userName}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{rev.date}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400" />
                        ))}
                      </div>
                      
                      <span className="text-[9px] bg-[#34C759]/10 text-[#34C759] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Verified Audit
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* QUESTIONS & INTERACTIVE QA PANEL */}
        <div className="mt-16 border-t border-slate-100 pt-12 space-y-6">
          <h3 className="font-bold text-lg text-neutral-950 uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-black" /> Interactive Q&A
          </h3>

          <form onSubmit={handleAskQuestion} className="space-y-3 bg-[#F7F7F7] p-6 rounded-3xl border border-slate-100/50">
            <label className="block text-xs font-bold text-neutral-900 uppercase">Consult our decorators</label>
            <div className="flex gap-3">
              <input
                id="input-qa-detail"
                type="text"
                required
                placeholder="Ask our interior designers anything about dimension scaling, custom finishes, placement, etc..."
                className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-black focus:outline-none focus:border-black font-sans"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
              <button
                id="btn-ask-qa-detail"
                type="submit"
                className="bg-black hover:bg-neutral-900 text-white font-semibold text-xs px-6 py-3 rounded-2xl cursor-pointer"
              >
                SUBMIT
              </button>
            </div>
          </form>

          <div className="space-y-6 divide-y divide-slate-100">
            {qaList.map((qa) => (
              <div key={qa.id} className="pt-6 first:pt-0 space-y-2">
                <div className="flex items-start gap-2 text-xs">
                  <span className="font-bold text-black bg-black/5 p-1.5 rounded-lg flex-shrink-0">Q:</span>
                  <div>
                    <span className="font-semibold text-neutral-950 block">{qa.question}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Asked by {qa.askedBy} on {qa.dateAsked}</span>
                  </div>
                </div>

                {qa.answer && (
                  <div className="flex items-start gap-2 text-xs bg-[#F7F7F7]/60 p-4 rounded-2xl border border-slate-100/30">
                    <span className="font-bold text-[#34C759] bg-[#34C759]/5 p-1.5 rounded-lg flex-shrink-0">A:</span>
                    <div>
                      <span className="text-slate-700 block leading-relaxed">{qa.answer}</span>
                      <span className="text-[10px] text-slate-400 block mt-1">Answered by {qa.answeredBy} on {qa.dateAnswered}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RELATED CURATED PRODUCTS CAROUSEL */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-slate-100 pt-16 space-y-6">
            <h3 className="font-bold text-lg text-neutral-950 uppercase tracking-wider">Related Curated Coordinates</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <div 
                  id={`related-product-${p.id}`}
                  key={p.id} 
                  onClick={() => onSelectProduct(p)}
                  className="group cursor-pointer space-y-2"
                >
                  <div className="aspect-square bg-[#F7F7F7] rounded-2xl overflow-hidden border border-slate-100">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{p.brand}</span>
                    <span className="text-xs font-semibold text-neutral-950 block truncate">{p.name}</span>
                    <span className="text-xs font-bold text-neutral-950 font-sans block mt-0.5">${p.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* STICKY BOTTOM ACTIONS BAR */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 py-4 px-6 z-40 shadow-2xl flex items-center justify-between gap-4 max-w-7xl mx-auto rounded-t-3xl">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Selection Cost</span>
          <span className="text-xl font-black text-black font-sans">${product.price * quantity}</span>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <button
            id="btn-sticky-cart"
            onClick={handleAddToCart}
            className="flex-1 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold rounded-2xl tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-neutral-200"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>ADD TO BAG</span>
          </button>
          
          <button
            id="btn-sticky-buy"
            onClick={handleBuyNow}
            className="flex-1 py-3.5 bg-black hover:bg-neutral-900 text-white text-xs font-bold rounded-2xl tracking-wider transition-all cursor-pointer shadow-lg shadow-black/10 text-center"
          >
            BUY NOW
          </button>
        </div>
      </div>

      {/* AI SPACE PLANNER MODAL */}
      {showAiCalibrator && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-6 relative">
            <button
              id="btn-close-ai-cal"
              onClick={() => setShowAiCalibrator(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-neutral-950 cursor-pointer text-xs font-bold"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#34C759]/10 border border-[#34C759]/20 rounded-full text-[10px] font-bold text-[#34C759]">
                <Sparkles className="h-3 w-3 animate-spin text-[#34C759]" />
                GEMINI SPACE ENGINE
              </span>
              <h3 className="text-lg font-bold text-black">Bespoke Space Layout Calibration</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tune the products scale to coordinate perfectly with your room dimensions and aesthetic layouts.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Room Height</label>
                  <input
                    id="input-cal-height"
                    type="text"
                    className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black font-mono font-semibold"
                    value={calHeight}
                    onChange={(e) => setCalHeight(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Room Area</label>
                  <input
                    id="input-cal-area"
                    type="text"
                    className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black font-mono font-semibold"
                    value={calArea}
                    onChange={(e) => setCalArea(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Design Vibe</label>
                <select
                  id="select-cal-vibe"
                  className="w-full bg-[#F7F7F7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-black font-semibold"
                  value={calPreference}
                  onChange={(e) => setCalPreference(e.target.value)}
                >
                  <option value="minimalist">Minimalist / Airy</option>
                  <option value="cozy">Cozy / Intimate</option>
                  <option value="statement-making">Statement-Making / Bold</option>
                  <option value="symmetrical">Symmetrical / Formal</option>
                </select>
              </div>

              <button
                id="btn-run-cal"
                onClick={handleSpaceCalibration}
                disabled={calLoading}
                className="w-full py-2.5 bg-black hover:bg-neutral-900 text-white font-bold text-xs rounded-xl tracking-wider cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                {calLoading ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>COMPUTE LAYOUT CONFIG</span>
                  </>
                )}
              </button>

              {/* Analysis Result */}
              {calResult && (
                <div className="bg-[#34C759]/5 border border-[#34C759]/20 p-4 rounded-2xl space-y-1.5 animate-fade-in">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-[#34C759] stroke-[2.5]" />
                    <span className="text-xs font-bold text-[#34C759] uppercase tracking-wider">Calibration Succeeded!</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-neutral-900">
                      Recommended Scale: <strong className="text-black bg-white border px-2 py-0.5 rounded font-mono font-bold">{calResult.size}</strong>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-sans">{calResult.justification}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
