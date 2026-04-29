# SignBridge 🤟

> A real-time two-way communication bridge between deaf and hearing people — no interpreter needed.

---

## The Problem

In India, over **100 million people** are deaf or hard of hearing. Every day, they face a simple but devastating problem — they cannot have a basic conversation with a hearing person. No interpreter, no tool, no bridge.

Current apps only solve half the problem (signs → text), leaving the other direction completely broken.

---

## Our Solution

A mobile web app that enables **real, two-way conversation** between a deaf person and a hearing person — no interpreter, no special device, just a smartphone.

---

## How It Works

```
Deaf Person                          Hearing Person
    |                                      |
    | Signs in front of camera             | Speaks into microphone
    ↓                                      ↓
App recognizes ISL sign            App converts speech to text
    ↓                                      ↓
Converts to spoken voice  ←→   Shows text + sign on screen
```

- 🤟 **Deaf → Hearing:** Deaf person signs in front of the camera → app instantly converts to spoken voice
- 🎙️ **Hearing → Deaf:** Hearing person speaks → app instantly converts to text on screen
- ⚡ Both happen in **real-time**, in the same app, like a live translator sitting between two people

---

## Features

- 📷 **Live camera sign recognition** using Google Gemini AI
- 🔊 **Text-to-speech** for deaf → hearing direction
- 🎙️ **Speech-to-text** for hearing → deaf direction
- 📱 **Mobile-first** design with camera flip support
- 🌙 **Dark mode** support
- ♿ **Accessibility settings** (larger text, high contrast, reduce motion)
- 🔑 **Multiple API key support** with automatic fallback
- 💾 **Conversation history** saved locally

---

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS
- **AI:** Google Gemini 2.5 Flash (ISL recognition)
- **Animations:** Framer Motion
- **Deployment:** Vercel
- **Build Tool:** Vite

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com) (free)

### Installation

```bash
# Clone the repo
git clone https://github.com/alimurthija/sign_bridge.git
cd sign_bridge

# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GEMINI_BACKUP_KEY_1=your_backup_key_1
VITE_GEMINI_BACKUP_KEY_2=your_backup_key_2
```

---

## Usage

1. Open the app on your smartphone
2. Enter your Gemini API key when prompted
3. Allow camera and microphone permissions
4. **Camera tab** — Deaf person signs in front of the camera
5. **Mic tab** — Hearing person speaks into the microphone
6. Conversation is displayed in real-time for both parties

---

## The Impact

- 🇮🇳 100M+ deaf/hard of hearing people in India alone
- 🌍 466M people worldwide with disabling hearing loss (WHO)
- 💬 Most have no access to sign language interpreters
- 📱 SignBridge makes communication possible with just a smartphone

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

MIT

---

<p align="center">Built with ❤️ to bridge the communication gap</p>