# GitHub Pages Read-only Dashboard Handoff Plan

> เอกสารนี้คือแผนส่งต่องานให้ AI/นักพัฒนาตัวอื่น implement ได้โดยไม่หลุดกรอบ  
> เป้าหมายคือสร้างหน้าเว็บ Dashboard สำหรับ “ดูเท่านั้น” บน GitHub Pages โดยไม่กระทบ Electron dashboard หลัก

---

## 0. คำสั่งเริ่มงานสำหรับ AI ตัวถัดไป

ให้ AI ที่รับงานอ่านและทำตามลำดับนี้ก่อนลงมือแก้โค้ด:

1. อ่านไฟล์นี้ทั้งไฟล์ก่อนเริ่มงาน
2. อ่าน `DASHBOARD_ARCHITECTURE_INDEX.md` เพื่อเข้าใจ architecture ปัจจุบัน
3. อ่านไฟล์จริงต่อไปนี้ก่อนออกแบบ implementation:
   - `dashboard-app/package.json`
   - `dashboard-app/vite.config.ts`
   - `dashboard-app/src/shared/types.ts`
   - `dashboard-app/src/main/dailyWorkService.ts`
   - `dashboard-app/src/main/ultralearningService.ts`
   - `dashboard-app/src/main/habitService.ts`
   - `dashboard-app/src/renderer/App.tsx`
   - `dashboard-app/src/renderer/components/DailyWorkPanel.tsx`
   - `dashboard-app/src/renderer/components/UltralearningPanel.tsx`
   - `dashboard-app/src/renderer/components/AtomicHabitsPanel.tsx`
   - `dashboard-app/src/renderer/charts/DailyWorkBarChart.tsx`
   - `dashboard-app/src/renderer/charts/HabitGrowthLineChart.tsx`
4. ตรวจ `git status` ก่อนแก้ เพื่อแยกงานของผู้ใช้/งานค้างออกจากงานของตัวเอง
5. ห้าม revert หรือแก้ไฟล์ที่ไม่เกี่ยวข้องกับแผนนี้
6. หลังแก้ต้องรันอย่างน้อย:
   - `cd dashboard-app && npm run typecheck`
   - `cd dashboard-app && npm test`
   - `cd dashboard-app && npm run build`
7. ต้องอัปเดต `DASHBOARD_ARCHITECTURE_INDEX.md` หลัง implement เสร็จ โดยเพิ่ม:
   - Test History
   - Changelog
   - Known Issues ถ้ามี
   - วิธี build/deploy web readonly

---

## 1. เป้าหมายหลัก

สร้างระบบเสริมชื่อ **GitHub Pages Read-only Dashboard** เพื่อให้สามารถ publish หน้า Dashboard ขึ้นเว็บ GitHub Pages สำหรับเปิดดูภาพรวมได้จาก browser โดยไม่ต้องเปิด Electron app

ระบบนี้ต้องเป็นแบบ **read-only snapshot viewer**:

- อ่านข้อมูลจากไฟล์ JSON ที่ export จากเครื่อง local
- ไม่เชื่อมต่อ `C:\...` บนเครื่องผู้ใช้
- ไม่เขียนกลับ Markdown
- ไม่แก้ SQLite
- ไม่ใช้ Electron IPC
- ไม่ใช้ `window.dashboardApi`
- ไม่ทำให้ dashboard หลักใช้งานเปลี่ยนไป

ข้อมูลไหลทางเดียว:

```text
Local Markdown + SQLite
  -> export sanitized snapshot
  -> dashboard-data.json
  -> static web UI
  -> GitHub Pages
```

---

## 2. ขอบเขตที่ต้องทำ

### 2.1 ต้องทำ

