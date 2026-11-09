export type ThemeKey = 'khadi' | 'indigo' | 'plum';

export const themePresets = {
  // Theme 1: তসর ও নিপুণ সবুজ (Heritage Khadi Green) - Default & Most Authentic
  khadi: {
    primary: '#0F5132',       // Forest Tailor Green
    primaryDark: '#0B3E26',
    primaryLight: '#E8F5E9',
    accent: '#A52A2A',        // Warm Maroon / Pomegranate
    accentLight: '#FDE8E8',
    background: '#FBFBF9',    // Off-white Linen (Eye-friendly)
    surface: '#FFFFFF',
    surfaceAlt: '#F1F3F5',
    text: '#1C1E21',
    textSecondary: '#65676B',
    textMuted: '#8A8D91',
    textInverted: '#FFFFFF',
    border: '#E4E6EB',
  },

  // Theme 2: নীল থান ও পিতল ফিতা (Denim Indigo & Brass Saffron) - Modern & Gentleman Bespoke
  indigo: {
    primary: '#1A365D',       // Royal Indigo
    primaryDark: '#0F233D',
    primaryLight: '#EBF4FF',
    accent: '#D97706',        // Brass Gold
    accentLight: '#FEF3C7',
    background: '#F8FAFC',    // Soft Slate Mist
    surface: '#FFFFFF',
    surfaceAlt: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textInverted: '#FFFFFF',
    border: '#E2E8F0',
  },

  // Theme 3: মসলিন ও জামদানি প্লাম (Vintage Plum & Silk Rose) - Ladies & Boutique Specialist
  plum: {
    primary: '#4A154B',       // Jamdani Plum / Mulberry
    primaryDark: '#350B36',
    primaryLight: '#FCE7F3',
    accent: '#E11D48',        // Silk Rose / Coral
    accentLight: '#FFE4E6',
    background: '#FFFDF9',    // Cream Silk
    surface: '#FFFFFF',
    surfaceAlt: '#FAF5FF',
    text: '#1F121E',
    textSecondary: '#5B4E59',
    textMuted: '#968894',
    textInverted: '#FFFFFF',
    border: '#F3E8FF',
  },
};

// Default active palette (Khadi)
export const colors = {
  ...themePresets.khadi,

  // Status & Financials
  success: '#198754',
  successLight: '#D1E7DD',
  warning: '#D97706',
  warningLight: '#FFF3CD',
  danger: '#DC3545',
  dangerLight: '#F8D7DA',
  info: '#0D6EFD',
  infoLight: '#CFF4FC',

  // Order Stages
  stages: {
    FABRIC_RECEIVED: { bg: '#E9ECEF', text: '#495057' },
    CUTTING: { bg: '#FFE8CC', text: '#D9480F' },
    STITCHING: { bg: '#D0EBFF', text: '#1864AB' },
    FINISHING_IRONING: { bg: '#F3D9FA', text: '#862E9C' },
    TRIAL: { bg: '#FFF3BF', text: '#F59F00' },
    READY: { bg: '#D3F9D8', text: '#2B8A3E' },
    DELIVERED: { bg: '#C3FAE8', text: '#0CA678' },
    CANCELLED: { bg: '#FFE3E3', text: '#C92A2A' },
  },
};
