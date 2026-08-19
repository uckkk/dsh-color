// dsh-color — 颜色工具（DeepSeek Harness）。
// hex / rgb / hsl 互转，计算补色、明暗与对比度。纯 Node。
import { defineTool } from "@deepseek-ai/dsh-tools";

const name = "颜色工具";
const inject = ["tools"];

function parseColor(input) {
  const s = String(input).trim().toLowerCase();
  let r, g, b;
  // hex
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/.exec(s);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    r = parseInt(h.slice(0, 2), 16); g = parseInt(h.slice(2, 4), 16); b = parseInt(h.slice(4, 6), 16);
  } else {
    const rgb = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(s);
    if (rgb) { r = +rgb[1]; g = +rgb[2]; b = +rgb[3]; }
    else {
      const hsl = /^hsla?\(\s*(\d+)[,\s]+(\d+)%[,\s]+(\d+)%/.exec(s);
      if (hsl) { [r, g, b] = hslToRgb(+hsl[1], +hsl[2], +hsl[3]); }
    }
  }
  if (r === undefined || [r, g, b].some((v) => v < 0 || v > 255)) throw new Error(`无法解析颜色：${input}`);
  return [r, g, b];
}

function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function toHex(r, g, b) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function luminance(r, g, b) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function contrast(r1, g1, b1, r2, g2, b2) {
  const l1 = luminance(r1, g1, b1), l2 = luminance(r2, g2, b2);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}

async function apply(ctx, _config) {
  ctx.tools.register(defineTool({
    name: "color_convert",
    description:
      "颜色转换：把颜色（hex 如 #3b82f6、rgb 如 rgb(59,130,246)、hsl）转换为 hex/rgb/hsl 三种表示，并给出补色、明暗（适合白字/黑字）、与黑白的前景对比度。用于前端配色。`color` 传颜色值。",
    parameters: {
      color: { type: "string", required: true, description: "颜色值（#hex / rgb() / hsl()）。" },
    },
    output: {
      schema: {
        type: "object", additionalProperties: false,
        properties: {
          hex: { type: "string", required: true },
          rgb: { type: "string", required: true },
          hsl: { type: "string", required: true },
          complementary: { type: "string", required: true },
          isLight: { type: "boolean", required: true },
          bestTextColor: { type: "string", required: true },
          contrastVsWhite: { type: "number", required: true },
          contrastVsBlack: { type: "number", required: true },
        },
      },
      render: (_args, value) => [{
        type: "text",
        text: `${value.hex} = ${value.rgb} = ${value.hsl}\n补色：${value.complementary}\n${value.isLight ? "浅色" : "深色"}背景，建议文字用 ${value.bestTextColor}（对比度 白 ${value.contrastVsWhite} / 黑 ${value.contrastVsBlack}）`,
      }],
    },
    execute: async (args) => {
      const [r, g, b] = parseColor(args.color);
      const [h, s, l] = rgbToHsl(r, g, b);
      const comp = toHex(255 - r, 255 - g, 255 - b);
      const isLight = luminance(r, g, b) > 0.5;
      const cWhite = contrast(r, g, b, 255, 255, 255);
      const cBlack = contrast(r, g, b, 0, 0, 0);
      return {
        hex: toHex(r, g, b),
        rgb: `rgb(${r}, ${g}, ${b})`,
        hsl: `hsl(${h}, ${s}%, ${l}%)`,
        complementary: comp,
        isLight,
        bestTextColor: cWhite >= cBlack ? "#ffffff" : "#000000",
        contrastVsWhite: cWhite,
        contrastVsBlack: cBlack,
      };
    },
  }));
}

export { apply, inject, name };
