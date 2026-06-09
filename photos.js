/* Demo photo dataset for the culling prototype.
   Each "photo" is a CSS-rendered placeholder — an honest stand-in for a real frame.
   Bursts are runs of near-identical frames with slight sharpness variation, so the
   core job (pick the sharp one, drop the rest) reads visually without real images. */

// Scenes: a duotone pair + a light angle. Each burst belongs to one scene.
const SCENES = [
    { name: "harbour",   a: 212, b: 196, light: 18 },
    { name: "field",     a: 92,  b: 46,  light: 140 },
    { name: "portrait",  a: 28,  b: 8,   light: 200 },
    { name: "alley",     a: 268, b: 232, light: 320 },
    { name: "ridge",     a: 198, b: 250, light: 70 },
    { name: "market",    a: 38,  b: 14,  light: 250 },
    { name: "shoreline", a: 178, b: 208, light: 30 },
    { name: "studio",    a: 322, b: 286, light: 160 },
  ];

  // Burst plan: [frameCount]. 1 = a single (non-burst) shot.
  const PLAN = [5, 1, 7, 3, 1, 6, 4, 1, 5, 2];

  function rng(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  }

  function build() {
    const photos = [];
    let counter = 431; // DSC_0431.JPG ...
    PLAN.forEach((count, b) => {
      const scene = SCENES[b % SCENES.length];
      const r = rng((b + 1) * 7919);
      // Within a burst, exactly one frame is the "keeper" (sharpest).
      const keeper = Math.floor(r() * count);
      for (let f = 0; f < count; f++) {
        const isBurst = count > 1;
        // sharpness: keeper ~ 0.97, others fall off with a little noise
        const dist = Math.abs(f - keeper);
        const sharp = isBurst
          ? Math.max(0.28, 0.97 - dist * (0.16 + r() * 0.1) - r() * 0.06)
          : 0.8 + r() * 0.18;
        const num = counter++;
        photos.push({
          id: `${b}-${f}`,
          name: `DSC_0${num}.JPG`,
          burst: b,
          burstName: scene.name,
          frame: f,
          frames: count,
          isBurst,
          sharp: +sharp.toFixed(2),
          blur: +(Math.max(0, (1 - sharp)) * 7).toFixed(2), // px
          // tiny per-frame jitter so burst frames feel like a hand-held sequence
          shift: { x: (r() - 0.5) * 4, y: (r() - 0.5) * 4 },
          tilt: (r() - 0.5) * 1.6,
          zoom: 1 + (r() - 0.5) * 0.04,
          scene,
          // exposure jitter
          exp: 1 + (r() - 0.5) * 0.12,
        });
      }
    });
    return photos;
  }

  // Build a CSS background string for a given photo (duotone gradient "scene").
  function bgFor(p) {
    const { a, b, light } = p.scene;
    const e = p.exp;
    const L1 = Math.min(92, 70 * e);
    const L2 = Math.min(40, 26 * e);
    return (
      `radial-gradient(120% 90% at ${light}px 0%, hsl(${a} 32% ${L1}% / .95), transparent 60%),` +
      `linear-gradient(${135 + p.tilt * 8}deg, hsl(${a} 38% ${42 * e}%), hsl(${b} 30% ${L2}%)),` +
      `linear-gradient(0deg, hsl(${b} 24% 14%), hsl(${a} 26% 30%))`
    );
  }

export const PhotoData = { build, bgFor, SCENES };
