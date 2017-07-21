//  suport IE10+
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

        //  opacity
        // console.log(config.opacity);
        if ( config.opacity || config.opacity === 0 ) {
            comment.style.opacity = parseFloat(config.opacity);
        }
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

        //  When the comment leave from comment box at left
        //  remove this commnet
        this.Comment.addEventListener('webkitAnimationEnd', function (){
            _this.commentBox.removeChild(_this.Comment);
            _this.commentBox.removeChild(_this.animationStyle);
            
            //  remove comment from comment array
            _this.commentArray.map(function ( comment, index ){
                if ( comment.time === _this.commentTime ) {
                    _this.commentArray.splice(index, 1);
                }
            });
        });
    }

    Comment.prototype.remove = function () {
        var _this = this;
        this.commentBox.removeChild(this.Comment);
        this.commentBox.removeChild(this.animationStyle);
    }

    Comment.prototype.pause = function (){
        console.log('paused');
        this.Comment.style.animationPlayState = 'paused';
        this.Comment.style.webkitAnimationPlayState = 'paused';
        this.Comment.style.webkitAnimationPlayState = 'none !important';
    }

    Comment.prototype.resume = function (){
        console.log('resume');
        this.Comment.style.animationPlayState = 'running';
        this.Comment.style.webkitAnimationPlayState = 'running';
    }

    //  set property of comment
    Comment.prototype.setOpacity = function ( opacity ) {
        this.Comment.style.opacity = parseFloat(opacity);
    }

    return Comment;
})();

var CommentManager = (function (){
    function CommentManager ( commentBox ) {
        //  base info of comment box
        if ( commentBox ) {
            this.pos = {
                l: commentBox.offsetLeft   || 0,
                t: commentBox.offsetTop    || 0,
                w: commentBox.offsetWidth  || 0,
                h: commentBox.offsetHeight || 0
            }
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
        if ( this.pos ){
            commentBox.style.left     = this.pos.l + 'px';
            commentBox.style.top      = this.pos.t + 'px';
            commentBox.style.width    = this.pos.w + 'px';
            commentBox.style.height   = this.pos.h + 'px';
        } else {
            commentBox.style.left     = config.left + 'px';
            commentBox.style.top      = config.top + 'px';
            commentBox.style.width    = config.width + 'px';
            commentBox.style.height   = config.height + 'px';
            this.pos = {
                l: config.left || 0,
                t: config.top || 0,
                w: config.width || 0,
                h: config.height || 0
            }
        }
        commentBox.style.overflow = 'hidden';

        document.body.appendChild(commentBox);  
        this.commentBox = commentBox;

        //  computed rows of comment
        var rows = Math.floor(commentBox.offsetHeight/config.fontSize);
        this.rows = rows;
    }

    CommentManager.prototype.begin = function (){

    }

    CommentManager.prototype.resize = function (){

    }
	
	CommentManager.prototype.distroy = function () {
		
	}

    //  send a comment
    CommentManager.prototype.send = function ( commentInfo ) {
        // var comment = new Comment( commentInfo, this.commentBox, this.pos, this.config );
        var commentTime = new Date().getTime();
        var commentConfig = {
            commentInfo: commentInfo,
            commentBox: this.commentBox,
            pos: this.pos,
            config: this.config,
            rows: this.rows,
            commentTime: commentTime,
            commentArray: this.CommentArray
        }
        
        if ( this.opacity || parseInt(this.opacity) == 0 ) {
            commentConfig.opacity = this.opacity;
        }
        var comment = new Comment(commentConfig);
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

    CommentManager.prototype.clean = function (){
        this.CommentArray.map(function ( commentInfo ){
            commentInfo.comment.remove();
        });
        this.CommentArray = [];
    }

    //  set opacity of the comment
    CommentManager.prototype.opacity = function ( opacity ){
        //  change opacity of the comment well appear
        this.opacity = opacity;
        //  change opacity of current comment
        this.CommentArray.map(function ( commentInfo ){
            commentInfo.comment.setOpacity( opacity );
        });
    }

    CommentManager.prototype.shadowEvent = function ( event, fn ){
        this.commentBox.addEventListener(event, function ( event ){ fn( event ) });
    }

    return CommentManager;
})();
