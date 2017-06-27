//  suport IE9+ chrome firefox safari oprea
function isObject ( obj ) {
    return Object.prototype.toString.call(obj) === '[object Object]';
}

var Comment = (function (){
    function Comment ( commentInfo, commentBox, pos, config ) {
        this.config      = config;
        this.pos         = pos;
        this.commentBox  = commentBox;
        
        var comment  = document.createElement('div');
        this.Comment = comment;
        comment.style.position = 'absolute';
        commentBox.appendChild(comment);

        comment.innerText = commentInfo.text;
        comment.style.fontSize = '18px';
        comment.style.color = '#fff';
        comment.style.width = comment.offsetWidth + 'px';
        //  每个格间距
        comment.style.top = 20 * Math.floor(Math.random() * 17) + 'px';
        
        var animationStyle = document.createElement('style');
        this.animationStyle = animationStyle;
        animationStyle.innerHTML = `
            @keyframes commentScroll
                {
                    from {transform:translateX(`+ pos.w +`px);}
                    to {transform:translateX(`+ (-comment.offsetWidth) +`px);}
                }
                @-webkit-keyframes commentScroll /* Safari and Chrome */
                {
                    from {transform:translateX(`+ pos.w +`px);}
                    to {transform:translateX(`+ (-comment.offsetWidth) +`px);}
                }
        `;
        commentBox.appendChild(animationStyle);
        //  If the comment is scroll comment;
        this.scroll();
    }

    //  scroll comment
    Comment.prototype.scroll = function () {
        //  right 2 left
        var _this = this;
        this.Comment.style.webkitAnimation = 'commentScroll '+ _this.config.duration +'s linear';

        //  When the comment leave from comment box at left
        //  rmove this commnet
        this.Comment.addEventListener('webkitAnimationEnd', function (){
            _this.commentBox.removeChild(_this.Comment);
            _this.commentBox.removeChild(_this.animationStyle);
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
            fontSize: 1,
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
        var rows = Math.ceil(this.pos.h/config.fontSize);
        console.log(rows);
    }

    CommentManager.prototype.begin = function (){

    }

    //  send a comment
    CommentManager.prototype.send = function ( commentInfo ) {
        var comment = new Comment( commentInfo, this.commentBox, this.pos, this.config );
        this.CommentArray.push(comment);
        console.log( this.CommentArray );
    }

    CommentManager.prototype.pause = function (){
        this.CommentArray.map(function ( comment ){
            comment.pause();
        });
    }

    CommentManager.prototype.resume = function (){
        this.CommentArray.map(function ( comment ){
            comment.resume();
        });
    }

    return CommentManager;
})();
