import type { CollageFit } from "./collage";
import {
  RESET_IMAGE_TRANSFORM,
  type ImageTransform,
} from "./photo-collage-framing";
import { useEffect, useState } from "react";

const framingCopy = {
  en: {
    selectedPhoto: "Selected photo",
    noPhoto: "Select a photo in the preview to adjust its crop.",
    zoom: "Zoom",
    horizontal: "Horizontal",
    vertical: "Vertical",
    rangeZoom: (name: string) => `Zoom for ${name}`,
    rangeHorizontal: (name: string) => `Horizontal position for ${name}`,
    rangeVertical: (name: string) => `Vertical position for ${name}`,
    valueZoom: (name: string) => `Zoom value for ${name}`,
    valueHorizontal: (name: string) => `Horizontal value for ${name}`,
    valueVertical: (name: string) => `Vertical value for ${name}`,
    reset: (name: string) => `Reset framing for ${name}`,
    fitDisabled: "Choose Fill to adjust photo framing.",
  },
  vi: {
    selectedPhoto: "Ảnh đang chọn",
    noPhoto: "Chọn một ảnh trong vùng xem trước để điều chỉnh vùng cắt.",
    zoom: "Thu phóng",
    horizontal: "Ngang",
    vertical: "Dọc",
    rangeZoom: (name: string) => `Thu phóng cho ${name}`,
    rangeHorizontal: (name: string) => `Vị trí ngang cho ${name}`,
    rangeVertical: (name: string) => `Vị trí dọc cho ${name}`,
    valueZoom: (name: string) => `Giá trị thu phóng cho ${name}`,
    valueHorizontal: (name: string) => `Giá trị ngang cho ${name}`,
    valueVertical: (name: string) => `Giá trị dọc cho ${name}`,
    reset: (name: string) => `Đặt lại khung ảnh cho ${name}`,
    fitDisabled: "Chọn Lấp đầy để điều chỉnh khung ảnh.",
  },
} as const;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

function PercentNumberInput({
  label,
  value,
  minimum,
  maximum,
  disabled,
  onCommit,
}: {
  label: string;
  value: number;
  minimum: number;
  maximum: number;
  disabled: boolean;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => setDraft(String(value)), [value]);

  const commit = () => {
    const number = Number(draft);
    if (!draft.trim() || !Number.isFinite(number)) {
      setDraft(String(value));
      return;
    }
    const next = clamp(number, minimum, maximum);
    setDraft(String(next));
    onCommit(next);
  };

  return (
    <input
      aria-label={label}
      type="number"
      min={minimum}
      max={maximum}
      value={draft}
      disabled={disabled}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          commit();
          event.currentTarget.blur();
        } else if (event.key === "Escape") {
          setDraft(String(value));
          event.currentTarget.blur();
        }
      }}
      className="h-10 w-20 rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-2 text-right text-sm text-[var(--vt-text)] disabled:opacity-50"
    />
  );
}

export function PhotoCollageFramingControls({
  locale,
  image,
  fit,
  onChange,
}: {
  locale: "en" | "vi";
  image: { file: File; transform: ImageTransform } | null;
  fit: CollageFit;
  onChange: (transform: ImageTransform) => void;
}) {
  const t = framingCopy[locale];
  const disabled = fit !== "fill";

  const updatePercent = (
    key: keyof ImageTransform,
    rawValue: string,
    minimum: number,
    maximum: number,
  ) => {
    if (!image) return;
    const number = Number(rawValue);
    if (!Number.isFinite(number)) return;
    onChange({
      ...image.transform,
      [key]: clamp(number, minimum, maximum) / 100,
    });
  };

  const renderControl = (
    label: string,
    rangeLabel: string,
    valueLabel: string,
    key: keyof ImageTransform,
    minimum: number,
    maximum: number,
  ) => {
    if (!image) return null;
    const value = Math.round(image.transform[key] * 100);
    return (
      <div className="text-xs font-semibold text-[var(--vt-text-2)]">
        <div className="flex items-center justify-between gap-3">
          <span>{label}</span>
          <label className="flex items-center gap-1">
            <span className="sr-only">{valueLabel}</span>
            <PercentNumberInput
              label={valueLabel}
              value={value}
              minimum={minimum}
              maximum={maximum}
              disabled={disabled}
              onCommit={(next) =>
                updatePercent(key, String(next), minimum, maximum)
              }
            />
            <span aria-hidden="true">%</span>
          </label>
        </div>
        <input
          aria-label={rangeLabel}
          type="range"
          min={minimum}
          max={maximum}
          value={value}
          disabled={disabled}
          onChange={(event) =>
            updatePercent(key, event.target.value, minimum, maximum)
          }
          className="mt-2 h-10 w-full accent-emerald-700 disabled:opacity-50"
        />
      </div>
    );
  };

  return (
    <div className="mt-5 border-t border-[var(--vt-border)] pt-4">
      <h3 className="text-xs font-bold">{t.selectedPhoto}</h3>
      {image ? (
        <div className="mt-3 space-y-3">
          <p className="truncate text-xs text-[var(--vt-text-3)]">
            {image.file.name}
          </p>
          {disabled ? (
            <p className="text-xs leading-5 text-[var(--vt-text-3)]">
              {t.fitDisabled}
            </p>
          ) : null}
          {renderControl(
            t.zoom,
            t.rangeZoom(image.file.name),
            t.valueZoom(image.file.name),
            "zoom",
            100,
            300,
          )}
          {renderControl(
            t.horizontal,
            t.rangeHorizontal(image.file.name),
            t.valueHorizontal(image.file.name),
            "focalX",
            0,
            100,
          )}
          {renderControl(
            t.vertical,
            t.rangeVertical(image.file.name),
            t.valueVertical(image.file.name),
            "focalY",
            0,
            100,
          )}
          <button
            type="button"
            disabled={disabled}
            aria-label={t.reset(image.file.name)}
            onClick={() => onChange(RESET_IMAGE_TRANSFORM)}
            className="min-h-11 w-full rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-bold disabled:opacity-50"
          >
            {locale === "en" ? "Reset framing" : "Đặt lại khung ảnh"}
          </button>
        </div>
      ) : (
        <p className="mt-2 text-xs leading-5 text-[var(--vt-text-3)]">
          {t.noPhoto}
        </p>
      )}
    </div>
  );
}
