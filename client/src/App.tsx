import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Equipment from "./pages/Equipment";
import Maintenance from "./pages/Maintenance";
import Inventory from "./pages/Inventory";
import WorkOrders from "./pages/WorkOrders";
import QRScanner from "./pages/QRScanner";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      <Route path="/dashboard">
        {() => (
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/equipment">
        {() => (
          <DashboardLayout>
            <Equipment />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/maintenance">
        {() => (
          <DashboardLayout>
            <Maintenance />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/inventory">
        {() => (
          <DashboardLayout>
            <Inventory />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/workorders">
        {() => (
          <DashboardLayout>
            <WorkOrders />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/qr-scanner">
        {() => (
          <DashboardLayout>
            <QRScanner />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
