import { BrowserRouter, Routes, Route } from "react-router-dom";
import FraudCaseList from "./components/fraud/FraudCaseList";
import FraudCaseDetail from "./components/fraud/FraudCaseDetail";
import FraudAnalysis from "./components/fraud/FraudAnalysis";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/admin/fraud-cases" element={<FraudCaseList />} />
                <Route path="/admin/fraud-cases/:fraudCaseId" element={<FraudCaseDetail />} />
                <Route path="/admin/fraud-analysis" element={<FraudAnalysis />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;