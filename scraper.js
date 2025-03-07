// スクレイピング機能を提供するモジュール
(function() {
    'use strict';
    
    // グローバル名前空間を作成
    window.BlogGen = window.BlogGen || {};
    window.BlogGen.Scraper = window.BlogGen.Scraper || {};
    
    // メタディスクリプション取得
    window.BlogGen.Scraper.getMetaDescription = function() {
        const metaDesc = document.querySelector('meta[name=\"description\"]');
        return metaDesc ? metaDesc.getAttribute('content') : '';
    };
    
    // メインコンテンツ取得
    window.BlogGen.Scraper.getMainContent = function() {
        const mainContent = document.querySelector('article') ||
                          document.querySelector('.content') ||
                          document.querySelector('main') ||
                          document.body;
        return mainContent ? mainContent.textContent.trim().substring(0, 3000) : '';
    };
    
    // 画像URL取得
    window.BlogGen.Scraper.getImages = function() {
        const images = Array.from(document.querySelectorAll('img[src*=\".jpg\"], img[src*=\".png\"], img[src*=\".jpeg\"], img[src*=\".webp\"]'))
            .filter(img => {
                const w = img.naturalWidth || img.width || parseInt(img.getAttribute('width') || 0);
                const h = img.naturalHeight || img.height || parseInt(img.getAttribute('height') || 0);
                return w > 100 && h > 100; // 小さすぎる画像は除外
            })
            .map(img => img.src)
            .filter(src => src && src.startsWith('http')) // 有効なURLのみ
            .slice(0, 10); // 最大10枚まで
        
        console.log('取得した画像:', images.length); // デバッグ用
        return images;
    };
    
    // ページデータ取得（メイン関数）
    window.BlogGen.Scraper.getPageData = function() {
        return {
            title: document.title,
            url: window.location.href,
            metaDescription: window.BlogGen.Scraper.getMetaDescription(),
            content: window.BlogGen.Scraper.getMainContent(),
            images: window.BlogGen.Scraper.getImages()
        };
    };
    
    console.log('スクレイピングモジュールが読み込まれました');
})();
