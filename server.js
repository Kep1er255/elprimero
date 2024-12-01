const express = require('express');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');

// Expressのインスタンスを作成
const app = express();
const port = 3000;

// JSONデータのパース設定
app.use(bodyParser.urlencoded({ extended: true }));

// ファイル保存の設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // 一意な名前をつける
  }
});

const upload = multer({ storage });

// ユーザー情報（仮データとしてメモリに保存）
let users = [];
let loggedInUser = null;

// アカウント作成処理
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  users.push({ email, password, name: "", icon: "" });
  res.send('アカウント作成成功');
});

// ログイン処理
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  loggedInUser = users.find(user => user.email === email && user.password === password);
  if (loggedInUser) {
    res.redirect('/profile');
  } else {
    res.send('ログイン失敗');
  }
});

// プロフィール編集ページ
app.get('/profile', (req, res) => {
  if (!loggedInUser) {
    res.redirect('/');
  } else {
    res.send(`
      <h1>プロフィール編集</h1>
      <form action="/update-profile" method="POST" enctype="multipart/form-data">
        <label for="name">名前:</label>
        <input type="text" id="name" name="name" value="${loggedInUser.name}" required>

        <label for="icon">アイコン:</label>
        <input type="file" id="icon" name="icon" accept="image/*">

        <button type="submit">保存</button>
      </form>
    `);
  }
});

// プロフィール更新処理
app.post('/update-profile', upload.single('icon'), (req, res) => {
  const { name } = req.body;
  const icon = req.file ? req.file.filename : loggedInUser.icon;

  loggedInUser.name = name;
  loggedInUser.icon = icon;

  res.send(`プロフィール更新完了: 名前 - ${loggedInUser.name}, アイコン - ${loggedInUser.icon}`);
});

// サーバー起動
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
