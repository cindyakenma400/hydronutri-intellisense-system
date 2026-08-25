"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sprout } from "lucide-react";

import { resetPassword } from "@/services/authService";
import { ApiError } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword, confirmPassword);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-green-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-700 rounded-2xl mb-4">
            <Sprout size={32} className="text-white" />
          </div>

          <h1 className="text-2xl font-bold text-white">
            HydroNutri-IntelliSense
          </h1>

          <p className="text-green-200 mt-1">Reset your password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!token ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              This reset link is missing its token. Request a new one from
              the sign-in page.
            </p>
          ) : success ? (
            <div className="space-y-4">
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                Your password has been reset. You can now sign in with your
                new password.
              </p>
              <button
                onClick={() => router.replace("/login")}
                className="w-full bg-green-700 text-white py-3 rounded-lg font-medium hover:bg-green-800 transition"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="••••••••"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {error}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full bg-green-700 text-white py-3 rounded-lg font-medium hover:bg-green-800 transition disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-green-300 text-sm mt-6">
          IoT-Enabled Water-Nutrient Management © 2026
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
