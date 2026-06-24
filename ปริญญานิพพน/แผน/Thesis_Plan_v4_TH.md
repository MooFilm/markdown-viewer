# โครงร่างปริญญานิพนธ์ (Thesis Plan V4: The Academic & Industrial Hybrid)

> **วิสัยทัศน์ของแผน V4 (Senior Engineer & Professor Perspective):**  
> จากการสืบค้นวรรณกรรมและงานวิจัยเชิงลึก (Deep Research via Elicit) แผน V4 จะเป็นการหลอมรวม **"ความดิบเถื่อนของข้อมูลหน้างาน (Shop Floor Data)"** เข้ากับ **"ความลุ่มลึกทางคณิตศาสตร์และวิศวกรรม (Advanced IE Models)"** ระดับสากล เราจะไม่ใช่แค่จับเวลาแล้วเปลี่ยนมีด แต่เราจะใช้สถิติชั้นสูงมาสร้างโมเดลต้นทุนที่เถียงไม่ได้!

**หัวข้อวิทยานิพนธ์:**  
การเพิ่มผลิตภาพและปรับปรุงต้นทุนกระบวนการกลึง CNC: การบูรณาการวิศวกรรมความน่าเชื่อถือ สถิติควบคุม และการจัดการคอขวดของระบบ  
*(Productivity and Cost Optimization in CNC Turning: An Integration of Reliability Engineering, SPC, and Flow Constraint Management)*

**ผู้จัดทำ:** ธีรศักดิ์ ขิตะการ  
**เครื่องจักรเป้าหมาย:** CNC MACOD No.1569 | **ผลิตภัณฑ์:** Head Case HC15-25  
**เวอร์ชัน:** 4.0 (The Ultimate Literature-Backed Plan)

---

## 1. จุดประกายปัญหาและช่องว่างงานวิจัย (Problem Statement & Research Gap)

จากงานวิจัยที่รวบรวมผ่าน Elicit และข้อมูลหน้าเครื่อง เราพบว่า:
1. **The OEE Illusion:** ค่า OEE > 100% เกิดจากเวลามาตรฐานที่ไม่แม่นยำ งานวิจัยล่าสุดชี้ว่า *Inaccurate standard cycle times* ทำลายความน่าเชื่อถือของระบบการวางแผนทั้งหมด
2. **The Tooling Dilemma:** การเปลี่ยนมีดกลึงตาม "ความรู้สึก" หรือ "ค่าเฉลี่ยแบบเหมาเข่ง" นำไปสู่การเปลี่ยนก่อนกำหนด (สูญเสียเงิน) หรือเปลี่ยนช้าเกินไป (งานเสีย/Rework) การแก้ไขปัญหานี้ต้องใช้แบบจำลองทางคณิตศาสตร์ ไม่ใช่แค่การเดา
3. **The System Bottleneck:** เวลาหยุด 82% จาก "การไม่มีลังจากแผนกประกอบ" ถูกมองข้าม ทั้งที่งานวิจัยด้าน *Energy Economics* และ *Human Factors* ชี้ว่าเครื่องจักรที่จอดรอคิวงาน (Idling) ก่อให้เกิดการสูญเสียพลังงานและต้นทุนแฝงมหาศาล

---

## 2. ทฤษฎีหลักที่จะถูกใช้ในเล่ม (Core Literature & Academic Framework)

จากฐานข้อมูลงานวิจัย (PBL3, PM, OEE IoT) เราจะตีกรอบทฤษฎีที่จะใช้เขียนบทที่ 2 ดังนี้:

| หมวดหมู่ | ทฤษฎีและโมเดลอ้างอิงระดับโลก | นำมาแก้ปัญหาอะไรในโปรเจกต์นี้ |
|---|---|---|
| **Reliability Engineering** | **Weibull Distribution** | เลิกใช้ค่าเฉลี่ย (Mean) มาคำนวณอายุมีดกลึงที่มีความแปรปรวนสูง แต่ใช้ Weibull หาพฤติกรรมการเสื่อมสภาพ (Beta, Eta) ของมีดปาดหน้าและมีดเกลียว |
| **Machining Science** | **Taylor's Tool Life Equation** | เข้าใจความสัมพันธ์ของสภาวะการตัด (Cutting force, Wear) เพื่อหาระยะเปลี่ยนมีดที่เหมาะสม |
| **Engineering Economy** | **Cost Optimization Models for PM** | สร้างสมการหาจุดคุ้มทุนระหว่าง ต้นทุนมีดใหม่ (PM Cost) vs ต้นทุนการผลิตของเสียเมื่อมีดแตก (Failure Cost) |
| **Lean & Quality** | **SMED & SPC (Control Charts)** | ลดเวลาตั้งเครื่อง (Setup time) และพิสูจน์คุณภาพชิ้นงานระหว่างอายุมีด |
| **System Dynamics** | **OEE & Energy Economics** | ชี้ให้เห็นว่าการผลิตไปถมแผนกประกอบ (Overproduction) ก่อให้เกิดการสูญเสียพลังงานโดยเปล่าประโยชน์ |

---

## 3. ระเบียบวิธีวิจัยขั้นสูง (The 4-Phase Methodology)

