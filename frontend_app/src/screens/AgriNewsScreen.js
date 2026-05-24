import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Share,
  Animated,
  Image,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Share2, ExternalLink, Clock, Tag } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import ScreenHero from '../components/ScreenHero';

// Multiple live agriculture RSS sources — fetched fresh on every refresh.
const RSS_SOURCES = [
  { name: 'AgFunder News', url: 'https://agfundernews.com/feed/' },
  { name: 'The Hindu Agri', url: 'https://www.thehindu.com/business/agri-business/feeder/default.rss' },
  { name: 'Business Line', url: 'https://www.thehindubusinessline.com/news/agri-business/feeder/default.rss' },
  { name: 'Deccan Herald', url: 'https://www.deccanherald.com/rss/agriculture.rss' },
];

const RSS2JSON = 'https://api.rss2json.com/v1/api.json';

const fetchRssFeed = async (feedUrl, sourceName) => {
  const bust = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const feedWithBust = feedUrl.includes('?') ? `${feedUrl}&_=${bust}` : `${feedUrl}?_=${bust}`;
  const requestUrl = `${RSS2JSON}?rss_url=${encodeURIComponent(feedWithBust)}&count=12&_=${bust}`;

  const response = await fetch(requestUrl, {
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
  });
  if (!response.ok) throw new Error(`Feed failed: ${sourceName}`);

  const data = await response.json();
  if (data.status !== 'ok' || !data.items?.length) {
    throw new Error(`No items: ${sourceName}`);
  }

  return data.items.map((item) => ({ ...item, _sourceName: sourceName }));
};

