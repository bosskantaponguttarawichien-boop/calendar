# 📱 LINE Mini App -- UX Flow (2-Person Calendar Compare)

## 🎯 Goal

-   ผู้ใช้ 2 คนสามารถดู "ตารางเวรของกันและกัน"
-   เปรียบเทียบได้ทันที
-   ใช้งานผ่าน LINE Mini App (LIFF)
-   ไม่มี LINE OA (ใช้ share link แทน push)

------------------------------------------------------------------------

## 🧠 Core Concept

ไม่ใช่ calendar app ทั่วไป แต่คือ shared daily info ผ่าน chat

------------------------------------------------------------------------

## 🧭 Global Flow Overview

\[Open Mini App\] → Check Pair → (No Pair → Invite) → (Has Pair →
Calendar)

------------------------------------------------------------------------

## 🚀 Flow 1: First-Time User

Open LIFF\
→ Auto Login\
→ Check pair\
→ No Pair → Invite Friend

------------------------------------------------------------------------

## 🔗 Flow 2: Invite Friend

Click Invite\
→ Generate pairId\
→ Create link\
→ Share via LINE

------------------------------------------------------------------------

## 👥 Flow 3: Join Pair

Click link\
→ Open LIFF\
→ Join pair\
→ Pair complete

------------------------------------------------------------------------

## 📅 Flow 4: Daily Usage

Open App\
→ Load pair\
→ Load shifts\
→ Show calendar\
→ Focus today

------------------------------------------------------------------------

## ➕ Flow 5: Add Shift

Tap date\
→ Select shift\
→ Save\
→ Update UI

------------------------------------------------------------------------

## 🔁 Flow 6: Share

Click Share\
→ Send message + link\
→ Friend opens

------------------------------------------------------------------------

## 🔗 Deep Link

?pairId=xxx\
→ Load pair\
→ Show compare

------------------------------------------------------------------------

## ⚠️ Edge Cases

-   No pair → Invite\
-   Not complete → Waiting\
-   No shifts → Empty

------------------------------------------------------------------------

## 🔄 Loop

Open → View → Share → Friend open

------------------------------------------------------------------------

## 🎯 UX Principles

-   เปิด = เห็นเลย\
-   ไม่ต้อง navigate\
-   แชร์ง่าย\
-   focus วันนี้

------------------------------------------------------------------------

## 🧠 Summary

This is a shared daily info system via chat link
