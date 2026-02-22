# QuoteVam 🌟

QuoteVam is a beautiful, feature-rich daily quote application built with React Native and Expo. It provides users with endless inspiration through a curated collection of quotes, customizable backgrounds, and multi-language support.

## ✨ Features

- **Daily Inspiration**: Swipe or tap to discover new quotes and wisdom from famous authors and personalities.
- **Multi-Language Support**: Enjoy quotes in multiple languages! Supported languages include:
  - English
  - Spanish (Español)
  - French (Français)
  - Hindi (हिंदी)
  - Marathi (मराठी)
  - Malayalam (മലയാളം)
- **Customizable Themes**: Change the visual aesthetic by selecting different background templates.
- **Favorites System**: Save your most loved quotes to a dedicated offline Favorites tab for easy access later.
- **Offline Capable**: Quotes and favorites are stored locally, meaning the app works perfectly without an active internet connection!
- **Share & Copy**: Easily copy quotes to your clipboard to share with friends or on social media.

## 🚀 Getting Started

To run QuoteVam locally on your machine, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- Expo Go app on your physical device OR an iOS Simulator / Android Emulator.

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repository-url>
   cd Quotevam
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Open the app:
   - Scan the QR code shown in the terminal with the **Expo Go** app on your phone.
   - Or press `i` to open in iOS Simulator / `a` to open in Android Emulator.

## 🛠 Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) / [Expo](https://expo.dev/)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **Storage**: `@react-native-async-storage/async-storage` for persisting favorites locally
- **Icons**: `@expo/vector-icons`

## 📁 Repository Structure

- `app/`: Contains the Expo Router screen layouts and tab navigation (`(tabs)/index.tsx`, `(tabs)/favorites.tsx`).
- `assets/`: Contains local font files, background template images, and the multi-language `quotes_*.json` databases.
- `components/`: Reusable UI components used across screens.
- `scripts/`: Python scripts used for generating and translating the quote databases (e.g. `regenerate_quotes.py`).
