import React, { useState } from 'react';
import AppRouter from './router/AppRouter';

function App() {
  // Sahifa rejimini saqlash (default: dark mode)
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <AppRouter isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
    </div>
  );
}

export default App;