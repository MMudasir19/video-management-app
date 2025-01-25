import { StrictMode } from 'react'; // Import StrictMode for better error handling and debugging
import { createRoot } from 'react-dom/client'; // Import createRoot to initialize the React app
import './index.css'; // Import the global CSS styles
import App from './App.tsx'; // Import the root App component
import { Provider } from 'react-redux'; // Import the Provider component from React-Redux to pass down the Redux store
import { persistor, store } from './redux/config/configStore.ts'; // Import the Redux store from the config folder
import { PersistGate } from 'redux-persist/integration/react';
import Loading from './components/Loading.tsx';

// Create the root of the React application and render it in the DOM element with id 'root'
createRoot(document.getElementById('root')!).render(
  <StrictMode> {/* Wrap the app in StrictMode to identify potential problems during development */}
    <Provider store={store}> {/* Wrap the app with Redux's Provider to give the app access to the Redux store */}
      <PersistGate loading={<Loading />} persistor={persistor}>
        <App /> {/* The main component that will be rendered inside the root element */}
      </PersistGate>
    </Provider>
  </StrictMode>
);
