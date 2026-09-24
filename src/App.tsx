import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/Toast';

// Route-level code splitting: each page is its own chunk.
const HomePage = lazy(() => import('./pages/HomePage'));
const DiscoverPage = lazy(() => import('./pages/DiscoverPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const GamePage = lazy(() => import('./pages/GamePage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const RecentPage = lazy(() => import('./pages/RecentPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const InfoPage = lazy(() => import('./pages/InfoPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <ToastProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="discover" element={<DiscoverPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="categories/:id" element={<CategoryPage />} />
            <Route path="games/:slug" element={<GamePage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="recent" element={<RecentPage />} />
            <Route path="settings" element={<SettingsPage />} />
            {['about', 'privacy', 'terms', 'contact'].map((p) => (
              <Route key={p} path={p} element={<InfoPage />} />
            ))}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
