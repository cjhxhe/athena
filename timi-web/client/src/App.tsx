import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import InviteCodePage from "./pages/InviteCodePage";
import ListPage from "./pages/ListPage";
import DetailPage from "./pages/DetailPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminEditPage from "./pages/AdminEditPage";
import AdminCreatePage from "./pages/AdminCreatePage";

function Router() {
  return (
    <Switch>
      <Route path={"/invite"} component={InviteCodePage} />
      <Route path={"/"} component={ListPage} />
      <Route path={"/detail/:id"} component={DetailPage} />
      <Route path={"/admin/login"} component={AdminLoginPage} />
      <Route path={"/admin/dashboard"} component={AdminDashboardPage} />
      <Route path={"/admin/profiles/create"} component={AdminCreatePage} />
      <Route path={"/admin/profiles/:id/edit"} component={AdminEditPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