1. เพิ่ม data contract สำหรับ public snapshot
2. เพิ่ม export script สำหรับสร้าง `dashboard-data.json`
3. เพิ่ม Vite entry แยกสำหรับ web readonly
4. เพิ่ม build config แยกจาก Electron build เดิม
5. เพิ่ม UI readonly ที่ reuse หน้าตาเดิมเท่าที่เหมาะสม
6. เพิ่ม GitHub Actions workflow สำหรับ deploy static files ไป GitHub Pages
7. เพิ่ม test/QA เพื่อยืนยันว่า:
   - dashboard หลักไม่พัง
   - web readonly build ได้
   - snapshot ไม่มี absolute local path
   - snapshot ไม่มี raw markdown ทั้งไฟล์
   - web readonly ไม่มี write action
8. อัปเดต `DASHBOARD_ARCHITECTURE_INDEX.md`

### 2.2 ห้ามทำ

ห้ามทำสิ่งต่อไปนี้เด็ดขาด:

- ห้ามเปลี่ยน dashboard หลักจาก Electron เป็น web
- ห้ามเอา Electron app ทั้งตัวไป deploy ตรงๆ
- ห้ามให้ GitHub Pages อ่าน `C:\IE Engineer 2568\...` โดยตรง
- ห้าม publish full local path เช่น `C:\IE Engineer 2568\...`
- ห้าม publish raw note ทั้งไฟล์จาก Daily Logs หรือ UltraLearning
- ห้ามให้หน้าเว็บมีปุ่มแก้สถานะ task จริง
- ห้ามให้หน้าเว็บมีปุ่ม create/update/delete habit จริง
- ห้ามให้หน้าเว็บ save tomorrow plan
- ห้ามเพิ่ม backend server
- ห้ามเพิ่ม cloud database
- ห้ามเพิ่ม authentication เองในรอบนี้
- ห้ามเพิ่ม panel ที่ 4 ใน dashboard หลัก
- ห้ามเพิ่ม task status ใหม่เกิน `todo | doing | done`

---

## 3. Architecture ที่ต้องการ

เพิ่มระบบใหม่โดยแยกออกจาก Electron renderer เดิม:

```text
dashboard-app/
  src/
    main/
      dailyWorkService.ts            # ใช้เดิมตอน export snapshot
      ultralearningService.ts        # ใช้เดิมตอน export snapshot
      habitService.ts                # ใช้เดิมตอน export snapshot
    renderer/                        # Electron dashboard หลัก ห้ามทำให้ behavior เปลี่ยน
    web-readonly/                    # เพิ่มใหม่
      WebReadonlyApp.tsx
      main.tsx
      webReadonlyClient.ts
      webReadonly.css                # ถ้าจำเป็นเท่านั้น
    shared/
      types.ts                       # ใช้เดิม
      publicSnapshot.ts              # เพิ่มใหม่: type/schema/sanitize helpers
  scripts/
    exportPublicSnapshot.ts          # เพิ่มใหม่
  public-dashboard/
    dashboard-data.json              # output local; ต้องพิจารณาว่าจะ commit หรือไม่
  dist-web-readonly/                 # output build; ไม่ commit
  vite.web-readonly.config.ts        # เพิ่มใหม่
  .github/
    workflows/
      pages-readonly-dashboard.yml   # เพิ่มใหม่
```

### หลักสำคัญ

- `src/renderer/` ยังทำงานเหมือนเดิมกับ `window.dashboardApi`
- `src/web-readonly/` ต้องไม่ import `window.dashboardApi`
- shared component ใช้ได้เฉพาะกรณีที่ component นั้นไม่เรียก IPC เอง
- ถ้า component เดิมผูกกับ action/write มากเกินไป ให้สร้าง readonly component ใหม่แทน
- หลีกเลี่ยง refactor ใหญ่ในรอบแรก

---

## 4. Data Contract ของ Snapshot

เพิ่มไฟล์:

```text
dashboard-app/src/shared/publicSnapshot.ts
```

ให้ประกาศ type กลาง:

