# Knowledge Gate — แบบทดสอบก่อนเริ่มเก็บข้อมูล

> **กฎ:** ห้ามเริ่มเก็บข้อมูลทดลองใด ๆ (Time Study, Downtime Log, Tool Life, Dimension Check) จนกว่าจะผ่าน Gate นี้  
> **เกณฑ์ผ่าน:** ≥ **9/10** ข้อ Must-pass + ทำ drill Statistics_For_Engineers สัปดาห์ 1–2 อย่างน้อย **50%**  
> **หลังผ่าน:** บันทึกวันที่ใน [Assumptions_Log](../Assumptions_Log.md) แล้วเริ่ม [Operation Plan §1](../Operation_Plan_v4.md)

---

## วิธีใช้

1. อ่านครบ Phase 0–3  
2. ตอบคำถาม Must-pass ด้านล่าง — เขียนคำตอบสั้น ๆ ใน Obsidian หรือสมุด  
3. เปรียบกับเฉลย — ถ้าผิด กลับไปอ่าน Phase ที่เกี่ยว  
4. ทำ checklist Drill จาก Statistics_For_Engineers  
5. ลงนามตัวเองในตารางบันทึกท้ายไฟล์

---

## Must-pass (10 ข้อ)

ทำเครื่องหมาย ✅ เมื่อตอบได้โดยไม่เปิดสูตร (ยกเว้นข้อที่ระบุ)

### ข้อ 1 — ICT vs อายุมีด

**คำถาม:** อธิบายความต่าง ICT กับอายุมีดบน MACOD 1569 พร้อมหน่วยและวัตถุประสงค์

<details>
<summary>เฉลย (เปิดหลังลองตอบ)</summary>

- **ICT** = เวลาระหว่าง piece-out → piece-out (วินาที/ชิ้น) — ใช้ PDCA 1 / OEE Performance  
- **อายุมีด** = จำนวนชิ้นที่ผลิตได้ต่อรอบติดตั้งมีด (ชิ้น) — ใช้ PDCA 2 / Weibull / t_p*  
- Multi-spindle pipeline: **ห้าม** บวกเวลา 4 สถานีเป็น ICT

</details>

---

### ข้อ 2 — Failure Mode และ Censored

**คำถาม:** จำแนก 3 เคสนี้ — failure_mode และ censored_flag

| เคส | เหตุการณ์ |
|-----|-----------|
| A | เกลียว No-Go หลัง 12,800 ชิ้น |
| B | มีดหักกลางกะ |
| C | ถอดมีดเพื่อทดลองลับ ก่อนถึงพิกัด |

<details>
<summary>เฉลย</summary>

| เคส | failure_mode | censored_flag |
|-----|--------------|---------------|
| A | wear | F |
| B | breakage | F |
| C | censored | C |

</details>

---

### ข้อ 3 — OEE Demand-adjusted

**คำถาม:** เขียน 5 ขั้นคำนวณ OEE แบบ demand-adjusted และบอกว่า downtime "ไม่มีลัง" อยู่ขั้นไหน

<details>
<summary>เฉลย</summary>

1. Effective Loading = เวลาเปิดกะ − พักระเบียบ − **No-demand (ไม่มีลัง)**  
2. Availability = Run Time / Effective Loading  
3. Performance = (ICT × ชิ้นผลิต) / Run Time  
4. Quality = ชิ้นดี / ชิ้นทั้งหมด  
5. OEE = A × P × Q  

"ไม่มีลัง" หักใน **ขั้น 1** — ไม่นับเป็นความล้มเหลวของเครื่องกลึง

</details>

---

### ข้อ 4 — Weibull β > 1

**คำถาม:** β > 1 หมายถึงอะไร? ทำไม PM ตามอายุมีความหมาย?

<details>
<summary>เฉลย</summary>

