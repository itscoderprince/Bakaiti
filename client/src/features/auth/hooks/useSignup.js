import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "../schemas/auth.schema.js";
import { useDispatch, useSelector } from "react-redux";
import { signupUserThunk } from "../store/auth.thunks.js";
import { useNavigate } from "react-router-dom";

export const useSignup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  const form = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    try {
      let profilePicBase64 = "";
      if (data.profilePic && data.profilePic.length > 0) {
        const file = data.profilePic[0];
        profilePicBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      const payload = {
        fullname: data.fullname,
        username: data.username,
        email: data.email,
        password: data.password,
        gender: data.gender,
        profilePic: profilePicBase64,
      };

      await dispatch(signupUserThunk(payload)).unwrap();
      form.reset();
      navigate("/");
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit, (errors) => console.log("Validation Errors:", errors)),
    isLoading,
  };
};
