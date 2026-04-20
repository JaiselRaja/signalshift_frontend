"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, updateMe, clearToken } from "@/lib/api";
import type { UserRead } from "@/types";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import AvatarUpload from "@/components/ui/AvatarUpload";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  turf_admin: "Turf Admin",
  team_manager: "Team Manager",
  player: "Player",
};

function initials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "??";
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "??";
}

function ProfileContent() {
  const router = useRouter();
  const [user, setUser] = useState<UserRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    getMe()
      .then((u) => {
        setUser(u);
        setFullName(u.full_name ?? "");
        setPhone(u.phone ?? "");
        if (!u.phone || !u.phone.trim()) {
          setShowPhonePrompt(true);
        }
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  function startEditingPhone() {
    setShowPhonePrompt(false);
    setEditing(true);
    setTimeout(() => {
      document.getElementById("profile-phone-input")?.focus();
    }, 50);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const trimmedPhone = phone.trim();
    if (!/^\+?[0-9]{10,15}$/.test(trimmedPhone)) {
      setError("Please enter a valid phone number (10–15 digits).");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await updateMe({ full_name: fullName.trim(), phone: trimmedPhone });
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
  if (!user) return <div className="p-8 text-rose-400">{error ?? "Profile not found."}</div>;

  const role = ROLE_LABELS[user.role] ?? user.role;
  const memberSince = new Date(user.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6 md:py-12">
      {/* Page header */}
      <div className="mb-6">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-[#b2f746]">
          · Your profile ·
        </p>
        <h1 className="mt-2 font-display text-3xl font-black leading-[0.95] tracking-tight text-white md:text-4xl">
          Account
        </h1>
      </div>

      {/* Identity card */}
      <div className="relative mb-5 overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.03] p-5 animate-fade-in md:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rotate-[30deg] rounded-full bg-[#b2f746]/10 blur-3xl"
        />
        <div className="relative flex items-center gap-4">
          <AvatarUpload
            src={user.avatar_url}
            fallback={initials(user.full_name, user.email)}
            label="Change profile photo"
            size="md"
            onChange={async (dataUrl) => {
              const updated = await updateMe({ avatar_url: dataUrl });
              setUser(updated);
            }}
            onRemove={user.avatar_url ? async () => {
              const updated = await updateMe({ avatar_url: null });
              setUser(updated);
            } : undefined}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-xl font-bold text-white md:text-2xl">
              {user.full_name || user.email.split("@")[0]}
            </p>
            <p className="mt-0.5 truncate text-sm text-white/60">{user.email}</p>
            <span className="mt-2 inline-block rounded-full border border-[#b2f746]/30 bg-[#b2f746]/[0.08] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#b2f746]">
              {role}
            </span>
          </div>
        </div>
      </div>

      {/* Details / edit */}
      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-5 animate-fade-in md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
            Account details
          </p>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-[11px] font-bold uppercase tracking-wider text-[#b2f746] underline-offset-4 hover:underline"
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-[#b2f746]/50 focus:ring-2 focus:ring-[#b2f746]/15"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                Phone
                <span className="text-rose-400" aria-label="required">*</span>
              </label>
              <input
                id="profile-phone-input"
                type="tel"
                inputMode="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-[#b2f746]/50 focus:ring-2 focus:ring-[#b2f746]/15"
              />
              <p className="mt-1.5 text-[11px] text-white/50">
                Required — we need this to contact you about bookings.
              </p>
            </div>
            {error && <p className="text-xs text-rose-300">{error}</p>}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFullName(user.full_name ?? "");
                  setPhone(user.phone ?? "");
                  setError(null);
                }}
                disabled={saving}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-full bg-[#b2f746] py-2.5 text-sm font-bold text-[#121f00] shadow-lg shadow-[#b2f746]/20 transition-all hover:bg-white disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#121f00]/20 border-t-[#121f00]" />
                    Saving…
                  </span>
                ) : "Save changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col">
            <DetailRow label="Email" value={user.email} mono />
            <DetailRow label="Full name" value={user.full_name || "—"} />
            <DetailRow label="Phone" value={user.phone || "Not set"} accent={!user.phone} />
            <DetailRow label="Member since" value={memberSince} />
            {success && (
              <p className="mt-3 rounded-xl border border-[#b2f746]/30 bg-[#b2f746]/10 px-3 py-2 text-xs text-[#b2f746] animate-fade-in">
                Profile updated successfully.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Sign out */}
      <div className="mt-6">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-4 text-sm font-semibold text-white/70 transition-colors hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300"
        >
          <span className="flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-white/30 group-hover:text-rose-300/60">End session</span>
        </button>
      </div>

      {/* Missing-phone prompt modal */}
      {showPhonePrompt && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
        >
          <div className="w-full max-w-sm animate-fade-in rounded-3xl border border-white/[0.08] bg-[#111213] p-6 shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 ring-1 ring-amber-400/30">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <h3 className="mb-1 text-center font-display text-lg font-bold text-white">Add your phone number</h3>
            <p className="mb-5 text-center text-sm text-white/60">
              We need your phone number to contact you about bookings and to notify you when your payment is verified.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={startEditingPhone}
                className="w-full rounded-full bg-[#b2f746] py-3 text-sm font-bold text-[#121f00] shadow-lg shadow-[#b2f746]/20 transition-all hover:bg-white"
              >
                Add phone number
              </button>
              <button
                onClick={() => setShowPhonePrompt(false)}
                className="w-full rounded-full border border-white/10 bg-white/[0.03] py-3 text-sm font-medium text-white/60 hover:bg-white/[0.06] hover:text-white"
              >
                Remind me later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
  accent = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.04] py-3 last:border-b-0">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">{label}</span>
      <span
        className={`truncate text-sm ${accent ? "text-amber-300" : "text-white"} ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
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
