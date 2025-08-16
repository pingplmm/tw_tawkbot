// server.js
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

// 你的 Tawk.to API Key
const TAWK_API_KEY = "YOUR_TAWKTO_API_KEY";

// 关键词规则（支持别名）
const rules = [
  {
    keywords: ["退款", "退钱", "退货", "我要退款"], // 多个别名
    reply: "您好，退款流程是：请填写退款申请表，我们会在 3 个工作日内处理。"
  },
  {
    keywords: ["价格", "多少钱", "收费", "费用"],
    reply: "我们的价格方案有基础版、专业版和企业版，详情请看：https://example.com/pricing"
  },
  {
    keywords: ["发票", "开票", "要发票"],
    reply: "需要发票的客户请联系客服邮箱：billing@example.com"
  }
];

// Webhook 接收消息
app.post("/tawkto-webhook", async (req, res) => {
  try {
    const message = req.body.message;   // 访客消息
    const visitorId = req.body.visitor; // 访客 ID
    console.log("访客消息：", message);

    // 遍历规则，模糊匹配
    for (let rule of rules) {
      if (rule.keywords.some(k => message.includes(k))) {
        const reply = rule.reply;

        // 调用 Tawk.to API 回复
        await axios.post("https://api.tawk.to/v1/message", {
          visitor: visitorId,
          message: reply,
        }, {
          headers: {
            Authorization: `Bearer ${TAWK_API_KEY}`
          }
        });

        console.log(`已自动回复：${reply}`);
        break; // 匹配一个规则就停止
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
    res.sendStatus(500);
  }
});

app.listen(3000, () => console.log("🚀 关键词自动回复服务已运行，端口 3000"));
