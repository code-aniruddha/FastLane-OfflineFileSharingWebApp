import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Home from './components/Home'
import LoadingScreen from './components/LoadingScreen'
import './App.css'

function App() {
  const [serverInfo, setServerInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get server info from Electron main process
    const getServerInfo = async () => {
      if (window.electronAPI) {
        try {
          const info = await window.electronAPI.getServerInfo();
          setServerInfo(info);

          // Keep loading screen visible for at least 1.5 seconds for smooth transition
          setTimeout(() => {
            setIsLoading(false);
          }, 1500);
        } catch (error) {
          console.error('Failed to get server info:', error);
          setIsLoading(false);
        }

        // Listen for server info updates
        window.electronAPI.onServerInfo((info) => {
          setServerInfo(info);
        });
      } else {
        // Fallback for browser testing
        const response = await fetch('http://localhost:3000/info');
        const data = await response.json();
        setServerInfo({
          host: 'localhost',
          port: 3000,
          token: data.token,
          url: 'http://localhost:3000'
        });

        // Keep loading screen visible for at least 1.5 seconds
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
      }
    };

    getServerInfo();

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeServerInfoListener();
      }
    };
  }, []);

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {isLoading || !serverInfo ? (
          <LoadingScreen key="loading" />
        ) : (
          <Home key="home" serverInfo={serverInfo} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
