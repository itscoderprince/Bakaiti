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
const NavigationLayout = lazy(() => import("./components/NavigationLayout.jsx"));
const Home = lazy(() => import("./pages/home/Home.jsx"));
const Feed = lazy(() => import("./pages/feed/Feed.jsx"));
const Reels = lazy(() => import("./pages/reels/Reels.jsx"));
const Profile = lazy(() => import("./pages/profile/Profile.jsx"));
const Login = lazy(() => import("./features/auth/components/Login.jsx"));
const Signup = lazy(() => import("./features/auth/components/Signup.jsx"));
const ForgotPassword = lazy(() =>
  import("./features/auth/components/ForgotPassword.jsx")
);
const ResetPassword = lazy(() =>
  import("./features/auth/components/ResetPassword.jsx")
);

// Minimal animated page loader shown while lazy chunks are downloading.
// Prevents blank/white flashes during code-split navigation.
const PageLoader = () => (
  <div className="h-dvh w-screen flex items-center justify-center bg-zinc-950">
    <div className="flex gap-1.5">
      <span className="h-2 w-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.3s]" />
      <span className="h-2 w-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]" />
      <span className="h-2 w-2 rounded-full bg-primary/70 animate-bounce" />
    </div>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <NavigationLayout />
            </Suspense>
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                <Home />
              </Suspense>
            ),
          },
          {
            path: "feed",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Feed />
              </Suspense>
            ),
          },
          {
            path: "reels",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Reels />
              </Suspense>
            ),
          },
          {
            path: "profile",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Profile />
              </Suspense>
            ),
          },
          {
            path: "profile/:userId",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Profile />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "login",
        element: (
          <PublicRoute>
            <Suspense fallback={<PageLoader />}>
              <Login />
            </Suspense>
          </PublicRoute>
        ),
      },
      {
        path: "signup",
        element: (
          <PublicRoute>
            <Suspense fallback={<PageLoader />}>
              <Signup />
            </Suspense>
          </PublicRoute>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <PublicRoute>
            <Suspense fallback={<PageLoader />}>
              <ForgotPassword />
            </Suspense>
          </PublicRoute>
        ),
      },
      {
        path: "reset-password/:token",
        element: (
          <PublicRoute>
            <Suspense fallback={<PageLoader />}>
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
  </Provider>
);
