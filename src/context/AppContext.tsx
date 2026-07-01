/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, CartItem, Address, Order, Coupon, AppNotification, SellerDashboardStats, WalletTransaction } from "../types";
import { SEED_PRODUCTS, SEED_ADDRESSES, SEED_NOTIFICATIONS, SEED_COUPONS } from "../data";
import { 
  isSupabaseConnected, 
  dbGetProducts, 
  dbGetOrders, 
  dbAddOrder, 
  dbUpdateOrderStatus,
  dbGetCart,
  dbAddToCart,
  dbRemoveFromCart,
  dbClearCart,
  dbGetWishlist,
  dbToggleWishlist,
  dbGetAddresses,
  dbAddAddress,
  dbRemoveAddress,
  subscribeToRealtimeOrders,
  subscribeToRealtimeInventory
} from "../lib/supabase";

interface AppContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, size?: string, color?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, qty: number) => void;
  clearCart: () => void;
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  addresses: Address[];
  addAddress: (address: Address) => void;
  removeAddress: (id: string) => void;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  placeOrder: (shippingAddress: Address, paymentMethod: any, discountCode?: string) => Order;
  cancelOrder: (orderId: string) => void;
  submitReturnRequest: (orderId: string, productId: string, reason: string, details: string) => void;
  notifications: AppNotification[];
  addNotification: (title: string, desc: string, type: AppNotification["type"]) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  rewardPoints: number;
  addRewardPoints: (pts: number) => void;
  walletBalance: number;
  addWalletFunds: (amt: number) => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  sellerStats: SellerDashboardStats;
  addSellerProduct: (p: Product) => void;
  updateSellerStats: (salesDelta: number) => void;
  updateProductStock: (id: string, newStock: number) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  approveReturnRequest: (returnId: string) => void;
  recentlyViewed: Product[];
  addToRecentlyViewed: (product: Product) => void;
  compareProducts: Product[];
  toggleCompare: (product: Product) => void;
  clearCompare: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("nb_products");
    return saved ? JSON.parse(saved) : SEED_PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("nb_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem("nb_wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  const [addresses, setAddresses] = useState<Address[]>(() => {
    const saved = localStorage.getItem("nb_addresses");
    return saved ? JSON.parse(saved) : SEED_ADDRESSES;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("nb_orders");
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem("nb_notifications");
    return saved ? JSON.parse(saved) : SEED_NOTIFICATIONS;
  });

  const [rewardPoints, setRewardPoints] = useState<number>(() => {
    const saved = localStorage.getItem("nb_rewards");
    return saved ? parseInt(saved, 10) : 250; // start with some points
  });

  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const saved = localStorage.getItem("nb_wallet");
    return saved ? parseFloat(saved) : 150.00; // start with standard balance
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const [sellerStats, setSellerStats] = useState<SellerDashboardStats>(() => {
    const saved = localStorage.getItem("nb_seller_stats");
    return saved ? JSON.parse(saved) : {
      totalSales: 8940.00,
      pendingSettlement: 2150.00,
      totalOrdersCount: 45,
      rating: 4.9,
      inventoryHealth: "excellent",
      walletBalance: 6400.00,
      transactions: [
        { id: "tx_1", amount: 4500.00, type: "credit", description: "Monthly Sales Payout - May 2026", timestamp: "2026-06-01T15:00:00Z" },
        { id: "tx_2", amount: 1900.00, type: "credit", description: "Bi-Weekly Settlement Payout", timestamp: "2026-06-15T10:30:00Z" }
      ] as WalletTransaction[]
    };
  });

  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => {
    const saved = localStorage.getItem("nb_recently_viewed");
    return saved ? JSON.parse(saved) : [];
  });

  const [compareProducts, setCompareProducts] = useState<Product[]>([]);

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("nb_theme");
    return (saved as "dark" | "light") || "light"; // default to light as per prompt: "Default to a clean, high-contrast light theme"
  });

  const [searchQuery, setSearchQuery] = useState("");

  // Sync products and orders on mount if Supabase is connected
  useEffect(() => {
    async function initDbSync() {
      if (isSupabaseConnected()) {
        try {
          const dbProds = await dbGetProducts(SEED_PRODUCTS);
          setProducts(dbProds);
          const dbOrds = await dbGetOrders([]);
          if (dbOrds && dbOrds.length > 0) {
            setOrders(dbOrds);
          }
          const dbCartItems = await dbGetCart();
          if (dbCartItems && dbCartItems.length > 0) {
            setCart(dbCartItems);
          }
          const dbWish = await dbGetWishlist();
          if (dbWish && dbWish.length > 0) {
            setWishlist(dbWish);
          }
          const dbAddrs = await dbGetAddresses(SEED_ADDRESSES);
          if (dbAddrs && dbAddrs.length > 0) {
            setAddresses(dbAddrs);
          }
        } catch (err) {
          console.warn("Initial Supabase load failed, using local storage cache:", err);
        }
      }
    }
    initDbSync();
  }, []);

  // Realtime subscriptions for orders and inventory levels
  useEffect(() => {
    if (!isSupabaseConnected()) return;

    const ordersSub = subscribeToRealtimeOrders((payload) => {
      console.log("Realtime order status change:", payload);
      const updatedOrder = payload.new;
      if (updatedOrder) {
        setOrders((prev) => prev.map((ord) => {
          if (ord.id === updatedOrder.id) {
            return {
              ...ord,
              status: updatedOrder.status,
              tracking: updatedOrder.tracking || ord.tracking
            };
          }
          return ord;
        }));
      }
    });

    const inventorySub = subscribeToRealtimeInventory((payload) => {
      console.log("Realtime inventory update:", payload);
      const updatedPrd = payload.new;
      if (updatedPrd) {
        setProducts((prev) => prev.map((p) => {
          if (p.id === updatedPrd.id) {
            return {
              ...p,
              stock: updatedPrd.stock_count,
              price: Number(updatedPrd.price)
            };
          }
          return p;
        }));
      }
    });

    return () => {
      if (ordersSub) ordersSub.unsubscribe();
      if (inventorySub) inventorySub.unsubscribe();
    };
  }, []);

  // Apply theme to document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "light") {
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
    }
    localStorage.setItem("nb_theme", theme);
  }, [theme]);

  // Save changes to localstorage to support persistent simulation
  useEffect(() => {
    localStorage.setItem("nb_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("nb_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("nb_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("nb_addresses", JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem("nb_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("nb_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("nb_rewards", rewardPoints.toString());
  }, [rewardPoints]);

  useEffect(() => {
    localStorage.setItem("nb_wallet", walletBalance.toString());
  }, [walletBalance]);

  useEffect(() => {
    localStorage.setItem("nb_seller_stats", JSON.stringify(sellerStats));
  }, [sellerStats]);

  useEffect(() => {
    localStorage.setItem("nb_recently_viewed", JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  // Actions
  const addToCart = (product: Product, quantity: number, size?: string, color?: string) => {
    const cartItemId = `${product.id}-${size || "none"}-${color || "none"}`;
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.id === cartItemId);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += quantity;
        return updated;
      }
      return [...prev, { id: cartItemId, product, quantity, selectedSize: size, selectedColor: color }];
    });

    if (isSupabaseConnected()) {
      dbAddToCart(product.id, quantity, size, color).catch((err) => {
        console.warn("Failed to sync cart item addition with Supabase:", err);
      });
    }

    addNotification(
      "🛒 Added to Cart",
      `Successfully added ${quantity}x ${product.name} to your cart.`,
      "order"
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    if (isSupabaseConnected()) {
      dbRemoveFromCart(cartItemId).catch((err) => {
        console.warn("Failed to remove cart item from Supabase:", err);
      });
    }
  };

  const updateCartQuantity = (cartItemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) => prev.map((item) => (item.id === cartItemId ? { ...item, quantity: qty } : item)));
    
    // Sync to Supabase if connected
    if (isSupabaseConnected()) {
      const matched = cart.find(item => item.id === cartItemId);
      if (matched) {
        dbAddToCart(matched.product.id, qty, matched.selectedSize, matched.selectedColor).catch((err) => {
          console.warn("Failed to update cart quantity on Supabase:", err);
        });
      }
    }
  };

  const clearCart = () => {
    setCart([]);
    if (isSupabaseConnected()) {
      dbClearCart().catch((err) => {
        console.warn("Failed to clear cart on Supabase:", err);
      });
    }
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        addNotification("💜 Removed from Wishlist", `Removed ${product.name} from your curated favorites.`, "promo");
        return prev.filter((p) => p.id !== product.id);
      }
      addNotification("💜 Added to Wishlist", `Curated ${product.name} has been saved to your favorites wishlist.`, "promo");
      return [...prev, product];
    });

    if (isSupabaseConnected()) {
      dbToggleWishlist(product.id).catch((err) => {
        console.warn("Failed to toggle wishlist on Supabase:", err);
      });
    }
  };

  const addAddress = (addr: Address) => {
    const freshId = `addr_${Date.now()}`;
    const newAddr = { ...addr, id: freshId };
    setAddresses((prev) => {
      const updated = addr.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
      return [...updated, newAddr];
    });

    if (isSupabaseConnected()) {
      dbAddAddress(newAddr).catch((err) => {
        console.warn("Failed to add address to Supabase:", err);
      });
    }
  };

  const removeAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    if (isSupabaseConnected()) {
      dbRemoveAddress(id).catch((err) => {
        console.warn("Failed to remove address from Supabase:", err);
      });
    }
  };

  const addNotification = (title: string, desc: string, type: AppNotification["type"]) => {
    setNotifications((prev) => [
      { id: `notif_${Date.now()}`, title, description: desc, type, timestamp: new Date().toISOString(), read: false },
      ...prev
    ]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const addRewardPoints = (pts: number) => setRewardPoints((prev) => prev + pts);
  const addWalletFunds = (amt: number) => setWalletBalance((prev) => prev + amt);

  const applyCoupon = (code: string): boolean => {
    const coupon = SEED_COUPONS.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (coupon) {
      setAppliedCoupon(coupon);
      return true;
    }
    return false;
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const addSellerProduct = (p: Product) => {
    setProducts((prev) => [p, ...prev]);
    addNotification("📦 New Decor Product Live", `${p.name} has been successfully added to the Nayel Basket catalog.`, "system");
  };

  const updateSellerStats = (salesDelta: number) => {
    setSellerStats((prev) => ({
      ...prev,
      totalSales: prev.totalSales + salesDelta,
      walletBalance: prev.walletBalance + salesDelta,
      totalOrdersCount: prev.totalOrdersCount + 1,
      transactions: [
        {
          id: `tx_${Date.now()}`,
          amount: salesDelta,
          type: "credit",
          description: `Order payout settlement`,
          timestamp: new Date().toISOString()
        },
        ...prev.transactions
      ]
    }));
  };

  const updateProductStock = (id: string, newStock: number) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p)));
  };

  const placeOrder = (shippingAddress: Address, paymentMethod: any, discountCode?: string): Order => {
    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === "percentage") {
        discount = Math.floor(subtotal * (appliedCoupon.value / 100));
      } else {
        discount = appliedCoupon.value;
      }
    }
    const tax = Math.round((subtotal - discount) * 0.08); // 8% luxury sales tax
    const total = subtotal - discount + tax;

    // Build timeline events
    const timeline: Order["tracking"] = [
      { title: "Order Placed", description: "Your secure payment cleared. Nayel Basket master builders are packing your piece.", timestamp: new Date().toISOString(), location: "Nayel Basket HQ", status: "completed" },
      { title: "Dispatched", description: "Secured in custom shock-absorbing crates.", timestamp: "Pending update", location: "Artisanal Depot", status: "current" },
      { title: "In Transit", description: "Our premium white-glove logistics courier is en-route.", timestamp: "Pending update", location: "En Route Hub", status: "upcoming" },
      { title: "Out for Delivery", description: "Approaching address. Delivery OTP validation required.", timestamp: "Pending update", location: "Local Destination", status: "upcoming" }
    ];

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // secure 6-digit OTP
    const pointsEarned = Math.floor(total * 0.1); // 10% rewards

    const newOrder: Order = {
      id: `NB-${Date.now().toString().slice(-6).toUpperCase()}`,
      date: new Date().toISOString(),
      items: [...cart],
      subtotal,
      discount,
      tax,
      total,
      status: "Pending",
      shippingAddress,
      paymentMethod,
      tracking: timeline,
      otp,
      rewardPointsEarned: pointsEarned
    };

    setOrders((prev) => [newOrder, ...prev]);
    addRewardPoints(pointsEarned);
    updateSellerStats(total);

    // Save order directly to Supabase if connected
    if (isSupabaseConnected()) {
      dbAddOrder(newOrder).catch((err) => {
        console.warn("Failed to sync new order with Supabase:", err);
      });
    }

    // Deduct stock levels safely
    cart.forEach((item) => {
      const newStock = Math.max(0, item.product.stock - item.quantity);
      updateProductStock(item.product.id, newStock);
      // Update stock level inside Supabase too
      if (isSupabaseConnected()) {
        import("../lib/supabase").then(({ dbUpdateProduct }) => {
          dbUpdateProduct({ ...item.product, stock: newStock });
        });
      }
    });

    // Reset cart and active coupons
    clearCart();
    setAppliedCoupon(null);

    addNotification(
      "📦 Nayel Basket Order Confirmed!",
      `Your premium order ${newOrder.id} is confirmed. Secure Delivery Verification OTP is: ${newOrder.otp}.`,
      "order"
    );

    return newOrder;
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) => prev.map((ord) => {
      if (ord.id === orderId) {
        const updatedTracking = ord.tracking.map((t, idx) => idx === 0 ? { ...t, status: "completed" as const } : { ...t, title: "Order Cancelled", status: "completed" as const });
        
        // Sync cancellation with Supabase if connected
        if (isSupabaseConnected()) {
          dbUpdateOrderStatus(orderId, "Cancelled", updatedTracking).catch((err) => {
            console.warn("Failed to sync order cancellation with Supabase:", err);
          });
        }
        
        return {
          ...ord,
          status: "Cancelled",
          tracking: updatedTracking
        };
      }
      return ord;
    }));
    addNotification("❌ Order Cancelled", `Order ${orderId} has been successfully cancelled and fully refunded.`, "order");
  };

  const submitReturnRequest = (orderId: string, productId: string, reason: string, details: string) => {
    setOrders((prev) => prev.map((ord) => {
      if (ord.id === orderId) {
        const matchedItem = ord.items.find((i) => i.product.id === productId);
        const refundAmount = matchedItem ? matchedItem.product.price * matchedItem.quantity : 0;
        return {
          ...ord,
          status: "Returned" as const,
          returnRequest: {
            id: `RTN-${Date.now().toString().slice(-4)}`,
            orderId,
            productId,
            reason,
            details,
            status: "Pending",
            dateRequested: new Date().toISOString(),
            refundAmount
          }
        };
      }
      return ord;
    }));
    addNotification("🔄 Return Initiated", `Your return request for order ${orderId} has been submitted for approval.`, "order");
  };

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) => prev.map((ord) => {
      if (ord.id === orderId) {
        const updatedTracking = [...ord.tracking];
        if (status === "Shipped") {
          updatedTracking[1] = { ...updatedTracking[1], status: "completed", timestamp: new Date().toISOString() };
          updatedTracking[2] = { ...updatedTracking[2], status: "current", timestamp: new Date().toISOString() };
        } else if (status === "Delivered") {
          updatedTracking[1] = { ...updatedTracking[1], status: "completed", timestamp: new Date().toISOString() };
          updatedTracking[2] = { ...updatedTracking[2], status: "completed", timestamp: new Date().toISOString() };
          updatedTracking[3] = { ...updatedTracking[3], status: "completed", timestamp: new Date().toISOString() };
        }
        
        // Sync with Supabase asynchronously
        if (isSupabaseConnected()) {
          dbUpdateOrderStatus(orderId, status, updatedTracking).catch((err) => {
            console.warn("Failed to sync status update with Supabase:", err);
          });
        }
        
        return { ...ord, status, tracking: updatedTracking };
      }
      return ord;
    }));
  };

  const approveReturnRequest = (returnId: string) => {
    setOrders((prev) => prev.map((ord) => {
      if (ord.returnRequest && ord.returnRequest.id === returnId) {
        addWalletFunds(ord.returnRequest.refundAmount);
        addNotification("💰 Refund Approved!", `Your refund of $${ord.returnRequest.refundAmount} has been credited to your Nayel Basket Wallet.`, "order");
        return {
          ...ord,
          returnRequest: {
            ...ord.returnRequest,
            status: "Approved" as const
          }
        };
      }
      return ord;
    }));
  };

  const addToRecentlyViewed = (product: Product) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, 10); // cap at 10 items
    });
  };

  const toggleCompare = (product: Product) => {
    setCompareProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 3) {
        addNotification("⚠️ Comparison Limit", "You can compare up to 3 home decor products at a time.", "system");
        return prev;
      }
      return [...prev, product];
    });
  };

  const clearCompare = () => setCompareProducts([]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <AppContext.Provider
      value={{
        products,
        setProducts,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        wishlist,
        toggleWishlist,
        addresses,
        addAddress,
        removeAddress,
        orders,
        setOrders,
        placeOrder,
        cancelOrder,
        submitReturnRequest,
        notifications,
        addNotification,
        markNotificationAsRead,
        clearNotifications,
        rewardPoints,
        addRewardPoints,
        walletBalance,
        addWalletFunds,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        sellerStats,
        addSellerProduct,
        updateSellerStats,
        updateProductStock,
        updateOrderStatus,
        approveReturnRequest,
        recentlyViewed,
        addToRecentlyViewed,
        compareProducts,
        toggleCompare,
        clearCompare,
        theme,
        toggleTheme,
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside an AppProvider");
  }
  return context;
};
