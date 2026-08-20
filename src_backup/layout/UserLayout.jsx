import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./UserLayout.css";

export default function UserLayout() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Outlet />   {/* 여기에 Dashboard, History 등 자식 페이지가 렌더됨 */}
      </main>
    </div>
  );
}