β > 1 = **wear-out failure** — อัตราเสียเพิ่มตามอายุ (สึกหมอ)  
PM ตามอายุมีประโยชน์เพราะเปลี่ยนก่อนช่วงที่ความเสี่ยงพุ่งสูง — ลด catastrophic และ scrap ได้เมื่อรวมกับต้นทุน

</details>

---

### ข้อ 5 — F vs C ใน Weibull

**คำถาม:** F (Failed) กับ C (Censored) ต่างกันอย่างไร? มีผลต่อ likelihood อย่างไร?

<details>
<summary>เฉลย</summary>

- **F:** ถึงเกณฑ์ EOL — ใช้ density $f(t)$ ใน log-likelihood  
- **C:** ถอดก่อนเกณฑ์ — ใช้ survival $R(t)$ ใน log-likelihood  
- ถ้าบันทึกผิด จะ bias ประมาณ β, η และ t_p*

</details>

---

### ข้อ 6 — Competing Risks

**คำถาม:** อธิบาย competing risks แบบง่าย และทำไม $C_f$ ต้องถ่วงด้วย $p_{cat}$

<details>
<summary>เฉลย</summary>

มีดเสียได้ 2 แบบที่แข่งกัน: **สึก (W)** กับ **หัก (K)** — ต้นทุนต่างกันมาก  
ถ้ารวมเป็นต้นทุนพังเดียวจะประเมินผิด — ต้องใช้ $p_{cat} = F_K/(F_W+F_K)$ ถ่วง $C_K$ กับ $C_W$

</details>

---

### ข้อ 7 — N_max

**คำถาม:** อธิบาย $N_{\max}$ แบบ geometry และ economic

<details>
<summary>เฉลย</summary>

- **Geometry:** $N_{\max}^{geo} = \lfloor(L_0 - L_{\min})/\Delta g\rfloor$ — จำกัดทางกายภาพ  
- **Economic:** ลับครั้งที่ k คุ้มเมื่อ CPP ของมีดลับ ≤ CPP มีดใหม่  
- **นโยบาย:** $N_{\max} = \min(N_{\max}^{geo}, N_{\max}^{econ})$

</details>

---

### ข้อ 8 — CI แทน p-value

**คำถาม:** ทำไมใช้ Estimation + CI แทน NHST เมื่อ n=5?

<details>
<summary>เฉลย</summary>

Sample เล็ก → **power ต่ำ** — p-value ไม่น่าเชื่อถือ  
CI บอกช่วงความเป็นไปได้ของพารามิเตอร์ + รายงานข้อจำกัด + sensitivity ตรงไปตรงมากว่า overclaim

</details>

---

### ข้อ 9 — Gage R&R

**คำถาม:** Gage R&R คืออะไร? ทำไมต้องทำก่อน SPC?

<details>
<summary>เฉลย</summary>

วิเคราะห์ความแปรปรวนจากเครื่องมือ (repeatability) และผู้วัด (reproducibility)  
ถ้า %GR&R ≥ 30% สัญญาณจากการวัดไม่น่าเชื่อถือ — SPC จะ alarm จาก noise ไม่ใช่จากกระบวนการ

</details>

---

### ข้อ 10 — Mock Defense (ข้อ 1–3)

**คำถาม:** ตอบสั้น ๆ 3 ข้อ:

1. ทำไมประหยัดเงินตรง ๆ น้อยแต่ยังมีคุณค่า?  
2. ทำไมไม่เพิ่ม throughput?  
3. N เล็ก defend อย่างไร?

<details>
<summary>เฉลย</summary>

1. ผลิตภาพ = ลดต้นทุนที่ output เท่าเดิม; มูลค่าหลัก = กัน scrap, regrind policy, pilot scale-up  
2. Demand-paced — ผลิตเกิน = WIP; 82% downtime = ไม่มีลัง (No-demand)  
3. รายงาน CI + sensitivity + ข้อจำกัดตรงไปตรงมา; MRR/Bayesian prior จาก 9 ค่า

</details>

---

## Drill Statistics_For_Engineers (อย่างน้อย 50%)

