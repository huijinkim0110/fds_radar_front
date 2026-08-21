import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductList from './components/financialProduct/ProductList';
import ProductDetail from './components/financialProduct/ProductDetail';
import InvestmentDiagnosis from './components/finance/InvestmentDiagnosis';
import SimulatedSubscriptionList from './components/financialProduct/SimulatedSubscriptionList';
import MyPageLayout from './components/mypage/MyPageLayout';
import Dashboard from './components/mypage/Dashboard';
import RecommendedProducts from './components/mypage/RecommendedProducts';
import FavoriteProductList from './components/financialProduct/FavoriteProductList';
import FinancialGoalList from './components/finance/FinancialGoalList';
import DiagnosisResults from './components/finance/DiagnosisResults';
import FinancialProfile from './components/finance/FinancialProfile';
import ChatWidget from './components/chat/ChatWidget';
import AdminChatRoom from './components/admin/AdminChatRoom';
import AdminChatList from './components/admin/AdminChatList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:productId" element={<ProductDetail />} />
        <Route path="/portfolio" element={<SimulatedSubscriptionList />} />

        <Route path="/mypage" element={<MyPageLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="favorites" element={<FavoriteProductList />} />
          <Route path="diagnosis" element={<InvestmentDiagnosis />} />
          <Route path="diagnosis/results" element={<DiagnosisResults />} />
          <Route path="recommendations" element={<RecommendedProducts />} />
          <Route path="financial-goals" element={<FinancialGoalList />} />
          <Route path="financial-profile" element={<FinancialProfile />} />
        </Route>

        <Route path="/adin/chats" element={<AdminChatList />} />
        <Route path="/admin/chats/:sessionId" element={<AdminChatRoom />} />
      </Routes>

      <ChatWidget />
    </BrowserRouter>
  );
}

export default App;