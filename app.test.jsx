import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import App, { CullScreen, Fill, ReviewScreen, buildFromFiles } from "./app.jsx";

function makeFile(index, lastModified = index * 3000) {
  return new File(["photo"], `IMG_${String(index).padStart(5, "0")}.JPG`, {
    type: "image/jpeg",
    lastModified,
  });
}

function makeDemoPhoto(index) {
  return {
    id: `p${index}`,
    name: `IMG_${String(index).padStart(5, "0")}.JPG`,
    real: false,
    isBurst: false,
    sharp: 0.8,
    blur: 0,
    zoom: 1,
    shift: { x: 0, y: 0 },
    tilt: 0,
    exp: 1,
    scene: { a: 200, b: 220, light: 40 },
  };
}

const reviewProps = {
  t: {},
  onBack: jest.fn(),
  onRestart: jest.fn(),
  onRefine: jest.fn(),
  onSave: jest.fn(),
  onImport: jest.fn(),
  toast: jest.fn(),
  sel: null,
  onSelect: jest.fn(),
  onReclassify: jest.fn(),
  lightbox: null,
  onLightbox: jest.fn(),
};

beforeEach(() => {
  URL.createObjectURL = jest.fn(() => "blob:photo-url");
  URL.revokeObjectURL = jest.fn();
  delete window.showDirectoryPicker;
  delete window.createImageBitmap;
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("Choose a folder uses the native directory picker and includes nested files", async () => {
  const rootFile = makeFile(1);
  const nestedFile = makeFile(2);
  const fileHandle = (file) => ({
    kind: "file",
    name: file.name,
    getFile: jest.fn().mockResolvedValue(file),
  });
  const directoryHandle = (name, entries) => ({
    kind: "directory",
    name,
    async *values() {
      yield* entries;
    },
  });
  window.showDirectoryPicker = jest.fn().mockResolvedValue(
    directoryHandle("wedding-shoot", [
      fileHandle(rootFile),
      directoryHandle("portraits", [fileHandle(nestedFile)]),
    ]),
  );

  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: /choose a folder/i }));

  await waitFor(() => expect(window.showDirectoryPicker).toHaveBeenCalledTimes(1));
  expect(await screen.findByText("wedding-shoot")).toBeInTheDocument();
  expect(screen.getByText(/\/ 2 judged/)).toBeInTheDocument();
});

test("buildFromFiles parses 5,000 files without creating blob URLs", () => {
  const files = Array.from({ length: 5000 }, (_, index) => makeFile(index));

  const photos = buildFromFiles(files);

  expect(photos).toHaveLength(5000);
  expect(photos[0]).toMatchObject({
    id: "r0",
    real: true,
    file: files[0],
    name: files[0].name,
    burst: 0,
    frame: 0,
    frames: 1,
    isBurst: false,
  });
  expect(photos[0]).not.toHaveProperty("url");
  expect(URL.createObjectURL).not.toHaveBeenCalled();
});

test("buildFromFiles splits same-timestamp photos into bounded bursts", () => {
  const files = Array.from({ length: 100 }, (_, index) => makeFile(index, 1000));

  const photos = buildFromFiles(files);

  expect(Math.max(...photos.map((photo) => photo.frames))).toBeLessThanOrEqual(20);
  expect(new Set(photos.map((photo) => photo.burst)).size).toBeGreaterThan(1);
});

test("Fill creates one blob URL when a real photo mounts", () => {
  const file = makeFile(1);

  const { getByRole } = render(
    <Fill p={{ real: true, file, name: file.name }} />,
  );

  expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  expect(URL.createObjectURL).toHaveBeenCalledWith(file);
  expect(getByRole("img")).toHaveAttribute("src", "blob:photo-url");
  expect(getByRole("img")).toHaveAttribute("loading", "lazy");
});

test("Fill revokes its blob URL exactly once when it unmounts", () => {
  const file = makeFile(2);
  const { unmount } = render(
    <Fill p={{ real: true, file, name: file.name }} />,
  );

  unmount();

  expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:photo-url");
});

test("ReviewScreen virtualizes a 5,000-photo grid", () => {
  const photos = Array.from({ length: 5000 }, (_, index) => makeDemoPhoto(index));
  const decisions = Object.fromEntries(photos.map((photo) => [photo.id, "keep"]));

  const { container } = render(
    <ReviewScreen photos={photos} decisions={decisions} {...reviewProps} />,
  );

  expect(container.querySelectorAll(".gcard").length).toBeLessThan(50);
});

test("ReviewScreen lightbox contains the full image inside the popup", () => {
  const file = makeFile(1);
  const photo = {
    ...makeDemoPhoto(1),
    real: true,
    file,
  };

  const { container } = render(
    <ReviewScreen photos={[photo]} decisions={{ [photo.id]: "keep" }}
      {...reviewProps} lightbox={photo.id} />,
  );

  const lightboxImage = container.querySelector(".lb-card img");
  expect(lightboxImage).toHaveStyle({ objectFit: "contain" });
  expect(lightboxImage.parentElement).toHaveClass("lb-fill");
});

test.each(["keep", "reject"])("ReviewScreen lightbox advances after %s", (verdict) => {
  const photos = [makeDemoPhoto(1), makeDemoPhoto(2)];
  const onReclassify = jest.fn();
  const onLightbox = jest.fn();
  const { container } = render(
    <ReviewScreen photos={photos} decisions={{ p1: "keep", p2: "keep" }}
      {...reviewProps} lightbox={photos[0].id}
      onReclassify={onReclassify} onLightbox={onLightbox} />,
  );

  fireEvent.click(container.querySelector(`.lb-actions .act.${verdict}`));

  expect(onReclassify).toHaveBeenCalledWith(photos[0].id, verdict);
  expect(onLightbox).toHaveBeenCalledWith(photos[1].id);
});

