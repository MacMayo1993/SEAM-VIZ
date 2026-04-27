import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StartMenu from './components/StartMenu';

const Tutorials = lazy(() => import('./components/Tutorials'));
const QuotientSymmetry = lazy(() => import('./components/QuotientSymmetry'));

function App() {
  return (
    <div className="app-container" style={{ minHeight: '100dvh', width: '100vw' }}>
      <Suspense fallback={<div style={{ padding: '1rem' }}>Loading…</div>}>
        <Routes>
          <Route path="/" element={<StartMenu />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/quotient" element={<QuotientSymmetry />} />
          {/* Future: SEAM FLY integration */}
          {/* <Route path="/fly" element={<SeamFlyIntegration />} /> */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
