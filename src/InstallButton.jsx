import { useEffect, useState } from 'react';

function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setIsVisible(false);
      });
    }
  };

  const handleCancelInstall = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-800 w-4/5 max-w-md p-6 rounded-lg shadow-xl">
        <p className="text-white font-bold text-center mb-6">
          You can install this app and add to your home screen
        </p>
        <div className="flex justify-around">
          <button
            onClick={handleCancelInstall}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleInstall}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}

export default InstallButton;