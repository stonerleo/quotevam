import quotesEn from '@/assets/quotes_en.json';
import quotesEs from '@/assets/quotes_es.json';
import quotesFr from '@/assets/quotes_fr.json';
import quotesHi from '@/assets/quotes_hi.json';
import quotesMl from '@/assets/quotes_ml.json';
import quotesMr from '@/assets/quotes_mr.json';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useFavorites } from '@/context/FavoritesContext';
import { useLanguage } from '@/context/LanguageContext';
import { FontAwesome } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, ImageBackground, ScrollView, Share, StyleSheet, TouchableOpacity, View } from 'react-native';
import ViewShot from 'react-native-view-shot';

const quotesMap: Record<string, any[]> = {
  en: quotesEn,
  es: quotesEs,
  fr: quotesFr,
  hi: quotesHi,
  mr: quotesMr,
  ml: quotesMl
};

const TEMPLATE_IMAGES = [
  require('@/assets/bg_template_1.png'),
  require('@/assets/bg_template_2.png'),
  require('@/assets/bg_template_3.png'),
];

type QuotePosition = 'flex-start' | 'center' | 'flex-end';

export default function HomeScreen() {
  const { language } = useLanguage();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [quotesData, setQuotesData] = useState(quotesMap['en']);

  // Keep track of quote history and current index
  const [quoteHistory, setQuoteHistory] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Background Image State
  const [bgImage, setBgImage] = useState<any>(null); // null means no background
  const viewShotRef = useRef<any>(null);

  // Quote Layout State
  const [quotePosition, setQuotePosition] = useState<QuotePosition>('center');
  const [showAuthor, setShowAuthor] = useState<boolean>(true);

  // Derived current quote
  const quote = quoteHistory[currentIndex] || quotesData[0];

  useEffect(() => {
    setQuotesData(quotesMap[language]);
    setQuoteHistory([]);
    setCurrentIndex(-1);
  }, [language]);

  const getRandomQuote = useCallback((data = quotesData) => {
    if (!data || data.length === 0) return;
    const randomIndex = Math.floor(Math.random() * data.length);
    const newQuote = data[randomIndex];

    // Add to history and update index
    setQuoteHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      return [...newHistory, newQuote];
    });
    setCurrentIndex(prev => prev + 1);
  }, [quotesData, currentIndex]);

  useEffect(() => {
    if (quoteHistory.length === 0) {
      getRandomQuote(quotesData);
    }
  }, [quotesData, getRandomQuote, quoteHistory.length]);

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const toggleFavorite = () => {
    if (isFavorite(quote)) {
      removeFavorite(quote);
    } else {
      addFavorite(quote);
    }
  };

  const toggleAuthor = () => {
    setShowAuthor(prev => !prev);
  };

  const copyToClipboard = async () => {
    try {
      if (viewShotRef.current) {
        // Capture the ViewShot as a base64 string to copy the image
        await viewShotRef.current.capture();

        // Note: Expo Clipboard doesn't natively support copying images on all platforms 
        // with just a URI easily. For robust image copying, we might need expo-sharing 
        // or a specific base64 encoding, but we'll try to share it instead if they want the image.
        // It's still standard to copy just the text to the clipboard for pasting into text fields.
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
    try {
      if (viewShotRef.current) {
        // Capture the viewShot
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

      // Fallback
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

  return (
    <ThemedView style={styles.container}>

      <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }} style={styles.viewShotContainer}>
        {bgImage ? (
          <ImageBackground source={bgImage} style={styles.quoteBgImage} imageStyle={styles.quoteBgImageInner}>
            <View style={[styles.quoteContainer, styles.quoteContainerTransparent, { justifyContent: quotePosition }]}>
              <FontAwesome name="quote-left" size={30} color="#fff" style={styles.quoteIconLight} />
              <ThemedText style={[styles.quoteText, { color: '#fff' }]}>{quote.text}</ThemedText>
              {showAuthor && <ThemedText style={[styles.authorText, { color: '#fff' }]}>- {quote.author}</ThemedText>}
            </View>
          </ImageBackground>
        ) : (
          <View style={[styles.quoteContainer, styles.quoteContainerPlain, { justifyContent: quotePosition }]}>
            <View style={styles.quoteContentWrapper}>
              <FontAwesome name="quote-left" size={30} color="#666" style={styles.quoteIcon} />
              <ThemedText style={styles.quoteText}>{quote.text}</ThemedText>
              {showAuthor && <ThemedText style={styles.authorText}>- {quote.author}</ThemedText>}
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
            style={styles.bgOption}
            onPress={() => setBgImage(null)}
          >
            <View style={[styles.bgImageWrapper, bgImage === null && styles.bgImageWrapperSelected]}>
              <View style={[styles.bgOptionColor, { backgroundColor: '#ccc' }]} />
            </View>
            <ThemedText style={styles.bgOptionText}>None</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bgOption} onPress={pickImage}>
            <View style={styles.bgImageWrapper}>
              <View style={[styles.bgOptionColor, styles.bgOptionUpload]}>
                <FontAwesome name="upload" size={20} color="#fff" />
              </View>
            </View>
            <ThemedText style={styles.bgOptionText}>Upload</ThemedText>
          </TouchableOpacity>

          {TEMPLATE_IMAGES.map((img, index) => (
            <TouchableOpacity
              key={index}
              style={styles.bgOption}
              onPress={() => setBgImage(img)}
            >
              <View style={[styles.bgImageWrapper, bgImage === img && styles.bgImageWrapperSelected]}>
                <Image source={img} style={styles.bgOptionImage} />
              </View>
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

        <TouchableOpacity style={styles.actionButton} onPress={() => getRandomQuote()}>
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
  viewShotContainer: {
    backgroundColor: 'transparent',
    marginBottom: 20,
    borderRadius: 20,
  },
  quoteBgImage: {
    width: '100%',
    aspectRatio: 4 / 5,
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
    height: '100%',
    justifyContent: 'center',
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
    height: 100,
    marginBottom: 10,
    justifyContent: 'center',
  },
  backgroundSelector: {
    alignItems: 'center',
    gap: 15,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  bgOption: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgImageWrapper: {
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgImageWrapperSelected: {
    borderColor: '#3b82f6',
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
