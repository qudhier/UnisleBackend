var innerURL = 'activity.html';
var forumFirst = true;
var firstSearch = true;
var messageSocketOpen = false;
var messageSocket = null;
var messageUserid = null;
var onActivity = true;
function typeToName(type){
    var name = '';

    if (type == ("friendshipask"))
        name = '好友申请';
    else if (type == ("groupinvite"))
        name = '组织邀请';
    else if (type == ("articlecommented"))
        name = '文章评论通知';
    else if (type == ("activitycommented"))
        name = '动态评论通知';
    else if (type == ("activityproed"))
        name = '点赞通知';
    else if (type == ("activityforwarded"))
        name = '动态转发通知';
    else if (type == ("addedtoblicklist"))
        name = '拉黑通知';
    else if (type == ("friendshipdeleted"))
        name = '删除好友通知';

    return name;
}
function simURLReplace(trueURL) {
    //在跳转的时候，如果第二次跳入相同的页面，所有子元素事件都会被重复绑定
    //所以最好跳转的时候刷新整个页面，然后重新加载跳转到的页面
    //如果离开的是message界面，应当关闭message页面内部的websocket
    if(messageSocketOpen && messageSocket!=null) {
        var sendJson = JSON.stringify({
            'askcode': '999',
            'userid':messageUserid
        });
        messageSocket.send(sendJson);
        messageSocket.close();
    }
    $("#contentLoadContainer").html('');
    innerURL = trueURL;
    var pureURL;
    if (innerURL.indexOf('?') > 0)
        pureURL = innerURL.split('?')[0];
    else
        pureURL = innerURL;
    selfRst = $.ajax({url: pureURL, async: false});
    $("#contentLoadContainer").html(selfRst.responseText);
}
$(document).ready(function () {
    var userid;
    var currentPath;
    $.ajax({
        type: "GET",
        url: "self",
        dataType: "json",
        data: {},
        async: false,
        timeout: 5000,
        cache: false,
        success: function (res) {
            if (res.result == 'LOGINERROR') {
                window.reload('login.html');
            }
            if (res.result != 'SUCCESS') {
                alert('获取用户个人信息失败，请刷新或重新登陆。')
            }
            var userdata = res.data;
            userid = userdata.userid;
        }

    });
    {
        function navHover() {
            $(".navFormat").hover(function () {
                $(this).css("background-image", "url(images/home/icon/" + $(this).attr('id') + "_hover.png)");
                $(this).find("img").attr('src', "images/home/icon/" + $(this).attr('id') + "Img_hover.png");
            }, function () {
                $(this).css("background-image", "url(images/home/icon/" + $(this).attr('id') + ".png)");
                $(this).find("img").attr('src', "images/home/icon/" + $(this).attr('id') + "Img.png");
            })
        }

        function toDefault() {
            $("#activity").css("background-image", "url(images/home/icon/activity.png)");
            $("#relation").css("background-image", "url(images/home/icon/relation.png)");
            $("#forum").css("background-image", "url(images/home/icon/forum.png)");
            $("#message").css("background-image", "url(images/home/icon/message.png)");
            $("#inform").css("background-image", "url(images/home/icon/inform.png)");
            $("#self").css("background-image", "url(images/home/icon/self.png)");
        }

        function prependNotice(ntitle, ncontent) {
            //alert($('#hiddenMessage.behindDiv').attr('class'));
            if(ncontent.length>30){
                var temp = ncontent.substr(0,25)+'...';
                ncontent = temp;
            }

            $($('.behindDiv'),'#hiddenMessage').prepend(
                '<div class="messageCard">' +
                '<div class="messageTitle"><span>' + ntitle + '</span></div>' +
                '<div class="middleHr"></div>' +
                '<div class="messageBody"><span>' + ncontent + '</span></div>' +
                ' </div>'
            );

        }


        $(".navFormat").click(function () {
            var pagename = $(this).attr('id');
            //currentPath = $(this).attr('id');
            $(".navFormat").unbind('mouseenter').unbind('mouseleave');
            //simURLReplace(pagename);
            toDefault();
            $(this).css("background-image", "url(images/home/icon/" + $(this).attr('id') + "_on.png)").find("img").attr('src', "images/home/icon/" + $(this).attr('id') + "Img.png");
            navHover();
            $(this).unbind('mouseenter').unbind('mouseleave');
            window.location.href = 'home.html?load='+pagename;
        })

        $("#nav_searchImg").click(function () {
            //$(".navFormat").unbind('mouseenter').unbind('mouseleave');
            navHover();
            //toDefault();
            if($("#nav_search_input").val()!= null && $("#nav_search_input").val().length>0)
                simURLReplace("search.html?aim="+$("#nav_search_input").val());
            else
                simURLReplace("search.html");
            onActivity = false;
        });

        $("#nav_search_input").keydown(function (e) {
            if (e.keyCode == 13) {
                //$(".navFormat").unbind('mouseenter').unbind('mouseleave');
                navHover();
                //toDefault();
                if($("#nav_search_input").val()!= null && $("#nav_search_input").val().length>0)
                    simURLReplace("search.html?aim="+$("#nav_search_input").val());
                else
                    simURLReplace("search.html");
                onActivity = false;
            }
        });

        $("#floatMessage").click(function () {
            $("#hiddenMessage").slideToggle(300);
        });
    }//对按钮进行制作遮罩效果以及导航栏点击事件绑定

    {
        var loadName = null;

        if(window.location.href.indexOf('?') < 0)
            loadName = "activity";
        else{
            loadName = window.location.href.split('?')[1].split('=')[1];
        }
        currentPath = loadName;
        simURLReplace(loadName+'.html');
        navHover();
        /*
         $(".navFormat").hover(function () {
         $('#'+loadName).css("background-image", "url(images/home/icon/" + $('#'+loadName).attr('id') + "_hover.png)");
         $('#'+loadName).find("img").attr('src', "images/home/icon/" + $('#'+loadName).attr('id') + "Img_hover.png");
         }, function () {
         $('#'+loadName).css("background-image", "url(images/home/icon/" + $('#'+loadName).attr('id') + ".png)");
         $('#'+loadName).find("img").attr('src', "images/home/icon/" + $('#'+loadName).attr('id') + "Img.png");
         });*/
        $("#"+loadName).css("background-image", "url(images/home/icon/" + loadName + "_on.png)").find("img").attr('src', "images/home/icon/" + loadName + "Img.png");
        $("#"+loadName).unbind('mouseenter').unbind('mouseleave');
    }//初始加载
    if(currentPath == 'activity'){
        var unreadMessageSource = null;
        var unreadNoticeNumber = 0;
        $.ajax({
            type: "GET",
            url: "notice/getUnreadNumber",
            dataType: "json",
            data: {},
            async: false,
            timeout: 5000,
            cache: false,
            success: function (res) {
                if (res.result == 'LOGINERROR') {
                    window.reload('login.html');
                }
                if (res.result != 'SUCCESS') {
                    alert('未读通知数目读取错误。')
                }
                unreadNoticeNumber = res.data;
            }
        });
        $.ajax({
            type: "GET",
            url: "chat/getUnreadMessageSender",
            dataType: "json",
            data: {},
            async: false,
            timeout: 5000,
            cache: false,
            success: function (res) {
                if (res.result == 'LOGINERROR') {
                    window.reload('login.html');
                }
                if (res.result != 'SUCCESS') {
                    alert('未读消息来源读取错误。')
                }
                unreadMessageSource = res.data;
            }
        });
        //var msgWarn = '';
        var haveOfflineNotice = false;
        if(unreadNoticeNumber>0) {
            haveOfflineNotice = true;
            prependNotice('未读通知提醒', '你有' + unreadNoticeNumber + '条未读通知，请进入通知页面查看。');
        }  //msgWarn += '你有'+unreadNoticeNumber+'条未读通知，请进入通知页面查看。'
        var sourceString = '';
        if(unreadMessageSource!=null && unreadMessageSource.length>0)
            for(var i=0;i<unreadMessageSource.length;i++){
                var senderData = null;
                $.ajax({
                    type: 'GET',
                    url: 'friend/getDetails',
                    dataType: 'json',
                    data: {'friendid': unreadMessageSource[i]},
                    timeout: 2000,
                    async: false,
                    success: function (res) {
                        if (res.result == 'LOGINERROR') {
                            window.reload('login.html');
                        }
                        if (res.result != 'SUCCESS') {
                            alert('获取通知信息失败');
                        }
                        senderData = res.data;
                    }
                });
                if (senderData == null)
                    continue;
                var senderShowname = null;

                if (typeof senderData.note != 'string' || senderData.note == null)
                    senderShowname = senderData.nickname;
                else
                    senderShowname = senderData.note;
                sourceString += senderShowname+'、';
            }
        if(sourceString.length >0){
            var nameString = sourceString.substr(0,sourceString.length-1);
            haveOfflineNotice = true;
            prependNotice('未读消息提醒','你有来自'+nameString+'的未读消息，请进入消息页面查看。');
            //msgWarn += '你有来自'+nameString+'的未读消息，请进入消息页面查看。'
        }
        if(haveOfflineNotice) {
            //$('#hiddenMessage').text(msgWarn);
            $("#hiddenMessage").slideToggle(300);
            setTimeout(function () {
                $("#hiddenMessage").slideToggle(300);
            }, 5000)
        }
    }//弹出离线时收到的通知和消息数目和提醒

    if ('WebSocket' in window) {
        var projectPath = document.URL.split('home')[0].split('http://')[1];

        websocket = new WebSocket("ws://" + projectPath + "websocket");
        websocket.onopen = function () {
            var sendJson = JSON.stringify({
                'askcode': '000',
                'userid': userid
            });
            websocket.send(sendJson);
        };
        websocket.onclose = function () {
            var sendJson = JSON.stringify({
                'askcode': '999',
                'userid': userid
            });
            websocket.send(sendJson);
        };
        websocket.onerror = function () {
            var sendJson = JSON.stringify({
                'askcode': '999',
                'userid': userid
            });
            websocket.send(sendJson);
        };
        websocket.onmessage = function (event) {
            var returnJson = JSON.parse(event.data);
            if (returnJson.returncode == '102') {
                if (currentPath == 'message')//消息页面不弹新消息，通知页面不弹新通知
                    return;

                var senderid = returnJson.senderid;
                var sendtime = returnJson.sendtime;
                var content = returnJson.content;
                var senderData = null;
                $.ajax({
                    type: 'GET',
                    url: 'friend/getDetails',
                    dataType: 'json',
                    data: {'friendid': senderid},
                    timeout: 2000,
                    async: false,
                    success: function (res) {
                        if (res.result == 'LOGINERROR') {
                            window.reload('login.html');
                        }
                        if (res.result != 'SUCCESS') {
                            alert('获取通知信息失败');
                        }
                        senderData = res.data;
                    }
                });
                if (senderData == null)
                    return;
                var senderShowname = null;

                if (typeof senderData.note != 'string' || senderData.note == null)
                    senderShowname = senderData.nickname;
                else
                    senderShowname = senderData.note;
                //var msgWarn = senderShowname + '给您发来了一条消息:' + content;
                prependNotice('来自'+senderShowname+'的新消息',content);

                //$('#hiddenMessage').text(msgWarn);
                $("#hiddenMessage").slideToggle(300);
                setTimeout(function () {
                    $("#hiddenMessage").slideToggle(300);
                }, 3000)
            }else if(returnJson.returncode == '200'){

                if(currentPath == 'inform')
                    return;

                var senderid = returnJson.senderid;
                var noticetype = returnJson.noticetype;
                var sendtime = returnJson.sendtime;
                var content = returnJson.content;
                var senderData = null;

                $.ajax({
                    type: 'GET',
                    url: 'friend/getDetails',
                    dataType: 'json',
                    data: {'friendid': senderid},
                    timeout: 2000,
                    async: false,
                    success: function (res) {
                        if (res.result == 'LOGINERROR') {
                            window.reload('login.html');
                        }
                        if (res.result != 'SUCCESS') {
                            alert('获取通知信息失败');
                        }
                        senderData = res.data;
                    }
                });

                if (senderData == null)
                    return;
                var senderShowname = null;

                if (typeof senderData.note != 'string' || senderData.note == null)
                    senderShowname = senderData.nickname;
                else
                    senderShowname = senderData.note;
                //var msgWarn ='你有新的通知, 来自'+ senderShowname + '的'+typeToName(noticetype)+':' + content+',请进入通知页面查看';
                prependNotice('来自'+ senderShowname + '的'+typeToName(noticetype),content);
                //$('#hiddenMessage').text(msgWarn);
                $("#hiddenMessage").slideToggle(300);
                setTimeout(function () {
                    $("#hiddenMessage").slideToggle(300);
                }, 3000)
            }
        }

    } else {
        alert("你的浏览器不支持websocket,不能使用推送功能。");
    }
    window.onbeforeunload = function () {
        var sendJson = JSON.stringify({
            'askcode': '999',
            'userid': userid
        });
        websocket.send(sendJson);
        websocket.close();
    };

    $('#signoutContainer').click(function () {
        var sendJson = JSON.stringify({
            'askcode': '999',
            'userid': userid
        });
        websocket.send(sendJson);
        websocket.close();
        $.ajax({
            type: "GET",
            url: "logout",
            dataType: "json",
            data: {},
            timeout: 5000,
            cache: false
        });
        window.location.replace('login.html');
    });
});