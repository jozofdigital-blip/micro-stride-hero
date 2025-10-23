import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Check, Loader2 } from "lucide-react";

const PLANS = [
  { id: '3_months' as const, name: '3 месяца', price: 750, perMonth: 250 },
  { id: '6_months' as const, name: '6 месяцев', price: 1300, perMonth: 217, popular: true },
  { id: '1_year' as const, name: '1 год', price: 2200, perMonth: 183, bestValue: true },
];

export default function Subscription() {
  const [promoCode, setPromoCode] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      }
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите промокод",
        variant: "destructive",
      });
      return;
    }

    setValidatingPromo(true);

    try {
      const { data, error } = await supabase.functions.invoke('validate-promo-code', {
        body: { code: promoCode },
      });

      if (error) throw error;

      if (data.valid) {
        setPromoDiscount(data.discountPercent);
        toast({
          title: "Промокод применен!",
          description: `Скидка ${data.discountPercent}%`,
        });
      } else {
        setPromoDiscount(null);
        toast({
          title: "Ошибка",
          description: data.error || "Промокод недействителен",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleSubscribe = async (planType: typeof PLANS[0]['id']) => {
    if (!user) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          planType,
          promoCode: promoCode.trim() || undefined,
        },
      });

      if (error) throw error;

      // Redirect to Yookassa payment page
      window.location.href = data.confirmationUrl;
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const calculatePrice = (price: number) => {
    if (promoDiscount) {
      return price - Math.round((price * promoDiscount) / 100);
    }
    return price;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 py-16">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Выберите тариф</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Начните свой путь к здоровым привычкам. Все тарифы включают полный доступ ко всем функциям.
          </p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Промокод</CardTitle>
            <CardDescription>Введите промокод для получения скидки</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="ПРОМОКОД"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                disabled={validatingPromo || loading}
              />
              <Button
                onClick={validatePromoCode}
                disabled={validatingPromo || loading}
                variant="outline"
              >
                {validatingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : "Применить"}
              </Button>
            </div>
            {promoDiscount && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <Check className="w-4 h-4" />
                Скидка {promoDiscount}% активирована
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const finalPrice = calculatePrice(plan.price);
            const discount = plan.price - finalPrice;
            
            return (
              <Card key={plan.id} className={plan.popular ? "border-primary shadow-lg scale-105" : ""}>
                <CardHeader>
                  <div className="space-y-2">
                    {plan.popular && (
                      <Badge className="w-fit">Популярный</Badge>
                    )}
                    {plan.bestValue && (
                      <Badge variant="secondary" className="w-fit">Выгодно</Badge>
                    )}
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>
                      {Math.round((finalPrice / (plan.id === '3_months' ? 3 : plan.id === '6_months' ? 6 : 12)))} ₽/месяц
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    {discount > 0 && (
                      <p className="text-2xl line-through text-muted-foreground">
                        {plan.price} ₽
                      </p>
                    )}
                    <p className="text-4xl font-bold">
                      {finalPrice} ₽
                    </p>
                    {discount > 0 && (
                      <p className="text-sm text-green-600">
                        Экономия {discount} ₽
                      </p>
                    )}
                  </div>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Доступ ко всем привычкам</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>90-дневные программы</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Отслеживание прогресса</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Мотивационные цитаты</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Выбрать тариф"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <Button variant="ghost" onClick={() => navigate("/")}>
            Вернуться назад
          </Button>
        </div>
      </div>
    </div>
  );
}
