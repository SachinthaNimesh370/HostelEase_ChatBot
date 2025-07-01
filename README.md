
---

<p align="center">
  <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" /></a>
</p>

<h2 align="center">📱 HostelEase ChatBot - WhatsApp Integration for Hostel Management</h2>

<p align="center">
A smart WhatsApp chatbot interface for the HostelEase Management System.<br>
Built with <b>NestJS</b>, powered by <b>GPT-4.0 Mini</b> and integrated via <b>Meta Developer API</b>.<br>
Students can now register complaints directly through WhatsApp! 💬
</p>

---

## 🚀 Project Overview

**HostelEase ChatBot** enables seamless communication between hostel students and wardens by integrating WhatsApp with the existing HostelEase backend.

### ✨ Key Features:

* 📲 Submit hostel complaints via WhatsApp
* 🤖 AI-powered interaction using **GPT-4.0 mini**
* 🌐 Ngrok for local tunneling of webhooks
* 🔐 Secure integration with **Meta WhatsApp Business API**
* 🧠 Built using **NestJS** (Node.js framework)

---

## 🧑‍💻 Tech Stack

* **Framework:** NestJS (TypeScript)
* **AI Model:** GPT-4.0 mini
* **Messaging API:** Meta Developer Platform (WhatsApp Business Cloud API)
* **Tunnel:** Ngrok
* **Helpers:** Axios, dotenv, body-parser

---

## 📦 Project Setup

```bash
# Install dependencies
npm install
```

---

## ▶️ Run the Server

```bash
# Start the development server
npm run start:dev
```

Make sure your webhook is exposed to the internet using [Ngrok](https://ngrok.com/):

```bash
ngrok http 3000
```

Then set your Ngrok URL in the Meta Developer Console as the webhook endpoint.

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```
META_API_TOKEN=your_meta_api_token
VERIFY_TOKEN=your_webhook_verify_token
WHATSAPP_PHONE_NUMBER_ID=your_number_id
```

---

## 📚 WhatsApp Integration Setup

1. Set up a WhatsApp Business App on [Meta Developer Console](https://developers.facebook.com/)
2. Configure webhook callback URL (e.g., your Ngrok URL)
3. Subscribe to `messages`, `message_status`, and other events
4. Connect your test number and start sending/receiving messages

---

## 🤝 Acknowledgements

* 🙌 **Special thanks to Pasindu Sampath** for the support and guidance during development.
* ❤️ Inspired by the need for real-time communication in hostel environments.

---

## 🔗 Related Repositories

* 🎯 Main System Backend: [HostelEase Backend](https://github.com/your-backend-link)
* 🎯 Main System Frontend: [HostelEase Frontend](https://github.com/your-frontend-link)

---


