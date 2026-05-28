import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileThunk } from "../store/auth.thunks.js";
import { User, Mail, Camera, Loader2, Save, BadgeHelp, Quote } from "lucide-react";
import { getOptimizedMediaUrl } from "../../../utils/cloudinary.js";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

const updateProfileSchema = z.object({
  fullname: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  gender: z.enum(["male", "female"]),
  bio: z.string().max(200, "Bio must be at most 200 characters"),
});

const EditProfileSheet = ({ open, onOpenChange }) => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicBase64, setProfilePicBase64] = useState("");
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullname: "",
      username: "",
      email: "",
      gender: "male",
      bio: "Hey there! I am using BackChodi.",
    },
  });

  const gender = watch("gender");

  // Pre-populate fields when drawer opens or user changes
  useEffect(() => {
    if (currentUser && open) {
      reset({
        fullname: currentUser.fullname || "",
        username: currentUser.username || "",
        email: currentUser.email || "",
        gender: currentUser.gender || "male",
        bio: currentUser.bio || "Hey there! I am using BackChodi.",
      });
      setProfilePicBase64(currentUser.profilePic || "");
    }
  }, [currentUser, open, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      toast.error("Image size must be less than 1MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicBase64(reader.result);
      toast.success("Profile photo updated locally! Save to upload.");
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await dispatch(
        updateProfileThunk({
          ...data,
          profilePic: profilePicBase64,
        })
      ).unwrap();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[calc(100vw-1.5rem)] sm:max-w-md p-6 overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl">Profile Details</SheetTitle>
          <SheetDescription>
            View and update your personal credentials, profile picture, and custom status.
          </SheetDescription>
        </SheetHeader>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Circular Avatar Section */}
          <div className="flex flex-col items-center gap-2 mb-2">
            <div
              onClick={triggerFileSelect}
              className="group relative cursor-pointer h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary transition-all duration-300 shadow-md"
            >
              {profilePicBase64 ? (
                <img
                  src={getOptimizedMediaUrl(profilePicBase64, { width: 192, height: 192, gravity: "face" })}
                  alt="Profile Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-3xl font-bold">
                  {getInitials(currentUser?.fullname)}
                </div>
              )}

              {/* Frosted camera hover overlay */}
              <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-white transition-all duration-300">
                <Camera size={20} className="animate-pulse" />
                <span className="text-[10px] font-medium tracking-wide">Change Photo</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">Click photo to update</span>
          </div>

          <div className="grid gap-5">
            {/* Full Name */}
            <div className="grid gap-2">
              <Label htmlFor="fullname" className="flex items-center gap-2 text-sm font-medium">
                <User size={14} className="text-muted-foreground" />
                Full Name
              </Label>
              <Input
                id="fullname"
                placeholder="Enter full name"
                className="bg-muted/30 focus-visible:ring-primary rounded-xl"
                {...register("fullname")}
              />
              {errors.fullname && (
                <p className="text-xs text-red-500">{errors.fullname.message}</p>
              )}
            </div>

            {/* Username */}
            <div className="grid gap-2">
              <Label htmlFor="username" className="flex items-center gap-2 text-sm font-medium">
                <span className="text-muted-foreground font-semibold text-xs">@</span>
                Username
              </Label>
              <Input
                id="username"
                placeholder="Enter username"
                className="bg-muted/30 focus-visible:ring-primary rounded-xl"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-xs text-red-500">{errors.username.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                <Mail size={14} className="text-muted-foreground" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                className="bg-muted/30 focus-visible:ring-primary rounded-xl"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Status Bio */}
            <div className="grid gap-2">
              <Label htmlFor="bio" className="flex items-center gap-2 text-sm font-medium">
                <Quote size={13} className="text-muted-foreground" />
                About / Status
              </Label>
              <Input
                id="bio"
                placeholder="Write something about yourself"
                className="bg-muted/30 focus-visible:ring-primary rounded-xl"
                {...register("bio")}
              />
              {errors.bio && (
                <p className="text-xs text-red-500">{errors.bio.message}</p>
              )}
            </div>

            {/* Gender Selection */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <BadgeHelp size={14} className="text-muted-foreground" />
                Gender
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setValue("gender", "male", { shouldValidate: true })}
                  className={`flex items-center justify-center p-3 rounded-xl border text-sm font-medium transition-all ${
                    gender === "male"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted"
                  }`}
                  style={{
                    borderColor: errors.gender ? "red" : undefined,
                  }}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setValue("gender", "female", { shouldValidate: true })}
                  className={`flex items-center justify-center p-3 rounded-xl border text-sm font-medium transition-all ${
                    gender === "female"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  Female
                </button>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full rounded-xl py-5 mt-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4.5 w-4.5" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default EditProfileSheet;
