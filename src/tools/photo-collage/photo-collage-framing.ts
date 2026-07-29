import { fillSourceRectWithCrop } from "./collage";

export type ImageTransform = {
  zoom: number;
  focalX: number;
  focalY: number;
};

export const RESET_IMAGE_TRANSFORM: ImageTransform = {
  zoom: 1,
  focalX: 0.5,
  focalY: 0.5,
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

function focalForCropStart(
  cropStart: number,
  sourceSize: number,
  cropSize: number,
  fallback: number,
) {
  const available = sourceSize - cropSize;
  return available > 0 ? clamp(cropStart / available, 0, 1) : fallback;
}

type FramingGeometry = {
  transform: ImageTransform;
  sourceWidth: number;
  sourceHeight: number;
  viewportWidth: number;
  viewportHeight: number;
};

export function panImageTransform({
  deltaX,
  deltaY,
  ...geometry
}: FramingGeometry & { deltaX: number; deltaY: number }): ImageTransform {
  const crop = fillSourceRectWithCrop(
    geometry.sourceWidth,
    geometry.sourceHeight,
    geometry.viewportWidth,
    geometry.viewportHeight,
    geometry.transform.zoom,
    geometry.transform.focalX,
    geometry.transform.focalY,
  );
  const scaleX = geometry.viewportWidth / crop.width;
  const scaleY = geometry.viewportHeight / crop.height;
  return {
    zoom: geometry.transform.zoom,
    focalX: focalForCropStart(
      crop.x - deltaX / scaleX,
      geometry.sourceWidth,
      crop.width,
      geometry.transform.focalX,
    ),
    focalY: focalForCropStart(
      crop.y - deltaY / scaleY,
      geometry.sourceHeight,
      crop.height,
      geometry.transform.focalY,
    ),
  };
}

export function pinchImageTransform({
  startDistance,
  currentDistance,
  midpointX,
  midpointY,
  ...geometry
}: FramingGeometry & {
  startDistance: number;
  currentDistance: number;
  midpointX: number;
  midpointY: number;
}): ImageTransform {
  const nextZoom = clamp(
    geometry.transform.zoom *
      (startDistance > 0 ? currentDistance / startDistance : 1),
    1,
    3,
  );
  const currentCrop = fillSourceRectWithCrop(
    geometry.sourceWidth,
    geometry.sourceHeight,
    geometry.viewportWidth,
    geometry.viewportHeight,
    geometry.transform.zoom,
    geometry.transform.focalX,
    geometry.transform.focalY,
  );
  const nextCrop = fillSourceRectWithCrop(
    geometry.sourceWidth,
    geometry.sourceHeight,
    geometry.viewportWidth,
    geometry.viewportHeight,
    nextZoom,
    geometry.transform.focalX,
    geometry.transform.focalY,
  );
  const anchorX = clamp(midpointX / geometry.viewportWidth, 0, 1);
  const anchorY = clamp(midpointY / geometry.viewportHeight, 0, 1);
  const sourceAnchorX = currentCrop.x + currentCrop.width * anchorX;
  const sourceAnchorY = currentCrop.y + currentCrop.height * anchorY;
  return {
    zoom: nextZoom,
    focalX: focalForCropStart(
      sourceAnchorX - nextCrop.width * anchorX,
      geometry.sourceWidth,
      nextCrop.width,
      geometry.transform.focalX,
    ),
    focalY: focalForCropStart(
      sourceAnchorY - nextCrop.height * anchorY,
      geometry.sourceHeight,
      nextCrop.height,
      geometry.transform.focalY,
    ),
  };
}

export function previewImagePlacement(geometry: FramingGeometry) {
  const crop = fillSourceRectWithCrop(
    geometry.sourceWidth,
    geometry.sourceHeight,
    geometry.viewportWidth,
    geometry.viewportHeight,
    geometry.transform.zoom,
    geometry.transform.focalX,
    geometry.transform.focalY,
  );
  const scale = geometry.viewportWidth / crop.width;
  return {
    left: -crop.x * scale,
    top: -crop.y * scale,
    width: geometry.sourceWidth * scale,
    height: geometry.sourceHeight * scale,
  };
}
