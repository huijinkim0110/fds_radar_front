import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Report from "./pages/Report";
import UserProfile from "./components/mypage/UserProfile";
import LoginDeviceHistory from "./components/mypage/LoginDeviceHistory";
import Notifications from "./components/mypage/Notifications";
import TransactionReport from "./components/mypage/TransactionReport"; 
import ReportHistory from "./components/mypage/ReportHistory";

import HomeProductDetail from "./pages/HomeProductDetail";
import Account from "./components/mypage/Accounts"; 
import Cards from "./components/mypage/Cards"; 
import FraudReportsPage from "./components/mypage/FraudReportsPage";
import FraudConfirmations from "./components/mypage/FraudConfirmations";
import DisputesPage from "./components/mypage/DisputesPage";
import LockRequestsPage from "./components/mypage/LockRequestsPage";


import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import CustomerCenter from "./components/CustomerCenter"; 
import Transactions from "./components/mypage/Transactions";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import FraudCaseList from "./components/fraud/FraudCaseList";
import FraudCaseDetail from "./components/fraud/FraudCaseDetail";
import FraudAnalysis from "./components/fraud/FraudAnalysis";

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

import AdminChatRoom from "./components/admin/AdminChatRoom";
import AdminChatList from "./components/admin/AdminChatList";
import AdminMyPage from "./components/admin/AdminMyPage";

import { ComparisonProvider } from "./context/ComparisonContext";
import ProductComparison from "./components/financialProduct/ProductComparison";

import { ToastProvider } from "./context/ToastContext";
import Toast from "./components/common/Toast";

import { ConfirmProvider } from "./context/ConfirmContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ComparisonProvider>
            <ToastProvider>
              <ConfirmProvider>

                <Routes>
                  <Route path="/" element={<Home />} />


                  
                  <Route path="/support" element={<CustomerCenter />} />
=
                            <Route path="/mypage" element={<MyPageLayout />}>
                                <Route path="dashboard" element={<Dashboard />} />
                                <Route path="profile" element={<UserProfile />} />
                                <Route path="devices" element={<LoginDeviceHistory />} />
                                <Route path="notifications" element={<Notifications />} />
                                <Route path="fraud-confirmations"element={<FraudConfirmations />}/>
                                <Route path="favorites" element={<FavoriteProductList />} />
                                <Route path="comparisons" element={<ProductComparison />} />
                                <Route path="comparisons/:comparisonId" element={<ProductComparison />} />
                                <Route path="diagnosis" element={<InvestmentDiagnosis />} />
                                <Route path="diagnosis/results" element={<DiagnosisResults />} />
                                <Route path="recommendations" element={<RecommendedProducts />} />
                                <Route path="financial-goals" element={<FinancialGoalList />} />
                                <Route path="financial-profile" element={<FinancialProfile />} />
                            </Route>


                  <Route
                    path="/home-products/:id"
                    element={<HomeProductDetail />}
                  />

                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />

                

                  <Route
                    path="/admin/fraud-cases"
                    element={<FraudCaseList />}
                  />

                  <Route
                    path="/admin/fraud-cases/:fraudCaseId"
                    element={<FraudCaseDetail />}
                  />

                  <Route
                    path="/admin/fraud-analysis"
                    element={<FraudAnalysis />}
                  />

                  <Route
                    path="/admin/mypage"
                    element={<AdminMyPage />}
                  />

                  <Route
                    path="/products"
                    element={<ProductList />}
                  />

                  <Route
                    path="/products/:productId"
                    element={<ProductDetail />}
                  />

                  <Route
                    path="/portfolio"
                    element={<SimulatedSubscriptionList />}
                  />

                  {/* =========================
                      마이페이지
                  ========================= */}

                  <Route
                    path="/mypage"
                    element={<MyPageLayout />}
                  >
                    <Route
                      path="dashboard"
                      element={<Dashboard />}
                    />

                    <Route path="accounts" element={<Account />} />
                    
                    <Route path="cards" element={<Cards />} />

                    <Route path="transactions" element={<Transactions />} />

                    <Route path="fraud-reports" element={<FraudReportsPage />} />


                    <Route
                      path="profile"
                      element={<UserProfile />}
                    />

                    <Route
                      path="devices"
                      element={<LoginDeviceHistory />}
                    />

                    <Route
                      path="notifications"
                      element={<Notifications />}
                    />

                    <Route
                      path="favorites"
                      element={<FavoriteProductList />}
                    />

                    <Route
                      path="comparisons"
                      element={<ProductComparison />}
                    />

                    <Route
                      path="comparisons/:comparisonId"
                      element={<ProductComparison />}
                    />

                    <Route
                      path="diagnosis"
                      element={<InvestmentDiagnosis />}
                    />

                    <Route
                      path="diagnosis/results"
                      element={<DiagnosisResults />}
                    />

                    <Route
                      path="recommendations"
                      element={<RecommendedProducts />}
                    />

                    <Route path="disputes" element={<DisputesPage />} />

                    <Route path="lock-requests" element={<LockRequestsPage />} />

                    <Route
                      path="financial-goals"
                      element={<FinancialGoalList />}
                    />

                    <Route
                      path="financial-profile"
                      element={<FinancialProfile />}
                    />
                  </Route>

                 

                  {/* =========================
                      관리자
                  ========================= */}

                  <Route
                    path="/admin/chats"
                    element={<AdminChatList />}
                  />

                  <Route
                    path="/admin/chats/:sessionId"
                    element={<AdminChatRoom />}
                  />
                </Routes>

                <Toast />
                <ChatWidget />

              </ConfirmProvider>
            </ToastProvider>
          </ComparisonProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;