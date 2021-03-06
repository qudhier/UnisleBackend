$(document).ready(function () {
    var unreadInformList = null;
    var allInformList = null;
    var currentSender = null;
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
    $.ajax({
        type: "GET",
        url: "notice/getUnreadNotice",
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

            }
            unreadInformList = res.data;
        }

    });
    $.ajax({
        type: "GET",
        url: "notice/getAllNotice",
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
                alert('你还没有收到过通知哦');
            }
            allInformList = res.data;
        }

    });

    if(unreadInformList != null)
        for(var i=0;i<unreadInformList.length;i++){
            var informEntity = unreadInformList[i];
            var informer = informEntity.noticeEntityPK.sender;
            var informTime = informEntity.noticeEntityPK.gendatetime;
            var senderEntity;
            $.ajax({
                type: "GET",
                url: "friend/getDetails",
                dataType: "json",
                data: {
                    'friendid': informer
                },
                async: false,
                timeout: 5000,
                success: function (res) {
                    senderEntity = res.data;

                }
            });
            $('.inform_new_title_body').append(
                '<div class ="inform_title_container" data-sender ="'+informer+'" data-sendtime ="'+informTime+'" data-type ="'+informEntity.type+'" data-content = "'+informEntity.content+'">'+
                '<div class="title_content">'+'来自'+senderEntity.nickname+'的'+typeToName(informEntity.type)+'</div>'+
                '<div class="title_img"><img src="images/inform/infcross.ico" width="20px" height="100%"></div>'+
                '</div>'
            );


        }

    if(allInformList != null)
        for(var i=0;i<allInformList.length;i++){
            var informEntity = allInformList[i];
            var informer = informEntity.noticeEntityPK.sender;
            var informTime = informEntity.noticeEntityPK.gendatetime;
            var senderEntity;
            $.ajax({
                type: "GET",
                url: "friend/getDetails",
                dataType: "json",
                data: {
                    'friendid': informer
                },
                async: false,
                timeout: 5000,
                success: function (res) {
                    senderEntity = res.data;
                }
            });
            $('.inform_history_title_body').append(
                '<div class="inform_title_container" data-sender="'+informer+'" data-sendtime="'+informTime+'" data-type="'+informEntity.type+'" data-content ="'+informEntity.content+'">'+
                '<div class="title_content">'+'来自'+senderEntity.nickname+'的'+typeToName(informEntity.type)+'</div>'+
                '<div class="title_img"><img src="images/inform/infcross.ico" width="20px" height="100%"></div>'+
                '</div>'
            );
        }

    $('.title_content').die();
    $('.inform_new_title_body').find('.title_content').live('click',function () {
        var type = $(this).parent().attr('data-type');
        var sender = $(this).parent().attr('data-sender');
        var sendtime = $(this).parent().attr('data-sendtime');
        var sendcontent = $(this).parent().attr('data-content');
        currentSender = sender;
        $.ajax({
            type: "POST",
            url: "notice/setNoticeRead",
            dataType: "json",
            data:{
                'sender':sender,
                'sendtime':sendtime
            },
            async:true,
            timeout:5000,
            cache:false,
        });

        if(type == 'friendshipask' || type=='groupinvite') {
            var informContentHTML = '' +
                '<div class="inform_content_title">' + $(this).text() + '</div>' +
                '<div class="inform_content_content">' +
                '<p>' + sendcontent + '</p>' +
                '<div class="inform_contentBtn" id = "agree" data-type = "'+type+'" data-id ="agree_' + sendtime + '"><span>同&nbsp;意</span></div>' +
                '<div class="inform_contentBtn" id = "reject" data-type = "'+type+'" data-id = "reject_' + sendtime + '"><span>拒&nbsp;绝</span></div>' +
                '</div>';
        }else{
            var informContentHTML = '' +
                '<div class="inform_content_title">' + $(this).text() + '</div>' +
                '<div class="inform_content_content">' +
                '<p>' + sendcontent + '</p>' +
                '</div>';
        }
        $('#inform_content_id').html(informContentHTML);
        $(this).parent().remove();
    });
    $('.inform_history_title_body').find('.title_content').live('click',function () {

        var type = $(this).parent().attr('data-type');
        var sender = $(this).parent().attr('data-sender');
        var sendtime = $(this).parent().attr('data-sendtime');
        var sendcontent = $(this).parent().attr('data-content');
        currentSender = sender;

        //不用担心numnotice会-2的问题，dao层改好了，已经是已读的不会-numnotice
        $.ajax({
            type: "POST",
            url: "notice/setNoticeRead",
            dataType: "json",
            data:{
                'sender':sender,
                'sendtime':sendtime
            },
            async:true,
            timeout:5000,
            cache:false,
        });


        if(type == 'friendshipask' || type=='groupinvite') {
            var informContentHTML = '' +
                '<div class="inform_content_title">' + $(this).text() + '</div>' +
                '<div class="inform_content_content">' +
                '<p>' + sendcontent + '</p>' +
                '<div class="inform_contentBtn" id = "agree" data-type = "'+type+'" data-id ="agree_' + sendtime + '"><span>同&nbsp;意</span></div>' +
                '<div class="inform_contentBtn" id = "reject" data-type = "'+type+'" data-id = "reject_' + sendtime + '"><span>拒&nbsp;绝</span></div>' +
                '</div>';
        }else{
            var informContentHTML = '' +
                '<div class="inform_content_title">' + $(this).text() + '</div>' +
                '<div class="inform_content_content">' +
                '<p>' + sendcontent + '</p>' +
                '</div>';
        }
        $('#inform_content_id').html(informContentHTML);
    });
    $('.title_img').die();
    $('.title_img').live('click',function () {
        //删除的时候也要标为已读
        var sender = $(this).parent().attr('data-sender');
        var sendtime = $(this).parent().attr('data-sendtime');
        $.ajax({
            type: "POST",
            url: "notice/setNoticeRead",
            dataType: "json",
            data:{
                'sender':sender,
                'sendtime':sendtime
            },
            async:false,
            timeout:5000,
            cache:false,
        });
        $.ajax({
            type: "POST",
            url: "notice/deleteANotice",
            dataType: "json",
            data:{
                'sender':sender,
                'sendtime':sendtime
            },
            async:true,
            timeout:5000,
            cache:false,
        });
        $(this).parent().remove();
        window.location.href = 'home.html?load=inform';
    });
    $('.inform_contentBtn').die();
    $('.inform_contentBtn').live('click',function () {

        var accept = $(this).attr('id');
        var time = $(this).attr('data-id').split('_')[1];
        var type = $(this).attr('data-type');
        if(accept == 'agree'){
            if(type == 'friendshipask'){
                $.ajax({
                    type: "POST",
                    url: "friend/addFriend",
                    dataType: "json",
                    data:{
                        'friendid':currentSender
                    },
                    async:false,
                    timeout:5000,
                    cache:false,
                });
            }else if(type == 'groupinvite'){

            }
        }
        $.ajax({
            type: "POST",
            url: "notice/setNoticeRead",
            dataType: "json",
            data:{
                'sender':currentSender,
                'sendtime':time
            },
            async:false,
            timeout:5000,
            cache:false,
        });
        $.ajax({
            type: "POST",
            url: "notice/deleteANotice",
            dataType: "json",
            data:{
                'sender':currentSender,
                'sendtime':time
            },
            async:true,
            timeout:5000,
            cache:false,
        });
        window.location.href = 'home.html?load=inform';
    });
});