import { useMemo, useState } from "react";

import {
  CopyButton,
  ToolOutput,
  ToolPanel,
  ToolWorkspace,
} from "../../components/tool/ToolWorkspace";
import type { ToolComponentProps } from "../../registry/types";
import {
  estimatePasswordEntropy,
  generatePassphrase,
  generatePassword,
  passphraseEntropy,
  PasswordGenerationError,
  passwordPoolSize,
  type PasswordGenerationErrorCode,
  type PassphraseOptions,
  type PasswordOptions,
} from "./password";

type GeneratorMode = "password" | "passphrase";
type GenerationError = PasswordGenerationErrorCode | "generationFailed";

const copy = {
  en: {
    title: "Password generator",
    description:
      "Generate cryptographically random passwords and passphrases locally with explicit controls.",
    mode: "Generator mode",
    password: "Password",
    passphrase: "Passphrase",
    length: "Length",
    uppercase: "Uppercase",
    lowercase: "Lowercase",
    digits: "Digits",
    symbols: "Symbols",
    ambiguous: "Exclude ambiguous characters",
    words: "Word count",
    wordlist:
      "Uses EFF's long list of 7,776 words. EFF recommends at least six words.",
    separator: "Separator",
    capitalize: "Capitalize words",
    number: "Add numeric suffix",
    generatePassword: "Generate password",
    generatePassphrase: "Generate passphrase",
    result: "Generated secret",
    empty: "Generate a secret to see it here.",
    entropy: "Estimated entropy",
    entropyDisclosure:
      "Entropy is a composition estimate, not a password-strength or breach check.",
    copy: "Copy secret",
    copied: "Copied",
    copyFailed: "Copy failed",
    clear: "Clear secret",
    errors: {
      invalidPasswordLength:
        "Enter a whole-number password length from 4 through 256.",
      noCharacterClass: "Select at least one character class.",
      passwordTooShort:
        "The password is too short to include every selected character class.",
      invalidWordCount: "Enter a whole-number word count from 3 through 20.",
      invalidSeparator:
        "Use no more than three separator characters without line breaks.",
      generationFailed: "Could not generate a secret.",
    },
  },
  vi: {
    title: "Tạo mật khẩu",
    description:
      "Tạo mật khẩu và cụm mật khẩu ngẫu nhiên mật mã cục bộ với tùy chọn rõ ràng.",
    mode: "Chế độ tạo",
    password: "Mật khẩu",
    passphrase: "Cụm mật khẩu",
    length: "Độ dài",
    uppercase: "Chữ hoa",
    lowercase: "Chữ thường",
    digits: "Chữ số",
    symbols: "Ký hiệu",
    ambiguous: "Loại ký tự dễ nhầm",
    words: "Số từ",
    wordlist:
      "Dùng danh sách dài 7.776 từ của EFF. EFF khuyến nghị ít nhất sáu từ.",
    separator: "Ký tự phân cách",
    capitalize: "Viết hoa đầu từ",
    number: "Thêm số ở cuối",
    generatePassword: "Tạo mật khẩu",
    generatePassphrase: "Tạo cụm mật khẩu",
    result: "Bí mật đã tạo",
    empty: "Tạo bí mật để xem tại đây.",
    entropy: "Entropy ước tính",
    entropyDisclosure:
      "Entropy là ước tính theo cấu tạo, không phải kiểm tra độ mạnh hoặc rò rỉ.",
    copy: "Sao chép bí mật",
    copied: "Đã sao chép",
    copyFailed: "Không thể sao chép",
    clear: "Xóa bí mật",
    errors: {
      invalidPasswordLength:
        "Nhập độ dài mật khẩu là số nguyên từ 4 đến 256.",
      noCharacterClass: "Chọn ít nhất một loại ký tự.",
      passwordTooShort:
        "Mật khẩu quá ngắn để chứa mọi loại ký tự đã chọn.",
      invalidWordCount: "Nhập số từ là số nguyên từ 3 đến 20.",
      invalidSeparator:
        "Chỉ dùng tối đa ba ký tự phân cách và không chứa ký tự xuống dòng.",
      generationFailed: "Không thể tạo bí mật.",
    },
  },
} as const;

