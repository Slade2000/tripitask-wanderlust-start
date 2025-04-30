
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual login functionality
    console.log("Login attempt with:", { email });
    // For now, just navigate to home
    navigate("/home");
  };

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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-cream/50"
              />
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

            <Button type="submit" className="w-full bg-teal hover:bg-teal-dark">
              <LogIn className="mr-2" /> Log In
            </Button>
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
