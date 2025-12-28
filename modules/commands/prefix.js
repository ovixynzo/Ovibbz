const moment = require("moment-timezone");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "prefix",
  version: "1.3.0",
  hasPermssion: 0,
  credits: "Rx edit by tamim bbz",
  description: "Show bot prefix info without using any prefix",
  commandCategory: "system",
  usages: "",
  cooldowns: 5,
  usePrefix: false
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, body } = event;
  if (!body) return;

  if (body.toLowerCase().trim() === "prefix") {
    const ping = Date.now() - event.timestamp;
    const day = moment.tz("Asia/Dhaka").format("dddd");

    const BOTPREFIX = global.config.PREFIX || "!";
    const GROUPPREFIX = global.data.threadData?.[threadID]?.prefix || BOTPREFIX;
    const BOTNAME = global.config.BOTNAME || "𝗦𝗵𝗮𝘆𝗺𝗮 𝗯𝗮𝗯𝘆";

    const frames = [
      `
🌟╔═༶• 𝗣𝗥𝗘𝗙𝗜𝗫 𝗜𝗡𝗙𝗢 •༶═╗🌟
🕒 𝗣𝗶𝗻𝗴      : ${ping}ms
📅 𝗗𝗮𝘆       : ${day}
🤖 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲  : ${BOTNAME}
💠 𝗕𝗼𝘁 𝗣𝗿𝗲𝗳𝗶𝘅  : ${BOTPREFIX}
💬 𝗚𝗿𝗼𝘂𝗽 𝗣𝗿𝗲𝗳𝗶𝘅: ${GROUPPREFIX}
🌟╚═༶• 𝗘𝗻𝗱 𝗢𝗳 𝗦𝘁𝗮𝘁𝘂𝘀 •༶═╝🌟
`,
      `
╭━━•✧𝗣𝗥𝗘𝗙𝗜𝗫 𝗦𝗧𝗔𝗧𝗨𝗦✧•━━╮
│ ⏱  𝗣𝘂𝗻𝗴      : ${ping}ms
│ 📆 𝗗𝗮𝘆       : ${day}
│ 🤖 𝗕𝗼𝘁        : ${BOTNAME}
│ 🔹 𝗕𝗼𝘁 𝗽𝗿𝗲𝗳𝗶𝘅  : ${BOTPREFIX}
│ 🔹 𝗚𝗿𝗼𝘂𝗽 𝗽𝗿𝗲𝗳𝗶𝘅: ${GROUPPREFIX}
╰━━━━━━━━━━━━━━━╯
`,
      `
┏━༺ 𝗣𝗥𝗘𝗙𝗜𝗫 𝗜𝗡𝗙𝗢 ༻━┓
┃ 🕒 𝗣𝗶𝗻𝗴      : ${ping}ms
┃ 📅 𝗗𝗮𝘆       : ${day}
┃ 🤖 𝗕𝗼𝘁 𝗽𝗿𝗲𝗳𝗶𝘅  : ${BOTNAME}
┃ 💠 𝗕𝗼𝘁 𝗽𝗿𝗲𝗳𝗶𝘅  : ${BOTPREFIX}
┃ 💬 𝗚𝗿𝗼𝘂𝗽 𝗽𝗿𝗲𝗳𝗶𝘅: ${GROUPPREFIX}
┗━━━━━━━━━━━━━━━━━┛
`,
      `
▸▸▸ 𝗣𝗥𝗘𝗙𝗜𝗫 𝗦𝗧𝗔𝗧𝗨𝗦 ◂◂◂
  𝗣𝗶𝗻𝗴      : ${ping}ms
  𝗗𝗮𝘆       : ${day}
  𝗕𝗼𝘁 𝗻𝗮𝗺𝗲  : ${BOTNAME}
  𝗕𝗼𝘁 𝗽𝗿𝗲𝗳𝗶𝘅  : ${BOTPREFIX}
  𝗚𝗿𝗼𝘂𝗽 𝗽𝗿𝗲𝗳𝗶𝘅: ${GROUPPREFIX}
`
    ];

    // ===============================
    // 💠 RANDOM GIF SELECTION
    // ===============================
    const gifList = [
      "abdullah2.gif",
      "abdullah1.gif",
      "abdullah3.gif"
    ];

    const randomGif = gifList[Math.floor(Math.random() * gifList.length)];
    const gifPath = path.join(__dirname, "noprefix", randomGif);

    const chosenFrame = frames[Math.floor(Math.random() * frames.length)];

    return api.sendMessage(
      {
        body: chosenFrame,
        attachment: fs.createReadStream(gifPath)
      },
      threadID,
      messageID
    );
  }
};

module.exports.run = async () => {};
