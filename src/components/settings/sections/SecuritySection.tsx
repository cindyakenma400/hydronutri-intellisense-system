"use client";

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";

import { Card, Field } from "../ui";
import { ApiError } from "@/lib/api";
import {
  AuthUser,
  changePassword,
  getUser,
  updateProfile,
  updateStoredUser,
} from "@/services/authService";

export default function SecuritySection({
  showToast,
}: {
  showToast: (message: string) => void;
}) {
  const [user, setUser] = useState<AuthUser | null>(() => getUser());
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  function startEditing() {
    setFullName(user?.full_name ?? "");
    setPhone(user?.phone ?? "");
    setEditing(true);
  }

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const updated = await updateProfile(fullName, phone);
      updateStoredUser(updated);
      setUser(updated);
      setEditing(false);
      showToast("Profile updated.");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function submitPasswordChange() {
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword, confirmPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password updated.");
    } catch (err) {
      setPasswordError(
        err instanceof ApiError ? err.message : "Could not update password."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card
        title="Profile"
        subtitle="Your account details"
        action={
          editing ? (
            <div className="flex gap-2">
              <button
                onClick={saveProfile}
                disabled={savingProfile}
                className="flex items-center gap-1.5 text-sm font-medium text-white bg-green-700 hover:bg-green-800 disabled:opacity-50 px-3 py-1.5 rounded-lg transition"
              >
                <Check size={15} /> {savingProfile ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
              >
                <X size={15} /> Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={startEditing}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-700 border px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
            >
              <Pencil size={15} /> Edit Profile
            </button>
          )
        }
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 shrink-0 rounded-full bg-green-700 text-white flex items-center justify-center text-2xl font-semibold">
            {(user?.full_name || "F").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 truncate">
              {user?.full_name || "Farmer"}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {user?.email ?? "No email set"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name" value={fullName}
            disabled={!editing}
            placeholder="Full name"
            onChange={setFullName} />
          <Field label="Email" value={user?.email ?? ""}
            disabled
            onChange={() => undefined} />
          <Field label="Phone" value={phone}
            disabled={!editing}
            placeholder="+233 ..."
            onChange={setPhone} />
        </div>
      </Card>

      <Card
        title="Change Password"
        subtitle="Update the password used to sign in"
      >
        {passwordError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            {passwordError}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <Field label="Current Password" type="password" value={currentPassword}
            placeholder="••••••••"
            onChange={setCurrentPassword} />
          <div className="hidden sm:block" />
          <Field label="New Password" type="password" value={newPassword}
            placeholder="At least 6 characters"
            onChange={setNewPassword} />
          <Field label="Confirm New Password" type="password" value={confirmPassword}
            placeholder="••••••••"
            onChange={setConfirmPassword} />
        </div>

        <button
          onClick={submitPasswordChange}
          disabled={
            changingPassword || !currentPassword || !newPassword || !confirmPassword
          }
          className="bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-green-800 disabled:opacity-50 transition"
        >
          {changingPassword ? "Updating..." : "Update Password"}
        </button>
      </Card>
    </div>
  );
}
