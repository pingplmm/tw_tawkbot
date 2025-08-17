// server.js
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // 用于调用 Tawk.to API
const app = express();

app.use(bodyParser.json());

// 从环境变量读取端口
const PORT = process.env.PORT || 3000;

// 配置你的 Tawk.to Property ID（Webhook 校验用）
const TAWK_PROPERTY_ID = process.env.TAWK_PROPERTY_ID || '68953feca4fc79192a7bd617';

// 从环境变量读取 API Key（你需要在 Render 上配置环境变量 TAWK_API_KEY）
const TAWK_API_KEY = process.env.TAWK_API_KEY;

// 简单关键词自动回复逻辑
const keywordReplies = {
  '你好': '您好！有什么可以帮您的吗？',
  '价格': '我们的产品价格请访问 https://tw.songvape.com/price',
  '帮助': '请问您遇到什么问题？'
};

// 封装一个发送消息给访客的方法
async function sendMessageToVisitor(conversationId, message) {
  try {
    const url = `https://api.tawk.to/v1/conversation/${conversationId}/message`;
    const res = await axios.post(
      url,
      {
        type: 'msg',
        text: message
      },
      {
        headers: {
          Authorization: `Bearer ${TAWK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('已发送自动回复:', message);
  } catch (err) {
    console.error('发送失败:', err.response ? err.response.data : err.message);
  }
}

// 接收 Tawk.to Webhook 消息
app.post('/tawkto-webhook', async (req, res) => {
  const data = req.body;

  // 校验 Property ID（防止伪造）
  if (data && data.widget_id !== TAWK_PROPERTY_ID) {
    return res.status(403).send('Invalid Property ID');
  }

  const message = data.message || '';
  const visitor = data.visitor || {};
  const conversationId = data.conversation_id;

  console.log('收到消息:', message, '访客信息:', visitor);

  // 自动匹配关键词
  let reply = null;
  for (const key in keywordReplies) {
    if (message.includes(key)) {
      reply = keywordReplies[key];
      break;
    }
  }

  if (reply && conversationId) {
    await sendMessageToVisitor(conversationId, reply);
  }

  res.sendStatus(200);
});

// 启动服务
app.listen(PORT, () => {
  console.log(`Tawkbot running on port ${PORT}`);
});
