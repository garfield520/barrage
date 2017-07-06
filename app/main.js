window.onload = function () {
    var video = $('video');
    var allComments;

    var width = video.offsetWidth;
    var height = video.offsetHeight - 30;

    var isPlaying = false;

    var ws = new WebSocket('ws://localhost:3000');
    // var ws = new WebSocket('ws://192.168.31.248:3000');
    var position = {
        top: '',
        rows: ''
    }

    ws.onopen = function (){
        console.info('connection build successful');
    }

    ws.onmessage = function ( res ) {
        if ( res.data ) {
            var data = JSON.parse(res.data);
            if ( Array.isArray(data) ) {
                allComments = data;
                console.log(data);
            } else {
                cm.send(data);
            }
        }
    }

    video.onseeked = function (){
        cm.clean();
    }

    //  检测当前视频播放进度
    function nowTime () {
        var time = null;
        video.ontimeupdate = function (){
            var currentTime = Math.round(video.currentTime);
            $('duration').innerHTML = currentTime + '/' + Math.round(video.duration);
            if ( time !== currentTime && Array.isArray(allComments) ) {
                time = currentTime;
                for ( var i = 0; i < allComments.length; i++ ) {
                    if ( currentTime == allComments[i].time ) {
                        cm.send(allComments[i]);
                    }
                }
            }
        }
    }

    var cm = new CommentManager();
    cm.init({
        fontSize: 24,
        color: 'yellow',
        duration: '5',
        left: video.offsetLeft,
        top: video.offsetTop,
        width: width,
        height: height
    });

    cm.shadowEvent('click', function (){
        if ( isPlaying ) {
            cm.pause();
            video.pause();
            isPlaying = false;
        } else {
            video.play();
            nowTime();
            cm.resume();
            isPlaying = true;
        }
    });

    $('opacityValue').onchange = function () {
        var value = parseInt(this.value)/ 100;
        cm.setStyles( value );
    }

    $('send').onclick = function () {
        
        var comment_color = ['red', 'blue', 'yellow', 'green', 'orange', 'white'][Math.floor(Math.random()*6)]
        var fontSize = 24;
        var currentTime = $('video').currentTime;

        var comment_text;
        if ( $('commentInput').value ) {
            comment_text = $('commentInput').value;
        } else {
            comment_text = [
                '前方高能预警',
                '请非战斗人员撤离',
                '前方臀控',
                '说XX福利出来，我不打死你',
                '说XXX的憋走，带我一个',
                '这是一个有味道的视频',
                '这是一个有味道的视频或隔着屏幕我都闻到了味道',
                '看得我尴尬症都犯了',
                '隔壁XXX过来的',
                '打卡',
                '这不科学',
                '如果XXX就是神作了',
                '6666',
                '233333333333',
                'XXX俺嫁或者XXX嫁我和XXX是我的或除了XXX都给你或XXX是我的或XXX在我床',
                '请收下我（一年份）的膝盖或给跪了'
            ][Math.floor(Math.random()*16)]
        }
        
        var data = {
            fontSize:fontSize,
            text: comment_text,
            color: comment_color,
            time: Math.round(currentTime)
        }

        cm.send(data);
        wsSend(data);
    }

    function wsSend ( data ) {
        ws.send(JSON.stringify(data));
    }

    function $ ( id ) {
        return document.getElementById(id);
    }
}