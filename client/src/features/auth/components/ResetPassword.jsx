import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordThunk } from "../store/auth.thunks.js";
import PasswordInput from "../../../components/PasswordInput.jsx";
import { Lock, Loader2, ArrowLeft } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const resetSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await dispatch(
        resetPasswordThunk({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        })
      ).unwrap();
      // Redirect to login page upon success
      navigate("/login");
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
            <CardTitle className="text-xl">Reset Password</CardTitle>
            <CardDescription>
              Create a new secure password for your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock size={14} className="text-muted-foreground" />
                    New Password
                  </Label>
                  <PasswordInput
                    id="password"
                    placeholder="Enter new password"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                    <Lock size={14} className="text-muted-foreground" />
                    Confirm Password
                  </Label>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="Confirm new password"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>

                <div className="text-center text-sm">
                  <Link
                    to="/login"
                    className="inline-flex items-center text-muted-foreground hover:text-foreground text-xs gap-1.5"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Cancel and Sign In
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

export default ResetPassword;