const MOCK_NEWS = [
  {
    id: 'm1',
    title: 'AI-Driven Pest Detection Cuts Crop Loss by 35% in New Pilot',
    summary:
      'A nationwide pilot in Maharashtra used drone-mounted AI cameras to identify pest infestations early, reducing crop losses by 35% and saving farmers an average of Rs 12,000 per hectare this season.',
    category: 'Technology',
    source: 'AgriTech Today',
    time: '2 hrs ago',
    color: ['#065f46', '#10b981'],
    emoji: '🤖',
    image: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?w=800',
  },
  {
    id: 'm2',
    title: 'Government Doubles PM-Kisan Instalment to Rs 12,000 in 2026 Budget',
    summary:
      'The Union Budget 2026 raised the PM-Kisan annual benefit from Rs 6,000 to Rs 12,000 per eligible farmer family, directly benefiting over 110 million small and marginal farmers across India.',
    category: 'Policy',
    source: 'Farm Policy Wire',
    time: '4 hrs ago',
    color: ['#1e3a8a', '#3b82f6'],
    emoji: '🏛️',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
  },
  {
    id: 'm3',
    title: 'Late Blight Alert: Punjab Potato Belt Faces High-Risk Season',
    summary:
      'Meteorological models show above-normal humidity in Punjab through June, creating ideal conditions for Late Blight. Farmers are advised to pre-emptively apply Chlorothalonil and monitor crops weekly.',
    category: 'Disease Alert',
    source: 'CropGuard Insights',
    time: '6 hrs ago',
    color: ['#7c2d12', '#ea580c'],
    emoji: '⚠️',
    image: 'https://images.unsplash.com/photo-1599933333668-b348981ba31e?w=800',
  },
  {
    id: 'm4',
    title: 'Nano-Urea Adoption Surges: 40% Reduction in Input Costs Reported',
    summary:
      'IFFCO Nano-Urea liquid is now used on 8 million hectares. Farmers report a 40% drop in fertilizer costs with no yield loss, with trials across wheat, rice, and sugarcane showing promising results.',
    category: 'Innovation',
    source: 'Krishi Jagran',
    time: '8 hrs ago',
    color: ['#4c1d95', '#7c3aed'],
    emoji: '🧪',
    image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800',
  },
  {
    id: 'm5',
    title: 'Tomato Prices Crash to Rs 5/kg: Farmers Demand MSP Protection',
    summary:
      'Tomato prices in Andhra Pradesh have collapsed to Rs 5/kg amid surplus production, pushing farmer groups to demand a Minimum Support Price for vegetables to protect livelihoods during glut seasons.',
    category: 'Market',
    source: 'The Hindu Business Line',
    time: '10 hrs ago',
    color: ['#831843', '#ec4899'],
    emoji: '📉',
    image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800',
  },
  {
    id: 'm6',
    title: 'India Records Best Rabi Wheat Harvest in a Decade at 115 MT',
    summary:
      'India rabi wheat output for 2025-26 hit a record 115 million tonnes, boosted by improved seed varieties and timely rainfall. The surplus is expected to stabilize flour prices and boost exports.',
    category: 'Production',
    source: 'Ministry of Agriculture',
    time: '1 day ago',
    color: ['#78350f', '#f59e0b'],
    emoji: '🌾',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800',
  },
  {
    id: 'm7',
    title: 'Vertical Farming Startup Raises Rs 250 Cr to Scale Leafy Greens Production',
    summary:
      'Bengaluru-based startup FreshRoot has secured Rs 250 crore in Series B funding to expand its climate-controlled vertical farms, targeting 10 cities to supply pesticide-free leafy greens year-round.',
    category: 'Startup',
    source: 'Economic Times Agri',
    time: '1 day ago',
    color: ['#064e3b', '#059669'],
    emoji: '🏗️',
    image: 'https://images.unsplash.com/photo-1507206130007-8e718b204a80?w=800',
  },
  {
    id: 'm8',
    title: 'Climate Study: Monsoon Onset Will Advance by 5 Days by 2030',
    summary:
      'A joint ICAR-IMD study projects India southwest monsoon onset will shift 5 days earlier by 2030 due to climate change, requiring farmers to adjust sowing calendars for optimal yields.',
    category: 'Climate',
    source: 'ICAR Research Bulletin',
    time: '2 days ago',
    color: ['#0c4a6e', '#0ea5e9'],
    emoji: '🌧️',
    image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800',
  },
  {
    id: 'm9',
    title: 'Drip Irrigation Subsidy Lifted to 90% for Small Farmers',
    summary:
      'The Ministry of Water Resources announced an increase in micro-irrigation subsidies to 90% for smallholder farmers, aiming to conserve groundwater while boosting crop water-use efficiency.',
    category: 'Water Management',
    source: 'Jal Shakti News',
    time: '2 days ago',
    color: ['#0c4a6e', '#0ea5e9'],
    emoji: '💧',
    image: 'https://images.unsplash.com/photo-1563514223300-6d42d326f959?w=800',
  },
  {
    id: 'm10',
    title: 'Organic Fertilizer Market Set to Double as Soil Health Awareness Rises',
    summary:
      'Driven by consumer demand for chemical-free food, the Indian organic fertilizer market is projected to reach $2.5 billion by 2028, with vermicompost and bio-fertilizers leading the growth.',
    category: 'Bio-Farming',
    source: 'Organic Farming Review',
    time: '3 days ago',
    color: ['#065f46', '#10b981'],
    emoji: '🍃',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800',
  },
  {
    id: 'm11',
    title: 'Indian Millet Exports Surge by 45% to Middle East and Europe',
    summary:
      'Leveraging the global superfood trend, exports of Bajra, Ragi, and Jowar rose by 45% in the last fiscal year, bringing higher profits to dryland farmers in Rajasthan and Karnataka.',
    category: 'Exports',
    source: 'Global Trade Agri',
    time: '3 days ago',
    color: ['#78350f', '#f59e0b'],
    emoji: '🌾',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800',
  },
  {
    id: 'm12',
    title: 'New Cold Storage Corridor to Reduce Post-Harvest Losses by 50%',
    summary:
      'A public-private cold chain corridor covering major fruit-growing regions in Himachal and Maharashtra will open next month, reducing post-harvest transport spoilage by half.',
    category: 'Logistics',
    source: 'Agri Supply Chain',
    time: '4 days ago',
    color: ['#1e3a8a', '#3b82f6'],
    emoji: '❄️',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
  },
  {
    id: 'm13',
    title: 'Over 5 Lakh Solar Pumps Installed Under PM-KUSUM Scheme',
    summary:
      'The solar pump distribution program hit a major milestone, allowing farmers to run tube-wells during the day without relying on erratic grid power, while reducing overall diesel expenses.',
    category: 'Energy',
    source: 'Solar Grid India',
    time: '4 days ago',
    color: ['#7c2d12', '#ea580c'],
    emoji: '☀️',
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800',
  },
  {
    id: 'm14',
    title: 'Handheld Soil Scanner Provides Reports in 60 Seconds',
    summary:
      'A newly patented handheld NIR spectrometer allows farmers to scan nitrogen, phosphorus, and potassium levels instantly in the field, eliminating the 2-week lab wait times.',
    category: 'Technology',
    source: 'Science For Farm',
    time: '5 days ago',
    color: ['#4c1d95', '#7c3aed'],
    emoji: '🧪',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800',
  },
  {
    id: 'm15',
    title: 'Restrictions Lifted on Non-Basmati Rice Exports After Stock Surplus',
    summary:
      'With state warehouses overflowing, the government has eased export levies on non-basmati white rice, offering relief to rice millers and farmers looking for higher international prices.',
    category: 'Market',
    source: 'Grain Trade Today',
    time: '5 days ago',
    color: ['#831843', '#ec4899'],
    emoji: '✈️',
    image: 'https://images.unsplash.com/photo-1536304997881-a372c179924b?w=800',
  },
  {
    id: 'm16',
    title: 'DGCA Approves Simplified License for Agri-Drone Operators',
    summary:
      'To accelerate drone adoption for pesticide and fertilizer spraying, the aviation authority has streamlined license processes, reducing certification costs and training duration by 60%.',
    category: 'Policy',
    source: 'AeroNews India',
    time: '6 days ago',
    color: ['#064e3b', '#059669'],
    emoji: '🚁',
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800',
  },
  {
    id: 'm17',
    title: 'Indian Vanilla Prices Skyrocket 30% Amid Global Supply Shortage',
    summary:
      'Vanilla farmers in Kerala and Karnataka are seeing record returns as Madagascar supply drops, prompting many to invest in shade-net cultivation for this high-value crop.',
    category: 'Production',
    source: 'Spice Board Bulletin',
    time: '6 days ago',
    color: ['#065f46', '#10b981'],
    emoji: '🌱',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
  },
  {
    id: 'm18',
    title: 'Insurance Firms Use Satellite Imagery for Instant Crop Claims',
    summary:
      'Satellite-driven damage detection enables payout processing within 48 hours of weather events, eliminating the tedious physical surveys that historically delayed insurance payouts for months.',
    category: 'Disease Alert',
    source: 'Agri Insure Today',
    time: '1 week ago',
    color: ['#7c2d12', '#ea580c'],
    emoji: '📊',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
  },
];

