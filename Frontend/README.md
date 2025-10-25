## MayaCode

### About  
A full-stack mobile platform connecting refugees and helpers for community-driven support. It features real-time profile management, location-based services, and secure OTP-based authentication to foster collaborative aid within communities.

---

## 📚 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup & Installation](#setup--installation)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

---

## 🧩 Overview

**MayaCode** is a cross-platform mobile application designed to bridge the gap between refugees and local helpers. Users can manage profiles, create or respond to help requests, and engage with their communities in real-time—all while maintaining a secure and seamless experience.

---

## 🚀 Features

- **Dual-Role User System:** Seamlessly switch between Refugee and Helper roles with distinct functionalities.
- **Real-Time Profile Management:** Update user details instantly, including language preferences and profile images.
- **Location-Based Services:** Use Google Maps integration to discover and filter posts by proximity.
- **Interactive Post System:** Create and manage help requests, offers, and community stories dynamically.
- **Live Statistics Dashboard:** Track contributions, engagements, and user activity analytics.
- **Multi-Language Support (Planned):** Support for localized experiences based on user preferences.
- **Secure OTP Authentication:** Email-based login with JWT session management.
- **Image Upload & Management:** Enable image attachments to profiles and posts for enriched interaction.

---

## 🛠 Tech Stack

- **Frontend:** React Native, Expo, TypeScript  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Authentication:** Email OTP with JWT  
- **Maps & Location:** Google Maps API  
- **Deployment:** Render (Backend), Expo EAS (Frontend)  

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js and npm  
- Expo CLI (install with `npm install -g expo-cli`)  
- A running MongoDB instance (local or cloud)  
- SMTP email service (for OTP delivery)  
- Google Maps API Key  

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/mayacode.git
   cd mayacode
   ```

2. **Install root dependencies (if applicable):**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Create a `.env` file in both the frontend and backend directories.
   - Add your API keys and backend URLs as needed. Refer to `eas.json` for frontend config examples.

4. **Start the backend server:**
   ```bash
   cd MayaCodeBackend
   npm install
   npm start
   ```

5. **Start the frontend application:**
   ```bash
   cd ../MayaCode
   expo start
   ```

---

## 📡 API Endpoints

| Method | Endpoint                                 | Description                        |
|--------|------------------------------------------|------------------------------------|
| POST   | `/api/users/phone/:phone`                | Create or update user profile      |
| GET    | `/api/users/phone/:phone`                | Retrieve user profile              |
| PUT    | `/api/users/phone/:phone`                | Update user profile                |
| DELETE | `/api/users/phone/:phone`                | Delete user profile                |
| POST   | `/api/users/phone/:phone/posts`          | Add a new post (help/offer/story)  |
| PUT    | `/api/users/phone/:phone/stats`          | Update user statistics             |

> ℹ️ For full API documentation, refer to the backend code in `/MayaCodeBackend/routes/`.

---

## 🤝 Contributing

We welcome contributions from the community!

To contribute:
1. Fork the repository  
2. Create a new branch (`git checkout -b feature/your-feature-name`)  
3. Make your changes and commit (`git commit -m "Your message"`)  
4. Push to your fork (`git push origin feature/your-feature-name`)  
5. Open a Pull Request  

Please ensure your code follows the project’s style and includes tests where applicable.

---
