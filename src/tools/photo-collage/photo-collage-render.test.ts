import { describe, expect, it, vi } from "vitest";

import {
  CollageCancelledError,
  renderCollage,
} from "./photo-collage-render";

describe("photo collage renderer", () => {
  it("draws ordered images and closes every decoded bitmap", async () => {
    const drawImage = vi.fn();
    const fillRect = vi.fn();
    const convertToBlob = vi
      .fn()
      .mockResolvedValue(new Blob(["rendered"], { type: "image/png" }));
    const bitmaps = [
      { width: 400, height: 200, close: vi.fn() },
      { width: 200, height: 400, close: vi.fn() },
    ];
    const createBitmap = vi
      .fn()
      .mockResolvedValueOnce(bitmaps[0])
      .mockResolvedValueOnce(bitmaps[1]);

    const result = await renderCollage(
      {
        images: [
          {
            name: "wide.png",
            type: "image/png",
            bytes: new Uint8Array([1]).buffer,
          },
          {
            name: "tall.png",
            type: "image/png",
            bytes: new Uint8Array([2]).buffer,
          },
        ],
        settings: {
          layout: "horizontal",
          fit: "fill",
          gap: 0,
          background: "#ffffff",
          width: 600,
          format: "image/png",
        },
      },
      {
        createBitmap,
        createCanvas: vi.fn().mockReturnValue({
          getContext: () => ({ drawImage, fillRect, fillStyle: "" }),
          convertToBlob,
        }),
      },
      () => false,
    );

    expect(result).toMatchObject({ width: 600, height: 300 });
    expect(fillRect).toHaveBeenCalledWith(0, 0, 600, 300);
    expect(drawImage).toHaveBeenNthCalledWith(
      1,
      bitmaps[0],
      100,
      0,
      200,
      200,
      0,
      0,
      300,
      300,
    );
    expect(drawImage).toHaveBeenCalledTimes(2);
    expect(convertToBlob).toHaveBeenCalledWith({
      type: "image/png",
      quality: 0.9,
    });
    expect(bitmaps[0].close).toHaveBeenCalled();
    expect(bitmaps[1].close).toHaveBeenCalled();
  });

  it("checks cancellation between decodes and closes completed bitmaps", async () => {
    const bitmap = { width: 100, height: 100, close: vi.fn() };
    let checks = 0;

    await expect(
      renderCollage(
        {
          images: [
            {
              name: "one.png",
              type: "image/png",
              bytes: new Uint8Array([1]).buffer,
            },
            {
              name: "two.png",
              type: "image/png",
              bytes: new Uint8Array([2]).buffer,
            },
          ],
          settings: {
            layout: "grid",
            fit: "fit",
            gap: 16,
            background: "#000000",
            width: 800,
            format: "image/jpeg",
          },
        },
        {
          createBitmap: vi.fn().mockResolvedValue(bitmap),
          createCanvas: vi.fn(),
        },
        () => {
          checks += 1;
          return checks > 1;
        },
      ),
    ).rejects.toBeInstanceOf(CollageCancelledError);
    expect(bitmap.close).toHaveBeenCalled();
  });

  it("renders an aspect template with rounded cells and per-photo crop settings", async () => {
    const drawImage = vi.fn();
    const save = vi.fn();
    const restore = vi.fn();
    const beginPath = vi.fn();
    const roundRect = vi.fn();
    const clip = vi.fn();
    const bitmap = { width: 400, height: 200, close: vi.fn() };
    const createCanvas = vi.fn().mockReturnValue({
      getContext: () => ({
        drawImage,
        fillRect: vi.fn(),
        fillStyle: "",
        save,
        restore,
        beginPath,
        roundRect,
        clip,
      }),
      convertToBlob: vi
        .fn()
        .mockResolvedValue(new Blob(["rendered"], { type: "image/png" })),
    });

    const result = await renderCollage(
      {
        images: [
          {
            name: "one.png",
            type: "image/png",
            bytes: new Uint8Array([1]).buffer,
          },
          {
            name: "two.png",
            type: "image/png",
            bytes: new Uint8Array([2]).buffer,
          },
        ],
        settings: {
          template: {
            id: "split",
            naturalAspect: 1,
            cells: [
              { x: 0, y: 0, width: 0.5, height: 1 },
              { x: 0.5, y: 0, width: 0.5, height: 1 },
            ],
          },
          aspect: "4:5",
          fit: "fill",
          gap: 0,
          cornerRadius: 24,
          background: "#ffffff",
          width: 600,
          format: "image/png",
          imageTransforms: [
            { zoom: 2, focalX: 1, focalY: 0 },
            { zoom: 1, focalX: 0.5, focalY: 0.5 },
          ],
        },
      },
      {
        createBitmap: vi.fn().mockResolvedValue(bitmap),
        createCanvas,
      },
      () => false,
    );

    expect(result).toMatchObject({ width: 600, height: 750 });
    expect(createCanvas).toHaveBeenCalledWith(600, 750);
    expect(roundRect).toHaveBeenNthCalledWith(1, 0, 0, 300, 750, 24);
    expect(save).toHaveBeenCalledTimes(2);
    expect(clip).toHaveBeenCalledTimes(2);
    expect(restore).toHaveBeenCalledTimes(2);
    expect(drawImage).toHaveBeenNthCalledWith(
      1,
      bitmap,
      360,
      0,
      40,
      100,
      0,
      0,
      300,
      750,
    );
  });

  it("fails explicitly when rounded clipping is unavailable", async () => {
    const bitmap = { width: 100, height: 100, close: vi.fn() };

    await expect(
      renderCollage(
        {
          images: [
            {
              name: "one.png",
              type: "image/png",
              bytes: new Uint8Array([1]).buffer,
            },
            {
              name: "two.png",
              type: "image/png",
              bytes: new Uint8Array([2]).buffer,
            },
          ],
          settings: {
            template: {
              id: "split",
              naturalAspect: 1,
              cells: [
                { x: 0, y: 0, width: 0.5, height: 1 },
                { x: 0.5, y: 0, width: 0.5, height: 1 },
              ],
            },
            aspect: "1:1",
            fit: "fill",
            gap: 0,
            cornerRadius: 8,
            background: "#ffffff",
            width: 600,
            format: "image/png",
          },
        },
        {
          createBitmap: vi.fn().mockResolvedValue(bitmap),
          createCanvas: vi.fn().mockReturnValue({
            getContext: () => ({
              drawImage: vi.fn(),
              fillRect: vi.fn(),
              fillStyle: "",
            }),
            convertToBlob: vi.fn(),
          }),
        },
        () => false,
      ),
    ).rejects.toThrow("Rounded corners are unavailable");
    expect(bitmap.close).toHaveBeenCalled();
  });
});
