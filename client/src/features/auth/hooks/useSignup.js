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
      const payload = {
        fullname: data.fullname,
        username: data.username,
        email: data.email,
        password: data.password,
        gender: data.gender,
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
