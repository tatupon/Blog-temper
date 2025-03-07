// スクレイピング機能を提供するモジュール
(function() {
    'use strict';
    
    // グローバル名前空間を作成
    window.BlogGen = window.BlogGen || {};
    window.BlogGen.Scraper = window.BlogGen.Scraper || {};
    
    // 選択された要素から画像を抽出する関数
    window.BlogGen.Scraper.extractImagesFromElement = function(element) {
        return Array.from(element.querySelectorAll('img'))
            .filter(img => {
                const w = img.naturalWidth || img.width || parseInt(img.getAttribute('width') || 0);
                const h = img.naturalHeight || img.height || parseInt(img.getAttribute('height') || 0);
                return w > 100 && h > 100; // 小さすぎる画像は除外
            })
            .map(img => {
                // Amazonの場合、高解像度画像URLに変換を試みる
                let src = img.src;
                if (window.location.hostname.includes('amazon')) {
                    // Amazon画像URLの変換（サムネイルから高解像度へ）
                    src = src.replace(/\._[^\.]+_\./, '.'); // ._SX300_. などのサイズ指定を削除
                    src = src.replace(/\._[^\.]+_\?/, '?');  // クエリパラメータ付きの場合
                }
                return src;
            })
            .filter(src => src && src.startsWith('http')); // 有効なURLのみ
    };
    
    // 構造選択モードを有効化する関数
    window.BlogGen.Scraper.enableStructureSelectionMode = function(callback) {
        console.log('構造選択モードを有効化');
        
        // 元のページの背景色と不透明度を保存
        const originalBodyBg = document.body.style.backgroundColor;
        const originalBodyOpacity = document.body.style.opacity;
        
        // ページの視認性を確保
        document.body.style.backgroundColor = 'white';
        document.body.style.opacity = '1';
        
        // オーバーレイの作成（完全に透明に）
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0)'; // 完全に透明
        overlay.style.zIndex = '9998';
        overlay.style.pointerEvents = 'none'; // クリックイベントを下の要素に通過させる
        document.body.appendChild(overlay);
        
        // 説明パネル（より目立つように）
        const infoPanel = document.createElement('div');
        infoPanel.style.position = 'fixed';
        infoPanel.style.top = '10px';
        infoPanel.style.left = '50%';
        infoPanel.style.transform = 'translateX(-50%)';
        infoPanel.style.backgroundColor = 'rgba(255,153,0,0.9)'; // Amazonカラー
        infoPanel.style.color = 'white';
        infoPanel.style.padding = '10px 20px';
        infoPanel.style.borderRadius = '5px';
        infoPanel.style.zIndex = '10001';
        infoPanel.style.pointerEvents = 'none';
        infoPanel.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        infoPanel.style.fontSize = '16px';
        infoPanel.innerHTML = '<strong>画像コンテナ選択モード</strong>: 画像を含む要素にマウスを合わせて選択してください。ESCキーでキャンセル。';
        document.body.appendChild(infoPanel);
        
        // ハイライト用要素（より目立つように）
        const highlighter = document.createElement('div');
        highlighter.style.position = 'absolute';
        highlighter.style.border = '3px solid #ff9900'; // Amazonカラー
        highlighter.style.backgroundColor = 'rgba(255,153,0,0.2)';
        highlighter.style.zIndex = '9999';
        highlighter.style.pointerEvents = 'none';
        highlighter.style.boxShadow = '0 0 10px rgba(255,153,0,0.5)';
        document.body.appendChild(highlighter);
        
        // ツールチップ
        const tooltip = document.createElement('div');
        tooltip.style.position = 'absolute';
        tooltip.style.padding = '5px 10px';
        tooltip.style.backgroundColor = 'black';
        tooltip.style.color = 'white';
        tooltip.style.borderRadius = '3px';
        tooltip.style.fontSize = '12px';
        tooltip.style.zIndex = '10000';
        tooltip.style.pointerEvents = 'none';
        document.body.appendChild(tooltip);
        
        // 状態管理
        let currentElement = null;
        
        // マウスオーバーイベントの登録
        function handleMouseMove(e) {
            const target = e.target;
            
            // 画像を含む要素のみハイライト
            const hasImages = target.querySelectorAll('img').length > 0;
            if (!hasImages) {
                highlighter.style.display = 'none';
                tooltip.style.display = 'none';
                return;
            }
            
            if (currentElement !== target) {
                currentElement = target;
                updateHighlighter(target);
            }
            
            // ツールチップの位置更新
            tooltip.style.display = 'block';
            tooltip.style.left = (e.pageX + 10) + 'px';
            tooltip.style.top = (e.pageY + 10) + 'px';
        }
        
        function updateHighlighter(element) {
            const rect = element.getBoundingClientRect();
            highlighter.style.display = 'block';
            highlighter.style.left = (window.scrollX + rect.left) + 'px';
            highlighter.style.top = (window.scrollY + rect.top) + 'px';
            highlighter.style.width = rect.width + 'px';
            highlighter.style.height = rect.height + 'px';
            
            // 画像カウント
            const images = element.querySelectorAll('img');
            tooltip.textContent = `要素: ${element.tagName.toLowerCase()} | 画像: ${images.length}枚`;
        }
        
        function handleClick(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const selectedElement = e.target;
            const hasImages = selectedElement.querySelectorAll('img').length > 0;
            
            if (hasImages) {
                const images = window.BlogGen.Scraper.extractImagesFromElement(selectedElement);
                
                // 選択モードを終了
                cleanup();
                
                // コールバックで画像を返す
                if (typeof callback === 'function') {
                    callback(images);
                }
            }
        }
        
        function handleKeyDown(e) {
            // ESCキーでキャンセル
            if (e.key === 'Escape') {
                cleanup();
                if (typeof callback === 'function') {
                    callback(null);
                }
            }
        }
        
        function cleanup() {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('click', handleClick);
            document.removeEventListener('keydown', handleKeyDown);
            
            // 追加した要素を削除
            if (document.body.contains(overlay)) document.body.removeChild(overlay);
            if (document.body.contains(highlighter)) document.body.removeChild(highlighter);
            if (document.body.contains(tooltip)) document.body.removeChild(tooltip);
            if (document.body.contains(infoPanel)) document.body.removeChild(infoPanel);
            
            // 元のスタイルを復元
            document.body.style.backgroundColor = originalBodyBg;
            document.body.style.opacity = originalBodyOpacity;
            
            console.log('構造選択モードを終了');
        }
        
        // イベントリスナー登録
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('click', handleClick);
        document.addEventListener('keydown', handleKeyDown);
    };
    
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
        let images = [];
        
        // Amazonサイトの場合、商品ギャラリーから画像を取得
        if (window.location.hostname.includes('amazon')) {
            console.log('Amazonサイトを検出、商品ギャラリーを探索');
            
            // 商品ギャラリーの可能性のある要素セレクタ
            const gallerySelectors = [
                '#imageBlock', // 標準的な画像ブロック
                '#altImages', // サムネイルコンテナ
                '#imgTagWrapperId', // メイン画像コンテナ
                '.a-dynamic-image-container', // 動的画像コンテナ
                '.regularAltImageViewLayout' // 代替画像レイアウト
            ];
            
            // 各セレクタを試す
            for (const selector of gallerySelectors) {
                const container = document.querySelector(selector);
                if (container) {
                    const containerImages = window.BlogGen.Scraper.extractImagesFromElement(container);
                    if (containerImages.length > 0) {
                        console.log(`${selector}から${containerImages.length}枚の画像を取得`);
                        images = containerImages;
                        break;
                    }
                }
            }
        }
        
        // 通常の画像取得（Amazonで特定のコンテナが見つからない場合や他のサイトの場合）
        if (images.length === 0) {
            images = Array.from(document.querySelectorAll('img[src*=\".jpg\"], img[src*=\".png\"], img[src*=\".jpeg\"], img[src*=\".webp\"]'))
                .filter(img => {
                    const w = img.naturalWidth || img.width || parseInt(img.getAttribute('width') || 0);
                    const h = img.naturalHeight || img.height || parseInt(img.getAttribute('height') || 0);
                    return w > 100 && h > 100; // 小さすぎる画像は除外
                })
                .map(img => img.src)
                .filter(src => src && src.startsWith('http')) // 有効なURLのみ
                .slice(0, 10); // 最大10枚まで
        }
        
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
