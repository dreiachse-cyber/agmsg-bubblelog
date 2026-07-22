# agmsg-bubblelog

agmsg-bubblelog は、[agmsg](https://github.com/fujibee/agmsg) のチーム会話ログを、メッセンジャー風に小さく表示するローカルビューアです。

agmsg-office の「エージェント会話を眺める」という考え方だけを踏襲し、UIは別OSSとして作っています。agmsg のローカル状態レイアウトと読み取りロジックの一部は、MIT License に従って最小限だけ取り込んでいます。

## Demo

![agmsg-bubblelog demo](docs/assets/demo.gif)

元の動画は [demo.mp4](docs/assets/demo.mp4) から開けます。

## 目的

- Codex、Claude、Gemini などの agmsg 会話を省スペースで読む。
- 日本語の作業ログを読みやすくする。
- UIを15言語で切り替え、ログ本文は原文のまま読む。
- コーディング画面の横に置ける、軽いログビューアにする。
- APIキー、課金、外部送信なしでローカル完結にする。
- agmsg のシェルスクリプトや Git Bash に依存せず、Node.js だけでローカル履歴を読む。

## 起動

```bash
npm start
```

ブラウザで開きます。

```text
http://127.0.0.1:8787/
```

本物のagmsg履歴を出したくない時はデモURLを使います。
このURLではAPIを呼ばず、架空のチーム会話だけを自動再生します。

```text
http://127.0.0.1:8787/demo
```

対象プロジェクトを明示する場合:

```bash
PORT=8787 AGMSG_PROJECT=/d/codex/NPC.md/slot6 npm start
```

Node.js 24 以上が必要です。追加の npm 依存はありません。

agmsg の状態ディレクトリを明示する場合:

```bash
AGMSG_ROOT=/path/to/agmsg npm start
```

メッセージDBの場所だけを変える場合は、agmsg と同じ `AGMSG_STORAGE_PATH` も使えます。

## AIエージェントの課金設定について

agmsg-bubblelog はローカルの agmsg ログを読むだけのビューアです。このアプリ自体は、Claude、Codex、Anthropic API、OpenAI API、その他の外部AI APIを呼びません。

ただし、agmsg の相手として Claude Code、Codex、Gemini などのエージェントCLIを別途起動する場合、そのCLI側の認証、サブスクリプション、APIキー、利用クレジット、従量課金の設定は利用者自身の責任で確認してください。

特に Claude Code を使う場合は、利用前に以下を確認することを強く推奨します。

1. Claude Codeで `/status` を実行する。
2. `Usage credits are off` になっているか、または自分でオンにした設定か確認する。
3. Claude Webの `Settings > Usage` で Usage credits / Auto-reload の状態を確認する。
4. Anthropic ConsoleでAPI creditsを購入していないか、API billing / auto-reload の状態を確認する。
5. `ANTHROPIC_API_KEY` などのAPIキー環境変数が設定されていないか確認する。

PowerShellでは、値を表示せず有無だけ確認できます。

```powershell
$names = @('ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN', 'CLAUDE_CODE_OAUTH_TOKEN')
foreach ($name in $names) {
  [pscustomobject]@{
    Name = $name
    ProcessSet = [bool][Environment]::GetEnvironmentVariable($name, 'Process')
    UserSet = [bool][Environment]::GetEnvironmentVariable($name, 'User')
    MachineSet = [bool][Environment]::GetEnvironmentVariable($name, 'Machine')
  }
}
```

Unix系シェルでは、値を表示せず有無だけ確認できます。

```bash
for name in ANTHROPIC_API_KEY ANTHROPIC_AUTH_TOKEN CLAUDE_CODE_OAUTH_TOKEN; do
  if [ -n "${!name:-}" ]; then
    echo "$name is set"
  else
    echo "$name is not set"
  fi
done
```

`Usage credits`、API credits、Console billing、APIキーの意味や料金体系は各サービス側で変わる可能性があります。必ず公式画面と公式ドキュメントで最新状態を確認してください。

## できること

- agmsg の `teams/*/config.json` から利用可能なチームとメンバーを取得する。
- agmsg の `db/messages.db` から会話履歴を読み取り専用で取得する。
  - 接続は読み取り専用＋busyタイムアウト付きで開くため、agmsg 側の書き込み（watcher）と重なっても `database is locked` になりにくい。待ち時間は `AGMSG_BUSY_TIMEOUT_MS`（既定 2000ms）で調整できる。
- サイドバーの「スレッド」から任意の2エージェントのペア（例: Dove ⇄ Crow）を選び、そのペアの往復だけを絞り込んで読む。ペアごとの件数と最終発言日時で並ぶ。
- メッセージを左右の吹き出しで表示する。
- 左カラムを開閉して、縦長ウィンドウでも会話ログを広く読む。
- 送信者ごとに小さな顔アイコンを自動生成する。
- エージェント名から顔アイコンを選び、ブラウザごとの個人設定として保存する。
- UI言語をブラウザ言語から自動選択し、手動変更をブラウザごとの個人設定として保存する。
- 5秒ごとに履歴を自動更新する。
- 最新位置を見ている時は新着へ自動追従し、途中を読んでいる時は新着ボタンだけ出す。
- 文面から簡単な感情タグを推定する。
  - 完了
  - 警戒
  - 要注意
  - 質問
  - レビュー
  - 待機
  - 通常
- `ctrl:` から始まる制御ログは通常非表示にする。

## 対応UI言語

ログ本文はエージェントが書いた原文のまま表示し、ビューアのボタン、見出し、状態表示、感情タグを以下の15言語で切り替えます。

日本語、English、简体中文、繁體中文、한국어、Русский、Español、Português (Brasil)、Deutsch、Français、Bahasa Indonesia、Türkçe、Tiếng Việt、Polski、Italiano。

## エージェントアイコン

画像は `public/avatars/` に置き、`public/agent-icons.json` でエージェント名に紐づけます。

```json
{
  "agents": {
    "codex-impl": "./avatars/codex.png",
    "claude-review": {
      "src": "./avatars/claude.png",
      "label": "Claude"
    }
  }
}
```

未設定のエージェントは、これまで通り名前の頭文字アイコンで表示します。

画面上のエージェント名を押すと、同梱アイコンから顔を選べます。選択結果はブラウザの `localStorage` に保存され、`agent-icons.json` は書き換えません。

表情差分を使う場合は `emotions` を指定します。

```json
{
  "agents": {
    "codex-impl": {
      "src": "./avatars/dog-neutral.png",
      "emotions": {
        "thinking": "./avatars/dog-thinking.png",
        "sad": "./avatars/dog-sad.png",
        "happy": "./avatars/dog-happy.png",
        "neutral": "./avatars/dog-neutral.png",
        "calm": "./avatars/dog-calm.png",
        "talk": "./avatars/dog-talk.png"
      }
    }
  }
}
```

`要注意` と `警戒` は `sad`、`質問` と考え中表示は `thinking`、`完了` は `happy`、`レビュー` と `待機` は `calm` に寄せて表示します。

同梱の切り出し済みアイコンは `bear`、`cat`、`dog`、`frog`、`gray-koala`、`lion`、`lowpoly-lion`、`panda`、`pig`、`rabbit`、`slime`、`white-koala` の12種類です。

`slime` を割り当てる場合の例:

```json
{
  "agents": {
    "claude-review": {
      "label": "Claude",
      "src": "./avatars/slime-neutral.png",
      "emotions": {
        "thinking": "./avatars/slime-thinking.png",
        "sad": "./avatars/slime-sad.png",
        "happy": "./avatars/slime-happy.png",
        "neutral": "./avatars/slime-neutral.png",
        "calm": "./avatars/slime-calm.png",
        "talk": "./avatars/slime-talk.png"
      }
    }
  }
}
```

## 運用のヒント

- Codex 系エージェントは、手動起動すると起動時に受信箱を既読化するだけで依頼に着手しないことがあります。作業を依頼する時は `/agmsg spawn codex <エージェント名>` 経由で起動し、依頼メッセージを受けた状態で立ち上げる運用に統一すると取りこぼしを防げます。
- 依頼の進み具合を追いたい時は、スレッド表示で「司令塔 ⇄ 実行役」のペアに絞ると、依頼→着手報告→完了報告の往復が読みやすくなります。

## しないこと

- agmsg メッセージ送信はしない。
- agmsg の設定やDBを書き換えない。
- 外部APIやAI APIへ送信しない。
- agmsg-office のコードを使わない。

## Third Party Notices

agmsg 由来の状態レイアウトと読み取りロジックの一部を MIT License に従って取り込んでいます。著作権表示とライセンス全文は `THIRD_PARTY_NOTICES.md` に記載しています。

## 設計メモ

agmsg-bubblelog は「作業劇場」ではなく「読むためのログ」です。

広いキャラクターステージは楽しい反面、長い作業ログを追うには画面を使いすぎます。このプロジェクトでは、キャラクター性を顔アイコンと感情だけに圧縮し、本文の読みやすさを優先します。

## ライセンス

MIT
