import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import '@/i18n';

import RequireAuth from "@/components/RequireAuth";
import UserLayout from "@/components/UserLayout";

import SplashScreen from "@/pages/SplashScreen";
import OnboardingScreen from "@/pages/OnboardingScreen";
import ServicesScreen from "@/pages/ServicesScreen";
import LoginScreen from "@/pages/LoginScreen";
import AdminLoginScreen from "@/pages/AdminLoginScreen";
import BrandAssets from "@/pages/BrandAssets";

import UserDashboard from "@/pages/user/UserDashboard";
import UserBooking from "@/pages/user/UserBooking";
import UserWallet from "@/pages/user/UserWallet";
import UserHistory from "@/pages/user/UserHistory";
import UserProfile from "@/pages/user/UserProfile";
import UserTracking from "@/pages/user/UserTracking";
import PackageTracking from "@/pages/user/PackageTracking";
import UserChat from "@/pages/user/UserChat";
import UserEmergency from "@/pages/user/UserEmergency";
import UserPackageSend from "@/pages/user/UserPackageSend";
import UserLostItem from "@/pages/user/UserLostItem";

import DriverDashboard from "@/pages/driver/DriverDashboard";
import DriverRides from "@/pages/driver/DriverRides";
import DriverEarnings from "@/pages/driver/DriverEarnings";
import DriverWallet from "@/pages/driver/DriverWallet";

import AdminStandDashboard from "@/pages/admin/AdminStandDashboard";
import SuperAdminDashboard from "@/pages/admin/SuperAdminDashboard";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<SplashScreen />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/services" element={<ServicesScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/admin-login" element={<AdminLoginScreen />} />
          <Route path="/brand-assets" element={<BrandAssets />} />

          {/* User (with tab layout) */}
          <Route path="/user" element={<RequireAuth allowedRoles={['user']}><UserLayout /></RequireAuth>}>
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="booking" element={<UserBooking />} />
            <Route path="wallet" element={<UserWallet />} />
            <Route path="history" element={<UserHistory />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>
          {/* User stack screens (no tab bar) */}
          <Route path="/user/tracking" element={<RequireAuth allowedRoles={['user']}><UserTracking /></RequireAuth>} />
          <Route path="/user/package-tracking" element={<RequireAuth allowedRoles={['user']}><PackageTracking /></RequireAuth>} />
          <Route path="/user/chat" element={<RequireAuth allowedRoles={['user']}><UserChat /></RequireAuth>} />
          <Route path="/user/emergency" element={<RequireAuth allowedRoles={['user']}><UserEmergency /></RequireAuth>} />
          <Route path="/user/package" element={<RequireAuth allowedRoles={['user']}><UserPackageSend /></RequireAuth>} />
          <Route path="/user/lost-item" element={<RequireAuth allowedRoles={['user']}><UserLostItem /></RequireAuth>} />

          {/* Driver */}
          <Route path="/driver/dashboard" element={<RequireAuth allowedRoles={['driver']}><DriverDashboard /></RequireAuth>} />
          <Route path="/driver/rides" element={<RequireAuth allowedRoles={['driver']}><DriverRides /></RequireAuth>} />
          <Route path="/driver/earnings" element={<RequireAuth allowedRoles={['driver']}><DriverEarnings /></RequireAuth>} />
          <Route path="/driver/wallet" element={<RequireAuth allowedRoles={['driver']}><DriverWallet /></RequireAuth>} />
          <Route path="/driver/chat" element={<RequireAuth allowedRoles={['driver']}><UserChat /></RequireAuth>} />

          {/* Admin Stand */}
          <Route path="/admin-stand/dashboard" element={<RequireAuth allowedRoles={['admin-stand']}><AdminStandDashboard /></RequireAuth>} />

          {/* Super Admin */}
          <Route path="/super-admin/dashboard" element={<RequireAuth allowedRoles={['super-admin']}><SuperAdminDashboard /></RequireAuth>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
