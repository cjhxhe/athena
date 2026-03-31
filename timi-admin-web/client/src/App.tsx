/**
 * App.tsx - Timi Admin Dashboard
 * Design: Dark Professional Dashboard
 * Routes: Login + Dashboard pages
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import DashboardLayout from "./components/DashboardLayout";

// Pages
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import ProfilesPage from "./pages/Profiles";
import UsersPage from "./pages/Users";
import AgentsPage from "./pages/Agents";
import InviteCodesPage from "./pages/InviteCodes";
import DictionariesPage from "./pages/Dictionaries";
import ChatPage from "./pages/Chat";
import NotFound from "./pages/NotFound";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Redirect to="/login" />;
  return (
    <DashboardLayout>
      <Component />
    </DashboardLayout>
  );
}

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={DashboardPage} />
      </Route>
      <Route path="/profiles">
        <ProtectedRoute component={ProfilesPage} />
      </Route>
      <Route path="/users">
        <ProtectedRoute component={UsersPage} />
      </Route>
      <Route path="/agents">
        <ProtectedRoute component={AgentsPage} />
      </Route>
      <Route path="/invite-codes">
        <ProtectedRoute component={InviteCodesPage} />
      </Route>
      <Route path="/dictionaries">
        <ProtectedRoute component={DictionariesPage} />
      </Route>
      <Route path="/chat">
        <ProtectedRoute component={ChatPage} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            <Toaster richColors position="top-right" />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
