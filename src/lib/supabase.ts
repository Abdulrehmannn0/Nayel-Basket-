import { createClient } from "@supabase/supabase-js";
import { Product, Order } from "../types";

// Read Supabase environment variables safely
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

/**
 * Validates if the Supabase credentials are valid and not default placeholder strings
 */
export function hasValidSupabaseCredentials(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  const urlLower = supabaseUrl.toLowerCase();
  const keyLower = supabaseAnonKey.toLowerCase();
  
  if (
    urlLower.includes("your-supabase-project") || 
    keyLower.includes("your-supabase-anon-key") ||
    urlLower === "undefined" || 
    urlLower === "null" ||
    keyLower === "undefined" || 
    keyLower === "null" ||
    !supabaseUrl.startsWith("http")
  ) {
    return false;
  }
  return true;
}

// Initialize Supabase Client if valid credentials are provided safely within a try-catch block
let supabaseClient = null;
try {
  if (hasValidSupabaseCredentials()) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (err) {
  console.error("Failed to initialize Supabase client:", err);
}

export const supabase = supabaseClient;

/**
 * Returns true if Supabase is fully configured with environment variables
 */
export function isSupabaseConnected(): boolean {
  return !!supabase;
}

/**
 * Sync Products Table from Supabase or Fallback
 */
export async function dbGetProducts(fallbackProducts: Product[]): Promise<Product[]> {
  if (!supabase) {
    console.log("Supabase not configured. Using local fallback products.");
    return fallbackProducts;
  }
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) {
      // Map Supabase fields to our Frontend Product Type
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        price: Number(item.price),
        originalPrice: Number(item.original_price || item.price * 1.3),
        category: item.category,
        image: item.image,
        description: item.description || "Premium hand-selected decor selection.",
        gallery: item.gallery || [item.image],
        rating: Number(item.rating || 4.5),
        reviewCount: Number(item.review_count || 12),
        stock: Number(item.stock_count || item.stock || 10),
        sellerId: item.seller_id || "nayel-curator",
        sellerName: item.seller_name || "Nayel Basket Elite",
        features: item.features || [],
        sizes: item.sizes || ["S", "M", "L", "XL"],
        colors: item.colors || ["Midnight Matte", "Core Black", "Silver Grey"],
        reviews: [], // Handled separately or mock
        qa: [],
        sku: item.sku || `NYL-${item.name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
        tags: item.tags || ["Decor", "Premium"],
      }));
    }
    return fallbackProducts;
  } catch (err) {
    console.warn("Failed to fetch products from Supabase:", err);
    return fallbackProducts;
  }
}

/**
 * Create/Add Product to Supabase
 */
export async function dbAddProduct(product: Product): Promise<boolean> {
  if (!supabase) return true;
  try {
    const { error } = await supabase.from("products").insert([
      {
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
        description: product.description,
        category: product.category,
        rating: product.rating,
        stock_count: product.stock,
        sizes: product.sizes,
        colors: product.colors,
        features: product.features,
      },
    ]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error inserting product into Supabase:", err);
    return false;
  }
}

/**
 * Edit Product in Supabase
 */
export async function dbUpdateProduct(product: Product): Promise<boolean> {
  if (!supabase) return true;
  try {
    const { error } = await supabase
      .from("products")
      .update({
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
        description: product.description,
        category: product.category,
        stock_count: product.stock,
        sizes: product.sizes,
        colors: product.colors,
        features: product.features,
      })
      .eq("id", product.id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error updating product in Supabase:", err);
    return false;
  }
}

/**
 * Delete Product from Supabase
 */
export async function dbDeleteProduct(id: string): Promise<boolean> {
  if (!supabase) return true;
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error deleting product from Supabase:", err);
    return false;
  }
}

/**
 * Get Orders from Supabase
 */
export async function dbGetOrders(fallbackOrders: Order[]): Promise<Order[]> {
  if (!supabase) return fallbackOrders;
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        date: item.created_at || new Date().toISOString(),
        items: item.items || [], // Items JSON Array
        subtotal: Number(item.subtotal || item.total * 0.9),
        discount: Number(item.discount || 0),
        tax: Number(item.tax || item.total * 0.08),
        total: Number(item.total),
        status: item.status as Order["status"],
        shippingAddress: item.shipping_address || {},
        paymentMethod: (item.payment_method || "Card") as Order["paymentMethod"],
        tracking: item.tracking || [],
        otp: item.otp || "8888",
        rewardPointsEarned: Number(item.reward_points_earned || 0),
      }));
    }
    return fallbackOrders;
  } catch (err) {
    console.warn("Error fetching orders from Supabase:", err);
    return fallbackOrders;
  }
}

/**
 * Update Order Status inside Supabase
 */
export async function dbUpdateOrderStatus(orderId: string, status: Order["status"], tracking: any[]): Promise<boolean> {
  if (!supabase) return true;
  try {
    const { error } = await supabase
      .from("orders")
      .update({
        status,
        tracking,
      })
      .eq("id", orderId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error updating order status in Supabase:", err);
    return false;
  }
}
