var mongo;
var restheart = {};
var restheartUrl = "http://www.edgyyds.store:4343/";
 
restheart.insert = function(collection, data) {
    var db = restheartUrl + collection;
    var option = getInsertOption(data);
    var response = UrlFetchApp.fetch(db, option);
};
 
function testRestHeart(){
  //   restheart.replace("to-telegram18", null, {desc: "record all message send to telegram chat"});
    //  restheart.replace("telegram-response", null, {desc: "record all message
  //  return from telegram"});
    //  restheart.replace("logs", null, {desc: "record some other logs"});
// var data = {test: 'test999999uugyhju666uukkkkkkklooooooooko'};
// restheart.insert("logs", data);
 
    //  var data = {test: 'test replace'};
    //  restheart.replace("testColl/5c75be5e294610d3cbaa39f9", null, data);
 
    //  var data = {test: 'test get'};
    //  restheart.get("testColl/5c75be5e294610d3cbaa39f9", null, data);
    //
    //  var data = {test: 'test set'};
    //  restheart.set("testColl/5c75be5e294610d3cbaa39f9", null, data);
 
 
    //  var data = {"$addToSet":{"array" : "bar2"}};
    //  restheart.setOne("testColl/5c75be5e294610d3cbaa39f9", data);
}
 
restheart.replace = function(collection, query, data) {
    var db = restheartUrl + collection;
    if (query){
        db += "?" + query;
    }
    var option = getPutOption(data);
    var url = encodeURI(db);
    UrlFetchApp.fetch(url, option);
};
 
restheart.setOne = function(urlWithId, data) {
    var db = restheartUrl + urlWithId;
    var option = getPatchOption(data);
    option.muteHttpExceptions = true;
    var url = encodeURI(db);
    var response = UrlFetchApp.fetch(encodeURI(db), option);
}
 
restheart.setMany = function(collection, query, data) {
    var db = restheartUrl + collection;
    if (query){
        db += "/*?" + query;
    }
    var option = getPatchOption(data);
    var url = encodeURI(db);
    UrlFetchApp.fetch(url, option);
}
 
restheart.set = restheart.setMany;
restheart.remove = function(collection, query) {
    var db = restheartUrl + collection;
    if (query){
        db += "/*?" + query;
    }
    var option = getDeleteOption();
    var url = encodeURI(db);
    UrlFetchApp.fetch(url, option);
}
 
restheart.get = function(collection, query) {
    var db = restheartUrl + collection;
 
    if (query){
        db += "?" + query;
    }
 
    var option = getGetOption();
    var response = UrlFetchApp.fetch(encodeURI(db), option);
 
    var contentText = response.getContentText();
    var responseString = JSON.stringify(response);
 
    var  object = JSON.parse(response);
    return  object;
}
 
mongo = restheart;
 
 
 
function getInsertOption(data){
    var option = {
        "method": "post",
        'contentType': 'application/json',
        'headers': {"Authorization": "Basic " + Utilities.base64Encode('admin'
                + ":" + 'secret')},
        "muteHttpExceptions": true,
        "payload": JSON.stringify(data)
    };
    return option;
}
function getDeleteOption(){
    var option = {
        "method": "delete",
        'contentType': 'application/json',
        'headers': {"Authorization": "Basic " + Utilities.base64Encode('admin'
                + ":" + 'secret')},
    };
    return option;
}
function getPutOption(data){
    var option = {
        "method": "put",
        'contentType': 'application/json',
        'headers': {"Authorization": "Basic " + Utilities.base64Encode('admin'
                + ":" + 'secret')},
        "payload": JSON.stringify(data)
    };
    return option;
}
function getPatchOption(data){
    var option = {
        "method": "patch",
        'contentType': 'application/json',
        'headers': {"Authorization": "Basic " + Utilities.base64Encode('admin'
                + ":" + 'secret')},
        "payload": JSON.stringify(data)
    };
    return option;
}
function getGetOption(){
    var option = {
        "method": "get",
        'headers': {"Authorization": "Basic " + Utilities.base64Encode('admin'
                + ":" + 'secret')},
    };
    return option;
}
