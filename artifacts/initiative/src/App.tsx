import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/ThemeProvider";

import { Navbar } from "./components/layout/Navbar";
import Home from "./pages/Home";
import Initiatives from "./pages/Initiatives";
import CreateInitiative from "./pages/CreateInitiative";
import InitiativeDetail from "./pages/InitiativeDetail";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/initiatives" component={Initiatives} />
          <Route path="/initiatives/new" component={CreateInitiative} />
          <Route path="/initiatives/:id" component={InitiativeDetail} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <footer className="bg-card border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">I</span>
            <span className="font-display font-bold text-xl tracking-tight">Initiative</span>
          </div>
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Initiative Platform. Empowering change.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
