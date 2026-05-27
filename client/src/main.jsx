import { createRoot } from "react-dom/client";
import { lazy, Suspense } from "react";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";

// Lazy loaded page components for optimal bundle chunking
const Home = lazy(() => import("./pages/home/Home.jsx"));
const Login = lazy(() => import("./features/auth/components/Login.jsx"));
const Signup = lazy(() => import("./features/auth/components/Signup.jsx"));
const ForgotPassword = lazy(
  () => import("./features/auth/components/ForgotPassword.jsx"),
);
const ResetPassword = lazy(
  () => import("./features/auth/components/ResetPassword.jsx"),
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Suspense fallback={null}>
              <Home />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "login",
        element: (
          <PublicRoute>
            <Suspense fallback={null}>
              <Login />
            </Suspense>
          </PublicRoute>
        ),
      },
      {
        path: "signup",
        element: (
          <PublicRoute>
            <Suspense fallback={null}>
              <Signup />
            </Suspense>
          </PublicRoute>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <PublicRoute>
            <Suspense fallback={null}>
              <ForgotPassword />
            </Suspense>
          </PublicRoute>
        ),
      },
      {
        path: "reset-password/:token",
        element: (
          <PublicRoute>
            <Suspense fallback={null}>
              <ResetPassword />
            </Suspense>
          </PublicRoute>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <TooltipProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" reverseOrder={false} />
    </TooltipProvider>
  </Provider>,
);
