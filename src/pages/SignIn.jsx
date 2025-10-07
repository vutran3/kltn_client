import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../redux/thunks/authThunk";
import backgroundImage from "../assets/images/background.jpg";

export default function SignIn() {
    const dispath = useDispatch();
    const [showPw, setShowPw] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

    const validate = () => {
        const err = {};
        if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Email không hợp lệ.";
        if (!form.password) err.password = "Vui lòng nhập mật khẩu.";
        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        // TODO: call your API here
        dispath(login());
        console.log("Sign in payload:", form);
        navigate("/");
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-[#CAD7D0] p-4"
            style={{
                background: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "100vh"
            }}
        >
            <div className="w-full max-w-md">
                <div
                    className="bg-white rounded-2xl p-6 sm:p-8"
                    style={{
                        boxShadow: "0 0 3px #333"
                    }}
                >
                    <h1 className="text-2xl font-semibold text-gray-900">Đăng nhập</h1>
                    <p className="mt-1 text-sm text-gray-500">Chào mừng quay trở lại</p>

                    <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={onChange}
                                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
                                    errors.email ? "border-red-400" : "border-gray-300"
                                }`}
                                placeholder="ban@example.com"
                                autoComplete="email"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                        </div>

                        {/* Mật khẩu */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPw ? "text" : "password"}
                                    value={form.password}
                                    onChange={onChange}
                                    className={`mt-1 w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
                                        errors.password ? "border-red-400" : "border-gray-300"
                                    }`}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw((s) => !s)}
                                    className="absolute inset-y-0 right-0 mr-2 grid place-items-center px-2 text-xs text-gray-500 hover:text-gray-700"
                                    aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                >
                                    {showPw ? "Ẩn" : "Hiện"}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                        </div>

                        <button
                            type="submit"
                            className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Đăng nhập
                        </button>

                        <div className="flex items-center justify-between text-sm">
                            <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-700">
                                Quên mật khẩu?
                            </Link>
                            <span className="text-gray-500">
                                Chưa có tài khoản?{" "}
                                <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-700">
                                    Đăng ký
                                </Link>
                            </span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
