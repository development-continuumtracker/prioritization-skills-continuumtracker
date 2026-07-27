import React, { useState } from 'react';
import { IntroScreen } from './IntroScreen.jsx';
import CurrentFlow from './flows/CurrentFlow.jsx';
import SuggestedFlow from './flows/SuggestedFlow.jsx';

export default function App() {
  const [screen, setScreen] = useState('intro'); // 'intro' | 'current' | 'suggested'
  const back = () => setScreen('intro');

  if (screen === 'current') return <CurrentFlow onRestart={back} />;
  if (screen === 'suggested') return <SuggestedFlow onRestart={back} />;
  return <IntroScreen onPick={setScreen} />;
}
