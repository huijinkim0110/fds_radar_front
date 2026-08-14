import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout } from "../api/accountAPI";

export default function Layout() {
    const navigate = useNavigate();

    const {
        loginUser,
        setLoginUser,
        loading
    } = useAuth();

    // 로그아웃
    const handleLogout = async () => {
        try {
            await logout();
            setLoginUser(null);
            alert("로그아웃 되었습니다.");
            navigate("/login");
        } catch (error) {
            console.error(error);
            alert("로그아웃 실패");
        }
    };

    // 로그인 여부 확인 중
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <header>
                <nav>
                    <Link to="/">home</Link>{" | "}
                    <Link to="/about">About</Link>{" | "}
                    <Link to="/boards">Boards</Link>{" | "}
                    {loginUser ? (
                        <>
                            <span>
                                {loginUser.name} ({loginUser.role})
                            </span>
                            {" | "}
                            <button onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (<Link to="/login">Login</Link>)}
                    
                </nav>
            </header>
            <main>
                <Outlet /> {/* 자식 라우트로 설정된 컴포넌트가 렌더링됨 */}
            </main>
            <footer>
                2026 MokCoding
            </footer>
        </div>
    );
}