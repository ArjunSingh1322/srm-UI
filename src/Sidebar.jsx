import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";


export function Sidebar({ className = "", isOpen, onClose }) {

    const navigate = useNavigate();
    const location = useLocation();

    const logout = () => {
        sessionStorage.removeItem("SRM_Token");
        navigate("/");
    };

    const go = (path) => {
        navigate(path);
        if (onClose) onClose();
    };

    return (
        <>
            {isOpen && (
                <div className="sidebar-overlay" onClick={onClose}></div>
            )}

            <aside className={`sidebar ${className} ${isOpen ? "sidebar-open" : ""}`}>

                <button className="sidebar-close" onClick={onClose}>
                    ✕
                </button>

                {/* BRAND */}
                <div className="brand">
                    <div className="brand-icon">S</div>
                    <h2>SRM <span>Portal</span></h2>
                </div>

                {/* MENU */}
                <p className="menu-title">MAIN MENU</p>

                <button
                    className={location.pathname.toLowerCase() === "/dashboard" ? "side-link active" : "side-link"}
                    onClick={() => go("/dashboard")}
                >
                    <span>▦</span>
                    Dashboard
                </button>

                <button
                    className={location.pathname.toLowerCase() === "/analysis" ? "side-link active" : "side-link"}
                    onClick={() => go("/Analysis")}
                >
                    <span>▥</span>
                    Analysis
                </button>

                {/* ADMIN */}
                <div className="sidebar-bottom">

                    <div className="admin-profile">
                        <div className="admin-avatar">A</div>

                        <div>
                            <h4>Administrator</h4>
                            <p>Admin Account</p>
                        </div>
                    </div>

                    <button className="logout-btn" onClick={logout}>
                        ↪ Logout
                    </button>

                </div>

            </aside>
        </>
    );
}