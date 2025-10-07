import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SignUp() {
    const navigate = useNavigate();
    const [showPw, setShowPw] = useState(false);
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: ""
    });
    const [errors, setErrors] = useState({});

    const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

    const validate = () => {
        const err = {};
        if (!form.fullName.trim()) err.fullName = "Vui lòng nhập Họ và tên đệm.";
        if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Email không hợp lệ.";
        if (!/^(0|\+?\d{1,3})?\d{9,11}$/.test(form.phone)) err.phone = "Số điện thoại không hợp lệ.";
        if (form.password.length < 6) err.password = "Mật khẩu tối thiểu 6 ký tự.";
        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        // TODO: call your API here
        console.log("Sign up payload:", form);
        navigate("/signin");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#CAD7D0] p-4">
            <div className="w-full max-w-md">
                <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8">
                    <h1 className="text-2xl font-semibold text-gray-900">Đăng ký</h1>
                    <p className="mt-1 text-sm text-gray-500">Tạo tài khoản mới để tiếp tục</p>

                    <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
                        {/* Họ và tên đệm */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                Họ tên
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                value={form.fullName}
                                onChange={onChange}
                                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
                                    errors.fullName ? "border-red-400" : "border-gray-300"
                                }`}
                                placeholder="Nhập họ tên"
                                autoComplete="name"
                            />
                            {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
                        </div>

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
                                placeholder="Nhập email"
                                autoComplete="email"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                        </div>

                        {/* Điện thoại */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Điện thoại
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                inputMode="tel"
                                value={form.phone}
                                onChange={onChange}
                                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
                                    errors.phone ? "border-red-400" : "border-gray-300"
                                }`}
                                placeholder="Nhập số điện thoại"
                                autoComplete="tel"
                            />
                            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
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
                                    placeholder="Nhập password"
                                    autoComplete="new-password"
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
                            Tạo tài khoản
                        </button>

                        <p className="text-center text-sm text-gray-600">
                            Đã có tài khoản?{" "}
                            <Link to="/signin" className="font-medium text-indigo-600 hover:text-indigo-700">
                                Đăng nhập
                            </Link>
                        </p>
                    </form>
                </div>
                <p className="mt-4 text-center text-xs text-gray-500">
                    Bằng việc đăng ký, bạn đồng ý với Điều khoản &amp; Chính sách bảo mật.
                </p>
            </div>
        </div>
    );
}
