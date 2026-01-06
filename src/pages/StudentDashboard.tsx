import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AttendanceForm } from '@/components/forms/AttendanceForm';
import { MealOptoutForm } from '@/components/forms/MealOptoutForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { api, MealMenu } from '@/lib/api';
import { Calendar, Clock, Coffee, Sun, Moon, UtensilsCrossed } from 'lucide-react';

const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [todayMenu, setTodayMenu] = useState<MealMenu[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const today = DAYS[new Date().getDay()];

  useEffect(() => {
  const fetchMenu = async () => {
    try {
      const menu = await api.meals.getMenu(today);

      // fallback if empty
      if (!menu || menu.length === 0) {
        const allMenu = await api.meals.getMenu();
        setTodayMenu(allMenu);
      } else {
        setTodayMenu(menu);
      }
    } catch (error) {
      console.error("Failed to fetch menu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchMenu();
}, [today]);


  const getMealIcon = (mealTime: string) => {
    switch (mealTime) {
      case 'BREAKFAST':
        return <Coffee className="h-4 w-4 text-warning" />;
      case 'LUNCH':
        return <Sun className="h-4 w-4 text-info" />;
      case 'DINNER':
        return <Moon className="h-4 w-4 text-accent" />;
      default:
        return <UtensilsCrossed className="h-4 w-4" />;
    }
  };

  const groupedMenu = todayMenu.reduce((acc, item) => {
    if (!acc[item.meal_time]) {
      acc[item.meal_time] = [];
    }
    acc[item.meal_time].push(item);
    return acc;
  }, {} as Record<string, MealMenu[]>);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here's your hostel overview for today
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-l-4 border-l-accent shadow-lg">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-xl font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-info shadow-lg">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
                <Clock className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Room Number</p>
                <p className="text-xl font-bold">{user?.room_number || 'Not Assigned'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success shadow-lg">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <Badge variant="outline" className="border-success text-success">
                  {user?.role}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Student ID</p>
                <p className="text-xl font-bold">{user?.student_id || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            <AttendanceForm />
            <MealOptoutForm />
          </div>

          {/* Right Column - Today's Menu */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <UtensilsCrossed className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <CardTitle>Today's Menu</CardTitle>
                  <CardDescription>{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
                </div>
              ) : Object.keys(groupedMenu).length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <UtensilsCrossed className="mx-auto mb-2 h-12 w-12 opacity-50" />
                  <p>No menu available for today</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {['BREAKFAST', 'LUNCH', 'DINNER'].map((mealTime) => {
                    const items = groupedMenu[mealTime];
                    if (!items) return null;

                    return (
                      <div key={mealTime} className="rounded-lg border bg-muted/30 p-4">
                        <div className="mb-3 flex items-center gap-2">
                          {getMealIcon(mealTime)}
                          <h3 className="font-semibold capitalize">{mealTime.toLowerCase()}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {items.map((item) => (
                            <Badge 
                              key={item.poolid} 
                              variant="secondary"
                              className="bg-background"
                            >
                              {item.menu_item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
