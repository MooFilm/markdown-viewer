# แผนปรับปรุง MD Viewer — UI/UX และฟังก์ชันการใช้งาน

> **เอกสารนี้จัดทำจากการรีวิวโค้ดและทดสอบแอปจริง**  
> **วันที่:** 18 มิถุนายน 2026  
> **โปรเจกต์:** markdown-viewer (React + Vite + GitHub API)

---

## สารบัญ

1. [ภาพรวมและเป้าหมาย](#1-ภาพรวมและเป้าหมาย)
2. [สถานะปัจจุบัน](#2-สถานะปัจจุบัน)
3. [หลักการออกแบบ](#3-หลักการออกแบบ)
4. [แผนงานแบ่ง Phase](#4-แผนงานแบ่ง-phase)
5. [รายละเอียดแต่ละ Phase](#5-รายละเอียดแต่ละ-phase)
6. [โครงสร้างไฟล์ที่คาดว่าจะเพิ่ม/แก้](#6-โครงสร้างไฟล์ที่คาดว่าจะเพิ่มแก้)
7. [Dependencies ที่แนะนำ](#7-dependencies-ที่แนะนำ)
8. [เกณฑ์ความสำเร็จ (Acceptance Criteria)](#8-เกณฑ์ความสำเร็จ-acceptance-criteria)
9. [ความเสี่ยงและข้อจำกัด](#9-ความเสี่ยงและข้อจำกัด)
10. [ลำดับความสำคัญสรุป](#10-ลำดับความสำคัญสรุป)

---

## 1. ภาพรวมและเป้าหมาย

### 1.1 วัตถุประสงค์

ปรับปรุง **MD Viewer** จากเครื่องมืออ่าน Markdown จาก GitHub ให้เป็น **แพลตฟอร์มอ่านเอกสารยาว** (เช่น วิทยานิพนธ์, บทความ, โน้ต) ที่ใช้งานสะดวก นำทางง่าย และรองรับการจัดการไฟล์บน GitHub ได้ครบวงจรมากขึ้น

### 1.2 กลุ่มผู้ใช้หลัก

| กลุ่ม | ความต้องการ |
|-------|-------------|
| ผู้อ่าน (ไม่มี token) | เปิดอ่าน public repo, ค้นหาเอกสาร, จำตำแหน่งอ่าน |
| ผู้เขียน/เจ้าของ repo (มี PAT) | อัปโหลด, จัดการไฟล์, เปลี่ยน repo ได้ง่าย |
| ผู้ใช้มือถือ | อ่านสะดวก, UI ไม่แออัด |

### 1.3 เป้าหมายเชิงคุณภาพ

- ลดเวลาในการหาเอกสาร (search + breadcrumb + recently read)
- เพิ่มประสบการณ์อ่านเอกสารยาว (TOC, syntax highlight, ปรับตัวอักษร)
- ลดความสับสนในการตั้งค่า (Settings เข้าได้ตลอด, test connection)
- รองรับเนื้อหาภาษาไทยได้ถูกต้อง (decode UTF-8, UI ไทย)

---

## 2. สถานะปัจจุบัน

### 2.1 ฟีเจอร์ที่มีอยู่แล้ว

| ฟีเจอร์ | ไฟล์หลัก | หมายเหตุ |
|---------|----------|----------|
| รายการไฟล์/โฟลเดอร์จาก GitHub | `FileList.tsx` | แสดงเฉพาะ `.md` + โฟลเดอร์ |
| อ่าน Markdown (GFM) | `FileViewer.tsx` | remark-gfm, rehype-raw |
| Progress bar การอ่าน | `FileViewer.tsx` | fixed top bar |
| จำ scroll position | `FileViewer.tsx` | localStorage ต่อ path |
| อัปโหลดหลายไฟล์ | `FileUploader.tsx` | ต้องมี PAT |
| ตั้งค่า repo + token | `Settings.tsx` | เก็บใน localStorage |
| Bookshelf UI | `index.css` | ธีมชั้นหนังสือ |

### 2.2 ปัญหาหลักที่พบ

| หมวด | ปัญหา |
|------|-------|
| Navigation | Settings หายหลัง login, ไม่มี breadcrumb, ไม่มี next/prev |
| รายการไฟล์ | ปกหนังสือเหมือนกัน, โฟลเดอร์เทคนิคปน, ไม่มี search |
| การอ่าน | ไม่มี TOC, ไม่มี syntax highlight, title tab ไม่เปลี่ยน |
| Upload | ไม่มี drag-drop, ไม่มี folder picker |
| เทคนิค | UTF-8 decode แบบ deprecated, token plain text ใน localStorage |
| ภาษา | UI เป็นภาษาอังกฤษทั้งหมด |

---

## 3. หลักการออกแบบ

1. **Minimal diff** — แก้ทีละ phase ไม่รื้อทั้งแอป
2. **Mobile-first สำหรับการอ่าน** — หน้าอ่านสำคัญที่สุด
3. **GitHub เป็น source of truth** — ไม่ duplicate ข้อมูลนอก repo ยกเว้น cache/local preference
4. **Progressive enhancement** — ฟีเจอร์ที่ต้อง token แยกชัดจาก read-only
5. **Accessibility** — label ปุ่ม, focus state, keyboard navigation ใน TOC

---

## 4. แผนงานแบ่ง Phase

```
Phase 1 (Foundation)     ████████░░  ~3–5 วัน   แก้บั๊ก + นำทางพื้นฐาน
Phase 2 (Reading)        ████████░░  ~4–6 วัน   ประสบการณ์การอ่าน
Phase 3 (Discovery)      ██████░░░░  ~3–4 วัน   ค้นหา + กรอง + recently read
Phase 4 (File Mgmt)      ██████░░░░  ~4–5 วัน   อัปโหลด/จัดการไฟล์ดีขึ้น
Phase 5 (Polish)         ████░░░░░░  ~3–4 วัน   i18n, dark mode, PWA (optional)
```

**รวมประมาณ:** 17–24 วันทำงาน (ปรับตามเวลาจริง)

---

## 5. รายละเอียดแต่ละ Phase

---

### Phase 1: Foundation — แก้รากฐานและนำทาง

**เป้าหมาย:** แก้ pain point ที่กระทบทุกหน้า และทำให้ตั้งค่า/นำทางใช้งานได้สมเหตุสมผล

#### 1.1 แก้ UTF-8 decoding

**ปัญหา:** `decodeURIComponent(escape(decodedContent))` deprecated และอาจพังกับอักขระไทยบางกรณี

**งาน:**
- สร้าง utility `decodeBase64Utf8(base64: string): string` ใช้ `TextDecoder`
- แทนที่ใน `FileViewer.tsx`
- ทดสอบกับไฟล์ `ปริญญานิพนธ์/Thesis_Framework_v1_TH.md`

**ไฟล์:** `src/utils/decode.ts`, `src/components/FileViewer.tsx`

```ts
// ตัวอย่างแนวทาง
export function decodeBase64Utf8(base64: string): string {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}
```

#### 1.2 Navbar — Settings เข้าได้ตลอด

**ปัญหา:** หลัง login เห็นแค่ Upload + Logout ไม่สามารถเปลี่ยน repo ได้โดยตรง

**งาน:**
- แก้ `Layout.tsx` ให้แสดง Settings เสมอ (หรือเมนู "⋯" รวม Settings, Upload, Logout)
- แยก "Logout" (ลบ token) กับ "เปลี่ยน repo" (ไป Settings โดยไม่ลบ token)

**UI แนะนำ:**
```
[ MD Viewer ]                    [ Upload ] [ Settings ] [ Logout ]
```

#### 1.3 Breadcrumb ใน FileList

**งาน:**
- แปลง `currentDir` เป็น breadcrumb คลิกได้
- ตัวอย่าง: `Your Documents > ปริญญานิพนธ์ > บทที่ 1`
- คงปุ่ม Back ไว้สำหรับมือถือ

**ไฟล์:** `src/components/Breadcrumb.tsx`, `FileList.tsx`

#### 1.4 ซ่อนโฟลเดอร์ระบบ (dot-folder)

**งาน:**
- กรอง `.github`, `.git`, `node_modules`, `dist` ออกจากรายการ (config ได้)
- เพิ่ม toggle "แสดงโฟลเดอร์ระบบ" ใน Settings หรือ FileList header (default: ซ่อน)

**ไฟล์:** `src/utils/fileFilters.ts`, `FileList.tsx`

#### 1.5 ปรับ title แท็บเบราว์เซอร์

**งาน:**
- หน้า FileList: `Your Documents — MD Viewer`
- หน้า FileViewer: `{ชื่อไฟล์} — MD Viewer` (ดึงจาก H1 ถ้ามี)
- ใช้ `document.title` ใน `useEffect`

**ไฟล์:** `FileViewer.tsx`, `FileList.tsx`

#### 1.6 Settings — Test Connection

**งาน:**
- ปุ่ม "ทดสอบการเชื่อมต่อ" เรียก `octokit.repos.get({ owner, repo })`
- แสดงสถานะ: สำเร็จ / repo ไม่พบ / token ไม่ถูกต้อง / rate limit
- ไม่บังคับ save ก่อนทดสอบ (ใช้ค่าจาก form ชั่วคราว)

**ไฟล์:** `Settings.tsx`

#### Deliverables Phase 1
- [x] UTF-8 decode ถูกต้องกับภาษาไทย
- [x] เข้า Settings ได้ทุกสถานะ login
- [x] Breadcrumb ทำงานกับโฟลเดอร์ซ้อน
- [x] โฟลเดอร์ระบบถูกซ่อนโดย default
- [x] Title tab เปลี่ยนตามหน้า
- [x] Test connection ใน Settings

---

### Phase 2: Reading Experience — ประสบการณ์การอ่าน

**เป้าหมาย:** ทำให้อ่านเอกสารยาว (วิทยานิพนธ์) สะดวกที่สุด

#### 2.1 Table of Contents (TOC)

**งาน:**
- Parse heading (`h1`–`h3`) จาก markdown ก่อน/หลัง render
- แสดง TOC ด้านซ้าย (desktop) หรือ floating button + drawer (mobile)
- คลิกแล้ว scroll ไป heading พร้อม highlight active section ขณะ scroll
- ใช้ `id` บน heading (slug จากข้อความ)

**แนวทางเทคนิค:**
- Option A: `rehype-slug` + `rehype-autolink-headings` + parse AST เอง
- Option B: regex ดึง `# heading` จาก raw content (ง่ายกว่า แต่แม่นยำน้อยกว่า)

**ไฟล์ใหม่:** `src/components/TableOfContents.tsx`, `src/hooks/useActiveHeading.ts`

**Layout หน้าอ่าน (desktop):**
```
┌─────────────────────────────────────────────┐
│ Navbar                                      │
├──────────┬──────────────────────────────────┤
│ TOC      │  ← Back                          │
│ (sticky) │  ┌────────────────────────────┐  │
│          │  │ Markdown content           │  │
│          │  └────────────────────────────┘  │
└──────────┴──────────────────────────────────┘
```

#### 2.2 Syntax Highlighting

**งาน:**
- เพิ่ม `rehype-highlight` หรือ `rehype-pretty-code` + theme (เช่น GitHub Light)
- ปรับ CSS ใน `index.css` สำหรับ `.hljs` หรือ theme ของ pretty-code
- รองรับ copy button บน code block (optional ใน phase นี้)

**ไฟล์:** `FileViewer.tsx`, `index.css`, `package.json`

#### 2.3 Previous / Next Navigation

**งาน:**
- ดึงรายการ `.md` ในโฟลเดอร์เดียวกับไฟล์ปัจจุบัน
- แสดงปุ่ม "← เอกสารก่อนหน้า" / "เอกสารถัดไป →" ด้านล่างเนื้อหา
- ใช้ลำดับ alphabetical เหมือน FileList

**ไฟล์:** `src/hooks/useSiblingFiles.ts`, `FileViewer.tsx`

#### 2.4 ปรับ Typography Controls

**งาน:**
- ปุ่มลอยมุมขวาล่าง (หรือใน toolbar): ขยาย/ลด font-size, ปรับ line-height
- เก็บ preference ใน `localStorage` (`reader-font-size`, `reader-line-height`)
- ไม่ต้องมี dark mode ใน phase นี้ (ย้ายไป Phase 5)

**ไฟล์:** `src/components/ReaderControls.tsx`, `FileViewer.tsx`

#### 2.5 ลิงก์ภายนอก

**งาน:**
- Custom component สำหรับ `<a>` ใน ReactMarkdown
- ลิงก์ `http(s)://` เปิด `target="_blank"` + `rel="noopener noreferrer"`
- ไอคอน external link เล็กๆ

**ไฟล์:** `FileViewer.tsx`

#### 2.6 ปรับ Progress Bar

**งาน:**
- ย้าย progress bar ให้อยู่ใต้ navbar (ไม่ทับ navbar)
- เพิ่มเปอร์เซ็นต์เล็กๆ มุมขวา (optional, toggle ได้)

#### Deliverables Phase 2
- [ ] TOC แสดงและ scroll-to-section ได้
- [ ] Code block มี syntax highlight
- [ ] Next/Prev ระหว่างไฟล์ในโฟลเดอร์เดียวกัน
- [ ] ปรับขนาดตัวอักษรได้ + จำค่า
- [ ] ลิงก์ภายนอกเปิดแท็บใหม่

---

### Phase 3: Discovery — ค้นหาและค้นพบเอกสาร

**เป้าหมาย:** หาเอกสารได้เร็วเมื่อ repo มีไฟล์เยอะ

#### 3.1 ค้นหาชื่อไฟล์ (Client-side Search)

**งาน:**
- ช่องค้นหาใน FileList header
- กรองรายการปัจจุบัน (โฟลเดอร์ที่เปิดอยู่) แบบ real-time
- รองรับภาษาไทย (normalize, case-insensitive)

**ไฟล์:** `src/components/SearchBar.tsx`, `FileList.tsx`

#### 3.2 ค้นหาทั้ง Repo (Optional — ระดับสูง)

**งาน:**
- ใช้ GitHub Search API: `search.code` จำกัด `repo:owner/name extension:md`
- แสดงผลลัพธ์พร้อม path, snippet
- ต้องมี token สำหรับ private repo; public ใช้ได้แต่ rate limit ต่ำ
- Debounce 500ms

**ไฟล์:** `src/hooks/useRepoSearch.ts`, `src/components/SearchResults.tsx`

> **หมายเหตุ:** ถ้า API limit เป็นปัญหา ให้ทำแค่ 3.1 ก่อน หรือ cache tree ของ repo

#### 3.3 Recently Read / Continue Reading

**งาน:**
- บันทึก `{ path, title, lastReadAt, scrollPercent }` ใน localStorage (สูงสุด 10 รายการ)
- อัปเดตเมื่อออกจาก FileViewer
- แสดงการ์ด "อ่านต่อ" บนหน้าแรก (ด้านบน bookshelf)

**ไฟล์:** `src/hooks/useReadingHistory.ts`, `src/components/RecentDocuments.tsx`, `FileList.tsx`

#### 3.4 ปรับ Bookshelf UI

**งาน:**
- สีปกหนังสือจาก hash ชื่อไฟล์ (palette 6–8 สี)
- จำกัดชื่อ 2 บรรทัด + `title` attribute แสดงชื่อเต็ม
- ลด `min-height` ของ `.bookshelf-container` ให้ยืดหยุ่นตามเนื้อหา
- เพิ่มโหมด List view toggle (grid / list) — เก็บ preference

**ไฟล์:** `index.css`, `FileList.tsx`, `src/utils/bookCover.ts`

#### Deliverables Phase 3
- [ ] ค้นหาในโฟลเดอร์ปัจจุบันได้
- [ ] (Optional) ค้นหาทั้ง repo
- [ ] Recently read แสดงบนหน้าแรก
- [ ] ปกหนังสือหลากสี + list view

---

### Phase 4: File Management — จัดการไฟล์

**เป้าหมาย:** อัปโหลดและจัดการไฟล์บน GitHub สะดวกขึ้น

#### 4.1 ปรับปรุงหน้า Upload

**งาน:**
- Drag & drop zone (รองรับ `onDrop` + highlight เมื่อลากไฟมา)
- แสดงรายชื่อไฟล์ที่เลือกพร้อมขนาด + ปุ่มลบรายการ
- Progress ต่อไฟล์: `2/5 — uploading chapter2.md`
- หลังอัปโหลดสำเร็จ แสดง toast + ลิงก์ไปไฟล์หรือกลับโฟลเดอร์เป้าหมาย

**ไฟล์:** `FileUploader.tsx`, `src/components/Toast.tsx`

#### 4.2 Folder Picker

**งาน:**
- ปุ่ม "เลือกโฟลเดอร์" เปิด modal แสดง tree โฟลเดอร์จาก GitHub (lazy load)
- เลือกแล้วเติม `targetFolder` อัตโนมัติ
- ยังให้พิมพ์ path เองได้

**ไฟล์:** `src/components/FolderPicker.tsx`, `FileUploader.tsx`

#### 4.3 ลบ / เปลี่ยนชื่อไฟล์ (ต้องมี token)

**งาน:**
- Context menu หรือปุ่ม "⋯" บนไฟล์ใน FileList (เฉพาะ `hasToken`)
- ลบ: confirm dialog → `repos.deleteFile`
- เปลี่ยนชื่อ: modal → `createOrUpdateFileContents` + delete ไฟล์เก่า (หรือ move API ถ้าใช้ git tree)
- แสดงเฉพาะไฟล์ `.md` ไม่ใช่โฟลเดอร์

**ไฟล์:** `src/components/FileActions.tsx`, `FileList.tsx`

#### 4.4 Cache เนื้อหา (Optional)

**งาน:**
- ใช้ `sessionStorage` หรือ IndexedDB เก็บ content + sha
- ก่อน fetch ใหม่ เช็ค sha จาก API ถ้าไม่เปลี่ยนใช้ cache
- ลด API call และโหลดเร็วขึ้น

**ไฟล์:** `src/utils/contentCache.ts`, `FileViewer.tsx`

#### Deliverables Phase 4
- [ ] Drag & drop upload
- [ ] แสดงรายการไฟล์ก่อน upload
- [ ] Folder picker
- [ ] ลบ/เปลี่ยนชื่อไฟล์ (authenticated)
- [ ] (Optional) Content cache

---

### Phase 5: Polish — ความสมบูรณ์และขยายผล

**เป้าหมาย:** ทำให้แอปรู้สึกเป็น product จริง รองรับผู้ใช้ไทยและการใช้งานยาว

#### 5.1 Internationalization (i18n)

**งาน:**
- ใช้ `react-i18next` หรือ context ง่ายๆ สำหรับ 2 ภาษา (ไทย/อังกฤษ)
- แปลข้อความ UI ทุกหน้า
- เก็บ `locale` ใน localStorage
- ตั้ง `lang` บน `<html>` ตาม locale

**ไฟล์:** `src/i18n/`, ทุก component ที่มีข้อความ

#### 5.2 Dark Mode

**งาน:**
- CSS variables สำหรับ dark theme (`--bg-color`, `--text-color`, ...)
- Toggle ใน Settings หรือ navbar
- เก็บ `theme` ใน localStorage
- ปรับ bookshelf และ markdown container ให้เข้ากับ dark mode

**ไฟล์:** `index.css`, `src/hooks/useTheme.ts`, `Layout.tsx`

#### 5.3 Security — Sanitize HTML

**งาน:**
- แทน `rehype-raw` ด้วย `rehype-sanitize` + schema ที่อนุญาต tag ที่จำเป็น
- หรือปิด raw HTML ถ้าไม่จำเป็น

**ไฟล์:** `FileViewer.tsx`, `package.json`

#### 5.4 Error UX ที่ดีขึ้น

**งาน:**
- แปลง GitHub API error เป็นข้อความที่ผู้ใช้เข้าใจ
  - 404 → "ไม่พบไฟล์หรือ repo"
  - 401 → "Token ไม่ถูกต้องหรือหมดอายุ"
  - 403 → "ไม่มีสิทธิ์เข้าถึง"
  - 403 rate limit → "เรียก API บ่อยเกินไป ลองใหม่ใน X นาที"
- ปุ่ม Retry แทน `window.location.reload()`

**ไฟล์:** `src/utils/githubErrors.ts`, `FileList.tsx`, `FileViewer.tsx`

#### 5.5 PWA (Optional)

**งาน:**
- `vite-plugin-pwa` สำหรับ manifest + service worker
- Cache static assets
- ไอคอนแอปจาก `public/favicon.svg`

#### 5.6 Print / Export

**งาน:**
- CSS `@media print` ซ่อน navbar, TOC, progress bar
- ปุ่ม "พิมพ์" ใน FileViewer

**ไฟล์:** `index.css`, `FileViewer.tsx`

#### Deliverables Phase 5
- [ ] UI ภาษาไทย/อังกฤษ
- [ ] Dark mode
- [ ] Sanitize HTML ใน markdown
- [ ] Error message เป็นภาษามนุษย์
- [ ] (Optional) PWA
- [ ] Print stylesheet

---

## 6. โครงสร้างไฟล์ที่คาดว่าจะเพิ่ม/แก้

```
src/
├── components/
│   ├── Breadcrumb.tsx          [Phase 1]
│   ├── TableOfContents.tsx     [Phase 2]
│   ├── ReaderControls.tsx      [Phase 2]
│   ├── SearchBar.tsx           [Phase 3]
│   ├── SearchResults.tsx       [Phase 3]
│   ├── RecentDocuments.tsx     [Phase 3]
│   ├── FolderPicker.tsx        [Phase 4]
│   ├── FileActions.tsx         [Phase 4]
│   ├── Toast.tsx               [Phase 4]
│   ├── Layout.tsx              [แก้ Phase 1]
│   ├── FileList.tsx            [แก้ Phase 1, 3, 4]
│   ├── FileViewer.tsx          [แก้ Phase 1, 2, 5]
│   ├── FileUploader.tsx        [แก้ Phase 4]
│   └── Settings.tsx            [แก้ Phase 1, 5]
├── hooks/
│   ├── useActiveHeading.ts     [Phase 2]
│   ├── useSiblingFiles.ts      [Phase 2]
│   ├── useReadingHistory.ts    [Phase 3]
│   ├── useRepoSearch.ts        [Phase 3]
│   └── useTheme.ts             [Phase 5]
├── utils/
│   ├── decode.ts               [Phase 1]
│   ├── fileFilters.ts          [Phase 1]
│   ├── bookCover.ts            [Phase 3]
│   ├── githubErrors.ts         [Phase 5]
│   └── contentCache.ts         [Phase 4]
├── i18n/
│   ├── index.ts                [Phase 5]
│   ├── th.json
│   └── en.json
└── index.css                   [แก้หลาย Phase]
```

---

## 7. Dependencies ที่แนะนำ

| Package | Phase | วัตถุประสงค์ |
|---------|-------|-------------|
| `rehype-slug` | 2 | สร้าง id ให้ heading |
| `rehype-highlight` หรือ `shiki` + `rehype-pretty-code` | 2 | Syntax highlighting |
| `rehype-sanitize` | 5 | ความปลอดภัย HTML |
| `react-i18next` + `i18next` | 5 | หลายภาษา |
| `vite-plugin-pwa` | 5 | PWA (optional) |

> ไม่จำเป็นต้องติดตั้งทั้งหมดในครั้งเดียว — ติดตาม Phase

---

## 8. เกณฑ์ความสำเร็จ (Acceptance Criteria)

### Phase 1
- เปิดไฟล์ภาษาไทยแล้วไม่เพี้ยน
- เปลี่ยน repo จาก Settings ได้โดยไม่ต้อง logout
- Breadcrumb คลิกย้อนโฟลเดอร์ได้ถูกต้อง
- ไม่เห็น `.github` ในรายการ default

### Phase 2
- เอกสารที่มี 5+ heading แสดง TOC และกดแล้ว scroll ถูกต้ว
- Code block มีสี syntax
- กด Next/Prev เปลี่ยนไฟล์ในโฟลเดอร์เดียวกันได้

### Phase 3
- พิมพ์ค้นหาแล้วกรองไฟล์ในโฟลเดอร์ได้ทันที
- เปิดไฟล์แล้วกลับหน้าแรกเห็น "อ่านต่อ"

### Phase 4
- ลากไฟล์ .md มาวางแล้วอัปโหลดได้
- ลบไฟล์บน GitHub ผ่าน UI ได้ (เมื่อมี token)

### Phase 5
- สลับภาษาไทย/อังกฤษได้ทุกหน้า
- Dark mode ไม่ทำให้ markdown อ่านยาก

---

## 9. ความเสี่ยงและข้อจำกัด

| ความเสี่ยง | ผลกระทบ | แนวทางลดความเสี่ยง |
|-----------|---------|-------------------|
| GitHub API rate limit (60/hr ไม่มี token) | โหลดช้า/ error | แสดงข้อความแนะนำใส่ token, cache content |
| Search API จำกัด | ค้นหาทั้ง repo ไม่เสถียร | เริ่มจาก client-side search ก่อน |
| Token ใน localStorage | XSS ขโมย token ได้ | sanitize HTML, แจ้งผู้ใช้, พิจารณา session-only |
| ไฟล์ใหญ่มาก | โหลดช้า, browser ค้าง | แจ้งเตือนไฟล์ > 1MB, พิจารณา pagination ในอนาคต |
| HashRouter URL ยาว | แชร์ลิงก์อ่านไฟล์ยากอ่าน | ยอมรับได้สำหรับ GitHub Pages |

---

## 10. ลำดับความสำคัญสรุป

### ทำก่อน (Must Have)
1. แก้ UTF-8 decode
2. Settings เข้าได้ตลอด + Test connection
3. Breadcrumb + ซ่อนโฟลเดอร์ระบบ
4. Table of Contents
5. ค้นหาชื่อไฟล์ในโฟลเดอร์
6. Recently read

### ทำต่อ (Should Have)
7. Syntax highlighting
8. Next/Prev เอกสาร
9. Drag & drop upload + folder picker
10. ปรับขนาดตัวอักษร
11. i18n ภาษาไทย

### ทำเมื่อมีเวลา (Nice to Have)
12. Dark mode
13. ค้นหาทั้ง repo
14. ลบ/เปลี่ยนชื่อไฟล์
15. PWA + offline cache
16. Print / Export PDF

---

## ภาคผนวก: Checklist สำหรับเริ่ม Phase 1

```markdown
- [x] สร้าง branch `feature/phase-1-foundation`
- [x] เพิ่ม `src/utils/decode.ts` และ unit test ง่ายๆ (ถ้ามี test setup)
- [x] แก้ FileViewer ใช้ decode ใหม่
- [x] แก้ Layout แสดง Settings ตลอด
- [x] สร้าง Breadcrumb component
- [x] เพิ่ม fileFilters และใช้ใน FileList
- [x] เพิ่ม document.title ทุกหน้า
- [x] เพิ่ม Test connection ใน Settings
- [ ] ทดสอบด้วยไฟล์ภาษาไทยใน repo จริง
- [x] build ผ่าน + deploy GitHub Pages
```

---

*เอกสารนี้สามารถอัปเดตเมื่อแต่ละ Phase เสร็จ — บันทึกวันที่และสถานะท้ายไฟล์*
