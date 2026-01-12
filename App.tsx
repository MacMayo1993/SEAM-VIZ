import { Routes, Route, Navigate } from 'react-router-dom';
import StartMenu from './components/StartMenu';
import Tutorials from './components/Tutorials';
import QuotientSymmetry from './components/QuotientSymmetry';

function App() {
  return (
    <div className="app-container" style={{ height: '100vh', width: '100vw' }}>
      <Routes>
        <Route path="/" element={<StartMenu />} />
        <Route path="/tutorials" element={<Tutorials />} />
        <Route path="/quotient" element={<QuotientSymmetry />} />
        {/* Future: SEAM FLY integration */}
        {/* <Route path="/fly" element={<SeamFlyIntegration />} /> */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
