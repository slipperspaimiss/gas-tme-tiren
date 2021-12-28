function debugCode(){
  debug();
}
 
function doGet(e){
  return HtmlService.createHtmlOutput("Hello World!! No, this link should be hidden!!!");
   
 //  return HtmlService.createHtmlOutputFromFile('Index');
}
 
 
function doPost(e){
  var body = JSON.parse(e.postData.contents);
  mongo.insert("logs", body);
   
  var payload = preparePayload(body);
   
  var payloads;
 
  if (Array.isArray(payload)){
    payloads = payload;
  } else {
    payloads = [payload]
  }
 
  for (var i = 0; i < payloads.length; i++){
    payload = payloads[i];
    if (payload){
      var res = postTelegram(payload);
    }
  }
 
 
}
 
function postTelegram(payload) {
  var data = {
    'contentType': 'application/json',
    "method": "post",
    "payload": JSON.stringify(payload)
  }
 
  mongo.insert("to-telegram", payload);
  var response = UrlFetchApp.fetch("https://api.telegram.org/bot5082079175:AAHTVjYyZA9mOUZbz7P1yjSr1d2Fmr4ByQk/", data);
  var res = JSON.parse(response);
  mongo.insert("telegram-response", res);
  return res;
}
 
function getName(user) {
  var name = user.first_name;
  if (user.last_name) {
    name += " " + user.last_name;
  }
 
  return name;
}
 
