import type { Locale } from "../../registry/types";

const labels = {
  en: ["Very weak", "Weak", "Fair", "Strong", "Very strong"],
  vi: ["Rất yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"],
} as const;

export function scoreLabel(score: number, locale: Locale) {
  return labels[locale][Math.max(0, Math.min(4, Math.round(score)))];
}

export function localizedStrengthSuggestions(score: number, locale: Locale) {
  if (score >= 4) {
    return locale === "vi"
      ? ["Hãy dùng mật khẩu này riêng cho một tài khoản."]
      : ["Keep this password unique to one account."];
  }
  return locale === "vi"
    ? [
        "Dùng mật khẩu dài hơn hoặc nhiều từ ngẫu nhiên hơn.",
        "Tránh từ phổ biến, thông tin cá nhân và chuỗi bàn phím.",
        "Dùng mật khẩu riêng cho từng tài khoản.",
      ]
    : [
        "Use a longer password or more random words.",
        "Avoid common words, personal details, and keyboard sequences.",
        "Use a unique password for every account.",
      ];
}

export function validateStrengthPassword(password: string) {
  const length = Array.from(password).length;
  if (!length) throw new Error("Enter a password to evaluate.");
  if (length > 256) throw new Error("Password must be 256 characters or fewer.");
  return password;
}

