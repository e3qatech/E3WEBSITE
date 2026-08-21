# Production CMS Runbook: Spatial Experience Activation

**Release**: `release/e3-spatial-cms-only-20260820`
**Target Page**: `b2c-landing`
**Execution Type**: Manual Transactional SQL Patch (Read-Only Planning Document)
**Security Policy**: Zero database credentials or connection strings in documentation. No RFP infrastructure involved.

---

## 1. Target Database Identification Checklist

Before executing any query, verify connection to the designated production database instance:
- [ ] Confirm connected database is the production Neon database instance (`production` branch).
- [ ] Verify connection is secured via TLS/SSL.
- [ ] Ensure execution user has appropriate `UPDATE` privileges on public schema `"Pages"` table.
- [ ] Ensure no local mutation scripts are connected to production.

---

## 2. Target Record Identification

- **Table**: `"Pages"`
- **Slug**: `'b2c-landing'`
- **Target JSON Field**: `content` (specifically `content->'spatialExperience'`)

---

## 3. Pre-Activation Read-Only Production Query

Run this query to inspect and capture the live pre-change state:

```sql
SELECT
  id,
  slug,
  "updatedAt",
  content->'spatialExperience' AS spatial_experience_snapshot
FROM "Pages"
WHERE slug = 'b2c-landing';
```

---

## 4. Exact Current Production `spatialExperience` Snapshot

```json
{
  "enabled": false,
  "faces": [
    {
      "id": "exp-01",
      "slug": "inflatacity",
      "nameEn": "InflataCity",
      "nameAr": "إنفلاتا سيتي",
      "headingEn": "The World's Largest Inflatable Adventure Park",
      "headingAr": "أكبر حديقة مغامرات هوائية في العالم",
      "descriptionEn": "Experience custom multi-level obstacle courses...",
      "descriptionAr": "استمتع بمسارات عوائق تفاعلية عملاقة...",
      "primaryCtaLabelEn": "Explore InflataCity",
      "primaryCtaLabelAr": "استكشف إنفلاتا سيتي",
      "primaryCtaUrl": "/b2c/attractions/inflatacity-city-center",
      "backgroundColor": "#0d1117",
      "accentColor": "#f59e0b",
      "haloColor": "#d97706",
      "textAlignment": "CENTER",
      "themeMode": "DARK",
      "visibility": true
    }
  ]
}
```

---

## 5. Exact Final `spatialExperience` Target JSON

