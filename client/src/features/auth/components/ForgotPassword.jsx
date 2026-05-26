import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordThunk } from "../store/auth.thunks.js";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
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

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [resetInfo, setResetInfo] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setResetInfo(null);
    try {
      const result = await dispatch(forgotPasswordThunk(data)).unwrap();
      // Store result so that we can show reset link directly in console fallback (dev mode)
      setResetInfo(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email and we'll send you a password reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetInfo ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-emerald-500/10 p-4 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
                  <p className="font-semibold mb-1">Request successful!</p>
                  {resetInfo.emailSent ? (
                    <p>We've dispatched a reset link to your registered email address.</p>
                  ) : (
                    <div className="space-y-2">
                      <p>SMTP is offline. We've printed the recovery link in the developer console.</p>
                      {resetInfo.resetUrl && (
                        <div className="mt-2 p-2.5 rounded-lg bg-zinc-950 text-zinc-100 dark:bg-zinc-900 text-[11px] font-mono break-all select-all border border-zinc-800">
                          <p className="font-semibold text-emerald-500 mb-1">Dev Mode Link:</p>
                          <a href={resetInfo.resetUrl} className="underline text-sky-400 hover:text-sky-300">
                            {resetInfo.resetUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Link to="/login" className="block w-full">
                  <Button className="w-full mt-2" variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail size={14} className="text-muted-foreground" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending link...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>

                  <div className="text-center text-sm">
                    Remembered your password?{" "}
                    <Link
                      to="/login"
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      Sign in
                    </Link>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
