import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AttendancePieChart } from '@/components/charts/AttendancePieChart';
import { MealOptoutChart } from '@/components/charts/MealOptoutChart';
import { HostelOccupancyChart } from '@/components/charts/HostelOccupancyChart';
import { RealTimeTable } from '@/components/RealTimeTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api, Attendance, Student, Employee, AnalyticsData } from '@/lib/api';
import { Users, ClipboardCheck, Building2, UserCog, RefreshCw } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    attendance: { present: 75, absent: 25 },
    mealOptout: { breakfast: 15, lunch: 20, dinner: 30 },
    hostelOccupancy: { boys: 85, girls: 78 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAnalytics = useCallback(async () => {
    try {
      const data = await api.admin.getAnalytics();
      setAnalytics(data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  const attendanceColumns = [
    { key: 'studentid' as keyof Attendance, header: 'Student ID' },
    { key: 'location' as keyof Attendance, header: 'Location' },
    { 
      key: 'type' as keyof Attendance, 
      header: 'Type',
      render: (item: Attendance) => (
        <Badge variant={item.type === 'IN' ? 'default' : 'secondary'} className={item.type === 'IN' ? 'bg-success text-success-foreground' : 'bg-destructive/10 text-destructive'}>
          {item.type}
        </Badge>
      )
    },
    { 
      key: 'time_stamp' as keyof Attendance, 
      header: 'Time',
      render: (item: Attendance) => new Date(item.time_stamp).toLocaleString()
    },
  ];

  const studentColumns = [
    { key: 'studentid' as keyof Student, header: 'ID' },
    { 
      key: 'first_name' as keyof Student, 
      header: 'Name',
      render: (item: Student) => `${item.first_name} ${item.last_name}`
    },
    { key: 'room_no' as keyof Student, header: 'Room' },
    { key: 'hostel_no' as keyof Student, header: 'Hostel' },
  ];

  const employeeColumns = [
    { key: 'ssn' as keyof Employee, header: 'SSN' },
    { 
      key: 'first_name' as keyof Employee, 
      header: 'Name',
      render: (item: Employee) => `${item.first_name} ${item.last_name}`
    },
    { 
      key: 'role' as keyof Employee, 
      header: 'Role',
      render: (item: Employee) => (
        <Badge variant="outline">{item.role}</Badge>
      )
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Admin <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="mt-1 text-muted-foreground">
              Real-time hostel analytics and management
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Updated: {lastRefresh.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-lg">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Present Today</p>
                <p className="text-2xl font-bold">{analytics.attendance.present}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <ClipboardCheck className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Absent Today</p>
                <p className="text-2xl font-bold">{analytics.attendance.absent}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
                <Building2 className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Boys Hostel</p>
                <p className="text-2xl font-bold">{analytics.hostelOccupancy.boys}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: 'hsl(330, 81%, 60%, 0.1)' }}>
                <Building2 className="h-6 w-6" style={{ color: 'hsl(330, 81%, 60%)' }} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Girls Hostel</p>
                <p className="text-2xl font-bold">{analytics.hostelOccupancy.girls}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-3">
          <AttendancePieChart 
            present={analytics.attendance.present} 
            absent={analytics.attendance.absent} 
          />
          <MealOptoutChart 
            breakfast={analytics.mealOptout.breakfast}
            lunch={analytics.mealOptout.lunch}
            dinner={analytics.mealOptout.dinner}
          />
          <HostelOccupancyChart 
            boys={analytics.hostelOccupancy.boys}
            girls={analytics.hostelOccupancy.girls}
          />
        </div>

        {/* Data Tables */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Live Data</CardTitle>
            <CardDescription>Real-time updates every 3 seconds</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="attendance">
              <TabsList className="mb-4">
                <TabsTrigger value="attendance" className="gap-2">
                  <ClipboardCheck className="h-4 w-4" />
                  Attendance
                </TabsTrigger>
                <TabsTrigger value="students" className="gap-2">
                  <Users className="h-4 w-4" />
                  Students
                </TabsTrigger>
                <TabsTrigger value="employees" className="gap-2">
                  <UserCog className="h-4 w-4" />
                  Employees
                </TabsTrigger>
              </TabsList>

              <TabsContent value="attendance">
                <RealTimeTable<Attendance>
                  fetchData={api.attendance.getAll}
                  columns={attendanceColumns}
                  keyField="id"
                  emptyMessage="No attendance records found"
                />
              </TabsContent>

              <TabsContent value="students">
                <RealTimeTable<Student>
                  fetchData={api.students.getAll}
                  columns={studentColumns}
                  keyField="studentid"
                  emptyMessage="No students found"
                />
              </TabsContent>

              <TabsContent value="employees">
                <RealTimeTable<Employee>
                  fetchData={api.admin.getEmployees}
                  columns={employeeColumns}
                  keyField="ssn"
                  emptyMessage="No employees found"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
