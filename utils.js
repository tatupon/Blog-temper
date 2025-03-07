// ユーティリティ関数を提供するモジュール
(function() {
    'use strict';
    
    // グローバル名前空間を作成
    window.BlogGen = window.BlogGen || {};
    window.BlogGen.Utils = window.BlogGen.Utils || {};
    
    // APIキー設定関数
    window.BlogGen.Utils.setApiKey = function() {
        const apiKey = prompt('Claude APIキーを入力してください:');
        if (apiKey) {
            GM_setValue('claude_api_key', apiKey);
            alert('APIキーが保存されました');
        }
    };
    
    // ローディングオーバーレイ作成
    window.BlogGen.Utils.createLoadingOverlay = function(message) {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.style.position = 'fixed';
        loadingOverlay.style.top = '0';
        loadingOverlay.style.left = '0';
        loadingOverlay.style.width = '100%';
        loadingOverlay.style.height = '100%';
        loadingOverlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.justifyContent = 'center';
        loadingOverlay.style.alignItems = 'center';
        loadingOverlay.style.zIndex = '9999';
    
        const loadingText = document.createElement('div');
        loadingText.textContent = message || '処理中...';
        loadingText.style.color = 'white';
        loadingText.style.fontSize = '24px';
    
        loadingOverlay.appendChild(loadingText);
        document.body.appendChild(loadingOverlay);
        
        return {
            overlay: loadingOverlay,
            setText: function(text) {
                loadingText.textContent = text;
            },
            remove: function() {
                document.body.removeChild(loadingOverlay);
            }
        };
    };
    
    // エラーハンドリング
    window.BlogGen.Utils.handleError = function(error, title) {
        console.error(title || 'エラーが発生しました', error);
        alert(`${title || 'エラー'}: ${error.message || error}`);
    };
    
    // デバッグログ
    window.BlogGen.Utils.log = function(message, data) {
        if (data) {
            console.log(`[BlogGen] ${message}:`, data);
        } else {
            console.log(`[BlogGen] ${message}`);
        }
    };
    
    console.log('ユーティリティモジュールが読み込まれました');
})();
