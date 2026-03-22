import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CustomQuote, useCustomQuotes } from '@/context/CustomQuotesContext';
import { FontAwesome } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { useRef, useState } from 'react';
import { ImageBackground, Share, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';

export default function MyQuotesScreen() {
    const { customQuotes, removeCustomQuote } = useCustomQuotes();
    const insets = useSafeAreaInsets();
    const [currentIndex, setCurrentIndex] = useState(0);
    const viewShotRef = useRef<any>(null);

    const quote = customQuotes[currentIndex];

    const goBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const goNext = () => {
        if (currentIndex < customQuotes.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const deleteQuote = () => {
        if (!quote) return;
        removeCustomQuote(quote.id);
        if (currentIndex >= customQuotes.length - 1 && currentIndex > 0) {
            setCurrentIndex(customQuotes.length - 2);
        }
    };

    const copyToClipboard = async () => {
        if (!quote) return;
        try {
            if (viewShotRef.current) {
                await viewShotRef.current.capture();
                const textToCopy = `"${quote.text}" - ${quote.author}`;
                await Clipboard.setStringAsync(textToCopy);
                alert('Quote text copied to clipboard! (Use Share to send the image)');
            } else {
                const textToCopy = `"${quote.text}" - ${quote.author}`;
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
                message: `"${quote.text}" - ${quote.author}`,
            });
        } catch (error: any) {
            alert(error.message);
        }
    };

    const renderFontStyle = (styleType: string) => {
        if (styleType === 'italic') return { fontStyle: 'italic' as any };
        if (styleType === 'bold') return { fontWeight: 'bold' as any };
        return { fontWeight: 'normal' as any };
    };

    if (customQuotes.length === 0) {
        return (
            <ThemedView style={[styles.container, { paddingBottom: Math.max(insets.bottom + 24, 24) }]}>
                <View style={styles.emptyContainer}>
                    <FontAwesome name="pencil-square-o" size={60} color="#888" style={{ marginBottom: 20 }} />
                    <ThemedText style={{ fontSize: 20, textAlign: 'center', opacity: 0.8 }}>No custom quotes yet!</ThemedText>
                    <ThemedText style={{ fontSize: 16, textAlign: 'center', opacity: 0.5, marginTop: 10 }}>Head to the Create tab to make your own.</ThemedText>
                </View>
            </ThemedView>
        );
    }

    const { text, author, bgImage, quotePosition, textColor, textSize, fontFamily } = quote;

    // Use default dark text if color was transparent or missing in an error state
    const displayColor = textColor === '#ffffff' && !bgImage ? '#000000' : textColor;

    return (
        <ThemedView style={[styles.container, { paddingBottom: Math.max(insets.bottom + 24, 24) }]}>

            <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }} style={styles.viewShotContainer}>
                {bgImage ? (
                    <ImageBackground source={bgImage} style={[styles.quoteBgImage, { justifyContent: quotePosition }]} imageStyle={styles.quoteBgImageInner}>
                        <View style={[styles.quoteContainer, styles.quoteContainerTransparent]}>
                            <FontAwesome name="quote-left" size={30} color={textColor} style={{ alignSelf: 'flex-start', marginBottom: 10, opacity: 0.8 }} />
                            <ThemedText style={[styles.quoteText, { color: textColor, fontSize: textSize }, renderFontStyle(fontFamily)]}>{text}</ThemedText>
                            {author ? <ThemedText style={[styles.authorText, { color: textColor }]}>- {author}</ThemedText> : null}
                        </View>
                    </ImageBackground>
                ) : (
                    <View style={[styles.quoteContainer, styles.quoteContainerPlain, { justifyContent: quotePosition }]}>
                        <View style={styles.quoteContentWrapper}>
                            <FontAwesome name="quote-left" size={30} color={displayColor.length > 4 ? displayColor : '#666'} style={{ alignSelf: 'flex-start', marginBottom: 10, opacity: 0.5 }} />
                            <ThemedText style={[styles.quoteText, { color: displayColor, fontSize: textSize }, renderFontStyle(fontFamily)]}>{text}</ThemedText>
                            {author ? <ThemedText style={[styles.authorText, { color: displayColor }]}>- {author}</ThemedText> : null}
                        </View>
                    </View>
                )}
            </ViewShot>

            <View style={[styles.buttonContainer, { marginBottom: 12 }]}>
                <TouchableOpacity style={styles.iconButton} onPress={copyToClipboard}>
                    <FontAwesome name="copy" size={24} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconButton} onPress={shareQuote}>
                    <FontAwesome name="share-alt" size={24} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.iconButton, { backgroundColor: '#ff4444' }]} onPress={deleteQuote}>
                    <FontAwesome name="trash" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.actionButton, currentIndex <= 0 && { opacity: 0.5 }]} onPress={goBack} disabled={currentIndex <= 0}>
                    <ThemedText style={styles.actionButtonText}>Prev</ThemedText>
                </TouchableOpacity>

                <View style={styles.countIndicator}>
                    <ThemedText style={{ fontWeight: 'bold', fontSize: 16 }}>{currentIndex + 1} / {customQuotes.length}</ThemedText>
                </View>

                <TouchableOpacity style={[styles.actionButton, currentIndex >= customQuotes.length - 1 && { opacity: 0.5 }]} onPress={goNext} disabled={currentIndex >= customQuotes.length - 1}>
                    <ThemedText style={styles.actionButtonText}>Next</ThemedText>
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, paddingTop: 40, justifyContent: 'center' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    viewShotContainer: { backgroundColor: 'transparent', marginBottom: 20, borderRadius: 20 },
    quoteBgImage: { width: '100%', aspectRatio: 4 / 5, justifyContent: 'center', alignItems: 'center' },
    quoteBgImageInner: { borderRadius: 20 },
    quoteContainerPlain: { aspectRatio: 4 / 5, width: '100%' },
    quoteContainer: { padding: 30, borderRadius: 20, alignItems: 'center', width: '100%' },
    quoteContentWrapper: { width: '100%', alignItems: 'center' },
    quoteContainerTransparent: { backgroundColor: 'rgba(0, 0, 0, 0.4)', height: '100%', justifyContent: 'center' },
    quoteText: { textAlign: 'center', marginBottom: 20 },
    authorText: { fontSize: 18, fontWeight: 'bold', textAlign: 'right', alignSelf: 'flex-end', opacity: 0.8 },
    countIndicator: { flex: 0.5, justifyContent: 'center', alignItems: 'center' },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    iconButton: { flex: 1, backgroundColor: '#3b82f6', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    actionButton: { flex: 1.5, backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
