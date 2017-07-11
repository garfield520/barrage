/**
 * comment.core.js
 * create on 2017-7-10
 * version 0.0.2
 */

/**
 * 1、暂停
 * 2、透明度
 * 3、清除
 * 4、遮罩点击事件
 * 5、继续
 */

function isObject ( obj ) {
    return Object.prototype.toString.call( obj ) === '[object Object]';
}

var CommentManager = (function () {
    function CommentManager ( options ) {
        //  Init settings
        //  Judge if the options is a JS object, to call init function or throw Error
        if ( isObject(options) ) {
            if ( !options.comment_top || !options.comment_left || !options.comment_width || !options.comment_height ) {
                throw new Error('The position infomation of CommentBox must be transferd')
            } else {
                this.init( options );
            }
        } else {
            throw new Error('Params of CommentManager must be a JS object');
        }
    }

    //  public array of current comment to store.
    CommentManager.prototype.commentArray = [];
    //  Rows of comment box
    CommentManager.prototype.rows = 0;

    //  Init CommentManager at first time, then it can be used
    CommentManager.prototype.init = function ( options ) {
        //  default settings
        var default_settings = {
            fontSize: 18,
            color: '#ffffff',
            container: document.body,
            duration: 5
        }
        if ( options.container ) {
            options.container = document.getElementById(options.container);
        }
        //  IE8+
        Object.assign(default_settings, options);
        //  real settings of Comment
        var fSettings = default_settings;
        this.fSettings = fSettings;
        
        //  Computed real rows of comment box
        this.rows = Math.floor(default_settings.comment_height / (default_settings.fontSize + 2));
        
        //  Create comment box
        var commentBox = document.createElement('div');
        Object.assign(commentBox.style, {
            position: 'absolute',
            width: fSettings.comment_width + 'px',
            height: fSettings.comment_height + 'px',
            left: fSettings.comment_left + 'px',
            top: fSettings.comment_top + 'px',
            background: '#ccc',
            // overflow: 'hidden'
        });
        //  Append comment box to container
        //  Default - document.body
        this.commentBox = commentBox;
        fSettings.container.appendChild(commentBox);
    }

    CommentManager.prototype.send = function ( comment_config ) {
        var _this = this;
        this.comment_config = comment_config;
        var comment = this._newComment();
        this.commentBox.appendChild(comment);
        var animationStyle = document.createElement('style');
        animationStyle.innerText = `
            @keyframes name {
                from {transform:translateX(`+ 0 +`px);}
                to {transform:translateX(`+ (- this.fSettings.comment_width - comment.offsetWidth) +`px);}
            }
        `;
        this.commentArray.push(comment)
        this.commentBox.appendChild(animationStyle);
        comment.style.webkitAnimation = 'name '+ this.fSettings.duration +'s linear';
        console.log( this.commentArray )
        
        //  Add event listener to animation
        comment.addEventListener('webkitAnimationEnd', function () {
            _this.commentArray.shift();
            _this.commentBox.removeChild(comment);
        });
    }

    CommentManager.prototype.pause = function () {
        var classObj = {
            '-webkit-animation': 'none !important'
        }
        this.commentArray.map(function ( commnet, index ) {
            commnet.style.animationPlayState = 'paused';
            commnet.style.webkitAnimationPlayState = 'paused';
            commnet.style.webkitAnimationPlayState = 'none !important';
            comment.style.webkitAnimation = 'none !important';
        });
        // this.Comment.style.animationPlayState = 'paused';
        // this.Comment.style.webkitAnimationPlayState = 'paused';
        // this.Comment.style.webkitAnimationPlayState = 'none !important';
    }

    CommentManager.prototype.clear = function () {
        console.log( this.commentArray )
        // this.commentBox.innerText = '';
    }

    CommentManager.prototype._setComment = function () {

    }

    CommentManager.prototype._newComment = function () {
        var comment = document.createElement('div');
        comment.innerText = this.comment_config.text;
        var commentRows = Math.floor(Math.random() * this.rows) * this.fSettings.fontSize;
        
        Object.assign(comment.style, {
            position: 'absolute',
            // background: '#399',
            display: 'block',
            whiteSpace: 'nowrap',
            left: this.fSettings.comment_width + 'px',
            top: commentRows + 'px'
        });
        
        return comment;
    }

    CommentManager.prototype.resize = function () {

    }

    return CommentManager;
})();