```json
{
  "enabled": true,
  "faces": [
    {
      "id": "face-inflatapark",
      "slug": "inflatapark-city-center",
      "nameEn": "InflataPark",
      "nameAr": "إنفلاتا بارك",
      "headingEn": "Next-Gen Inflatable Stadium & Air-Matrix",
      "headingAr": "أكبر ملعب هوائي متطور ومصفوفة القفز الحر",
      "descriptionEn": "Immerse yourself in Qatar's flagship bounce kingdom spanning thousands of square meters.",
      "descriptionAr": "انغمس في مملكة القفز الرائدة في قطر الممتدة على آلاف الأمتار المربعة من التحديات والمرح العائلي.",
      "primaryCtaLabelEn": "Explore InflataPark",
      "primaryCtaLabelAr": "استكشف إنفلاتا بارك",
      "primaryCtaUrl": "/b2c/attractions/inflatapark-city-center",
      "backgroundColor": "#070a12",
      "accentColor": "#f59e0b",
      "haloColor": "#d97706",
      "textAlignment": "CENTER",
      "themeMode": "DARK",
      "visibility": true
    },
    {
      "id": "face-urban-arena",
      "slug": "urban-arena-mall-of-qatar",
      "nameEn": "Urban Arena",
      "nameAr": "أوربان أرينا",
      "headingEn": "High-Octane Tactical Laser & Action Realm",
      "headingAr": "ميدان المعارك التكتيكية بالليزر وتحديات الحركة",
      "descriptionEn": "Multi-tier battle arena featuring UV labyrinth obstacle zones, esport simulators, and precision laser missions.",
      "descriptionAr": "ميدان معارك متعدد الطوابق مع مناطق ليزر تكتيكية فوق بنفسجية ومحاكيات رياضية تفاعلية.",
      "primaryCtaLabelEn": "Discover Urban Arena",
      "primaryCtaLabelAr": "اكتشف أوربان أرينا",
      "primaryCtaUrl": "/b2c/attractions/urban-arena-mall-of-qatar",
      "backgroundColor": "#0a0d14",
      "accentColor": "#38bdf8",
      "haloColor": "#0284c7",
      "textAlignment": "CENTER",
      "themeMode": "DARK",
      "visibility": true
    },
    {
      "id": "face-crayons-bricks",
      "slug": "crayons-and-bricks-place-vendome",
      "nameEn": "Crayons & Bricks",
      "nameAr": "كرايونز آند بريكس",
      "headingEn": "Creative Building & STEM Wonder Studio",
      "headingAr": "استوديو البناء الإبداعي والابتكار للأطفال",
      "descriptionEn": "Unleash young imaginations with giant tactile brick architectural zones, kinetic color labs, and robotics.",
      "descriptionAr": "أطلق العنان لخيال الصغار في استوديو البناء المعماري والمختبرات الحركية التعليمية المتطورة.",
      "primaryCtaLabelEn": "Explore Studio",
      "primaryCtaLabelAr": "استكشف الاستوديو",
      "primaryCtaUrl": "/b2c/attractions/crayons-and-bricks-place-vendome",
      "backgroundColor": "#080b11",
      "accentColor": "#ec4899",
      "haloColor": "#db2777",
      "textAlignment": "CENTER",
      "themeMode": "DARK",
      "visibility": true
    },
    {
      "id": "face-rush-action",
      "slug": "rush-action-park",
      "nameEn": "Rush Action Park",
      "nameAr": "راش أكشن بارك",
      "headingEn": "Freestyle Trampolines & Gladiator Stunt Pits",
      "headingAr": "ترامبولين حر وحلبات التحدي والقفز الهوائي",
      "descriptionEn": "Qatar's premier action destination featuring interconnected trampoline matrixes and airbag stunt drop zones.",
      "descriptionAr": "الوجهة الرائدة للقفز الحر في قطر مع مصفوفات ترامبولين مترابطة ووسائد هوائية للقفز البهلواني الآمن.",
      "primaryCtaLabelEn": "Experience Rush",
      "primaryCtaLabelAr": "خض تجربة راش",
      "primaryCtaUrl": "/b2c/attractions/rush-action-park",
      "backgroundColor": "#0b0e17",
      "accentColor": "#10b981",
      "haloColor": "#059669",
      "textAlignment": "CENTER",
      "themeMode": "DARK",
      "visibility": true
    },
    {
      "id": "face-spongebob",
      "slug": "spongebob-squarepants-paw-patrol-activation-meryal",
      "nameEn": "Nickelodeon World",
      "nameAr": "عالم نيكلوديون",
      "headingEn": "SpongeBob & PAW Patrol Live Adventure",
      "headingAr": "مغامرة سبونج بوب وباو باترول التفاعلية المباشرة",
      "descriptionEn": "Official interactive Nickelodeon activations bringing beloved characters, water attractions, and playful missions to life.",
      "descriptionAr": "عالم تفاعلي رسمي مبهج يجمع شخصيات نيكلوديون المحبوبة مع أنشطة ترفيهية ومائية ساحرة.",
      "primaryCtaLabelEn": "Join The Fun",
      "primaryCtaLabelAr": "انضم إلى المرح",
      "primaryCtaUrl": "/b2c/attractions/spongebob-squarepants-paw-patrol-activation-meryal",
      "backgroundColor": "#080c16",
      "accentColor": "#eab308",
      "haloColor": "#ca8a04",
      "textAlignment": "CENTER",
      "themeMode": "DARK",
      "visibility": true
    },
    {
      "id": "face-inflatarun",
      "slug": "inflatarun-qatar",
      "nameEn": "InflataRUN Qatar",
      "nameAr": "إنفلاتارن قطر",
      "headingEn": "The Record-Breaking Inflatable Monster Sprint",
      "headingAr": "سباق العوائق الهوائي القياسي الأكبر في قطر",
      "descriptionEn": "Guinness World Record holding giant obstacle run featuring adrenaline challenges and festival night carnivals.",
      "descriptionAr": "سباق العوائق الحامل للأرقام القياسية العالمية مع تحديات حماسية وسهرات كرنفالية ليلية ممتعة.",
      "primaryCtaLabelEn": "View InflataRUN",
      "primaryCtaLabelAr": "شاهد إنفلاتارن",
      "primaryCtaUrl": "/b2c/attractions/inflatarun-qatar",
      "backgroundColor": "#070a13",
      "accentColor": "#8b5cf6",
      "haloColor": "#7c3aed",
      "textAlignment": "CENTER",
      "themeMode": "DARK",
      "visibility": true
    },
    {
      "id": "face-kids-driving",
      "slug": "kids-city-driving-school",
      "nameEn": "Kids Driving School",
      "nameAr": "مدينة قيادة الأطفال",
      "headingEn": "Miniature City Traffic & Driving License Academy",
      "headingAr": "أكاديمية تعليم القيادة ورخص القيادة المصغرة للأطفال",
      "descriptionEn": "Realistic miniature road network with electric mini-cars, smart traffic signals, and authentic graduation driving licenses.",
      "descriptionAr": "شبكة طرق مصغرة واقعية مع سيارات كهربائية وإشارات مرور ذكية وإصدار رخص قيادة رسمية للأطفال.",
      "primaryCtaLabelEn": "Enroll Junior Drivers",
      "primaryCtaLabelAr": "سجل السائقين الصغار",
      "primaryCtaUrl": "/b2c/attractions/kids-city-driving-school",
      "backgroundColor": "#090d15",
      "accentColor": "#06b6d4",
      "haloColor": "#0891b2",
      "textAlignment": "CENTER",
      "themeMode": "DARK",
      "visibility": true
    },
    {
      "id": "face-qatar-map",
      "slug": "e3-attractions-network",
      "nameEn": "E3 Qatar Network",
      "nameAr": "شبكة إي ثري في قطر",
      "headingEn": "Explore All Destinations Across Doha & Lusail",
      "headingAr": "استكشف كافة وجهاتنا الترفيهية في الدوحة ولوسيل",
      "descriptionEn": "Discover the full map of E3 entertainment worlds across Qatar's premier retail, lifestyle, and tourism destinations.",
      "descriptionAr": "اكتشف الخريطة الكاملة لعوالم إي ثري الترفيهية المنتشرة في أبرز المجمعات والوجهات السياحية في قطر.",
      "primaryCtaLabelEn": "Explore Full Map",
      "primaryCtaLabelAr": "استكشف الخريطة الكاملة",
      "primaryCtaUrl": "/b2c/locations",
      "backgroundColor": "#070a12",
      "accentColor": "#f43f5e",
      "haloColor": "#e11d48",
      "textAlignment": "CENTER",
      "themeMode": "DARK",
      "visibility": true
    }
  ]
}
```