```ts
import type {
  DateRangePreset,
  Habit,
  HabitSeriesPoint,
  TaskSourceGroup,
  TaskStatus,
} from "./types";

export type PublicSnapshotVersion = 1;

export type PublicDailyTask = {
  id: string;
  title: string;
  status: TaskStatus;
  sourceFileName: string;
  sourceGroup?: TaskSourceGroup;
  sourceGroupLabel?: string;
  taskDate?: string;
  taskDateLabel?: string;
  due?: string;
  tags: string[];
};

export type PublicDailyWorkSnapshot = {
  total: number;
  todo: number;
  doing: number;
  done: number;
  tasks: PublicDailyTask[];
};

export type PublicUltralearningTask = {
  id: string;
  title: string;
  status: TaskStatus;
  sourceFileName: string;
  project?: string;
  phase?: string;
  week?: string;
  due?: string;
  tags: string[];
};

export type PublicUltralearningProject = {
  id: string;
  name: string;
  total: number;
  todo: number;
  doing: number;
  done: number;
  progress: number;
  lastUpdated?: string;
  tasks: PublicUltralearningTask[];
};

export type PublicAtomicHabitsSnapshot = {
  range: DateRangePreset;
  habits: Array<Pick<Habit, "id" | "name" | "color" | "description" | "identity">>;
  series: HabitSeriesPoint[];
};

export type PublicDashboardSnapshot = {
  version: PublicSnapshotVersion;
  generatedAt: string;
  timezone: "Asia/Bangkok";
  appName: "Personal Progress Dashboard";
  mode: "readonly";
  dailyWork: PublicDailyWorkSnapshot;
  ultralearning: {
    projectCount: number;
    projects: PublicUltralearningProject[];
  };
  atomicHabits: PublicAtomicHabitsSnapshot;
  redaction: {
    localPathsRemoved: true;
    rawMarkdownExcluded: true;
    sqliteExcluded: true;
  };
};
```

### ห้ามมี fields เหล่านี้ใน public snapshot

ห้าม include:

- `sourceFile`
- `rootPath`
- `rawLine`
- `sourceLine`
- `sourceHash`
- raw Markdown content
- note/comment ส่วนตัวจาก habit logs
- absolute Windows path
- SQLite file path

อนุญาตเฉพาะ:

- `sourceFileName`
- title ของ task
- status
- tag ที่ไม่ใช่ข้อมูลลับ
- วันที่/label/summary
- progress และ series สำหรับกราฟ

---

## 5. Export Script

เพิ่มไฟล์:

```text
dashboard-app/scripts/exportPublicSnapshot.ts
```

หน้าที่:

1. เรียก service เดิม:
   - `scanDailyWork()`
   - `scanUltralearning()`
   - `listHabits()`
   - `getHabitSeries({ range: "360d", scale: "linear" })`
2. sanitize ข้อมูลทุก domain
3. validate ว่าไม่มี path ลับหรือ raw content
4. เขียน output ไปที่:
   - `dashboard-app/public-dashboard/dashboard-data.json`
5. สร้าง folder ถ้ายังไม่มี
6. log summary หลัง export

### Pseudo-code

