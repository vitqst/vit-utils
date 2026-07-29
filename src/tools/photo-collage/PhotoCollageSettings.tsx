import type {
  CollageAspect,
  CollageFit,
  CollageFormat,
  CollageTemplate,
} from "./collage";
import { PhotoCollageFramingControls } from "./PhotoCollageFramingControls";
import type { ImageTransform } from "./photo-collage-framing";

const aspectValues: CollageAspect[] = [
  "original",
  "1:1",
  "4:5",
  "16:9",
  "9:16",
];

const settingsCopy = {
  en: {
    settings: "Collage settings",
    layouts: "Layouts",
    templateNames: {
      balanced: "Balanced layout",
      "feature-left": "Feature left layout",
      "feature-top": "Feature top layout",
      columns: "Columns layout",
    },
    aspect: "Aspect ratio",
    original: "Original",
    spacing: "Spacing",
    corner: "Corner radius",
    background: "Background",
    fit: "Image fit",
    fill: "Fill",
    contain: "Fit",
    output: "Output",
    width: "Output width",
    format: "Format",
    cancel: "Cancel rendering",
    statusLabel: "Collage status",
  },
  vi: {
    settings: "Cài đặt ảnh ghép",
    layouts: "Bố cục",
    templateNames: {
      balanced: "Bố cục cân bằng",
      "feature-left": "Bố cục nổi bật bên trái",
      "feature-top": "Bố cục nổi bật phía trên",
      columns: "Bố cục cột",
    },
    aspect: "Tỷ lệ khung hình",
    original: "Gốc",
    spacing: "Khoảng cách",
    corner: "Bo góc",
    background: "Nền",
    fit: "Cách đặt ảnh",
    fill: "Lấp đầy",
    contain: "Vừa ảnh",
    output: "Đầu ra",
    width: "Chiều rộng đầu ra",
    format: "Định dạng",
    cancel: "Hủy kết xuất",
    statusLabel: "Trạng thái ảnh ghép",
  },
} as const;

export type SelectedCollageImage = {
  id: number;
  file: File;
  transform: ImageTransform;
};

