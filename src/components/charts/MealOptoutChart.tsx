import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UtensilsCrossed } from 'lucide-react';

interface MealOptoutChartProps {
  breakfast: number;
  lunch: number;
  dinner: number;
}

const COLORS = ['hsl(38, 92%, 50%)', 'hsl(199, 89%, 48%)', 'hsl(262, 83%, 58%)'];

export const MealOptoutChart: React.FC<MealOptoutChartProps> = ({ breakfast, lunch, dinner }) => {
  const data = [
    { name: 'Breakfast', value: breakfast, color: COLORS[0] },
    { name: 'Lunch', value: lunch, color: COLORS[1] },
    { name: 'Dinner', value: dinner, color: COLORS[2] },
  ];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-card p-3 shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].value}% opted out
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
            <UtensilsCrossed className="h-5 w-5 text-warning" />
          </div>
          <div>
            <CardTitle className="text-lg">Meal Opt-out Rates</CardTitle>
            <CardDescription>Today's meal preferences</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value: string) => <span className="text-sm font-medium text-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {data.map((item, index) => (
            <div key={item.name} className="rounded-lg p-3 text-center" style={{ backgroundColor: `${COLORS[index]}15` }}>
              <p className="text-xl font-bold" style={{ color: COLORS[index] }}>{item.value}%</p>
              <p className="text-xs text-muted-foreground">{item.name}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MealOptoutChart;
