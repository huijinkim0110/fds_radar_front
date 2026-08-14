import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import BoardRouter from "./routers/BoardRouter";
import { AuthProvider } from "./context/AuthContext";

const root = createBrowserRouter([
  {
    path: "/", // 최상위 경로
    element: <Layout />, // 공통 레이아웃 적용
    children: [   // Layout 내부에서 렌더링(Outlet)되는 자식 페이지 라우트
      { path : "/", element: <Home />}, // '/' -> Home 컴포넌트
      { path : "about", element: <About />}, // '/about' -> About 컴포넌트 
      { path : "login", element: <Login />},
      ...BoardRouter,                 // 게시판 CRUD 라우터 적용
    ]
  }
]);

export default function App() {
  // RouterProvider를 사용하여 SPA 라우팅 적용
  return (
    // 애플리케이션 전체를 인증 기능으로 감싸는 역할
    // 라우터 내에 모든 페이지에서 로그인 정보를 사용 가능
    <AuthProvider>
      <RouterProvider router={root} />;
    </AuthProvider>  
  );
  
}