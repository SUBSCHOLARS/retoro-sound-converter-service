from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
import numpy as np
import scipy.io.wavfile as wav
from scipy.interpolate import interp1d
import io

# FastAPIのインスタンスを作成し、appという変数に格納
app=FastAPI()

# 'static'ディレクトリにあるファイルを'/static'というURLで配信する設定
app.mount("/static", StaticFiles(directory="static", html=True), name="static")

@app.get("/")
def read_root():
    # ルートにアクセスしたらstatic/index.htmlを返すようにリダイレクトしても良いが、
    # ここではAPIが生きている確認用にメッセージを返す。
    # フロントエンドは指定されたポートにアクセスして使う
    return {"message": "Retro Sound ConverterAPI is running. Go to /static/index.html"}

def process_audio(audio_data, sample_rate, target_fs, n_bits):
    # 1. ステレオ->モノラル変換
    if len(audio_data.shape)>1:
        y=np.mean(audio_data, axis=1)
    else:
        y=audio_data
    # 2. ダウンサンプリング
    duration=len(y)/sample_rate
    t_old=np.linspace(0, duration, len(y))
    # 新しい時間軸
    t_new=np.arange(0, duration, 1/target_fs)

    # 線形補間(nearest)
    f=interp1d(t_old, y, kind='nearest', fill_value="extrapolate")
    y_down=f(t_new)

    # 3. ビットクラッシュ
    steps=2**n_bits
    y_crushed=np.round(y_down*(steps/2))/(steps/2)

    return y_crushed, target_fs

@app.post("/convert")
async def convert_audio(
    file: UploadFile = File(...),
    target_fs: int = Form(8000),
    n_bits: int = Form(5)
):
    contents=await file.read()
    # scipyで読み込み
    try:
        sample_rate, data=wav.read(io.BytesIO(contents))
    except ValueError:
        return {"error": "Invalid WAV file"}
    
    # 正規化(-1.0~1.0)
    if data.dtype==np.int16:
        data=data/32768.0 # 2^(16 - 1)
    elif data.dtype==np.int32:
        data=data/2147483648.0 # 2^(32 - 1)
    elif data.dtype==np.uint8:
        data=(data-128)/128.0

    # 処理実行
    processed_data, new_fs=process_audio(data, sample_rate, target_fs, n_bits)

    # 書き出しようにint16に戻す
    processed_data=np.clip(processed_data, -1.0, 1.0)
    output_data=(processed_data*32767).astype(np.int16)

    output_io=io.BytesIO()
    wav.write(output_io, new_fs, output_data)
    output_io.seek(0)

    return StreamingResponse(
        output_io,
        media_type="audio/wav",
        headers={"Content-Disposition": "attachment; filename=retro_sound_wav"}
    )