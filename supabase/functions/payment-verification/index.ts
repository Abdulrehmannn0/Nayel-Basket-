// ==========================================================
// SUPABASE EDGE FUNCTION - PAYMENT VERIFICATION
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

    const { transactionId, orderId, gateway, amount, status } = await req.json();

    if (status === "captured" || status === "success") {
      // 1. Update Order inside database to Processing
      const { error: orderErr } = await supabase
        .from("orders")
        .update({ status: "Processing" })
        .eq("id", orderId);

      if (orderErr) throw orderErr;

      // 2. Fetch order to get user details
      const { data: order } = await supabase
        .from("orders")
        .select("user_id, total")
        .eq("id", orderId)
        .single();

      if (order) {
        // Log transaction to analytics
        await supabase.from("analytics").insert({
          event_name: "payment_captured",
          params: { order_id: orderId, amount, gateway, user_id: order.user_id },
          user_id: order.user_id,
        });

        // Award reward points (10 points per dollar spent)
        const points = Math.floor(Number(amount) * 10);
        await supabase.rpc("add_user_points", { p_user_id: order.user_id, p_points: points });
      }

      return new Response(JSON.stringify({ success: true, message: "Payment validated and captured successfully." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: false, error: "Payment verification failed or status uncaptured." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
