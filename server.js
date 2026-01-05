
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

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

app.get('/', (_, res) => {
  res.send("<h1>NFC/QR PoC</h1><p>/u/PGF-0001 を試してください。</p>");
});

// QR/NFCのURLが叩く先
app.get('/u/:unit_id', (req, res) => {
  const { unit_id } = req.params;
  const unit = units[unit_id];

  console.log(`[HIT] ${unit_id} at ${new Date().toISOString()}`);

  if (!unit) {
    return res.status(404).send(`<h1>Unknown unit: ${unit_id}</h1>`);
  }

  res.send(`
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <h1>Unit: ${unit_id}</h1>
    <p><b>シリアルナンバー:</b> ${unit.serial_flt}</p>
    <p><b>フィルタ型式:</b> ${unit.model_flt}</p>
    <p><b>使用開始日:</b> ${unit.install_date}</p>
    <hr>
    <p>このページは QRコードを読み取るだけで自動表示されます（PoC）。</p>
  `);
});

app.listen(PORT, () => console.log(`PoC server running on ${PORT}`));
