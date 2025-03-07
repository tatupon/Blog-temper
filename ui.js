// UI関連の機能を提供するモジュール
(function() {
    'use strict';
    
    // グローバル名前空間を作成
    window.BlogGen = window.BlogGen || {};
    window.BlogGen.UI = window.BlogGen.UI || {};
    
    // 画像セレクター作成
    window.BlogGen.UI.createImageSelector = function(pageData, container) {
        // 既存部分
        const imagesLabel = document.createElement('label');
        imagesLabel.textContent = '使用する画像を選択:';
        imagesLabel.style.display = 'block';
        imagesLabel.style.marginBottom = '10px';
        imagesLabel.style.fontWeight = 'bold';
    
        const imagesContainer = document.createElement('div');
        imagesContainer.style.display = 'flex';
        imagesContainer.style.flexWrap = 'wrap';
        imagesContainer.style.gap = '10px';
        imagesContainer.style.marginBottom = '20px';
    
        const selectedImages = new Set();
    
        if (pageData.images && pageData.images.length > 0) {
            pageData.images.forEach((src, index) => {
                // 改善されたイメージラッパー
                const imgWrap = document.createElement('div');
                imgWrap.style.position = 'relative';
                imgWrap.style.width = '150px';
                imgWrap.style.border = '1px solid #ccc';
                imgWrap.style.padding = '5px';
                imgWrap.style.textAlign = 'center';
                imgWrap.style.cursor = 'pointer'; // カーソルをポインターに変更
                imgWrap.style.backgroundColor = '#e6f7ff'; // デフォルトで選択状態の背景色
    
                // 画像
                const img = document.createElement('img');
                img.src = src;
                img.style.maxWidth = '100%';
                img.style.height = '100px';
                img.style.objectFit = 'contain';
    
                // チェックボックス
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = true; // デフォルトで選択
                checkbox.style.marginTop = '5px';
                checkbox.style.transform = 'scale(1.3)'; // チェックボックスを少し大きく
                checkbox.style.cursor = 'pointer'; // カーソルをポインターに変更
                selectedImages.add(src);
    
                // 視覚的なインジケーター追加
                const selectionIndicator = document.createElement('div');
                selectionIndicator.textContent = '✓ 選択中';
                selectionIndicator.style.fontSize = '12px';
                selectionIndicator.style.color = '#1890ff';
                selectionIndicator.style.fontWeight = 'bold';
                selectionIndicator.style.marginTop = '3px';
    
                // 共通のトグル機能
                const toggleSelection = function() {
                    checkbox.checked = !checkbox.checked;
                    if (checkbox.checked) {
                        selectedImages.add(src);
                        imgWrap.style.backgroundColor = '#e6f7ff';
                        selectionIndicator.style.display = 'block';
                    } else {
                        selectedImages.delete(src);
                        imgWrap.style.backgroundColor = 'transparent';
                        selectionIndicator.style.display = 'none';
                    }
                };
    
                // 画像ラッパーのクリックイベント
                imgWrap.onclick = function(e) {
                    // チェックボックス自体のクリックの場合は、トグル関数を呼ばない
                    // (チェックボックスのデフォルト動作を妨げないため)
                    if (e.target !== checkbox) {
                        e.preventDefault();
                        toggleSelection();
                    }
                };
    
                // チェックボックスのイベント
                checkbox.onchange = function() {
                    if (this.checked) {
                        selectedImages.add(src);
                        imgWrap.style.backgroundColor = '#e6f7ff';
                        selectionIndicator.style.display = 'block';
                    } else {
                        selectedImages.delete(src);
                        imgWrap.style.backgroundColor = 'transparent';
                        selectionIndicator.style.display = 'none';
                    }
                };
    
                // 要素の追加
                imgWrap.appendChild(img);
                imgWrap.appendChild(checkbox);
                imgWrap.appendChild(selectionIndicator);
                imagesContainer.appendChild(imgWrap);
            });
        } else {
            const noImgMsg = document.createElement('p');
            noImgMsg.textContent = '画像が見つかりませんでした';
            imagesContainer.appendChild(noImgMsg);
        }
    
        // 全選択/全解除ボタン
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.marginBottom = '15px';
    
        const selectAllBtn = document.createElement('button');
        selectAllBtn.textContent = 'すべて選択';
        selectAllBtn.style.padding = '5px 10px';
        selectAllBtn.style.backgroundColor = '#f0f0f0';
        selectAllBtn.style.border = '1px solid #d9d9d9';
        selectAllBtn.style.borderRadius = '4px';
        selectAllBtn.style.cursor = 'pointer';
    
        const deselectAllBtn = document.createElement('button');
        deselectAllBtn.textContent = 'すべて解除';
        deselectAllBtn.style.padding = '5px 10px';
        deselectAllBtn.style.backgroundColor = '#f0f0f0';
        deselectAllBtn.style.border = '1px solid #d9d9d9';
        deselectAllBtn.style.borderRadius = '4px';
        deselectAllBtn.style.cursor = 'pointer';
    
        selectAllBtn.onclick = function() {
            const checkboxes = imagesContainer.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach((cb, i) => {
                if (!cb.checked) {
                    cb.checked = true;
                    selectedImages.add(pageData.images[i]);
                    cb.parentElement.style.backgroundColor = '#e6f7ff';
                    cb.parentElement.querySelector('div').style.display = 'block';
                }
            });
        };
    
        deselectAllBtn.onclick = function() {
            const checkboxes = imagesContainer.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach((cb, i) => {
                if (cb.checked) {
                    cb.checked = false;
                    selectedImages.delete(pageData.images[i]);
                    cb.parentElement.style.backgroundColor = 'transparent';
                    cb.parentElement.querySelector('div').style.display = 'none';
                }
            });
        };
    
        buttonContainer.appendChild(selectAllBtn);
        buttonContainer.appendChild(deselectAllBtn);
    
        // コンテナに追加
        container.appendChild(imagesLabel);
        container.appendChild(buttonContainer);
        container.appendChild(imagesContainer);
    
        return selectedImages;
    };
    
    // エディタ画面表示
    window.BlogGen.UI.showEditor = function(pageData, useAffiliateFeatures) {
        console.log('エディタ画面を表示'); // デバッグ用
    
        // オーバーレイ作成
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
        overlay.style.zIndex = '9999';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
    
        // エディタコンテナ
        const container = document.createElement('div');
        container.style.backgroundColor = 'white';
        container.style.padding = '20px';
        container.style.borderRadius = '8px';
        container.style.width = '80%';
        container.style.maxWidth = '800px';
        container.style.maxHeight = '90vh';
        container.style.overflow = 'auto';
    
        // タイトル
        const title = document.createElement('h2');
        title.textContent = 'ブログ記事生成';
        title.style.marginBottom = '20px';
    
        // 閉じるボタン
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '閉じる';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '10px';
        closeBtn.style.padding = '5px 10px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = function() {
            document.body.removeChild(overlay);
        };
    
        // 商品タイトル入力
        const titleLabel = document.createElement('label');
        titleLabel.textContent = 'タイトル:';
        titleLabel.style.display = 'block';
        titleLabel.style.marginBottom = '5px';
        titleLabel.style.fontWeight = 'bold';
    
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.value = pageData.title;
        titleInput.style.width = '100%';
        titleInput.style.padding = '8px';
        titleInput.style.marginBottom = '15px';
    
        // 説明入力
        const descLabel = document.createElement('label');
        descLabel.textContent = '商品説明:';
        descLabel.style.display = 'block';
        descLabel.style.marginBottom = '5px';
        descLabel.style.fontWeight = 'bold';
    
        const descTextarea = document.createElement('textarea');
        descTextarea.value = pageData.metaDescription;
        descTextarea.style.width = '100%';
        descTextarea.style.height = '100px';
        descTextarea.style.padding = '8px';
        descTextarea.style.marginBottom = '15px';
    
        // 改善された画像選択UIを使用する
        // この1行で画像選択UIが生成されセットされます
        const selectedImages = window.BlogGen.UI.createImageSelector(pageData, container);
    
        // 記事スタイル選択
        const styleLabel = document.createElement('label');
        styleLabel.textContent = '記事スタイル:';
        styleLabel.style.display = 'block';
        styleLabel.style.marginBottom = '5px';
        styleLabel.style.fontWeight = 'bold';
    
        const styleSelect = document.createElement('select');
        styleSelect.style.width = '100%';
        styleSelect.style.padding = '8px';
        styleSelect.style.marginBottom = '20px';
    
        const styles = [
            { value: 'basic', text: '基本（シンプル）' },
            { value: 'review', text: 'レビュー重視' },
            { value: 'comparison', text: '比較スタイル' },
            { value: 'detailed', text: '詳細情報重視' }
        ];
    
        styles.forEach(style => {
            const option = document.createElement('option');
            option.value = style.value;
            option.textContent = style.text;
            styleSelect.appendChild(option);
        });
    
        // 生成ボタン
        const generateBtn = document.createElement('button');
        generateBtn.textContent = 'ブログ記事を生成';
        generateBtn.style.backgroundColor = '#4CAF50';
        generateBtn.style.color = 'white';
        generateBtn.style.padding = '10px 15px';
        generateBtn.style.border = 'none';
        generateBtn.style.borderRadius = '4px';
        generateBtn.style.cursor = 'pointer';
        generateBtn.style.fontSize = '16px';
        generateBtn.style.width = '100%';
    
        generateBtn.onclick = function() {
            // 選択データの取得
            const data = {
                title: titleInput.value,
                description: descTextarea.value,
                url: pageData.url,
                images: Array.from(selectedImages),
                style: styleSelect.value,
                content: pageData.content
            };
    
            // オーバーレイを閉じる
            document.body.removeChild(overlay);
    
            // 記事生成
            if (useAffiliateFeatures) {
                window.BlogGen.generateArticleWithAffiliateOptions(data);
            } else {
                window.BlogGen.generateArticle(data);
            }
        };
    
        // 要素の追加
        container.appendChild(title);
        container.appendChild(closeBtn);
        container.appendChild(titleLabel);
        container.appendChild(titleInput);
        container.appendChild(descLabel);
        container.appendChild(descTextarea);
        // ここでは imagesLabel と imagesContainer を追加しません
        // createImageSelector 関数内で既に追加されているため
        container.appendChild(styleLabel);
        container.appendChild(styleSelect);
        container.appendChild(generateBtn);
    
        overlay.appendChild(container);
        document.body.appendChild(overlay);
    };
    
    // 結果表示
    window.BlogGen.UI.showResult = function(htmlContent) {
        console.log('結果表示処理開始'); // デバッグ用
        
        // マークダウンのHTMLブロックタグを除去する（```html と ``` を削除）
        htmlContent = htmlContent.replace(/^```html\n/m, '')
                                .replace(/\n```$/m, '')
                                .trim();
    
        // 結果表示用オーバーレイ
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
        overlay.style.zIndex = '9999';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
    
        // 結果コンテナ
        const container = document.createElement('div');
        container.style.backgroundColor = 'white';
        container.style.padding = '20px';
        container.style.borderRadius = '8px';
        container.style.width = '90%';
        container.style.height = '90%';
        container.style.position = 'relative';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
    
        // タブコンテナ
        const tabContainer = document.createElement('div');
        tabContainer.style.display = 'flex';
        tabContainer.style.marginBottom = '15px';
    
        // プレビュータブ
        const previewTab = document.createElement('button');
        previewTab.textContent = 'プレビュー';
        previewTab.style.padding = '8px 15px';
        previewTab.style.backgroundColor = '#2196F3';
        previewTab.style.color = 'white';
        previewTab.style.border = 'none';
        previewTab.style.borderRadius = '4px 0 0 4px';
        previewTab.style.cursor = 'pointer';
    
        // コードタブ
        const codeTab = document.createElement('button');
        codeTab.textContent = 'HTML';
        codeTab.style.padding = '8px 15px';
        codeTab.style.backgroundColor = '#ccc';
        codeTab.style.color = 'black';
        codeTab.style.border = 'none';
        codeTab.style.borderRadius = '0 4px 4px 0';
        codeTab.style.cursor = 'pointer';
    
        tabContainer.appendChild(previewTab);
        tabContainer.appendChild(codeTab);
    
        // コピーボタン
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'HTMLをコピー';
        copyBtn.style.position = 'absolute';
        copyBtn.style.top = '20px';
        copyBtn.style.right = '80px';
        copyBtn.style.padding = '8px 15px';
        copyBtn.style.backgroundColor = '#4CAF50';
        copyBtn.style.color = 'white';
        copyBtn.style.border = 'none';
        copyBtn.style.borderRadius = '4px';
        copyBtn.style.cursor = 'pointer';
    
        copyBtn.onclick = function() {
            navigator.clipboard.writeText(htmlContent).then(() => {
                copyBtn.textContent = 'コピー完了!';
                setTimeout(() => {
                    copyBtn.textContent = 'HTMLをコピー';
                }, 2000);
            }).catch(err => {
                alert('コピーに失敗しました');
                console.error('コピーエラー:', err);
            });
        };
    
        // 閉じるボタン
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '閉じる';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '20px';
        closeBtn.style.right = '20px';
        closeBtn.style.padding = '8px 15px';
        closeBtn.style.backgroundColor = '#f44336';
        closeBtn.style.color = 'white';
        closeBtn.style.border = 'none';
        closeBtn.style.borderRadius = '4px';
        closeBtn.style.cursor = 'pointer';
    
        closeBtn.onclick = function() {
            document.body.removeChild(overlay);
        };
    
        // コンテンツエリア
        const contentArea = document.createElement('div');
        contentArea.style.flex = '1';
        contentArea.style.overflow = 'auto';
        contentArea.style.border = '1px solid #ddd';
        contentArea.style.borderRadius = '4px';
    
        // プレビューエリア
        const previewArea = document.createElement('div');
        previewArea.style.padding = '15px';
        previewArea.style.height = '100%';
        previewArea.style.overflow = 'auto';
    
        try {
            previewArea.innerHTML = htmlContent;
        } catch (e) {
            previewArea.textContent = 'HTMLレンダリングエラー: ' + e.message;
        }
    
        // コードエリア
        const codeArea = document.createElement('pre');
        codeArea.style.padding = '15px';
        codeArea.style.margin = '0';
        codeArea.style.height = '100%';
        codeArea.style.overflow = 'auto';
        codeArea.style.backgroundColor = '#f5f5f5';
        codeArea.style.display = 'none';
        codeArea.textContent = htmlContent;
    
        // タブ切り替え
        previewTab.onclick = function() {
            previewArea.style.display = 'block';
            codeArea.style.display = 'none';
            previewTab.style.backgroundColor = '#2196F3';
            previewTab.style.color = 'white';
            codeTab.style.backgroundColor = '#ccc';
            codeTab.style.color = 'black';
        };
    
        codeTab.onclick = function() {
            previewArea.style.display = 'none';
            codeArea.style.display = 'block';
            codeTab.style.backgroundColor = '#2196F3';
            codeTab.style.color = 'white';
            previewTab.style.backgroundColor = '#ccc';
            previewTab.style.color = 'black';
        };
    
        // 要素追加
        contentArea.appendChild(previewArea);
        contentArea.appendChild(codeArea);
    
        container.appendChild(tabContainer);
        container.appendChild(copyBtn);
        container.appendChild(closeBtn);
        container.appendChild(contentArea);
    
        overlay.appendChild(container);
        document.body.appendChild(overlay);
    };
    
    console.log('UIモジュールが読み込まれました');
})();
