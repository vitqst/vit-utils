import { describe, expect, it } from "vitest";

import { generateMetaTags, validateMetaInput } from "./meta";

const metadata = {
  title: 'Vịt & "Tools"',
  description: "Private <browser> utilities",
  url: "https://example.com/tools",
  image: "https://example.com/og.png",
  siteName: "Vịt Tools",
  type: "website",
  locale: "vi_VN",
  robots: "index,follow",
  twitterCard: "summary_large_image",
} as const;

describe("meta tag generation", () => {
  it("escapes values and emits standard, Open Graph, and Twitter tags", () => {
    const output = generateMetaTags(metadata);

    expect(output).toContain("<title>Vịt &amp; &quot;Tools&quot;</title>");
    expect(output).toContain(
      '<link rel="canonical" href="https://example.com/tools">',
    );
    expect(output).toContain('property="og:title"');
    expect(output).toContain('name="twitter:card"');
    expect(output).toContain("Private &lt;browser&gt; utilities");
  });

  it("omits optional empty tags without emitting undefined", () => {
    const output = generateMetaTags({
      ...metadata,
      image: "",
      siteName: "",
    });
    expect(output).not.toContain("og:image");
    expect(output).not.toContain("og:site_name");
    expect(output).not.toContain("undefined");
  });

  it("validates title and optional HTTP URLs", () => {
    expect(validateMetaInput(metadata)).toEqual(metadata);
    expect(() => validateMetaInput({ ...metadata, title: "" })).toThrow(
      /title/i,
    );
    expect(() =>
      validateMetaInput({ ...metadata, image: "javascript:alert(1)" }),
    ).toThrow(/HTTP/i);
  });
});