---

## 6. Approved E3 Blob Media URLs

All media URLs used across spatial, story, and fallback interfaces reference approved public Vercel Blob storage:
- `https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/InflataPark%20City%20Center%20_Page_36_Image_0001.jpg`
- `https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/Post%20Event%20Report%20InflataCity%202025%20_Page_013_Image_0007.jpg`
- `https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/762b7271-c81f-42a7-a190-3be8b3000f71.jpg`
- `https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/72ab2c19-e5de-4554-9ae2-b1beecc7ffab.jpg`
- `https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/79a8b014-64b7-4d8f-97f3-0fedca268e8a.jpeg`
- `https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/2809137c-b6cd-48f0-94d4-80e19c038e4e.JPG`
- `https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC_6565.jpg`
- `https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC00640.jpg`
- `https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC01674.jpg`
- `https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/D85_8202.jpg`
- `https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/D85_8138.jpg`
- `https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC09277-2.jpg`
- `https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC06321.jpg`

---

## 7. Precondition Checks

Execute before running the activation transaction:
1. Verify `SELECT count(*) FROM "Pages" WHERE slug = 'b2c-landing';` returns `1`.
2. Confirm the production deployment from commit `f8808388a409a8cef53822671c36906a200a08d0` (or later) has been deployed to Vercel Production.

