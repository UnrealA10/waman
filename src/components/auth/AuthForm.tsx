import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Phone, Mail, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    fullName: '',
    role: 'customer',
  });

  const { signIn, signUp, signInWithOtp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEmailAuth = async (
    type: 'signin' | 'signup',
    role: string = 'customer'
  ) => {
    setIsLoading(true);
    try {
      if (type === 'signup') {
        const { error } = await signUp(formData.email, formData.password, {
          full_name: formData.fullName,
          phone: formData.phone,
          role: role,
        });

        if (error) throw new Error(`Signup failed: ${error.message}`);
        toast({
          title: 'Success',
          description: `Account created as ${role}. Please sign in.`,
        });
        navigate('/auth');
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) throw new Error(`Signin failed: ${error.message}`);

        // Fetch user profile to check role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (profileError) throw new Error(`Profile fetch failed: ${profileError.message}`);

        if (role === 'admin' && profile?.role !== 'admin') {
          toast({
            title: 'Access Denied',
            description: 'You are not authorized to access the admin panel.',
            variant: 'destructive',
          });
          await supabase.auth.signOut();
          navigate('/auth');
          return;
        }

        navigate(profile?.role === 'admin' ? '/admin' : '/');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: 'Authentication Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneAuth = async () => {
    if (!formData.phone) {
      toast({
        title: 'Phone Required',
        description: 'Please enter your phone number.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signInWithOtp(formData.phone);
      if (error) throw new Error(`OTP send failed: ${error.message}`);
      setOtpSent(true);
      toast({
        title: 'OTP Sent',
        description: 'Please check your phone for the verification code.',
      });
    } catch (error) {
      console.error('Phone auth error:', error);
      toast({
        title: 'OTP Error',
        description: error.message || 'Failed to send OTP. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter the complete 6-digit code.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Verifying...',
      description: 'Please wait while we verify your code.',
    });
    // Add OTP verification logic here if needed
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (otpSent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-heading text-dusty-rose">
            Verify Your Phone
          </CardTitle>
          <CardDescription>
            We've sent a 6-digit code to {formData.phone}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="otp">Enter verification code</Label>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp} onComplete={handleOtpVerify}>
                <InputOTPGroup>
                  {[...Array(6)].map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleOtpVerify}
              className="w-full bg-rose-gold hover:bg-rose-gold/90"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Verify Code
            </Button>
            <Button variant="ghost" onClick={() => setOtpSent(false)} className="w-full">
              Back to Phone Number
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-heading text-dusty-rose">
          Welcome to WAMAN HAUS
        </CardTitle>
        <CardDescription>
          Sign in to your account or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Email
            </TabsTrigger>
            <TabsTrigger value="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> Phone
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  onClick={() => handleEmailAuth('signin')}
                  className="w-full bg-rose-gold hover:bg-rose-gold/90"
                  disabled={isLoading || !formData.email || !formData.password}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign In
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <Label>Full Name</Label>
                <Input
                  type="text"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                <Label>Phone (optional)</Label>
                <Input
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              
                <Button
                  onClick={() => handleEmailAuth('signup', formData.role)}
                  className="w-full bg-rose-gold hover:bg-rose-gold/90"
                  disabled={isLoading || !formData.email || !formData.password || !formData.fullName}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Account
                </Button>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="phone" className="space-y-4">
            <Label>Phone Number</Label>
            <Input
              type="tel"
              placeholder="+1234567890"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
            <Button
              onClick={handlePhoneAuth}
              className="w-full bg-rose-gold hover:bg-rose-gold/90"
              disabled={isLoading || !formData.phone}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send OTP
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AuthForm;