import type { PriceBreakdown as PriceBreakdownType } from "@/types";
import { formatCurrency } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type Props = {
  breakdown: PriceBreakdownType | null;
  loading?: boolean;
};

export default function PriceBreakdown({ breakdown, loading }: Props) {
  if (loading) {
    return (
      <div className="flex h-24 items-center justify-center">
        <LoadingSpinner size="sm" />
      </div>
    );
  }
  if (!breakdown) return null;

  return (
    <div className="flex flex-col gap-1.5 animate-fade-in">
      {/* Base price */}
      <div className="flex justify-between text-sm">
        <span className="text-[#404a3b]">Base price</span>
        <span className="text-[#191c1d]">{formatCurrency(breakdown.base_price)}</span>
      </div>

      {/* Applied rules */}
      {breakdown.applied_rules?.map((rule, i) => (
        <div key={i} className="flex justify-between text-xs">
          <span className="text-[#707a6a] capitalize">{rule.rule_name}</span>
          <span className={rule.effect_amount < 0 ? "text-emerald-400" : "text-amber-400"}>
            {rule.effect_amount >= 0 ? "+" : ""}{formatCurrency(rule.effect_amount)}
          </span>
        </div>
      ))}

      {/* Membership discount */}
      {breakdown.discount > 0 && (
        <div className="flex justify-between text-xs">
          <span className="text-emerald-400">Membership discount</span>
          <span className="text-emerald-400">-{formatCurrency(breakdown.discount)}</span>
        </div>
      )}

      {/* Coupon discount */}
      {breakdown.coupon_discount > 0 && (
        <div className="flex justify-between text-xs">
          <span className="text-emerald-400">Coupon</span>
          <span className="text-emerald-400">-{formatCurrency(breakdown.coupon_discount)}</span>
        </div>
      )}

      <div className="my-1 border-t border-[#bfcab7]/20" />

      {/* Subtotal */}
      <div className="flex justify-between text-sm">
        <span className="text-[#404a3b]">Subtotal</span>
        <span className="text-[#191c1d]">{formatCurrency(breakdown.subtotal)}</span>
      </div>

      {/* Tax */}
      <div className="flex justify-between text-xs">
        <span className="text-[#707a6a]">GST (18%)</span>
        <span className="text-[#707a6a]">{formatCurrency(breakdown.tax)}</span>
      </div>

      <div className="my-1 border-t border-[#bfcab7]/20" />

      {/* Total */}
      <div className="flex justify-between text-base font-bold">
        <span className="text-[#191c1d]">Total</span>
        <span className="gradient-text text-lg">{formatCurrency(breakdown.total)}</span>
      </div>
    </div>
  );
}
