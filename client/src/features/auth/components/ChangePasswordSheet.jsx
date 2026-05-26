import { useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordThunk } from "../store/auth.thunks.js";
import PasswordInput from "../../../components/PasswordInput.jsx";
import { Lock, Loader2, Save } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const changePasswordSchema = z.object({
  oldPassword: z.string().min(6, "Old password must be at least 6 characters"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmNewPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords do not match",
  path: ["confirmNewPassword"],
});

const ChangePasswordSheet = ({ open, onOpenChange }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await dispatch(
        changePasswordThunk({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
          confirmNewPassword: data.confirmNewPassword,
        })
      ).unwrap();
      // Reset form and close sheet on success
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[calc(100vw-1.5rem)] sm:max-w-md p-6">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl">Settings</SheetTitle>
          <SheetDescription>
            Manage your account settings and change your password.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="oldPassword" className="flex items-center gap-2">
                <Lock size={14} className="text-muted-foreground" />
                Old Password
              </Label>
              <PasswordInput
                id="oldPassword"
                placeholder="Enter current password"
                {...register("oldPassword")}
              />
              {errors.oldPassword && (
                <p className="text-xs text-red-500">{errors.oldPassword.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="newPassword" className="flex items-center gap-2">
                <Lock size={14} className="text-muted-foreground" />
                New Password
              </Label>
              <PasswordInput
                id="newPassword"
                placeholder="Enter new password"
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-xs text-red-500">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmNewPassword" className="flex items-center gap-2">
                <Lock size={14} className="text-muted-foreground" />
                Confirm New Password
              </Label>
              <PasswordInput
                id="confirmNewPassword"
                placeholder="Confirm new password"
                {...register("confirmNewPassword")}
              />
              {errors.confirmNewPassword && (
                <p className="text-xs text-red-500">{errors.confirmNewPassword.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating password...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Change Password
              </>
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default ChangePasswordSheet;
