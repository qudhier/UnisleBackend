$(document).ready(function(){
    //变量定义区
    var userNickname;
    var userID;
    var currentChatterID = null;
    var websocket = null;
    var friendList = null;
    var minDef = 10;
    var start = 0;
    //方法及回调方法定义区
    function searchFriendList(text) {
        if(friendList == null) {
            $('.message_card').die();
            //第一次装载好友列表时执行
            $.ajax({
                type: 'GET',
                url: 'friend/getFriend',
                dataType: 'json',
                data: {},
                timeout: 2000,
                async: false,
                success: function (res) {
                    if (res.result == 'LOGINERROR') {
                        window.reload('login.html');
                    }
                    if (res.result != 'SUCCESS') {
                        alert('获取好友列表信息失败，请刷新或重新登陆。')
                    }
                    friendList = res.data;
                    for (var i = 0; i < friendList.length; i++) {
                        var frienddata = friendList[i];
                        var friendID = frienddata.userid;
                        var friendNickname = frienddata.nickname;
                        var friendNote = frienddata.note;
                        var friendShowName;
                        if (friendNote == null)
                            friendShowName = friendNickname;
                        else
                            friendShowName = friendNote;

                        $('.message_list_content').append(
                            "<div id = '" + friendID + "' class = 'message_card' title = '"+friendShowName+"'>" +
                            "<div class='message_card_img_div'><img src='images/message/headimg.png' class='message_card_img'/></div>" +
                            "<div class='message_card_p_div'><p class='message_card_p'>" + friendShowName + "</p></div>"
                        );
                    }
                    $('.message_card').die();
                    $('.message_card').live('click', function () {
                        start = 0;
                        $('.message_my_word_div').remove();
                        $('.message_your_word_div').remove();
                        var friendid = $(this).attr('id');
                        getHistoryMessage(friendid,minDef);
                        $('.message_content').scrollTop($('.message_content').get(0).scrollHeight);
                    });
                }
            });
        }else if(text == null || text.length == 0){
            //搜索栏内容重置为空时执行
            $('.message_card').remove();
            $('.message_card').die();
            for (var i = 0; i < friendList.length; i++) {
                var frienddata = friendList[i];
                var friendID = frienddata.userid;
                var friendNickname = frienddata.nickname;
                var friendNote = frienddata.note;
                var friendShowName;
                if (friendNote == null)
                    friendShowName = friendNickname;
                else
                    friendShowName = friendNote;

                $('.message_list_content').append(
                    "<div id = '" + friendID + "' class = 'message_card' title = '"+friendShowName+"'>" +
                    "<div class='message_card_img_div'><img src='images/message/headimg.png' class='message_card_img'/></div>" +
                    "<div class='message_card_p_div'><p class='message_card_p'>" + friendShowName + "</p></div>"
                );
            }
            $('.message_card').live('click', function () {
                start = 0;
                $('.message_my_word_div').remove();
                $('.message_your_word_div').remove();
                var friendid = $(this).attr('id');
                getHistoryMessage(friendid,minDef);
                $('.message_content').scrollTop($('.message_content').get(0).scrollHeight);
            });
        }else{
            //执行搜索
            $('.message_card').remove();
            $('.message_card').die();
            for (var i = 0; i < friendList.length; i++) {
                var frienddata = friendList[i];
                var friendID = frienddata.userid;
                var friendNickname = frienddata.nickname;
                var friendNote = frienddata.note;
                var friendShowName;
                if (friendNote == null)
                    friendShowName = friendNickname;
                else
                    friendShowName = friendNote;
                //判断是否为搜索结果

                if(friendShowName.indexOf(text) < 0)
                    continue;

                $('.message_list_content').append(
                    "<div id = '" + friendID + "' class = 'message_card' title = '"+friendShowName+"'>" +
                    "<div class='message_card_img_div'><img src='images/message/headimg.png' class='message_card_img'/></div>" +
                    "<div class='message_card_p_div'><p class='message_card_p'>" + friendShowName + "</p></div>"
                );
            }
            $('.message_card').live('click', function () {
                start = 0;
                $('.message_my_word_div').remove();
                $('.message_your_word_div').remove();
                var friendid = $(this).attr('id');
                getHistoryMessage(friendid,minDef);
                $('.message_content').scrollTop($('.message_content').get(0).scrollHeight);
            });
        }
    }
    function getHistoryMessage(friendid,minnum){
        currentChatterID = friendid;
        $('#current_chat_title').text('与 '+$('#'+currentChatterID).attr('title')+' 聊天中');
        var unreadNumber;
        $.ajax({
            type: 'GET',
            url: 'chat/getUnreadMessageNumber',
            dataType: 'json',
            data: {
                'friendid': friendid
            },
            async:false,
            timeout: 2000,
            success: function (res) {
                if (res.result == 'LOGINERROR') {
                    window.reload('login.html');
                }
                if (res.result != 'SUCCESS') {
                    alert('获取消息列表失败，请刷新。')
                }
                unreadNumber = res.data;
            }
        });
        $.ajax({
            type: 'GET',
            url: 'chat/getHistoryMessage',
            dataType: 'json',
            async:false,
            data: {
                'friendid':friendid,
                'lasttime': (new Date()).valueOf(),
                'startat':start,
                'number':unreadNumber>minnum?unreadNumber:minnum
            },
            timeout: 2000,
            success: function (res) {
                if(res.result == 'LOGINERROR'){
                    window.reload('login.html');
                }
                if(res.result != 'SUCCESS'){
                    alert('获取消息列表失败，请刷新。')
                }
                var messageList = res.data;

                for(var i=0;i<messageList.length;i++){
                    var message = messageList[i];
                    if(message.chatrecordEntityPK.sender == userID)
                        $('.message_content').prepend(
                            "<div id = '"+message.chatrecordEntityPK.senddatedtime+
                            "' class='message_my_word_div'><p>"+message.content+"</p></div>"
                        );
                    else
                        $('.message_content').prepend(
                            "<div id = '"+message.chatrecordEntityPK.senddatedtime+
                            "' class='message_your_word_div'><p>"+message.content+"</p></div>"
                        );

                    $.ajax({
                        type: 'POST',
                        url: 'chat/setMessageRead',
                        dataType: 'json',
                        data: {
                            'friendid':friendid,
                            'sendtime':message.chatrecordEntityPK.senddatedtime
                        },
                        timeout: 2000
                    });
                }
            }
        });
        start = start+(unreadNumber>minnum?unreadNumber:minnum);//必须加括号
    }
    $('#message_btn').die();
    $('#message_btn').live('click',function () {
        var text = $('#message_input').val();
        if(text.length == 0)
            return;
        var currenttime = (new Date()).valueOf();
        var sendJson = JSON.stringify({
            'askcode': '100',
            'senderid':userID,
            'receiverid':currentChatterID,
            'content':text,
            'senddatetime':currenttime
        });
        websocket.send(sendJson);

        $('.message_content').append(
            "<div id = '"+currenttime+
            "' class='message_my_word_div'><p>"+text+"</p></div>"
        );
        $('.message_content').scrollTop($('.message_content').get(0).scrollHeight);
        $('#message_input').val("");
    });
    $('#findreceiver_input').die();
    $('#findreceiver_input').live('change',function () {
        var searchText = $('#findreceiver_input').val();
        searchFriendList(searchText);
    });
    $('.message_content').scroll(function () {

        var scrolltop = $(this).scrollTop();
        //注意没有滚动条的时候scrolltop也为0
        if(scrolltop == 0)
            return;
        if(scrolltop <= 20 ) {
            getHistoryMessage(currentChatterID, minDef);

            $(this).scrollTop(100+200*minDef/(start+minDef));
        }
    })
    //跳转到其他页面时，需要关闭消息页面的websocket
    /*
     $('#contentLoadContainer').on = function () {
     var sendJson = JSON.stringify({
     'askcode': '999',
     'userid':userID
     });
     websocket.send(sendJson);
     websocket.close();
     };
     */
    //初始化执行区
    $.ajax({
        type: "GET",
        url: "self",
        dataType: "json",
        data:{},
        async:false,
        timeout:5000,
        cache:false,
        success: function (res) {
            if(res.result == 'LOGINERROR'){
                window.reload('login.html');
            }
            if(res.result != 'SUCCESS'){
                alert('获取用户个人信息失败，请刷新或重新登陆。')
            }
            var userdata = res.data;
            userID = userdata.userid;
            userNickname = userdata.nickname;
        }

    });
    searchFriendList(null);
    if(friendList != null)
        getHistoryMessage(friendList[0].userid,minDef);
    //$('#'+friendList[0]).click();

    $('.message_content').scrollTop($('.message_content').get(0).scrollHeight);
    if('WebSocket' in window){

        var projectPath = document.URL.split('home')[0].split('http://')[1];
        //var projectPath = 'localhost:8080/';
        websocket = new WebSocket("ws://"+projectPath+"websocket");

        websocket.onopen = function () {
            messageUserid = userID;
            messageSocket = websocket;
            messageSocketOpen = true;
            var sendJson = JSON.stringify({
                'askcode': '000',
                'userid':userID
            });
            websocket.send(sendJson);
        };
        websocket.onclose = function () {
            messageSocketOpen = false;
            var sendJson = JSON.stringify({
                'askcode': '999',
                'userid':userID
            });
            websocket.send(sendJson);
        };
        websocket.onerror = function () {
            messageSocketOpen = false;
            var sendJson = JSON.stringify({
                'askcode': '999',
                'userid':userID
            });
            websocket.send(sendJson);
        };
        websocket.onmessage = function (event) {
            var returnJson = JSON.parse(event.data);
            if(returnJson.returncode == '102'){
                var senderid = returnJson.senderid;
                var sendtime = returnJson.sendtime;
                var content = returnJson.content;
                if(senderid = currentChatterID){
                    $('.message_content').append(
                        "<div id = '"+sendtime+
                        "' class='message_your_word_div'><p>"+content+"</p></div>"
                    );
                    $('.message_content').scrollTop($('.message_content').get(0).scrollHeight);
                    $.ajax({
                        type: 'POST',
                        url: 'chat/setMessageRead',
                        dataType: 'json',
                        data: {
                            'friendid':senderid,
                            'sendtime':sendtime
                        },
                        timeout: 2000
                    });
                }
            }
        }

    }else{
        alert("你的浏览器不支持websocket,不能使用聊天功能。");
    }

});