import { useState } from 'react';
import { AppMode } from './types';
import { HomeScreen } from './components/HomeScreen';
import { RainbowPlay } from './components/RainbowPlay';
import { FollowTheGlow } from './components/FollowTheGlow';
import { MagicSong } from './components/MagicSong';
import { ParentDashboard } from './components/ParentDashboard';
import { useAudio } from './hooks/useAudio';

export default function App() {
  const [mode, setMode] = useState<AppMode>('home');
  const { isHighQuality, loadError } = useAudio();

  switch (mode) {
    case 'rainbow':
      return <RainbowPlay onBack={() => setMode('home')} />;
    case 'glow':
      return <FollowTheGlow onBack={() => setMode('home')} />;
    case 'song':
      return <MagicSong onBack={() => setMode('home')} />;
    case 'parent':
      return <ParentDashboard onBack={() => setMode('home')} />;
    default:
      return (
        <HomeScreen
          onSelectMode={setMode}
          isLoadingAudio={!isHighQuality && !loadError}
        />
      );
  }
}
