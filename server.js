import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// PoCの簡単な設備データ（このままでも動きます）
const units = {
  "PGF-0001": { serial_flt: "62---9999999", model_ac: "FVYCP---", model_flt: "PGF---" },
  "PGF-0002": { serial_flt: "62---9999998", model_ac: "FFYVP---", model_flt: "PGF---" },
  "PGF-0003": { serial_flt: "62---9999997", model_ac: "FVCP---", model_flt: "PGF---" },
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
    <p><b>エアコン型式:</b> ${unit.model_ac}</p>
    <p><b>フィルタ型式:</b> ${unit.model_flt}</p>
    <hr>
    <p>このページは QRコードを読み取るだけで自動表示されます（PoC）。</p>
  `);
});

app.listen(PORT, () => console.log(`PoC server running on ${PORT}`));
