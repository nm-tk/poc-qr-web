
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// POSTフォーム受信
app.use(express.urlencoded({ extended: true }));

// 全HTMLをUTF-8で返す
app.use((req, res, next) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  next();
});

// 初期データ（install_date は未確定＝空文字）
const units = {
  "PGF-0001": { serial_flt: "62---9999999", model_flt: "PGF---", install_date: "" },
  "PGF-0002": { serial_flt: "62---9999998", model_flt: "PGF---", install_date: "" },
  "PGF-0003": { serial_flt: "62---9999997", model_flt: "PGF---", install_date: "" },
};

// ユーティリティ：JSTの今日を YYYY-MM-DD で
function todayJST() {
  const jst = new Date(Date.now() + 540 * 60 * 1000); // +9h
  const yyyy = jst.getUTCFullYear();
  const mm = String(jst.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(jst.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

app.get('/', (_, res) => {
  res.send(`<!doctype html><html lang="ja"><head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NFC/QR PoC</title></head><body>
    <h1>NFC/QR PoC</h1>
    <p><code>/u/PGF-0001</code> を試してください。</p>
  </body></html>`);
});

// 表示（初回はフォーム、確定後は値のみ）
app.get('/u/:unit_id', (req, res) => {
  const { unit_id } = req.params;
  const unit = units[unit_id];

  if (!unit) {
    return res.status(404).send(`<!doctype html><html lang="ja"><head><meta charset="UTF-8">
      <title>404</title></head><body><h2>Unknown unit: ${unit_id}</h2></body></html>`);
  }

  const isFixed = !!unit.install_date; // 確定済みか

  const formHtml = ` /u/${unit_id}
      <label>設置日: <input type="date" name="install_date" value="${todayJST()}"></label>
      <button type="submit">確定して登録</button>
    </form>
    <p>※ 一度登録すると、このページでは変更できません（PoCのメモリ保持）。</p>`;

  return res.send(`<!doctype html><html lang="ja"><head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${unit_id} | 設備ページ</title></head><body>
    <h2>Unit: ${unit_id}</h2>
    <p><b>シリアルナンバー:</b> ${unit.serial_flt}</p>
    <p><b>フィルタ型式:</b> ${unit.model_flt}</p>
    <hr>
    <p><b>設置日（確定値）:</b> ${isFixed ? unit.install_date : '未登録'}</p>
    ${isFixed ? '<p>※ 登録済みのため、このページでは変更できません。</p>' : formHtml}
  </body></html>`);
});

// 初回登録（確定処理）：二重登録は拒否
app.post('/u/:unit_id', (req, res) => {
  const { unit_id } = req.params;
  const unit = units[unit_id];
  if (!unit) return res.status(404).send('Unknown unit');

  // 既に確定済みなら更新不可
  if (unit.install_date) {
    return res.status(409).send('既に登録済みのため変更できません（PoC仕様）');
  }

  const install = (req.body.install_date || '').trim();
  if (!install) {
    // 入力なしは弾く（JST今日を再提案）
    return res.redirect(`/u/${unit_id}`);
  }

  // ★ ここで確定（メモリに保存）
  unit.install_date = install;

  console.log(`[FIXED] ${unit_id} install_date=${unit.install_date}`);
  // 完了後は表示ページへ
  return res.redirect(`/u/${unit_id}`);
});

app.listen(PORT, () => console.log(`PoC server running on :${PORT}`));
