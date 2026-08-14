import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductList from './components/financialProduct/ProductList';
import ProductDetail from './components/financialProduct/ProductDetail';
import InvestmentDiagnosis from './components/finance/InvestmentDiagnosis';
import SimulatedSubscriptionList from './components/financialProduct/SimulatedSubscriptionList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:productId" element={<ProductDetail />} />
        <Route path="/diagnosis" element={<InvestmentDiagnosis />} />
        <Route path="/portfolio" element={<SimulatedSubscriptionList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;