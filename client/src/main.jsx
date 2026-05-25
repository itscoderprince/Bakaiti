import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/home/Home.jsx";
import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import { TooltipProvider } from "@/components/ui/tooltip";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <TooltipProvider>
      <RouterProvider router={router} />
      <App />
    </TooltipProvider>
  </Provider>,
);
