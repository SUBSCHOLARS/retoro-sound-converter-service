// DOM要素の取得（型アサーションを使って、HTML要素であることを明示します）
const targetFsInput=document.getElementById('targetFs') as HTMLInputElement;
const fsValDisplay=document.getElementById('fsVal') as HTMLSpanElement;
const nBitsInput=document.getElementById('nBits') as HTMLInputElement;
const bitValDisplay=document.getElementById('bitVal') as HTMLSpanElement;
const convertForm=document.getElementById('convertForm') as HTMLFormElement;

const resultArea=document.getElementById('resultArea') as HTMLDivElement;
const audioPlayer=document.getElementById('audioPlayer') as HTMLAudioElement;
const downloadLink=document.getElementById('downloadLink') as HTMLAnchorElement;
const audioFileInput=document.getElementById('audioFile') as HTMLInputElement;

// イベントリスナーの設定
// 値が変わったときに数値を表示更新
targetFsInput.addEventListener('input', (e: Event) => {
    const target=e.target as HTMLInputElement;
    fsValDisplay.innerText=target.value;
});

nBitsInput.addEventListener('input', (e: Event) => {
    const target=e.target as HTMLInputElement;
    bitValDisplay.innerText=target.value;
});

// 送信ボタンが押された時の処理
convertForm.addEventListener('submit', async (e: SubmitEvent) => {
    e.preventDefault();

    // ファイルチェック
    // filesプロパティがnullではないか、長さが0ではないかを確認
    if(!audioFileInput.files || audioFileInput.files.length===0){
        alert("ファイルを選択してください");
        return;
    }
    const formData=new FormData();
    formData.append('file', audioFileInput.files[0] as Blob);
    formData.append('target_fs', targetFsInput.value);
    formData.append('n_bits', nBitsInput.value);

    // ボタンの状態を更新
    // form内のbutton要素を探す
    const btn=convertForm.querySelector('button');
    if (!btn) return; // ボタンが見つからなければ終了

    const originalText=btn.innerText;
    btn.innerText="処理中...";
    btn.disabled=true;
    btn.classList.add('opacity-50', 'cursor-not-allowed');

    try{
        // バックエンドに送信
        const response=await fetch('/convert', {
            method:'POST',
            body: formData
        });

        if(!response.ok){
            throw new Error('Convertion failed');
        }

        const blob=await response.blob();
        const url=URL.createObjectURL(blob);

        // 結果の表示
        audioPlayer.src=url;
        downloadLink.href=url;
        downloadLink.download=`retro_${Date.now()}.wav`;

        resultArea.classList.remove('hidden');
    } catch(error){
        console.error(error);
        alert("変換に失敗しました。コンソールを確認してください。");
    } finally{
        // ボタンを元に戻す
        btn.innerText=originalText;
        btn.disabled=false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
});