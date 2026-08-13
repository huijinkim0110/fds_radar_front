import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductList from './components/financialProduct/ProductList';
import ProductDetail from './components/financialProduct/ProductDetail';
import InvestmentDiagnosis from './components/finance/InvestmentDiagnosis';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:productId" element={<ProductDetail />} />
        <Route path="/diagnosis" element={<InvestmentDiagnosis />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;