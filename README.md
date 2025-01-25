# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from "eslint-plugin-react";

export default tseslint.config({
  // Set the react version
  settings: { react: { version: "18.3" } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs["jsx-runtime"].rules,
  },
});
```


# Video Streaming App with Admin Dashboard

This project is a video streaming application built with **React** and **TypeScript**, using **Vite** for fast development. The app retrieves and displays videos from Firebase Firestore and includes an admin dashboard for managing videos. Features include video autoplay, admin-controlled video management, password protection, detailed video history tracking, and responsive design.

## Features

- **Autoplay Videos**: Videos are fetched from Firestore and displayed with an autoplay feature using embedded YouTube videos.
- **Admin Dashboard**: Admins can add new videos, set deletion criteria based on load count, and delete videos.
- **Password Protection**: Admin access is protected with a password modal for secure authentication.
- **History Tracking**: Video load history is tracked and displayed in a detailed table, offering statistics and analysis.
- **Responsive Design**: The app is fully responsive, adapting to various screen sizes and devices.

## Project Structure

- **`src/`**: Contains all source code, including components, styles, utilities, Redux setup, and configurations.
- **`components/`**: Contains React components written in `.tsx`.
- **`redux/`**: Manages global state using Redux.
  - **`asyncthunk/`**: Handles async actions such as adding videos, updating load counts, and deleting videos.
  - **`config/`**: Configures the Redux store.
  - **`slice/`**: Contains reducers and state slices for video data, admin authentication, and more.
- **`utils/`**: Contains helper functions used across the app.
- **`styles/`**: Contains CSS files for individual components and global styling.
- **`firebase.tsx`**: Contains Firebase setup and configuration, including Firestore for storing video data.

## Technologies Used

- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A statically typed superset of JavaScript for added type safety.
- **Vite**: A modern, fast build tool for front-end development.
- **Redux**: A predictable state container for JavaScript apps.
- **Firebase**: Firestore database for storing video and history data, and Firebase Authentication for admin validation.
- **React Router**: For client-side routing.
- **CSS**: For styling components, including media queries for responsiveness.

## Setup and Installation

### Prerequisites

Ensure you have the following installed:

- Node.js (version 14.x or later)
- A Firebase project set up with Firestore Database

### Steps to Set Up Locally:

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/MMudasir19/video-management-app.git
   cd video-management-app
   Install Dependencies:
   ```

bash
Copy
Edit

## npm install

## Firebase Setup:

Create a Firebase project and enable Firestore Database.
In your Firebase console, create a web app and obtain your Firebase configuration details.
Create a .env file in the root of the project and add your Firebase credentials:
bash
Copy
Edit

1. REACT_APP_FIREBASE_API_KEY=<your-api-key>
2. REACT_APP_FIREBASE_AUTH_DOMAIN=<your-auth-domain>
3. REACT_APP_FIREBASE_PROJECT_ID=<your-project-id>
4. REACT_APP_FIREBASE_STORAGE_BUCKET=<your-storage-bucket>
5. REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
6. REACT_APP_FIREBASE_APP_ID=<your-app-id>

## Start the Application:

bash
Copy
Edit

## npm run dev

## The app will be available at http://localhost:5173.

## Application Flow

- **Homepage:**
The homepage displays a list of YouTube videos fetched from Firestore. These videos are mapped to embedded iframes for autoplay. The videos are retrieved and stored in Redux, with loading states managed to show a loading spinner until all data is fetched.

- **Admin Access:**
Admins can access the admin panel by clicking the Admin button, which triggers a password modal. The password is validated from the .env file. If correct, the user is redirected to the admin dashboard.

- **Admin Dashboard:**
- **Add Video:** Admin can add new YouTube videos by providing a URL and setting a deletion load count.
- **Delete Video:** Admin can delete videos from the database by clicking the cross icon next to each video (after validating the password).

- **History and Stats:**
Admins can switch between Videos and History tabs. The History tab shows a table with video load statistics and includes a **Details** button for viewing detailed stats on each video.

- **Redux Structure**
- **asyncThunk:** Contains asynchronous functions for fetching and updating video data, as well as adding/removing videos.
- **config:** Configures the Redux store and provides the setup for state management.
- **slice:** Contains reducers and state slices, including video data, loading states, admin authentication, and password validation.

## Contributing
Feel free to fork the repository and submit pull requests for improvements, bug fixes, or new features. Please ensure any code changes are well-tested and documented.

Copy
Edit

This structured README ensures that each section is clear, easy to navigate, and provides a good overview of your project for both developers and users. Let me know if you'd like further adjustments!
