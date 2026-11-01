# 🧠 ClearFocus — Take Back Control of Your Attention

\<p align="center">
&#x20; \<strong>An intelligent browser extension designed to reduce digital distractions and help you stay focused.\</strong>
\</p>

\<p align="center">
&#x20; \<img src="[https://img.shields.io/badge/Project-ClearFocus-blueviolet](https://img.shields.io/badge/Project-ClearFocus-blueviolet)" />
&#x20; \<img src="[https://img.shields.io/badge/Platform-Chrome%20Extension-blue](https://img.shields.io/badge/Platform-Chrome%20Extension-blue)" />
&#x20; \<img src="[https://img.shields.io/badge/AI-Gemini-orange](https://img.shields.io/badge/AI-Gemini-orange)" />
&#x20; \<img src="[https://img.shields.io/badge/License-All%20Rights%20Reserved-red](https://img.shields.io/badge/License-All%20Rights%20Reserved-red)" />
\</p>

---

## 🚀 About ClearFocus

We live in a world where distractions are just one click away.

You open YouTube to watch one educational video, and suddenly you're scrolling through Shorts. You open a social platform for a specific purpose, but end up losing valuable time.

**ClearFocus is built to solve this problem.**

ClearFocus is an intelligent distraction-management browser extension that helps users maintain focus by understanding their browsing context, filtering distracting content, and providing tools to manage and analyze their focus sessions.

Instead of simply blocking websites, ClearFocus aims to make browsing more intentional.

## ✨ Key Features

### 🎯 Intelligent Content Filtering

- Detects and suppresses distracting content.
- YouTube Shorts suppression to reduce unnecessary scrolling.
- Context-aware content scanning.
- Site-specific filtering configurations.
- Dynamically manages distracting elements on supported pages.

### ⏱️ Focus Sessions & Timer

- Start dedicated focus sessions.
- Manage focused work periods.
- Focus session notifications.
- Reduce unnecessary browsing interruptions.

### 🧠 Context Awareness

- Understands the user's browsing intent.
- Uses a context engine to support relevance-based filtering.
- Adapts content filtering according to the browsing context.
- Integrates AI-powered analysis through Gemini.

### 📊 Productivity Analytics

Track your browsing and focus activity through:

- Total focus time.
- Completed focus sessions.
- Number of filtered items.
- Intent history.
- Weekly productivity data.
- CSV data export.

### 🛡️ Guardian System

A dedicated system within ClearFocus designed to support distraction control and maintain the intended browsing experience.

## ⚙️ How It Works

ClearFocus combines browser automation, DOM analysis, contextual understanding and AI-assisted intelligence.

**Simplified workflow:**

1. **User Intent:** Establish the purpose of a browsing session.
2. **Context Engine:** Processes contextual information.
3. **Content Detection:** Scans supported web pages and their elements.
4. **Filtering Engine:** Identifies and suppresses distracting content.
5. **Analytics:** Records focus-related activity and filtering statistics.

## 🏗️ Architecture

```text
                 CLEARFOCUS
                      |
                Popup Interface
                      |
                Background Worker
                      |
                 Content Script
                      |
          +-----------+-----------+
          |           |           |
      Context      DOM Engine   UI Engine
      Engine           |           |
          |        Site Configs    |
          |           |           |
          +-----------+-----------+
                      |
                Filtering Logic
                      |
                 Guardian System
                      |
                  Analytics
                      |
              Focus & Productivity
```

## 🧰 Technology & Components

| Component                 | Purpose                                |
| ------------------------- | -------------------------------------- |
| Chrome Extension APIs     | Browser integration                    |
| JavaScript                | Extension functionality                |
| DOM Engine                | Page element detection and interaction |
| Context Engine            | Browsing context and intent processing |
| Gemini API                | AI-assisted contextual analysis        |
| Background Service Worker | Background extension operations        |
| Analytics Engine          | Focus and filtering statistics         |
| Site Configurations       | Website-specific filtering behaviour   |

## 📥 Installation

ClearFocus is distributed as a browser extension.

### Run locally

1. Clone the repository:

```bash
git clone https://github.com/siddh-webd-ml/clearfocus
```

2. Navigate to the project directory.

3. Open Google Chrome.

4. Visit:

```text
chrome://extensions/
```

5. Enable **Developer mode**.

6. Click **Load unpacked**.

7. Select the ClearFocus extension directory containing `manifest.json`.

8. Pin ClearFocus to your browser toolbar.

> Note: If your project requires a Gemini API key, configure it using the project's designated configuration method. Never commit API keys or private credentials to GitHub.

## 🔐 Privacy & Security

ClearFocus is designed around intentional browsing and distraction management.

- Avoid committing personal credentials or API keys.
- Keep sensitive configuration files out of public repositories.
- Review permissions before installing the extension.
- Be transparent about any external AI API requests and the data they process.

## 🗺️ Project Structure

```text
ClearFocus/
│
├── manifest.json
├── background/
│   └── service-worker.js
│
├── content/
│   ├── context-engine/
│   ├── dom-engine/
│   ├── ui-engine/
│   └── site-configs/
│
├── popup/
│
├── analytics/
│
├── guardian/
│
├── intent/
│
├── assets/
│
├── README.md
└── LICENSE
```

*The structure above is illustrative. Refer to the actual repository for the current implementation.*

## 🎯 Vision

The goal of ClearFocus is simple:

**Don't just block distractions. Build better digital habits.**

ClearFocus aims to make the internet a more intentional place to work, study and learn.

## 👨‍💻 Creator

**Siddh Agrawal**

Sarthak Mavar

Creator & Developer of ClearFocus.

GitHub: [@siddh-webd-ml](https://github.com/siddh-webd-ml)

Github: @MavarSarthak

---

## © Copyright & Ownership

**ClearFocus © 2026 Siddh Agrawal. All Rights Reserved.**

This repository is publicly available for viewing and evaluation.

The original source code, project design, documentation and branding are protected by applicable copyright laws.

No permission is granted to reproduce, redistribute, modify, commercially exploit, or claim this project as your own without prior written permission from the copyright owner.

Viewing this repository does not grant a general license to reuse its contents.

For licensing or collaboration enquiries, please contact the repository owner.

---

\<p align="center">
&#x20; \<strong>Built with purpose. Designed for focus. 🧠\</strong>
\</p>
