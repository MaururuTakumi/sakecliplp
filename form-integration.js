// Google スプレッドシート連携用JavaScriptコード
// このコードをindex.htmlの</body>タグの直前に追加してください

// フォーム送信処理
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // フォームデータを取得
            const formData = {
                company: document.getElementById('company').value,
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value || '',
                message: document.getElementById('message').value
            };
            
            // 送信ボタンを無効化
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = '送信中...';
            submitButton.disabled = true;
            
            try {
                // Google Apps Script URL
                const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby36c15UuhHyy2GHTE9gfpZEoXxd6BOzToamoQA11HwPHmW4niIHqbBP67UjSWRkb0D/exec';
                
                // データを送信
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors', // CORSエラーを回避
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                // 成功メッセージを表示
                showSuccessMessage();
                
                // フォームをリセット
                this.reset();
                
            } catch (error) {
                // エラーメッセージを表示
                showErrorMessage();
                console.error('Error:', error);
                
            } finally {
                // 送信ボタンを有効化
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    }
});

// 成功メッセージを表示
function showSuccessMessage() {
    // カスタムメッセージの作成
    const messageDiv = document.createElement('div');
    messageDiv.className = 'form-message success';
    messageDiv.innerHTML = `
        <div class="message-content">
            <h3>送信完了</h3>
            <p>お問い合わせを受け付けました。<br>
            担当者より2営業日以内にご連絡いたします。</p>
        </div>
    `;
    
    // メッセージを表示
    document.body.appendChild(messageDiv);
    
    // 3秒後に自動的に削除
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// エラーメッセージを表示
function showErrorMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'form-message error';
    messageDiv.innerHTML = `
        <div class="message-content">
            <h3>送信エラー</h3>
            <p>送信中にエラーが発生しました。<br>
            お手数ですが、もう一度お試しください。</p>
        </div>
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// メッセージ表示用のCSS（index.htmlの<style>タグ内に追加）
const messageStyles = `
<style>
.form-message {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    z-index: 9999;
    text-align: center;
    min-width: 300px;
    animation: fadeIn 0.3s ease-out;
}

.form-message.success {
    border-top: 4px solid #4CAF50;
}

.form-message.error {
    border-top: 4px solid #f44336;
}

.form-message h3 {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 20px;
}

.form-message p {
    margin: 0;
    color: #666;
    line-height: 1.6;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
}
</style>
`;

// 使用方法:
// 1. Google Apps Scriptを設定（google-sheets-setup.md参照）
// 2. YOUR_GOOGLE_APPS_SCRIPT_URL_HEREを実際のURLに置き換え
// 3. このスクリプトをindex.htmlに追加
// 4. messageStylesの内容を<style>タグに追加