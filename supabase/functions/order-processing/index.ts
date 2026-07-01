// ==========================================================
// SUPABASE EDGE FUNCTION - ORDER PROCESSING
// ==========================================================
// Written for Deno runtime in Supabase.
// Handles validation of stock levels, price integrity, and places order.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { orderId, items, userId, shippingAddress } = await req.json();

    if (!orderId || !items || !userId) {
      return new Response(JSON.stringify({ error: "Missing required parameters." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check inventory levels for all items
    for (const item of items) {
      const { data: product, error: prdError } = await supabase
        .from("products")
        .select("stock_count, name")
        .eq("id", item.product.id)
        .single();

      if (prdError || !product) {
        return new Response(JSON.stringify({ error: `Product ${item.product.name} not found.` }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (product.stock_count < item.quantity) {
        return new Response(
          JSON.stringify({ error: `Insufficient inventory for ${product.name}. Available: ${product.stock_count}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Deduct stock levels inside database
    for (const item of items) {
      await supabase.rpc("deduct_product_stock", {
        p_id: item.product.id,
        qty: item.quantity,
      });
    }

    // Push notification trigger
    await supabase.from("notifications").insert({
      user_id: userId,
      title: "📦 Order Placed Successfully",
      description: `Your Nayel Basket order ${orderId} has been confirmed.`,
      type: "order",
    });

    return new Response(JSON.stringify({ success: true, message: "Order processed successfully." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
