// Static marketing content that lives alongside the Plans page.
// Plans themselves come from the API (see listPlans()) so the admin
// can configure tiers, prices, perks, and visibility.

export const PLAN_FAQS = [
  {
    q: "How does the fixed recurring slot work?",
    a: "Pick a day and time when you sign up — say every Tuesday at 7pm. That slot is locked in for you each week, no need to re-book. Skip a week? You can swap it for any other open slot in the same month.",
  },
  {
    q: "Can I switch from Daily to a Monthly plan later?",
    a: "Yes — anytime. You'll start saving from your next booking, and we'll prorate any unused daily credit toward your first month.",
  },
  {
    q: "What happens if my recurring slot gets rained out?",
    a: "Covered turfs aren't affected. For uncovered turfs, we automatically credit the lost hour to your next month, plus a 10% goodwill bonus.",
  },
  {
    q: "Can I share my plan with my team?",
    a: "Your plan is tied to you, but anyone you bring along can play on your slot — that's the whole point. The booking is in your name.",
  },
  {
    q: "Is there a lock-in or cancellation fee?",
    a: "No lock-in. Cancel anytime from your profile. You keep all unused hours until the end of the billing month.",
  },
  {
    q: "Do plan hours roll over to the next month?",
    a: "Up to 2 hours roll over for Pro members. Starter hours expire at the end of each month — use them or lose them.",
  },
];

export const TESTIMONIALS_PLANS = [
  {
    name: "Vikram Iyer",
    role: "Captain · Chennai Strikers",
    quote:
      "Pro plan paid for itself in week two. Tuesday 7pm is our locked slot — no more frantic group chat coordination on Sunday nights.",
    plan: "Pro",
  },
  {
    name: "Anita Raj",
    role: "Weekend cricket league",
    quote:
      "We started on Daily and graduated to Starter once we were playing every weekend. The discount on extra hours is the cherry on top.",
    plan: "Starter",
  },
  {
    name: "Karthik M.",
    role: "5-a-side regular",
    quote:
      "Priority booking is underrated. I get the 7pm slots before they hit public availability. Actual game-changer for someone with a 9-to-6.",
    plan: "Pro",
  },
];

export const PLAN_STATS = [
  { value: "2,400+", label: "Active members" },
  { value: "180", label: "Recurring slots booked" },
  { value: "1", label: "Turf, OMR Chennai" },
  { value: "4.8", label: "Avg member rating" },
];
