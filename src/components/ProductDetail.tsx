/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Product, QAItem, Review } from "../types";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  Star, 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
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
  ShoppingBag,
  Eye,
  ShieldCheck,
  Truck,
  RotateCw,
  X,
  Search,
  ThumbsUp,
  Camera,
  Sliders,
  CheckCircle2,
  Copy,
  Send,
  Info
} from "lucide-react";

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
}

// Preset room environments for AR fallback or mock views
const AR_ROOMS = [
  {
    id: "scandi",
    name: "Minimalist Scandinavian Lounge",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
    defaultScale: 0.9,
    defaultY: 20
  },
  {
    id: "loft",
    name: "Modern Industrial Loft",
    image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
    defaultScale: 1.0,
    defaultY: 25
  },
  {
    id: "artdeco",
    name: "Aesthetic Art-Deco Salon",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
    defaultScale: 0.85,
    defaultY: 15
  }
];

// Curated lifestyle review photos matching general luxury decor categories
const LIFESTYLE_PHOTOS = {
  decor: [
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=400&q=80"
  ],
  living: [
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=400&q=80"
  ]
};

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onSelectProduct }) => {
  const { 
    products, 
    addToCart, 
    wishlist, 
    toggleWishlist, 
    compareProducts, 
    toggleCompare,
    addNotification,
    recentlyViewed,
    addToRecentlyViewed
  } = useApp();

  // Add current product to recently viewed list on mount
  useEffect(() => {
    addToRecentlyViewed(product);
  }, [product]);

  // Gallery States
  const allImages = [product.image, ...(product.gallery || [])];
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  // Custom Zoom states (hardware-accelerated mouse-track)
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const zoomContainerRef = useRef<HTMLDivElement>(null);

  // 360 Degree View States
  const [is360Active, setIs360Active] = useState(false);
  const [spinIndex, setSpinIndex] = useState(4); // 0 to 8
  const isDragging360 = useRef(false);
  const startDragX = useRef(0);

  // AR Projection states
  const [showArModal, setShowArModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(AR_ROOMS[0]);
  const [arScale, setArScale] = useState(1.0);
  const [arRotation, setArRotation] = useState(0);
  const [arPosition, setArPosition] = useState({ x: 0, y: 0 });
  const [arCaptureSuccess, setArCaptureSuccess] = useState(false);
  const [useLiveCamera, setUseLiveCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Selection Options
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "Standard Scale");
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "Artisanal Natural");
  const [quantity, setQuantity] = useState(1);

  // Wishlist Burst Animation
  const [heartBurst, setHeartBurst] = useState(false);

  // Delivery Estimator States
  const [pincode, setPincode] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState<{
    calculated: boolean;
    loading: boolean;
    estimatedDays: number;
    shippingOptions: { name: string; price: number; description: string }[];
  } | null>(null);

  // Live Dispatch Cutoff Countdown State
  const [countdownText, setCountdownText] = useState("");

  // Bundle System States
  const frequentlyBoughtTogether = products
    .filter((p) => product.frequentlyBoughtTogetherIds?.includes(p.id))
    .slice(0, 2);
  const [selectedBundleItems, setSelectedBundleItems] = useState<string[]>([
    product.id,
    ...frequentlyBoughtTogether.map((p) => p.id)
  ]);

  // Q&A States
  const [qaSearch, setQaSearch] = useState("");
  const [activeQaTopic, setActiveQaTopic] = useState<"All" | "Dimensions" | "Materials" | "Care">("All");
  const [newQuestion, setNewQuestion] = useState("");
  const [newQuestionTopic, setNewQuestionTopic] = useState("Dimensions");
  const [qaList, setQaList] = useState<QAItem[]>(() => {
    // Enrich seed qa items with mock topics
    return (product.qa || []).map((item, idx) => ({
      ...item,
      // Assign deterministic topics
      category: idx % 2 === 0 ? "Dimensions" : "Materials",
      likes: Math.floor(Math.random() * 8) + 2
    })) as any;
  });

  // Client Reviews States
  const [reviewFilter, setReviewFilter] = useState<"all" | "with-photos" | "positive">("all");
  const [zoomReviewPhoto, setZoomReviewPhoto] = useState<string | null>(null);

  // AI Fit Space Calibration Modal
  const [showAiCalibrator, setShowAiCalibrator] = useState(false);
  const [calHeight, setCalHeight] = useState("2.8 meters");
  const [calArea, setCalArea] = useState("24 sq meters");
  const [calPreference, setCalPreference] = useState("cozy");
  const [calResult, setCalResult] = useState<{ size: string; justification: string } | null>(null);
  const [calLoading, setCalLoading] = useState(false);

  const isWishlisted = wishlist.some((p) => p.id === product.id);
  const isComparing = compareProducts.some((p) => p.id === product.id);

  // Live Countdown logic
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextDispatch = new Date();
      nextDispatch.setHours(17, 0, 0, 0); // 5:00 PM cutoff

      if (now.getHours() >= 17) {
        nextDispatch.setDate(nextDispatch.getDate() + 1);
      }

      const diff = nextDispatch.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdownText(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  // Web camera activation for AR mode
  useEffect(() => {
    if (useLiveCamera && showArModal) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn("Camera access denied or unavailable in sandbox:", err);
          setUseLiveCamera(false);
          addNotification("📷 Camera Restricted", "Enabling premium interior simulator background instead.", "system");
        });
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [useLiveCamera, showArModal]);

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  // Image Zoom handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomContainerRef.current) return;
    const { left, top, width, height } = zoomContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // 360 Degree spin logic
  const handleStart360Drag = (clientX: number) => {
    isDragging360.current = true;
    startDragX.current = clientX;
  };

  const handleMove360Drag = (clientX: number) => {
    if (!isDragging360.current) return;
    const deltaX = clientX - startDragX.current;
    if (Math.abs(deltaX) > 15) {
      const shift = Math.floor(deltaX / 15);
      setSpinIndex((prev) => {
        let next = (prev + shift) % 9;
        if (next < 0) next += 9;
        return next;
      });
      startDragX.current = clientX;
    }
  };

  const handleStop360Drag = () => {
    isDragging360.current = false;
  };

  // Delivery estimation check
  const handleCheckDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim() || pincode.length < 3) return;

    setDeliveryStatus({ calculated: false, loading: true, estimatedDays: 0, shippingOptions: [] });

    setTimeout(() => {
      const randomDays = Math.floor(Math.random() * 3) + 2; // 2 to 4 days
      setDeliveryStatus({
        calculated: true,
        loading: false,
        estimatedDays: randomDays,
        shippingOptions: [
          { 
            name: "Premium Secure Courier", 
            price: 0, 
            description: `Arrives in ${randomDays} days. Includes real-time GPS container tracking and double-layered shock cushioning.` 
          },
          { 
            name: "Elite White-Glove Gold Delivery", 
            price: 35, 
            description: `Arrives in ${Math.max(1, randomDays - 1)} days. Includes expert room placement, unboxing, structural assembly, and eco-friendly packing removal.` 
          }
        ]
      });
      addNotification("🚚 Logistics Synced", `Calculated custom courier rates for destination zone ${pincode}.`, "system");
    }, 1200);
  };

  // Wishlist heart-pulse trigger
  const handleToggleWishlist = () => {
    setHeartBurst(true);
    toggleWishlist(product);
    setTimeout(() => setHeartBurst(false), 800);
  };

  // Share menu builder
  const handleShare = async () => {
    const shareData = {
      title: `Nayel Basket - ${product.name}`,
      text: `Admire this exquisite handcrafted home curation: ${product.name}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Fallback to clipboard
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    addNotification("📋 Link Copied", "Luxurious curation link copied to clipboard.", "system");
  };

  // Q&A submission
  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    const newItem: QAItem & { category: string; likes: number } = {
      id: `qa_${Date.now()}`,
      question: newQuestion,
      askedBy: "Active Client",
      dateAsked: new Date().toISOString().split("T")[0],
      answer: "Processing request... Our senior interior design consultant is assessing the dimensions and spatial placement.",
      answeredBy: "Atelier Curator Node",
      dateAnswered: new Date().toISOString().split("T")[0],
      category: newQuestionTopic,
      likes: 0
    };

    setQaList((prev) => [newItem, ...prev]);
    setNewQuestion("");
    addNotification("❓ Query Logged", "Your styling question has been recorded. Standby for curation response.", "system");

    // Dynamic AI response mockup after 2.5 seconds
    setTimeout(() => {
      setQaList((prev) => prev.map((q) => {
        if (q.id === newItem.id) {
          return {
            ...q,
            answer: `An exquisite question. For matching the ${product.name}, configuring this in our standard "${selectedColor}" finish provides a perfect light-scattering ambiance. It scales beautifully within your room layouts.`,
            answeredBy: "Senior Design Curator (AI Node)"
          };
        }
        return q;
      }));
      addNotification("✨ Curation Advice Ready", "Our AI design system responded to your dimension query.", "ai");
    }, 2800);
  };

  const handleUpvoteQuestion = (id: string) => {
    setQaList((prev) => prev.map((q) => {
      if (q.id === id) {
        return { ...q, likes: (q.likes || 0) + 1 };
      }
      return q;
    }));
  };

  // Dynamic Bundle System Pricing
  const isAllBundleItemsSelected = selectedBundleItems.length === (frequentlyBoughtTogether.length + 1);
  const rawBundleSum = product.price + frequentlyBoughtTogether.reduce((sum, item) => sum + item.price, 0);
  const bundleDiscountedTotal = Math.round(rawBundleSum * 0.9); // 10% bundle discount
  
  const currentSelectionsTotal = [
    product.id,
    ...frequentlyBoughtTogether.map((p) => p.id)
  ].reduce((sum, itemId) => {
    if (!selectedBundleItems.includes(itemId)) return sum;
    if (itemId === product.id) return sum + product.price;
    const itemObj = frequentlyBoughtTogether.find((p) => p.id === itemId);
    return sum + (itemObj ? itemObj.price : 0);
  }, 0);

  const handleToggleBundleSelection = (id: string) => {
    setSelectedBundleItems((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddBundleToBag = () => {
    if (selectedBundleItems.includes(product.id)) {
      addToCart(product, quantity, selectedSize, selectedColor);
    }
    frequentlyBoughtTogether.forEach((p) => {
      if (selectedBundleItems.includes(p.id)) {
        addToCart(p, 1, p.sizes?.[0] || "Standard", p.colors?.[0] || "Natural Wood");
      }
    });
    addNotification("🛍️ Bundle Configured", "Exquisite customized coordinates added directly to your luxury bag.", "order");
  };

  // AI space calibrator engine
  const handleSpaceCalibration = async () => {
    setCalLoading(true);
    setCalResult(null);

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
        throw new Error("Logistics calibration failed");
      }
    } catch (err) {
      setTimeout(() => {
        setCalResult({
          size: "Mid-Scale Curation",
          justification: `Based on your clearance of ${calHeight} and floor dimensions of ${calArea}, our interior placement formulas recommend "Mid-Scale Curation". This balances volume and room breathability perfectly, enhancing empty corridors and preserving light paths.`
        });
        setSelectedSize("Mid-Scale Curation");
      }, 1500);
    } finally {
      setCalLoading(false);
    }
  };

  // Add reviews photos to reviews on client display
  const enrichedReviews = product.reviews.map((rev, idx) => {
    const isAccessory = product.category.toLowerCase().includes("accessory") || product.category.toLowerCase().includes("lighting") || product.category.toLowerCase().includes("candle");
    const photoArr = isAccessory ? LIFESTYLE_PHOTOS.decor : LIFESTYLE_PHOTOS.living;
    return {
      ...rev,
      photos: idx === 0 ? [photoArr[0]] : idx === 1 ? [photoArr[1]] : []
    };
  });

  const filteredReviews = enrichedReviews.filter((rev) => {
    if (reviewFilter === "with-photos") return rev.photos.length > 0;
    if (reviewFilter === "positive") return rev.rating >= 4;
    return true;
  });

  // Simple direct selectors
  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    addNotification("⚡ Fast Purchase Ready", "Your secure selection is locked. Proceeding to elite checkout.", "order");
  };

  // Search filter for Q&A
  const searchedQaList = qaList.filter((item) => {
    const matchesSearch = item.question.toLowerCase().includes(qaSearch.toLowerCase()) || 
                          (item.answer && item.answer.toLowerCase().includes(qaSearch.toLowerCase()));
    const matchesTopic = activeQaTopic === "All" || item.category === activeQaTopic;
    return matchesSearch && matchesTopic;
  });

  // Calculate stock percentage
  const stockPercentage = Math.min(100, Math.max(0, (product.stock / 50) * 100));

  return (
    <div className="bg-[#FAF9F6] dark:bg-[#0D0D0D] text-slate-900 dark:text-neutral-100 min-h-screen pb-32 transition-colors duration-300 relative animate-fade-in">
      
      {/* Dynamic top action sticky rail */}
      <div className="sticky top-16 z-30 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-800/50 py-4 px-4 sm:px-6 flex items-center justify-between">
        <button
          id="btn-back-detail"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-neutral-300 uppercase tracking-widest hover:opacity-75 transition cursor-pointer"
        >
          <ChevronLeft className="h-4.5 w-4.5 stroke-[2.5] text-[#22C55E]" />
          <span>Atelier Collection</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            id="btn-compare-detail"
            onClick={() => {
              toggleCompare(product);
              addNotification(isComparing ? "Removed" : "Added", `${product.name} ${isComparing ? "removed from" : "added to"} slate.`, "system");
            }}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
              isComparing 
                ? "bg-[#22C55E] border-[#22C55E] text-white" 
                : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-400 hover:border-black dark:hover:border-white"
            }`}
            title="Add to product comparison deck"
          >
            <Scale className="h-4 w-4" />
          </button>
          
          <button
            id="btn-share-detail"
            onClick={handleShare}
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-700 dark:text-neutral-400 hover:border-black dark:hover:border-white transition-all cursor-pointer"
            title="Share item"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: Visual Showcase Suite */}
          <div className="space-y-6 lg:sticky lg:top-32">
            
            <div className="relative aspect-square w-full rounded-3xl bg-neutral-100 dark:bg-neutral-900 overflow-hidden border border-neutral-200/50 dark:border-neutral-800/50 shadow-lg group">
              
              <AnimatePresence mode="wait">
                {/* 1. Main View (Normal with mouse zoom) */}
                {!is360Active && !isVideoPlaying && (
                  <motion.div
                    key="image-frame"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full cursor-zoom-in overflow-hidden relative"
                    ref={zoomContainerRef}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                    onClick={() => setIsZoomed(!isZoomed)}
                  >
                    <img
                      src={allImages[activeImageIdx]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-100 ease-out"
                      style={{
                        transform: isZoomed ? "scale(2.4)" : "scale(1.0)",
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                      }}
                      referrerPolicy="no-referrer"
                    />

                    {/* Lens effect indicator overlay */}
                    {isZoomed && (
                      <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-sm text-white text-[9px] font-mono tracking-widest px-2.5 py-1 rounded-full uppercase border border-neutral-800">
                        HD Lens Active (2.4x)
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 2. 360 Studio Mode */}
                {is360Active && !isVideoPlaying && (
                  <motion.div
                    key="360-frame"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-neutral-50 to-neutral-200 dark:from-neutral-900 dark:to-neutral-950 relative select-none cursor-ew-resize"
                    onMouseDown={(e) => handleStart360Drag(e.clientX)}
                    onMouseMove={(e) => handleMove360Drag(e.clientX)}
                    onMouseUp={handleStop360Drag}
                    onMouseLeave={handleStop360Drag}
                    onTouchStart={(e) => handleStart360Drag(e.touches[0].clientX)}
                    onTouchMove={(e) => handleMove360Drag(e.touches[0].clientX)}
                    onTouchEnd={handleStop360Drag}
                  >
                    {/* Spin product image wrapper */}
                    <div 
                      className="w-4/5 h-4/5 relative transition-all duration-300"
                      style={{
                        transform: `rotateY(${(spinIndex - 4) * 40}deg) scale(0.95)`,
                        filter: "drop-shadow(0 25px 35px rgba(0, 0, 0, 0.15))"
                      }}
                    >
                      <img
                        src={product.image}
                        alt="360 view"
                        className="w-full h-full object-contain pointer-events-none"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Reflection glass layer */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none rounded-2xl" />
                    </div>

                    {/* Radial spin tracking bar */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 w-2/3">
                      <div className="flex gap-1 justify-center w-full">
                        {Array.from({ length: 9 }).map((_, idx) => (
                          <div 
                            key={idx}
                            className={`h-1 rounded-full transition-all duration-200 ${
                              idx === spinIndex ? "bg-[#22C55E] w-6" : "bg-neutral-300 dark:bg-neutral-700 w-2"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase animate-pulse">
                        Drag horizontally to rotate 360°
                      </span>
                    </div>

                    <div className="absolute top-4 right-4 bg-[#22C55E]/10 border border-[#22C55E]/25 text-[#22C55E] text-[10px] font-bold font-mono px-3 py-1 rounded-full tracking-widest">
                      360° STUDIO MODE
                    </div>
                  </motion.div>
                )}

                {/* 3. Lookbook Video Player */}
                {isVideoPlaying && product.videoUrl && (
                  <motion.div
                    key="video-frame"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full bg-black relative"
                  >
                    <video
                      src={product.videoUrl}
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                      muted
                      loop
                    />
                    <button
                      id="btn-close-lookbook-video"
                      onClick={() => setIsVideoPlaying(false)}
                      className="absolute top-4 right-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm text-neutral-900 dark:text-white p-2 rounded-full shadow-lg border border-neutral-200 dark:border-neutral-800 text-xs font-bold hover:scale-105 active:scale-95 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Floating Action Buttons on main frame */}
              <div className="absolute bottom-4 left-4 flex gap-2 z-10">
                {/* 360 switch */}
                <button
                  id="btn-toggle-360"
                  onClick={() => {
                    setIs360Active(!is360Active);
                    setIsVideoPlaying(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono tracking-widest flex items-center gap-1.5 border backdrop-blur-md transition-all shadow-md cursor-pointer ${
                    is360Active 
                      ? "bg-[#22C55E] text-white border-[#22C55E]" 
                      : "bg-white/90 dark:bg-black/90 text-neutral-900 dark:text-neutral-100 border-neutral-200 dark:border-neutral-800"
                  }`}
                >
                  <RotateCw className="h-3 w-3 animate-spin-slow" />
                  <span>360° VIEW</span>
                </button>

                {/* AR Hologram Button */}
                <button
                  id="btn-trigger-ar"
                  onClick={() => setShowArModal(true)}
                  className="px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono tracking-widest flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-black/90 text-neutral-900 dark:text-neutral-100 backdrop-blur-md transition-all shadow-md hover:border-[#22C55E] hover:text-[#22C55E] cursor-pointer"
                >
                  <Camera className="h-3 w-3" />
                  <span>PROJECT AR</span>
                </button>
              </div>

              {/* Next/Prev Carousel Buttons (Only in static image mode) */}
              {!is360Active && !isVideoPlaying && (
                <>
                  <button
                    id="btn-prev-slide"
                    onClick={() => setActiveImageIdx((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 active:scale-95 cursor-pointer shadow-md"
                  >
                    <ChevronLeft className="h-4.5 w-4.5 stroke-[2.5]" />
                  </button>
                  <button
                    id="btn-next-slide"
                    onClick={() => setActiveImageIdx((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 active:scale-95 cursor-pointer shadow-md"
                  >
                    <ChevronRight className="h-4.5 w-4.5 stroke-[2.5]" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Carousel Drawer */}
            <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-neutral-300">
              {allImages.map((img, idx) => (
                <button
                  id={`btn-thumb-select-${idx}`}
                  key={idx}
                  onClick={() => {
                    setActiveImageIdx(idx);
                    setIs360Active(false);
                    setIsVideoPlaying(false);
                  }}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 border-2 transition-all flex-shrink-0 cursor-pointer ${
                    activeImageIdx === idx && !is360Active && !isVideoPlaying 
                      ? "border-[#22C55E] scale-95 shadow-md" 
                      : "border-neutral-200/50 dark:border-neutral-800/50 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}

              {/* Lookbook Video Thumbnail */}
              {product.videoUrl && (
                <button
                  id="btn-video-thumb-trigger"
                  onClick={() => {
                    setIsVideoPlaying(true);
                    setIs360Active(false);
                  }}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden bg-neutral-950 border-2 transition-all flex-shrink-0 flex flex-col items-center justify-center cursor-pointer ${
                    isVideoPlaying ? "border-[#22C55E] scale-95 shadow-md" : "border-transparent opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="absolute inset-0 bg-neutral-950/65" />
                  <Play className="h-5 w-5 text-[#22C55E] relative z-10" />
                  <span className="text-[8px] text-[#22C55E] font-bold font-mono relative z-10 mt-1 uppercase tracking-widest">LOOKBOOK</span>
                </button>
              )}
            </div>

            {/* Quality & Return Guarantees */}
            <div className="grid grid-cols-3 gap-3 border-t border-neutral-200/60 dark:border-neutral-800/60 pt-6">
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-900">
                <ShieldCheck className="h-5 w-5 text-[#22C55E] mb-1.5" />
                <span className="text-[10px] font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">10-Year Warranty</span>
                <span className="text-[8px] text-neutral-400 mt-0.5 block">Lifetime Structural Guard</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-900">
                <Truck className="h-5 w-5 text-[#22C55E] mb-1.5" />
                <span className="text-[10px] font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">Insured Cargo</span>
                <span className="text-[8px] text-neutral-400 mt-0.5 block">Free White-Glove transit</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-900">
                <RotateCw className="h-5 w-5 text-[#22C55E] mb-1.5" />
                <span className="text-[10px] font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">30-Day Escrow</span>
                <span className="text-[8px] text-neutral-400 mt-0.5 block">No-Questions Return</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Technical Details & Premium Selection */}
          <div className="space-y-8">
            
            {/* Metadata, Star reviews and Title area */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#22C55E] font-mono">
                  {product.brand} • CURATED HOME LUXURY
                </span>
                
                {/* Wishlist burst animation wrapped */}
                <button
                  id="btn-toggle-wishlist-detail"
                  onClick={handleToggleWishlist}
                  className="relative p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm active:scale-90 transition cursor-pointer flex items-center justify-center"
                >
                  <Heart 
                    className={`h-4.5 w-4.5 transition-colors ${
                      isWishlisted ? "text-red-500 fill-red-500" : "text-neutral-400"
                    }`} 
                  />
                  
                  {/* Floating particle sparkle dots */}
                  {heartBurst && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="absolute w-1.5 h-1.5 bg-red-500 rounded-full animate-ping [animation-delay:-0.2s]"></span>
                      <span className="absolute w-1 h-1 bg-[#22C55E] rounded-full animate-ping"></span>
                    </div>
                  )}
                </button>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white font-sans leading-tight">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(product.rating) ? "fill-amber-400" : "text-neutral-300"}`} />
                    ))}
                  </div>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">{product.rating.toFixed(1)}</span>
                  <span className="text-neutral-400">({product.reviewCount} Design Audits)</span>
                </div>
                <span className="text-neutral-300 dark:text-neutral-700">|</span>
                <span className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase">SKU: {product.sku}</span>
              </div>
            </div>

            {/* Premium Pricing Panel & Low Stock Density Line */}
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 space-y-4 shadow-sm">
              <div className="flex items-baseline justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Atelier Launch pricing</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3.5xl font-black text-neutral-950 dark:text-white font-sans">${product.price}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-lg text-neutral-400 line-through font-sans">${product.originalPrice}</span>
                    )}
                  </div>
                </div>

                {product.originalPrice > product.price && (
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                    Save ${product.originalPrice - product.price} ({(100 - (product.price / product.originalPrice) * 100).toFixed(0)}% Off)
                  </span>
                )}
              </div>

              {/* Dynamic Live Inventory density slider */}
              <div className="space-y-2 border-t border-neutral-100 dark:border-neutral-800 pt-4">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <AlertCircle className={`h-3.5 w-3.5 ${product.stock < 10 ? "text-red-500 animate-pulse" : "text-[#22C55E]"}`} />
                    Stock Availability
                  </span>
                  <span className={`font-mono font-bold ${product.stock < 10 ? "text-red-500 animate-pulse" : "text-neutral-800 dark:text-neutral-200"}`}>
                    {product.stock > 0 ? `Only ${product.stock} units left in stock` : "Handcrafted on demand"}
                  </span>
                </div>
                
                {product.stock > 0 && (
                  <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        product.stock < 10 ? "bg-red-500" : "bg-[#22C55E]"
                      }`}
                      style={{ width: `${stockPercentage}%` }}
                    />
                  </div>
                )}
                <span className="text-[9px] text-neutral-400 block leading-relaxed font-sans">
                  *Due to the slow-cured materials and hand-carved details, typical restock cycles exceed 12 weeks.
                </span>
              </div>
            </div>

            {/* Scale/Size Selector with AI Spatial Planner Modal link */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-widest block">
                  Scale Configuration
                </span>
                
                <button
                  id="btn-trigger-ai-calibrator"
                  onClick={() => setShowAiCalibrator(true)}
                  className="flex items-center gap-1.5 text-xs text-[#22C55E] font-semibold hover:opacity-80 transition cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 animate-pulse text-[#22C55E]" />
                  <span>AI Space Layout Planner</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {(product.sizes || ["Accent Scale", "Standard Lounge Scale", "Grand Centerpiece Scale"]).map((size) => (
                  <button
                    id={`btn-size-select-${size}`}
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4.5 py-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedSize === size
                        ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-md shadow-black/15 scale-[0.98]"
                        : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color selection */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-widest block">
                Artisanal Finish
              </span>

              <div className="flex flex-wrap gap-2.5">
                {(product.colors || ["Antique Oak Finish", "Polished Brass Tone", "Organic Chalk White"]).map((col) => (
                  <button
                    id={`btn-color-select-${col}`}
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    className={`px-4.5 py-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedColor === col
                        ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-md shadow-black/15 scale-[0.98]"
                        : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white"
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Estimator / Live Postal Code Widget */}
            <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Truck className="h-4.5 w-4.5 text-[#22C55E]" />
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-widest">
                  Logistics & Courier Estimator
                </span>
              </div>

              <form onSubmit={handleCheckDelivery} className="flex gap-2">
                <input
                  id="input-postal-checker"
                  type="text"
                  required
                  placeholder="Enter postal / zip code"
                  className="flex-1 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-[#22C55E] font-mono font-semibold"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
                <button
                  id="btn-pincode-submit"
                  type="submit"
                  className="bg-neutral-950 dark:bg-neutral-800 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl hover:opacity-85 active:scale-95 transition"
                >
                  ESTIMATE
                </button>
              </form>

              {/* Delivery rates output */}
              {deliveryStatus && (
                <div className="space-y-3 pt-1 border-t border-neutral-100 dark:border-neutral-800 animate-fade-in">
                  {deliveryStatus.loading ? (
                    <div className="flex items-center gap-2 py-2 text-xs text-neutral-400">
                      <span className="h-4 w-4 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin"></span>
                      <span>Calculating optimal spatial shipping lines...</span>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {deliveryStatus.shippingOptions.map((opt, idx) => (
                        <div key={idx} className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-900 text-xs flex flex-col gap-1">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-neutral-800 dark:text-neutral-200 uppercase font-sans">{opt.name}</span>
                            <span className="text-emerald-500 font-mono">{opt.price === 0 ? "Complimentary" : `$${opt.price}`}</span>
                          </div>
                          <p className="text-[11px] text-neutral-500 leading-relaxed font-sans">{opt.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Live Dispatch Countdown ticker */}
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-semibold font-mono uppercase tracking-widest justify-center bg-neutral-50 dark:bg-neutral-950 py-2 rounded-xl">
                <span>Dispatch Cutoff:</span>
                <span className="text-[#22C55E] animate-pulse font-bold">{countdownText}</span>
              </div>
            </div>

            {/* Set Quantity and Core Call To Actions */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-widest block">
                  Select Quantity
                </span>
                <div className="flex items-center gap-3">
                  <button
                    id="btn-qty-dec"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-white flex items-center justify-center font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer active:scale-95 transition-all shadow-sm"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-bold font-mono">{quantity}</span>
                  <button
                    id="btn-qty-inc"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-white flex items-center justify-center font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer active:scale-95 transition-all shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Primary action layouts */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  id="btn-add-to-bag-detail"
                  onClick={handleAddToCart}
                  className="w-full py-4 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-950 dark:text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all border border-neutral-950 dark:border-neutral-700 shadow-sm flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4 text-[#22C55E]" />
                  <span>ADD TO BAG</span>
                </button>

                <button
                  id="btn-buy-now-detail"
                  onClick={handleBuyNow}
                  className="w-full py-4 bg-neutral-950 dark:bg-white hover:opacity-90 text-white dark:text-neutral-950 font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-[#22C55E]" />
                  <span>BUY NOW</span>
                </button>
              </div>
            </div>

            {/* Specifications Collapsible / Features */}
            <div className="space-y-4 border-t border-neutral-200/60 dark:border-neutral-800/60 pt-6">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-widest block">
                Technical Specifications
              </span>

              <div className="border border-neutral-200/55 dark:border-neutral-800/55 rounded-2xl overflow-hidden divide-y divide-neutral-200/50 dark:divide-neutral-800/50">
                {product.specifications ? (
                  Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="grid grid-cols-2 p-3 text-xs bg-white dark:bg-neutral-900/60">
                      <span className="font-semibold text-neutral-500 dark:text-neutral-400 font-sans">{key}</span>
                      <span className="text-neutral-900 dark:text-neutral-100 font-semibold text-right font-sans">{val}</span>
                    </div>
                  ))
                ) : (
                  product.features.map((feat, idx) => (
                    <div key={idx} className="flex gap-2.5 p-3.5 text-xs bg-white dark:bg-neutral-900/60 items-start">
                      <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-neutral-900 dark:text-neutral-100 font-medium font-sans">{feat}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* FREQUENTLY BOUGHT TOGETHER BUNDLE SUITE */}
        {frequentlyBoughtTogether.length > 0 && (
          <div className="mt-20 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/10 tracking-widest uppercase border border-[#22C55E]/20 font-mono">
                  <Plus className="h-3 w-3" /> ATELIER INTERIOR BUNDLE
                </span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white font-sans">Frequently Bought Together</h3>
                <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                  Coordinate this masterpiece with related custom decor layouts for a beautifully coherent space.
                </p>
              </div>

              {/* Discount Tag */}
              <div className="bg-emerald-500/10 text-emerald-500 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-500/20 font-mono text-center uppercase tracking-wider shrink-0">
                ⭐ Unified 10% Bundle Discount Applied!
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-8 justify-between border-t border-neutral-100 dark:border-neutral-800 pt-6">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                
                {/* 1. Main Current Product */}
                <div className={`p-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border transition-all flex gap-3 items-center w-64 ${
                  selectedBundleItems.includes(product.id) ? "border-[#22C55E]" : "border-neutral-200/60 dark:border-neutral-800/60 opacity-60"
                }`}>
                  <input 
                    id="chk-bundle-current"
                    type="checkbox"
                    checked={selectedBundleItems.includes(product.id)}
                    onChange={() => handleToggleBundleSelection(product.id)}
                    className="h-4 w-4 rounded text-[#22C55E] focus:ring-[#22C55E] border-neutral-300 dark:border-neutral-700 accent-[#22C55E]"
                  />
                  <img src={product.image} className="w-14 h-14 object-cover rounded-xl" referrerPolicy="no-referrer" />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block truncate font-sans">{product.name}</span>
                    <span className="text-[10px] text-neutral-400 block font-mono">Current item</span>
                    <span className="text-xs font-bold text-[#22C55E] font-mono block mt-0.5">${product.price}</span>
                  </div>
                </div>

                <span className="text-lg text-neutral-400 font-bold">+</span>

                {/* 2. Bundle coordinate items */}
                {frequentlyBoughtTogether.map((item) => (
                  <React.Fragment key={item.id}>
                    <div className={`p-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border transition-all flex gap-3 items-center w-64 ${
                      selectedBundleItems.includes(item.id) ? "border-[#22C55E]" : "border-neutral-200/60 dark:border-neutral-800/60 opacity-60"
                    }`}>
                      <input 
                        id={`chk-bundle-${item.id}`}
                        type="checkbox"
                        checked={selectedBundleItems.includes(item.id)}
                        onChange={() => handleToggleBundleSelection(item.id)}
                        className="h-4 w-4 rounded text-[#22C55E] focus:ring-[#22C55E] border-neutral-300 dark:border-neutral-700 accent-[#22C55E]"
                      />
                      <img 
                        src={item.image} 
                        className="w-14 h-14 object-cover rounded-xl cursor-pointer" 
                        onClick={() => onSelectProduct(item)}
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <span 
                          onClick={() => onSelectProduct(item)}
                          className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block truncate font-sans hover:text-[#22C55E] cursor-pointer"
                        >
                          {item.name}
                        </span>
                        <span className="text-[10px] text-neutral-400 block font-mono uppercase">{item.brand}</span>
                        <span className="text-xs font-bold text-[#22C55E] font-mono block mt-0.5">${item.price}</span>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              {/* Bundle calculations pricing checkout */}
              <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/60 p-5 rounded-2xl text-center lg:text-right space-y-4 w-full lg:w-80">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-neutral-400 block uppercase tracking-widest">Unified Bundle Total</span>
                  {isAllBundleItemsSelected ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-center lg:justify-end gap-2.5">
                        <span className="text-neutral-400 text-sm line-through font-sans">${rawBundleSum}</span>
                        <span className="text-2.5xl font-black text-neutral-950 dark:text-white font-sans">${bundleDiscountedTotal}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-500 font-mono uppercase block">
                        You saved ${rawBundleSum - bundleDiscountedTotal} instantly!
                      </span>
                    </div>
                  ) : (
                    <span className="text-2.5xl font-black text-neutral-950 dark:text-white font-sans">
                      ${currentSelectionsTotal}
                    </span>
                  )}
                </div>
                
                <button
                  id="btn-buy-bundle"
                  onClick={handleAddBundleToBag}
                  disabled={selectedBundleItems.length === 0}
                  className="w-full bg-neutral-950 dark:bg-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white dark:text-neutral-950 font-bold text-xs py-3 px-6 rounded-xl tracking-widest uppercase transition-all cursor-pointer shadow-md"
                >
                  ADD {selectedBundleItems.length} SELECTIONS TO BAG
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VERIFIED CLIENT LOGS (REVIEWS WITH CUSTOMER IMAGES) */}
        <div className="mt-20 border-t border-neutral-200/60 dark:border-neutral-800/60 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Reviews Summary Stats Column */}
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#22C55E] uppercase tracking-widest font-mono">DESIGN AUDITS</span>
                <h3 className="font-extrabold text-2xl text-neutral-900 dark:text-white font-sans">Verified Client Logs</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  Honest reviews and design placements submitted directly by verified homeowners.
                </p>
              </div>

              <div className="flex items-center gap-4.5 bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm">
                <span className="text-5.5xl font-black text-neutral-950 dark:text-white font-sans">{product.rating.toFixed(1)}</span>
                <div>
                  <div className="flex text-amber-400 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4.5 w-4.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-neutral-500 font-bold">Based on {product.reviewCount} verified client purchases</span>
                </div>
              </div>

              {/* Progress bars stars */}
              <div className="space-y-2">
                {[
                  { label: "5 Star", pct: "92%" },
                  { label: "4 Star", pct: "8%" },
                  { label: "3 Star", pct: "0%" },
                  { label: "2 Star", pct: "0%" },
                  { label: "1 Star", pct: "0%" }
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3 text-xs text-neutral-500 font-semibold">
                    <span className="w-12 text-neutral-400">{row.label}</span>
                    <div className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#22C55E] rounded-full" style={{ width: row.pct }} />
                    </div>
                    <span className="w-8 text-right font-mono font-bold">{row.pct}</span>
                  </div>
                ))}
              </div>

              {/* Image attachment filters */}
              <div className="space-y-3 pt-3 border-t border-neutral-200/50 dark:border-neutral-800/50">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-widest block">Filter Logs</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    id="btn-filter-rev-all"
                    onClick={() => setReviewFilter("all")}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono uppercase tracking-widest border transition ${
                      reviewFilter === "all"
                        ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950 dark:border-white"
                        : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-black"
                    }`}
                  >
                    All Audits
                  </button>
                  <button
                    id="btn-filter-rev-photos"
                    onClick={() => setReviewFilter("with-photos")}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono uppercase tracking-widest border transition flex items-center gap-1 ${
                      reviewFilter === "with-photos"
                        ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950 dark:border-white"
                        : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-black"
                    }`}
                  >
                    <Camera className="h-3 w-3" />
                    <span>With Photos</span>
                  </button>
                  <button
                    id="btn-filter-rev-positive"
                    onClick={() => setReviewFilter("positive")}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono uppercase tracking-widest border transition ${
                      reviewFilter === "positive"
                        ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950 dark:border-white"
                        : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-black"
                    }`}
                  >
                    Positive (AI)
                  </button>
                </div>
              </div>

            </div>

            {/* Verified Reviews Content Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-200/50 dark:border-neutral-800/50 pb-3">
                <h3 className="font-bold text-xs text-neutral-800 dark:text-neutral-200 uppercase tracking-widest">
                  Active Client Registers ({filteredReviews.length})
                </h3>
              </div>

              <div className="divide-y divide-neutral-200/50 dark:divide-neutral-800/50 space-y-6">
                {filteredReviews.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-6 text-center font-mono">No reviews found matching the active filter.</p>
                ) : (
                  filteredReviews.map((rev) => (
                    <div key={rev.id} className="pt-6 first:pt-0 space-y-3">
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-sm text-neutral-900 dark:text-white block font-sans">{rev.userName}</span>
                          <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">{rev.date}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex text-amber-400">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                            ))}
                          </div>
                          <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-widest font-mono">
                            VERIFIED AUDIT
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">{rev.comment}</p>

                      {/* CLIENT SUBMITTED PHOTOS */}
                      {rev.photos && rev.photos.length > 0 && (
                        <div className="flex gap-2 pt-1">
                          {rev.photos.map((ph, pIdx) => (
                            <div 
                              key={pIdx}
                              onClick={() => setZoomReviewPhoto(ph)}
                              className="relative w-24 h-24 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:opacity-90 active:scale-95 transition group"
                            >
                              <img src={ph} alt="Client interior photo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition" />
                              <div className="absolute bottom-1 right-1 p-1 bg-black/60 rounded-lg text-white text-[8px] opacity-0 group-hover:opacity-100 transition">
                                <Maximize2 className="h-2.5 w-2.5" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Helpful votes likes incrementor */}
                      <div className="flex items-center gap-4 text-[10px] text-neutral-400 font-semibold pt-1">
                        <button className="flex items-center gap-1 hover:text-[#22C55E] transition font-sans">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>Helpful? Yes ({rev.likes || 0})</span>
                        </button>
                        <span>•</span>
                        <span className="font-sans">Report Review</span>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* INTERACTIVE QA HELPDESK */}
        <div className="mt-20 border-t border-neutral-200/60 dark:border-neutral-800/60 pt-16 space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#22C55E] uppercase tracking-widest font-mono">SUPPORT LOG</span>
            <h3 className="font-extrabold text-2xl text-neutral-900 dark:text-white font-sans flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-[#22C55E]" /> Interactive Client Q&A
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Find technical details regarding scale constraints, weight tolerances, shipment safety, and placement styling.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Ask query form */}
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/50 space-y-4 shadow-sm">
              <h4 className="font-bold text-xs text-neutral-800 dark:text-neutral-200 uppercase tracking-widest">Consult Our Decorators</h4>
              
              <form onSubmit={handleAskQuestion} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1 font-mono">Category</label>
                  <select
                    id="select-qa-topic-submit"
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-[#22C55E] font-semibold"
                    value={newQuestionTopic}
                    onChange={(e) => setNewQuestionTopic(e.target.value)}
                  >
                    <option value="Dimensions">Dimensions & Spacing</option>
                    <option value="Materials">Materials & Finishes</option>
                    <option value="Care">Care & Protection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1 font-mono">Styling Query</label>
                  <textarea
                    id="text-qa-submit"
                    required
                    rows={3}
                    placeholder="Ask about placement advice, custom dimensions, or freight packaging..."
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-xs text-black dark:text-white focus:outline-none focus:border-[#22C55E] font-sans"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                  />
                </div>

                <button
                  id="btn-qa-submit"
                  type="submit"
                  className="w-full bg-[#22C55E] text-white font-bold text-xs py-3 rounded-xl hover:opacity-90 active:scale-95 transition uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#22C55E]/10"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>SUBMIT INTERIOR QUERY</span>
                </button>
              </form>
            </div>

            {/* Q&A Interactive feed */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Search & Topic Selection */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                  <input
                    id="input-qa-search"
                    type="text"
                    placeholder="Search past stylist replies..."
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-[#22C55E] font-sans"
                    value={qaSearch}
                    onChange={(e) => setQaSearch(e.target.value)}
                  />
                </div>

                <div className="flex gap-1.5 overflow-x-auto">
                  {(["All", "Dimensions", "Materials", "Care"] as const).map((topic) => (
                    <button
                      id={`btn-qa-topic-filter-${topic}`}
                      key={topic}
                      onClick={() => setActiveQaTopic(topic)}
                      className={`px-3.5 py-2 rounded-xl text-[10px] font-bold font-mono uppercase tracking-widest border transition flex-shrink-0 ${
                        activeQaTopic === topic
                          ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950 dark:border-white"
                          : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:border-black"
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Collapsed/Expanded questions list */}
              <div className="space-y-4 divide-y divide-neutral-200/50 dark:divide-neutral-800/50 max-h-[420px] overflow-y-auto pr-1.5 scrollbar-thin">
                {searchedQaList.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-12 text-center font-mono">No matching designer conversations logged.</p>
                ) : (
                  searchedQaList.map((qa, qIdx) => (
                    <div key={qa.id} className="pt-4 first:pt-0 space-y-2.5">
                      
                      <div className="flex items-start gap-2.5 text-xs">
                        <span className="font-bold text-neutral-950 dark:text-white bg-neutral-200/50 dark:bg-neutral-800 px-2 py-1 rounded-lg flex-shrink-0 font-sans">Q:</span>
                        <div className="flex-1">
                          <span className="font-bold text-neutral-900 dark:text-white block font-sans">{qa.question}</span>
                          <span className="text-[10px] text-neutral-400 block mt-0.5">Logged by {qa.askedBy} on {qa.dateAsked}</span>
                        </div>
                      </div>

                      {qa.answer && (
                        <div className="flex items-start gap-2.5 text-xs bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/30 dark:border-neutral-800/30 shadow-sm ml-6">
                          <span className="font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-1 rounded-lg flex-shrink-0 font-sans">A:</span>
                          <div className="flex-1">
                            <span className="text-neutral-700 dark:text-neutral-300 block leading-relaxed font-sans">{qa.answer}</span>
                            <span className="text-[10px] text-neutral-400 block mt-1.5">Resolved by {qa.answeredBy} on {qa.dateAnswered}</span>
                          </div>
                        </div>
                      )}

                      {/* Vote helpful button */}
                      <div className="flex items-center gap-3 text-[10px] text-neutral-400 font-semibold pl-6">
                        <button 
                          onClick={() => handleUpvoteQuestion(qa.id)}
                          className="flex items-center gap-1 hover:text-[#22C55E] transition font-sans"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>Helpful? ({qa.likes || 0})</span>
                        </button>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>

          </div>
        </div>

        {/* RELATED COORDINATES GRID CAROUSEL */}
        {products.filter((p) => p.category === product.category && p.id !== product.id).length > 0 && (
          <div className="mt-20 border-t border-neutral-200/60 dark:border-neutral-800/60 pt-16 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#22C55E] uppercase tracking-widest font-mono">COORDINATES</span>
              <h3 className="font-extrabold text-2xl text-neutral-900 dark:text-white font-sans">Curated Coordinates</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                Curators suggest pairing these matches in the same space layout.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products
                .filter((p) => p.category === product.category && p.id !== product.id)
                .slice(0, 4)
                .map((p) => (
                  <div 
                    id={`related-product-${p.id}`}
                    key={p.id} 
                    className="group space-y-3.5 bg-white dark:bg-neutral-900 border border-neutral-200/40 dark:border-neutral-800/40 p-4 rounded-3xl shadow-sm hover:shadow-md hover:border-[#22C55E] transition duration-300 relative"
                  >
                    <div 
                      onClick={() => onSelectProduct(p)}
                      className="aspect-square bg-neutral-50 dark:bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-900 cursor-pointer"
                    >
                      <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-neutral-400 block tracking-wider font-mono">{p.brand}</span>
                      <span 
                        onClick={() => onSelectProduct(p)}
                        className="text-xs font-bold text-neutral-950 dark:text-neutral-100 block truncate font-sans hover:text-[#22C55E] cursor-pointer"
                      >
                        {p.name}
                      </span>
                      
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-sm font-black text-[#22C55E] font-mono">${p.price}</span>
                        
                        {/* Quick Add icon */}
                        <button
                          onClick={() => {
                            addToCart(p, 1, p.sizes?.[0] || "Standard", p.colors?.[0] || "Natural");
                          }}
                          className="p-1.5 rounded-lg bg-neutral-50 hover:bg-[#22C55E] text-neutral-900 hover:text-white border border-neutral-200/50 dark:bg-neutral-950 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-[#22C55E] dark:hover:text-white transition cursor-pointer"
                          title="Quick add coordinate to bag"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* RECENTLY VIEWED SLIDER */}
        {recentlyViewed && recentlyViewed.filter(p => p.id !== product.id).length > 0 && (
          <div className="mt-16 border-t border-neutral-200/60 dark:border-neutral-800/60 pt-12 space-y-6">
            <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white uppercase tracking-widest">Recently Viewed Curations</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recentlyViewed.filter(p => p.id !== product.id).slice(0, 4).map((p) => (
                <div 
                  id={`recent-product-${p.id}`}
                  key={p.id} 
                  className="group space-y-3 bg-white dark:bg-neutral-900 border border-neutral-200/40 dark:border-neutral-800/40 p-3.5 rounded-3xl shadow-sm hover:border-[#22C55E] transition duration-300"
                >
                  <div 
                    onClick={() => onSelectProduct(p)}
                    className="aspect-square bg-neutral-50 dark:bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-900 cursor-pointer"
                  >
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-neutral-400 block tracking-wider font-mono">{p.brand}</span>
                    <span 
                      onClick={() => onSelectProduct(p)}
                      className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 block truncate font-sans hover:text-[#22C55E] cursor-pointer"
                    >
                      {p.name}
                    </span>
                    <span className="text-xs font-bold text-[#22C55E] font-mono block mt-0.5">${p.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* STICKY LOWER VIEW CONSOLE BAR */}
      <div className="fixed bottom-0 inset-x-0 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-t border-neutral-200/50 dark:border-neutral-800/50 py-4.5 px-6 z-40 shadow-2xl flex items-center justify-between gap-4 max-w-7xl mx-auto rounded-t-3xl pb-safe-bottom">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">Cost selection</span>
          <span className="text-2.5xl font-black text-neutral-950 dark:text-white font-sans">${product.price * quantity}</span>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <button
            id="btn-sticky-cart"
            onClick={handleAddToCart}
            className="flex-1 py-3.5 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-950 dark:text-white text-xs font-bold rounded-2xl tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer border border-neutral-200 dark:border-neutral-850 uppercase shadow-sm active:scale-97"
          >
            <ShoppingBag className="h-4.5 w-4.5 text-[#22C55E]" />
            <span>ADD TO BAG</span>
          </button>
          
          <button
            id="btn-sticky-buy"
            onClick={handleBuyNow}
            className="flex-1 py-3.5 bg-[#22C55E] text-white text-xs font-bold rounded-2xl tracking-widest transition-all cursor-pointer shadow-lg hover:opacity-90 active:scale-97 text-center uppercase"
          >
            BUY NOW
          </button>
        </div>
      </div>

      {/* MODAL 1: AI SPACE PLANNER IN-ROOM FIT CALIBRATOR */}
      {showAiCalibrator && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 dark:border-neutral-800 space-y-6 relative">
            <button
              id="btn-close-ai-cal"
              onClick={() => setShowAiCalibrator(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer hover:scale-105 active:scale-95 text-xs font-bold transition"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-full text-[10px] font-bold text-[#22C55E] tracking-widest uppercase font-mono">
                <Sparkles className="h-3 w-3 animate-spin text-[#22C55E]" />
                GEMINI LAYOUT ENGINE v2
              </span>
              <h3 className="text-xl font-bold text-neutral-950 dark:text-white font-sans">Bespoke Fit Calibration</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                Input your spatial plan coordinates to automatically resolve the perfect proportional scale.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1 font-mono">Ceiling Height</label>
                  <input
                    id="input-cal-height"
                    type="text"
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-[#22C55E] font-mono font-semibold"
                    value={calHeight}
                    onChange={(e) => setCalHeight(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1 font-mono">Floor Area</label>
                  <input
                    id="input-cal-area"
                    type="text"
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-[#22C55E] font-mono font-semibold"
                    value={calArea}
                    onChange={(e) => setCalArea(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1 font-mono">Aesthetic Density Vibe</label>
                <select
                  id="select-cal-vibe"
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-[#22C55E] font-semibold"
                  value={calPreference}
                  onChange={(e) => setCalPreference(e.target.value)}
                >
                  <option value="minimalist">Minimalist / Airy Breathability</option>
                  <option value="cozy">Cozy / Anchored Intimacy</option>
                  <option value="statement">Bold / Statement Centerpiece</option>
                  <option value="geometric">Formal / Geometric Alignment</option>
                </select>
              </div>

              <button
                id="btn-run-cal"
                onClick={handleSpaceCalibration}
                disabled={calLoading}
                className="w-full py-3 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-xs rounded-xl tracking-widest uppercase cursor-pointer hover:opacity-90 active:scale-98 transition shadow-md flex items-center justify-center gap-1.5"
              >
                {calLoading ? (
                  <span className="h-4 w-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-[#22C55E]" />
                    <span>CALIBRATE DIMENSION METRIC</span>
                  </>
                )}
              </button>

              {/* Analysis Result Output */}
              {calResult && (
                <div className="bg-[#22C55E]/5 border border-[#22C55E]/15 p-4 rounded-2xl space-y-1.5 animate-fade-in">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 stroke-[2.5]" />
                    <span className="text-[10px] font-bold text-[#22C55E] uppercase tracking-widest font-mono">Calibration Completed!</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      Resolved Fitment: <strong className="text-black bg-white dark:bg-black dark:text-white border border-neutral-200 dark:border-neutral-800 px-2.5 py-0.5 rounded-lg font-mono font-bold">{calResult.size}</strong>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-relaxed font-sans font-medium">{calResult.justification}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: INTERACTIVE AR VIEW (CAMERA FEED VIEW) */}
      {showArModal && (
        <div className="fixed inset-0 bg-neutral-950/95 z-[9999] flex flex-col justify-between p-4 md:p-8 animate-fade-in">
          
          {/* Top Bar Actions */}
          <div className="flex items-center justify-between z-10">
            <div className="space-y-1">
              <h3 className="text-white text-base font-bold font-sans tracking-tight">AR Space Projector Simulator</h3>
              <p className="text-neutral-400 text-[10px] uppercase font-mono tracking-widest">
                {useLiveCamera ? "Live Camera Mesh Active" : `Projected on: ${selectedRoom.name}`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="btn-toggle-camera-live"
                onClick={() => setUseLiveCamera(!useLiveCamera)}
                className="px-3.5 py-2 bg-neutral-800 text-white text-[10px] font-bold font-mono uppercase tracking-widest rounded-xl hover:bg-neutral-700 transition"
              >
                {useLiveCamera ? "USE STUDIO PRESET" : "ENABLE LIVE CAMERA"}
              </button>

              <button
                id="btn-close-ar"
                onClick={() => {
                  setShowArModal(false);
                  stopCamera();
                }}
                className="p-2 bg-neutral-800 text-white rounded-full hover:scale-105 active:scale-95 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Core viewfinder area */}
          <div className="flex-1 my-6 relative overflow-hidden rounded-3xl border border-neutral-800 flex items-center justify-center bg-neutral-900">
            {useLiveCamera ? (
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            ) : (
              <img 
                src={selectedRoom.image} 
                alt="Studio template" 
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                referrerPolicy="no-referrer"
              />
            )}

            {/* Grid overlay mesh lines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

            {/* Simulated target hologram marker */}
            <div className="absolute inset-0 border border-neutral-500/10 pointer-events-none flex items-center justify-center">
              <div className="w-16 h-16 border-2 border-dashed border-[#22C55E]/45 rounded-full animate-spin-slow" />
            </div>

            {/* Interactive draggable / scalable target Product cutout */}
            <div 
              className="absolute w-64 h-64 flex items-center justify-center transition-transform duration-75 select-none touch-none cursor-move"
              style={{
                transform: `translate(${arPosition.x}px, ${arPosition.y}px) scale(${arScale}) rotate(${arRotation}deg)`,
                filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.45))"
              }}
              onMouseDown={(e) => {
                const startX = e.clientX - arPosition.x;
                const startY = e.clientY - arPosition.y;
                const handleDrag = (dragEvent: MouseEvent) => {
                  setArPosition({
                    x: dragEvent.clientX - startX,
                    y: dragEvent.clientY - startY
                  });
                };
                const stopDrag = () => {
                  window.removeEventListener("mousemove", handleDrag);
                  window.removeEventListener("mouseup", stopDrag);
                };
                window.addEventListener("mousemove", handleDrag);
                window.addEventListener("mouseup", stopDrag);
              }}
              onTouchStart={(e) => {
                const startX = e.touches[0].clientX - arPosition.x;
                const startY = e.touches[0].clientY - arPosition.y;
                const handleTouchMove = (touchEvent: TouchEvent) => {
                  setArPosition({
                    x: touchEvent.touches[0].clientX - startX,
                    y: touchEvent.touches[0].clientY - startY
                  });
                };
                const stopTouch = () => {
                  window.removeEventListener("touchmove", handleTouchMove);
                  window.removeEventListener("touchend", stopTouch);
                };
                window.addEventListener("touchmove", handleTouchMove);
                window.addEventListener("touchend", stopTouch);
              }}
            >
              <img src={product.image} className="w-4/5 h-4/5 object-contain pointer-events-none" referrerPolicy="no-referrer" />
              
              {/* Holographic light ring reflection */}
              <div className="absolute inset-0 border border-white/5 rounded-full pointer-events-none" />
            </div>

            {/* Placement control details overlay bottom left */}
            <div className="absolute bottom-4 left-4 bg-neutral-950/80 backdrop-blur-md border border-neutral-800 p-4 rounded-2xl text-xs text-white space-y-1.5 z-10 max-w-xs">
              <div className="flex items-center gap-1.5 font-bold font-mono tracking-widest text-[#22C55E]">
                <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
                <span>AR SPATIAL NODE AR-11</span>
              </div>
              <p className="text-[10px] text-neutral-400 font-sans leading-relaxed">
                Pinch screen or drag sliders to adjust item coordinates, scaling size, and rotation in the layout.
              </p>
            </div>

            {/* Capture success toast overlay */}
            <AnimatePresence>
              {arCaptureSuccess && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 bg-white dark:bg-black flex flex-col items-center justify-center text-center p-6 z-25"
                >
                  <CheckCircle2 className="h-16 w-16 text-[#22C55E] mb-3" />
                  <h4 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white">AR Photo Saved!</h4>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                    This customized design projection layout has been saved directly to your account media vault.
                  </p>
                  <button
                    onClick={() => setArCaptureSuccess(false)}
                    className="mt-6 px-6 py-2.5 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold rounded-xl tracking-wider uppercase shadow-md"
                  >
                    CONTINUE PROJECTING
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Lower Control Board (Sliders, Room Selector & Camera Trigger) */}
          <div className="z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-neutral-900 border border-neutral-800 p-6 rounded-3xl">
            
            {/* 1. Room select presets (only if not live camera) */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono block">Room Presets</span>
              <div className="flex gap-2">
                {AR_ROOMS.map((rm) => (
                  <button
                    id={`btn-ar-room-preset-${rm.id}`}
                    key={rm.id}
                    disabled={useLiveCamera}
                    onClick={() => {
                      setSelectedRoom(rm);
                      setArScale(rm.defaultScale);
                      setArPosition({ x: 0, y: rm.defaultY });
                    }}
                    className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition ${
                      useLiveCamera 
                        ? "opacity-30 cursor-not-allowed" 
                        : selectedRoom.id === rm.id 
                          ? "bg-[#22C55E] text-white" 
                          : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                    }`}
                  >
                    {rm.name.split(" ")[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Shutter Camera Trigger */}
            <div className="flex flex-col items-center justify-center">
              <button
                id="btn-ar-shutter"
                onClick={() => {
                  setArCaptureSuccess(true);
                  addNotification("📸 AR Snapshot Saved", "In-room furniture mockups saved to design gallery.", "ai");
                }}
                className="w-14 h-14 rounded-full bg-[#22C55E] border-4 border-white dark:border-neutral-800 shadow-xl flex items-center justify-center cursor-pointer hover:scale-105 active:scale-90 transition-all"
                title="Capture Snapshot"
              >
                <Camera className="h-6 w-6 text-white" />
              </button>
              <span className="text-[9px] text-neutral-400 mt-2 font-mono uppercase tracking-widest">CAPTURE DESIGN SNAPSHOT</span>
            </div>

            {/* 3. Slider Tuning Controls */}
            <div className="space-y-3">
              {/* Scale Slider */}
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="font-semibold uppercase tracking-wider text-[9px] font-mono">Precision scale:</span>
                  <span className="font-bold font-mono">{Math.round(arScale * 100)}%</span>
                </div>
                <input
                  id="range-ar-scale"
                  type="range"
                  min="0.4"
                  max="2.0"
                  step="0.05"
                  className="w-full accent-[#22C55E]"
                  value={arScale}
                  onChange={(e) => setArScale(parseFloat(e.target.value))}
                />
              </div>

              {/* Rotation Slider */}
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="font-semibold uppercase tracking-wider text-[9px] font-mono">Azimuth rotation:</span>
                  <span className="font-bold font-mono">{arRotation}°</span>
                </div>
                <input
                  id="range-ar-rotate"
                  type="range"
                  min="-180"
                  max="180"
                  step="5"
                  className="w-full accent-[#22C55E]"
                  value={arRotation}
                  onChange={(e) => setArRotation(parseInt(e.target.value))}
                />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL: CLIENT PHOTO ZOOM */}
      {zoomReviewPhoto && (
        <div 
          onClick={() => setZoomReviewPhoto(null)}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[10000] flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-3xl w-full max-h-[80vh] flex items-center justify-center">
            <img src={zoomReviewPhoto} alt="Review zoom" className="rounded-3xl max-w-full max-h-[85vh] object-contain shadow-2xl border border-neutral-800" referrerPolicy="no-referrer" />
            <button 
              id="btn-close-lightbox"
              className="absolute -top-12 right-0 p-2 bg-neutral-800 text-white rounded-full hover:scale-105 active:scale-95 transition"
              onClick={() => setZoomReviewPhoto(null)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
