import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./Login";
import { Dashboard } from "./Dashboard";
import { Analysis } from "./Analysis";
import "./index.css"

export function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/Analysis" element={<Analysis />} />
            </Routes>
        </BrowserRouter>
    );
}

