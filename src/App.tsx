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
import ServiceDetailsScreen from "@/pages/ServiceDetailsScreen";
import LoginScreen from "@/pages/LoginScreen";
import AdminLoginScreen from "@/pages/AdminLoginScreen";
import BrandAssets from "@/pages/BrandAssets";
import BlockedScreen from "@/pages/BlockedScreen";
import PermissionsScreen from "@/pages/PermissionsScreen";

import UserDashboard from "@/pages/user/UserDashboard";
import UserBooking from "@/pages/user/UserBooking";
import UserWallet from "@/pages/user/UserWallet";
import UserHistory from "@/pages/user/UserHistory";
import UserProfile from "@/pages/user/UserProfile";
import UserEditProfile from "@/pages/user/UserEditProfile";
import UserTracking from "@/pages/user/UserTracking";
import PackageTracking from "@/pages/user/PackageTracking";
import UserChat from "@/pages/user/UserChat";
import UserEmergency from "@/pages/user/UserEmergency";
import UserPackageSend from "@/pages/user/UserPackageSend";
import UserLostItem from "@/pages/user/UserLostItem";
import ReceiverInbox from "@/pages/user/ReceiverInbox";
import UserSecurity from "@/pages/user/UserSecurity";
import UserNotifications from "@/pages/user/UserNotifications";
import UserCommerce from "@/pages/user/UserCommerce";
import UserRestaurants from "@/pages/user/UserRestaurants";
import UserRental from "@/pages/user/UserRental";
import UserHotels from "@/pages/user/UserHotels";

import DriverDashboard from "@/pages/driver/DriverDashboard";
import DriverTracking from "@/pages/driver/DriverTracking";
import DriverRides from "@/pages/driver/DriverRides";
import DriverEarnings from "@/pages/driver/DriverEarnings";
import DriverWallet from "@/pages/driver/DriverWallet";
import DriverProfile from "@/pages/driver/DriverProfile";
import DriverEditProfile from "@/pages/driver/DriverEditProfile";
import DriverVehicle from "@/pages/driver/DriverVehicle";
import DriverNotifications from "@/pages/driver/DriverNotifications";
import DriverEmergency from "@/pages/driver/DriverEmergency";
import DriverLayout from "@/components/DriverLayout";

import RestaurantDashboard from "@/pages/business/RestaurantDashboard";
import RestaurantMenu from "@/pages/business/RestaurantMenu";
import RestaurantOrders from "@/pages/business/RestaurantOrders";
import RestaurantWallet from "@/pages/business/RestaurantWallet";
import RestaurantProfile from "@/pages/business/RestaurantProfile";
import RestaurantLayout from "@/components/RestaurantLayout";

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
          <Route path="/permissions" element={<PermissionsScreen />} />
          <Route path="/services" element={<ServicesScreen />} />
          <Route path="/services/:serviceKey" element={<ServiceDetailsScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/admin-login" element={<AdminLoginScreen />} />
          <Route path="/brand-assets" element={<BrandAssets />} />
          <Route path="/blocked" element={<BlockedScreen />} />

          {/* User (with tab layout) */}
          <Route path="/user" element={<RequireAuth allowedRoles={['user']}><UserLayout /></RequireAuth>}>
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="booking" element={<UserBooking />} />
            <Route path="wallet" element={<UserWallet />} />
            <Route path="history" element={<UserHistory />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="profile/edit" element={<UserEditProfile />} />
          </Route>
          {/* User stack screens (no tab bar) */}
          <Route path="/user/tracking" element={<RequireAuth allowedRoles={['user']}><UserTracking /></RequireAuth>} />
          <Route path="/user/package-tracking" element={<RequireAuth allowedRoles={['user']}><PackageTracking /></RequireAuth>} />
          <Route path="/user/chat" element={<RequireAuth allowedRoles={['user']}><UserChat /></RequireAuth>} />
          <Route path="/user/emergency" element={<RequireAuth allowedRoles={['user']}><UserEmergency /></RequireAuth>} />
          <Route path="/user/package" element={<RequireAuth allowedRoles={['user']}><UserPackageSend /></RequireAuth>} />
          <Route path="/user/lost-item" element={<RequireAuth allowedRoles={['user']}><UserLostItem /></RequireAuth>} />
          <Route path="/user/security" element={<RequireAuth allowedRoles={['user']}><UserSecurity /></RequireAuth>} />
          <Route path="/user/notifications" element={<RequireAuth allowedRoles={['user']}><UserNotifications /></RequireAuth>} />
          <Route path="/user/commerce" element={<RequireAuth allowedRoles={['user']}><UserCommerce /></RequireAuth>} />
          <Route path="/user/restaurants" element={<RequireAuth allowedRoles={['user']}><UserRestaurants /></RequireAuth>} />
          <Route path="/user/rental" element={<RequireAuth allowedRoles={['user']}><UserRental /></RequireAuth>} />
          <Route path="/user/hotels" element={<RequireAuth allowedRoles={['user']}><UserHotels /></RequireAuth>} />
          <Route path="/user/receiver-inbox" element={<RequireAuth allowedRoles={['user']}><ReceiverInbox /></RequireAuth>} />

          {/* Driver (with tab layout) */}
          <Route path="/driver" element={<RequireAuth allowedRoles={['driver']}><DriverLayout /></RequireAuth>}>
            <Route path="dashboard" element={<DriverDashboard />} />
            <Route path="rides" element={<DriverRides />} />
            <Route path="wallet" element={<DriverWallet />} />
            <Route path="earnings" element={<DriverEarnings />} />
            <Route path="notifications" element={<DriverNotifications />} />
            <Route path="profile" element={<DriverProfile />} />
          </Route>
          {/* Driver stack screens (no tab bar) */}
          <Route path="/driver/tracking" element={<RequireAuth allowedRoles={['driver']}><DriverTracking /></RequireAuth>} />
          <Route path="/driver/profile/edit" element={<RequireAuth allowedRoles={['driver']}><DriverEditProfile /></RequireAuth>} />
          <Route path="/driver/profile/vehicle" element={<RequireAuth allowedRoles={['driver']}><DriverVehicle /></RequireAuth>} />
          <Route path="/driver/emergency" element={<RequireAuth allowedRoles={['driver']}><DriverEmergency /></RequireAuth>} />
          <Route path="/driver/chat" element={<RequireAuth allowedRoles={['driver']}><UserChat /></RequireAuth>} />

          {/* Restaurant Partner (with tab layout) */}
          <Route path="/partner/restaurant" element={<RequireAuth allowedRoles={['restaurant']}><RestaurantLayout /></RequireAuth>}>
            <Route index element={<RestaurantDashboard />} />
            <Route path="menu" element={<RestaurantMenu />} />
            <Route path="orders" element={<RestaurantOrders />} />
            <Route path="wallet" element={<RestaurantWallet />} />
            <Route path="profile" element={<RestaurantProfile />} />
          </Route>

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
