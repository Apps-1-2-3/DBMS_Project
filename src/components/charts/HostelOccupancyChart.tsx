import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

interface HostelOccupancyChartProps {
  boys: number;
  girls: number;
}

const COLORS = {
  boys: 'hsl(199, 89%, 48%)',
  girls: 'hsl(330, 81%, 60%)',
};

export const HostelOccupancyChart: React.FC<HostelOccupancyChartProps> = ({ boys, girls }) => {
  const data = [
    { name: 'Boys Hostel', occupancy: boys, color: COLORS.boys },
    { name: 'Girls Hostel', occupancy: girls, color: COLORS.girls },
  ];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-card p-3 shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].value}% occupied
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
            <Building2 className="h-5 w-5 text-info" />
          </div>
          <div>
            <CardTitle className="text-lg">Hostel Occupancy</CardTitle>
            <CardDescription>Current room utilization</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" barSize={32}>
              <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="occupancy" radius={[0, 8, 8, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-info/10 p-3 text-center">
            <p className="text-2xl font-bold text-info">{boys}%</p>
            <p className="text-xs text-muted-foreground">Boys Hostel</p>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'hsl(330, 81%, 60%, 0.1)' }}>
            <p className="text-2xl font-bold" style={{ color: COLORS.girls }}>{girls}%</p>
            <p className="text-xs text-muted-foreground">Girls Hostel</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HostelOccupancyChart;
