//  suport IE9+ chrome firefox safari oprea
function isObject ( obj ) {
    return Object.prototype.toString.call(obj) === '[object Object]';
}

var Comment = (function (){
    function Comment ( config ) {
        //  commentInfo, commentBox, pos, config 
        this.config       = config.config;
        this.pos          = config.pos;
        this.commentBox   = config.commentBox;
        this.commentTime  = config.commentTime;
        this.commentInfo  = config.commentInfo;
        this.rows         = config.rows;
        this.commentArray = config.commentArray;
        
        var comment  = document.createElement('div');
        this.Comment = comment;
        comment.style.wordBreak = 'keep-all';
        comment.style.display = 'block';
        comment.style.whiteSpace = 'nowrap';
        comment.style.position = 'absolute';
        this.commentBox.appendChild(comment);

        comment.innerText = config.commentInfo.text;
        comment.style.fontSize = this.commentInfo.fontSize + 'px';
        comment.style.color = this.commentInfo.color;
        comment.style.width = comment.offsetWidth + 'px';
        //  gap of every comment
        comment.style.top = this.config.fontSize * Math.floor(Math.random() * this.rows) + 'px';
        
        var animationStyle = document.createElement('style');
        this.animationStyle = animationStyle;
        //  A sigle animation name
        this.animationName = 'commentScroll' + new Date().getTime();
        animationStyle.innerHTML = `
            @keyframes `+ this.animationName +`
                {
                    from {transform:translateX(`+ this.pos.w +`px);}
                    to {transform:translateX(`+ (-comment.offsetWidth) +`px);}
                }
                @-webkit-keyframes commentScroll /* Safari and Chrome */
                {
                    from {transform:translateX(`+ this.pos.w +`px);}
                    to {transform:translateX(`+ (-comment.offsetWidth) +`px);}
                }
        `;
        this.commentBox.appendChild(animationStyle);
        //  If the comment is scroll comment;
        this.scroll();
    }

    //  scroll comment
    Comment.prototype.scroll = function () {
        //  right 2 left
        var _this = this;
        this.Comment.style.webkitAnimation = this.animationName + ' ' + _this.config.duration +'s linear';

        //  When the comment leave from comment box ast left
        //  rmove this commnet
        this.Comment.addEventListener('webkitAnimationEnd', function (){
            _this.commentBox.removeChild(_this.Comment);
            _this.commentBox.removeChild(_this.animationStyle);
            
            //  remove comment from comment array
            _this.commentArray.map(function ( comment, index ){
                if ( comment.time === _this.commentTime ) {
                    _this.commentArray.splice(index, 1);
                }
            });
            console.log(_this.commentArray);
        });
    }

    Comment.prototype.pause = function (){
        console.log('paused');
        this.Comment.style.animationPlayState = 'paused';
        this.Comment.style.webkitAnimationPlayState = 'paused';
    }

    Comment.prototype.resume = function (){
        console.log('resume');
        this.Comment.style.animationPlayState = 'running';
        this.Comment.style.webkitAnimationPlayState = 'running';
    }

    return Comment;
})();

var CommentManager = (function (){
    function CommentManager ( commentBox ) {
        //  base info of comment box
        this.pos = {
            l: commentBox.offsetLeft || 0,
            t: commentBox.offsetTop || 0,
            w: commentBox.offsetWidth || 0,
            h: commentBox.offsetHeight || 0
        }

        this.CommentArray = [];

        //  comment default config
        this.config = {
            fontSize: 20,
            color: '#fff',
            duration : '5'
        }
    }

    /**
     * commnet init fn
     */
    CommentManager.prototype.init = function ( config ) {
        if ( isObject(config) ) {
            Object.assign(this.config, config);
        }
        var commentBox = document.createElement('div');
        commentBox.style.position = 'absolute';
        commentBox.style.left     = this.pos.l + 'px';
        commentBox.style.top      = this.pos.t + 'px';
        commentBox.style.width    = this.pos.w + 'px';
        commentBox.style.height   = this.pos.h + 'px';
        commentBox.style.overflow = 'hidden';
        //  test background color
        // commentBox.style.background = 'skyblue';

        document.body.appendChild(commentBox);  
        this.commentBox = commentBox;

        //  computed rows of comment
        var rows = Math.floor(this.pos.h/config.fontSize);
        this.rows = rows;
    }

    CommentManager.prototype.begin = function (){

    }

    //  send a comment
    CommentManager.prototype.send = function ( commentInfo ) {
        // var comment = new Comment( commentInfo, this.commentBox, this.pos, this.config );
        var commentTime = new Date().getTime();
        var comment = new Comment({
            commentInfo: commentInfo,
            commentBox: this.commentBox,
            pos: this.pos,
            config: this.config,
            rows: this.rows,
            commentTime: commentTime,
            commentArray: this.CommentArray
        });
        this.CommentArray.push({
            comment: comment,
            time: commentTime
        });
    }

    CommentManager.prototype.pause = function (){
        this.CommentArray.map(function ( commentInfo ){
            commentInfo.comment.pause();
        });
    }

    CommentManager.prototype.resume = function (){
        this.CommentArray.map(function ( commentInfo ){
            commentInfo.comment.resume();
        });
    }

    CommentManager.prototype.shadowEvent = function ( event, fn ){
        this.commentBox.addEventListener(event, function (){
            fn()
        });
    }

    return CommentManager;
})();
