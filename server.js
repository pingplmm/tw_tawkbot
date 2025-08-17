// server.js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

// 从环境变量读取端口
const PORT = process.env.PORT || 3000;

// 配置你的 Tawk.to Property ID
const TAWK_PROPERTY_ID = process.env.TAWK_PROPERTY_ID || '68953feca4fc79192a7bd617';

// 简单关键词自动回复逻辑
const keywordReplies = {
    '你好': '您好！有什么可以帮您的吗？',
    '价格': '我们的产品价格请访问 https://tw.songvape.com/price',
    '帮助': '请问您遇到什么问题？'
};

// 接收 Tawk.to Webhook 消息
app.post('/tawkto-webhook', (req, res) => {
    const data = req.body;

    // 验证 Property ID（防止伪造）
    if(data && data.widget_id !== TAWK_PROPERTY_ID){
        return res.status(403).send('Invalid Property ID');
    }

    const message = data.message || '';
    const visitor = data.visitor || {};

    console.log('收到消息:', message, '访客信息:', visitor);

    // 自动匹配关键词
    let reply = null;
    for(const key in keywordReplies){
        if(message.includes(key)){
            reply = keywordReplies[key];
            break;
        }
    }

    if(reply){
        // TODO: 这里可以调用 Tawk.to 的发送消息 API 或通过 Webhook 回复
        console.log('自动回复:', reply);
    }

    res.sendStatus(200);
});

// 启动服务
app.listen(PORT, () => {
    console.log(`Tawkbot running on port ${PORT}`);
});
