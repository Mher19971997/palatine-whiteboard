import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@palatine_whiteboard_frontend/contexts/AuthContext';
import AppRoutes from '@palatine_whiteboard_frontend/router/AppRoutes';
import '@palatine_whiteboard_frontend/shared/styles/App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;