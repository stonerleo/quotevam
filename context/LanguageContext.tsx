import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type LanguageType = 'en' | 'es' | 'fr' | 'hi' | 'mr' | 'ml';

interface LanguageContextType {
    language: LanguageType;
    setLanguage: (lang: LanguageType) => void;
}

const LanguageContext = createContext<LanguageContextType>({
    language: 'en',
    setLanguage: () => { },
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<LanguageType>('en');

    useEffect(() => {
        // Load saved language on mount
        const loadLanguage = async () => {
            try {
                const savedLang = await AsyncStorage.getItem('appLanguage');
                if (savedLang) {
                    setLanguageState(savedLang as LanguageType);
                }
            } catch (error) {
                console.error('Failed to load language', error);
            }
        };
        loadLanguage();
    }, []);

    const setLanguage = async (lang: LanguageType) => {
        setLanguageState(lang);
        try {
            await AsyncStorage.setItem('appLanguage', lang);
        } catch (error) {
            console.error('Failed to save language', error);
        }
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};