// Truncate text to at most 60 words
const truncate60 = (text) => {
  if (!text) return '';
  const words = text.split(/\s+/);
  if (words.length <= 60) return text;
  return words.slice(0, 60).join(' ') + '...';
};

// ─── Single News Card ─────────────────────────────────────────────────────────
const NewsCard = ({ item, cardHeight, cardWidth, onLike, onShare }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const heartScale = React.useRef(new Animated.Value(1)).current;

  const handleLike = () => {
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, useNativeDriver: true, speed: 50 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();
    onLike(item.id);
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.99, useNativeDriver: true, speed: 50 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
  };

  const imageHeight = Math.floor(cardHeight * 0.42);
  const contentHeight = cardHeight - imageHeight;

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          height: cardHeight,
          width: cardWidth,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ flex: 1 }}
      >
        {/* Top Visual Section */}
        <View style={[styles.visualSection, { height: imageHeight }]}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={item.color}
              style={styles.cardImage}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.placeholderEmoji}>{item.emoji || '🌾'}</Text>
            </LinearGradient>
          )}

          {/* Shadow Overlay for smooth transition to content */}
          <LinearGradient
            colors={['rgba(15, 23, 42, 0.1)', 'rgba(15, 23, 42, 0.95)']}
            style={styles.imageOverlay}
          />

          {/* Floating Badges */}
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
          </View>
        </View>

        {/* Bottom Content Section */}
        <View style={[styles.contentSection, { height: contentHeight }]}>
          <View style={{ flex: 1 }}>
            <View style={styles.metaRow}>
              <Text style={styles.sourceText}>{item.source}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>

            <Text style={styles.newsTitle} numberOfLines={3}>
              {item.title}
            </Text>

            <Text style={styles.newsSummary} numberOfLines={6}>
              {truncate60(item.summary)}
            </Text>
          </View>

          {/* InShot Action Bar */}
          <View style={styles.actionBar}>
            <View style={styles.actionDivider} />

            <View style={styles.actionRow}>
              {/* Like */}
              <TouchableOpacity
                style={[styles.actionBtn, item.liked && styles.actionBtnLiked]}
                onPress={handleLike}
                activeOpacity={0.8}
              >
                <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                  <Heart
                    size={18}
                    color={item.liked ? '#ef4444' : '#94a3b8'}
                    fill={item.liked ? '#ef4444' : 'none'}
                  />
                </Animated.View>
                <Text style={[styles.actionBtnText, item.liked && styles.actionBtnTextLiked]}>
                  {item.likes} Likes
                </Text>
              </TouchableOpacity>

              {/* Share */}
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => onShare(item)}
                activeOpacity={0.8}
              >
                <Share2 size={18} color="#3b82f6" />
                <Text style={[styles.actionBtnText, { color: '#60a5fa' }]}>Share</Text>
              </TouchableOpacity>

              {/* Full Story Link */}
              {item.link ? (
                <TouchableOpacity
                  style={styles.fullStoryBtn}
                  onPress={() => {
                    Linking.openURL(item.link).catch((err) =>
                      console.error('Failed to open link', err)
                    );
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.fullStoryText}>Full Story</Text>
                  <ExternalLink size={13} color="#10b981" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const AgriNewsScreen = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = (event) => {
    const { height, width } = event.nativeEvent.layout;
    if (height > 0 && height !== containerHeight) {
      setContainerHeight(height);
    }
    if (width > 0 && width !== containerWidth) {
      setContainerWidth(width);
    }
  };

  const seedMockData = useCallback(() => {
    // Rotate mock articles by time window when all live feeds are unavailable
    const start = Math.floor(Date.now() / 45000) % MOCK_NEWS.length;
    const rotated = [...MOCK_NEWS.slice(start), ...MOCK_NEWS.slice(0, start)];
    setNews(
      rotated.map((n, i) => ({
        ...n,
        id: `${n.id}-r${start}-${i}`,
        likes: Math.floor(Math.random() * 200) + 10,
        liked: false,
      }))
    );
  }, []);

  const buildFromFeed = (items) => {
    return items.map((item, idx) => {
      let image = null;
      if (item.thumbnail) {
        image = item.thumbnail;
      } else if (
        item.enclosure &&
        item.enclosure.link &&
        item.enclosure.type &&
        item.enclosure.type.startsWith('image/')
      ) {
        image = item.enclosure.link;
      }

      if (!image && item.content) {
        const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) {
          image = imgMatch[1];
        }
      }
      if (!image && item.description) {
        const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) {
          image = imgMatch[1];
        }
      }

      const titleLower = (item.title || '').toLowerCase();
      const contentLower = (item.description || item.content || '').toLowerCase();
      const combinedText = `${titleLower} ${contentLower}`;

      let category = 'Live Update';
      let color = [Colors.primaryDark, Colors.primary];
      let emoji = '🌱';

      if (
        combinedText.includes('pest') ||
        combinedText.includes('disease') ||
        combinedText.includes('blight') ||
        combinedText.includes('insect') ||
        combinedText.includes('fungus') ||
        combinedText.includes('infestation')
      ) {
        category = 'Disease Alert';
        color = ['#7c2d12', '#ea580c'];
        emoji = '⚠️';
        if (!image) {
          image = 'https://images.unsplash.com/photo-1599933333668-b348981ba31e?w=800';
        }
      } else if (
        combinedText.includes('ai') ||
        combinedText.includes('drone') ||
        combinedText.includes('tech') ||
        combinedText.includes('sensor') ||
        combinedText.includes('robot') ||
        combinedText.includes('precision') ||
        combinedText.includes('digital')
      ) {
        category = 'Technology';
        color = ['#065f46', '#10b981'];
        emoji = '🤖';
        if (!image) {
          image = 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?w=800';
        }
      } else if (
        combinedText.includes('market') ||
        combinedText.includes('price') ||
        combinedText.includes('fund') ||
        combinedText.includes('raise') ||
        combinedText.includes('startup') ||
        combinedText.includes('invest') ||
        combinedText.includes('deal') ||
        combinedText.includes('trade') ||
        combinedText.includes('finance') ||
        combinedText.includes('budget')
      ) {
        category = 'Market';
        color = ['#831843', '#ec4899'];
        emoji = '📉';
        if (!image) {
          image = 'https://images.unsplash.com/photo-1507206130007-8e718b204a80?w=800';
        }
      } else if (
        combinedText.includes('water') ||
        combinedText.includes('irrigation') ||
        combinedText.includes('drip') ||
        combinedText.includes('rain') ||
        combinedText.includes('monsoon')
      ) {
        category = 'Water Management';
        color = ['#0c4a6e', '#0ea5e9'];
        emoji = '💧';
        if (!image) {
          image = 'https://images.unsplash.com/photo-1563514223300-6d42d326f959?w=800';
        }
      } else if (
        combinedText.includes('climate') ||
        combinedText.includes('weather') ||
        combinedText.includes('carbon') ||
        combinedText.includes('warm') ||
        combinedText.includes('emission')
      ) {
        category = 'Climate';
        color = ['#0f172a', '#38bdf8'];
        emoji = '🌧️';
        if (!image) {
          image = 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800';
        }
      } else if (
        combinedText.includes('fertilizer') ||
        combinedText.includes('organic') ||
        combinedText.includes('soil') ||
        combinedText.includes('urea')
      ) {
        category = 'Bio-Farming';
        color = ['#065f46', '#10b981'];
        emoji = '🍃';
        if (!image) {
          image = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800';
        }
      } else if (
        combinedText.includes('harvest') ||
        combinedText.includes('yield') ||
        combinedText.includes('crop') ||
        combinedText.includes('production') ||
        combinedText.includes('wheat') ||
        combinedText.includes('rice') ||
        combinedText.includes('grain')
      ) {
        category = 'Production';
        color = ['#78350f', '#f59e0b'];
        emoji = '🌾';
        if (!image) {
          image = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800';
        }
      } else {
        if (!image) {
          const landscapes = [
            'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
            'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800',
            'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800',
          ];
          image = landscapes[idx % landscapes.length];
        }
      }

      const stableId = item.guid || item.link || `${item.title}-${idx}`;

      return {
        id: String(stableId).replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 120),
        title: item.title || 'Agriculture Update',
        summary: item.description
          ? item.description.replace(/<[^>]+>/g, '').trim()
          : item.content
          ? item.content.replace(/<[^>]+>/g, '').trim()
          : '',
        category,
        source: item._sourceName || item.author || 'Agri News',
        time: item.pubDate
          ? new Date(item.pubDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            })
          : 'Recent',
        color,
        emoji,
        likes: Math.floor(Math.random() * 120) + 5,
        liked: false,
        image,
        link: item.link,
      };
    });
  };

  const fetchNews = useCallback(async () => {
    try {
      const results = await Promise.allSettled(
        RSS_SOURCES.map((src) => fetchRssFeed(src.url, src.name))
      );

      const merged = [];
      const seen = new Set();

      results.forEach((result) => {
        if (result.status !== 'fulfilled') return;
        result.value.forEach((item) => {
          const key = (item.link || item.guid || item.title || '').trim().toLowerCase();
          if (!key || seen.has(key)) return;
          seen.add(key);
          merged.push(item);
        });
      });

      merged.sort((a, b) => {
        const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return db - da;
      });

      if (merged.length > 0) {
        setNews(buildFromFeed(merged.slice(0, 24)));
      } else {
        seedMockData();
      }
    } catch (_) {
      seedMockData();
    } finally {
      const now = new Date();
      setLastUpdated(
        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      );
      setLoading(false);
      setRefreshing(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [seedMockData]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleRefresh = () => {
    setRefreshing(true);
    fadeAnim.setValue(0);
    fetchNews();
  };

  const handleLike = (id) => {
    setNews((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, liked: !n.liked, likes: n.liked ? n.likes - 1 : n.likes + 1 }
          : n
      )
    );
  };

  const handleShare = async (item) => {
    try {
      await Share.share({
        message:
          '🌾 ' +
          item.title +
          '\n\n' +
          truncate60(item.summary) +
          '\n\nSource: ' +
          item.source +
          '\n\nShared via CropGuard Pro',
        title: item.title,
      });
    } catch (e) {
      console.log('Share error', e);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#065f46', '#10b981']} style={styles.loadingGrad}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Fetching latest agri news...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHero authOnly gradient="green" />

      {/* Feed Container */}
      <Animated.View
        style={{ flex: 1, opacity: fadeAnim }}
        onLayout={handleLayout}
      >
        {containerHeight > 0 ? (
          <FlatList
            data={news}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <NewsCard
                item={item}
                cardHeight={containerHeight}
                cardWidth={containerWidth}
                onLike={handleLike}
                onShare={handleShare}
              />
            )}
            contentContainerStyle={styles.listContent}
            pagingEnabled={true}
            snapToInterval={containerHeight}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum={true}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.primary}
                colors={[Colors.primary]}
              />
            }
          />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}
      </Animated.View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGrad: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16,
  },

  // List
  listContent: {
    margin: 0,
    padding: 0,
  },

  // Card
  cardContainer: {
    backgroundColor: '#0f172a',
    overflow: 'hidden',
  },

  // Visual Section (Top 42%)
  visualSection: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#1e293b',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  placeholderEmoji: {
    fontSize: 64,
    color: 'white',
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  badgeRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  categoryBadgeText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Content Section (Bottom 58%)
  contentSection: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sourceText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '700',
  },
  metaDot: {
    fontSize: 12,
    color: '#475569',
  },
  timeText: {
    fontSize: 12,
    color: '#64748b',
  },
  newsTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 25,
    marginBottom: 10,
  },
  newsSummary: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 22,
    marginBottom: 12,
  },

  // Action Bar
  actionBar: {
    marginTop: 'auto',
  },
  actionDivider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionBtnLiked: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  actionBtnTextLiked: {
    color: '#ef4444',
  },
  actionVertDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#1e293b',
  },
  fullStoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  fullStoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
  },
});

export default AgriNewsScreen;