export function PhotoCollageSettings({
  locale,
  templates,
  template,
  onTemplateChange,
  aspect,
  onAspectChange,
  gap,
  onGapChange,
  cornerRadius,
  onCornerRadiusChange,
  background,
  onBackgroundChange,
  fit,
  onFitChange,
  selectedImage,
  onTransformChange,
  width,
  onWidthChange,
  format,
  onFormatChange,
  privacy,
  error,
  statusText,
  running,
  onCancel,
  resultUrl,
  downloadName,
  downloadLabel,
  showFeedback = true,
  className = "",
}: {
  locale: "en" | "vi";
  templates: readonly CollageTemplate[];
  template: CollageTemplate;
  onTemplateChange: (id: string) => void;
  aspect: CollageAspect;
  onAspectChange: (aspect: CollageAspect) => void;
  gap: number;
  onGapChange: (gap: number) => void;
  cornerRadius: number;
  onCornerRadiusChange: (radius: number) => void;
  background: string;
  onBackgroundChange: (background: string) => void;
  fit: CollageFit;
  onFitChange: (fit: CollageFit) => void;
  selectedImage: SelectedCollageImage | null;
  onTransformChange: (transform: ImageTransform) => void;
  width: number;
  onWidthChange: (width: number) => void;
  format: CollageFormat;
  onFormatChange: (format: CollageFormat) => void;
  privacy: string;
  error: string;
  statusText: string;
  running: boolean;
  onCancel: () => void;
  resultUrl: string;
  downloadName: string;
  downloadLabel: string;
  showFeedback?: boolean;
  className?: string;
}) {
  const t = settingsCopy[locale];
  const labelClass = "block text-xs font-semibold text-[var(--vt-text-2)]";
  const controlClass =
    "mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm text-[var(--vt-text)]";

  return (
    <section className={className}>
      <h2 className="text-sm font-bold">{t.settings}</h2>

      {templates.length > 1 ? (
        <fieldset className="mt-4">
          <legend className="mb-2 text-xs font-bold">{t.layouts}</legend>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((candidate) => {
              const name =
                t.templateNames[
                  candidate.id as keyof typeof t.templateNames
                ] ?? candidate.id;
              return (
                <label
                  key={candidate.id}
                  className={`relative aspect-[4/3] cursor-pointer overflow-hidden rounded-lg border-2 bg-[var(--vt-bg-0)] ${
                    template.id === candidate.id
                      ? "border-emerald-700"
                      : "border-[var(--vt-border)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="collage-template"
                    aria-label={name}
                    value={candidate.id}
                    checked={template.id === candidate.id}
                    onChange={() => onTemplateChange(candidate.id)}
                    className="sr-only"
                  />
                  {candidate.cells.map((cell, index) => (
                    <span
                      key={index}
                      aria-hidden="true"
                      className="absolute border border-[var(--vt-bg-0)] bg-[var(--vt-border-2)]"
                      style={{
                        left: `${cell.x * 100}%`,
                        top: `${cell.y * 100}%`,
                        width: `${cell.width * 100}%`,
                        height: `${cell.height * 100}%`,
                      }}
                    />
                  ))}
                  <span className="absolute inset-x-0 bottom-0 truncate bg-[var(--vt-bg-0)]/90 px-1 py-0.5 text-center text-[9px] font-semibold">
                    {name}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <fieldset className="mt-4">
        <legend className="mb-2 text-xs font-semibold text-[var(--vt-text-2)]">
          {t.aspect}
        </legend>
        <div className="grid grid-cols-3 gap-1 sm:grid-cols-5">
          {aspectValues.map((value) => {
            const name = value === "original" ? t.original : value;
            return (
              <label
                key={value}
                className={`cursor-pointer rounded-md border px-1 py-2 text-center text-[11px] font-semibold ${
                  aspect === value
                    ? "border-emerald-700 bg-emerald-700/10 text-emerald-700 dark:text-emerald-300"
                    : "border-[var(--vt-border)]"
                }`}
              >
                <input
                  type="radio"
                  name="collage-aspect"
                  aria-label={name}
                  checked={aspect === value}
                  onChange={() => onAspectChange(value)}
                  className="sr-only"
                />
                {name}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-5 space-y-4">
        <label className={labelClass}>
          <span className="flex justify-between">
            <span>{t.spacing}</span>
            <span>{gap}px</span>
          </span>
          <input
            aria-label={t.spacing}
            type="range"
            min={0}
            max={128}
            value={gap}
            onChange={(event) => onGapChange(Number(event.target.value))}
            className="mt-2 h-10 w-full accent-emerald-700"
          />
        </label>
        <label className={labelClass}>
          <span className="flex justify-between">
            <span>{t.corner}</span>
            <span>{cornerRadius}px</span>
          </span>
          <input
            aria-label={t.corner}
            type="range"
            min={0}
            max={128}
            value={cornerRadius}
            onChange={(event) =>
              onCornerRadiusChange(Number(event.target.value))
            }
            className="mt-2 h-10 w-full accent-emerald-700"
          />
        </label>
        <label className={labelClass}>
          {t.background}
          <input
            aria-label={t.background}
            type="color"
            value={background}
            onChange={(event) => onBackgroundChange(event.target.value)}
            className={`${controlClass} h-11 p-1`}
          />
        </label>
      </div>

      <fieldset className="mt-5">
        <legend className="mb-2 text-xs font-semibold text-[var(--vt-text-2)]">
          {t.fit}
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {(["fill", "fit"] as CollageFit[]).map((value) => (
            <label
              key={value}
              className={`cursor-pointer rounded-lg border px-3 py-3 text-center text-xs font-bold ${
                fit === value
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-[var(--vt-border)]"
              }`}
            >
              <input
                type="radio"
                name="image-fit"
                aria-label={value === "fill" ? t.fill : t.contain}
                checked={fit === value}
                onChange={() => onFitChange(value)}
                className="sr-only"
              />
              {value === "fill" ? t.fill : t.contain}
            </label>
          ))}
        </div>
      </fieldset>

      <PhotoCollageFramingControls
        locale={locale}
        image={selectedImage}
        fit={fit}
        onChange={onTransformChange}
      />

      <div className="mt-5 border-t border-[var(--vt-border)] pt-4">
        <h3 className="text-xs font-bold">{t.output}</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className={labelClass}>
            {t.width}
            <input
              aria-label={t.width}
              type="number"
              min={320}
              max={4096}
              value={width}
              onChange={(event) => onWidthChange(Number(event.target.value))}
              className={controlClass}
            />
          </label>
          <label className={labelClass}>
            {t.format}
            <select
              aria-label={t.format}
              value={format}
              onChange={(event) =>
                onFormatChange(event.target.value as CollageFormat)
              }
              className={controlClass}
            >
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPEG</option>
            </select>
          </label>
        </div>
      </div>

      <p className="mt-5 text-[11px] leading-5 text-[var(--vt-text-3)]">
        {privacy}
      </p>
      {showFeedback ? (
        <>
          {error ? (
            <p
              role="alert"
              className="mt-3 rounded-lg border border-[var(--vt-red)]/40 p-3 text-xs text-[var(--vt-red)]"
            >
              {error}
            </p>
          ) : null}
          {statusText ? (
            <p
              role="status"
              aria-label={t.statusLabel}
              aria-live="polite"
              className="mt-3 text-xs"
            >
              {statusText}
            </p>
          ) : null}
          <div className="mt-3 grid gap-2">
            {running ? (
              <button
                type="button"
                onClick={onCancel}
                className="min-h-11 rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-bold"
              >
                {t.cancel}
              </button>
            ) : null}
            {resultUrl ? (
              <a
                href={resultUrl}
                download={downloadName}
                className="rounded-lg bg-emerald-700 px-3 py-3 text-center text-xs font-bold text-white"
              >
                {downloadLabel}
              </a>
            ) : null}
          </div>
        </>
      ) : null}
    </section>
  );
}
