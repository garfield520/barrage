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
            overflow: 'hidden'
        });
        //  Append comment box to container
        //  Default - document.body
        this.commentBox = commentBox;
        fSettings.container.appendChild(commentBox);
    }

    CommentManager.prototype.send = function ( comment_config ) {
        var _this = this;
        var comment = this._newComment(comment_config);
        this.commentArray.push(comment);
        this.commentBox.appendChild(comment);
        var totalWidth = this.totalWidth = comment.offsetWidth + this.fSettings.comment_width;

        //  判断弹幕形式
        
        Velocity(comment, {
            translateX: '-'+ totalWidth +'px'
        }, {
            duration: _this.fSettings.duration * 1000,
            easing: 'linear',
            complete: function () {
                _this.commentBox.removeChild(comment);
                _this.commentArray.shift();
            },
            progress: function (elements, complete, remaining, start, tweenValue) {
                comment.remaining = remaining;
            }
        });
    }

    //  弹幕状态（暂停/运行）
    CommentManager.prototype.isPaused = false;

    CommentManager.prototype.pause = function () {
        if ( !this.isPaused && this.commentArray.length != 0 ) {
            console.log('pause');
            this.isPaused = true;
            this.commentArray.map(function ( comment, index ) {          
                Velocity(comment, 'stop');
            });
        }
    }

    CommentManager.prototype.resume = function () {
        var _this = this;
        if ( this.isPaused ) {
            console.log('resume');
            this.isPaused = false;
            this.commentArray.map(function ( comment, index ) {
                Velocity(comment, {
                    translateX: '-'+ _this.totalWidth +'px'
                }, {
                    duration: comment.remaining,
                    easing: 'linear',
                    progress: function (elements, complete, remaining, start, tweenValue) {
                        comment.remaining = remaining;
                    },
                    complete: function () {
                        if ( comment ) {
                            _this.commentArray.shift();
                            _this.commentBox.removeChild(comment);
                        }
                    }
                });
            });
        }
    }

    CommentManager.prototype.clear = function () {
        console.log( this.commentArray )
    }

    CommentManager.prototype._setComment = function () {

    }

    CommentManager.prototype._newComment = function ( comment_config ) {
        //  Create a comment
        var comment = document.createElement('div');
        comment.innerText = comment_config.text;
        comment.style.color = comment_config.color;
        comment.style.fontSize = comment_config.fontSize;
        comment.style.display = 'inline-block';
        comment.style.position = 'absolute';
        comment.style.whiteSpace = 'nowrap';
        comment.style.left = this.fSettings.comment_width + 'px';
        comment.style.top = this.fSettings.fontSize * Math.round(this.rows * Math.random()) + 'px';
        
        return comment;
    }

    CommentManager.prototype.resize = function () {

    }

    return CommentManager;
})();