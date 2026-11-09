import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding default Garment Types for SelaiSathi (Bangladesh Presets)...');

  const defaultGarmentTypes = [
    {
      nameBn: 'পাঞ্জাবি',
      nameEn: 'Panjabi',
      icon: 'panjabi',
      isDefault: true,
      fields: [
        { key: 'length', labelBn: 'ঝুল / লম্বা', unit: 'inch', min: 30, max: 55, defaultValue: 40 },
        { key: 'chest', labelBn: 'বুক / ছাতি', unit: 'inch', min: 28, max: 60, defaultValue: 38 },
        { key: 'belly', labelBn: 'পেট', unit: 'inch', min: 26, max: 60, defaultValue: 36 },
        { key: 'shoulder', labelBn: 'কাঁধ / তিরা', unit: 'inch', min: 14, max: 24, defaultValue: 18 },
        { key: 'sleeve', labelBn: 'হাতা', unit: 'inch', min: 18, max: 30, defaultValue: 24 },
        { key: 'cuff_opening', labelBn: 'হাতার মুহুরি', unit: 'inch', min: 8, max: 18, defaultValue: 11 },
        { key: 'collar', labelBn: 'গলা / কলার', unit: 'inch', min: 12, max: 22, defaultValue: 15.5 },
      ],
      styleOptions: [
        { category: 'collar', labelBn: 'কলার ডিজাইন', options: ['ব্যান্ড কলার (Band)', 'ম্যান্ডারিন (Mandarin)', 'শার্ট কলার (Shirt Collar)', 'শেরওয়ানি কলার (Sherwani)'] },
        { category: 'pocket', labelBn: 'পকেট স্টাইল', options: ['উভয় সাইড পকেট', 'এক সাইড পকেট', 'বুক পকেট সহ', 'গোপন পকেট'] },
        { category: 'cuff', labelBn: 'কাফ ডিজাইন', options: ['সাধারণ খোলা', 'কাট কাফ (Cut Cuff)', 'বাটন কাফ'] },
        { category: 'fitting', labelBn: 'ফিটিং ধরন', options: ['নিয়মিত (Regular)', 'স্লিম ফিট (Slim Fit)', 'সেমি ফিট (Semi Fit)'] }
      ]
    },
    {
      nameBn: 'শার্ট',
      nameEn: 'Shirt',
      icon: 'shirt',
      isDefault: true,
      fields: [
        { key: 'length', labelBn: 'লম্বা / ঝুল', unit: 'inch', min: 24, max: 38, defaultValue: 29 },
        { key: 'chest', labelBn: 'বুক', unit: 'inch', min: 30, max: 56, defaultValue: 38 },
        { key: 'belly', labelBn: 'পেট', unit: 'inch', min: 28, max: 56, defaultValue: 35 },
        { key: 'shoulder', labelBn: 'কাঁধ / তিরা', unit: 'inch', min: 14, max: 24, defaultValue: 18 },
        { key: 'sleeve', labelBn: 'হাতা (ফুল/হাফ)', unit: 'inch', min: 7, max: 30, defaultValue: 24.5 },
        { key: 'cuff', labelBn: 'কাফ', unit: 'inch', min: 7, max: 13, defaultValue: 9.5 },
        { key: 'collar', labelBn: 'কলার', unit: 'inch', min: 13, max: 20, defaultValue: 15.5 }
      ],
      styleOptions: [
        { category: 'collar', labelBn: 'কলার টাইপ', options: ['রেগুলার কলার', 'বাটন-ডাউন কলার', 'ব্যান্ড/চাইনিজ কলার', 'ওয়াইড স্প্রেড কলার'] },
        { category: 'pocket', labelBn: 'পকেট', options: ['এক পকেট (বামে)', 'ডাবল পকেট', 'পকেট ছাড়া (No Pocket)'] },
        { category: 'bottom_cut', labelBn: 'নিচের কাটিং', options: ['গোলাকার (Round Cut)', 'সোজা (Square Cut)'] }
      ]
    },
    {
      nameBn: 'প্যান্ট',
      nameEn: 'Pant',
      icon: 'pant',
      isDefault: true,
      fields: [
        { key: 'length', labelBn: 'লম্বা', unit: 'inch', min: 32, max: 48, defaultValue: 39 },
        { key: 'waist', labelBn: 'কোমর', unit: 'inch', min: 26, max: 54, defaultValue: 32 },
        { key: 'hip', labelBn: 'হিপ', unit: 'inch', min: 32, max: 60, defaultValue: 38 },
        { key: 'rise', labelBn: 'হাই', unit: 'inch', min: 20, max: 34, defaultValue: 26 },
        { key: 'thigh', labelBn: 'রান', unit: 'inch', min: 20, max: 34, defaultValue: 24 },
        { key: 'knee', labelBn: 'হাঁটু', unit: 'inch', min: 14, max: 24, defaultValue: 18 },
        { key: 'bottom', labelBn: 'মুহুরি / বটম', unit: 'inch', min: 12, max: 22, defaultValue: 15 }
      ],
      styleOptions: [
        { category: 'pleat', labelBn: 'প্লেট স্টাইল', options: ['প্লেন ফ্রন্ট (No Pleat)', 'সিঙ্গেল প্লেট', 'ডাবল প্লেট'] },
        { category: 'pocket', labelBn: 'পকেট টাইপ', options: ['ক্রস পকেট', 'সোজা পকেট', 'জিন্স কাট পকেট'] },
        { category: 'back_pocket', labelBn: 'পেছনের পকেট', options: ['উভয় পাশে ২টি', 'শুধু ডান পাশে ১টি'] }
      ]
    },
    {
      nameBn: 'সালোয়ার-কামিজ',
      nameEn: 'Salwar Kameez',
      icon: 'dress',
      isDefault: true,
      fields: [
        { key: 'kameez_length', labelBn: 'কামিজ লম্বা', unit: 'inch', min: 32, max: 52, defaultValue: 42 },
        { key: 'chest', labelBn: 'বুক / ছাতি', unit: 'inch', min: 28, max: 54, defaultValue: 36 },
        { key: 'waist', labelBn: 'কোমর', unit: 'inch', min: 24, max: 50, defaultValue: 32 },
        { key: 'hip', labelBn: 'হিপ', unit: 'inch', min: 30, max: 58, defaultValue: 38 },
        { key: 'shoulder', labelBn: 'কাঁধ / পুট', unit: 'inch', min: 11, max: 18, defaultValue: 14 },
        { key: 'sleeve_length', labelBn: 'হাতা লম্বা', unit: 'inch', min: 5, max: 24, defaultValue: 17 },
        { key: 'sleeve_opening', labelBn: 'হাতার মুহুরি', unit: 'inch', min: 8, max: 16, defaultValue: 10 },
        { key: 'front_neck', labelBn: 'সামনের গলা', unit: 'inch', min: 4, max: 9, defaultValue: 6 },
        { key: 'back_neck', labelBn: 'পেছনের গলা', unit: 'inch', min: 2, max: 8, defaultValue: 4 },
        { key: 'salwar_length', labelBn: 'সালোয়ার লম্বা', unit: 'inch', min: 34, max: 46, defaultValue: 38 },
        { key: 'salwar_bottom', labelBn: 'সালোয়ার মুহুরি', unit: 'inch', min: 10, max: 20, defaultValue: 12 }
      ],
      styleOptions: [
        { category: 'neck_design', labelBn: 'গলার ডিজাইন', options: ['গোল গলা', 'পান গলা', 'ভি-কাট গলা', 'চারকোনা গলা', 'বোট নেক', 'পাইপিং ডিজাইন'] },
        { category: 'salwar_type', labelBn: 'সালোয়ারের ধরন', options: ['সাধারণ সালোয়ার', 'প্লাজো (Palazzo)', 'চুড়িদার', 'সিগারেট প্যান্ট'] }
      ]
    },
    {
      nameBn: 'ব্লাউজ',
      nameEn: 'Blouse',
      icon: 'blouse',
      isDefault: true,
      fields: [
        { key: 'length', labelBn: 'লম্বা', unit: 'inch', min: 11, max: 18, defaultValue: 14 },
        { key: 'chest', labelBn: 'বুক', unit: 'inch', min: 28, max: 52, defaultValue: 34 },
        { key: 'waist', labelBn: 'কোমর / তলা', unit: 'inch', min: 24, max: 48, defaultValue: 29 },
        { key: 'shoulder', labelBn: 'কাঁধ / পুট', unit: 'inch', min: 10, max: 17, defaultValue: 13 },
        { key: 'front_neck', labelBn: 'সামনের গলা', unit: 'inch', min: 4, max: 8, defaultValue: 6 },
        { key: 'back_neck', labelBn: 'পেছনের গলা', unit: 'inch', min: 3, max: 12, defaultValue: 7.5 },
        { key: 'sleeve_length', labelBn: 'হাতা লম্বা', unit: 'inch', min: 4, max: 20, defaultValue: 9 },
        { key: 'sleeve_opening', labelBn: 'হাতার মুহুরি', unit: 'inch', min: 8, max: 16, defaultValue: 11 },
        { key: 'armhole', labelBn: 'বগল / আর্মহোল', unit: 'inch', min: 12, max: 22, defaultValue: 15 }
      ],
      styleOptions: [
        { category: 'front_opening', labelBn: 'হুক/বোতাম', options: ['সামনে হুক', 'পেছনে হুক', 'সাইড চেইন'] },
        { category: 'neck_design', labelBn: 'গলার স্টাইল', options: ['ডিপ গোল', 'পান শেপ', 'ভি-শেপ', 'হাই নেক', 'ব্যাকলেস ডোরি সহ'] }
      ]
    },
    {
      nameBn: 'ব্লেজার / কোট',
      nameEn: 'Blazer / Coat',
      icon: 'blazer',
      isDefault: true,
      fields: [
        { key: 'length', labelBn: 'লম্বা', unit: 'inch', min: 26, max: 36, defaultValue: 29 },
        { key: 'chest', labelBn: 'বুক', unit: 'inch', min: 32, max: 56, defaultValue: 38 },
        { key: 'waist', labelBn: 'কোমর', unit: 'inch', min: 28, max: 52, defaultValue: 34 },
        { key: 'shoulder', labelBn: 'কাঁধ', unit: 'inch', min: 15, max: 22, defaultValue: 18 },
        { key: 'sleeve', labelBn: 'হাতা', unit: 'inch', min: 20, max: 28, defaultValue: 24.5 },
        { key: 'cross_back', labelBn: 'ক্রস ব্যাক', unit: 'inch', min: 14, max: 22, defaultValue: 16.5 }
      ],
      styleOptions: [
        { category: 'buttons', labelBn: 'বোতামের ধরন', options: ['২ বাটন সিঙ্গেল ব্রেস্টেড', '১ বাটন সিঙ্গেল ব্রেস্টেড', 'ডাবল ব্রেস্টেড'] },
        { category: 'lapel', labelBn: 'ল্যাপেল স্টাইল', options: ['নচ ল্যাপেল (Notch)', 'পিক ল্যাপেল (Peak)', 'শাল ল্যাপেল (Shawl)'] },
        { category: 'vents', labelBn: 'পেছনের কাটা (Vent)', options: ['ডাবল ভেন্ট (উভয় সাইড)', 'সিঙ্গেল ভেন্ট (মাঝখানে)', 'ভেন্ট ছাড়া'] }
      ]
    }
  ];

  for (const item of defaultGarmentTypes) {
    const existing = await prisma.garmentType.findFirst({
      where: {
        nameEn: item.nameEn,
        tailorId: null
      }
    });

    if (!existing) {
      await prisma.garmentType.create({
        data: item
      });
      console.log(`✓ Created preset: ${item.nameBn} (${item.nameEn})`);
    } else {
      console.log(`- Already exists: ${item.nameBn} (${item.nameEn})`);
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
