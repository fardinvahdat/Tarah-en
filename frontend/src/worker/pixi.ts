import { Application, Texture, Sprite, Filter } from "@pixi/webworker";
import {
  GlowFilter,
  ColorOverlayFilter,
  ColorGradientFilter,
  BevelFilter,
  EmbossFilter,
} from "pixi-filters";
import {
  PixiFilter,
  PixiGlowFilter,
  PixiColorOverlayFilter,
  PixiColorGradientFilter,
  PixiBevelFilter,
  PixiEmbossFilter,
} from "@/types/pixiFilter";

// Fix deprecation warning
const setDefaultFilterResolution = (resolution: number) => {
  if (
    typeof Filter !== "undefined" &&
    Filter.defaultResolution !== resolution
  ) {
    Filter.defaultResolution = resolution;
  }
};

const MAX_DIMENSION = 2048; // Prevent huge images
let app: Application | undefined = undefined;

// Cleanup resources
const cleanup = () => {
  if (!app) return;

  // Destroy all children
  app.stage.removeChildren().forEach((child) => {
    if (child instanceof Sprite) {
      if (child.texture) {
        child.texture.destroy(true);
      }
      child.destroy({ children: true });
    }
  });

  // Clear renderer
  app.renderer.clear();
};

self.onmessage = async (e) => {
  const { type } = e.data;

  // Initial setup
  if (type === "init") {
    try {
      const { width, height, resolution, view } = e.data;

      // Fix deprecation warning
      setDefaultFilterResolution(resolution);

      app = new Application<HTMLCanvasElement>({
        width,
        height,
        resolution,
        view,
        backgroundAlpha: 0, // Transparent background
      });
    } catch (error) {
      postMessage({ error: "Pixi initialization failed" });
    }
    return;
  }

  // Termination request
  if (type === "terminate") {
    cleanup();
    if (app) {
      app.destroy(true, {
        children: true,
        texture: true,
        baseTexture: true,
      });
      app = undefined;
    }
    return;
  }

  // Safety checks
  if (!app) {
    postMessage({ error: "Pixi not initialized" });
    return;
  }

  // Size validation
  if (
    (type === "filter" || type === "mask") &&
    (e.data.width > MAX_DIMENSION || e.data.height > MAX_DIMENSION)
  ) {
    postMessage({
      error: `Image too large (${e.data.width}x${e.data.height})`,
      id: e.data.id,
    });
    return;
  }

  // Filter processing
  if (type === "filter") {
    try {
      const { src, pixiFilters, width, height, id } = e.data;
      cleanup();
      app.renderer.resize(width, height);

      const texture = await Texture.fromURL(src, { skipCache: true });
      const sprite = new Sprite(texture);
      sprite.filters = [];

      const imagefilters = JSON.parse(pixiFilters) as PixiFilter[];
      for (const ele of imagefilters) {
        if (ele.type === "GlowFilter") {
          handleGlowFilter(ele as PixiGlowFilter, sprite.filters);
        } else if (ele.type === "ColorOverlayFilter") {
          handleColorOverlayFilter(
            ele as PixiColorOverlayFilter,
            sprite.filters
          );
        } else if (ele.type === "ColorGradientFilter") {
          handleColorGradientFilter(
            ele as PixiColorGradientFilter,
            sprite.filters
          );
        } else if (ele.type === "BevelFilter") {
          handleBevelFilter(ele as PixiBevelFilter, sprite.filters);
        } else if (ele.type === "EmbossFilter") {
          handleEmbossFilter(ele as PixiEmbossFilter, sprite.filters);
        }
      }

      app.stage.addChild(sprite);
      const res = await app.renderer.plugins.extract.base64(sprite);
      cleanup();
      postMessage({ res, id });
    } catch (error) {
      postMessage({ error: "Filter processing failed", id: e.data.id });
    }
  }
  // Mask processing
  else if (type === "mask") {
    try {
      const { id, width, height, mask, src } = e.data;
      cleanup();
      app.renderer.resize(width, height);

      const textureLayer = await Texture.fromURL(src, { skipCache: true });
      const spriteLayer = new Sprite(textureLayer);

      const maskData = JSON.parse(mask);
      const textureMask = await Texture.fromURL(maskData.src, {
        skipCache: true,
      });
      const spriteMask = new Sprite(textureMask);

      app.stage.addChild(spriteMask);
      spriteLayer.mask = spriteMask;
      app.stage.addChild(spriteLayer);

      const res = await app.renderer.plugins.extract.base64(spriteLayer);
      cleanup();
      postMessage({ res, id });
    } catch (error) {
      postMessage({ error: "Mask processing failed", id: e.data.id });
    }
  }
};

const handleGlowFilter = (item: PixiGlowFilter, filters: Filter[]) => {
  filters.push(
    new GlowFilter({
      distance: 15,
      outerStrength: 2,
      innerStrength: 2,
      color: item.color,
      alpha: item.alpha,
    })
  );
};

const handleColorOverlayFilter = (
  item: PixiColorOverlayFilter,
  filters: Filter[]
) => {
  filters.push(new ColorOverlayFilter(item.color, item.alpha));
};

const handleColorGradientFilter = (
  item: PixiColorGradientFilter,
  filters: Filter[]
) => {
  filters.push(
    new ColorGradientFilter({
      type: item.gradientType,
      angle: item.angle,
      alpha: item.alpha,
      maxColors: item.maxColors,
      stops: item.stops,
    })
  );
};

const handleBevelFilter = (item: PixiBevelFilter, filters: Filter[]) => {
  filters.push(
    new BevelFilter({
      lightAlpha: item.lightAlpha,
      lightColor: item.lightColor,
      rotation: item.rotation,
      shadowColor: item.shadowColor,
      thickness: item.thickness,
    })
  );
};

const handleEmbossFilter = (item: PixiEmbossFilter, filters: Filter[]) => {
  filters.push(new EmbossFilter(item.strength));
};
