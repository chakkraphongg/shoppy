# 🎮 DEKROYSHOP - Gaming Cosmetic Store & Real 3D Arsenal

เว็บร้านค้าไอเทม WarZ ToyStoryZ แบบ Static Version (HTML / CSS / JavaScript / Three.js 3D WebGL)
รองรับการขึ้น **GitHub Pages** หรือ Static Web Hosting ได้ทันที 100% โดยไม่ต้องติดตั้ง PHP หรือ MySQL Database!

---

## 🌟 จุดเด่นของเวอร์ชันนี้
- **ไม่มีไฟล์ PHP / ฐานข้อมูลซับซ้อน**: โหลดข้อมูลไอเทม 2,231 ชิ้นผ่าน `assets/js/products-data.js`
- **ระบบ Real 3D WebGL (Three.js)**: กดปุ่มหมุน 3D ส่องโมเดล 360 องศา ดูอาวุธ ชุดเกราะ ตัวละคร และสกินได้สมจริง
- **ระบบค้นหาและกรองหมวดหมู่**: ค้นหาชื่อไอเทม, กรองราคา 15.- / 20.- และเลือกหมวดหมู่ได้ทันที
- **พร้อมเชื่อมต่อเพจ Facebook**: มีปุ่มทักสั่งซื้อผ่านเพจพร้อมคัดลอกรหัสไอเทม

---

## 🚀 วิธีนำขึ้น GitHub & เปิดใช้งาน GitHub Pages

### ขั้นตอนที่ 1: Push โฟลเดอร์นี้ขึ้น GitHub Repository
เปิด PowerShell หรือ Command Prompt ในโฟลเดอร์นี้ แล้วรันคำสั่ง:

```bash
git init
git add .
git commit -m "feat: Initial commit for DEKROYSHOP static web"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```
*(แทนที่ `YOUR_USERNAME/YOUR_REPOSITORY` ด้วยชื่อบัญชีและชื่อ repo ของคุณ)*

### ขั้นตอนที่ 2: เปิดใช้งาน GitHub Pages
1. ไปที่ GitHub Repository ของคุณบนเว็บไซต์ GitHub
2. กดแท็บ **Settings**
3. เมนูด้านซ้ายเลือก **Pages**
4. ในส่วน **Build and deployment** > **Branch**:
   - เลือก Branch เป็น `main`
   - เลือกโฟลเดอร์เป็น `/ (root)`
5. กดปุ่ม **Save**
6. รอประมาณ 1-2 นาที คุณจะได้ลิงก์เว็บไซต์ เช่น `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/` สามารถเปิดใช้งานได้ทั่วโลกทันที!

---

## 💻 วิธีเปิดทดสอบในเครื่องคอมพิวเตอร์ของคุณ
ดับเบิ้ลคลิกที่ไฟล์ **`start-server.bat`**
- ระบบจะเปิดเบราว์เซอร์ให้อัตโนมัติที่ `http://localhost:8080/index.html`
- สามารถดูภาพสินค้าและหมุนโมเดล 3D ได้ครบถ้วน 100%
