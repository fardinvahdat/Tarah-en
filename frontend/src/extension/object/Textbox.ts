import { Textbox as OriginTextbox, classRegistry, Text } from "fabric";
import { EffectItem } from "@/types/common";
import type { Abortable } from "fabric";
import { CENTER, RIGHT, LEFT, DEFAULT_SVG_FONT_SIZE } from "../constants";
import useCanvas from "@/views/Canvas/useCanvas";
import { round, throttle } from "lodash-es";
import { TSVGReviver } from "@/types/typedefs";
export class Textbox extends OriginTextbox {
  public effects?: EffectItem[];
  public options?: any;

  constructor(text: string, options?: any) {
    super(text, options);
    this.effects = options.effects;
    this.options = options;
  }

  enlargeSpaces() {
    let diffSpace,
      currentLineWidth,
      numberOfSpaces,
      accumulatedSpace,
      line,
      charBound,
      spaces;
    for (let i = 0, len = this._textLines.length; i < len; i++) {
      if (
        this.textAlign !== "justify" &&
        (i === len - 1 || this.isEndOfWrapping(i))
      ) {
        continue;
      }
      accumulatedSpace = 0;
      line = this._textLines[i];
      currentLineWidth = this.getLineWidth(i);
      if (
        currentLineWidth < this.width &&
        (spaces = this.textLines[i].split(""))
      ) {
        numberOfSpaces = spaces.length - 1;
        diffSpace = (this.width - currentLineWidth) / numberOfSpaces;
        for (let j = 0; j <= line.length; j++) {
          charBound = this.__charBounds[i][j];
          charBound.width += diffSpace;
          charBound.kernedWidth += diffSpace;
          charBound.left += accumulatedSpace;
          accumulatedSpace += diffSpace;
        }
      }
    }
  }

  renderEffects() {
    this.canvas?.renderAll();
  }

  toSVG(reviver?: TSVGReviver): string {
    const imageData = this.toDataURL();
    return `<image xlink:href="${imageData}" width="${
      this.width * this.scaleX
    }" height="${this.height * this.scaleY}" x="${this.left}" y="${
      this.top
    }"/>`;
  }

  _renderChar(
    method: "fillText" | "strokeText",
    ctx: CanvasRenderingContext2D,
    lineIndex: number,
    charIndex: number,
    _char: string,
    left: number,
    top: number
  ): void {
    if (!this.isMoving && this.effects) {
      const [canvas] = useCanvas();
      const textbox = canvas
        .getObjects()
        .filter((obj) => obj.id == this.options.id)[0];
      super._renderChar(method, ctx, lineIndex, charIndex, _char, left, top);
      this.effects.map((effect) => {
        if (effect.type == "neon") {
          const effectList = [
            {
              color: `drop-shadow(0px 0px 3px ${effect.color})`,
              opacity: 0.95,
            },
            {
              color: `drop-shadow(0px 0px 13px ${effect.color})`,
              opacity: 0.75,
            },
            {
              color: `drop-shadow(0px 0px 43px ${effect.color})`,
              opacity: 0.44,
            },
          ];
          effectList.map((layer) => {
            ctx.save();
            ctx.filter = `opacity(${layer.opacity * 100}%) ${
              layer.color
            } blur(1px)`;
            ctx.fillText(_char, left, top);
            ctx.restore();
          });
        } else if (effect.type == "glitch") {
          effect.value.map((layer) => {
            ctx.save();
            ctx.shadowColor = layer.color;
            ctx.shadowBlur = layer.blur;
            ctx.shadowOffsetX = layer.offsetX;
            ctx.shadowOffsetY = layer.offsetY;
            ctx.fillText(_char, left, top);
            ctx.restore();
          });
        } else if (effect.type == "echo") {
          effect.value.map((layer) => {
            let font = textbox.fontSize / 80;
            ctx.fillStyle = layer.color;
            // ctx.globalCompositeOperation=""
            ctx.save();
            ctx.filter = `opacity(${layer.opacity * 100}%)`;
            ctx.fillText(
              _char,
              left + layer.offsetX * font,
              top + layer.offsetY * font
            );
            ctx.restore();
          });
        } else if (effect.type == "outline") {
          effect.value.map((layer) => {
            ctx.save();
            ctx.strokeStyle = layer.color;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.lineWidth = layer.width;
            ctx.strokeText(_char, left, top);
            ctx.restore();
          });
        }
      });
    }
    super._renderChar(method, ctx, lineIndex, charIndex, _char, left, top);
  }
}

classRegistry.setClass(Textbox);
classRegistry.setSVGClass(Textbox);
