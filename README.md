# mcp-game-demo

npm install express ws body-parser cors

node server.js

ゲーム本体: http://localhost:3000
コントロールパネル: http://localhost:3000/control-panel.html
ß
POST http://localhost:3000/api/move
{"x": 10, "z": -5}

POST http://localhost:3000/api/move-relative
{"x": 1, "z": 0}

