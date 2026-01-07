from fastapi.testclient import TestClient
from main import app
import numpy as np
import scipy.io.wavfile as wav
import io

# アプリをテストモードで起動するクライアント
client=TestClient(app)

def test_read_root():
    """トップページがHTMLを返すかテスト"""
    response=client.get("/")
    assert response.status_code==200
    # レスポンスがHTMLであることを確認
    assert "text/html" in response.headers["content-type"]

def test_convert_audio():
    """音声変換機能の結合テスト"""
    # 1. テスト用のダミー音声データ（1秒間のサイン波）を作成
    fs=44100
    t=np.linspace(0, 1.0, fs)
    # 440Hzの音
    data=np.sin(2*np.pi*440*t)
    # 16bit整数に変換
    data_int16=(data*32767).astype(np.int16)

    # 2. バイト列としてメモリに書き込み（ファイルアップロードの振りをするため）
    byte_io=io.BytesIO()
    wav.write(byte_io, fs, data_int16)
    byte_io.seek(0)

    # 3. APIにPOSTリクエストを送信
    response=client.post(
        "/convert",
        files={"file":("test.wav", byte_io, "audio/wav")},
        data={"target_fs": 8000, "n_bits": 4}
    )

    # 4. 検証（アサーション）
    # ステータスコードが200（成功）か？
    assert response.status_code==200
    # レスポンスがwavファイルか？
    assert response.headers["content-type"]=="audio/wav"
    # ファイル名が正しいか？
    assert "attachment; filename=retro_sound_wav" in response.headers["content-disposition"]