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
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Login to continue chatting</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit}>
              <div className="grid gap-6">
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
                    <p className="text-xs text-red-500">{errors.username.message}</p>
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
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline text-muted-foreground"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <PasswordInput
                    id="password"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
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
