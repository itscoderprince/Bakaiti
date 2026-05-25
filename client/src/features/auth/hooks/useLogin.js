import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas/auth.schema.js";
import { useDispatch, useSelector } from "react-redux";
import { loginUserThunk } from "../store/auth.thunks.js";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  const form = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      await dispatch(loginUserThunk(data)).unwrap();
      form.reset();
      navigate("/");
    } catch (error) {
      // Error toast is already handled in the thunk
      console.error("Login failed:", error);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading,
  };
};
