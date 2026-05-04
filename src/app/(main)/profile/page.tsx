"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearToken,
  getMe,
  getMyBookings,
  getMyTeams,
  listMySubscriptions,
  updateMe,
} from "@/lib/api";
import type {
  BookingRead,
  SubscriptionRead,
  TeamRead,
  UserRead,
} from "@/types";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import AvatarUpload from "@/components/ui/AvatarUpload";
import PageHero from "@/components/v1/PageHero";
import PageStats from "@/components/v1/PageStats";
import PageFAQ from "@/components/v1/PageFAQ";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  turf_admin: "Turf Admin",
  team_manager: "Team Manager",
  player: "Player",
};

const FAQS = [
  {
    q: "How do I update my phone number?",
    a: "Tap Edit on the Account details card. Phone is required so we can reach you about bookings.",
  },
  {
    q: "Why do you need my phone number?",
    a: "For booking confirmations, payment alerts, and turf-side coordination. We never share it.",
  },
  {
    q: "How do I delete my account?",
    a: "Reach out to support@signalshift.in — we process deletions within 7 days, and refund any unused plan credit.",
  },
];

function initials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    return (
      name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("") || "??"
    );
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "??";
}

function ProfileContent() {
  const router = useRouter();
  const [user, setUser] = useState<UserRead | null>(null);
  const [bookings, setBookings] = useState<BookingRead[]>([]);
  const [teams, setTeams] = useState<TeamRead[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    Promise.all([
      getMe(),
      getMyBookings().catch(() => [] as BookingRead[]),
      getMyTeams().catch(() => [] as TeamRead[]),
      listMySubscriptions().catch(() => [] as SubscriptionRead[]),
    ])
      .then(([u, bs, ts, subs]) => {
        setUser(u);
        setFullName(u.full_name ?? "");
        setPhone(u.phone ?? "");
        setBookings(bs);
        setTeams(ts);
        setSubscriptions(subs);
        if (!u.phone || !u.phone.trim()) setShowPhonePrompt(true);
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  function startEditingPhone() {
    setShowPhonePrompt(false);
    setEditing(true);
    setTimeout(
      () => document.getElementById("profile-phone-input")?.focus(),
      50,
    );
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
      const updated = await updateMe({
        full_name: fullName.trim(),
        phone: trimmedPhone,
      });
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
  if (!user)
    return <div className="p-8 text-rose-400">{error ?? "Profile not found."}</div>;

  const role = ROLE_LABELS[user.role] ?? user.role;
  const memberSince = new Date(user.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const memberSinceShort = new Date(user.created_at).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });
  const gamesPlayed = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "completed",
  ).length;

  return (
    <div>
      <PageHero
        eyebrow="Your Account"
        head1="One profile,"
        italicWord="every"
        head2="match."
        subtitle="Manage your details, payment methods, and preferences. Everything Signal Shift knows about you, in one place."
      />

      <div className="px-6 pb-8">
        <div className="mx-auto max-w-6xl">
          <PageStats
            stats={[
              { value: role, label: "Account type" },
              { value: String(gamesPlayed), label: "Games played" },
              { value: String(teams.length), label: "Teams joined" },
              { value: memberSinceShort, label: "Member since" },
            ]}
          />
        </div>
      </div>

      <section className="px-6 py-10 md:py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
          {/* Identity card */}
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-6 md:p-7">
            <div className="flex flex-col items-center text-center">
              <AvatarUpload
                src={user.avatar_url}
                fallback={initials(user.full_name, user.email)}
                label="Change profile photo"
                size="lg"
                onChange={async (dataUrl) => {
                  const updated = await updateMe({ avatar_url: dataUrl });
                  setUser(updated);
                }}
                onRemove={
                  user.avatar_url
                    ? async () => {
                        const updated = await updateMe({ avatar_url: null });
                        setUser(updated);
                      }
                    : undefined
                }
              />
              <h2 className="mt-5 font-display text-xl font-black text-white">
                {user.full_name || user.email.split("@")[0]}
              </h2>
              <p className="mt-1 text-sm text-white/60">{user.email}</p>
              <span className="mt-3 rounded-full border border-[#b2f746]/30 bg-[#b2f746]/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#b2f746]">
                {role}
              </span>
              {!editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="mt-6 w-full rounded-full bg-[#b2f746] py-3 text-sm font-bold text-[#121f00] transition-transform hover:scale-[1.02]"
                >
                  Edit profile
                </button>
              )}
            </div>
          </div>

          {/* Account details */}
          <div className="flex flex-col gap-5">
            <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-display text-lg font-black text-white">
                  Account details
                </h3>
                {!editing && (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="text-xs font-bold uppercase tracking-wider text-[#b2f746] hover:underline"
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
                      {saving ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col">
                  {[
                    { label: "Full name", value: user.full_name || "—" },
                    { label: "Email", value: user.email, mono: true },
                    {
                      label: "Phone",
                      value: user.phone || "Not set",
                      accent: !user.phone,
                    },
                    { label: "Member since", value: memberSince },
                  ].map((d) => (
                    <div
                      key={d.label}
                      className="flex items-center justify-between gap-4 border-b border-white/[0.04] py-3 last:border-b-0"
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                        {d.label}
                      </span>
                      <span
                        className={`truncate text-sm ${d.accent ? "text-amber-300" : "text-white"} ${d.mono ? "font-mono text-xs" : ""}`}
                      >
                        {d.value}
                      </span>
                    </div>
                  ))}
                  {success && (
                    <p className="mt-3 rounded-xl border border-[#b2f746]/30 bg-[#b2f746]/10 px-3 py-2 text-xs text-[#b2f746] animate-fade-in">
                      Profile updated successfully.
                    </p>
                  )}
                </div>
              )}
            </div>

            <SubscriptionTile
              subscriptions={subscriptions}
              gamesPlayed={gamesPlayed}
              teamsCount={teams.length}
              memberSinceShort={memberSinceShort}
              onView={() => router.push("/bookings")}
              onSeePlans={() => router.push("/plans")}
            />

            {/* Sign out */}
            <button
              type="button"
              onClick={handleLogout}
              className="group flex w-full items-center justify-between rounded-3xl border border-white/[0.06] bg-white/[0.03] px-6 py-4 text-sm font-semibold text-white/70 transition-colors hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300"
            >
              <span className="flex items-center gap-3">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign out
              </span>
              <span className="text-xs uppercase tracking-wider text-white/30 group-hover:text-rose-300/60">
                End session
              </span>
            </button>
          </div>
        </div>
      </section>

      <PageFAQ items={FAQS} />

      {showPhonePrompt && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
        >
          <div className="w-full max-w-sm animate-fade-in rounded-3xl border border-white/[0.08] bg-[#111213] p-6 shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 ring-1 ring-amber-400/30">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <h3 className="mb-1 text-center font-display text-lg font-bold text-white">
              Add your phone number
            </h3>
            <p className="mb-5 text-center text-sm text-white/60">
              We need your phone number to contact you about bookings and to notify you when your payment is verified.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={startEditingPhone}
                className="w-full rounded-full bg-[#b2f746] py-3 text-sm font-bold text-[#121f00] shadow-lg shadow-[#b2f746]/20 transition-all hover:bg-white"
              >
                Add phone number
              </button>
              <button
                type="button"
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

const DAYS_LONG = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function fmtTime(hhmmss: string): string {
  const [h, m] = hhmmss.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
}

function SubscriptionTile({
  subscriptions,
  gamesPlayed,
  teamsCount,
  memberSinceShort,
  onView,
  onSeePlans,
}: {
  subscriptions: SubscriptionRead[];
  gamesPlayed: number;
  teamsCount: number;
  memberSinceShort: string;
  onView: () => void;
  onSeePlans: () => void;
}) {
  // Prefer active sub; otherwise pending; otherwise none.
  const live = subscriptions.find(
    (s) => s.status === "active" || s.status === "pending",
  );

  if (!live) {
    // Fallback activity tile + plans CTA
    return (
      <div className="overflow-hidden rounded-3xl bg-[#b2f746] p-6 text-[#121f00]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em]">
              · Your activity ·
            </p>
            <h3 className="mt-2 font-display text-xl font-black md:text-2xl">
              {gamesPlayed} game{gamesPlayed === 1 ? "" : "s"} played
            </h3>
            <p className="mt-1 text-sm text-[#121f00]/70">
              {teamsCount > 0
                ? `${teamsCount} team${teamsCount === 1 ? "" : "s"} · Member since ${memberSinceShort}`
                : `Member since ${memberSinceShort}`}
            </p>
            <button
              type="button"
              onClick={onSeePlans}
              className="mt-3 text-xs font-bold uppercase tracking-wider text-[#121f00] underline-offset-4 hover:underline"
            >
              See plans →
            </button>
          </div>
          <button
            type="button"
            onClick={onView}
            className="rounded-full bg-[#121f00] px-4 py-2 text-xs font-bold text-[#b2f746] transition-transform hover:scale-[1.03]"
          >
            View
          </button>
        </div>
      </div>
    );
  }

  const isPending = live.status === "pending";
  const planName = live.plan?.name ?? "Subscription";
  const slots = [...live.slots].sort((a, b) =>
    a.day_of_week !== b.day_of_week
      ? a.day_of_week - b.day_of_week
      : a.start_time.localeCompare(b.start_time),
  );

  return (
    <div className="overflow-hidden rounded-3xl bg-[#b2f746] p-6 text-[#121f00]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em]">
            · {planName} {isPending ? "Pending payment" : "Plan"} ·
          </p>
          <h3 className="mt-2 font-display text-xl font-black md:text-2xl">
            {slots.length} weekly slot{slots.length === 1 ? "" : "s"}
          </h3>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-[#121f00]/80">
            {slots.map((s) => (
              <li key={s.id}>
                <span className="font-bold">{DAYS_LONG[s.day_of_week]}</span> ·{" "}
                {fmtTime(s.start_time)} – {fmtTime(s.end_time)}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-[#121f00]/70">
            {isPending
              ? "Awaiting admin verification of your UPI payment."
              : `Recurring · ${live.expires_on ? `expires ${live.expires_on}` : "auto-renews"}`}
          </p>
          {isPending && live.payment?.utr && (
            <p className="mt-1 font-mono text-xs text-[#121f00]/60">
              UTR: {live.payment.utr}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onView}
          className="shrink-0 rounded-full bg-[#121f00] px-4 py-2 text-xs font-bold text-[#b2f746] transition-transform hover:scale-[1.03]"
        >
          View
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
