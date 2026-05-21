# CropGuard Mobile (React Native)

## Project Overview
This is a native mobile application for crop disease detection, built with Expo and React Native.

## Development Workflow

### 1. Networking (CRITICAL)
Mobile devices cannot access `localhost`. 
1. Open `src/config.js`.
2. Update the `API_BASE_URL` with your computer's local IP address (e.g., `http://192.168.1.5:5000/api`).
3. Ensure your phone and computer are on the **same Wi-Fi network**.

### 2. Running the App
1. Install **Expo Go** on your physical phone (Android/iOS).
2. Open a terminal in `frontend_app`.
3. Run `npm start`.
4. Scan the QR code with your camera (iOS) or the Expo Go app (Android).

## Key Features Implemented
*   **AgroBot AI**: Full chat interface with Markdown support for agricultural advice.
*   **Disease Diagnostics**: Uses Native Camera and Gallery for image selection and analysis.
*   **Environment & Alerts**: Real-time GPS-based weather and smart farming alerts.
*   **Plant Library**: Searchable database for crop varieties.
*   **Community**: Native social feed for farmer interactions.

## Dependencies
*   `@react-navigation/native`: Navigation shell.
*   `expo-image-picker`: Camera/Gallery access.
*   `expo-location`: GPS access.
*   `expo-linear-gradient`: Colorful UI elements.
*   `lucide-react-native`: Icon set.
