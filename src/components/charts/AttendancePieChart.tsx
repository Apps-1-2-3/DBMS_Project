import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface AttendancePieChartProps {
  present: number;
  absent: number;
}

const COLORS = {
  present: 'hsl(142, 76%, 36%)',
  absent: 'hsl(0, 84%, 60%)',
};

export const AttendancePieChart: React.FC<AttendancePieChartProps> = ({ present, absent }) => {
  const total = present + absent;
  const data = [
    { name: 'Present', value: present, percentage: total > 0 ? ((present / total) * 100).toFixed(1) : 0 },
    { name: 'Absent', value: absent, percentage: total > 0 ? ((absent / total) * 100).toFixed(1) : 0 },
  ];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { percentage: number | string } }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-card p-3 shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].value} students ({payload[0].payload.percentage}%)
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <Users className="h-5 w-5 text-accent" />
          </div>
          <div>
            <CardTitle className="text-lg">Attendance Overview</CardTitle>
            <CardDescription>Today's student attendance</CardDescription>
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
                <Cell fill={COLORS.present} />
                <Cell fill={COLORS.absent} />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value: string) => <span className="text-sm font-medium text-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-success/10 p-3 text-center">
            <p className="text-2xl font-bold text-success">{data[0].percentage}%</p>
            <p className="text-xs text-muted-foreground">Present</p>
          </div>
          <div className="rounded-lg bg-destructive/10 p-3 text-center">
            <p className="text-2xl font-bold text-destructive">{data[1].percentage}%</p>
            <p className="text-xs text-muted-foreground">Absent</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendancePieChart;
