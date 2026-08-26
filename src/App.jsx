
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Report from "./pages/Report";
import UserProfile from "./components/mypage/UserProfile";

import { AuthProvider } from "./context/AuthContext";
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
            <ComparisonProvider>
                <ToastProvider>
                    <ConfirmProvider>
                        <Routes>
                            <Route path="/" element={<Home />} />   
                            <Route path="/login" element={<Login />} />   
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/mypage/report" element={<Report />} />
                            <Route path="/admin/fraud-cases" element={<FraudCaseList />} />
                            <Route path="/admin/fraud-cases/:fraudCaseId" element={<FraudCaseDetail />} />
                            <Route path="/admin/fraud-analysis" element={<FraudAnalysis />} />
                            <Route path="/admin/mypage" element={<AdminMyPage />} />

                            <Route path="/products" element={<ProductList />} />
                            <Route path="/products/:productId" element={<ProductDetail />} />
                            <Route path="/portfolio" element={<SimulatedSubscriptionList />} />

                            <Route path="/mypage" element={<MyPageLayout />}>
                                <Route path="dashboard" element={<Dashboard />} />
                                <Route path="profile" element={<UserProfile />} />
                                <Route path="favorites" element={<FavoriteProductList />} />
                                <Route path="comparisons" element={<ProductComparison />} />
                                <Route path="comparisons/:comparisonId" element={<ProductComparison />} />
                                <Route path="diagnosis" element={<InvestmentDiagnosis />} />
                                <Route path="diagnosis/results" element={<DiagnosisResults />} />
                                <Route path="recommendations" element={<RecommendedProducts />} />
                                <Route path="financial-goals" element={<FinancialGoalList />} />
                                <Route path="financial-profile" element={<FinancialProfile />} />
                            </Route>

                            <Route path="/admin/chats" element={<AdminChatList />} />
                            <Route path="/admin/chats/:sessionId" element={<AdminChatRoom />} />
                        </Routes>

                        <Toast />
                        <ChatWidget />
                    </ConfirmProvider>
                </ToastProvider>
            </ComparisonProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
