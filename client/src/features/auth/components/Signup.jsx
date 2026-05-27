import { Link } from "react-router-dom";
import { Loader2, User, Lock, Image, Users, Mail } from "lucide-react";
import { Controller } from "react-hook-form";
import PasswordInput from "../../../components/PasswordInput";
import { useSignup } from "../hooks/useSignup.js";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Signup = () => {
  const { form, onSubmit, isLoading } = useSignup();
  const {
    register,
    control,
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

      <div className="flex w-full max-w-lg flex-col gap-6 relative z-10">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Create your account</CardTitle>
            <CardDescription>
              Enter your details below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullname" className="flex items-center gap-2">
                    <User size={14} className="text-muted-foreground" />
                    Full Name
                  </Label>
                  <Input
                    id="fullname"
                    type="text"
                    placeholder="John Doe"
                    {...register("fullname")}
                  />
                  {errors.fullname && (
                    <p className="text-xs text-red-500">
                      {errors.fullname.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User size={14} className="text-muted-foreground" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    {...register("username")}
                  />
                  {errors.username && (
                    <p className="text-xs text-red-500">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail size={14} className="text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="johndoe@example.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label
                      htmlFor="password"
                      className="flex items-center gap-2"
                    >
                      <Lock size={14} className="text-muted-foreground" />
                      Password
                    </Label>
                    <PasswordInput id="password" {...register("password")} />
                    {errors.password && (
                      <p className="text-xs text-red-500">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="confirmpassword"
                      className="flex items-center gap-2"
                    >
                      <Lock size={14} className="text-muted-foreground" />
                      Confirm Password
                    </Label>
                    <PasswordInput
                      id="confirmpassword"
                      placeholder="Confirm Password"
                      {...register("confirmpassword")}
                    />
                    {errors.confirmpassword && (
                      <p className="text-xs text-red-500">
                        {errors.confirmpassword.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="gender" className="flex items-center gap-2">
                    <Users size={14} className="text-muted-foreground" />
                    Gender
                  </Label>
                  <Controller
                    control={control}
                    name="gender"
                    defaultValue=""
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger id="gender" className="w-full">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.gender && (
                    <p className="text-xs text-red-500">
                      {errors.gender.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label
                    htmlFor="profilePic"
                    className="flex items-center gap-2"
                  >
                    <Image size={14} className="text-muted-foreground" />
                    Profile Picture
                  </Label>
                  <Input
                    id="profilePic"
                    type="file"
                    accept="image/*"
                    {...register("profilePic")}
                  />
                  {errors.profilePic && (
                    <p className="text-xs text-red-500">
                      {errors.profilePic.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Sign in
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

export default Signup;
