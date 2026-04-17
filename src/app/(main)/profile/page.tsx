"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, updateMe, clearToken } from "@/lib/api";
import type { UserRead } from "@/types";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { PageLoader } from "@/components/ui/LoadingSpinner";

function ProfileContent() {
  const router = useRouter();
  const [user, setUser] = useState<UserRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    getMe()
      .then((u) => {
        setUser(u);
        setFullName(u.full_name ?? "");
        setPhone(u.phone ?? "");
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await updateMe({ full_name: fullName.trim(), phone: phone.trim() || undefined });
      setUser(updated);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  if (loading) return <PageLoader />;
  if (!user) return <div className="p-8 text-red-700">{error ?? "Profile not found."}</div>;

  const ROLE_LABELS: Record<string, string> = {
    super_admin: "Super Admin",
    turf_admin: "Turf Admin",
    team_manager: "Team Manager",
    player: "Player",
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8 md:px-6">
      <h1 className="mb-6 text-xl font-bold text-[#191c1d]">Profile</h1>

      {/* Avatar + summary */}
      <div className="glass-card mb-5 p-5 flex items-center gap-4 animate-fade-in">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#004900]/10 text-[#004900] text-xl font-bold">
          {user.full_name?.slice(0, 2).toUpperCase() ?? "??"}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-[#191c1d] truncate">{user.full_name}</p>
          <p className="text-sm text-[#707a6a] truncate">{user.email}</p>
          <span className="mt-1 inline-block rounded-full bg-[#004900]/10 border border-[#004900]/15 px-2 py-0.5 text-[10px] font-medium text-[#004900]">
            {ROLE_LABELS[user.role] ?? user.role}
          </span>
        </div>
      </div>

      {/* Edit form */}
      <div className="glass-card p-5 animate-fade-in">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#707a6a]">Account Details</p>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-[#004900] hover:text-[#006400]"
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#707a6a]">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-[#bfcab7]/30 bg-white px-3 py-2.5 text-sm text-[#191c1d] placeholder-[#707a6a] outline-none focus:border-[#004900]/40"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#707a6a]">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-lg border border-[#bfcab7]/30 bg-white px-3 py-2.5 text-sm text-[#191c1d] placeholder-[#707a6a] outline-none focus:border-[#004900]/40"
              />
            </div>
            {error && <p className="text-xs text-red-700">{error}</p>}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => { setEditing(false); setFullName(user.full_name ?? ""); setPhone(user.phone ?? ""); }}
                disabled={saving}
                className="flex-1 rounded-xl border border-[#bfcab7]/20 py-2.5 text-sm font-medium text-[#404a3b] hover:bg-[#f3f4f5] disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#b2f746] text-[#121f00] rounded-full font-bold shadow-lg shadow-[#004900]/10 hover:scale-[1.02] active:scale-95 transition-all py-2.5 text-sm disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-[#121f00]/20 border-t-[#121f00] animate-spin" />
                    Saving...
                  </span>
                ) : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-[#404a3b]">Email</span>
              <span className="text-[#191c1d] truncate max-w-[200px]">{user.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#404a3b]">Full Name</span>
              <span className="text-[#191c1d]">{user.full_name || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#404a3b]">Phone</span>
              <span className="text-[#191c1d]">{user.phone || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#404a3b]">Member since</span>
              <span className="text-[#191c1d]">
                {new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            {success && (
              <p className="text-xs text-emerald-700 animate-fade-in">Profile updated successfully.</p>
            )}
          </div>
        )}
      </div>

      {/* Sign out */}
      <div className="mt-5">
        <button
          onClick={handleLogout}
          className="w-full rounded-xl border border-red-500/20 bg-red-50 py-3 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
