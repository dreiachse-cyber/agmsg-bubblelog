# agmsg-bubblelog

agmsg-bubblelog は、[agmsg](https://github.com/fujibee/agmsg) のチーム会話ログを、メッセンジャー風に小さく表示するローカルビューアです。

agmsg-office の「エージェント会話を眺める」という考え方だけを踏襲し、コードは使わずに別OSSとして作っています。大きなステージ表示ではなく、顔アイコン、感情タグ、吹き出しログを中心にします。

## 目的

- Codex、Claude、Gemini などの agmsg 会話を省スペースで読む。
- 日本語の作業ログを読みやすくする。
- コーディング画面の横に置ける、軽いログビューアにする。
- APIキー、課金、外部送信なしでローカル完結にする。
- agmsg のデータは直接DBを読まず、agmsg scripts 経由で読む。

## 起動

```bash
npm start
```

ブラウザで開きます。

```text
http://127.0.0.1:8787/
```

対象プロジェクトを明示する場合:

```bash
PORT=8787 AGMSG_PROJECT=/d/codex/NPC.md/slot6 npm start
```

Windows では Git Bash の `bash` が必要です。通常は以下があれば動きます。

```text
C:\Program Files\Git\bin\bash.exe
```

## できること

- `whoami.sh` から利用可能な agmsg チームを取得する。
- `team.sh` からチームメンバーを取得する。
- `history.sh` から会話履歴を取得する。
- メッセージを左右の吹き出しで表示する。
- 送信者ごとに小さな顔アイコンを自動生成する。
- 文面から簡単な感情タグを推定する。
  - 完了
  - 警戒
  - 要注意
  - 質問
  - レビュー
  - 待機
  - 通常
- `ctrl:` から始まる制御ログは通常非表示にする。

## しないこと

- agmsg メッセージ送信はしない。
- agmsg の設定やDBを書き換えない。
- agmsg のSQLite DBを直接読まない。
- 外部APIやAI APIへ送信しない。
- agmsg-office のコードを使わない。

## 設計メモ

agmsg-bubblelog は「作業劇場」ではなく「読むためのログ」です。

広いキャラクターステージは楽しい反面、長い作業ログを追うには画面を使いすぎます。このプロジェクトでは、キャラクター性を顔アイコンと感情だけに圧縮し、本文の読みやすさを優先します。

## ライセンス

MIT