```ts
import fs from "fs/promises";
import path from "path";
import { scanDailyWork } from "../src/main/dailyWorkService.js";
import { scanUltralearning } from "../src/main/ultralearningService.js";
import { listHabits, getHabitSeries } from "../src/main/habitService.js";
import type { PublicDashboardSnapshot } from "../src/shared/publicSnapshot.js";

function sanitizeTask(task) {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    sourceFileName: task.sourceFileName,
    sourceGroup: task.sourceGroup,
    sourceGroupLabel: task.sourceGroupLabel,
    taskDate: task.taskDate,
    taskDateLabel: task.taskDateLabel,
    due: task.due,
    tags: task.tags,
  };
}

async function main() {
  const daily = await scanDailyWork();
  const ultra = await scanUltralearning();
  const habits = await listHabits();
  const series = await getHabitSeries({ range: "360d", scale: "linear" });

  const snapshot: PublicDashboardSnapshot = {
    version: 1,
    generatedAt: new Date().toISOString(),
    timezone: "Asia/Bangkok",
    appName: "Personal Progress Dashboard",
    mode: "readonly",
    dailyWork: {
      total: daily.total,
      todo: daily.todo,
      doing: daily.doing,
      done: daily.done,
      tasks: daily.tasks.map(sanitizeTask),
    },
    ultralearning: {
      projectCount: ultra.projectCount,
      projects: ultra.projects.map((project) => ({
        id: project.id,
        name: project.name,
        total: project.total,
        todo: project.todo,
        doing: project.doing,
        done: project.done,
        progress: project.progress,
        lastUpdated: project.lastUpdated,
        tasks: project.tasks.map(sanitizeTask),
      })),
    },
    atomicHabits: {
      range: "360d",
      habits: habits.map(({ id, name, color, description, identity }) => ({
        id,
        name,
        color,
        description,
        identity,
      })),
      series,
    },
    redaction: {
      localPathsRemoved: true,
      rawMarkdownExcluded: true,
      sqliteExcluded: true,
    },
  };

  assertPublicSnapshotSafe(snapshot);

  const outDir = path.resolve("public-dashboard");
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(
    path.join(outDir, "dashboard-data.json"),
    `${JSON.stringify(snapshot, null, 2)}\n`,
    "utf8",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### Safety validator

เพิ่ม helper:

```ts
export function assertPublicSnapshotSafe(snapshot: PublicDashboardSnapshot): void {
  const serialized = JSON.stringify(snapshot);
  const forbiddenPatterns = [
    /[A-Z]:\\\\/i,
    /C:\\//i,
    /sourceFile/i,
    /rootPath/i,
    /rawLine/i,
    /sourceHash/i,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(serialized)) {
      throw new Error(`Unsafe public snapshot content matched ${pattern}`);
    }
  }
}
```

หมายเหตุ: validator ต้องระวังไม่ false positive กับคำว่า `sourceFileName` ถ้าใช้ `/sourceFile/i` แบบตรงๆ จะจับผิดด้วย ควรตรวจ key object แบบเจาะจงหรือ regex ที่แม่นกว่า เช่น `"sourceFile":`

---

## 6. Web Read-only App

เพิ่ม folder:

```text
dashboard-app/src/web-readonly/
```

### 6.1 `main.tsx`

หน้าที่:

- render `WebReadonlyApp`
- import CSS หลักที่ใช้ร่วมได้ เช่น `../renderer/styles/tokens.css`, `../renderer/styles/global.css`, `../renderer/styles/layout.css`
- import CSS เฉพาะ readonly ถ้าจำเป็น

ห้าม import:

- `../renderer/App`
- `dashboardApi.types`
- Electron preload/main

### 6.2 `webReadonlyClient.ts`

หน้าที่:

- fetch `dashboard-data.json`
- validate shape ขั้นต้น
- return `PublicDashboardSnapshot`
- fallback เป็น error state ถ้าไม่มีไฟล์

Pseudo-code:

```ts
import type { PublicDashboardSnapshot } from "../shared/publicSnapshot";

