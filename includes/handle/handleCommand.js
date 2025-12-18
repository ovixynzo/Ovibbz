const fs = require("fs");
const path = require("path");
const stringSimilarity = require('string-similarity');
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const logger = require("../../utils/log.js");
const axios = require('axios');
const request = require('request');
const moment = require("moment-timezone");

module.exports = function ({ api, models, Users, Threads, Currencies }) {
  return async function ({ event }) {
    const dateNow = Date.now();
    const time = moment.tz("Asia/Ho_Chi_Minh").format("HH:MM:ss DD/MM/YYYY");

    let uid = event.senderID;
    const name = await Users.getNameUser(uid);
    const { allowInbox, PREFIX, ADMINBOT, NDH, DeveloperMode, adminOnly, keyAdminOnly, ndhOnly, adminPaseOnly } = global.config;
    const { userBanned, threadBanned, threadInfo, threadData, commandBanned } = global.data;
    const { commands, cooldowns } = global.client;

    var { body, senderID, threadID, messageID } = event;
    senderID = String(senderID);
    threadID = String(threadID);

    const threadSetting = threadData.get(threadID) || {};
    const threadPrefix = threadSetting.hasOwnProperty("PREFIX") ? threadSetting.PREFIX : PREFIX;
    const prefixRegex = new RegExp(`^(<@!?${senderID}>|${escapeRegex(threadPrefix)})\\s*`);

    if(senderID === api.getCurrentUserID()) return;

    // -------- Admin & NDH checks --------
    const adminbot = require('./../../config.json');
    if(typeof body === 'string' && body.startsWith(PREFIX)) {
      if(!ADMINBOT.includes(senderID) && adminbot.adminOnly) 
        return api.shareContact(`[ ADMIN ONLY ]\n────────────────────\n👤 Người dùng: ${name}\n⚠️ Chỉ admin bot mới có thể sử dụng bot\n────────────────────\n⏳ Time: ${time}`, uid, threadID, messageID);

      if(!ADMINBOT.includes(senderID) && adminbot.adminPaseOnly) 
        return api.shareContact(`[ ADMIN PASE ONLY ]\n────────────────────\n👤 Người dùng: ${name}\n⚠️ Chỉ admin bot mới được sử dụng bot trong chat riêng\n────────────────────\n⏳ Time: ${time}`, uid, threadID, messageID);

      if(!ADMINBOT.includes(senderID) && adminbot.ndhOnly) 
        return api.shareContact(`[ NDH ONLY ]\n────────────────────\n👤 Người dùng: ${name}\n⚠️ Chỉ người hỗ trợ bot mới có thể sử dụng bot\n────────────────────\n⏳ Time: ${time}`, uid, threadID, messageID);
    }

    // -------- Admin box check --------
    const dataAdbox = require('./../../modules/commands/data/dataAdbox.json');
    var threadInf = (threadInfo.get(threadID) || await Threads.getInfo(threadID));
    const findd = threadInf.adminIDs.find(el => el.id == senderID);
    if(typeof body === 'string' && body.startsWith(PREFIX) && dataAdbox.adminbox[threadID] && !ADMINBOT.includes(senderID) && !findd && event.isGroup)
      return api.shareContact(`[ QTV ONLY ]\n────────────────────\n👤 Người dùng: ${name}\n⚠️ Chỉ Qtv nhóm mới có thể sử dụng bot\n────────────────────\n⏳ Time: ${time}`, uid, threadID, messageID);

    // -------- Banned users & threads --------
    if (userBanned.has(senderID) || threadBanned.has(threadID) || (allowInbox == false && senderID == threadID)) {
      if(!body.startsWith(threadPrefix)) return;
      if (!ADMINBOT.includes(senderID.toString())) {
        if (userBanned.has(senderID)) {
          const { reason, dateAdded } = userBanned.get(senderID) || {};
          return api.sendMessage(global.getText("handleCommand", "userBanned", reason, dateAdded), threadID, async (err, info) => {
            await new Promise(resolve => setTimeout(resolve, 15000));
            return api.unsendMessage(info.messageID);
          }, messageID);
        } else if (threadBanned.has(threadID)) {
          const { reason, dateAdded } = threadBanned.get(threadID) || {};
          return api.sendMessage(global.getText("handleCommand", "threadBanned", reason, dateAdded), threadID, async (err, info) => {
            await new Promise(resolve => setTimeout(resolve, 15000));
            return api.unsendMessage(info.messageID);
          }, messageID);
        }
      }
    }

    // -------- Prefix handling --------
    body = body || 'x';
    const [matchedPrefix] = body.match(prefixRegex) || [''];
    var args = body.slice(matchedPrefix.length).trim().split(/ +/);
    var commandName = args.shift()?.toLowerCase();

    // -------- Only prefix check --------
    if (!commandName) {
      return api.sendMessage(global.getText("handleCommand", "onlyprefix"), threadID, messageID);
    }

    // -------- Command matching --------
    let command = commands.get(commandName);

    if (!command) {
      if(!body.startsWith(threadPrefix)) return;

      const allCommandName = Array.from(commands.keys());
      const checker = stringSimilarity.findBestMatch(commandName, allCommandName);

      if(checker.bestMatch.rating >= 0.5) {
        command = commands.get(checker.bestMatch.target);
      } else {
        return api.sendMessage(global.getText("handleCommand", "commandNotExist", checker.bestMatch.target), threadID, messageID);
      }
    }

    // -------- Command permission & cooldown --------
    var permssion = 0;
    const threadInfoo = threadInfo.get(threadID) || await Threads.getInfo(threadID);
    const find = threadInfoo.adminIDs.find(el => el.id == senderID);
    if (NDH.includes(senderID)) permssion = 3;
    else if (ADMINBOT.includes(senderID)) permssion = 2;
    else if (find) permssion = 1;

    if (command.config.hasPermssion > permssion) {
      const quyenhan = command.config.hasPermssion == 1 ? "Quản Trị Viên" : command.config.hasPermssion == 2 ? "ADMIN_BOT" : "SUPPORT_BOT";
      return api.shareContact(`👤 Người dùng: ${name}\n⚠️ Bạn không có quyền sử dụng lệnh "${command.config.name}"\nQuyền hạn yêu cầu: ${quyenhan}\n⏳ Time: ${time}`, uid, threadID, messageID);
    }

    if (!client.cooldowns.has(command.config.name)) client.cooldowns.set(command.config.name, new Map());
    const timestamps = client.cooldowns.get(command.config.name);
    const expirationTime = (command.config.cooldowns || 1) * 1000;
    if (timestamps.has(senderID) && dateNow < timestamps.get(senderID) + expirationTime) {
      return api.shareContact(`[ TIME CHỜ LỆNH ]\n⚠️ Bạn vui lòng chờ ${((timestamps.get(senderID) + expirationTime - dateNow)/1000).toFixed(1)} giây trước khi dùng lại lệnh "${command.config.name}"\n⏳ Time: ${time}`, uid, threadID, messageID);
    }

    // -------- GetText helper --------
    let getText2;
    if (command.languages && typeof command.languages == 'object' && command.languages.hasOwnProperty(global.config.language)) {
      getText2 = (...values) => {
        let lang = command.languages[global.config.language][values[0]] || '';
        for (let i = values.length; i > 0; i--) {
          lang = lang.replace(new RegExp('%' + i, 'g'), values[i]);
        }
        return lang;
      };
    } else getText2 = () => {};

    // -------- Run command --------
    try {
      command.run({
        api,
        event,
        args,
        models,
        Users,
        Threads,
        Currencies,
        permssion,
        getText: getText2
      });

      timestamps.set(senderID, dateNow);

      if (DeveloperMode) {
        logger(global.getText("handleCommand", "executeCommand", time, commandName, senderID, threadID, args.join(" "), Date.now() - dateNow), "[ DEV MODE ]");
      }
      return;
    } catch (e) {
      return api.sendMessage(global.getText("handleCommand", "commandError", commandName, e), threadID);
    }
  };
};
