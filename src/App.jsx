import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductList from './components/financialProduct/ProductList';
import ProductDetail from './components/financialProduct/ProductDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:productId" element={<ProductDetail />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;