---

## 8. Expected Affected Row Count

- **Expected Affected Rows**: Exactly `1`. If row count is `0` or `> 1`, `ROLLBACK`.

---

## 9. Transactional Activation SQL

```sql
BEGIN;

-- Lock and verify the exact single row
SELECT id, slug, "updatedAt", content->'spatialExperience'
FROM "Pages"
WHERE slug = 'b2c-landing'
FOR UPDATE;

-- Update spatialExperience with the full 8-face canonical configuration
UPDATE "Pages"
SET content = jsonb_set(
  content,
  '{spatialExperience}',
  '{
    "enabled": true,
    "faces": [
      {
        "id": "face-inflatapark",
        "slug": "inflatapark-city-center",
        "nameEn": "InflataPark",
        "nameAr": "إنفلاتا بارك",
        "headingEn": "Next-Gen Inflatable Stadium & Air-Matrix",
        "headingAr": "أكبر ملعب هوائي متطور ومصفوفة القفز الحر",
        "descriptionEn": "Immerse yourself in Qatar'\''s flagship bounce kingdom spanning thousands of square meters.",
        "descriptionAr": "انغمس في مملكة القفز الرائدة في قطر الممتدة على آلاف الأمتار المربعة من التحديات والمرح العائلي.",
        "primaryCtaLabelEn": "Explore InflataPark",
        "primaryCtaLabelAr": "استكشف إنفلاتا بارك",
        "primaryCtaUrl": "/b2c/attractions/inflatapark-city-center",
        "backgroundColor": "#070a12",
        "accentColor": "#f59e0b",
        "haloColor": "#d97706",
        "textAlignment": "CENTER",
        "themeMode": "DARK",
        "visibility": true
      },
      {
        "id": "face-urban-arena",
        "slug": "urban-arena-mall-of-qatar",
        "nameEn": "Urban Arena",
        "nameAr": "أوربان أرينا",
        "headingEn": "High-Octane Tactical Laser & Action Realm",
        "headingAr": "ميدان المعارك التكتيكية بالليزر وتحديات الحركة",
        "descriptionEn": "Multi-tier battle arena featuring UV labyrinth obstacle zones, esport simulators, and precision laser missions.",
        "descriptionAr": "ميدان معارك متعدد الطوابق مع مناطق ليزر تكتيكية فوق بنفسجية ومحاكيات رياضية تفاعلية.",
        "primaryCtaLabelEn": "Discover Urban Arena",
        "primaryCtaLabelAr": "اكتشف أوربان أرينا",
        "primaryCtaUrl": "/b2c/attractions/urban-arena-mall-of-qatar",
        "backgroundColor": "#0a0d14",
        "accentColor": "#38bdf8",
        "haloColor": "#0284c7",
        "textAlignment": "CENTER",
        "themeMode": "DARK",
        "visibility": true
      },
      {
        "id": "face-crayons-bricks",
        "slug": "crayons-and-bricks-place-vendome",
        "nameEn": "Crayons & Bricks",
        "nameAr": "كرايونز آند بريكس",
        "headingEn": "Creative Building & STEM Wonder Studio",
        "headingAr": "استوديو البناء الإبداعي والابتكار للأطفال",
        "descriptionEn": "Unleash young imaginations with giant tactile brick architectural zones, kinetic color labs, and robotics.",
        "descriptionAr": "أطلق العنان لخيال الصغار في استوديو البناء المعماري والمختبرات الحركية التعليمية المتطورة.",
        "primaryCtaLabelEn": "Explore Studio",
        "primaryCtaLabelAr": "استكشف الاستوديو",
        "primaryCtaUrl": "/b2c/attractions/crayons-and-bricks-place-vendome",
        "backgroundColor": "#080b11",
        "accentColor": "#ec4899",
        "haloColor": "#db2777",
        "textAlignment": "CENTER",
        "themeMode": "DARK",
        "visibility": true
      },
      {
        "id": "face-rush-action",
        "slug": "rush-action-park",
        "nameEn": "Rush Action Park",
        "nameAr": "راش أكشن بارك",
        "headingEn": "Freestyle Trampolines & Gladiator Stunt Pits",
        "headingAr": "ترامبولين حر وحلبات التحدي والقفز الهوائي",
        "descriptionEn": "Qatar'\''s premier action destination featuring interconnected trampoline matrixes and airbag stunt drop zones.",
        "descriptionAr": "الوجهة الرائدة للقفز الحر في قطر مع مصفوفات ترامبولين مترابطة ووسائد هوائية للقفز البهلواني الآمن.",
        "primaryCtaLabelEn": "Experience Rush",
        "primaryCtaLabelAr": "خض تجربة راش",
        "primaryCtaUrl": "/b2c/attractions/rush-action-park",
        "backgroundColor": "#0b0e17",
        "accentColor": "#10b981",
        "haloColor": "#059669",
        "textAlignment": "CENTER",
        "themeMode": "DARK",
        "visibility": true
      },
      {
        "id": "face-spongebob",
        "slug": "spongebob-squarepants-paw-patrol-activation-meryal",
        "nameEn": "Nickelodeon World",
        "nameAr": "عالم نيكلوديون",
        "headingEn": "SpongeBob & PAW Patrol Live Adventure",
        "headingAr": "مغامرة سبونج بوب وباو باترول التفاعلية المباشرة",
        "descriptionEn": "Official interactive Nickelodeon activations bringing beloved characters, water attractions, and playful missions to life.",
        "descriptionAr": "عالم تفاعلي رسمي مبهج يجمع شخصيات نيكلوديون المحبوبة مع أنشطة ترفيهية ومائية ساحرة.",
        "primaryCtaLabelEn": "Join The Fun",
        "primaryCtaLabelAr": "انضم إلى المرح",
        "primaryCtaUrl": "/b2c/attractions/spongebob-squarepants-paw-patrol-activation-meryal",
        "backgroundColor": "#080c16",
        "accentColor": "#eab308",
        "haloColor": "#ca8a04",
        "textAlignment": "CENTER",
        "themeMode": "DARK",
        "visibility": true
      },
      {
        "id": "face-inflatarun",
        "slug": "inflatarun-qatar",
        "nameEn": "InflataRUN Qatar",
        "nameAr": "إنفلاتارن قطر",
        "headingEn": "The Record-Breaking Inflatable Monster Sprint",
        "headingAr": "سباق العوائق الهوائي القياسي الأكبر في قطر",
        "descriptionEn": "Guinness World Record holding giant obstacle run featuring adrenaline challenges and festival night carnivals.",
        "descriptionAr": "سباق العوائق الحامل للأرقام القياسية العالمية مع تحديات حماسية وسهرات كرنفالية ليلية ممتعة.",
        "primaryCtaLabelEn": "View InflataRUN",
        "primaryCtaLabelAr": "شاهد إنفلاتارن",
        "primaryCtaUrl": "/b2c/attractions/inflatarun-qatar",
        "backgroundColor": "#070a13",
        "accentColor": "#8b5cf6",
        "haloColor": "#7c3aed",
        "textAlignment": "CENTER",
        "themeMode": "DARK",
        "visibility": true
      },
      {
        "id": "face-kids-driving",
        "slug": "kids-city-driving-school",
        "nameEn": "Kids Driving School",
        "nameAr": "مدينة قيادة الأطفال",
        "headingEn": "Miniature City Traffic & Driving License Academy",
        "headingAr": "أكاديمية تعليم القيادة ورخص القيادة المصغرة للأطفال",
        "descriptionEn": "Realistic miniature road network with electric mini-cars, smart traffic signals, and authentic graduation driving licenses.",
        "descriptionAr": "شبكة طرق مصغرة واقعية مع سيارات كهربائية وإشارات مرور ذكية وإصدار رخص قيادة رسمية للأطفال.",
        "primaryCtaLabelEn": "Enroll Junior Drivers",
        "primaryCtaLabelAr": "سجل السائقين الصغار",
        "primaryCtaUrl": "/b2c/attractions/kids-city-driving-school",
        "backgroundColor": "#090d15",
        "accentColor": "#06b6d4",
        "haloColor": "#0891b2",
        "textAlignment": "CENTER",
        "themeMode": "DARK",
        "visibility": true
      },
      {
        "id": "face-qatar-map",
        "slug": "e3-attractions-network",
        "nameEn": "E3 Qatar Network",
        "nameAr": "شبكة إي ثري في قطر",
        "headingEn": "Explore All Destinations Across Doha & Lusail",
        "headingAr": "استكشف كافة وجهاتنا الترفيهية في الدوحة ولوسيل",
        "descriptionEn": "Discover the full map of E3 entertainment worlds across Qatar'\''s premier retail, lifestyle, and tourism destinations.",
        "descriptionAr": "اكتشف الخريطة الكاملة لعوالم إي ثري الترفيهية المنتشرة في أبرز المجمعات والوجهات السياحية في قطر.",
        "primaryCtaLabelEn": "Explore Full Map",
        "primaryCtaLabelAr": "استكشف الخريطة الكاملة",
        "primaryCtaUrl": "/b2c/locations",
        "backgroundColor": "#070a12",
        "accentColor": "#f43f5e",
        "haloColor": "#e11d48",
        "textAlignment": "CENTER",
        "themeMode": "DARK",
        "visibility": true
      }
    ]
  }'::jsonb,
  true
)
WHERE slug = 'b2c-landing';

COMMIT;
```

