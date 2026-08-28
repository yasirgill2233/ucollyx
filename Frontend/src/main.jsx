// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App'
// import { BrowserRouter } from 'react-router';
// import { GoogleOAuthProvider } from '@react-oauth/google';

// createRoot(document.getElementById('root')).render(
//  <StrictMode>
//     <BrowserRouter>
//       <GoogleOAuthProvider clientId="527520276679-u122prvp5mjtcp7h85kflce7g961hq9q.apps.googleusercontent.com">
//       <App />
//     </GoogleOAuthProvider>
//     </BrowserRouter>
//   </StrictMode>
// )


import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router';
import { GoogleOAuthProvider } from '@react-oauth/google';

// 1. React Query ke zaroori imports
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// 2. QueryClient ka instance banayein
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes tak data ko "fresh" samjho
      gcTime: 1000 * 60 * 30,    // 30 minutes baad unused data delete kar do
      retry: 1,                 // Agar fail ho to sirf 1 baar retry kare (default 3 hota hai)
      refetchOnWindowFocus: true, // Tab change kar ke wapis aane par refresh ho
    },
  },
});

createRoot(document.getElementById('root')).render(
  <>
    {/* 3. QueryClientProvider se wrap karein */}
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GoogleOAuthProvider clientId="527520276679-u122prvp5mjtcp7h85kflce7g961hq9q.apps.googleusercontent.com">
          <App />
        </GoogleOAuthProvider>
      </BrowserRouter>
      
      {/* 4. Devtools: Ye sirf development mein nazar aayenge aur debugging asaan kar denge */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </>
)