export async function fetchPublicSnapshot(): Promise<PublicDashboardSnapshot> {
  const response = await fetch(`${import.meta.env.BASE_URL}dashboard-data.json`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Cannot load dashboard-data.json (${response.status})`);
  }

  const data = (await response.json()) as PublicDashboardSnapshot;
  if (data.mode !== "readonly" || data.version !== 1) {
    throw new Error("Unsupported dashboard snapshot");
  }
  return data;
}
```

### 6.3 `WebReadonlyApp.tsx`

หน้าที่:

- แสดง 3 panels เหมือน dashboard หลัก:
  - Daily Work
  - Ultralearning
  - Atomic Habits
- แสดง badge ชัดเจนว่า `Read-only snapshot`
- แสดง `generatedAt`
- ไม่มีปุ่ม refresh ที่เรียก local scanner
- ถ้ามี refresh ให้เป็น browser reload/fetch JSON ใหม่เท่านั้น
- ปิด/ซ่อน action ที่เขียนข้อมูล

โครง UI:

```tsx
export function WebReadonlyApp() {
  const [snapshot, setSnapshot] = useState<PublicDashboardSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicSnapshot()
      .then(setSnapshot)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  if (error) return <ErrorState title="โหลด snapshot ไม่สำเร็จ" message={error} />;
  if (!snapshot) return <LoadingState label="กำลังโหลด dashboard snapshot" />;

  return (
    <div className="app-shell app-shell--readonly">
      <ReadonlyTopBar generatedAt={snapshot.generatedAt} />
      <main className="app-content">
        <div className="dashboard-grid">
          <ReadonlyDailyWorkPanel data={snapshot.dailyWork} />
          <ReadonlyUltralearningPanel data={snapshot.ultralearning} />
          <ReadonlyAtomicHabitsPanel data={snapshot.atomicHabits} />
        </div>
      </main>
    </div>
  );
}
```

---

## 7. Component Strategy

ให้เลือกตามความเสี่ยง:

### ทางเลือก A: Reuse component เดิม

ใช้เมื่อ component:

- รับ props เป็น data อย่างเดียว
- ไม่มีการเรียก `window.dashboardApi`
- ไม่มีการเขียนกลับข้อมูล

เหมาะกับ:

- chart components บางตัว
- `StatusCheckbox` ถ้าเพิ่ม prop `readonly`
- loading/error state
- visual pieces

### ทางเลือก B: สร้าง readonly component ใหม่

ใช้เมื่อ component เดิม:

- ผูกกับ callback เขียนข้อมูล
- มี modal create/update
- มีปุ่ม Source/Read ที่อ่านไฟล์ local
- มี state ที่ขึ้นกับ Electron app

แนะนำสร้างใหม่:

```text
src/web-readonly/components/
  ReadonlyDailyWorkPanel.tsx
  ReadonlyDailyTaskList.tsx
  ReadonlyUltralearningPanel.tsx
  ReadonlyAtomicHabitsPanel.tsx
  ReadonlyTopBar.tsx
```

รอบแรกแนะนำ **ทางเลือก B เป็นหลัก** เพื่อกันกระทบ dashboard หลัก

---

## 8. พฤติกรรม UI ที่ต้องการ

### 8.1 Top Bar

ต้องมี:

- ชื่อแอพ
- badge `Read-only`
- generated date/time
- note สั้นๆ: `Snapshot data, no write access`

ห้ามมี:

- ปุ่มแผนพรุ่งนี้ที่เปิด drawer edit
- profile settings ถ้าไม่จำเป็น
- refresh local scanner

### 8.2 Daily Work Panel

แสดง:

- KPI total/todo/doing/done
- bar chart
- source group filter
- task list พร้อม:
  - title
  - status visual
  - source group
  - task date label
  - source file name

ห้ามมี:

- checkbox ที่เปลี่ยนสถานะจริง
- ปุ่ม `Read`
- ปุ่ม `Source`
- write-back Markdown

ถ้าต้องการ checkbox visual:

- ใช้ disabled checkbox หรือ status pill
- cursor ต้องไม่สื่อว่ากดแก้ได้

### 8.3 Ultralearning Panel

แสดง:

- project list
- progress bar
- total/done/doing/todo
- detail expand ภายในหน้าได้
- task list readonly

ห้ามมี:

- write-back checkbox
- open source local file
- read markdown source

### 8.4 Atomic Habits Panel

แสดง:

- growth line chart
- legend
- hide/show line ได้เฉพาะ UI state ใน browser
- range/zoom controls ที่คำนวณจาก snapshot ได้

ห้ามมี:

- create habit
- update today
- delete habit
- edit note
- write SQLite

---

## 9. Build Config

เพิ่มไฟล์:

```text
dashboard-app/vite.web-readonly.config.ts
```

โครง:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: process.env.GITHUB_PAGES_BASE || "./",
  plugins: [react()],
  build: {
    outDir: "dist-web-readonly",
    emptyOutDir: true,
  },
  publicDir: "public-dashboard",
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "src/shared"),
    },
  },
});
```

เพิ่ม `index.html` สำหรับ readonly ถ้าจำเป็น:

```text
dashboard-app/index.web-readonly.html
```

หรือใช้ config `build.rollupOptions.input`:

```ts
build: {
  outDir: "dist-web-readonly",
  rollupOptions: {
    input: path.resolve(__dirname, "index.web-readonly.html"),
  },
}
```

### Scripts ใน `package.json`

เพิ่ม:

```json
{
  "export:public": "tsx scripts/exportPublicSnapshot.ts",
  "build:web-readonly": "vite build --config vite.web-readonly.config.ts",
  "preview:web-readonly": "vite preview --outDir dist-web-readonly"
}
```

แต่ตอนนี้ `tsx` ยังไม่มีใน devDependencies  
ให้เลือกหนึ่งทาง:

1. เพิ่ม `tsx` เป็น devDependency
2. หรือใช้ `tsc` compile script ก่อนรัน

แนะนำเพิ่ม `tsx` เพราะโปรเจคมี TypeScript scripts และทำให้งาน export ง่ายกว่า

---

## 10. GitHub Pages Workflow

เพิ่ม:

```text
dashboard-app/.github/workflows/pages-readonly-dashboard.yml
```

หรือถ้า repository root เป็น workspace หลัก ให้ใช้:

```text
.github/workflows/pages-readonly-dashboard.yml
```

ต้องตรวจโครง repo จริงก่อนเลือกตำแหน่ง  
โดยทั่วไป GitHub Actions workflow ต้องอยู่ที่ root repo:

```text
.github/workflows/pages-readonly-dashboard.yml
```

Workflow ตัวอย่าง:

```yaml
name: Deploy Read-only Dashboard to GitHub Pages

