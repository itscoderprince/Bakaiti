import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { FaUser, FaLock, FaImage, FaVenusMars } from "react-icons/fa";
import { MdAlternateEmail } from "react-icons/md";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "../../schemas/auth.schema.js";
import PasswordInput from "../../components/PasswordInput";
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
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    // For the file upload, the form data gives a FileList. We grab the first file.
    const file =
      data.profilePic && data.profilePic.length > 0 ? data.profilePic[0] : null;
    console.log({ ...data, profilePic: file });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    reset();
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-lg flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Create your account</CardTitle>
            <CardDescription>
              Enter your details below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullname" className="flex items-center gap-2">
                    <FaUser size={14} className="text-muted-foreground" />
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
                    <FaUser size={14} className="text-muted-foreground" />
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
                    <MdAlternateEmail
                      size={14}
                      className="text-muted-foreground"
                    />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label
                      htmlFor="password"
                      className="flex items-center gap-2"
                    >
                      <FaLock size={14} className="text-muted-foreground" />
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
                      <FaLock size={14} className="text-muted-foreground" />
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
                    <FaVenusMars size={14} className="text-muted-foreground" />
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
                    <FaImage size={14} className="text-muted-foreground" />
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

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
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
