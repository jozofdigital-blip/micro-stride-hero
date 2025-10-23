import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Calendar, CreditCard, LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Subscription {
  status: string;
  end_date: string | null;
  plan_type: string | null;
}

export function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('status, end_date, plan_type')
        .eq('user_id', user.id)
        .in('status', ['trial', 'active'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      setSubscription(data);
    } catch (error: any) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getPlanName = (planType: string | null) => {
    if (!planType) return null;
    switch (planType) {
      case '3_months': return '3 месяца';
      case '6_months': return '6 месяцев';
      case '1_year': return '1 год';
      default: return planType;
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">Ваша подписка</CardTitle>
          <CardDescription>Статус вашего доступа</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Статус:</span>
              <Badge variant={subscription.status === 'trial' ? 'secondary' : 'default'}>
                {subscription.status === 'trial' ? 'Пробный период' : 'Активна'}
              </Badge>
            </div>
            
            {subscription.plan_type && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Тариф:</span>
                <span className="text-sm">{getPlanName(subscription.plan_type)}</span>
              </div>
            )}
            
            {subscription.end_date && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Действует до:
                </span>
                <span className="text-sm font-semibold">{formatDate(subscription.end_date)}</span>
              </div>
            )}

            {subscription.status === 'trial' && (
              <Button
                className="w-full mt-4"
                onClick={() => navigate("/subscription")}
                variant="outline"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Продлить доступ
              </Button>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              У вас нет активной подписки
            </p>
            <Button
              className="w-full"
              onClick={() => navigate("/subscription")}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Оформить подписку
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
