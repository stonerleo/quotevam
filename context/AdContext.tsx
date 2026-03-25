import React, { createContext, useContext, useEffect, useState } from 'react';
import { useInterstitialAd, TestIds } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-3489593844596905/3048934460';

type AdContextType = {
  registerInteraction: () => void;
};

const AdContext = createContext<AdContextType>({ registerInteraction: () => {} });

export const AdProvider = ({ children }: { children: React.ReactNode }) => {
  const [clickCount, setClickCount] = useState(0);
  const { isLoaded, isClosed, load, show } = useInterstitialAd(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (isClosed) {
      load(); // Load next ad after current one is closed
    }
  }, [isClosed, load]);

  const registerInteraction = () => {
    setClickCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 20) {
        if (isLoaded) {
          show();
          return 0; // Reset
        } else {
          load();
        }
      }
      return newCount;
    });
  };

  return (
    <AdContext.Provider value={{ registerInteraction }}>
      {children}
    </AdContext.Provider>
  );
};

export const useAdManager = () => useContext(AdContext);
