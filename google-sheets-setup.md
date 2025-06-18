# Google スプレッドシート連携設定ガイド

## 概要
このガイドでは、QuickClip提案ページのお問い合わせフォームをGoogle スプレッドシートと連携させる方法を説明します。

## 必要なもの
- Googleアカウント
- Google スプレッドシート
- Google Apps Script

## 設定手順

### 1. Google スプレッドシートの準備

1. [Google スプレッドシート](https://sheets.google.com)にアクセス
2. 新しいスプレッドシートを作成
3. 1行目に以下のヘッダーを入力：
   - A1: タイムスタンプ
   - B1: 会社名
   - C1: 担当者名
   - D1: メールアドレス
   - E1: 電話番号
   - F1: お問い合わせ内容

### 2. Google Apps Scriptの設定

1. スプレッドシートのメニューから「拡張機能」→「Apps Script」を選択
2. 既存のコードを削除し、以下のコードを貼り付け：

```javascript
function doPost(e) {
  try {
    // スプレッドシートを開く
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // リクエストからデータを取得
    const data = JSON.parse(e.postData.contents);
    
    // タイムスタンプを追加
    const timestamp = new Date();
    
    // データを配列に整理
    const row = [
      timestamp,
      data.company,
      data.name,
      data.email,
      data.phone || '',
      data.message
    ];
    
    // スプレッドシートに追加
    sheet.appendRow(row);
    
    // 成功レスポンスを返す
    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'success',
        'timestamp': timestamp
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // エラーレスポンスを返す
    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'error',
        'error': error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// テスト用関数
function testPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        company: 'テスト酒造',
        name: 'テスト太郎',
        email: 'test@example.com',
        phone: '03-1234-5678',
        message: 'これはテストメッセージです。'
      })
    }
  };
  
  const result = doPost(testData);
  console.log(result.getContent());
}
```

3. ファイル名を「フォーム受信」などわかりやすい名前に変更
4. 保存（Ctrl/Cmd + S）

### 3. ウェブアプリとして公開

1. Apps Scriptエディタで「デプロイ」→「新しいデプロイ」をクリック
2. 設定アイコン（歯車）をクリックし、「ウェブアプリ」を選択
3. 以下の設定を行う：
   - 説明: 「フォーム受信API」（任意）
   - 実行ユーザー: 「自分」
   - アクセスできるユーザー: 「全員」
4. 「デプロイ」をクリック
5. 表示されるURL（https://script.google.com/macros/s/...）をコピー

### 4. HTMLフォームとの連携

以下のJavaScriptコードをindex.htmlに追加します：

```javascript
// フォーム送信処理
document.getElementById('contact-form').addEventListener('submit', async function(e) {
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
        // Google Apps ScriptのURLを設定
        const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
        
        // データを送信
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        // 成功メッセージを表示
        alert('お問い合わせを受け付けました。\\n担当者より2営業日以内にご連絡いたします。');
        
        // フォームをリセット
        this.reset();
        
    } catch (error) {
        // エラーメッセージを表示
        alert('送信中にエラーが発生しました。\\nお手数ですが、もう一度お試しください。');
        console.error('Error:', error);
        
    } finally {
        // 送信ボタンを有効化
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
});
```

### 5. 設定の確認

1. `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE`を実際のURLに置き換える
2. フォームのIDが正しいことを確認（id="contact-form"）
3. 各入力フィールドのIDが正しいことを確認

## セキュリティに関する注意事項

- Google Apps ScriptのURLは公開されますが、スプレッドシート自体は非公開のままです
- 必要に応じて、Apps Script側でリクエストの検証を追加できます
- 大量のスパム対策として、reCAPTCHAの実装を検討してください

## トラブルシューティング

### データが記録されない場合
1. Apps Scriptの実行権限を確認
2. スプレッドシートのIDが正しいか確認
3. Apps Scriptのログを確認（表示 → ログ）

### CORSエラーが発生する場合
- `mode: 'no-cors'`が設定されていることを確認
- この場合、レスポンスは取得できませんが、データは送信されます

## 応用

### メール通知を追加
Apps Scriptに以下のコードを追加することで、フォーム送信時にメール通知を受け取れます：

```javascript
// doPost関数内、sheet.appendRow(row)の後に追加
MailApp.sendEmail({
  to: 'your-email@example.com',
  subject: '【QuickClip】新規お問い合わせ',
  body: `
新規お問い合わせがありました。

会社名: ${data.company}
担当者名: ${data.name}
メールアドレス: ${data.email}
電話番号: ${data.phone || 'なし'}

お問い合わせ内容:
${data.message}

スプレッドシート: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}
`
});
```

## サポート

設定に関してご不明な点がございましたら、お気軽にお問い合わせください。