on:
  workflow_dispatch:
  push:
    branches:
      - master
    paths:
      - "dashboard-app/src/web-readonly/**"
      - "dashboard-app/src/shared/**"
      - "dashboard-app/public-dashboard/dashboard-data.json"
      - "dashboard-app/vite.web-readonly.config.ts"
      - "dashboard-app/index.web-readonly.html"
      - "dashboard-app/package.json"
      - "dashboard-app/package-lock.json"

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages-readonly-dashboard"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: dashboard-app/package-lock.json

      - name: Install dependencies
        working-directory: dashboard-app
        run: npm ci

      - name: Build web readonly
        working-directory: dashboard-app
        run: npm run build:web-readonly

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dashboard-app/dist-web-readonly

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

หมายเหตุ:

- Workflow นี้ไม่ควร export data จาก private local files บน GitHub runner
- ให้ commit หรือ upload `public-dashboard/dashboard-data.json` ที่ผ่าน sanitize แล้วเท่านั้น
- ถ้าไม่ต้องการ commit snapshot จริง ให้ deploy ผ่าน manual artifact จากเครื่องแทน แต่รอบแรกให้ใช้แบบ commit sanitized JSON เพื่อความง่าย

---

## 11. Privacy และ Redaction Rules

ก่อน publish ต้องตรวจ:

### 11.1 ห้ามมี path

ห้าม snapshot มี:

```text
C:\
C:/
IE Engineer 2568
มหาลัยและโรงงาน
รวมไฟล์ปริญญานิพพน
Daily Logs
UltraLearning-Project
dashboard.sqlite
```

ข้อยกเว้น:

- `sourceFileName` เช่น `[DailyLog_]2026-06-23.md`
- project name ที่ผู้ใช้ตั้งใจให้ public

### 11.2 ห้ามมี raw content

ห้ามมี:

- full markdown file content
- private note/comment
- tomorrow plan notes
- raw line
- source hash

### 11.3 ต้องมี explicit metadata

snapshot ต้องมี:

```json
"redaction": {
  "localPathsRemoved": true,
  "rawMarkdownExcluded": true,
  "sqliteExcluded": true
}
```

### 11.4 คำเตือนใน UI

หน้าเว็บต้องแสดงข้อความเล็กๆ:

```text
Read-only snapshot · Generated at <date> · No local files are connected
```

---