export default function PasswordTool({ locale }: ToolComponentProps) {
  const t = copy[locale];
  const [mode, setMode] = useState<GeneratorMode>("password");
  const [passwordOptions, setPasswordOptions] = useState<PasswordOptions>({
    length: 20,
    uppercase: true,
    lowercase: true,
    digits: true,
    symbols: true,
    excludeAmbiguous: false,
  });
  const [phraseOptions, setPhraseOptions] = useState<PassphraseOptions>({
    words: 6,
    separator: "-",
    capitalize: false,
    includeNumber: false,
  });
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<GenerationError | null>(null);
  const entropy = useMemo(
    () =>
      mode === "password"
        ? estimatePasswordEntropy(
            passwordOptions.length,
            passwordPoolSize(passwordOptions),
          )
        : passphraseEntropy(phraseOptions),
    [mode, passwordOptions, phraseOptions],
  );

  const clearResult = () => {
    setSecret("");
    setError(null);
  };

  const generate = () => {
    try {
      setSecret(
        mode === "password"
          ? generatePassword(passwordOptions)
          : generatePassphrase(phraseOptions),
      );
      setError(null);
    } catch (generationError) {
      setSecret("");
      setError(
        generationError instanceof PasswordGenerationError
          ? generationError.code
          : "generationFailed",
      );
    }
  };

  const passwordToggle = (
    key: keyof Pick<
      PasswordOptions,
      "uppercase" | "lowercase" | "digits" | "symbols" | "excludeAmbiguous"
    >,
    label: string,
  ) => (
    <label className="flex items-center gap-2 text-sm text-[var(--vt-text)]">
      <input
        type="checkbox"
        checked={passwordOptions[key]}
        onChange={(event) => {
          setPasswordOptions((current) => ({
            ...current,
            [key]: event.target.checked,
          }));
          clearResult();
        }}
      />
      {label}
    </label>
  );

  return (
    <ToolWorkspace title={t.title} description={t.description}>
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
        <ToolPanel title={mode === "password" ? t.password : t.passphrase}>
          <label className="block text-xs font-semibold text-[var(--vt-text-2)]">
            {t.mode}
            <select
              aria-label={t.mode}
              value={mode}
              onChange={(event) => {
                setMode(event.target.value as GeneratorMode);
                clearResult();
              }}
              className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 text-sm text-[var(--vt-text)]"
            >
              <option value="password">{t.password}</option>
              <option value="passphrase">{t.passphrase}</option>
            </select>
          </label>
          {mode === "password" ? (
            <>
              <label className="mt-4 block text-xs font-semibold text-[var(--vt-text-2)]">
                {t.length}
                <input
                  type="number"
                  aria-label={t.length}
                  min={4}
                  max={256}
                  value={passwordOptions.length}
                  onChange={(event) => {
                    setPasswordOptions((current) => ({
                      ...current,
                      length: Number(event.target.value),
                    }));
                    clearResult();
                  }}
                  className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 font-mono text-sm text-[var(--vt-text)]"
                />
              </label>
              <div className="mt-4 space-y-2">
                {passwordToggle("uppercase", t.uppercase)}
                {passwordToggle("lowercase", t.lowercase)}
                {passwordToggle("digits", t.digits)}
                {passwordToggle("symbols", t.symbols)}
                {passwordToggle("excludeAmbiguous", t.ambiguous)}
              </div>
            </>
          ) : (
            <>
              <label className="mt-4 block text-xs font-semibold text-[var(--vt-text-2)]">
                {t.words}
                <input
                  type="number"
                  aria-label={t.words}
                  min={3}
                  max={20}
                  value={phraseOptions.words}
                  onChange={(event) => {
                    setPhraseOptions((current) => ({
                      ...current,
                      words: Number(event.target.value),
                    }));
                    clearResult();
                  }}
                  className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 font-mono text-sm text-[var(--vt-text)]"
                />
              </label>
              <p className="mt-2 text-xs leading-5 text-[var(--vt-text-3)]">
                {t.wordlist}
              </p>
              <label className="mt-4 block text-xs font-semibold text-[var(--vt-text-2)]">
                {t.separator}
                <input
                  aria-label={t.separator}
                  value={phraseOptions.separator}
                  maxLength={3}
                  onChange={(event) => {
                    setPhraseOptions((current) => ({
                      ...current,
                      separator: event.target.value,
                    }));
                    clearResult();
                  }}
                  className="mt-1.5 w-full rounded-lg border border-[var(--vt-border)] bg-[var(--vt-bg-0)] px-3 py-2 font-mono text-sm text-[var(--vt-text)]"
                />
              </label>
              <div className="mt-4 space-y-2">
                {(
                  [
                    ["capitalize", t.capitalize],
                    ["includeNumber", t.number],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 text-sm text-[var(--vt-text)]"
                  >
                    <input
                      type="checkbox"
                      checked={phraseOptions[key]}
                      onChange={(event) => {
                        setPhraseOptions((current) => ({
                          ...current,
                          [key]: event.target.checked,
                        }));
                        clearResult();
                      }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </>
          )}
          <button
            type="button"
            aria-label={
              mode === "password" ? t.generatePassword : t.generatePassphrase
            }
            onClick={generate}
            className="mt-4 w-full rounded-lg bg-[var(--vt-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--vt-accent-ink)]"
          >
            {mode === "password" ? t.generatePassword : t.generatePassphrase}
          </button>
        </ToolPanel>
        <ToolPanel title={t.result}>
          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-[var(--vt-red)]/40 bg-[var(--vt-red)]/10 p-3 font-mono text-xs text-[var(--vt-red)]"
            >
              {t.errors[error]}
            </p>
          ) : (
            <ToolOutput label={t.result} value={secret} emptyLabel={t.empty} />
          )}
          <p className="mt-3 text-sm text-[var(--vt-text)]">
            {t.entropy}: <strong>{entropy.toFixed(1)} bits</strong>
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--vt-text-3)]">
            {t.entropyDisclosure}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <CopyButton
              key={secret}
              value={secret}
              label={t.copy}
              copiedLabel={t.copied}
              failedLabel={t.copyFailed}
            />
            <button
              type="button"
              aria-label={t.clear}
              disabled={!secret}
              onClick={clearResult}
              className="rounded-lg border border-[var(--vt-border-2)] px-3 py-2 text-xs font-semibold text-[var(--vt-text)] disabled:opacity-50"
            >
              {t.clear}
            </button>
          </div>
        </ToolPanel>
      </div>
    </ToolWorkspace>
  );
}
