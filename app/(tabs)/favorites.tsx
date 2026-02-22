import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useFavorites } from '@/context/FavoritesContext';
import { FontAwesome } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { useRef, useState } from 'react';
import { Image, ImageBackground, ScrollView, Share, StyleSheet, TouchableOpacity, View } from 'react-native';
import ViewShot from 'react-native-view-shot';

const TEMPLATE_IMAGES = [
    require('@/assets/bg_template_1.png'),
    require('@/assets/bg_template_2.png'),
    require('@/assets/bg_template_3.png'),
];

type QuotePosition = 'flex-start' | 'center' | 'flex-end';

export default function FavoritesScreen() {
    const { favorites, isFavorite, addFavorite, removeFavorite } = useFavorites();
    const [currentIndex, setCurrentIndex] = useState(0);

    // Background Image State
    const [bgImage, setBgImage] = useState<any>(null); // null means no background
    const viewShotRef = useRef<any>(null);

    // Quote Layout State
    const [quotePosition, setQuotePosition] = useState<QuotePosition>('center');
    const [showAuthor, setShowAuthor] = useState<boolean>(true);

    // Derived current quote
    const quote = favorites[currentIndex];

    const goBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const goNext = () => {
        if (currentIndex < favorites.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const toggleFavorite = () => {
        if (!quote) return;
        if (isFavorite(quote)) {
            removeFavorite(quote);
            // Ensure we don't go out of bounds if we removed the last item
            if (currentIndex >= favorites.length - 1 && currentIndex > 0) {
                setCurrentIndex(favorites.length - 2);
            }
        } else {
            addFavorite(quote);
        }
    };

    const toggleAuthor = () => {
        setShowAuthor(prev => !prev);
    }

    const copyToClipboard = async () => {
        if (!quote) return;
        try {
            if (viewShotRef.current) {
                await viewShotRef.current.capture();
                const textToCopy = showAuthor ? `"${quote.text}" - ${quote.author}` : `"${quote.text}"`;
                await Clipboard.setStringAsync(textToCopy);
                alert('Quote text copied to clipboard! (Use Share to send the image)');
            } else {
                const textToCopy = showAuthor ? `"${quote.text}" - ${quote.author}` : `"${quote.text}"`;
                await Clipboard.setStringAsync(textToCopy);
                alert('Quote text copied to clipboard!');
            }
        } catch (error: any) {
            alert(error.message);
        }
    };

    const shareQuote = async () => {
        if (!quote) return;
        try {
            if (viewShotRef.current) {
                const uri = await viewShotRef.current.capture();
                const isSharingAvailable = await Sharing.isAvailableAsync();

                if (isSharingAvailable) {
                    await Sharing.shareAsync(uri, {
                        dialogTitle: 'Share Quote Image',
                        mimeType: 'image/png'
                    });
                    return;
                }
            }

            await Share.share({
                message: showAuthor ? `"${quote.text}" - ${quote.author}` : `"${quote.text}"`,
            });

        } catch (error: any) {
            alert(error.message);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 5],
            quality: 1,
        });

        if (!result.canceled) {
            setBgImage({ uri: result.assets[0].uri });
        }
    };

    if (favorites.length === 0) {
        return (
            <ThemedView style={styles.container}>
                <View style={styles.emptyContainer}>
                    <FontAwesome name="heart-o" size={60} color="#888" style={{ marginBottom: 20 }} />
                    <ThemedText style={{ fontSize: 20, textAlign: 'center', opacity: 0.8 }}>No favorites yet!</ThemedText>
                    <ThemedText style={{ fontSize: 16, textAlign: 'center', opacity: 0.5, marginTop: 10 }}>Click the heart icon on the Home screen to save quotes here.</ThemedText>
                </View>
            </ThemedView>
        )
    }

    return (
        <ThemedView style={styles.container}>

            <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }} style={styles.viewShotContainer}>
                {bgImage ? (
                    <ImageBackground source={bgImage} style={[styles.quoteBgImage, { justifyContent: quotePosition }]} imageStyle={styles.quoteBgImageInner}>
                        <View style={[styles.quoteContainer, styles.quoteContainerTransparent]}>
                            <FontAwesome name="quote-left" size={30} color="#fff" style={styles.quoteIconLight} />
                            <ThemedText style={[styles.quoteText, { color: '#fff' }]}>{quote?.text}</ThemedText>
                            {showAuthor && <ThemedText style={[styles.authorText, { color: '#fff' }]}>- {quote?.author}</ThemedText>}
                        </View>
                    </ImageBackground>
                ) : (
                    <View style={[styles.quoteContainer, styles.quoteContainerPlain, { justifyContent: quotePosition }]}>
                        <View style={styles.quoteContentWrapper}>
                            <FontAwesome name="quote-left" size={30} color="#666" style={styles.quoteIcon} />
                            <ThemedText style={styles.quoteText}>{quote?.text}</ThemedText>
                            {showAuthor && <ThemedText style={styles.authorText}>- {quote?.author}</ThemedText>}
                        </View>
                    </View>
                )}
            </ViewShot>

            {/* Alignment Controls */}
            <View style={styles.alignmentContainer}>
                <TouchableOpacity
                    style={[styles.alignmentButton, quotePosition === 'flex-start' && styles.alignmentButtonSelected]}
                    onPress={() => setQuotePosition('flex-start')}
                >
                    <FontAwesome name="align-left" size={16} color={quotePosition === 'flex-start' ? '#fff' : '#888'} style={{ transform: [{ rotate: '90deg' }] }} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.alignmentButton, quotePosition === 'center' && styles.alignmentButtonSelected]}
                    onPress={() => setQuotePosition('center')}
                >
                    <FontAwesome name="align-center" size={16} color={quotePosition === 'center' ? '#fff' : '#888'} style={{ transform: [{ rotate: '90deg' }] }} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.alignmentButton, quotePosition === 'flex-end' && styles.alignmentButtonSelected]}
                    onPress={() => setQuotePosition('flex-end')}
                >
                    <FontAwesome name="align-right" size={16} color={quotePosition === 'flex-end' ? '#fff' : '#888'} style={{ transform: [{ rotate: '90deg' }] }} />
                </TouchableOpacity>
            </View>

            <View style={styles.backgroundSelectorWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.backgroundSelector}>
                    <TouchableOpacity
                        style={[styles.bgOption, bgImage === null && styles.bgOptionSelected]}
                        onPress={() => setBgImage(null)}
                    >
                        <View style={[styles.bgOptionColor, { backgroundColor: '#ccc' }]} />
                        <ThemedText style={styles.bgOptionText}>None</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.bgOption} onPress={pickImage}>
                        <View style={[styles.bgOptionColor, styles.bgOptionUpload]}>
                            <FontAwesome name="upload" size={20} color="#fff" />
                        </View>
                        <ThemedText style={styles.bgOptionText}>Upload</ThemedText>
                    </TouchableOpacity>

                    {TEMPLATE_IMAGES.map((img, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.bgOption, bgImage === img && styles.bgOptionSelected]}
                            onPress={() => setBgImage(img)}
                        >
                            <Image source={img} style={styles.bgOptionImage} />
                            <ThemedText style={styles.bgOptionText}>Temp {index + 1}</ThemedText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Actions (Top row) */}
            <View style={[styles.buttonContainer, { marginBottom: 12 }]}>
                <TouchableOpacity style={styles.iconButton} onPress={copyToClipboard}>
                    <FontAwesome name="copy" size={24} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconButton} onPress={shareQuote}>
                    <FontAwesome name="share-alt" size={24} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconButton} onPress={toggleAuthor}>
                    <FontAwesome name={showAuthor ? "eye" : "eye-slash"} size={24} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconButton} onPress={toggleFavorite}>
                    <FontAwesome name={isFavorite(quote) ? "heart" : "heart-o"} size={24} color={isFavorite(quote) ? "#ff4444" : "#fff"} />
                </TouchableOpacity>
            </View>

            {/* Navigation (Bottom row) */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, currentIndex <= 0 && { opacity: 0.5 }]}
                    onPress={goBack}
                    disabled={currentIndex <= 0}
                >
                    <ThemedText style={styles.actionButtonText}>Prev</ThemedText>
                </TouchableOpacity>

                <View style={styles.countIndicator}>
                    <ThemedText style={{ fontWeight: 'bold', fontSize: 16 }}>{currentIndex + 1} / {favorites.length}</ThemedText>
                </View>

                <TouchableOpacity
                    style={[styles.actionButton, currentIndex >= favorites.length - 1 && { opacity: 0.5 }]}
                    onPress={goNext}
                    disabled={currentIndex >= favorites.length - 1}
                >
                    <ThemedText style={styles.actionButtonText}>Next</ThemedText>
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    countIndicator: {
        flex: 0.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewShotContainer: {
        backgroundColor: 'transparent',
        marginBottom: 20,
        borderRadius: 20,
    },
    quoteBgImage: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quoteBgImageInner: {
        borderRadius: 20,
    },
    quoteContainerPlain: {
        aspectRatio: 4 / 5,
        width: '100%',
    },
    quoteContainer: {
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    quoteContentWrapper: {
        width: '100%',
        alignItems: 'center',
    },
    quoteContainerTransparent: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark overlay for text readability
        marginVertical: 20,
    },
    quoteIcon: {
        alignSelf: 'flex-start',
        marginBottom: 10,
        opacity: 0.5,
    },
    quoteIconLight: {
        alignSelf: 'flex-start',
        marginBottom: 10,
        opacity: 0.8,
    },
    quoteText: {
        fontSize: 24,
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 34,
    },
    authorText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'right',
        alignSelf: 'flex-end',
        opacity: 0.8,
    },
    alignmentContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
        marginBottom: 20,
    },
    alignmentButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(150, 150, 150, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alignmentButtonSelected: {
        backgroundColor: '#3b82f6',
    },
    backgroundSelectorWrapper: {
        height: 80,
        marginBottom: 20,
    },
    backgroundSelector: {
        alignItems: 'center',
        gap: 15,
        paddingHorizontal: 10,
    },
    bgOption: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    bgOptionSelected: {
        borderWidth: 2,
        borderColor: '#3b82f6',
        borderRadius: 8,
        padding: 2,
    },
    bgOptionImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        resizeMode: 'cover',
    },
    bgOptionColor: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
    bgOptionUpload: {
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bgOptionText: {
        fontSize: 12,
        marginTop: 4,
        opacity: 0.8,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    iconButton: {
        flex: 1,
        backgroundColor: '#3b82f6',
        paddingVertical: 14,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    actionButton: {
        flex: 1.5,
        backgroundColor: '#10b981',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
