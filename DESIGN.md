# DESIGN.md: Facebook Messenger Appointment Bot

## 📝 Overview
This project is a standalone Facebook Messenger chatbot designed for a web development agency. It automates the lead qualification process and scheduling of discovery calls for small business clients.

## 🏛️ Architecture
- **Messaging Platform:** Meta Graph API (Facebook Messenger).
- **Backend Workflow:** Supabase Edge Functions (Deno).
- **Database:** Supabase PostgreSQL.
- **Integrations:**
    - **Google Calendar API:** For real-time availability and booking.
    - **Resend API:** For automated client confirmation emails (Free Tier).

## 🚀 core Workflow
1.  **Greeting:** "Hi! We're a web development agency specializing in small business sites."
2.  **Qualification (Quiz):**
    - **Scope:** How many pages? (Buttons: 1-5, 6-10, 10+)
    - **Timeline:** Target launch? (Buttons: ASAP, 1 month, Flexible)
3.  **Lead Info Gathering:**
    - **Name:** Who is this for?
    - **Contact:** Best email/phone for follow-up?
    - **Address:** What is your business address?
4.  **Booking:**
    - Fetch availability from Google Calendar.
    - Show available dates/times as **Quick Replies**.
5.  **Finalization:**
    - Create Google Calendar event.
    - Store lead in Supabase `leads` table.
    - Send confirmation email via **Resend**.

## 🔄 Human Intervention (Handover Protocol)
- **Manual Handover:** User clicks "Talk to Human" or types the keyword.
- **Automatic Handover:** If the bot fails to understand the user twice.
- **State Management:** A `is_human_managed` flag in the `user_states` table stops the bot from responding, allowing the agency to take over in the Page Inbox.

## 🛠️ Data Schema
### `user_states` Table
- `psid` (Primary Key): Page-Scoped User ID from Messenger.
- `current_step`: (e.g., `awaiting_name`, `awaiting_budget`).
- `is_human_managed`: Boolean flag for handover.
- `metadata`: JSONB blob for storing temporary conversation data.

### `leads` Table
- `id` (Primary Key).
- `name`, `email`, `phone`, `address`.
- `project_scope`, `timeline`.
- `booking_id`: Reference to the Google Calendar event.

## 📝 Decision Log
| Decision | Choice | Rationale |
| :--- | :--- | :--- |
| **Interaction Style** | Hybrid (NLU + Buttons) | Precision in gathering core business data. |
| **Calendar Integration** | Google Calendar API | Industry standard for scheduling. |
| **Email Provider** | Resend | Robust, 3k/mo free tier. |
| **Backend** | Supabase Edge Functions | Serverless, fast, and integrated with the DB. |
| **Scale** | Low (<100/mo) | Minimal infrastructure overhead. |
