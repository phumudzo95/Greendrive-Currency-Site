import { type ReactNode } from "react";

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13.5px] font-semibold text-gd-black">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-[12.5px] font-medium text-red-600">{error}</p>}
    </div>
  );
}

const inputClasses =
  "h-12 w-full rounded-lg border border-gd-line bg-white px-3.5 text-[14.5px] text-gd-black placeholder:text-gd-mute/60 focus:border-gd-primary focus:outline-2 focus:outline-offset-1 focus:outline-gd-primary/30";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClasses} ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${inputClasses} ${props.className ?? ""}`}>
      {props.children}
    </select>
  );
}