---

## 10. Post-Activation Verification Query

```sql
SELECT
  id,
  slug,
  "updatedAt",
  (content->'spatialExperience'->>'enabled')::boolean AS is_spatial_enabled,
  jsonb_array_length(content->'spatialExperience'->'faces') AS face_count
FROM "Pages"
WHERE slug = 'b2c-landing';
```

**Expected Result**:
- `is_spatial_enabled`: `true`
- `face_count`: `8`

---

## 11. Complete Rollback SQL

If rollback is required, execute this transactional script to restore the complete exact original JSON value:

```sql
BEGIN;

SELECT id, slug, "updatedAt"
FROM "Pages"
WHERE slug = 'b2c-landing'
FOR UPDATE;

UPDATE "Pages"
SET content = jsonb_set(
  content,
  '{spatialExperience}',
  '{
    "enabled": false,
    "faces": [
      {
        "id": "exp-01",
        "slug": "inflatacity",
        "nameEn": "InflataCity",
        "nameAr": "إنفلاتا سيتي",
        "headingEn": "The World'\''s Largest Inflatable Adventure Park",
        "headingAr": "أكبر حديقة مغامرات هوائية في العالم",
        "descriptionEn": "Experience custom multi-level obstacle courses...",
        "descriptionAr": "استمتع بمسارات عوائق تفاعلية عملاقة...",
        "primaryCtaLabelEn": "Explore InflataCity",
        "primaryCtaLabelAr": "استكشف إنفلاتا سيتي",
        "primaryCtaUrl": "/b2c/attractions/inflatacity-city-center",
        "backgroundColor": "#0d1117",
        "accentColor": "#f59e0b",
        "haloColor": "#d97706",
        "textAlignment": "CENTER",
        "themeMode": "DARK",
        "visibility": true
      }
    ]
  }'::jsonb,
  true
)
WHERE slug = 'b2c-landing';

COMMIT;
```

---

## 12. Non-Interference Confirmation

- **No RFP Configuration**: This runbook modifies only the `b2c-landing` page content JSON.
- **Zero Schema Migrations**: Does not create, modify, or drop any database tables or columns.
- **Zero Environment Variable Changes**: Does not alter any runtime environment variables.
