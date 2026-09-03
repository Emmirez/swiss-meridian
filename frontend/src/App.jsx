import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import {
  ProtectedRoute,
  AdminRoute,
  GuestRoute,
} from "./components/RouteGuards";

import Landing from "./pages/Landing";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import JointSignup from "./pages/JointSignup";
import NotFound from "./pages/NotFound";

import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Transfer from "./pages/Transfer";
import Transactions from "./pages/Transactions";
import Cards from "./pages/Cards";
import Beneficiaries from "./pages/Beneficiaries";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import KycWizard from "./pages/KycWizard";
import Support from "./pages/Support";
import Settings from "./pages/Settings";
import Trends from "./pages/Trends";
import BillPay from "./pages/BillPay";

import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminApprovals from "./pages/admin/AdminApprovals";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminKycReview from "./pages/admin/AdminKycReview";
import AdminSupportTickets from "./pages/admin/AdminSupportTickets";
import AdminCardRequests from "./pages/admin/AdminCardRequests";
import AdminLoans from "./pages/admin/AdminLoans";
import AdminGrants from "./pages/admin/AdminGrants";
import AdminTaxRefunds from "./pages/admin/AdminTaxRefunds";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminNotifications from "./pages/admin/AdminNotifications";

import AboutUs from "./pages/AboutUs";
import TermsAndConditions from "./pages/TermsAndConditions";
import ContactUs from "./pages/ContactUs";
import Currencies from "./pages/Currencies";
import Security from "./pages/Security";
import Checking from "./pages/accounts/Checking";
import Savings from "./pages/accounts/Savings";
import Business from "./pages/accounts/Business";
import MoneyMarket from "./pages/accounts/MoneyMarket";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DepositDisclosures from "./pages/DepositDisclosures";
import Careers from "./pages/Careers";
import ScrollToTop from "./components/ScrollToTop";
import InstallPrompt from "./components/InstallPrompt";
import Help from "./pages/Help";
import MoneyRequests from "./pages/MoneyRequests";
import Loans from "./pages/Loans";
import Grants from "./pages/Grants";
import Statements from "./pages/Statements";
import TaxRefunds from "./pages/TaxRefunds";
import FinancialServicesHub from "./pages/FinancialServicesHub";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <InstallPrompt />
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/currencies" element={<Currencies />} />
            <Route path="/security" element={<Security />} />
            <Route path="/accounts/checking" element={<Checking />} />
            <Route path="/accounts/savings" element={<Savings />} />
            <Route path="/accounts/business" element={<Business />} />
            <Route path="/accounts/money-market" element={<MoneyMarket />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/disclosures" element={<DepositDisclosures />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/help" element={<Help />} />

            <Route
              path="/register"
              element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              }
            />
            <Route path="/verify" element={<VerifyOtp />} />
            <Route
              path="/registration-success"
              element={<RegistrationSuccess />}
            />
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <GuestRoute>
                  <ForgotPassword />
                </GuestRoute>
              }
            />
            <Route
              path="/joint-signup"
              element={
                <GuestRoute>
                  <JointSignup />
                </GuestRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="transfer" element={<Transfer />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="cards" element={<Cards />} />
              <Route path="beneficiaries" element={<Beneficiaries />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />
              <Route path="kyc" element={<KycWizard />} />
              <Route path="support" element={<Support />} />
              <Route path="settings" element={<Settings />} />
              <Route path="trends" element={<Trends />} />
              <Route path="bills" element={<BillPay />} />
              <Route path="requests" element={<MoneyRequests />} />
              <Route path="loans" element={<Loans />} />
              <Route path="grants" element={<Grants />} />
              <Route path="statements" element={<Statements />} />
              <Route path="tax-refunds" element={<TaxRefunds />} />
              <Route
                path="financial-services"
                element={<FinancialServicesHub />}
              />
            </Route>

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="users/:id" element={<AdminUserDetail />} />
              <Route path="approvals" element={<AdminApprovals />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="audit-logs" element={<AdminAuditLogs />} />
              <Route path="kyc" element={<AdminKycReview />} />
              <Route path="tickets" element={<AdminSupportTickets />} />
              <Route path="cards" element={<AdminCardRequests />} />
              <Route path="loans" element={<AdminLoans />} />
              <Route path="grants" element={<AdminGrants />} />
              <Route path="tax-refunds" element={<AdminTaxRefunds />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="notifications" element={<AdminNotifications />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
