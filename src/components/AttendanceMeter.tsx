export const attendanceTone = (percentage: number): "success" | "warning" | "error" =>
  percentage >= 85 ? "success" : percentage >= 75 ? "warning" : "error";

export const formatPercentage = (percentage: number): string =>
  `${percentage.toLocaleString("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 1 })}%`;

const progressClass = {
  success: "progress-success",
  warning: "progress-warning",
  error: "progress-error",
};

export const attendanceProgressClass = (percentage: number): string => progressClass[attendanceTone(percentage)];

interface Props {
  percentage: number;
  empty?: boolean;
}

const AttendanceMeter = ({ percentage, empty = false }: Props) => {
  if (empty) {
    return <span className="text-base-content/50">Sin registros</span>;
  }
  return (
    <div className="flex items-center gap-2">
      <progress className={`progress ${attendanceProgressClass(percentage)} w-24`} value={percentage} max={100} />
      <span className="w-12 text-xs font-medium">{formatPercentage(percentage)}</span>
    </div>
  );
};

export default AttendanceMeter;
