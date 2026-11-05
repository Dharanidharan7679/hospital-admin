# ArkCare Hospital Admin & OPD Control Portal

A dedicated, real-time web portal for hospital reception staff and doctors to manage outpatient queues, call tokens, admit patients, issue walk-in tokens, and view billing invoices.

## 🚀 How to Run

### Method 1: Double-click launcher
Double click `start_admin.bat` in this folder. It will launch the local server on `http://localhost:3000` and open your browser automatically.

### Method 2: Command Line
```powershell
cd D:\ARK-ENGINE\Hospital\admin
node server.mjs
```
Then visit [http://localhost:3000](http://localhost:3000) in any browser.

---

## 🌟 Key Features

1. **⚡ Live OPD Queue HUD**:
   - Real-time display of **Now Serving** (inside doctor cabin) and **Calling Patient** (at doorstep).
   - One-click actions: **Call Next Waiting Token**, **Admit In**, **Complete Consultation**, and **Mark No-Show**.
   - Instant live counters: Waiting, Completed, Total Booked, and Estimated Wait Time.

2. **🎟️ Issue Walk-In Token**:
   - Reception desk interface to register walk-in patients arriving at the hospital.
   - Automatically assigns sequential token codes (e.g. `GM-005`, `CRD-002`) aligned with the doctor's prefix.
   - Records patient demographic details, phone numbers, and ₹10 counter cash collection.

3. **👨🏻‍⚕️ Doctor & OPD Room Directory**:
   - Filter and switch between doctors across hospital departments.
   - Add new doctors with customizable OPD rooms, prefixes, and daily token limits.

4. **📊 Analytics & Invoices**:
   - Audit trail of token registrations and digital billing invoices.
   - Summary of total collections and consultation throughput.

5. **🌐 Bilingual Support**:
   - Full toggle between **English** and **தமிழ் (Tamil)** for hospital names, doctor titles, and specialties.

