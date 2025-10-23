import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload = await req.json();
    
    console.log('Received Yookassa webhook:', JSON.stringify(payload));

    if (payload.event !== 'payment.succeeded' && payload.event !== 'payment.canceled') {
      console.log('Ignoring event:', payload.event);
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const payment = payload.object;
    const yookassaPaymentId = payment.id;
    const status = payment.status;
    const userId = payment.metadata?.user_id;
    const planType = payment.metadata?.plan_type;

    console.log('Processing payment:', yookassaPaymentId, 'status:', status, 'user:', userId);

    if (!userId || !planType) {
      console.error('Missing user_id or plan_type in metadata');
      throw new Error('Missing required metadata');
    }

    // Update payment status
    const { error: updateError } = await supabaseAdmin
      .from('payments')
      .update({ status: status === 'succeeded' ? 'succeeded' : 'cancelled' })
      .eq('yookassa_payment_id', yookassaPaymentId);

    if (updateError) {
      console.error('Error updating payment:', updateError);
      throw updateError;
    }

    console.log('Payment status updated');

    // If payment succeeded, create/update subscription
    if (status === 'succeeded') {
      const now = new Date();
      let endDate = new Date(now);

      switch (planType) {
        case '3_months':
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case '6_months':
          endDate.setMonth(endDate.getMonth() + 6);
          break;
        case '1_year':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
      }

      console.log('Creating subscription until:', endDate.toISOString());

      // Expire current trial/active subscriptions
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('user_id', userId)
        .in('status', ['trial', 'active']);

      // Get payment record
      const { data: paymentData } = await supabaseAdmin
        .from('payments')
        .select('id')
        .eq('yookassa_payment_id', yookassaPaymentId)
        .single();

      // Create new active subscription
      const { error: subError } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: userId,
          status: 'active',
          plan_type: planType,
          start_date: now.toISOString(),
          end_date: endDate.toISOString(),
          payment_id: paymentData?.id,
        });

      if (subError) {
        console.error('Error creating subscription:', subError);
        throw subError;
      }

      console.log('Subscription created successfully');
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in yookassa-webhook function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
