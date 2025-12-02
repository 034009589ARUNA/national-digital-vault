# Document Vault Mobile App

React Native mobile app for offline document verification using QR codes.

## Features

- QR Code scanning for document verification
- Offline verification using cached blockchain state
- Manual hash input for verification
- Cached verification history

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the Expo development server:
```bash
npm start
```

3. Scan QR code with Expo Go app or run on device/emulator

## Configuration

Update `API_BASE_URL` in `App.js` to point to your backend server.

## Offline Mode

The app caches verified document hashes locally. When offline, it can verify documents from the cache.

