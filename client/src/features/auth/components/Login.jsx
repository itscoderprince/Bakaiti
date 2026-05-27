import { Link } from "react-router-dom";
import { Loader2, User, Lock } from "lucide-react";
import PasswordInput from "../../../components/PasswordInput";
import { useLogin } from "../hooks/useLogin.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const Login = () => {
  const { form, onSubmit, isLoading } = useLogin();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-radial from-slate-50 via-zinc-100 to-neutral-200 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-slate-900 dark:via-neutral-950 dark:to-black p-6 md:p-10 relative overflow-hidden">
      {/* Ambient background glows */}
      <div
        className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl animate-pulse"
        style={{ animationDuration: "8s" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl animate-pulse"
        style={{ animationDuration: "12s" }}
      />

      <div className="flex w-full max-w-md flex-col gap-6 relative z-10">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold tracking-tight">
              Welcome back
            </CardTitle>
            <CardDescription>Login to continue chatting</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User size={14} className="text-muted-foreground" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    {...register("username")}
                  />
                  {errors.username && (
                    <p className="text-xs text-red-500">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label
                      htmlFor="password"
                      className="flex items-center gap-2"
                    >
                      <Lock size={14} className="text-muted-foreground" />
                      Password
                    </Label>
                    <Link
                      to="/forgot-password"
                      className="ml-auto text-sm underline-offset-4 hover:underline text-muted-foreground font-medium"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <PasswordInput id="password" {...register("password")} />
                  {errors.password && (
                    <p className="text-xs text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-xl mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>

                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/signup"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
