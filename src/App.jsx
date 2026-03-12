import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { queryClientInstance } from "@/lib/query-client";
import { AppProvider, useApp } from "@/lib/AuthContext";
import { pagesConfig } from "./pages.config";
import PageNotFound from "./lib/PageNotFound";
import Onboarding from "@/components/corae/Onboarding";
import Login from "@/pages/Login";
import Splash from "@/pages/Splash";

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = Pages[mainPageKey];

function LayoutWrapper({ children, currentPageName }) {
  return Layout ? (
    <Layout currentPageName={currentPageName}>{children}</Layout>
  ) : (
    <>{children}</>
  );
}

function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#f5f1eb]">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, family, loading, refreshFamily } = useApp();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!family) {
    return <Onboarding user={user} onComplete={refreshFamily} />;
  }

  return children;
}

function AppRoutes() {
  const { user, loading } = useApp();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={<Splash />} />

      <Route
        path="/login"
        element={user ? <Navigate to="/home" replace /> : <Login />}
      />

      <Route path={`/${mainPageKey}`} element={<Navigate to="/home" replace />} />
      <Route path="/today" element={<Navigate to="/home" replace />} />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <LayoutWrapper currentPageName={mainPageKey}>
              <MainPage />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />

      {Object.entries(Pages)
        .filter(([path]) => path !== mainPageKey)
        .map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <ProtectedRoute>
                <LayoutWrapper currentPageName={path}>
                  <Page />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
        ))}

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AppRoutes />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AppProvider>
  );
}