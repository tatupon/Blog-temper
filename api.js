// API通信機能を提供するモジュール
(function() {
    'use strict';
    
    // グローバル名前空間を作成
    window.BlogGen = window.BlogGen || {};
    window.BlogGen.API = window.BlogGen.API || {};
    
    // Claude APIリクエスト送信
    window.BlogGen.API.sendClaudeRequest = function(prompt, onSuccess, onError) {
        console.log('Claude APIリクエスト送信開始'); // デバッグ用
        const apiKey = GM_getValue('claude_api_key');
        
        if (!apiKey) {
            if (onError) onError(new Error('APIキーが設定されていません'));
            return;
        }
        
        // APIリクエスト
        GM_xmlhttpRequest({
            method: 'POST',
            url: 'https://api.anthropic.com/v1/messages',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            data: JSON.stringify({
                model: 'claude-3-7-sonnet-20250219',
                max_tokens: 4000,
                messages: [
                    { role: 'user', content: prompt }
                ],
                system: "あなたは商品紹介ブログのHTML生成アシスタントです。与えられた情報から、WordPressに直接貼り付け可能なHTMLコードを生成してください。必ずHTML形式で出力し、マークダウンは使用しないでください。SEO用メタディスクリプションも生成してください。"
            }),
            onload: function(response) {
                if (response.status >= 400) {
                    console.error('API応答:', response.responseText);
                    if (onError) onError(new Error(`APIエラー: ${response.status} ${response.statusText}`));
                    return;
                }
                
                try {
                    const result = JSON.parse(response.responseText);
                    let responseText = '';
                    
                    if (result.content && Array.isArray(result.content) && result.content.length > 0) {
                        responseText = result.content[0].text;
                    } else if (result.completion) {
                        responseText = result.completion;
                    } else {
                        throw new Error('APIから予期しない応答がありました');
                    }
                    
                    // マークダウンのHTMLブロックタグを除去
                    responseText = responseText.replace(/^```html\n/m, '')
                                       .replace(/\n```$/m, '')
                                       .trim();
                    
                    // メタディスクリプションと記事本文を分離
                    const metaDescMatch = responseText.match(/\[META_DESCRIPTION\](.*?)\[\/META_DESCRIPTION\]/s);
                    const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : '';
                    
                    // メタタグを除去した記事本文
                    let htmlContent = responseText.replace(/\[META_DESCRIPTION\].*?\[\/META_DESCRIPTION\]/s, '').trim();
                    
                    if (onSuccess) onSuccess(htmlContent, metaDescription);
                } catch (error) {
                    console.error('応答パース失敗:', error, response.responseText);
                    if (onError) onError(error);
                }
            },
            onerror: function(error) {
                console.error('APIリクエストエラー:', error);
                if (onError) onError(error);
            }
        });
    };
    
    // アフィリエイト情報を含むシステムプロンプト生成
    window.BlogGen.API.getAffiliateSystemPrompt = function() {
        return "あなたは商品紹介ブログのHTML生成アシスタントです。与えられた情報から、WordPressに直接貼り付け可能なHTMLコードを生成してください。必ずHTML形式で出力し、マークダウンは使用しないでください。Amazonアフィリエイトリンクやバナー広告を指定された位置に適切に配置してください。";
    };
    
    // 基本的なシステムプロンプト生成
    window.BlogGen.API.getBasicSystemPrompt = function() {
        return "あなたは商品紹介ブログのHTML生成アシスタントです。与えられた情報から、WordPressに直接貼り付け可能なHTMLコードを生成してください。必ずHTML形式で出力し、マークダウンは使用しないでください。";
    };
    
    console.log('APIモジュールが読み込まれました');
})();
