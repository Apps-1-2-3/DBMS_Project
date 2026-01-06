import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Coffee, Sun, Moon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type MealTime = 'BREAKFAST' | 'LUNCH' | 'DINNER';

interface MealOption {
  time: MealTime;
  icon: React.ReactNode;
  label: string;
  color: string;
}

const mealOptions: MealOption[] = [
  { time: 'BREAKFAST', icon: <Coffee className="h-5 w-5" />, label: 'Breakfast', color: 'bg-warning/10 text-warning border-warning/20' },
  { time: 'LUNCH', icon: <Sun className="h-5 w-5" />, label: 'Lunch', color: 'bg-info/10 text-info border-info/20' },
  { time: 'DINNER', icon: <Moon className="h-5 w-5" />, label: 'Dinner', color: 'bg-accent/10 text-accent border-accent/20' },
];

export const MealOptoutForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMeals, setSelectedMeals] = useState<Set<MealTime>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleMeal = (meal: MealTime) => {
    setSelectedMeals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(meal)) {
        newSet.delete(meal);
      } else {
        newSet.add(meal);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (!user?.student_id) {
      toast({
        title: 'Error',
        description: 'Student ID not found',
        variant: 'destructive',
      });
      return;
    }

    if (selectedMeals.size === 0) {
      toast({
        title: 'No meals selected',
        description: 'Please select at least one meal to opt out',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const today = new Date().toISOString().split('T')[0];

    try {
      await Promise.all(
        Array.from(selectedMeals).map(meal =>
          api.meals.optOut({
            date: today,
            meal_time: meal,
            opted_out: true,
            studentid: user.student_id!,
          })
        )
      );

      toast({
        title: 'Success!',
        description: `Opted out of ${selectedMeals.size} meal(s) for today`,
      });
      setSelectedMeals(new Set());
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update meal preferences',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Meal Opt-Out</CardTitle>
        <CardDescription>Select meals you won't be attending today</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {mealOptions.map(({ time, icon, label, color }) => (
            <button
              key={time}
              type="button"
              onClick={() => toggleMeal(time)}
              className={cn(
                'relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200',
                selectedMeals.has(time) 
                  ? 'border-accent bg-accent/10 shadow-md' 
                  : `border-transparent ${color}`
              )}
            >
              {selectedMeals.has(time) && (
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Check className="h-3 w-3" />
                </div>
              )}
              {icon}
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full"
          variant="accent"
          disabled={isSubmitting || selectedMeals.size === 0}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground border-t-transparent" />
              <span>Updating...</span>
            </div>
          ) : (
            `Opt Out of ${selectedMeals.size} Meal(s)`
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MealOptoutForm;
