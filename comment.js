
function isObject ( obj ) {
    return Object.prototype.toString.call(obj) === '[object Object]';
}

var CommentItem = (function (){
    function CommentItem ( comment, commentBox, pos, config ) {
        this.config = config;
        this.pos = pos;
        console.log(comment);
        var commentItem = document.createElement('div');
        
        commentItem.style.position = 'absolute';
        commentBox.appendChild(commentItem);
        commentItem.innerText = comment.text;
        commentItem.style.fontSize = '24px';
        commentItem.style.width = commentItem.offsetWidth + 'px';
        commentItem.style.left = pos.w + 'px';
        commentItem.style.transition = 'transform '+ config.duration +'s linear';
        this.commentItem = commentItem;
        //  If the comment is scroll comment;
        this.scroll();
    }

    //  scroll comment
    CommentItem.prototype.scroll = function () {
        //  right 2 left
        this.commentItem.style.transform = 'translateX(-'+ (this.commentItem.offsetWidth + this.pos.w) +'px)';
    }

    /**
     * When the comment leave from comment box at left
     * remove this comment
     */
    CommentItem.prototype.clear = function () {

    }

    return CommentItem;
})();

var Comment = (function (){
    function Comment ( commentBox ) {
        //  base info of comment box
        this.pos = {
            l: commentBox.offsetLeft || 0,
            t: commentBox.offsetTop || 0,
            w: commentBox.offsetWidth || 0,
            h: commentBox.offsetHeight || 0
        }

        this.commentItemArray = [];

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
    Comment.prototype.init = function ( config ) {
        if ( isObject(config) ) {
            Object.assign(this.config, config);
        }
        var commentBox = document.createElement('div');
        commentBox.style.position = 'absolute';
        commentBox.style.left = this.pos.l + 'px';
        commentBox.style.top = this.pos.t + 'px';
        commentBox.style.width = this.pos.w + 'px';
        commentBox.style.height = this.pos.h + 'px';
        commentBox.style.overflow = 'hidden';
        //  test background color
        commentBox.style.background = 'skyblue';

        document.body.appendChild(commentBox);  
        this.commentBox = commentBox;
    }

    Comment.prototype.begin = function (){

    }

    //  send a comment
    Comment.prototype.send = function ( comment ) {
        var commentItem = new CommentItem( comment, this.commentBox, this.pos, this.config );
        this.commentItemArray.push(commentItem);
        console.log( this.commentItemArray );
    }

    return Comment;
})();
