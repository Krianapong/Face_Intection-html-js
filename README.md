# ระบบตรวจจับและจดจำใบหน้า (Face Detection and Recognition System)

ระบบตรวจจับและจดจำใบหน้าแบบเรียลไทม์ด้วย JavaScript และ Face-API.js

## คุณสมบัติ
- ตรวจจับใบหน้าแบบเรียลไทม์
- จดจำและระบุตัวตนของบุคคล
- แสดงจุดสำคัญบนใบหน้า (Facial Landmarks)
- วิเคราะห์การแสดงออกทางสีหน้า (Face Expressions)
- รองรับการตรวจจับใบหน้าหลายคนพร้อมกัน

## การติดตั้ง

1. ดาวน์โหลดหรือโคลนโปรเจ็คนี้

2. ติดตั้งไฟล์โมเดลที่จำเป็น:
   - สร้างโฟลเดอร์ `models/`
   - ดาวน์โหลดไฟล์โมเดลต่อไปนี้และวางในโฟลเดอร์ `models/`:
     - tiny_face_detector_model-weights_manifest.json
     - tiny_face_detector_model-shard1
     - face_landmark_68_model-weights_manifest.json
     - face_landmark_68_model-shard1
     - face_expression_model-weights_manifest.json
     - face_expression_model-shard1
     - face_recognition_model-weights_manifest.json
     - face_recognition_model-shard1

3. เตรียมรูปภาพสำหรับการจดจำใบหน้า:
   - สร้างโฟลเดอร์ `faces/`
   - สร้างโฟลเดอร์ย่อยตามชื่อบุคคล เช่น `faces/jame/`
   - ใส่รูปภาพของบุคคลนั้นๆ อย่างน้อย 2 รูป ตั้งชื่อเป็น `1.jpg` และ `2.jpg`

4. รันโปรเจ็คผ่าน Web Server:
   - ใช้ Live Server ใน VS Code หรือ
   - ใช้ Web Server อื่นๆ ตามต้องการ

## การใช้งาน

1. เปิดหน้าเว็บผ่าน Web Server
2. คลิกปุ่ม "เริ่มต้นใช้งาน"
3. อนุญาตการใช้งานกล้อง
4. ระบบจะ:
   - แสดงภาพจากกล้อง
   - ตรวจจับใบหน้าที่ปรากฏ
   - แสดงกรอบรอบใบหน้าพร้อมชื่อ (ถ้าตรงกับในฐานข้อมูล)
   - แสดงจุดสำคัญบนใบหน้า
   - แสดงการวิเคราะห์การแสดงออกทางสีหน้า

## การปรับแต่ง

### เพิ่มบุคคลในการจดจำ
1. สร้างโฟลเดอร์ใหม่ใน `faces/` ตามชื่อบุคคล
2. ใส่รูปภาพอย่างน้อย 2 รูป
3. เพิ่มชื่อในอาร์เรย์ `labels` ในไฟล์ `index.js`

### ปรับความแม่นยำ
- ปรับค่า threshold ในการสร้าง FaceMatcher (ค่าเริ่มต้น = 0.6) 