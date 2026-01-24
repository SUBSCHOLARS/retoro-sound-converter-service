var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// DOM要素の取得（型アサーションを使って、HTML要素であることを明示します）
const targetFsInput = document.getElementById('targetFs');
const fsValDisplay = document.getElementById('fsVal');
const nBitsInput = document.getElementById('nBits');
const bitValDisplay = document.getElementById('bitVal');
const convertForm = document.getElementById('convertForm');
const resultArea = document.getElementById('resultArea');
const audioPlayer = document.getElementById('audioPlayer');
const downloadLink = document.getElementById('downloadLink');
const audioFileInput = document.getElementById('audioFile');
// イベントリスナーの設定
// 値が変わったときに数値を表示更新
targetFsInput.addEventListener('input', (e) => {
    const target = e.target;
    fsValDisplay.innerText = target.value;
    console.log(target.value);
});
nBitsInput.addEventListener('input', (e) => {
    const target = e.target;
    bitValDisplay.innerText = target.value;
    console.log(target.value);
});
// 送信ボタンが押された時の処理
convertForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    // ファイルチェック
    // filesプロパティがnullではないか、長さが0ではないかを確認
    if (!audioFileInput.files || audioFileInput.files.length === 0) {
        alert("ファイルを選択してください");
        return;
    }
    const formData = new FormData();
    formData.append('file', audioFileInput.files[0]);
    formData.append('target_fs', targetFsInput.value);
    formData.append('n_bits', nBitsInput.value);
    // ボタンの状態を更新
    // form内のbutton要素を探す
    const btn = convertForm.querySelector('button');
    if (!btn)
        return; // ボタンが見つからなければ終了
    const originalText = btn.innerText;
    btn.innerText = "処理中...";
    btn.disabled = true;
    btn.classList.add('opacity-50', 'cursor-not-allowed');
    try {
        // バックエンドに送信
        const response = yield fetch('/convert', {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            throw new Error('Convertion failed');
        }
        const blob = yield response.blob();
        const url = URL.createObjectURL(blob);
        // 結果の表示
        audioPlayer.src = url;
        downloadLink.href = url;
        downloadLink.download = `retro_${Date.now()}.wav`;
        resultArea.classList.remove('hidden');
    }
    catch (error) {
        console.error(error);
        alert("変換に失敗しました。コンソールを確認してください。");
    }
    finally {
        // ボタンを元に戻す
        btn.innerText = originalText;
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}));
// export {};
//# sourceMappingURL=script.js.map