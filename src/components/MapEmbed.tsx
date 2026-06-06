type Props = {
  className?: string;
  title?: string;
};

const LAT = 8.1496779;
const LNG = 77.3826845;
const EMBED_URL = `https://maps.google.com/maps?q=${LAT},${LNG}&hl=en&z=17&output=embed`;

export default function MapEmbed({
  className = "",
  title = "Signal Shift Sports & Events Centre location",
}: Props) {
  return (
    <iframe
      src={EMBED_URL}
      title={title}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className={`block h-full w-full border-0 ${className}`}
      allowFullScreen
    />
  );
}
