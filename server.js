
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// フォーム POST を受け取るため
app.use(express.urlencoded({ extended: true }));

// 念のため全HTMLをUTF-8で返す
app.use((req, res, next) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  next();
});

// ★ JST（UTC+9）の今日を YYYY-MM-DD で返すユーティリティ
function todayJST() {
  // 540分 = 9時間
  const jst = new Date(Date.now() + 540 * 60 * 1000);
  const yyyy = jst.getUTCFullYear();
  const mm = String(jst.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(jst.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// 初期データ（install_date は常に空）
const units = {
  "PGF-0001": { serial_flt: "62---9999999", model_flt: "PGF---", install_date: "" },
  "PGF-0002": { serial_flt: "62---9999998", model_flt: "PGF---", install_date: "" },
  "PGF-0003": { serial_flt: "62---9999997", model_flt: "PGF---", install_date: "" },
};

app.get('/', (_, res) => {
  res.send(`<!doctype html><html lang="ja"><head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NFC/QR PoC</title></head><body>
    <h1>NFC/QR PoC</h1>
    <p><code>/u/PGF-0001</code> を試してください。</p>
  </body></html>`);
});

// ★ 読み込み時に常にフォームを出す（install_date は保持しない）
app.get('/u/:unit_id', (req, res) => {
  const { unit_id } = req.params;
  const unit = units[unit_id];

  console.log(`[HIT] ${unit_id} at ${new Date().toISOString()}`);

  if (!unit) {
    return res.status(404).send(`<!doctype html><html lang="ja"><head><meta charset="UTF-8">
      <title>404</title></head><body><h2>Unknown unit: ${unit_id}</h2></body></html>`);
  }

  // URLクエリに install_date があればそれを使用。無ければ「今日（JST）」を初期表示に採用。
  const installDateOnce = (req.query.install_date || todayJST()).trim();

  return res.send(`<!doctype html><html lang="ja"><head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${unit_id} | 設備ページ</title></head><body>
    <h2>Unit: ${unit_id}</h2>
    <p><b>シリアルナンバー:</b> ${unit.serial_flt}</p>
    <p><b>フィルタ型式:</b> ${unit.model_flt}</p>
    <hr>
    <p><b>（今回のアクセスで表示する）設置日:</b> ${installDateOnce}</p>
    /u/${unit_id}
      <label>設置日: <input type="date" name="install_date" value="${installDateOnce}"></label>
      <button type="submit">このページだけに表示</button>
    </form>
    <p>※ 設置日はサーバに保存しません。ページを開き直すと再び「今日」が初期表示になります。</p>
  </body></html>`);
});

// ★ フォーム受信：保存せず、クエリに載せて同ページへリダイレクト（＝今回だけ表示）
app.post('/u/:unit_id', (req, res) => {
  const { unit_id } = req.params;
  const unit = units[unit_id];
  if (!unit) return res.status(404).send('Unknown unit');

  const install = (req.body.install_date || '').trim();
  // メモリへは書かない（units[unit_id].install_date は更新しない）
  // 今回のアクセスだけ表示するため、クエリに付けて同ページへ戻す
  const qs = install ? `?install_date=${encodeURIComponent(install)}` : `?install_date=${encodeURIComponent(todayJST())}`;
  return res.redirect(`/u/${unit_id}${qs}`);
});

app.listen(PORT, () => console.log(`PoC server running on :${PORT}`));
