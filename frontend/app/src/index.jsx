import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query'; // 1. IMPORT WHAT IS NEEDED FROM REACT-QUERY

import App from './App';
import FullPageLoader from './components/ui/FullPageLoader'; // A loading component is better than plain text
import reportWebVitals from './reportWebVitals';

// Global styles
import './styles/index.css';
import 'react-toastify/dist/ReactToastify.css';
import 'react-datepicker/dist/react-datepicker.css';

// Internationalization setup
import './i18n';

// 2. CREATE A REACT-QUERY CLIENT INSTANCE
// Default options for all queries can be defined here
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is considered "fresh" for 5 minutes
      cacheTime: 1000 * 60 * 30, // Data stays cached for 30 minutes
      refetchOnWindowFocus: false, // Optional: prevents refetching when switching tabs
      retry: 1, // Retry failed requests 1 time
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application
root.render(
  <React.StrictMode>
    <Suspense fallback={<FullPageLoader />}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Suspense>
  </React.StrictMode>
);

// If you want to measure performance, you can keep this line
reportWebVitals();
