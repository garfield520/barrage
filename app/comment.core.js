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
            duration: 5,
            duration_top: 3
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
        this.rows = Math.floor(default_settings.comment_height / (default_settings.fontSize));
        
        //  Create comment box
        var commentBox = document.createElement('div');
        Object.assign(commentBox.style, {
            position: 'absolute',
            width: fSettings.comment_width + 'px',
            height: fSettings.comment_height + 'px',
            left: fSettings.comment_left + 'px',
            top: fSettings.comment_top + 'px',
            background: '#000',
            overflow: 'hidden',
            zIndex: '1'
        });
        //  Append comment box to container
        //  Default - document.body
        this.commentBox = commentBox;
        fSettings.container.appendChild(commentBox);
    }

    //  顶部/底部弹幕存储
    CommentManager.prototype.top_bottom_comment = {
        top: [],
        bottom: []
    }

    CommentManager.prototype.send = function ( comment_config ) {
        var _this = this;
        var commentObj = this._newComment(comment_config);
        var comment = commentObj.comment;
        var position = commentObj.position;
        this.commentBox.appendChild(comment);

        //  滚动弹幕
        if ( !position ) {
            this.commentArray.push(comment);
            var totalWidth = comment.offsetWidth + this.fSettings.comment_width;
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
                    comment.totalWidth = totalWidth;
                }
            });
        } else if ( position === 'top' ) {
            this.top_bottom_comment.top.push( comment );
            setTimeout(function () {
                _this.commentBox.removeChild(comment);
                _this.top_bottom_comment.top.shift();
            }, _this.fSettings.duration_top * 1000);
        }

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
                    translateX: '-'+ comment.totalWidth +'px'
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

    CommentManager.prototype.setOpacity = function ( opacity ) {
        //  已存在屏幕上弹幕透明度
        this.commentArray.map(function ( comment, index ) {
            comment.style.opacity = opacity;
        });
        //  顶部弹幕
        this.top_bottom_comment.top.map(function ( comment ) {
            comment.style.opacity = opacity;
        });
        //  底部弹幕
        this.top_bottom_comment.bottom.map(function ( comment ) {
            comment.style.opacity = opacity;
        });
        //  未插入弹幕透明度
        this.fSettings.opacity = opacity;
    }

    CommentManager.prototype.clear = function () {
        console.log( this.commentArray )
    }

    CommentManager.prototype._setComment = function () {
        
    }

    CommentManager.prototype._newComment = function ( comment_config ) {
        var position;

        //  Create a comment
        var comment = document.createElement('div');
        //  base settings
        //  透明度
        if ( this.fSettings.opacity || this.fSettings.opacity === 0 ) {
            comment.style.opacity = this.fSettings.opacity;
        }
        comment.innerText = comment_config.text;
        comment.style.color = comment_config.color;
        comment.style.fontSize = comment_config.fontSize + 'px';
        comment.style.fontWeight = 'bold';
        comment.style.fontFamily = 'SimHei, "Microsoft JhengHei", Arial, Helvetica, sans-serif';
        comment.style.textShadow = 'rgb(0, 0, 0) 1px 0px 1px, rgb(0, 0, 0) 0px 1px 1px, rgb(0, 0, 0) 0px -1px 1px, rgb(0, 0, 0) -1px 0px 1px';
        comment.style.whiteSpace = 'nowrap';

        //  滚动弹幕
        if ( !comment_config.position || comment_config.position === 'scroll' ) {
            position = '';
            comment.style.display = 'inline-block';
            comment.style.position = 'absolute';
            comment.style.left = this.fSettings.comment_width + 'px';
            comment.style.top = this.fSettings.fontSize * Math.round(this.rows * Math.random()) + 'px';
        } else if ( comment_config.position === 'top' ) {
            position = 'top';
            comment.style.display = 'block';
            comment.style.width = '100%';
            comment.style.textAlign = 'center';
        }

        return {
            comment: comment,
            position: position
        }
    }

    CommentManager.prototype.resize = function () {

    }

    return CommentManager;
})();