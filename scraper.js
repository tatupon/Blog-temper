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
    
    // ページ内の潜在的な画像コンテナを見つける関数
    window.BlogGen.Scraper.findPotentialImageContainers = function() {
        console.log('潜在的な画像コンテナを検索中...');
        const containers = [];
        
        // Amazonサイトの場合、特定のセレクタを優先的に確認
        if (window.location.hostname.includes('amazon')) {
            console.log('Amazonサイトを検出、特定のコンテナを優先的に検索');
            
            // 商品ギャラリーの可能性のある要素セレクタ
            const gallerySelectors = [
                '#imageBlock', // 標準的な画像ブロック
                '#altImages', // サムネイルコンテナ
                '#imgTagWrapperId', // メイン画像コンテナ
                '.a-dynamic-image-container', // 動的画像コンテナ
                '.regularAltImageViewLayout', // 代替画像レイアウト
                '#main-image-container', // メイン画像コンテナ（別バージョン）
                '#imageBlockNew', // 新しい画像ブロック
                '#image-block', // ハイフン区切りバージョン
                '#dp-container' // 商品詳細ページコンテナ
            ];
            
            // 各セレクタを試す
            for (const selector of gallerySelectors) {
                const element = document.querySelector(selector);
                if (element) {
                    const images = window.BlogGen.Scraper.extractImagesFromElement(element);
                    if (images.length > 0) {
                        console.log(`${selector}から${images.length}枚の画像を検出`);
                        containers.push({
                            element: element,
                            imageCount: images.length,
                            images: images,
                            name: `Amazon商品ギャラリー (${selector})`
                        });
                    }
                }
            }
        }
        
        // 一般的な画像コンテナを検索（複数の画像を含む要素）
        const potentialContainers = ['div', 'section', 'ul', 'figure', 'article', 'main'];
        potentialContainers.forEach(tag => {
            document.querySelectorAll(tag).forEach(el => {
                // 既に追加済みのコンテナは除外
                if (containers.some(c => c.element === el)) {
                    return;
                }
                
                const images = window.BlogGen.Scraper.extractImagesFromElement(el);
                if (images.length >= 2) { // 2枚以上の画像を含む要素
                    // 親要素が既に追加されている場合は除外（重複を避けるため）
                    if (!containers.some(c => c.element.contains(el) || el.contains(c.element))) {
                        containers.push({
                            element: el,
                            imageCount: images.length,
                            images: images,
                            name: `${el.tagName.toLowerCase()}要素 (${images.length}枚の画像)`
                        });
                    }
                }
            });
        });
        
        // 画像数の多い順にソート
        containers.sort((a, b) => b.imageCount - a.imageCount);
        
        // 最大10個のコンテナに制限
        const result = containers.slice(0, 10);
        console.log(`${result.length}個の潜在的な画像コンテナを検出`);
        return result;
    };
    
    // 画像コンテナ選択ダイアログを表示する関数
    window.BlogGen.Scraper.showContainerSelectionDialog = function(containers, callback) {
        console.log('画像コンテナ選択ダイアログを表示');
        
        // ダイアログのHTML構造
        const dialog = document.createElement('div');
        dialog.className = 'container-selection-dialog';
        dialog.style.position = 'fixed';
        dialog.style.top = '10%';
        dialog.style.left = '10%';
        dialog.style.width = '80%';
        dialog.style.height = '80%';
        dialog.style.backgroundColor = 'white';
        dialog.style.zIndex = '99999';
        dialog.style.borderRadius = '8px';
        dialog.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
        dialog.style.overflow = 'auto';
        dialog.style.padding = '20px';
        
        // タイトル
        const title = document.createElement('h2');
        title.textContent = '画像コンテナを選択';
        title.style.marginBottom = '20px';
        title.style.color = '#232f3e'; // Amazonカラー
        dialog.appendChild(title);
        
        // 説明
        const desc = document.createElement('p');
        desc.textContent = '使用したい画像が含まれるコンテナを選択してください：';
        dialog.appendChild(desc);
        
        // コンテナリスト
        const list = document.createElement('div');
        list.style.display = 'flex';
        list.style.flexWrap = 'wrap';
        list.style.gap = '20px';
        
        containers.forEach((container, index) => {
            // コンテナごとのカード
            const card = document.createElement('div');
            card.style.border = '1px solid #ddd';
            card.style.borderRadius = '4px';
            card.style.padding = '10px';
            card.style.width = 'calc(33% - 20px)';
            card.style.minWidth = '280px';
            card.style.cursor = 'pointer';
            card.style.transition = 'all 0.2s ease';
            
            // ホバー効果
            card.onmouseover = function() {
                this.style.borderColor = '#ff9900';
                this.style.boxShadow = '0 0 10px rgba(255,153,0,0.3)';
            };
            card.onmouseout = function() {
                this.style.borderColor = '#ddd';
                this.style.boxShadow = 'none';
            };
            
            // カード内のコンテンツ
            const header = document.createElement('div');
            header.textContent = container.name || `コンテナ ${index + 1}（${container.imageCount}枚の画像）`;
            header.style.fontWeight = 'bold';
            header.style.marginBottom = '10px';
            
            // サムネイルプレビュー
            const preview = document.createElement('div');
            preview.style.display = 'flex';
            preview.style.flexWrap = 'wrap';
            preview.style.gap = '5px';
            preview.style.margin = '10px 0';
            preview.style.minHeight = '150px';
            preview.style.maxHeight = '200px';
            preview.style.overflow = 'hidden';
            
            // 最大5枚までサムネイル表示
            container.images.slice(0, 5).forEach(src => {
                const thumb = document.createElement('img');
                thumb.src = src;
                thumb.style.height = '70px';
                thumb.style.objectFit = 'contain';
                thumb.style.border = '1px solid #eee';
                thumb.style.padding = '2px';
                preview.appendChild(thumb);
            });
            
            // 画像数表示
            const count = document.createElement('div');
            count.textContent = `合計: ${container.imageCount}枚の画像`;
            count.style.fontSize = '12px';
            count.style.color = '#666';
            count.style.marginTop = '5px';
            
            // カードクリック時の処理
            card.onclick = function() {
                dialog.remove();
                callback(container.images);
            };
            
            card.appendChild(header);
            card.appendChild(preview);
            card.appendChild(count);
            list.appendChild(card);
        });
        
        dialog.appendChild(list);
        
        // 画像が見つからない場合のメッセージ
        if (containers.length === 0) {
            const noImages = document.createElement('p');
            noImages.textContent = '画像を含むコンテナが見つかりませんでした。';
            noImages.style.padding = '20px';
            noImages.style.textAlign = 'center';
            noImages.style.color = '#666';
            dialog.appendChild(noImages);
        }
        
        // ボタンコンテナ
        const buttonContainer = document.createElement('div');
        buttonContainer.style.marginTop = '20px';
        buttonContainer.style.textAlign = 'center';
        
        // キャンセルボタン
        const cancel = document.createElement('button');
        cancel.textContent = 'キャンセル';
        cancel.style.padding = '8px 16px';
        cancel.style.background = '#f0f0f0';
        cancel.style.border = '1px solid #ddd';
        cancel.style.borderRadius = '4px';
        cancel.style.cursor = 'pointer';
        cancel.style.marginRight = '10px';
        cancel.onclick = function() {
            dialog.remove();
            callback(null);
        };
        
        buttonContainer.appendChild(cancel);
        dialog.appendChild(buttonContainer);
        document.body.appendChild(dialog);
        
        // ESCキーでキャンセル
        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                dialog.remove();
                document.removeEventListener('keydown', handleKeyDown);
                callback(null);
            }
        }
        document.addEventListener('keydown', handleKeyDown);
    };
    
    // 構造選択モードを有効化する関数（ダイアログベースの新しいバージョン）
    window.BlogGen.Scraper.enableStructureSelectionMode = function(callback) {
        console.log('構造選択モード（ダイアログベース）を有効化');
        
        // 潜在的な画像コンテナを検索
        const containers = window.BlogGen.Scraper.findPotentialImageContainers();
        
        // コンテナ選択ダイアログを表示
        window.BlogGen.Scraper.showContainerSelectionDialog(containers, function(images) {
            if (images && images.length > 0) {
                console.log(`${images.length}枚の画像が選択されました`);
                callback(images);
            } else {
                console.log('画像選択がキャンセルされました');
                callback(null);
            }
        });
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
