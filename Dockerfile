# 1. Python 3.9 が入った軽量なLinux(Debian)をベースにする
FROM python:3.9-slim

# 2. コンテナ内の作業ディレクトリを/appに設定
WORKDIR /app

# 3. 必要なライブラリのリストをコピーしてインストール
# (キャッシュを利用してビルド時間を短縮するためのテクニック)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. ソースコードと静的ファイルをすべてコンテナ内にコピー
COPY . .

# 5. RenderなどのPaaSはポート番号を環境変数PORTで渡してくることが多いが、
# デフォルトで8000番を開けておく設定
EXPOSE 8000

# 6. サーバー起動コマンド
# host 0.0.0.0 は「外部からのアクセスを受け付ける」という意味
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]