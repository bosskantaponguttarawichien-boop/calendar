# LINE Mini App -- Calendar

## UX Flow Diagram (Personal Chat Only)

> Scope: ใช้งานผ่าน **LINE Chat ส่วนตัวเท่านั้น**\
> ไม่มี Entry Flow จาก Rich Menu / Bot message / Flex message ในเอกสารนี้\
> เริ่มต้นจาก **ผู้ใช้เปิด Mini App โดยตรงในแชทส่วนตัว**

------------------------------------------------------------------------

# 1. Mini App Startup Flow

    User เปิด Mini App
            │
            ▼
    LINE WebView เปิด LIFF
            │
            ▼
    liff.init()
            │
            ▼
    Get User Profile
    liff.getProfile()
            │
            ▼
    Get Context
    liff.getContext()
            │
            ▼
    Context Type = utou
    (Personal Chat)

ระบบจะได้ข้อมูล

    userId
    displayName
    pictureUrl

------------------------------------------------------------------------

# 2. Main Calendar Flow

    Mini App Home
          │
          ▼
    Calendar Screen
          │
          │
          ├─ View existing events
          │
          └─ Select date
                │
                ▼
           Create Event

------------------------------------------------------------------------

# 3. Create Event Flow

    User Select Date
          │
          ▼
    Event Form
          │
          ├─ Title
          ├─ Date
          ├─ Start Time
          ├─ End Time
          ├─ Location
          └─ Description
          │
          ▼
    [ Save Event ]

------------------------------------------------------------------------

# 4. Save Event Flow

    User Click Save
          │
          ▼
    POST /events API
          │
          ▼
    Save Event in Database
          │
          ▼
    Event Created

Example Event Data

    eventId
    userId
    title
    date
    startTime
    endTime
    location
    description
    createdAt

------------------------------------------------------------------------

# 5. Event Action Flow

หลังจากสร้าง Event สำเร็จ

    Event Detail Page
            │
            │
            ├─ Add to LINE Calendar
            │
            ├─ Share Event
            │
            └─ Edit Event

------------------------------------------------------------------------

# 6. Add to LINE Calendar Flow

    User Click
    [ Add to LINE Calendar ]
            │
            ▼
    Open LINE Calendar
    (calendar.line.me)
            │
            ▼
    Event Form Auto-filled
            │
            ▼
    User Click Save
            │
            ▼
    Event Added to LINE Calendar

Example URL

    https://calendar.line.me/event/create

Parameters

    title
    start
    end
    location
    description

------------------------------------------------------------------------

# 7. Share Event to Chat Flow

    User Click
    [ Share Event ]
            │
            ▼
    LINE Share Target Picker
            │
            ▼
    Select Chat (Personal Chat)
            │
            ▼
    Send Event Message

Example Message

    📅 Meeting
    ⏰ 10:00 - 11:00
    📍 Bangkok

    Open Event

------------------------------------------------------------------------

# 8. Open Shared Event Flow

    User Click
    [ Open Event ]
            │
            ▼
    Open Mini App
            │
            ▼
    Event Detail Page

------------------------------------------------------------------------

# 9. Complete User Journey

    Open Mini App
          │
          ▼
    View Calendar
          │
          ▼
    Select Date
          │
          ▼
    Create Event
          │
          ▼
    Save Event
          │
          ▼
    Choose Action
       ├─ Add to LINE Calendar
       └─ Share Event

------------------------------------------------------------------------

# 10. Suggested Screens

1.  Mini App Home\
2.  Calendar View\
3.  Create Event Form\
4.  Event Detail Page\
5.  Share Event

------------------------------------------------------------------------

# 11. Implementation Phases

### Phase 1: Core Calendar & MVP
- [ ] UI: Calendar Screen (FullCalendar)
- [ ] UI: Create Event Form (Title, Date, Time)
- [ ] DB: Firebase Integration (CRUD for Events)
- [ ] LIFF: liff.init() and liff.getProfile()
- [ ] Tech: Font Noto Sans Thai implementation

### Phase 2: LINE Ecosystem Integration
- [ ] Action: "Add to LINE Calendar" link generation
- [ ] Action: "Share Event" via LINE Share Target Picker
- [ ] UI: Event Detail Page
- [ ] LIFF: liff.getContext() for Personal Chat validation

### Phase 3: Engagement & Optimization
- [ ] LIFF: Deep linking for Shared Events (Open Event flow)
- [ ] UI: Edit/Delete Event actions
- [ ] Performance: Logic optimization & Firebase Rules
- [ ] UX: Responsive design for various mobile sizes

------------------------------------------------------------------------

# 12. Tech Notes

Recommended Stack

Frontend

    Next.js
    React
    TailwindCSS
    FullCalendar
    Noto Sans Thai

Backend

    Node.js
    Express

Database

    Firebase

LINE Integration

    LIFF SDK
    LINE Share Target Picker

------------------------------------------------------------------------

**End of Document**
