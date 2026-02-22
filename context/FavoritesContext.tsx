import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Quote {
    text: string;
    author: string;
}

interface FavoritesContextType {
    favorites: Quote[];
    addFavorite: (quote: Quote) => void;
    removeFavorite: (quote: Quote) => void;
    isFavorite: (quote: Quote) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
    favorites: [],
    addFavorite: () => { },
    removeFavorite: () => { },
    isFavorite: () => false,
});

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [favorites, setFavorites] = useState<Quote[]>([]);

    useEffect(() => {
        // Load saved favorites on mount
        const loadFavorites = async () => {
            try {
                const savedFavorites = await AsyncStorage.getItem('appFavorites');
                if (savedFavorites) {
                    setFavorites(JSON.parse(savedFavorites));
                }
            } catch (error) {
                console.error('Failed to load favorites', error);
            }
        };
        loadFavorites();
    }, []);

    const saveFavoritesToStorage = async (newFavorites: Quote[]) => {
        try {
            await AsyncStorage.setItem('appFavorites', JSON.stringify(newFavorites));
        } catch (error) {
            console.error('Failed to save favorites', error);
        }
    };

    const addFavorite = (quote: Quote) => {
        setFavorites((prev) => {
            if (prev.some(f => f.text === quote.text && f.author === quote.author)) return prev;
            const newFavorites = [...prev, quote];
            saveFavoritesToStorage(newFavorites);
            return newFavorites;
        });
    };

    const removeFavorite = (quote: Quote) => {
        setFavorites((prev) => {
            const newFavorites = prev.filter(f => !(f.text === quote.text && f.author === quote.author));
            saveFavoritesToStorage(newFavorites);
            return newFavorites;
        });
    };

    const isFavorite = (quote: Quote) => {
        return favorites.some(f => f.text === quote.text && f.author === quote.author);
    };

    return (
        <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};
