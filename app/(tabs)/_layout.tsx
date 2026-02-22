import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

function CustomDrawerContent(props: any) {
  const { language, setLanguage } = useLanguage();
  const theme = useColorScheme() ?? 'light';

  // Structured Language Groups
  const languageGroups = [
    {
      title: 'English',
      languages: [{ code: 'en', label: 'English' }]
    },
    {
      title: 'Hindi',
      languages: [{ code: 'hi', label: 'हिन्दी (Hindi)' }]
    },
    {
      title: 'Indian Regional Languages',
      languages: [
        { code: 'mr', label: 'मराठी (Marathi)' },
        { code: 'ml', label: 'മലയാളം (Malayalam)' }
      ]
    },
    {
      title: 'International',
      languages: [
        { code: 'es', label: 'Español' },
        { code: 'fr', label: 'Français' }
      ]
    }
  ] as const;

  return (
    <DrawerContentScrollView {...props}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: Colors[theme].text }}>
          Language
        </Text>

        {languageGroups.map((group, index) => (
          <View key={index} style={{ marginBottom: 15 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: Colors[theme].text,
              opacity: 0.6,
              marginBottom: 8,
              marginLeft: 4,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}>
              {group.title}
            </Text>

            {group.languages.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  marginVertical: 4,
                  backgroundColor: language === lang.code ? '#3b82f6' : 'transparent',
                  borderRadius: 8
                }}
                onPress={() => {
                  setLanguage(lang.code as any);
                  props.navigation.closeDrawer();
                }}
              >
                <Text style={{
                  color: language === lang.code ? '#fff' : Colors[theme].text,
                  fontWeight: language === lang.code ? 'bold' : 'normal',
                  fontSize: 16
                }}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

      </View>
      <View style={{ height: 1, backgroundColor: '#ccc', marginVertical: 10, opacity: 0.5 }} />
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  const colorScheme = useColorScheme();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background },
        headerTintColor: Colors[colorScheme ?? 'light'].text,
        drawerActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}>
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Home',
          title: 'Quotes',
        }}
      />
      <Drawer.Screen
        name="favorites"
        options={{
          drawerLabel: 'Favorites',
          title: 'My Favorites',
        }}
      />
      <Drawer.Screen
        name="explore"
        options={{
          drawerLabel: 'Explore',
          title: 'Explore',
        }}
      />
    </Drawer>
  );
}
