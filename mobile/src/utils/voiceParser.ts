/**
 * Natural Bengali Speech-to-Measurement Parser for SelaiSathi.
 * Converts spoken tailoring sentences like:
 * "ঝুল ৪২, বুক ৩৮, কোমর ৩৪, তিরা ১৮, হাতা ২৪, কলার ১৫.৫"
 * into structured JSON values for digital measurement pad.
 */

// Mapping of spoken Bengali keywords to garment measurement field keys
const KEYWORD_MAP: Record<string, string[]> = {
  length: ['ঝুল', 'লম্বা', 'কামিজ ঝুল', 'প্যান্ট লম্বা'],
  chest: ['বুক', 'ছাতি', 'বুকের মাপ'],
  belly: ['পেট', 'ভুঁড়ি'],
  waist: ['কোমর', 'তলা'],
  hip: ['হিপ', 'কোমরের নিচে'],
  shoulder: ['তিরা', 'কাঁধ', 'পুট'],
  sleeve: ['হাতা', 'হাতা লম্বা'],
  cuff_opening: ['মুহুরি', 'হাতার মুহুরি', 'বটম', 'প্যান্টের মুহুরি'],
  collar: ['কলার', 'গলা', 'কলার মাপ'],
  rise: ['হাই'],
  thigh: ['রান'],
  knee: ['হাঁটু'],
};

// Bengali digits to English digits
const BN_DIGITS: Record<string, string> = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
};

// Bengali number words
const WORD_NUMBERS: Record<string, number> = {
  'দশ': 10, 'এগারো': 11, 'বারো': 12, 'তেরো': 13, 'চৌদ্দ': 14,
  'পনেরো': 15, 'ষোল': 16, 'সতেরো': 17, 'আঠারো': 18, 'উনিশ': 19,
  'বিশ': 20, 'একুশ': 21, 'বাইশ': 22, 'তেইশ': 23, 'চব্বিশ': 24,
  'পঁচিশ': 25, 'ছাব্বিশ': 26, 'সাতাশ': 27, 'আঠাশ': 28, 'উনত্রিশ': 29,
  'ত্রিশ': 30, 'একত্রিশ': 31, 'বত্রিশ': 32, 'তেত্রিশ': 33, 'চৌত্রিশ': 34,
  'পঁয়ত্রিশ': 35, 'ছত্রিশ': 36, 'সাঁইত্রিশ': 37, 'আটত্রিশ': 38, 'উনচল্লিশ': 39,
  'চল্লিশ': 40, 'একচল্লিশ': 41, 'বিয়াল্লিশ': 42, 'তেতাল্লিশ': 43, 'চুয়াল্লিশ': 44,
  'পঁয়তাল্লিশ': 45, 'ছেচল্লিশ': 46, 'সাতচল্লিশ': 47, 'আটচল্লিশ': 48, 'উনপঞ্চাশ': 49,
  'পঞ্চাশ': 50, 'একান্ন': 51, 'বায়ান্ন': 52, 'তিপ্পান্ন': 53, 'চুয়ান্ন': 54,
  'পঞ্চান্ন': 55, 'ছাপ্পান্ন': 56, 'সাতান্ন': 57, 'আটান্ন': 58, 'উনষাট': 59,
  'ষাট': 60,
};

export function parseBengaliSpeechToMeasurements(
  speechText: string
): Record<string, number> {
  const result: Record<string, number> = {};
  if (!speechText) return result;

  // 1. Convert any Bengali digits to standard English digits
  let cleaned = speechText.replace(/[০-৯]/g, (d) => BN_DIGITS[d] || d);

  // Normalize delimiters (commas, 'ও', 'এবং')
  cleaned = cleaned.replace(/,|এবং|আর|হচ্ছে|হবে/g, ' ');

  // 2. Tokenize words
  const tokens = cleaned.split(/\s+/).filter(Boolean);

  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i].trim();

    // Check if word matches any measurement field
    let matchedField: string | null = null;
    for (const [fieldKey, aliases] of Object.entries(KEYWORD_MAP)) {
      if (aliases.includes(word)) {
        matchedField = fieldKey;
        break;
      }
    }

    if (matchedField && i + 1 < tokens.length) {
      let nextToken = tokens[i + 1].trim();
      let value: number | null = null;

      // Check if word is "সাড়ে" (half) e.g. "সাড়ে ১৫" or "সাড়ে পনেরো"
      let isHalf = false;
      if (nextToken === 'সাড়ে' || nextToken === 'দেড়' || nextToken === 'আড়াই') {
        isHalf = true;
        if (i + 2 < tokens.length) {
          nextToken = tokens[i + 2].trim();
        }
      }

      // Check numeric value directly (e.g. "42", "42.5")
      if (/^\d+(\.\d+)?$/.test(nextToken)) {
        value = parseFloat(nextToken);
      } else if (WORD_NUMBERS[nextToken]) {
        value = WORD_NUMBERS[nextToken];
      }

      if (value !== null) {
        if (isHalf) value += 0.5;
        result[matchedField] = parseFloat(value.toFixed(2));
      }
    }
  }

  return result;
}
