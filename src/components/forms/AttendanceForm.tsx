import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, LogOut, MapPin } from 'lucide-react';

interface AttendanceFormData {
  location: string;
  type: 'IN' | 'OUT';
}

export const AttendanceForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting } } = useForm<AttendanceFormData>({
    defaultValues: {
      location: '',
      type: 'IN',
    }
  });

  const selectedType = watch('type');

  const onSubmit = async (data: AttendanceFormData) => {
    if (!user?.student_id) {
      toast({
        title: 'Error',
        description: 'Student ID not found',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.attendance.mark({
        location: data.location,
        type: data.type,
        studentid: user.student_id,
      });

      toast({
        title: 'Success!',
        description: `Attendance marked: ${data.type} at ${data.location}`,
      });
      reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to mark attendance',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
            {selectedType === 'IN' ? (
              <LogIn className="h-5 w-5 text-accent-foreground" />
            ) : (
              <LogOut className="h-5 w-5 text-accent-foreground" />
            )}
          </div>
          <div>
            <CardTitle>Mark Attendance</CardTitle>
            <CardDescription>Record your check-in or check-out</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={selectedType}
              onValueChange={(value: 'IN' | 'OUT') => setValue('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4 text-success" />
                    <span>Check In</span>
                  </div>
                </SelectItem>
                <SelectItem value="OUT">
                  <div className="flex items-center gap-2">
                    <LogOut className="h-4 w-4 text-destructive" />
                    <span>Check Out</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="location"
                placeholder="e.g., Main Gate, Library"
                className="pl-10"
                {...register('location', { required: true })}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            variant="accent"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground border-t-transparent" />
                <span>Marking...</span>
              </div>
            ) : (
              `Mark ${selectedType === 'IN' ? 'Check In' : 'Check Out'}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AttendanceForm;
