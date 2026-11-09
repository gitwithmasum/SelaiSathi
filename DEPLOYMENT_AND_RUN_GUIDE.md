# SelaiSathi (সেলাই সাথী) - রান ও ডিপ্লয়মেন্ট মাস্টার গাইড

এই ডকুমেন্টে SelaiSathi অ্যাপ ও সার্ভার লোকালি রান করা, লাইভ সার্ভারে ডিপ্লয় করা এবং Android APK (EAS Build) জেনারেট করার সম্পূর্ণ নির্দেশিকা দেওয়া হলো।

---

## ১. প্রজেক্ট স্ট্রাকচার

```
SelaiSathi/
├── server/                     # Node.js + Express + Prisma + Socket.io
│   ├── prisma/schema.prisma    # PostgreSQL Database Schema
│   ├── prisma/seed.ts          # বাংলাদেশের পোশাকের মাপের ডিফল্ট প্রিসেট সিডিং
│   ├── src/                    # মডিউলার ব্যাকএন্ড কোড
│   └── package.json
│
└── mobile/                     # React Native (Expo Router) Mobile App
    ├── app/                    # স্ক্রিন ও রাউটস (Auth, Tailor, Customer, Tracking)
    ├── src/                    # থিম, স্টোর, কম্পোনেন্ট, সার্ভিসেস
    ├── i18n/                   # bn.json ও en.json (বাংলা ও ইংরেজি অনুবাদ)
    └── package.json
```

---

## ২. লোকাল ডেভেলপমেন্ট রান করার নির্দেশিকা

### ২.১ ব্যাকএন্ড সার্ভার (Server) চালু করা

১. `server` ডিরেক্টরিতে যান:
```bash
cd server
```

২. `.env.example` কপি করে `.env` ফাইল তৈরি করুন:
```bash
cp .env.example .env
```

৩. `.env` ফাইলে আপনার ডাটাবেজ ইউআরএল দিন:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/selaisathi_db?schema=public"
SMS_PROVIDER="CONSOLE" # লোকাল ডেভেলপমেন্টে কনসোলে সুন্দরভাবে OTP ও মেসেজ প্রিন্ট হবে
```

৪. ডাটাবেজ মাইগ্রেশন ও ডিফল্ট মাপের প্রিসেট সিড করুন:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

৫. ব্যাকএন্ড সার্ভার রান করুন:
```bash
npm run dev
```
> সার্ভার চালু হলে আপনি কনসোলে পাবেন:  
> `📡 URL: http://localhost:5000/api/v1`  
> `🩺 Health: http://localhost:5000/api/v1/health`

---

### ২.২ মোবাইল অ্যাপ (Mobile Expo) চালু করা

১. `mobile` ডিরেক্টরিতে যান:
```bash
cd mobile
```

২. ডিপেনডেন্সি ইনস্টল করুন:
```bash
npm install
```

৩. এক্সপো সার্ভার রান করুন:
```bash
npx expo start
```

৪. আপনার অ্যান্ড্রয়েড ফোনে **Expo Go** অ্যাপ দিয়ে কিউআর কোড স্ক্যান করে সরাসরি অ্যাপটি পরীক্ষা করুন (অথবা `a` চেপে Android Emulator চালু করুন)।

---

## ৩. প্রোডাকশন ডিপ্লয়মেন্ট (Production Deployment)

### ৩.১ Railway / Render এ ডিপ্লয় করা (Recommended)

1. **Railway.app**-এ একটি নতুন প্রজেক্ট তৈরি করে **PostgreSQL** ডাটাবেজ যুক্ত করুন।
2. GitHub রিপোজিটরি যুক্ত করুন এবং Root Directory হিসেবে `server` নির্বাচন করুন।
3. নিচের Environment Variables সেট করুন:
   - `DATABASE_URL`: Railway PostgreSQL Connection String
   - `JWT_ACCESS_SECRET`: আপনার তৈরি করা স্ট্রং সিক্রেট কী
   - `JWT_REFRESH_SECRET`: আপনার তৈরি করা স্ট্রং সিক্রেট কী
   - `SMS_PROVIDER`: `GREENWEB` অথবা `REVE`
   - `SMS_API_KEY`: আপনার বাংলাদেশি গেটওয়ের API Key
   - `SMS_SENDER_ID`: অনুমোদিত মাস্কিং/নন-মাস্কিং সেন্ডার আইডি
4. Build Command: `npm install && npx prisma generate && npm run build`
5. Start Command: `npx prisma migrate deploy && npm start`

### ৩.২ Ubuntu VPS (Nginx + PM2) এ ডিপ্লয় করা

১. সার্ভারে Node.js এবং PM2 ইনস্টল করুন:
```bash
sudo apt update && sudo apt install -y nodejs npm
sudo npm install -g pm2
```

২. প্রজেক্ট ক্লোন করে বিল্ড করুন:
```bash
cd /var/www/selaisathi/server
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run build
```

৩. PM2 দিয়ে সার্ভার ব্যাকগ্রাউন্ডে চালু রাখুন:
```bash
pm2 start dist/server.js --name "selaisathi-api"
pm2 save
pm2 startup
```

৪. Nginx Reverse Proxy কনফিগার করুন (SSL সহ Let's Encrypt দিয়ে):
```nginx
server {
    server_name api.selaisathi.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## ৪. Android APK বিল্ড নির্দেশনা (EAS Build)

১. Expo Application Services (EAS CLI) ইনস্টল করুন:
```bash
npm install -g eas-cli
```

২. আপনার Expo অ্যাকাউন্টে লগইন করুন:
```bash
eas login
```

৩. মোবাইল ফোল্ডারে EAS কনফিগার করুন:
```bash
cd mobile
eas build:configure
```

৪. সরাসরি টেস্টযোগ্য standalone Android APK ফাইল তৈরি করতে রান করুন:
```bash
eas build -p android --profile preview
```
বিল্ড শেষ হলে Expo ড্যাশবোর্ড থেকে সরাসরি `.apk` ফাইল ডাউনলোড করে যেকোনো অ্যান্ড্রয়েড ফোনে ইনস্টল করতে পারবেন!
