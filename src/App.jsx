import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import FindPassword from "./pages/FindPassword";
import Report from "./pages/Report";
import UserProfile from "./components/mypage/UserProfile";
import LoginDeviceHistory from "./components/mypage/LoginDeviceHistory";
import Notifications from "./components/mypage/Notifications";
import TransactionReport from "./components/mypage/TransactionReport";
import ReportHistory from "./components/mypage/ReportHistory";

import Account from "./components/mypage/Accounts";
import Cards from "./components/mypage/Cards";
import FraudReportsPage from "./components/mypage/FraudReportsPage";
import FraudConfirmations from "./components/mypage/FraudConfirmations";

import LockRequestsPage from "./components/mypage/LockRequestsPage";

import { ThemeProvider } from "./context/ThemeContext";
import CustomerCenter from "./components/CustomerCenter";
import Transactions from "./components/mypage/Transactions";

import ProductList from "./components/financialProduct/ProductList";
import ProductDetail from "./components/financialProduct/ProductDetail";

import InvestmentDiagnosis from "./components/finance/InvestmentDiagnosis";
import SimulatedSubscriptionList from "./components/financialProduct/SimulatedSubscriptionList";

import MyPageLayout from "./components/mypage/MyPageLayout";
import Dashboard from "./components/mypage/Dashboard";
import RecommendedProducts from "./components/mypage/RecommendedProducts";

import FavoriteProductList from "./components/financialProduct/FavoriteProductList";

import FinancialGoalList from "./components/finance/FinancialGoalList";
import DiagnosisResults from "./components/finance/DiagnosisResults";
import FinancialProfile from "./components/finance/FinancialProfile";

import ChatWidget from "./components/chat/ChatWidget";
import { ChatWidgetProvider } from "./context/ChatWidgetContext";
import AdminChatList from "./components/admin/AdminChatList";
import AdminChatRoom from "./components/admin/AdminChatRoom";

import { useAuth } from "./context/AuthContext";

import AdminFraudCases from "./components/admin/AdminFraudCases";
import AdminLockRequests from "./components/admin/AdminLockRequests";
import FraudCaseDetail from "./components/fraud/FraudCaseDetail";
import AdminFraudAnalysis from "./components/admin/AdminFraudAnalysis";
import AdminReports from "./components/admin/AdminReports";
import AdminProfile from "./components/admin/AdminProfile";

import { ComparisonProvider } from "./context/ComparisonContext";
import ProductComparison from "./components/financialProduct/ProductComparison";

import { ToastProvider } from "./context/ToastContext";
import Toast from "./components/common/Toast";

import { ConfirmProvider } from "./context/ConfirmContext";

import FraudPrevention from "./components/fraud/FraudPrevention";

function AppChatWidget() {
  const { user } = useAuth();
  const location = useLocation();
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/signup";
  if (user?.role === "ADMIN" || isAuthRoute) return null;
  return <ChatWidget />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ComparisonProvider>
            <ToastProvider>
              <ConfirmProvider>
                <ChatWidgetProvider>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/support" element={<CustomerCenter />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/find-password" element={<FindPassword />} />

                    <Route path="/products" element={<ProductList />} />
                    <Route path="/products/:productId" element={<ProductDetail />} />
                    <Route path="/portfolio" element={<SimulatedSubscriptionList />} />
                    <Route path="/investment-diagnosis" element={<InvestmentDiagnosis />} />
                    <Route path="/fraud-prevention" element={<FraudPrevention />} />

                    <Route path="/mypage" element={<MyPageLayout />}>
                      <Route path="dashboard" element={<Dashboard />} />

                      <Route path="accounts" element={<Account />} />
                      <Route path="cards" element={<Cards />} />
                      <Route path="transactions" element={<Transactions />} />
                      <Route path="fraud-reports" element={<FraudReportsPage />} />
                      <Route path="fraud-confirmations" element={<FraudConfirmations />} />
                      <Route path="lock-requests" element={<LockRequestsPage />} />
                      <Route path="devices" element={<LoginDeviceHistory />} />
                      <Route path="notifications" element={<Notifications />} />
                      <Route path="favorites" element={<FavoriteProductList />} />
                      <Route path="comparisons" element={<ProductComparison />} />
                      <Route path="comparisons/:comparisonId" element={<ProductComparison />} />
                      <Route path="diagnosis/results" element={<DiagnosisResults />} />
                      <Route path="investment-diagnosis" element={<InvestmentDiagnosis />} />
                      <Route path="portfolio" element={<SimulatedSubscriptionList />} />
                      <Route path="financial-goals" element={<FinancialGoalList />} />
                      <Route path="financial-profile" element={<FinancialProfile />} />
                      <Route path="recommended-products" element={<RecommendedProducts />} />

                      <Route path="admin-fraud-cases" element={<AdminFraudCases />} />
                      <Route path="admin-lock-requests" element={<AdminLockRequests />} />
                      <Route path="admin-fraud-cases/:fraudCaseId" element={<FraudCaseDetail />} />
                      <Route path="admin-fraud-analysis" element={<AdminFraudAnalysis />} />
                      <Route path="admin-reports" element={<AdminReports />} />
                      <Route path="admin-chats" element={<AdminChatList />} />
                      <Route path="admin-chats/:sessionId" element={<AdminChatRoom />} />

                      <Route path="profile" element={<ProfileRouter />} />
                    </Route>
                  </Routes>

                  <Toast />
                  <AppChatWidget />
                </ChatWidgetProvider>
              </ConfirmProvider>
            </ToastProvider>
          </ComparisonProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function ProfileRouter() {
  const { user } = useAuth();
  return user?.role === "ADMIN" ? <AdminProfile /> : <UserProfile />;
}

export default App;