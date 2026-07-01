// ==========================================================
// SUPABASE EDGE FUNCTION - COUPON VALIDATION
// ==========================================================
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { code, cartAmount } = await req.json();

    if (!code) {
      return new Response(JSON.stringify({ error: "Coupon code is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (error || !coupon) {
      return new Response(JSON.stringify({ valid: false, message: "Invalid promo code." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!coupon.is_active) {
      return new Response(JSON.stringify({ valid: false, message: "This coupon is no longer active." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return new Response(JSON.stringify({ valid: false, message: "This coupon has expired." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (cartAmount && Number(cartAmount) < Number(coupon.min_spend)) {
      return new Response(
        JSON.stringify({
          valid: false,
          message: `Minimum spend of $${coupon.min_spend} required for this coupon.`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ valid: true, coupon }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
