
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export const Login = () => {

    const [Email, Setemail] = useState("");
    const [Password, SetPassword] = useState("");
    const [Loading, SetLoading] = useState(false);
    const [Error, SetError] = useState("");

    const Navigate = useNavigate();

    function Login_SRM(event) {
        event.preventDefault();

        SetLoading(true);
        SetError("");

        fetch("https://srm-server-cyan.vercel.app/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: Email,
                password: Password
            })
        })
            .then(res => res.json())
            .then(data => {

                if (data.success) {

                    sessionStorage.setItem("SRM_Token", data.token);

                    Navigate("/dashboard");

                } else {
                    SetError(data.message || "Invalid email or password");
                }

            })
            .catch(err => {
                SetError("Unable to connect to server");
                console.log(err);
            })
            .finally(() => SetLoading(false));
    }

    return (

        <div className="login-page">

            <div className="login-glow glow-one"></div>
            <div className="login-glow glow-two"></div>

            <div className="login-card">

                <div className="login-brand">

                    <div className="brand-logo">
                        S
                    </div>

                    <h2>SRM <span>PORTAL</span></h2>

                    <p>Student Record Management</p>

                </div>


                <div className="login-heading">

                    <h1>Welcome Back</h1>

                    <p>Sign in to access your dashboard</p>

                </div>


                <form onSubmit={Login_SRM}>

                    <div className="login-input-group">

                        <label>Email Address</label>

                        <div className="login-input-box">
                            <span>✉</span>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={Email}
                                onChange={(e) => Setemail(e.target.value)}
                                required
                            />
                        </div>

                    </div>


                    <div className="login-input-group">

                        <label>Password</label>

                        <div className="login-input-box">
                            <span>🔒</span>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={Password}
                                onChange={(e) => SetPassword(e.target.value)}
                                required
                            />
                        </div>

                    </div>


                    {Error && (
                        <p className="login-error">{Error}</p>
                    )}


                    <button
                        type="submit"
                        className="login-button"
                        disabled={Loading}
                    >
                        {Loading ? "Signing In..." : "Sign In"}
                        {!Loading && <span> → </span>}
                    </button>

                </form>


                <div className="login-footer">

                    <span></span>
                    <p>SECURE ADMIN ACCESS</p>
                    <span></span>

                </div>

            </div>


            <div className="login-copyright">
                © 2026 SRM Portal. All rights reserved.
            </div>

        </div>

    );
};
