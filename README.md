# Xeno SDE Internship Assignment 2025 – Mini CRM

🚀 A Mini CRM platform built as part of the **Xeno SDE Internship Assignment 2025**.  
This project demonstrates **customer segmentation, personalized campaign delivery, authentication, and AI integration** with a clean React + Express + MongoDB stack.

---

## ✨ Features Implemented

### 1. Data Ingestion APIs
- **`POST /api/ingest/customers`**
  - Bulk upsert customers by email.
  - Accepts `{ name, email, totalSpends, visits }`.
- **`POST /api/ingest/orders`**
  - Adds orders linked to customers.
  - Updates aggregates: `totalSpends += amount`, `visits += 1`.
- Ensures clean validation and predictable updates.
- Tested via Postman and directly in-app.

### 2. Campaign Creation UI
- Built with **React (Vite + React Router)**.
- Dynamic rule builder:
  - Fields: `spend`, `visits`, `lastVisitDays`.
  - Operators: `>`, `<`, `=`, `>=`, `<=`, `!=`.
  - Conjunction: `AND` / `OR`.
- Preview audience size before saving.
- Save & Launch → triggers campaign creation + delivery process.

### 3. Campaign Delivery & Logging
- **Simulated delivery**:
  - ~90% messages marked `SENT`, ~10% `FAILED`.
- **Personalized messages** (demo logs):
  - Example:  
    `"Hi Mohit, here’s 10% off on your next order!"`
- **Delivery Receipt API** updates `CommunicationLog`.
- Campaign History shows:
  - Audience size
  - Sent / Failed counts
  - Rule summary & expandable JSON view
  - Created timestamp

### 4. Authentication
- **Google OAuth 2.0** via Passport.js.
- Only logged-in users can:
  - Create campaigns
  - View history
- **Login page**:
  - Clean green "Login with Google" button.
- **Navbar**:
  - Hidden on `/login`.
  - Shows Logout when logged in.

### 5. AI Integration (Groq API)
- Natural language → rules conversion.
- Backend route: `POST /api/ai/generate-rules`
- Example:
  - Input:  
    `"customers who spent more than 10000 and visited less than 5 times"`
  - Output:  
    ```json
    {
      "conjunction": "AND",
      "rules": [
        { "field": "spend", "operator": ">", "value": "10000" },
        { "field": "visits", "operator": "<", "value": "5" }
      ]
    }
    ```
- Powered by **Groq LLM API** (`llama-3.1-8b-instant`).

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), React Router
- **Backend:** Node.js (Express)
- **Database:** MongoDB (Mongoose ODM)
- **Auth:** Google OAuth 2.0 (Passport.js)
- **AI:** Groq API
- **Styling:** Custom CSS (dark theme, consistent with campaign flow)

---

## 🏗️ Architecture

```mermaid
flowchart TD
    subgraph Frontend [React App]
        UI[Campaign Creation Page]
        AI[AI Rule Prompt Box]
        Hist[Campaign History Page]
        Login[Login Page]
    end

    subgraph Backend [Express + MongoDB]
        Ingest[/Ingestion APIs/]
        Campaigns[/Campaign APIs/]
        Logs[/Delivery Receipt API/]
        Auth[/Google OAuth/]
        AIAPI[/AI Routes (Groq)/]
    end

    DB[(MongoDB)]
    Groq[(Groq LLM API)]

    UI -->|Rules, Preview, Save| Campaigns
    AI -->|Prompt| AIAPI
    Hist -->|GET /api/campaigns| Campaigns
    Ingest --> DB
    Campaigns --> DB
    Logs --> DB
    AIAPI --> Groq
    Auth --> Backend

## ⚙️ Local Setup

### Prerequisites
- Node.js >= 18  
- MongoDB (Atlas or local)

### 1. Clone repo
```bash
git clone https://github.com/KindaJayant/xeno-crm-assignment.git
cd xeno-crm-assignment

### 2. Backend
```bash
cd server
npm install
cp .env.example .env


