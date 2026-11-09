import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { colors } from '../../../src/theme/colors.js';
import { typography } from '../../../src/theme/typography.js';
import { Card } from '../../../src/components/ui/Card.js';
import { Button } from '../../../src/components/ui/Button.js';
import { Input } from '../../../src/components/ui/Input.js';
import api from '../../../src/services/api.js';

export default function GalleryScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [modalVisible, setModalVisible] = useState(false);

  // New photo form
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('পাঞ্জাবি');
  const [caption, setCaption] = useState('');
  const [saving, setSaving] = useState(false);

  const CATEGORIES = [
    { key: 'ALL', label: 'সকল' },
    { key: 'পাঞ্জাবি', label: 'পাঞ্জাবি' },
    { key: 'শেরওয়ানি', label: 'শেরওয়ানি' },
    { key: 'থ্রি-পিস', label: 'থ্রি-পিস' },
    { key: 'ব্লেজার', label: 'ব্লেজার' },
  ];

  const fetchGallery = async () => {
    try {
      let url = '/gallery';
      if (selectedCategory !== 'ALL') url += `?category=${encodeURIComponent(selectedCategory)}`;
      const res = await api.get(url);
      if (res.data?.success) {
        setItems(res.data.data || []);
      }
    } catch {
      // Mock fallback
      setItems([
        {
          id: 'g1',
          category: 'পাঞ্জাবি',
          caption: 'হাতে করা সুতার কারুকাজ করা সেমি-ফিট পাঞ্জাবি',
          imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600',
        },
        {
          id: 'g2',
          category: 'ব্লেজার',
          caption: 'ইতালীয় কাটিং ফর্মাল স্যুট ব্লেজার',
          imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600',
        },
      ]);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [selectedCategory]);

  const handleAddPhoto = async () => {
    if (!imageUrl.trim()) {
      Alert.alert('ত্রুটি', 'ছবির সঠিক ইউআরএল লিংক দিন');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/gallery', {
        imageUrl: imageUrl.trim(),
        category,
        caption: caption.trim() || undefined,
      });

      if (res.data?.success) {
        Alert.alert('সফল', 'পোর্টফোলিওতে নতুন ছবি যুক্ত হয়েছে!');
        setModalVisible(false);
        setImageUrl('');
        setCaption('');
        fetchGallery();
      }
    } catch (err: any) {
      Alert.alert('ত্রুটি', err.message || 'ছবি যোগ করা যায়নি');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>ডিজাইন গ্যালারি (Portfolio)</Text>
          <Text style={styles.subtitle}>দোকানের সেরা কাজের ছবি ও ক্যাটালগ</Text>
        </View>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.addBtn}
        >
          <Text style={styles.addBtnText}>+ নতুন ছবি</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter Pills */}
      <View style={styles.filterBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item.key)}
              style={[
                styles.filterPill,
                selectedCategory === item.key ? styles.filterPillActive : {},
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  selectedCategory === item.key ? styles.filterPillTextActive : {},
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Photo Grid */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <Card style={styles.itemCard}>
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemCategory}>{item.category}</Text>
                {item.caption ? (
                  <Text style={styles.itemCaption} numberOfLines={2}>
                    {item.caption}
                  </Text>
                ) : null}
              </View>
            </Card>
          </View>
        )}
      />

      {/* Add Photo Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>পোর্টফোলিওতে ছবি যুক্ত করুন</Text>

            <Input
              label="ছবির অনলাইন লিংক (Image URL) *"
              placeholder="https://example.com/photo.jpg"
              value={imageUrl}
              onChangeText={setImageUrl}
            />

            <Text style={styles.label}>পোশাকের ক্যাটাগরি:</Text>
            <View style={styles.categoryChips}>
              {['পাঞ্জাবি', 'শেরওয়ানি', 'থ্রি-পিস', 'ব্লেজার'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.catChip,
                    category === cat ? styles.catChipActive : {},
                  ]}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      category === cat ? styles.catChipTextActive : {},
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="ক্যাপশন বা ডিজাইনের বিবরণ (ঐচ্ছিক)"
              placeholder="যেমন: হাতের কারুকাজ করা বিশেষ ঈদ কালেকশন"
              value={caption}
              onChangeText={setCaption}
            />

            <View style={styles.modalBtns}>
              <Button
                title="বাতিল"
                variant="outline"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="সংরক্ষণ করুন"
                onPress={handleAddPhoto}
                loading={saving}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 8,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: '#fff',
  },
  filterBar: {
    marginBottom: 8,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterPillTextActive: {
    color: '#fff',
  },
  grid: {
    padding: 10,
    paddingBottom: 40,
  },
  gridItem: {
    width: '50%',
    padding: 6,
  },
  itemCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 0,
  },
  itemImage: {
    width: '100%',
    height: 160,
    backgroundColor: colors.surfaceAlt,
  },
  itemInfo: {
    padding: 10,
  },
  itemCategory: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  itemCaption: {
    ...typography.caption,
    color: colors.text,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 16,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catChipText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  catChipTextActive: {
    color: '#fff',
  },
  modalBtns: {
    flexDirection: 'row',
    marginTop: 10,
  },
});
