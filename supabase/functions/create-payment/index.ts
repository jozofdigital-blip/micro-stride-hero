import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  planType: '3_months' | '6_months' | '1_year';
  promoCode?: string;
}

const PLAN_PRICES = {
  '3_months': 750,
  '6_months': 1300,
  '1_year': 2200,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { planType, promoCode }: PaymentRequest = await req.json();
    
    console.log('Creating payment for user:', user.id, 'plan:', planType, 'promo:', promoCode);

    let baseAmount = PLAN_PRICES[planType];
    let discountAmount = 0;
    let finalAmount = baseAmount;

    // Validate and apply promo code
    if (promoCode) {
      const { data: promo, error: promoError } = await supabaseClient
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (promoError || !promo) {
        return new Response(
          JSON.stringify({ error: 'Промокод не найден или неактивен' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if promo code is valid
      const now = new Date();
      const validFrom = new Date(promo.valid_from);
      const validUntil = promo.valid_until ? new Date(promo.valid_until) : null;

      if (now < validFrom || (validUntil && now > validUntil)) {
        return new Response(
          JSON.stringify({ error: 'Промокод просрочен' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check max uses
      if (promo.max_uses !== null && promo.current_uses >= promo.max_uses) {
        return new Response(
          JSON.stringify({ error: 'Промокод использован максимальное количество раз' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      discountAmount = Math.round((baseAmount * promo.discount_percent) / 100);
      finalAmount = baseAmount - discountAmount;

      // Increment promo code usage
      await supabaseClient
        .from('promo_codes')
        .update({ current_uses: promo.current_uses + 1 })
        .eq('id', promo.id);
    }

    // Create payment in Yookassa
    const yookassaShopId = Deno.env.get('YOOKASSA_SHOP_ID');
    const yookassaSecretKey = Deno.env.get('YOOKASSA_SECRET_KEY');
    
    const auth = btoa(`${yookassaShopId}:${yookassaSecretKey}`);
    
    const idempotenceKey = crypto.randomUUID();
    
    const yookassaResponse = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
      },
      body: JSON.stringify({
        amount: {
          value: finalAmount.toFixed(2),
          currency: 'RUB',
        },
        capture: true,
        confirmation: {
          type: 'redirect',
          return_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-success`,
        },
        description: `Подписка на ${planType === '3_months' ? '3 месяца' : planType === '6_months' ? '6 месяцев' : '1 год'}`,
        metadata: {
          user_id: user.id,
          plan_type: planType,
          promo_code: promoCode || null,
        },
      }),
    });

    if (!yookassaResponse.ok) {
      const errorData = await yookassaResponse.text();
      console.error('Yookassa error:', errorData);
      throw new Error('Failed to create payment in Yookassa');
    }

    const yookassaData = await yookassaResponse.json();
    
    console.log('Yookassa payment created:', yookassaData.id);

    // Save payment to database
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        user_id: user.id,
        yookassa_payment_id: yookassaData.id,
        amount: finalAmount,
        currency: 'RUB',
        status: 'pending',
        plan_type: planType,
        promo_code: promoCode || null,
        discount_amount: discountAmount,
        confirmation_url: yookassaData.confirmation.confirmation_url,
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error saving payment:', paymentError);
      throw paymentError;
    }

    console.log('Payment saved to database:', payment.id);

    return new Response(
      JSON.stringify({
        paymentId: payment.id,
        confirmationUrl: yookassaData.confirmation.confirmation_url,
        amount: finalAmount,
        discountAmount,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-payment function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
