'use client';

import { useState, useEffect } from 'react';
import { auth, appleProvider } from '@/lib/firebase';

export default function AppleSignInDebug() {
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown>>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const gatherDebugInfo = () => {
      const info: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        language: navigator.language,
        languages: navigator.languages,
        firebaseAuth: !!auth,
        appleProvider: !!appleProvider,
        currentUrl: window.location.href,
        referrer: document.referrer,
        domain: window.location.hostname,
        protocol: window.location.protocol,
        port: window.location.port,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      };

      // Check for common Apple Sign-In issues
      if (typeof window !== 'undefined') {
        info.isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        info.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        info.isMac = /Mac/.test(navigator.userAgent);
        info.hasTouchSupport = 'ontouchstart' in window;
        info.screenSize = `${window.screen.width}x${window.screen.height}`;
        info.viewportSize = `${window.innerWidth}x${window.innerHeight}`;
      }

      // Check environment variables (only public ones)
      info.envVars = {
        hasFirebaseApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        hasFirebaseAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        hasFirebaseProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        hasFirebaseAppId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      setDebugInfo(info);
    };

    gatherDebugInfo();
  }, []);

  const copyDebugInfo = () => {
    navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-xs"
      >
        Debug Apple Sign-In
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Apple Sign-In Debug Info</h3>
          <div className="space-x-2">
            <button
              onClick={copyDebugInfo}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
            >
              Copy
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm"
            >
              Close
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Environment & Configuration</h4>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {JSON.stringify(debugInfo.envVars, null, 2)}
            </pre>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Browser & Platform</h4>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {JSON.stringify({
                userAgent: debugInfo.userAgent,
                platform: debugInfo.platform,
                isSafari: debugInfo.isSafari,
                isIOS: debugInfo.isIOS,
                isMac: debugInfo.isMac,
                hasTouchSupport: debugInfo.hasTouchSupport,
                cookieEnabled: debugInfo.cookieEnabled,
                onLine: debugInfo.onLine,
                language: debugInfo.language,
                languages: debugInfo.languages,
              }, null, 2)}
            </pre>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">URL & Location</h4>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {JSON.stringify({
                currentUrl: debugInfo.currentUrl,
                domain: debugInfo.domain,
                protocol: debugInfo.protocol,
                port: debugInfo.port,
                pathname: debugInfo.pathname,
                search: debugInfo.search,
                hash: debugInfo.hash,
                referrer: debugInfo.referrer,
              }, null, 2)}
            </pre>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Display & Screen</h4>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {JSON.stringify({
                screenSize: debugInfo.screenSize,
                viewportSize: debugInfo.viewportSize,
              }, null, 2)}
            </pre>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Firebase Status</h4>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {JSON.stringify({
                firebaseAuth: debugInfo.firebaseAuth,
                appleProvider: debugInfo.appleProvider,
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 