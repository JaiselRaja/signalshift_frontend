import { type ReactNode } from "react";

type Props = {
  eyebrow: ReactNode;
  /** First line of the headline (before the italic lime word). */
  head1: ReactNode;
  /** The italic, lime-colored emphasis word. */
  italicWord: ReactNode;
  /** Trailing words after the italic word. */
  head2: ReactNode;
  subtitle: ReactNode;
};

export default function PageHero({ eyebrow, head1, italicWord, head2, subtitle }: Props) {
  return (
    <section className="px-6 pt-12 pb-10 md:pt-16 md:pb-12">
      <div className="mx-auto max-w-5xl text-center">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[#b2f746] md:text-[11px]">
          · {eyebrow} ·
        </p>
        <h1 className="mt-4 font-display text-4xl font-black leading-[0.95] tracking-tight text-white md:text-6xl">
          {head1}
          <br />
          <span className="italic text-[#b2f746]">{italicWord}</span> {head2}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-white/60 md:text-lg">{subtitle}</p>
      </div>
    </section>
  );
}