## 12. Tests ที่ต้องเพิ่ม

### 12.1 Unit test: snapshot sanitizer

เพิ่มไฟล์:

```text
dashboard-app/tests/publicSnapshot.test.ts
```

Test cases:

1. `sanitizeDailyTask` ไม่คืน `sourceFile`
2. `sanitizeDailyTask` ไม่คืน `rawLine`
3. `sanitizeUltralearningProject` ไม่คืน `rootPath`
4. `assertPublicSnapshotSafe` fail เมื่อเจอ `C:\`
5. `assertPublicSnapshotSafe` pass เมื่อมีแค่ `sourceFileName`
6. snapshot version ต้องเป็น `1`
7. mode ต้องเป็น `readonly`

### 12.2 Export script test

ถ้าทำได้โดยไม่ยุ่งกับ SQLite จริง:

- ใช้ fixture/temp workspace แบบเดียวกับ smoke tests
- ใช้ `DASHBOARD_CONFIG_PATH`
- export ไป temp folder
- assert JSON shape

ถ้าซับซ้อนเกินในรอบแรก:

- ให้ test เฉพาะ sanitizer + schema ก่อน
- manual QA export script

### 12.3 Web readonly build test

ขั้นต่ำ:

```powershell
cd dashboard-app
npm run build:web-readonly
```

ถ้ามีเวลา:

- เพิ่ม smoke test ด้วย Playwright ในอนาคต
- ไม่บังคับในรอบแรก เพราะโปรเจคยังไม่มี Playwright

---

## 13. Manual QA Checklist

หลัง implement ให้ตรวจด้วยมือ:

### Electron dashboard หลัก

- เปิดแอพเดิมได้
- Daily task ยัง scan ได้
- checkbox ยัง write-back ได้
- Read/Source ยังใช้ได้
- Atomic habit create/update ยังใช้ได้
- hidden line persistence ยังจำค่าได้
- Tomorrow Plan ยังทำงานเหมือนเดิม

### Export snapshot

รัน:

```powershell
cd dashboard-app
npm run export:public
```

ตรวจ:

- มี `public-dashboard/dashboard-data.json`
- JSON เปิดอ่านได้
- มี `generatedAt`
- ไม่มี absolute path
- ไม่มี raw markdown
- มี task/project/habit summary

### Web readonly

รัน:

```powershell
cd dashboard-app
npm run build:web-readonly
npm run preview:web-readonly
```

ตรวจ:

- หน้าเว็บโหลดได้
- แสดง 3 panels
- กราฟไม่ blank
- filter/legend local UI ใช้ได้
- ไม่มีปุ่มแก้ข้อมูลจริง
- ไม่มี console error เรื่อง `window.dashboardApi`

### GitHub Pages

หลัง deploy:

- เปิด URL Pages ได้
- refresh แล้วไม่ 404
- asset path ถูกต้อง
- `dashboard-data.json` โหลดได้
- ไม่มีข้อมูลลับใน DevTools Network response

---

## 14. Acceptance Criteria

งานถือว่าเสร็จเมื่อครบทุกข้อ:

1. มี `PublicDashboardSnapshot` type และ sanitizer
2. มี `exportPublicSnapshot.ts`
3. สร้าง `dashboard-data.json` ได้
4. มี web readonly entry แยกจาก Electron renderer
5. web readonly ไม่ใช้ `window.dashboardApi`
6. web readonly build ได้
7. GitHub Pages workflow พร้อมใช้
8. Electron dashboard หลักยังผ่าน:
   - `npm run typecheck`
   - `npm test`
   - `npm run build`
9. เพิ่ม test สำหรับ snapshot safety อย่างน้อย 5 cases
10. `DASHBOARD_ARCHITECTURE_INDEX.md` อัปเดตแล้ว
11. ไม่มี absolute path/raw markdown ใน public snapshot
12. ไม่มี write action ใน public UI

---

## 15. Suggested Implementation Phases

### Phase 0: Preflight

- อ่านเอกสารและไฟล์ที่ระบุ
- รัน baseline:

```powershell
cd dashboard-app
npm run typecheck
npm test
npm run build
```

- ถ้า baseline fail ให้หยุดและรายงานก่อน อย่าแก้รวมกับงานนี้

### Phase 1: Public Snapshot Types

แก้/เพิ่ม:

- `src/shared/publicSnapshot.ts`
- `tests/publicSnapshot.test.ts`

ต้องผ่าน:

```powershell
npm test
npm run typecheck
```

### Phase 2: Export Script

แก้/เพิ่ม:

- `scripts/exportPublicSnapshot.ts`
- `package.json` เพิ่ม `export:public`
- เพิ่ม `tsx` ถ้าจำเป็น

ต้องผ่าน:

```powershell
npm run export:public
npm test
npm run typecheck
```

### Phase 3: Web Read-only Entry

แก้/เพิ่ม:

- `src/web-readonly/main.tsx`
- `src/web-readonly/WebReadonlyApp.tsx`
- `src/web-readonly/webReadonlyClient.ts`
- readonly components ตามจำเป็น
- `index.web-readonly.html`
- `vite.web-readonly.config.ts`
- `package.json` เพิ่ม `build:web-readonly`, `preview:web-readonly`

ต้องผ่าน:

```powershell
npm run build:web-readonly
```

### Phase 4: UI Polish แบบไม่แตะ Core

- ปรับ CSS เฉพาะ readonly ถ้าจำเป็น
- ถ้าต้องแก้ `layout.css` ให้แน่ใจว่า Electron app ไม่เพี้ยน
- ห้าม refactor ใหญ่

### Phase 5: GitHub Pages Workflow

เพิ่ม:

- `.github/workflows/pages-readonly-dashboard.yml`

ตรวจ:

- path ถูกต้องจาก root repo
- deploy `dashboard-app/dist-web-readonly`
- ไม่พยายามอ่าน local files บน GitHub runner

### Phase 6: Final QA + Index

รัน:

```powershell
cd dashboard-app
npm run typecheck
npm test
npm run build
npm run export:public
npm run build:web-readonly
```

อัปเดต:

- `DASHBOARD_ARCHITECTURE_INDEX.md`

---

## 16. Rollback Plan

ถ้า web readonly ทำให้ dashboard หลักมีปัญหา:

1. ห้าม revert ทั้ง repo
2. แยก revert เฉพาะไฟล์ที่เพิ่มในงานนี้:
   - `src/web-readonly/**`
   - `src/shared/publicSnapshot.ts`
   - `scripts/exportPublicSnapshot.ts`
   - `vite.web-readonly.config.ts`
   - `index.web-readonly.html`
   - `.github/workflows/pages-readonly-dashboard.yml`
   - test ที่เพิ่มเฉพาะ public snapshot
3. ถ้ามีการแก้ component shared แล้วทำให้ Electron เพี้ยน ให้ย้อนเฉพาะ commit/patch ของ component นั้น
4. รัน `npm run typecheck`, `npm test`, `npm run build` เพื่อยืนยัน dashboard หลักกลับมาปกติ

---

## 17. Final Notes สำหรับ AI ที่รับงาน

- งานนี้เป็นงานเพิ่ม “ทางดูข้อมูล” ไม่ใช่งานเปลี่ยนระบบหลัก
- ให้คิดว่า GitHub Pages เป็นภาพถ่ายของ dashboard ไม่ใช่ dashboard ตัวจริง
- สิ่งสำคัญที่สุดคือ privacy และไม่กระทบ Electron
- ถ้าเจอทางเลือกระหว่าง reuse component เดิมกับสร้าง readonly component ใหม่ ให้เลือกทางที่เสี่ยงต่ำกว่า
- ถ้าไม่มั่นใจว่าข้อมูล field ไหนปลอดภัย ห้าม export field นั้น
- หลังจบงานต้องบันทึก index ให้คนถัดไปเข้าใจทันทีว่ามี web readonly mode เพิ่มเข้ามาอย่างไร

