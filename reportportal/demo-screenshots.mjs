/**
 * Generator zrzutów dla seed-demo.mjs: trójka expected, actual i diff bez żadnej zależności.
 *
 * Dlaczego generujemy, a nie czytamy z dysku: tests/__screenshots__ i reportportal/__screenshots__
 * są w .gitignore, więc na świeżym klonie ich nie ma i skrypt dawałby różny wynik u różnych osób.
 * Poza tym obraz robiony pod ten jeden cel uczy lepiej niż prawdziwy zrzut galerii: różnicę
 * znaczymy na #FF00FF, czyli dokładnie tym maskColor, który reguły VRT w CLAUDE.md narzucają
 * dla masek, więc slajd i panel mówią tym samym językiem.
 *
 * Format PNG: sygnatura, IHDR, IDAT, IEND. Typ koloru 2 (truecolor RGB), 8 bitów na kanał,
 * filtr scanline 0, kompresja wbudowanym zlib. Plik wychodzi w okolicach kilku kilobajtów,
 * bo obraz jest płaski, więc wolumen storage nie puchnie.
 */
import { deflateSync } from 'node:zlib';

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

/** Płótno RGB: bufor pikseli plus rozmiary, żeby rysowanie czytało się jak rysowanie. */
function canvas(width, height, color) {
  const pixels = Buffer.alloc(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    pixels[i * 3] = color[0];
    pixels[i * 3 + 1] = color[1];
    pixels[i * 3 + 2] = color[2];
  }
  return { width, height, pixels };
}

function rect(img, x, y, w, h, color) {
  const x0 = Math.max(0, Math.trunc(x));
  const y0 = Math.max(0, Math.trunc(y));
  const x1 = Math.min(img.width, Math.trunc(x + w));
  const y1 = Math.min(img.height, Math.trunc(y + h));
  for (let yy = y0; yy < y1; yy++) {
    for (let xx = x0; xx < x1; xx++) {
      const i = (yy * img.width + xx) * 3;
      img.pixels[i] = color[0];
      img.pixels[i + 1] = color[1];
      img.pixels[i + 2] = color[2];
    }
  }
}

export function encodePng(img) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(img.width, 0);
  ihdr.writeUInt32BE(img.height, 4);
  ihdr[8] = 8; // głębia bitowa
  ihdr[9] = 2; // typ koloru: truecolor RGB
  ihdr[10] = 0; // kompresja: deflate
  ihdr[11] = 0; // metoda filtrowania
  ihdr[12] = 0; // bez przeplotu
  const stride = 1 + img.width * 3;
  const raw = Buffer.alloc(img.height * stride);
  for (let y = 0; y < img.height; y++) {
    raw[y * stride] = 0; // filtr scanline: brak
    img.pixels.copy(raw, y * stride + 1, y * img.width * 3, (y + 1) * img.width * 3);
  }
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const WIDTH = 640;
const HEIGHT = 400;

const THEMES = {
  light: { bg: [244, 245, 247], panel: [255, 255, 255], border: [219, 224, 236], text: [122, 132, 156], accent: [74, 144, 217] },
  dark: { bg: [11, 16, 32], panel: [26, 33, 64], border: [42, 52, 88], text: [124, 135, 159], accent: [90, 166, 255] },
};

/**
 * Kadr galerii. To schemat układu, nie podróbka Pixelarium: na zajęciach pokazujemy
 * mechanizm porównania, a nie wygląd aplikacji.
 *
 * @param {'light'|'dark'} theme
 * @param {'baseline'|'changed'} variant  W wariancie 'changed' karta jest wyższa i ma pełną
 *   stopkę w akcencie, czyli dokładnie to, co robi świadoma zmiana wyglądu, po której
 *   baseline jest nieaktualny. To ma być Automation Bug, nie Product Bug.
 */
export function galleryFrame(theme, variant) {
  const t = THEMES[theme] ?? THEMES.light;
  const img = canvas(WIDTH, HEIGHT, t.bg);

  rect(img, 0, 0, WIDTH, 44, t.panel);
  rect(img, 20, 16, 96, 12, t.accent);
  rect(img, WIDTH - 150, 17, 60, 10, t.border);
  rect(img, WIDTH - 80, 17, 60, 10, t.border);
  rect(img, 0, 43, WIDTH, 1, t.border);

  rect(img, 20, 64, 120, HEIGHT - 84, t.panel);
  for (let i = 0; i < 6; i++) rect(img, 32, 80 + i * 26, 84, 9, t.border);

  const cardW = 140;
  const cardH = variant === 'changed' ? 148 : 138;
  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < 2; row++) {
      const x = 160 + col * (cardW + 14);
      const y = 64 + row * (cardH + 14);
      rect(img, x, y, cardW, cardH, t.panel);
      rect(img, x, y, cardW, 1, t.border);
      rect(img, x, y + cardH - 1, cardW, 1, t.border);
      rect(img, x + 8, y + 8, cardW - 16, 74, t.border);
      rect(img, x + 8, y + 90, cardW - 40, 9, t.text);
      rect(img, x + 8, y + 104, cardW - 70, 8, t.border);
      if (variant === 'changed') rect(img, x + 8, y + 122, cardW - 16, 16, t.accent);
      else rect(img, x + 8, y + 122, 48, 9, t.border);
    }
  }
  return img;
}

/** Diff: piksele różne między kadrami na magencie, reszta przygaszona, żeby było widać gdzie. */
export function diffFrame(a, b) {
  const img = canvas(a.width, a.height, [14, 20, 40]);
  let changed = 0;
  for (let i = 0; i < a.pixels.length; i += 3) {
    if (a.pixels[i] !== b.pixels[i] || a.pixels[i + 1] !== b.pixels[i + 1] || a.pixels[i + 2] !== b.pixels[i + 2]) {
      img.pixels[i] = 255;
      img.pixels[i + 1] = 0;
      img.pixels[i + 2] = 255;
      changed++;
    } else {
      img.pixels[i] = a.pixels[i] >> 2;
      img.pixels[i + 1] = a.pixels[i + 1] >> 2;
      img.pixels[i + 2] = a.pixels[i + 2] >> 2;
    }
  }
  return { img, changed };
}

/**
 * Trójka zrzutów dla jednej awarii wizualnej.
 * @returns {{changed:number, files:{name:string,type:string,data:Buffer}[]}}
 *   `changed` to liczba różniących się pikseli, wchodzi do treści logu, żeby liczba
 *   w komunikacie zgadzała się z obrazem w załączniku.
 */
export function screenshotTriplet(theme) {
  const expected = galleryFrame(theme, 'baseline');
  const actual = galleryFrame(theme, 'changed');
  const { img: diff, changed } = diffFrame(expected, actual);
  return {
    changed,
    files: [
      { name: 'expected.png', type: 'image/png', data: encodePng(expected) },
      { name: 'actual.png', type: 'image/png', data: encodePng(actual) },
      { name: 'diff.png', type: 'image/png', data: encodePng(diff) },
    ],
  };
}
