
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Facebook, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isLoading, signInWithProvider, session } = useAuth();
  const [loginInProgress, setLoginInProgress] = useState(false);

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (session) {
      navigate("/home");
    }
  }, [session, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginInProgress(true);
    
    try {
      const result = await signIn(email, password);
      if (result.error) {
        toast.error(result.error.message || "Failed to sign in");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setLoginInProgress(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithProvider("google");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await signInWithProvider("facebook");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Facebook");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Combined loading state from context and local state
  const isProcessing = isLoading || loginInProgress;

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center p-4">
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal">Welcome Back</h1>
          <p className="text-teal-dark mt-2">Sign in to your TripiTask account</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com"
                required
                className="bg-cream/50"
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-cream/50"
                  disabled={isProcessing}
                />
                <button 
                  type="button"
                  className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-teal hover:text-teal-dark text-sm"
              >
                Forgot your password?
              </button>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-teal hover:bg-teal-dark"
              disabled={isProcessing}
            >
              <LogIn className="mr-2" /> {isProcessing ? 'Logging in...' : 'Log In'}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                disabled={isProcessing}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" className="mr-2">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
                Sign in with Google
              </Button>
              
              <Button
                type="button"
                onClick={handleFacebookLogin}
                className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white"
                disabled={isProcessing}
              >
                <Facebook className="mr-2" />
                Sign in with Facebook
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-teal-dark">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-teal hover:text-teal-dark font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-teal-dark hover:text-teal"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
