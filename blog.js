// ==UserScript==
// @name         シンプル版アフィリエイトブログ生成ツール
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Webページの内容をスクレイピングし、Claude APIを使用してブログ記事を生成します
// @author       You
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// @require      https://raw.githubusercontent.com/tatupon/Blog-temper/main/utils.js?v=0.4
// @require      https://raw.githubusercontent.com/tatupon/Blog-temper/main/scraper.js?v=0.4
// @require      https://raw.githubusercontent.com/tatupon/Blog-temper/main/ui.js?v=0.4
// @require      https://raw.githubusercontent.com/tatupon/Blog-temper/main/api.js?v=0.4
// @require      https://raw.githubusercontent.com/tatupon/Blog-temper/main/affiliate.js?v=0.4
// ==/UserScript==

(function() {
    'use strict';

    // コンソールに開始メッセージを表示 (デバッグ用)
    console.log('アフィリエイトブログ生成ツールが読み込まれました');

    // グローバル名前空間を作成
    window.BlogGen = window.BlogGen || {};

    // ブログ生成開始関数
    window.BlogGen.startGeneration = function() {
        console.log('ブログ生成が開始されました'); // デバッグ用

        // APIキーのチェック
        const apiKey = GM_getValue('claude_api_key');
        if (!apiKey) {
            if (confirm('Claude APIキーが設定されていません。設定しますか？')) {
                window.BlogGen.Utils.setApiKey();
                return;
            } else {
                return;
            }
        }

        // ページデータ取得
        const pageData = window.BlogGen.Scraper.getPageData();
        console.log('ページデータ:', pageData); // デバッグ用

        // 処理開始
        window.BlogGen.UI.showEditor(pageData, true);
    };

    // 記事生成処理
    window.BlogGen.generateArticle = function(data) {
        console.log('記事生成処理開始'); // デバッグ用

        // ローディング表示
        const loading = window.BlogGen.Utils.createLoadingOverlay('記事を生成中...');

        // プロンプト構築
        let prompt = `以下の情報からWordPress用のHTML形式ブログ記事とSEO用メタディスクリプションを作成してください。

タイトル: ${data.title}
URL: ${data.url}
説明: ${data.description}
画像URL: ${data.images.join(', ')}

記事スタイル: ${data.style === 'review' ? 'レビュー重視' :
               data.style === 'comparison' ? '比較スタイル' :
               data.style === 'detailed' ? '詳細情報重視' : '基本（シンプル）'}

記事内容に以下の要素を含めてください：
1. H1タグでのタイトル
2. 商品の簡潔な紹介（2〜3段落）
3. 選択された画像をすべて使用（img要素で表示）
4. 商品の特徴をリスト形式で紹介
5. 「購入する」ボタン（リンク先: ${data.url}）

次の2つを出力してください:
1. SEO用メタディスクリプション（160文字以内、検索表示に最適化）
2. 完全なHTML形式の記事本文

SEO用メタディスクリプションは、[META_DESCRIPTION]と[/META_DESCRIPTION]で囲んでください。
その後に、HTML形式の記事本文を出力してください。

必ずHTMLコードを出力してください。マークダウンではなく、完全なHTML形式で記事を作成してください。
WordPressのHTMLエディタに直接貼り付けられるコードを生成してください。`;

        // APIリクエスト
        window.BlogGen.API.sendClaudeRequest(
            prompt,
            function(htmlContent, metaDescription) {
                // ローディング終了
                loading.remove();

                // HTMLにスタイルを追加
                htmlContent = window.BlogGen.Affiliate.enhanceHtmlWithStyles(htmlContent);

                // 結果表示
                window.BlogGen.UI.showResult(htmlContent, metaDescription);
            },
            function(error) {
                loading.remove();
                window.BlogGen.Utils.handleError(error, 'APIリクエストエラー');
            }
        );
    };

    // アフィリエイト付き記事生成処理
    window.BlogGen.generateArticleWithAffiliateOptions = async function(data) {
        console.log('アフィリエイトオプション付き記事生成開始'); // デバッグ用
        const settings = GM_getValue('affiliate_settings', {});

        // ローディング表示
        const loading = window.BlogGen.Utils.createLoadingOverlay('記事生成の準備中...');

        // Amazon商品リンク作成（設定があれば）
        let amazonProduct = null;
        if (settings.amazonTag) {
            // ローディングメッセージを一時的に非表示
            loading.remove();

            // Amazon商品リンクを作成するか確認
            if (confirm('この商品のAmazonアフィリエイトリンクを作成しますか？')) {
                amazonProduct = await window.BlogGen.Affiliate.createAmazonProductLink(data.title);
            }

            // ローディング表示を再表示
            loading.setText('記事を生成中...');
            document.body.appendChild(loading.overlay);
        }

        // プロンプト構築
        let prompt = `以下の情報からWordPress用のHTML形式ブログ記事とSEO用メタディスクリプションを作成してください。

タイトル: ${data.title}
URL: ${data.url}
説明: ${data.description}
画像URL: ${data.images.join(', ')}

記事スタイル: ${data.style === 'review' ? 'レビュー重視' :
               data.style === 'comparison' ? '比較スタイル' :
               data.style === 'detailed' ? '詳細情報重視' : '基本（シンプル）'}

記事内容に以下の要素を含めてください：
1. このブログは「ハンギョドン」情報をまとめサイトですので、ハンギョドンファンを意識した文章を作成してください。
2. H1タグでのタイトル
3. 商品の簡潔な紹介（2〜3段落）
4. 選択された画像をすべて使用（img要素で表示）
5. 商品の特徴をリスト形式で紹介
6. 「購入する」ボタン（リンク先: ${data.url}）`;

        // Amazon検索結果とバナー広告の情報を追加
        prompt = window.BlogGen.Affiliate.extendPromptWithAffiliateInfo(prompt, amazonProduct, settings);

        prompt += `

次の2つを出力してください:
1. SEO用メタディスクリプション（160文字以内、検索表示に最適化）
2. 完全なHTML形式の記事本文

SEO用メタディスクリプションは、[META_DESCRIPTION]と[/META_DESCRIPTION]で囲んでください。
その後に、HTML形式の記事本文を出力してください。

必ずHTMLコードを出力してください。マークダウンではなく、完全なHTML形式で記事を作成してください。
WordPressのHTMLエディタに直接貼り付けられるコードを生成してください。`;

        // APIリクエスト
        window.BlogGen.API.sendClaudeRequest(
            prompt,
            function(htmlContent, metaDescription) {
                // ローディング終了
                loading.remove();

                // HTMLにスタイルを追加
                htmlContent = window.BlogGen.Affiliate.enhanceHtmlWithStyles(htmlContent);

                // 結果表示
                window.BlogGen.UI.showResult(htmlContent, metaDescription);
            },
            function(error) {
                loading.remove();
                window.BlogGen.Utils.handleError(error, 'APIリクエストエラー');
            }
        );
    };

    // Tampermonkeyメニュー登録
    function registerMenuCommands() {
        try {
            console.log('メニュー登録を試みます'); // デバッグ用
            GM_registerMenuCommand('ブログ記事生成', window.BlogGen.startGeneration, 'b');
            GM_registerMenuCommand('APIキー設定', window.BlogGen.Utils.setApiKey, 'a');
            GM_registerMenuCommand('アフィリエイト設定', window.BlogGen.Affiliate.setAffiliateSettings, 'c');
            console.log('メニュー登録完了'); // デバッグ用
        } catch (e) {
            console.error('メニュー登録エラー:', e); // デバッグ用
        }
    }

    // 初期化
    function init() {
        try {
            // メニュー登録（遅延実行）
            setTimeout(registerMenuCommands, 1000);
            
            // グローバル関数の公開
            window.blogGenTool = {
                startGeneration: window.BlogGen.startGeneration,
                setApiKey: window.BlogGen.Utils.setApiKey,
                setAffiliateSettings: window.BlogGen.Affiliate.setAffiliateSettings
            };
            
            console.log('アフィリエイトブログ生成ツールの初期化が完了しました');
        } catch (e) {
            console.error('初期化エラー:', e);
        }
    }

    // 初期化実行
    init();
})();
