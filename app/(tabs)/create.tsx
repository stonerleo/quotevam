import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CustomQuote, useCustomQuotes } from '@/context/CustomQuotesContext';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TEMPLATE_IMAGES = [
    require('@/assets/bg_template_1.png'),
    require('@/assets/bg_template_2.png'),
    require('@/assets/bg_template_3.png'),
];

const COLORS = ['#ffffff', '#000000', '#ffeb3b', '#f44336', '#4caf50', '#2196f3', '#9c27b0', '#ff9800'];
const FONTS = [
    { label: 'Normal', value: 'normal' },
    { label: 'Italic', value: 'italic' },
    { label: 'Bold', value: 'bold' }
];

export default function CreateScreen() {
    const { addCustomQuote } = useCustomQuotes();
    const insets = useSafeAreaInsets();

    const [text, setText] = useState('');
    const [author, setAuthor] = useState('');
    const [bgImage, setBgImage] = useState<any>(null);
    const [quotePosition, setQuotePosition] = useState<'flex-start' | 'center' | 'flex-end'>('center');
    const [textSize, setTextSize] = useState(24);
    const [textColor, setTextColor] = useState('#ffffff');
    const [fontStyleSelection, setFontStyleSelection] = useState('italic');

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

    const handleSave = () => {
        if (!text.trim()) {
            Alert.alert('Error', 'Please enter a quote.');
            return;
        }

        const newQuote: CustomQuote = {
            id: Date.now().toString(),
            text: text.trim(),
            author: author.trim(),
            textSize,
            textColor,
            fontFamily: fontStyleSelection,
            bgImage: bgImage ? bgImage : null,
            quotePosition
        };

        addCustomQuote(newQuote);
        Alert.alert('Success', 'Your custom quote has been saved to My Quotes!');
        // Reset form or leave it? We can reset text to make it obvious
        setText('');
        setAuthor('');
    };

    const renderFontStyle = (styleType: string) => {
        if (styleType === 'italic') return { fontStyle: 'italic' as any };
        if (styleType === 'bold') return { fontWeight: 'bold' as any };
        return { fontWeight: 'normal' as any };
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ThemedView style={[styles.container, { paddingBottom: Math.max(insets.bottom + 10, 24) }]}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                    <View style={styles.previewContainer}>
                        {bgImage ? (
                            <ImageBackground source={bgImage} style={[styles.quoteBgImage, { justifyContent: quotePosition }]} imageStyle={styles.quoteBgImageInner}>
                                <View style={[styles.quoteContainer, styles.quoteContainerTransparent]}>
                                    <FontAwesome name="quote-left" size={30} color={textColor} style={{ alignSelf: 'flex-start', marginBottom: 10, opacity: 0.8 }} />
                                    <ThemedText style={[styles.quoteText, { color: textColor, fontSize: textSize }, renderFontStyle(fontStyleSelection)]}>
                                        {text || 'Your quote here...'}
                                    </ThemedText>
                                    {author ? (
                                        <ThemedText style={[styles.authorText, { color: textColor }]}>
                                            - {author}
                                        </ThemedText>
                                    ) : null}
                                </View>
                            </ImageBackground>
                        ) : (
                            <View style={[styles.quoteContainer, styles.quoteContainerPlain, { justifyContent: quotePosition }]}>
                                <View style={styles.quoteContentWrapper}>
                                    <FontAwesome name="quote-left" size={30} color={textColor === '#ffffff' ? '#666' : textColor} style={{ alignSelf: 'flex-start', marginBottom: 10, opacity: 0.5 }} />
                                    <ThemedText style={[styles.quoteText, { color: textColor === '#ffffff' ? '#000' : textColor, fontSize: textSize }, renderFontStyle(fontStyleSelection)]}>
                                        {text || 'Your quote here...'}
                                    </ThemedText>
                                    {author ? (
                                        <ThemedText style={[styles.authorText, { color: textColor === '#ffffff' ? '#000' : textColor }]}>
                                            - {author}
                                        </ThemedText>
                                    ) : null}
                                </View>
                            </View>
                        )}
                    </View>

                    <View style={styles.inputsContainer}>
                        <View>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter your quote"
                                placeholderTextColor="#999"
                                multiline
                                maxLength={250}
                                value={text}
                                onChangeText={setText}
                            />
                            <ThemedText style={styles.charCount}>
                                {text.length}/250
                            </ThemedText>
                        </View>
                        <View>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Author Name"
                                placeholderTextColor="#999"
                                maxLength={50}
                                value={author}
                                onChangeText={setAuthor}
                            />
                            <ThemedText style={styles.charCount}>
                                {author.length}/50
                            </ThemedText>
                        </View>
                    </View>

                    {/* Layout & Font controls */}
                    <View style={styles.controlsRow}>
                        <View style={styles.alignmentContainer}>
                            <TouchableOpacity style={[styles.controlButton, quotePosition === 'flex-start' && styles.controlButtonSelected]} onPress={() => setQuotePosition('flex-start')}>
                                <FontAwesome name="align-left" size={16} color={quotePosition === 'flex-start' ? '#fff' : '#888'} style={{ transform: [{ rotate: '90deg' }] }} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.controlButton, quotePosition === 'center' && styles.controlButtonSelected]} onPress={() => setQuotePosition('center')}>
                                <FontAwesome name="align-center" size={16} color={quotePosition === 'center' ? '#fff' : '#888'} style={{ transform: [{ rotate: '90deg' }] }} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.controlButton, quotePosition === 'flex-end' && styles.controlButtonSelected]} onPress={() => setQuotePosition('flex-end')}>
                                <FontAwesome name="align-right" size={16} color={quotePosition === 'flex-end' ? '#fff' : '#888'} style={{ transform: [{ rotate: '90deg' }] }} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.sizeContainer}>
                            <TouchableOpacity style={styles.controlButton} onPress={() => setTextSize(Math.max(12, textSize - 2))}>
                                <FontAwesome name="minus" size={14} color="#888" />
                            </TouchableOpacity>
                            <ThemedText style={{ width: 30, textAlign: 'center', fontWeight: 'bold' }}>{textSize}</ThemedText>
                            <TouchableOpacity style={styles.controlButton} onPress={() => setTextSize(Math.min(50, textSize + 2))}>
                                <FontAwesome name="plus" size={14} color="#888" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Color controls */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                        {COLORS.map(color => (
                            <TouchableOpacity key={color} style={[styles.colorOption, { backgroundColor: color }, textColor === color && styles.colorOptionSelected]} onPress={() => setTextColor(color)} />
                        ))}
                    </ScrollView>

                    {/* Font Family controls */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                        {FONTS.map(font => (
                            <TouchableOpacity key={font.value} style={[styles.fontOption, fontStyleSelection === font.value && styles.fontOptionSelected]} onPress={() => setFontStyleSelection(font.value)}>
                                <ThemedText style={[styles.fontOptionText, fontStyleSelection === font.value && { color: '#fff' }]}>{font.label}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Background selector */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                        <TouchableOpacity style={[styles.bgOption, bgImage === null && styles.bgOptionSelected]} onPress={() => setBgImage(null)}>
                            <View style={[styles.bgOptionColor, { backgroundColor: '#ccc' }]} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.bgOption} onPress={pickImage}>
                            <View style={[styles.bgOptionColor, styles.bgOptionUpload]}>
                                <FontAwesome name="upload" size={20} color="#fff" />
                            </View>
                        </TouchableOpacity>

                        {TEMPLATE_IMAGES.map((img, index) => (
                            <TouchableOpacity key={index} style={[styles.bgOption, bgImage === img && styles.bgOptionSelected]} onPress={() => setBgImage(img)}>
                                <Image source={img} style={styles.bgOptionImage} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <FontAwesome name="save" size={20} color="#fff" />
                        <ThemedText style={styles.saveButtonText}>Save Quote</ThemedText>
                    </TouchableOpacity>

                </ScrollView>
            </ThemedView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, paddingTop: 10 },
    previewContainer: {
        marginBottom: 20,
        borderRadius: 20,
    },
    quoteBgImage: {
        width: '100%',
        aspectRatio: 4 / 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quoteBgImageInner: { borderRadius: 20 },
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
    },
    quoteContentWrapper: { width: '100%', alignItems: 'center' },
    quoteContainerTransparent: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        height: '100%',
        justifyContent: 'center',
    },
    quoteText: {
        textAlign: 'center',
        marginBottom: 20,
    },
    authorText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'right',
        alignSelf: 'flex-end',
        opacity: 0.8,
    },
    inputsContainer: { gap: 10, marginBottom: 20 },
    textInput: {
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
        color: '#000', // adjust depending on theme if needed, assume dynamic elsewhere, but we don't have theme aware text input simple fix here. Let's use a themed text input or just white/black. We'll let it be default.
        padding: 15,
        borderRadius: 12,
        fontSize: 16,
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        alignItems: 'center'
    },
    alignmentContainer: { flexDirection: 'row', gap: 10 },
    sizeContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    controlButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(150, 150, 150, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlButtonSelected: { backgroundColor: '#3b82f6' },
    horizontalScroll: { marginBottom: 20, flexGrow: 0 },
    colorOption: {
        width: 40, height: 40, borderRadius: 20, marginRight: 15, borderWidth: 1, borderColor: '#ddd'
    },
    colorOptionSelected: { borderWidth: 3, borderColor: '#3b82f6' },
    fontOption: {
        paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(150, 150, 150, 0.2)', marginRight: 15
    },
    fontOptionSelected: { backgroundColor: '#3b82f6' },
    fontOptionText: { fontWeight: 'bold' },
    bgOption: { marginRight: 15 },
    bgOptionSelected: { borderWidth: 2, borderColor: '#3b82f6', borderRadius: 8, padding: 2 },
    bgOptionColor: { width: 50, height: 50, borderRadius: 8 },
    bgOptionImage: { width: 50, height: 50, borderRadius: 8, resizeMode: 'cover' },
    bgOptionUpload: { backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
    saveButton: {
        backgroundColor: '#10b981',
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginTop: 10
    },
    saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    charCount: {
        fontSize: 12,
        textAlign: 'right',
        marginTop: 4,
        marginRight: 4,
        opacity: 0.6
    }
});