แผนนี้จะดึงคุณออกจากวิศวกรฝึกหัด สู่การเป็นวิศวกรวิเคราะห์ (Analytical Engineer):

### Phase 1: Data Rectification & Human Factors (ล้างไพ่ข้อมูล)
*   **Action:** ใช้ Time Study ด้วยการอัดวิดีโอเพื่อวิเคราะห์ Micro-motion กำหนด Standard Time ใหม่ 
*   **Academic Hook:** ผนวกเรื่อง *Human factors and operator acceptance* ในการทำเช็คชีทและรับมือกับความเปลี่ยนแปลงของพนักงานเมื่อต้องทำตามเวลามาตรฐานใหม่
*   **Output:** Baseline OEE ที่เชื่อถือได้ 100%

### Phase 2: Reliability Modeling (วิศวกรรมความน่าเชื่อถือของมีดกลึง)
*   **Action:** นำข้อมูลอายุการใช้งานของมีดกลึงปาดหน้า (4,150 ชิ้น) และมีดเกลียว (13,991 ชิ้น) มาพล็อตกราฟ **Weibull Distribution**
*   **Academic Hook:** หากค่า $\beta > 1$ (Wear-out failure) หมายความว่าเราสามารถเซ็ตระยะ PM ได้อย่างแม่นยำ แต่ถ้า $\beta \approx 1$ (Random failure) เราอาจต้องใช้ *Condition monitoring* แทนการนับชิ้น 
*   **Output:** สมการความน่าเชื่อถือ (Reliability curve) ของเครื่องมือตัดแยกแต่ละจุด

### Phase 3: Mathematical Cost Optimization (หาจุดเปลี่ยนมีดที่คุ้มที่สุด)
*   **Action:** ไม่ใช่แค่เปลี่ยนตอนมีดบิ่น แต่หาจุดตัดที่ **Total Cost Per Piece (CPP)** ต่ำที่สุด
*   **Academic Hook:** ใช้สมการ *Mathematical models for calculating CPP* โดยนำ Machine-Hour Rate, ค่ามีดกลึง, เวลาที่เสียจากการทำ SMED, และ Rework Cost มาตั้งสมการหา *Optimal Replacement Interval*
*   **Output:** แผน PM (Preventive Maintenance) ที่มีตัวเลขกำไรการันตีอยู่เบื้องหลัง

### Phase 4: Downstream Constraint & Energy Economics (บริบทเชิงระบบ)
*   **Action:** วิเคราะห์ Downtime 82% (ไม่มีลัง) ในบริบทของ Line Balancing 
*   **Academic Hook:** อ้างอิงทฤษฎี *Balancing energy efficiency* ชี้แนะแนวทางลดการเดินเครื่องทิ้งเปล่า (Idling) เมื่อเจอคอขวดจาก Downstream
*   **Output:** ข้อเสนอแนะเชิงยุทธศาสตร์ระดับ Plant Manager

---

## 4. ตัวชี้วัดความสำเร็จทางวิชาการและอุตสาหกรรม (KPIs)

1. **Statistical Verification:** ได้ค่าพารามิเตอร์ Weibull ($\beta$, $\eta$) สำหรับเครื่องมือตัดที่พิสูจน์ความแปรปรวนได้จริง
2. **Cost Optimization:** นำเสนอโมเดล CPP ที่แสดงให้เห็นว่าแผน PM ใหม่ประหยัดต้นทุนรวม (Net Saving) ได้กี่บาท/ปี
3. **Productivity Gain:** Standard Cycle Time (SCT) ที่แม่นยำ และเวลา Changeover (SMED) ที่ลดลง $\geq 20\%$
4. **Quality Stability:** กราฟ SPC (X-bar/R) ที่แสดง Process In-control ตลอดช่วงอายุที่กำหนดของมีด

---

## 5. บทสรุปสำหรับอาจารย์ที่ปรึกษา (The Advisor Pitch V4)

> "โครงการนี้เกิดจากการผนวก Pain Point จริงหน้าเครื่องจักร เข้ากับทฤษฎีวิศวกรรมชั้นสูง แทนที่เราจะแก้ปัญหาอายุมีดกลึงด้วยการเดาค่าเฉลี่ย เราจะนำข้อมูลจริงมาวิเคราะห์ด้วย **Weibull Distribution** เพื่อหาจุดเสื่อมสภาพที่แท้จริง จากนั้นจะใช้ **Cost Optimization Model** เพื่อคำนวณจุดคุ้มทุน (CPP) ระหว่างค่าเสียเวลาและค่ามีดกลึง ควบคู่ไปกับการทำ **Time Study** และ **SMED** เพื่อกอบกู้ OEE กลับสู่ความจริง นอกจากนี้ เราจะนำปัญหา Downtime จากคอขวดมาวิเคราะห์ในเชิง **Energy Economics** เพื่อเสนอแนวทางบริหารจัดการ Capacity ให้ผู้บริหาร ทั้งหมดนี้เพื่อพิสูจน์ว่าหลักการทางวิศวกรรมอุตสาหการสามารถเปลี่ยนข้อมูลดิบให้กลายเป็นผลกำไรที่จับต้องได้"