test("ReviewScreen card actions are not revealed by selection", () => {
  const styles = document.getElementById("app-styles").textContent;

  expect(styles).toContain(".gcard:hover .qa {");
  expect(styles).not.toContain(".gcard.sel .qa");
});

test("CullScreen renders only a small window of a large burst filmstrip", () => {
  const photos = Array.from({ length: 100 }, (_, index) => ({
    ...makeDemoPhoto(index),
    burst: 0,
    burstName: "burst 1",
    frame: index,
    frames: 100,
    isBurst: true,
  }));

  const { container } = render(
    <CullScreen queue={photos} allPhotos={photos} cursor={50} decisions={{}} leaving={null}
      t={{ strip: true, _folder: "shoot" }} passLabel={null} onDecide={jest.fn()}
      onUndo={jest.fn()} onReview={jest.fn()} sheet={false} onSheet={jest.fn()} />,
  );

  expect(container.querySelectorAll(".tn").length).toBeLessThanOrEqual(9);
});

test("CullScreen reuses the preloaded next image when it becomes current", () => {
  const photos = [0, 1].map((index) => ({
    ...makeDemoPhoto(index),
    real: true,
    file: makeFile(index),
    burst: index,
  }));
  const props = {
    queue: photos,
    allPhotos: photos,
    decisions: {},
    t: { strip: false, _folder: "shoot" },
    passLabel: null,
    onDecide: jest.fn(),
    onUndo: jest.fn(),
    onReview: jest.fn(),
    sheet: false,
    onSheet: jest.fn(),
  };
  const { rerender } = render(
    <CullScreen {...props} cursor={0} leaving={null} />,
  );
  expect(URL.createObjectURL).toHaveBeenCalledTimes(2);

  rerender(
    <CullScreen {...props} cursor={1} leaving={{ photo: photos[0], dir: "keep" }} />,
  );

  expect(URL.createObjectURL).toHaveBeenCalledTimes(2);
});

test("ReviewScreen limits large-file thumbnail decoding to two concurrent jobs", async () => {
  const pending = [];
  window.createImageBitmap = jest.fn(() => new Promise((resolve) => pending.push(resolve)));
  jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage: jest.fn() });
  const photos = Array.from({ length: 100 }, (_, index) => ({
    ...makeDemoPhoto(index),
    real: true,
    file: makeFile(index),
  }));
  const decisions = Object.fromEntries(photos.map((photo) => [photo.id, "keep"]));

  const { unmount } = render(
    <ReviewScreen photos={photos} decisions={decisions} {...reviewProps} />,
  );

  expect(window.createImageBitmap).toHaveBeenCalledTimes(2);
  expect(URL.createObjectURL).not.toHaveBeenCalled();

  unmount();
  await act(async () => {
    pending.forEach((resolve) => resolve({ width: 480, height: 320, close: jest.fn() }));
    await Promise.resolve();
  });
});

test("Fill reuses a decoded thumbnail after it scrolls out and back into view", async () => {
  const file = makeFile(101);
  const photo = { real: true, file, name: file.name };
  const bitmap = { width: 480, height: 320, close: jest.fn() };
  const drawImage = jest.fn();
  window.createImageBitmap = jest.fn().mockResolvedValue(bitmap);
  jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage });

  const firstRender = render(
    <Fill p={photo} previewWidth={480} previewHeight={320} />,
  );
  await waitFor(() => expect(drawImage).toHaveBeenCalledTimes(1));
  firstRender.unmount();

  render(<Fill p={photo} previewWidth={480} previewHeight={320} />);

  await waitFor(() => expect(drawImage).toHaveBeenCalledTimes(2));
  expect(window.createImageBitmap).toHaveBeenCalledTimes(1);
  expect(bitmap.close).not.toHaveBeenCalled();
});

test("Fill bounds the decoded thumbnail cache while retaining recent images", async () => {
  const photos = Array.from({ length: 200 }, (_, index) => {
    const file = makeFile(index + 200);
    return { real: true, file, name: file.name };
  });
  const bitmaps = [];
  const drawImage = jest.fn();
  window.createImageBitmap = jest.fn(() => {
    const bitmap = { width: 480, height: 320, close: jest.fn() };
    bitmaps.push(bitmap);
    return Promise.resolve(bitmap);
  });
  jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage });

  const gallery = render(
    <>{photos.map((photo) => (
      <Fill key={photo.name} p={photo} previewWidth={480} previewHeight={320} />
    ))}</>,
  );
  await waitFor(() => expect(drawImage).toHaveBeenCalledTimes(200));
  gallery.unmount();

  const recentPhoto = render(
    <Fill p={photos.at(-1)} previewWidth={480} previewHeight={320} />,
  );
  await waitFor(() => expect(drawImage).toHaveBeenCalledTimes(201));
  expect(window.createImageBitmap).toHaveBeenCalledTimes(200);
  recentPhoto.unmount();

  render(<Fill p={photos[0]} previewWidth={480} previewHeight={320} />);
  await waitFor(() => expect(window.createImageBitmap).toHaveBeenCalledTimes(201));
  expect(bitmaps.some((bitmap) => bitmap.close.mock.calls.length > 0)).toBe(true);
});
