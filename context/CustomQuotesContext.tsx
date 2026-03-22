import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CustomQuote {
    id: string;
    text: string;
    author: string;
    textSize: number;
    textColor: string;
    fontFamily: string;
    bgImage: any | null;
    quotePosition: 'flex-start' | 'center' | 'flex-end';
}

interface CustomQuotesContextType {
    customQuotes: CustomQuote[];
    addCustomQuote: (quote: CustomQuote) => void;
    removeCustomQuote: (id: string) => void;
}

const CustomQuotesContext = createContext<CustomQuotesContextType>({
    customQuotes: [],
    addCustomQuote: () => { },
    removeCustomQuote: () => { },
});

export const useCustomQuotes = () => useContext(CustomQuotesContext);

export const CustomQuotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [customQuotes, setCustomQuotes] = useState<CustomQuote[]>([]);

    useEffect(() => {
        const loadCustomQuotes = async () => {
            try {
                const saved = await AsyncStorage.getItem('appCustomQuotes');
                if (saved) {
                    setCustomQuotes(JSON.parse(saved));
                }
            } catch (error) {
                console.error('Failed to load custom quotes', error);
            }
        };
        loadCustomQuotes();
    }, []);

    const saveCustomQuotesToStorage = async (quotes: CustomQuote[]) => {
        try {
            await AsyncStorage.setItem('appCustomQuotes', JSON.stringify(quotes));
        } catch (error) {
            console.error('Failed to save custom quotes', error);
        }
    };

    const addCustomQuote = (quote: CustomQuote) => {
        setCustomQuotes((prev) => {
            const newQuotes = [...prev, quote];
            saveCustomQuotesToStorage(newQuotes);
            return newQuotes;
        });
    };

    const removeCustomQuote = (id: string) => {
        setCustomQuotes((prev) => {
            const newQuotes = prev.filter(q => q.id !== id);
            saveCustomQuotesToStorage(newQuotes);
            return newQuotes;
        });
    };

    return (
        <CustomQuotesContext.Provider value={{ customQuotes, addCustomQuote, removeCustomQuote }}>
            {children}
        </CustomQuotesContext.Provider>
    );
};
