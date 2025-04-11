import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import CountrySelector from '../components/trends/CountrySelector';
import TrendsList from '../components/trends/TrendsList';
import NavBar from '../components/follower-analysis/NavBar';
import Footer from '../components/follower-analysis/Footer';
import { getTrendingHashtags, getConnectionStatus, initializeJetstreamClient, COUNTRIES } from '../services/trendingAPI';
import type { Trend, Country } from '../services/trendingAPI';
import type { Route } from "./+types/trends";
import StatusIndicator from '../components/trends/StatusIndicator';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Bluesky Trend Etiketler | BlueAnalyze" },
    { name: "description", content: "Bluesky'daki güncel trend etiketleri ve popüler hashtag'leri keşfedin. Gerçek zamanlı güncellemeleri takip edin ve sosyal medya hareketliliğini analiz edin." },
    { name: "keywords", content: "bluesky, bluesky trends, trend analizi, hashtag, popüler etiketler, sosyal medya istatistikleri" },
    // Open Graph / Facebook
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://blue-analyze.com/trends" },
    { property: "og:title", content: "Bluesky Trend Etiketler | BlueAnalyze" },
    { property: "og:description", content: "Bluesky'daki güncel trend etiketleri ve popüler hashtag'leri keşfedin. Gerçek zamanlı güncellemeleri takip edin." },
    { property: "og:image", content: "https://blue-analyze.com/blueanalyze.png" },
    // Twitter
    { property: "twitter:card", content: "summary_large_image" },
    { property: "twitter:url", content: "https://blue-analyze.com/trends" },
    { property: "twitter:title", content: "Bluesky Trend Etiketler | BlueAnalyze" },
    { property: "twitter:description", content: "Bluesky'daki güncel trend etiketleri ve popüler hashtag'leri keşfedin. Gerçek zamanlı güncellemeleri takip edin." },
    { property: "twitter:image", content: "https://blue-analyze.com/blueanalyze.png" },
    // Canonical URL
    { tagName: "link", rel: "canonical", href: "https://blue-analyze.com/trends" },
  ];
}

export default function TrendsPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>('global');
  const [trends, setTrends] = useState<Trend[]>([]);
  const [status, setStatus] = useState<string>('connecting');
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // WebSocket bağlantı durumunu kontrol et
  const checkConnectionStatus = useCallback(() => {
    const newStatus = getConnectionStatus();
    if (newStatus !== status) {
      setStatus(newStatus);
    }
  }, [status]);

  // Trendleri getir
  const fetchTrends = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTrendingHashtags(selectedCountry);
      
      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }
      
      setTrends(data);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Trend verileri alınırken hata:', error);
      setLoading(false);
    }
  }, [selectedCountry]);

  // Ülke değiştiğinde trendleri getir
  useEffect(() => {
    fetchTrends();
  }, [selectedCountry, fetchTrends]);

  // Sayfa yüklendiğinde WebSocket istemcisini başlat
  useEffect(() => {
    // WebSocket bağlantısını başlat
    initializeJetstreamClient();
    
    // Düzenli olarak bağlantı durumunu kontrol et
    const statusInterval = setInterval(checkConnectionStatus, 3000);
    
    // Temizlik fonksiyonu
    return () => {
      clearInterval(statusInterval);
    };
  }, [checkConnectionStatus]);

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
  };

  // Manuel yenileme için fonksiyon
  const handleRefresh = () => {
    fetchTrends();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      
      <main className="py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4"
        >
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Trend Etiketler
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Bluesky'daki güncel trend etiketleri keşfedin
              </p>
              
              <div className="flex items-center gap-2 mb-2 mt-2">
                <StatusIndicator status={status} />
                {lastUpdate && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Son güncelleme: {lastUpdate.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
            
            <button 
              onClick={handleRefresh} 
              disabled={loading}
              className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Yenileniyor...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Yenile
                </>
              )}
            </button>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Veriler Bluesky Firehose API'si üzerinden toplanmaktadır.
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <CountrySelector 
              countries={COUNTRIES}
              selectedCountry={selectedCountry}
              onChange={handleCountryChange}
            />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              {COUNTRIES.find(c => c.code === selectedCountry)?.flag || '🌎'} {COUNTRIES.find(c => c.code === selectedCountry)?.name || 'Global'} Trendleri
            </h2>
            
            <TrendsList 
              trends={trends}
              isLoading={loading}
            />
          </div>
        </motion.div>
      </main>
      
      <Footer />
      
      {/* Schema.org JSON-LD veri işaretlemesi */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Bluesky Trend Etiketler | BlueAnalyze",
          "description": "Bluesky'daki güncel trend etiketleri ve popüler hashtag'leri keşfedin.",
          "url": "https://blue-analyze.com/trends",
          "publisher": {
            "@type": "Organization",
            "name": "BlueAnalyze",
            "logo": {
              "@type": "ImageObject",
              "url": "https://blue-analyze.com/blueanalyze.png"
            }
          },
          "mainEntity": {
            "@type": "ItemList",
            "itemListElement": trends.slice(0, 10).map((trend, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Thing",
                "name": trend.tag,
                "url": `https://bsky.app/search?q=${encodeURIComponent(trend.tag)}`
              }
            }))
          }
        })
      }} />
    </div>
  );
} 