import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Building2, Mail, Lock, ArrowRight, Shield } from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast({
        title: 'Welcome back!',
        description: 'Login successful',
      });
      // Redirect based on role (handled by auth context)
      navigate('/');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-sidebar p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <Building2 className="h-7 w-7 text-accent-foreground" />
          </div>
          <span className="text-2xl font-bold text-sidebar-foreground">SmartHostel</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-sidebar-foreground">
            Streamline Your<br />
            <span className="text-gradient">Hostel Management</span>
          </h1>
          <p className="text-lg text-sidebar-foreground/70">
            Real-time attendance tracking, meal management, and comprehensive analytics 
            for modern hostel administration.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="rounded-xl bg-sidebar-accent p-4">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-semibold text-sidebar-foreground">Secure Access</h3>
              <p className="text-sm text-sidebar-foreground/60">Role-based authentication</p>
            </div>
            <div className="rounded-xl bg-sidebar-accent p-4">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-info/20">
                <ArrowRight className="h-5 w-5 text-info" />
              </div>
              <h3 className="font-semibold text-sidebar-foreground">Real-time Data</h3>
              <p className="text-sm text-sidebar-foreground/60">Live updates every 3s</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-sidebar-foreground/50">
          © 2025 SmartHostel. All rights reserved.
        </p>
      </div>

      {/* Right side - Login form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
              <Building2 className="h-7 w-7 text-accent-foreground" />
            </div>
            <span className="text-2xl font-bold">SmartHostel</span>
          </div>

          <Card className="border-0 shadow-2xl">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: {
                          value: 4,
                          message: 'Password must be at least 4 characters'
                        }
                      })}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  variant="accent"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground border-t-transparent" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Sign in</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-6 rounded-lg bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">
                  <strong>Demo credentials:</strong><br />
                  Student: student@hostel.com / password<br />
                  Admin: admin@hostel.com / password
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
