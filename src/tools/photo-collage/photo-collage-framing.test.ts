import { describe, expect, it } from "vitest";

import {
  RESET_IMAGE_TRANSFORM,
  panImageTransform,
  pinchImageTransform,
  previewImagePlacement,
} from "./photo-collage-framing";
import { fillSourceRectWithCrop } from "./collage";

describe("photo collage direct framing math", () => {
  it("moves the content with a one-pointer pan and clamps the focal axes", () => {
    expect(
      panImageTransform({
        transform: { zoom: 1, focalX: 0.5, focalY: 0.5 },
        sourceWidth: 1200,
        sourceHeight: 800,
        viewportWidth: 400,
        viewportHeight: 400,
        deltaX: 100,
        deltaY: 100,
      }),
    ).toEqual({ zoom: 1, focalX: 0, focalY: 0.5 });
  });

  it("zooms around the pinch midpoint and clamps zoom to 100–300 percent", () => {
    expect(
      pinchImageTransform({
        transform: { zoom: 1, focalX: 0.5, focalY: 0.5 },
        sourceWidth: 1200,
        sourceHeight: 800,
        viewportWidth: 400,
        viewportHeight: 400,
        startDistance: 100,
        currentDistance: 200,
        midpointX: 100,
        midpointY: 200,
      }),
    ).toEqual({ zoom: 2, focalX: 0.375, focalY: 0.5 });

    expect(
      pinchImageTransform({
        transform: { zoom: 2, focalX: 0.5, focalY: 0.5 },
        sourceWidth: 1200,
        sourceHeight: 800,
        viewportWidth: 400,
        viewportHeight: 400,
        startDistance: 100,
        currentDistance: 1000,
        midpointX: 200,
        midpointY: 200,
      }).zoom,
    ).toBe(3);
  });

  it("places the preview from the same source crop used by export", () => {
    const transform = { zoom: 1.8, focalX: 0.7, focalY: 0.25 };
    const crop = fillSourceRectWithCrop(
      1600,
      900,
      400,
      300,
      transform.zoom,
      transform.focalX,
      transform.focalY,
    );
    const placement = previewImagePlacement({
      transform,
      sourceWidth: 1600,
      sourceHeight: 900,
      viewportWidth: 400,
      viewportHeight: 300,
    });
    const scale = placement.width / 1600;

    expect(-placement.left / scale).toBeCloseTo(crop.x);
    expect(-placement.top / scale).toBeCloseTo(crop.y);
    expect(400 / scale).toBeCloseTo(crop.width);
    expect(300 / scale).toBeCloseTo(crop.height);
    expect(RESET_IMAGE_TRANSFORM).toEqual({
      zoom: 1,
      focalX: 0.5,
      focalY: 0.5,
    });
  });
});
