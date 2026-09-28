import { statusStyle } from "@/lib/statusColors";

export default function StatusTag({ status }) {
  const style = statusStyle(status);
  return (
    <span className={`inline-flex items-center gap-2 text-[13px] ${style.text}`}>
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: style.dot }}
      />
      {status}
    </span>
  );
}
