const http = require('http');
const WebSocket = require('ws');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// CORSとJSONボディパーサーを有効化
app.use(cors());
app.use(bodyParser.json());

// HTTPサーバーの作成
const server = http.createServer(app);

// WebSocketサーバーの作成
const wss = new WebSocket.Server({ server });

// 接続中のクライアントを保持
const clients = new Set();

// WebSocket接続のハンドリング
wss.on('connection', (ws) => {
  console.log('クライアントが接続しました');
  clients.add(ws);

  // 接続が閉じられたときの処理
  ws.on('close', () => {
    console.log('クライアントが切断しました');
    clients.delete(ws);
  });

  // エラーハンドリング
  ws.on('error', (error) => {
    console.error('WebSocketエラー:', error);
    clients.delete(ws);
  });
});

// プレイヤーを移動させるAPI（絶対位置）
app.post('/api/move', (req, res) => {
  const { x, z } = req.body;
  
  if (x === undefined || z === undefined) {
    return res.status(400).json({ error: 'x and z coordinates are required' });
  }

  // すべてのクライアントにメッセージを送信
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'move',
        absolute: true,
        x: parseFloat(x),
        z: parseFloat(z)
      }));
    }
  });

  res.json({ success: true, message: 'Move command sent', x, z });
});

// プレイヤーを相対的に移動させるAPI
app.post('/api/move-relative', (req, res) => {
  const { x, z } = req.body;
  
  if (x === undefined || z === undefined) {
    return res.status(400).json({ error: 'x and z coordinates are required' });
  }

  // すべてのクライアントにメッセージを送信
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'move',
        absolute: false,
        x: parseFloat(x),
        z: parseFloat(z)
      }));
    }
  });

  res.json({ success: true, message: 'Relative move command sent', x, z });
});

// 現在の接続クライアント数を返すAPI
app.get('/api/status', (req, res) => {
  res.json({
    clients: clients.size,
    status: 'running'
  });
});

// 静的ファイルの提供
app.use(express.static('.'));

// サーバー起動
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});