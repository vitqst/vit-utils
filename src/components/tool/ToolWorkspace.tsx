import type {
  ChangeEvent,
  HTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { useState } from "react";

interface ToolWorkspaceProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function ToolWorkspace({
  title,
  description,
  children,
}: ToolWorkspaceProps) {
  return (
    <div className="h-full overflow-y-auto bg-[var(--vt-bg-0)]">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-8">
        <header className="mb-7 max-w-3xl">
          <h1 className="text-3xl font-bold tracking-[-0.6px] text-[var(--vt-text)]">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--vt-text-2)]">
            {description}
          </p>
        </header>
        {children}
      </div>
    </div>
  );
}

export function ToolGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
      {children}
    </div>
  );
}

interface ToolPanelProps {
  title: string;
  children: ReactNode;
}

export function ToolPanel({ title, children }: ToolPanelProps) {
  return (
    <section className="min-w-0 rounded-xl border border-[var(--vt-border)] bg-[var(--vt-bg-1)] p-4">
      <h2 className="mb-3 text-sm font-semibold text-[var(--vt-text)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

interface ToolTextAreaProps
  extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "onChange" | "value"
  > {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ToolTextArea({
  label,
  value,
  onChange,
  rows = 12,
  ...props
}: ToolTextAreaProps) {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <textarea
        {...props}
        rows={rows}
        value={value}
        onChange={handleChange}
        className={`w-full resize-y rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2.5 font-mono text-[13px] leading-6 text-[var(--vt-text)] outline-none placeholder:text-[var(--vt-text-3)] focus:border-[var(--vt-accent)] ${props.className ?? ""}`}
      />
    </label>
  );
}

export function ToolActions({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`mt-3 flex flex-wrap items-center gap-2 [&>button]:rounded-lg [&>button]:border [&>button]:border-[var(--vt-border-2)] [&>button]:bg-[var(--vt-bg-2)] [&>button]:px-3 [&>button]:py-2 [&>button]:text-xs [&>button]:font-semibold [&>button]:text-[var(--vt-text)] [&>button]:hover:border-[var(--vt-accent)] ${className}`}
    >
      {children}
    </div>
  );
}

interface ToolOutputProps {
  label: string;
  value: string;
  emptyLabel: string;
  children?: ReactNode;
}

export function ToolOutput({
  label,
  value,
  emptyLabel,
  children,
}: ToolOutputProps) {
  return (
    <section
      aria-label={label}
      className="min-h-56 rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] p-3"
    >
      {value ? (
        <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-6 text-[var(--vt-text)]">
          {value}
        </pre>
      ) : (
        <p className="text-sm text-[var(--vt-text-3)]">{emptyLabel}</p>
      )}
      {children}
    </section>
  );
}

interface CopyButtonProps {
  value: string;
  label: string;
  copiedLabel: string;
  failedLabel: string;
}

export function CopyButton({
  value,
  label,
  copiedLabel,
  failedLabel,
}: CopyButtonProps) {
  const [status, setStatus] = useState<"copied" | "failed" | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={!value}
        onClick={copy}
        className="rounded-lg border border-[var(--vt-border-2)] bg-[var(--vt-bg-2)] px-3 py-2 text-xs font-semibold text-[var(--vt-text)] hover:border-[var(--vt-accent)] disabled:opacity-50"
      >
        {label}
      </button>
      {status ? (
        <span
          role="status"
          className={`text-xs ${
            status === "copied"
              ? "text-[var(--vt-green)]"
              : "text-[var(--vt-red)]"
          }`}
        >
          {status === "copied" ? copiedLabel : failedLabel}
        </span>
      ) : null}
    </div>
  );
}
