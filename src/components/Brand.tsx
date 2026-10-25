interface Props {
  size?: "sm" | "lg";
  light?: boolean;
}

const Brand = ({ size = "sm", light = false }: Props) => (
  <span className={`inline-flex items-center gap-2 font-semibold ${light ? "text-primary-content" : "text-primary"}`}>
    <svg viewBox="0 0 64 64" className={size === "lg" ? "h-10 w-10" : "h-7 w-7"} aria-hidden="true">
      <rect width="64" height="64" rx="12" fill={light ? "#ffffff" : "#1f3a5f"} />
      <path d="M32 14 10 26l22 12 22-12z" fill={light ? "#1f3a5f" : "#ffffff"} />
      <path d="M18 33v10c0 4 6 8 14 8s14-4 14-8V33l-14 7z" fill="#b08d57" />
    </svg>
    <span className={size === "lg" ? "text-2xl" : "text-lg"}>AulaConecta</span>
  </span>
);

export default Brand;
