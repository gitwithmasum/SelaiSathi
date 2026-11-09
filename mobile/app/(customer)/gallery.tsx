import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Linking,
  ScrollView,
} from 'react-native';
import { colors } from '../../src/theme/colors.js';
import { typography } from '../../src/theme/typography.js';
import { Card } from '../../src/components/ui/Card.js';
import api from '../../src/services/api.js';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  makingCharge?: number;
  tags?: string[];
  likesCount?: number;
  isFavorited?: boolean;
  tailor?: {
    shopName: string;
    phone: string;
    address: string;
  };
}

const CATEGORIES = [
  { id: 'ALL', label: 'সব ডিজাইন' },
  { id: 'PANJABI', label: 'পাঞ্জাবি' },
  { id: 'SHIRT', label: 'শার্ট' },
  { id: 'PANT', label: 'প্যান্ট' },
  { id: 'SALWAR_KAMEEZ', label: 'কামিজ' },
  { id: 'BLAZER', label: 'ব্লেজার/কোটি' },
];

export default function CustomerGalleryScreen() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchItems = async () => {
    try {
      const categoryParam = selectedCategory !== 'ALL' ? `?category=${selectedCategory}` : '';
      const res = await api.get(`/gallery${categoryParam}`);
      if (res.data?.success && res.data.data?.length > 0) {
        setItems(res.data.data);
      } else {
        fallbackItems();
      }
    } catch {
      fallbackItems();
    }
  };

  const fallbackItems = () => {
    setItems([
      {
        id: 'g1',
        title: 'রয়্যাল কাবলি সেট উইথ কটি',
        category: 'PANJABI',
        imageUrl: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=600&auto=format&fit=crop&q=80',
        makingCharge: 650,
        tags: ['ঈদ স্পেশাল', 'ব্যান্ড কলার', 'কাবলি কাট'],
        likesCount: 28,
        isFavorited: false,
        tailor: {
          shopName: 'নিউ ফ্যাশন টেইলার্স',
          phone: '01711223344',
          address: 'নিউমার্কেট, ঢাকা',
        },
      },
      {
        id: 'g2',
        title: 'ইটালিয়ান কলার স্লিম ফিট ফরমাল শার্ট',
        category: 'SHIRT',
        imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80',
        makingCharge: 400,
        tags: ['অফিস ওয়্যার', 'হ্যান্ড কটন', 'ডাবল স্টিচ'],
        likesCount: 15,
        isFavorited: true,
        tailor: {
          shopName: 'রয়েল টেইলার্স',
          phone: '01811223344',
          address: 'ধানমন্ডি, ঢাকা',
        },
      },
      {
        id: 'g3',
        title: 'প্রিমিয়াম জর্জেট ফ্লেয়ার্ড আনস্টিচড কামিজ',
        category: 'SALWAR_KAMEEZ',
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
        makingCharge: 550,
        tags: ['উৎসব', 'জরির কাজ', 'পাইপিন ফিনিশিং'],
        likesCount: 34,
        isFavorited: false,
        tailor: {
          shopName: 'ক্লাসিক লেডিস টেইলার্স',
          phone: '01911223344',
          address: 'মিরপুর-১০, ঢাকা',
        },
      },
      {
        id: 'g4',
        title: 'টাক্সিডো কাট ডাবল ব্রেস্টেড ব্লেজার',
        category: 'BLAZER',
        imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80',
        makingCharge: 2200,
        tags: ['ওয়েডিং', 'ক্যানভাস ফিটিং', 'পিক ল্যাপেল'],
        likesCount: 42,
        isFavorited: false,
        tailor: {
          shopName: 'রয়েল টেইলার্স',
          phone: '01811223344',
          address: 'ধানমন্ডি, ঢাকা',
        },
      },
    ]);
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  };

  const handleToggleFavorite = async (item: GalleryItem) => {
    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              isFavorited: !i.isFavorited,
              likesCount: (i.likesCount || 0) + (i.isFavorited ? -1 : 1),
            }
          : i
      )
    );

    try {
      await api.post(`/gallery/${item.id}/favorite`);
    } catch {
      // Revert if API fails
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                isFavorited: item.isFavorited,
                likesCount: item.likesCount,
              }
            : i
        )
      );
    }
  };

  const handleOrderInquiry = (item: GalleryItem) => {
    const text = `আসসালামু আলাইকুম, আমি সেলাই সাথী অ্যাপে আপনাদের "${item.title}" ডিজাইনটি দেখেছি। এই মডেলে সেলাইয়ের বিষয়ে কথা বলতে চাই।`;
    const phone = item.tailor?.phone?.replace('+', '') || '01700000000';
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${encodeURIComponent(text)}`);
  };

  const filteredItems =
    selectedCategory === 'ALL'
      ? items
      : items.filter((i) => i.category === selectedCategory);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>ডিজাইন গ্যালারি (Design Catalog)</Text>
        <Text style={styles.subtitle}>টেইলারদের তৈরি সেরা কাজ ও লেটেস্ট ট্রেন্ড</Text>
      </View>

      {/* Category Pills */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat.id && styles.categoryChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
              <TouchableOpacity
                style={styles.favBadge}
                onPress={() => handleToggleFavorite(item)}
                activeOpacity={0.8}
              >
                <Text style={styles.favIcon}>{item.isFavorited ? '❤️' : '🤍'}</Text>
                <Text style={styles.favCount}>{item.likesCount || 0}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.shopMeta}>
                🏪 {item.tailor?.shopName} • {item.tailor?.address}
              </Text>

              {/* Tags */}
              <View style={styles.tagRow}>
                {item.tags?.map((tag, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.footerRow}>
                <View>
                  <Text style={styles.chargeLabel}>আনুমানিক মজুরি:</Text>
                  <Text style={styles.chargeVal}>৳ {item.makingCharge || 'আলোচনা সাপেক্ষে'}</Text>
                </View>

                <TouchableOpacity
                  style={styles.orderBtn}
                  onPress={() => handleOrderInquiry(item)}
                >
                  <Text style={styles.orderBtnText}>এই স্টাইলে বানাবো ✂️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 8,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  categoryContainer: {
    marginBottom: 8,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 6,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    height: 190,
    position: 'relative',
    backgroundColor: colors.surfaceAlt,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  favIcon: {
    fontSize: 14,
  },
  favCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardContent: {
    padding: 16,
  },
  itemTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 4,
  },
  shopMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 10,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  tag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  chargeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chargeVal: {
    ...typography.bodyLarge,
    fontWeight: '800',
    color: colors.primary,
  },
  orderBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  orderBtnText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