function escapeMarkDown(toEscapeMsg) {
  var escapedMsg = toEscapeMsg
  .replace(/_/g, "\\_")
  .replace(/\*/g, "\\*")
  .replace(/\[/g, "\\[")
  .replace(/`/g, "\\`");
    return escapedMsg;
 
}
 
 
function getMentionName(user) {
  var username = user.username;
  var mentionName = "";
 
  var name = getName(user);
  if (!name) {
    name = "神秘人";
  }
 
  
 
  return mentionName;
}
 
function getMarkDownUserUrl(userName, userId) {
  return "[" + userName + "](tg://user?id=" + userId + ")";
}
 
function getLastWelcomeMessage(){
  var regex = "欢迎加入本群";
  var regexSearch = { "$regex": regex, "$options": 'i' };
  var searchString = {"result.text": regexSearch};
   
  var q = JSON.stringify(searchString);
   
  var sortObject = {
    "result.date": -1
  };
   
  var s = JSON.stringify(sortObject);
   
  var httpQuery = "q=" + q + "&s=" + s + "&l=1";
   
  var lastWelcomeMessage = mongo.get("telegram-response", httpQuery);
  return lastWelcomeMessage;
}
 
 
function preparePayload(body){
  var payload;
   
  if (body.message) {
    body.message.chat.id = body.message.chat.id + '';
  }
   
  if (body.callback_query) {
     payload = {
        "method": "sendMessage",
        "chat_id": body.callback_query.message.chat.id,
        "text": "这是一个 callback",
        "parse_mode": "Markdown",
        "disable_web_page_preview": true,
      };
       
       
       
      if(body.callback_query.data.indexOf("/help") === 0){ 
        payload.text += ": " + body.callback_query.data;
      }
       
      if(body.callback_query.data.indexOf("nihao") === 0){ 
        payload.text = "你好";
      }
       
      if(body.callback_query.data.indexOf("update") === 0){ 
       
        payload = {
          "method": "editMessageText",
          "chat_id": body.callback_query.message.chat.id,
          "message_id": body.callback_query.message.message_id,
          "text": "",
          "parse_mode": "markdown",
          "disable_web_page_preview": false,
        };
        payload.text = "原消息被更新了";
      }
       
      return payload;
   
  }
   
  if (body.message.new_chat_member) {
     var payload2 = {
      "method": "restrictChatMember",
      "chat_id": body.message.chat.id,
      "user_id": body.message.new_chat_member.id,
      "can_send_messages": false,
      "can_send_media_messages": false,
      "can_send_other_messages": false,
      "can_add_web_page_previews": false,
    };
     
    var payload4 = {
      "method": "kickChatMember",
      "chat_id": body.message.chat.id,
      "user_id": body.message.new_chat_member.id,
    };
       
       
    var payloads = [];
     
    if (getName(body.message.new_chat_member).indexOf("广告") >= 0) {
      payloads.push(payload4);    
    }
     
     
        
    return payloads;
  }
   
  if (body.message.left_chat_member) {
     payload = {
        "method": "sendMessage",
        "chat_id": body.message.chat.id,
        "text": "你好， 欢迎加入本群",
        "parse_mode": "Markdown",
        "disable_web_page_preview": true,
      } 
       
      payload.text = getMentionName(body.message.left_chat_member) + "君, 一路走好！";
      return payload;
  }
   
   if (body.message.pinned_message) {
    payload = {
        "method": "sendMessage",
        "chat_id": body.message.chat.id,
        "text": "你好， 欢迎加入本群",
        "parse_mode": "Markdown",
        "disable_web_page_preview": true,
      } 
    var whoPinned = getName(body.message.from);
    var whoOwned = getName(body.message.pinned_message.from);
 
    payload.text = whoPinned + "置顶了消息:\n\n" + body.message.pinned_message.text
      + "\n\n"
      + "本BOT代表" + whoOwned + "感谢您"
      ;
    return payload;
  }
 
 
   
   
  if (body.message.text){
   
  //谢谢 kba977 指出这个错误
   
      var origParas = body.message.text.trim().split(" ");
      origParas = origParas.filter(function(origPara){
        if (origPara){
          return true;
        }
      });
       
      body.message.text = body.message.text.toLowerCase();
      body.message.text = body.message.text.replace(/@qunguanli1/g, '');
       
      var paras = body.message.text.trim().split(" ");
      // remove empty strings
      paras = paras.filter(function(para){
        if (para){
          return true;
        }
      });
         
   
      payload = {
        "method": "sendMessage",
        "chat_id": body.message.chat.id,
        "text": "你好， 欢迎使用本机器人， 本机器人现在只认识颜色。",
        "parse_mode": "Markdown",
        "disable_web_page_preview": true,
      } 
       
      if(body.message.text.indexOf("/removekeyboard") === 0){ 
        var replyKeyboardRemove = {
          remove_keyboard: true,
          selective: false
        };
        payload.reply_markup = replyKeyboardRemove;
        return payload;
      }
       
      if(body.message.text.indexOf("/help") === 0){ 
         var mentionName = getMentionName(body.message.from);
         payload.text = "您好！" + mentionName + "! ";
         payload.text += "欢迎使用新版部署本机器人， 本机器人现在只认识颜色。";
                  
         var command9 = [
           "/colors",
           "/list",
         ];
          
          var replyKeyboardMarkup = {};
          replyKeyboardMarkup.keyboard = [];
          replyKeyboardMarkup.resize_keyboard = false;
          replyKeyboardMarkup.one_time_keyboard = true;
          replyKeyboardMarkup.selective = true;
           
          var count = 0;
          for (var i = 0; i < command9.length / 3; i++) {
            var keyboardRow = [];
            for (var j = 0; j < 3; j++) {
              var keyboardButton = {
                text: command9[i * 3 + j],
              };
              count++;
              keyboardRow.push(keyboardButton);
              if (count >= command9.length) {
                break;
              }
               
            }
            replyKeyboardMarkup.keyboard.push(keyboardRow);
          }
          payload.reply_markup = replyKeyboardMarkup;
              
          
         return payload;
      }
       
      if(body.message.text.indexOf("/colors") === 0){   
         payload.text = "红\n黄\n蓝";        
         return payload;
      }
       
       if(body.message.text.indexOf("/searchvideo") === 0){   
         if (paras[1]){
             var videoId = origParas[1];
             var videos = videosListById('snippet,contentDetails,statistics', {'id': videoId});
             var video = videos.items[0];
             payload.text = "标题: " + video.snippet.title + "\n";
             return payload;
         }
         payload.text = "请提供视频ID";        
         return payload;
      }
       
      if(body.message.text.indexOf("/list") === 0){ 
         if (paras[1]){
           switch (paras[1].toLowerCase()){
             case "people":  
               if (paras[2]){
                 if ("JS神技能".toLowerCase().indexOf(paras[2]) >= 0){
                   payload.text = "JS神技能 - https://www.youtube.com/channel/UC6tPP3jOTKgjqfDgqMsaG4g";
                 }
                 if ("悟空的日常".toLowerCase().indexOf(paras[2]) >= 0){
                   payload.text = "悟空的日常 - https://www.youtube.com/channel/UCii04BCvYIdQvshrdNDAcww";
                 }
                 if ("YuFeng Deng".toLowerCase().indexOf(paras[2]) >= 0){
                   payload.text = "YuFeng Deng - https://www.youtube.com/channel/UCG6xoef2xU86hnrCsS5m5Cw";
                 }
               } else {                 
                 payload.text = "JS神技能\n"
                   + "悟空的日常\n"
                   + "YuFeng Deng\n";        
                   return payload;
                }
               break;
             default:  
               payload.text = "红\n黄\n蓝";            
             break;
           }
                 
           return payload;
         } else {         
           payload.text = "*JS神技能*\n"
             + "[悟空的日常](https://www.youtube.com/channel/UCii04BCvYIdQvshrdNDAcww)\n"
             + "[*YuFeng Deng*](https://www.youtube.com/channel/UCG6xoef2xU86hnrCsS5m5Cw)\n"
             + "_YuFeng Deng_\n"
             + "`01|" + "UCii04BCvYIdQvshrdNDAcww" + " | `\n"
             + "`02|" + "UCG6xoef2xU86hnrCsS5m5Cw" + " | `\n"
             + "```javascript\n"
             + 'payload = {\n'
             + '    "method": "sendMessage",\n'
             + '    "chat_id": body.message.chat.id,\n'
             + '    "text": body.message.text,\n'
             + '}'
             + "```"
             ;
                        
            var inlineKeyboardMarkup = {};
            inlineKeyboardMarkup.inline_keyboard = [];
            var keyboardRow = [];
            var keyboardButton1 = {
                text: "Help",
                callback_data: "/help"
            };
             
            var keyboardButton2 = {
                text: "按钮2",
                callback_data: "nihao"
            };
             
            var keyboardRow2 = [];
            var keyboardButton3 = {
                text: "升级原消息",
                callback_data: "update"
            };
             
            var keyboardButton4 = {
                text: "按钮4",
                url: "https://www.google.com"
            };
 
            keyboardRow.push(keyboardButton1);
            keyboardRow.push(keyboardButton2);
             
            keyboardRow2.push(keyboardButton3);
            keyboardRow2.push(keyboardButton4);
            inlineKeyboardMarkup.inline_keyboard.push(keyboardRow);
            inlineKeyboardMarkup.inline_keyboard.push(keyboardRow2);
            payload.reply_markup = inlineKeyboardMarkup;
 
        
           var payloads = [];
            
           var payload2 = {};
            
           var payloadStr = JSON.stringify(payload);
           payload2 = JSON.parse(payloadStr);
        
           payloads.push(payload);
       //    payloads.push(payload2);
        
           return payloads;
         }
      }
       
 
   
      payload = {
          "method": "sendMessage",
          "chat_id": body.message.chat.id,
          "text": body.message.text,
      } 
     
  }
  else if (body.message.sticker){
    payload = {
      "method": "sendSticker",
      "chat_id": body.message.chat.id,
      "sticker": body.message.sticker.file_id
    }
   }
  else if (body.message.photo){
    array = body.message.photo;
    text = array[1];
    payload = {
      "method": "sendPhoto",
      "chat_id": body.message.chat.id,
      "photo": text.file_id
    }
   }
    else {
    payload = {
      "method": "sendMessage",
      "chat_id": body.message.chat.id,
      "text": "Try other stuff"
    }
   }
  return payload
}