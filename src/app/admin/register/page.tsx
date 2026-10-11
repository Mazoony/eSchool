"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../AuthContext";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function AdminRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"female" | "male" | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!gender) {
      setError("Select female or male.");
      setLoading(false);
      return;
    }

    try {
      await signUp({ email, password, phoneNumber, birthDate, gender });
      // You might want to automatically sign in the user or redirect them
      // For an admin panel, maybe redirect to a login page or a "check your email" page
      router.push("/auth/login");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Register New Admin
        </h1>
        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label
              htmlFor="phoneNumber"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Phone number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              maxLength={25}
              required
              autoComplete="tel"
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-200 rounded-md focus:outline-none focus:ring focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="gender"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => {
                const value = e.target.value;
                setGender(value === "female" || value === "male" ? value : "");
              }}
              required
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-200 rounded-md focus:outline-none focus:ring focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="" disabled>Select gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="birthDate"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Birthdate
            </label>
            <input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              required
              autoComplete="bday"
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-200 rounded-md focus:outline-none focus:ring focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-200 rounded-md focus:outline-none focus:ring focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
                aria-describedby="admin-password-help"
                className="w-full px-3 py-2 pr-12 text-gray-900 bg-gray-200 rounded-md focus:outline-none focus:ring focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword
                  ? <EyeSlashIcon aria-hidden="true" className="h-5 w-5" />
                  : <EyeIcon aria-hidden="true" className="h-5 w-5" />}
              </button>
            </div>
            <p id="admin-password-help" className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Use at least 8 characters. Choose a longer, unique password and avoid personal information or passwords you use elsewhere.
            </p>
          </div>
          {error && (
            <p className="text-sm text-center text-red-500">{error}</p>
          )}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
