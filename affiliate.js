// アフィリエイト関連機能を提供するモジュール
(function() {
    'use strict';
    
    // グローバル名前空間を作成
    window.BlogGen = window.BlogGen || {};
    window.BlogGen.Affiliate = window.BlogGen.Affiliate || {};
    
    // アフィリエイト設定関数
    window.BlogGen.Affiliate.setAffiliateSettings = function() {
        console.log('アフィリエイト設定画面を表示'); // デバッグ用
        // 現在の設定を取得
        const currentSettings = GM_getValue('affiliate_settings', {
            amazonTag: '',
            enableAmazonSearch: true,
            bannerCode: '',
            bannerPosition: 'bottom' // top, bottom, both
        });
    
        // 設定画面を表示
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
    
        const container = document.createElement('div');
        container.style.backgroundColor = 'white';
        container.style.padding = '20px';
        container.style.borderRadius = '8px';
        container.style.width = '80%';
        container.style.maxWidth = '600px';
        container.style.maxHeight = '90vh';
        container.style.overflow = 'auto';
    
        const title = document.createElement('h2');
        title.textContent = 'アフィリエイト設定';
        title.style.marginBottom = '20px';
    
        // Amazonタグ入力
        const amazonTagLabel = document.createElement('label');
        amazonTagLabel.textContent = 'Amazonアソシエイトタグ:';
        amazonTagLabel.style.display = 'block';
        amazonTagLabel.style.marginBottom = '5px';
        amazonTagLabel.style.fontWeight = 'bold';
    
        const amazonTagInput = document.createElement('input');
        amazonTagInput.type = 'text';
        amazonTagInput.value = currentSettings.amazonTag || '';
        amazonTagInput.placeholder = '例: yourtag-22';
        amazonTagInput.style.width = '100%';
        amazonTagInput.style.padding = '8px';
        amazonTagInput.style.marginBottom = '15px';
    
        // Amazon検索設定
        const amazonSearchLabel = document.createElement('label');
        amazonSearchLabel.style.display = 'block';
        amazonSearchLabel.style.marginBottom = '15px';
        amazonSearchLabel.style.fontWeight = 'bold';
    
        const amazonSearchCheck = document.createElement('input');
        amazonSearchCheck.type = 'checkbox';
        amazonSearchCheck.checked = currentSettings.enableAmazonSearch;
        amazonSearchCheck.style.marginRight = '8px';
    
        amazonSearchLabel.appendChild(amazonSearchCheck);
        amazonSearchLabel.appendChild(document.createTextNode('商品名をAmazonで自動検索'));
    
        // バナーコード入力
        const bannerLabel = document.createElement('label');
        bannerLabel.textContent = '広告バナーコード（HTML）:';
        bannerLabel.style.display = 'block';
        bannerLabel.style.marginBottom = '5px';
        bannerLabel.style.fontWeight = 'bold';
    
        const bannerTextarea = document.createElement('textarea');
        bannerTextarea.value = currentSettings.bannerCode || '';
        bannerTextarea.placeholder = '<a href=\"広告URL\"><img src=\"バナー画像URL\" alt=\"広告\" /></a>';
        bannerTextarea.style.width = '100%';
        bannerTextarea.style.height = '100px';
        bannerTextarea.style.padding = '8px';
        bannerTextarea.style.marginBottom = '15px';
    
        // バナー表示位置
        const positionLabel = document.createElement('label');
        positionLabel.textContent = 'バナー表示位置:';
        positionLabel.style.display = 'block';
        positionLabel.style.marginBottom = '5px';
        positionLabel.style.fontWeight = 'bold';
    
        const positionSelect = document.createElement('select');
        positionSelect.style.width = '100%';
        positionSelect.style.padding = '8px';
        positionSelect.style.marginBottom = '20px';
    
        const positions = [
            { value: 'top', text: '記事上部' },
            { value: 'bottom', text: '記事下部' },
            { value: 'both', text: '上部と下部の両方' }
        ];
    
        positions.forEach(pos => {
            const option = document.createElement('option');
            option.value = pos.value;
            option.textContent = pos.text;
            if (pos.value === currentSettings.bannerPosition) {
                option.selected = true;
            }
            positionSelect.appendChild(option);
        });
    
        // 保存ボタン
        const saveBtn = document.createElement('button');
        saveBtn.textContent = '設定を保存';
        saveBtn.style.backgroundColor = '#4CAF50';
        saveBtn.style.color = 'white';
        saveBtn.style.padding = '10px 15px';
        saveBtn.style.border = 'none';
        saveBtn.style.borderRadius = '4px';
        saveBtn.style.cursor = 'pointer';
        saveBtn.style.fontSize = '16px';
        saveBtn.style.width = '100%';
    
        saveBtn.onclick = function() {
            const settings = {
                amazonTag: amazonTagInput.value.trim(),
                enableAmazonSearch: amazonSearchCheck.checked,
                bannerCode: bannerTextarea.value.trim(),
                bannerPosition: positionSelect.value
            };
    
            GM_setValue('affiliate_settings', settings);
            alert('設定が保存されました');
            document.body.removeChild(overlay);
        };
    
        // 閉じるボタン
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'キャンセル';
        closeBtn.style.marginTop = '10px';
        closeBtn.style.padding = '8px 15px';
        closeBtn.style.border = '1px solid #ccc';
        closeBtn.style.borderRadius = '4px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.fontSize = '14px';
        closeBtn.style.width = '100%';
    
        closeBtn.onclick = function() {
            document.body.removeChild(overlay);
        };
    
        // 要素の追加
        container.appendChild(title);
        container.appendChild(amazonTagLabel);
        container.appendChild(amazonTagInput);
        container.appendChild(amazonSearchLabel);
        container.appendChild(bannerLabel);
        container.appendChild(bannerTextarea);
        container.appendChild(positionLabel);
        container.appendChild(positionSelect);
        container.appendChild(saveBtn);
        container.appendChild(closeBtn);
    
        overlay.appendChild(container);
        document.body.appendChild(overlay);
    };
    
    // Amazon商品リンク作成機能（手動選択方式）
    window.BlogGen.Affiliate.createAmazonProductLink = async function(productName) {
        console.log('Amazon商品リンク作成開始:', productName); // デバッグ用
        const settings = GM_getValue('affiliate_settings', {});
        if (!settings.amazonTag) {
            return null;
        }
    
        return new Promise((resolve) => {
            // 検索キーワードのエンコード
            const encodedKeyword = encodeURIComponent(productName);
    
            // Amazon検索URL
            const amazonSearchUrl = `https://www.amazon.co.jp/s?k=${encodedKeyword}`;
    
            // ダイアログ作成
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
            overlay.style.zIndex = '10000';
            overlay.style.display = 'flex';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
    
            const container = document.createElement('div');
            container.style.backgroundColor = 'white';
            container.style.padding = '20px';
            container.style.borderRadius = '8px';
            container.style.width = '90%';
            container.style.maxWidth = '600px';
            container.style.maxHeight = '90vh';
            container.style.overflow = 'auto';
            container.style.position = 'relative';
    
            const title = document.createElement('h3');
            title.textContent = 'Amazon商品リンク設定';
            title.style.marginBottom = '20px';
    
            // 説明テキスト
            const desc = document.createElement('p');
            desc.textContent = 'この商品のAmazonリンクを生成します。下記から選択してください：';
            desc.style.marginBottom = '15px';
    
            // Amazon検索オプション
            const amazonSearchOption = document.createElement('div');
            amazonSearchOption.style.marginBottom = '10px';
            amazonSearchOption.style.padding = '10px';
            amazonSearchOption.style.border = '1px solid #ddd';
            amazonSearchOption.style.borderRadius = '4px';
            amazonSearchOption.style.cursor = 'pointer';
            amazonSearchOption.style.display = 'flex';
            amazonSearchOption.style.alignItems = 'center';
    
            const amazonRadio = document.createElement('input');
            amazonRadio.type = 'radio';
            amazonRadio.name = 'amazon-option';
            amazonRadio.checked = true;
            amazonRadio.style.marginRight = '10px';
    
            const amazonLabel = document.createElement('div');
            amazonLabel.innerHTML = `<strong>Amazon検索結果ページを使用</strong><br>「${productName}」の検索結果ページへのリンクを作成`;
    
            amazonSearchOption.appendChild(amazonRadio);
            amazonSearchOption.appendChild(amazonLabel);
    
            // 手動入力オプション
            const manualOption = document.createElement('div');
            manualOption.style.marginBottom = '10px';
            manualOption.style.padding = '10px';
            manualOption.style.border = '1px solid #ddd';
            manualOption.style.borderRadius = '4px';
            manualOption.style.cursor = 'pointer';
            manualOption.style.display = 'flex';
            manualOption.style.alignItems = 'center';
    
            const manualRadio = document.createElement('input');
            manualRadio.type = 'radio';
            manualRadio.name = 'amazon-option';
            manualRadio.style.marginRight = '10px';
    
            const manualLabel = document.createElement('div');
            manualLabel.innerHTML = '<strong>Amazon商品URLを直接入力</strong><br>商品ページを開いて、そのURLをコピー＆ペースト';
    
            manualOption.appendChild(manualRadio);
            manualOption.appendChild(manualLabel);
    
            // 手動URL入力フィールド
            const urlInputContainer = document.createElement('div');
            urlInputContainer.style.marginBottom = '15px';
            urlInputContainer.style.display = 'none';
    
            const urlLabel = document.createElement('label');
            urlLabel.textContent = 'Amazon商品URL:';
            urlLabel.style.display = 'block';
            urlLabel.style.marginBottom = '5px';
    
            const urlInput = document.createElement('input');
            urlInput.type = 'text';
            urlInput.placeholder = 'https://www.amazon.co.jp/dp/XXXXXXXXXX';
            urlInput.style.width = '100%';
            urlInput.style.padding = '8px';
    
            const urlHint = document.createElement('p');
            urlHint.textContent = '※ 商品ページを開き、アドレスバーからURLをコピーしてください。';
            urlHint.style.fontSize = '12px';
            urlHint.style.color = '#666';
            urlHint.style.marginTop = '5px';
    
            urlInputContainer.appendChild(urlLabel);
            urlInputContainer.appendChild(urlInput);
            urlInputContainer.appendChild(urlHint);
    
            // 開くボタン（新しいタブでAmazon検索結果を開く）
            const openSearchBtn = document.createElement('button');
            openSearchBtn.textContent = 'Amazonで検索する（新しいタブで開く）';
            openSearchBtn.style.backgroundColor = '#FF9900';
            openSearchBtn.style.color = 'white';
            openSearchBtn.style.padding = '8px 15px';
            openSearchBtn.style.border = 'none';
            openSearchBtn.style.borderRadius = '4px';
            openSearchBtn.style.marginBottom = '15px';
            openSearchBtn.style.cursor = 'pointer';
            openSearchBtn.style.width = '100%';
    
            openSearchBtn.onclick = function() {
                window.open(amazonSearchUrl, '_blank');
            };
    
            // ラジオボタンの切り替え処理
            amazonSearchOption.onclick = function() {
                amazonRadio.checked = true;
                urlInputContainer.style.display = 'none';
            };
    
            manualOption.onclick = function() {
                manualRadio.checked = true;
                urlInputContainer.style.display = 'block';
            };
    
            // 確認ボタン
            const confirmBtn = document.createElement('button');
            confirmBtn.textContent = '確認';
            confirmBtn.style.backgroundColor = '#4CAF50';
            confirmBtn.style.color = 'white';
            confirmBtn.style.padding = '10px 15px';
            confirmBtn.style.border = 'none';
            confirmBtn.style.borderRadius = '4px';
            confirmBtn.style.cursor = 'pointer';
            confirmBtn.style.width = '100%';
            confirmBtn.style.marginBottom = '10px';
    
            // 確認ボタン処理部分
            confirmBtn.onclick = function() {
                let amazonUrl;
    
                if (amazonRadio.checked) {
                    // 検索結果ページを使用
                    amazonUrl = amazonSearchUrl;
                } else {
                    // 手動入力URLを使用
                    amazonUrl = urlInput.value.trim();
    
                    // 基本的な検証
                    if (!amazonUrl || !amazonUrl.includes('amazon.co.jp')) {
                        alert('有効なAmazon URLを入力してください');
                        return;
                    }
                    
                    // URLを整理してシンプル化
                    amazonUrl = window.BlogGen.Affiliate.cleanAmazonUrl(amazonUrl);
                    console.log('クリーンされたURL:', amazonUrl); // デバッグ用
                }
    
                // アフィリエイトタグの付与
                if (amazonUrl.includes('?')) {
                    amazonUrl += `&tag=${settings.amazonTag}`;
                } else {
                    amazonUrl += `?tag=${settings.amazonTag}`;
                }
    
                document.body.removeChild(overlay);
                resolve({
                    url: amazonUrl,
                    title: productName,
                    tag: settings.amazonTag
                });
            };
    
            // キャンセルボタン
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'キャンセル';
            cancelBtn.style.padding = '8px 15px';
            cancelBtn.style.border = '1px solid #ccc';
            cancelBtn.style.borderRadius = '4px';
            cancelBtn.style.cursor = 'pointer';
            cancelBtn.style.width = '100%';
    
            cancelBtn.onclick = function() {
                document.body.removeChild(overlay);
                resolve(null);
            };
    
            // 要素の追加
            container.appendChild(title);
            container.appendChild(desc);
            container.appendChild(amazonSearchOption);
            container.appendChild(manualOption);
            container.appendChild(urlInputContainer);
            container.appendChild(openSearchBtn);
            container.appendChild(confirmBtn);
            container.appendChild(cancelBtn);
    
            overlay.appendChild(container);
            document.body.appendChild(overlay);
        });
    };
    
    // Amazonアフィリエイトリンク生成
    window.BlogGen.Affiliate.generateAmazonAffiliateLink = function(amazonProduct) {
        if (!amazonProduct) return '';
    
        // 商品URLにアフィリエイトタグを追加
        const url = amazonProduct.url;
    
        return `<div class="amazon-affiliate-container">
            <p class="amazon-title">Amazonで購入する</p>
            <a href="${url}" target="_blank" rel="nofollow noopener" class="amazon-btn">
                <img src="https://images-na.ssl-images-amazon.com/images/G/09/associates/buttons/assocbtn_orange_amazon2.gif" alt="Amazon.co.jpで購入">
            </a>
            <p class="amazon-note">※Amazon.co.jpが販売・発送する商品を購入すると、売上の一部が当サイトに還元されることがあります。</p>
        </div>`;
    };
    
    // バナー広告コード生成
    window.BlogGen.Affiliate.generateBannerAd = function() {
        const settings = GM_getValue('affiliate_settings', {});
    
        if (!settings.bannerCode) {
            return '';
        }
    
        return `<div class="banner-ad-container">
            ${settings.bannerCode}
        </div>`;
    };
    
    // プロンプト拡張（Amazon検索とバナー広告の指示を追加）
    window.BlogGen.Affiliate.extendPromptWithAffiliateInfo = function(prompt, amazonProduct, settings) {
        let extendedPrompt = prompt;
    
        // Amazonリンクがある場合
        if (amazonProduct) {
            extendedPrompt += `
    
    商品はAmazonでも販売されています。以下のAmazonリンクを記事内に適切に配置してください。
    Amazon URL: ${amazonProduct.url}
    
    「Amazonで購入する」ボタンを配置し、rel="nofollow noopener"属性を必ず付与してください。`;
        }
    
        // バナー広告がある場合
        if (settings.bannerCode) {
            extendedPrompt += `
    
    以下のバナー広告コードを記事の${settings.bannerPosition === 'top' ? '上部' : settings.bannerPosition === 'bottom' ? '下部' : '上部と下部の両方'}に配置してください:
    ${settings.bannerCode}`;
        }
    
        return extendedPrompt;
    };
    
    // HTMLにスタイルを追加
    window.BlogGen.Affiliate.enhanceHtmlWithStyles = function(html) {
        // Amazon関連のスタイルを追加
        const amazonStyles = `
    <style>
    .amazon-affiliate-container {
        margin: 25px 0;
        padding: 15px;
        border: 1px solid #e3e3e3;
        border-radius: 5px;
        background-color: #f9f9f9;
        text-align: center;
    }
    .amazon-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
        color: #333;
    }
    .amazon-btn {
        display: inline-block;
        margin: 10px 0;
    }
    .amazon-note {
        font-size: 12px;
        color: #666;
        margin-top: 10px;
    }
    .banner-ad-container {
        margin: 20px 0;
        text-align: center;
    }
    </style>
    `;
    
        // HTML内の既存のスタイルタグを探す
        if (html.includes('</style>')) {
            // 最後のスタイルタグを見つけて内容を追加
            const lastStyleIndex = html.lastIndexOf('</style>');
            html = html.substring(0, lastStyleIndex) + 
                   amazonStyles.trim().replace('<style>', '') + 
                   html.substring(lastStyleIndex);
        } else if (html.includes('</head>')) {
            // headタグがあればその中にスタイルを追加
            html = html.replace('</head>', amazonStyles + '</head>');
        } else if (html.toLowerCase().includes('<html')) {
            // HTML5文書の場合、<html>タグの直後に追加
            html = html.replace(/<html[^>]*>/i, match => match + amazonStyles);
        } else {
            // どのケースにも当てはまらなければ、先頭に追加
            html = amazonStyles + html;
        }
        
        return html;
    };
    
    // Amazon URLをクリーンに修正する関数
    window.BlogGen.Affiliate.cleanAmazonUrl = function(url) {
        let asin = '';
        
        // dp/XXXXXXXXXXの形式からASINを抽出
        const dpMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
        if (dpMatch && dpMatch[1]) {
            asin = dpMatch[1];
            return `https://www.amazon.co.jp/dp/${asin}`;
        }
        
        // gp/product/XXXXXXXXXXの形式からASINを抽出
        const gpMatch = url.match(/\/gp\/product\/([A-Z0-9]{10})/);
        if (gpMatch && gpMatch[1]) {
            asin = gpMatch[1];
            return `https://www.amazon.co.jp/dp/${asin}`;
        }
        
        // 他のフォーマットは見つからない場合は元のURLを返す
        return url;
    };
    
    console.log('アフィリエイトモジュールが読み込まれました');
})();
