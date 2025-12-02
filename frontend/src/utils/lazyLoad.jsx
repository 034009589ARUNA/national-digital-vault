import { lazy } from 'react';

// Lazy load components for better performance
export const LazyLandingPage = lazy(() => import('../components/LandingPage'));
export const LazyUploadForm = lazy(() => import('../components/UploadForm'));
export const LazyDashboard = lazy(() => import('../components/Dashboard'));
export const LazyVerify = lazy(() => import('../components/Verify'));
export const LazyProofPage = lazy(() => import('../components/ProofPage'));
export const LazyLogin = lazy(() => import('../components/Login'));
export const LazyRegister = lazy(() => import('../components/Register'));
export const LazyGovernmentPortal = lazy(() => import('../components/GovernmentPortal'));
export const LazyPublicRegistry = lazy(() => import('../components/PublicRegistry'));