ทำเครื่องหมายเมื่อเสร็จ:

### Week 0–1
- [ ] [Week0_Foundation.md](../../../DeepReasearchเพื่อการเรียนรู้/UltraLearning-Project/Statistics_For_Engineers/Week_0/Week0_Foundation.md) อ่านครบ  
- [ ] [Week1_N_prime.md](../../../DeepReasearchเพื่อการเรียนรู้/UltraLearning-Project/Statistics_For_Engineers/Week_1/Week1_N_prime.md) + คำนวณ N' อย่างน้อย 1 ชุด  
- [ ] [Week1_Gage_RR.md](../../../DeepReasearchเพื่อการเรียนรู้/UltraLearning-Project/Statistics_For_Engineers/Week_1/Week1_Gage_RR.md) อ่านครบ  
- [ ] [Week1_Drills.md](../../../DeepReasearchเพื่อการเรียนรู้/UltraLearning-Project/Statistics_For_Engineers/Week_1/Week1_Drills.md) ทำอย่างน้อย 50%

### Week 2
- [ ] [Week2_Weibull_Censoring.md](../../../DeepReasearchเพื่อการเรียนรู้/UltraLearning-Project/Statistics_For_Engineers/Week_2/Week2_Weibull_Censoring.md) อ่านครบ  
- [ ] รัน `weibull_tool_life.py` และอธิบาย β, η, B10  
- [ ] [Week2_Competing_Risks.md](../../../DeepReasearchเพื่อการเรียนรู้/UltraLearning-Project/Statistics_For_Engineers/Week_2/Week2_Competing_Risks.md) อ่านครบ  
- [ ] [Week2_Mock_Defense.md](../../../DeepReasearchเพื่อการเรียนรู้/UltraLearning-Project/Statistics_For_Engineers/Week_2/Week2_Mock_Defense.md) ตอบอย่างน้อย 3 ข้อ

---

## Rubric สรุป

| ระดับ | เงื่อนไข | การกระทำ |
|-------|----------|----------|
| **ผ่าน** | ≥9/10 Must-pass + Drill ≥50% | เริ่ม Operation Plan; บันทึกวันที่ผ่าน Gate |
| **เกือบผ่าน** | 7–8/10 | ทบทวน Phase ที่ผิด 1–2 วัน แล้วทำซ้ำ |
| **ไม่ผ่าน** | <7/10 | ห้ามเก็บข้อมูล — เรียน Phase 0–2 ใหม่ |

---

## หลังผ่าน Gate — สิ่งที่ทำทันที

| ลำดับ | งาน | อ้างอิง |
|-------|-----|---------|
| 1 | ขอตัวเลขต้นทุน (G0) | Operation Plan §1-A |
| 2 | วัด geometry มีด L₀, L_min, Δg | Operation Plan §1-B |
| 3 | ตั้งเทมเพลต + Assumptions Log | templates/, Assumptions_Log |
| 4 | ขอความยินยอมวิดีโอ (G1.5) | Operation Plan §9 |
| 5 | คุยอาจารย์ยืนยันทิศทาง v4 | Operation Plan §1-E |
| 6 | เริ่มบันทึกอายุมีด + Time Study | Operation Plan §5 |

บันทึกใน Assumptions Log:

| สมมติฐาน | ค่า | แหล่ง | วันที่ | สถานะ |
|----------|-----|-------|--------|--------|
| Knowledge Gate ผ่าน | วันที่ ___ | Self-assessment | ___ | verified |
| วันเริ่มเก็บข้อมูล | วันที่ ___ | Operation Plan +2w | ___ | verified |

---

## บันทึกการประเมินตัวเอง

| วันที่ | Must-pass (x/10) | Drill % | ผล | ลายมือชื่อ |
|--------|----------------|---------|-----|-----------|
| | | | ผ่าน / ไม่ผ่าน | |

---

**แท็ก:** #knowledge-plan #gate #checklist #pre-data
