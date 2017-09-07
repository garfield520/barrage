/**
 * comment.core.js
 * Create on 2017-7-10
 * version 0.0.2
 * 
 * 功能：
 * 1、暂停
 * 2、透明度
 * 3、清除
 * 4、遮罩点击事件
 * 5、继续
 * 6、顶部弹幕
 */

(function ( global, factory ) {
    typeof exports === 'object' && typeof module !== 'undefined' ?
            module.exports = factory() :
            typeof define === 'function' && define.amd ?
            define(factory) :
            (global.cm = factory());
})( this, function () {
    function _extend (obj1, obj2) {
        for ( var attr in obj2 ) {
            obj1[attr] = obj2[attr];
        }
    }

    function isObject ( obj ) {
        return Object.prototype.toString.call( obj ) === '[object Object]';
    }
    
    var rAF = (function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            // If all else fails, use setTimeout.
            function (callback) {
                // Shoot for 60 fps
                return window.setTimeout(callback, 1000 / 60);
            };
    })();

    var cancelrAF = (function () {
        return window.cancelAnimationFrame ||
            window.webkitCancelAnimationFrame ||
            window.mozCancelAnimationFrame ||
            window.oCancelAnimationFrame ||
            function (id) {
                window.clearTimeout(id);
            };
    })();

    /**
     * Core animation engine
     * @param {Node} elem 
     * @param {Number} toDestance 
     * @param {JS Object} config 
     */
    function animate ( elem, toDestance, config ) {
        var isFirstTime     = true,
            totalTime       = config.duration,
            directive       = '',
            startTime       = 0,
            timeInterval    = 0,
            lastTime        = 0,
            step            = 0,
            totalDistance   = 0,
            currentPosition = 0,
            passedDistance  = 0,
            passedTime      = 0;
        
        var currentTransform = getComputedStyle(elem).transform;
        
        if ( currentTransform == 'none' ) {
            totalDistance = parseFloat(toDestance);
        } else {
            currentPosition = parseFloat(currentTransform.substring(10, currentTransform.length - 1).split(',')[3]);
            totalDistance = parseFloat(toDestance) - currentPosition;
        }
        
        if ( totalDistance <= 0 ) {
            directive = '-';
        }

        function _loop ( t ) {
            if ( isFirstTime ) {
                startTime = lastTime = t;
                isFirstTime = false;
                rAF( _loop );
            } else {
                timeInterval = t - lastTime;
                lastTime = t;
                
                step = totalDistance / totalTime * timeInterval;
                
                currentPosition += step;
                passedDistance += step;
                passedTime = t - startTime;
                elem.style.transform = 'translateX(' + currentPosition + 'px)';

                if ( config.progress ) {
                    config.progress( passedTime );
                }

                if ( Math.abs(passedDistance) < Math.abs(totalDistance) ) {
                    elem.timerId = rAF(_loop)
                } else {
                    currentPosition = totalDistance;
                    elem.style.transform = 'translateX(' + toDestance + 'px)';
                    config.complete && config.complete();
                }
            }
        }
        rAF( _loop );
    }

    var CommentManager = (function () {
        function CommentManager ( options ) {
            /**
             * Init settings
             * Judge if the options is a JS object, to call init function or throw Error
             */
            if ( isObject(options) ) {
                if ( options.comment_top === undefined || options.comment_left === undefined || !options.comment_width || !options.comment_height ) {
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

            //  Set default container as comment box if there is no user config
            if ( options.container ) {
                options.container = document.getElementById(options.container);
            }
            
            //  Support IE8+
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
                background: 'transparent',
                overflow: 'hidden',
                zIndex: '99999999'
            });
            
            /**
             * Append comment box to container
             * Default - document.body
             */
            this.commentBox = commentBox;
            fSettings.container.appendChild(commentBox);
        }

        //  Array of top and bottom comment
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

            //  srcroll comment
            if ( !position ) {
                this.commentArray.push(comment);
                var totalWidth = comment.offsetWidth + this.fSettings.comment_width;

                var endPosition = comment.endPosition = -totalWidth;
                var duration = this.fSettings.duration * 1000;
                comment.totalTime = duration;
                animate(comment, endPosition, {
                    duration: duration,
                    progress: function ( _passedTime, _passedDistance ) {
                        comment.passedTime = _passedTime;
                    },
                    complete: function () {
                        _this.commentBox.removeChild(comment);
                        _this.commentArray.shift();
                        console.log('Animation ended');
                    }
                });
            } else if ( position === 'top' ) {
                this.top_bottom_comment.top.push( comment );
                comment.currentTime = new Date().getTime();
                comment.timer = setTimeout(function () {
                    _this._removeTopComment(_this, comment);
                }, _this.fSettings.duration_top * 1000);
            }
        }

        CommentManager.prototype._removeTopComment = function ( _this, comment ) {
            _this.commentBox.removeChild(comment);
            _this.top_bottom_comment.top.shift();
        }

        //  State of comment(run/pause)
        CommentManager.prototype.isPaused = false;

        CommentManager.prototype.pause = function () {
            this.isPaused || (function () {
                //  Handle time of top comment
                if ( this.top_bottom_comment.top && this.top_bottom_comment.top.length != 0 ) {
                    var currentTime = new Date().getTime();
                    var topDurantion = this.fSettings.duration_top;
                    this.top_bottom_comment.top.map(function ( comment, index ) {
                        //  Clear comment time out timer
                        clearTimeout(comment.timer);
                        //  Recode remaining time of comment
                        comment.remainTime = topDurantion * 1000 - ((currentTime - comment.currentTime));
                    });
                }
                //  Handle pause event of scroll comment
                if ( !this.isPaused && this.commentArray.length != 0 ) {
                    this.commentArray.map(function ( comment, index ) {
                        cancelrAF(comment.timerId);
                    });
                }
                this.isPaused = true;
            }).call( this );
        }

        //  Resume comment
        CommentManager.prototype.resume = function () {
            var _this = this;
            if ( this.isPaused ) {
                this.isPaused = false;
                //  Resume top comment time out
                if ( this.top_bottom_comment.top && this.top_bottom_comment.top.length != 0 ) {
                    this.top_bottom_comment.top.map(function ( comment, index ) {
                        //  Remaining time of current comment
                        comment.timer = setTimeout(function () {
                            _this._removeTopComment(_this, comment);
                        }, comment.remainTime);
                    });
                }
                this.commentArray.map(function ( comment, index ) {
                    comment.totalTime = comment.totalTime - comment.passedTime;
                    animate(comment, comment.endPosition, {
                        duration: comment.totalTime,
                        progress: function ( _passedTime, _passedDistance ) {
                            comment.passedTime = _passedTime;
                        },
                        complete: function () {
                            _this.commentBox.removeChild(comment);
                            _this.commentArray.shift();
                        }
                    });
                });
            }
        }

        CommentManager.prototype.setOpacity = function ( opacity ) {
            //  Handle opacity of comment
            [
                this.commentArray,
                this.top_bottom_comment.top,
                this.top_bottom_comment.bottom
            ].map(function ( cmtArr ) {
                cmtArr.map(function ( comment ) {
                    comment.style.opacity = opacity;
                });
            });
            //  Opacity of comment to be append later
            this.fSettings.opacity = opacity;
        }

        CommentManager.prototype.clear = function () {
            //  Clear all comments in screen.
            this.commentArray = [];
            this.top_bottom_comment.top = [];
            this.top_bottom_comment.bottom = [];
            this.commentBox.innerHTML = '';
        }
        
        CommentManager.prototype._newComment = function ( comment_config ) {
            var position;

            /**
             * Create a comment and set base styles
             * Opacity
             */
            var comment = document.createElement('div');
            if ( this.fSettings.opacity || this.fSettings.opacity === 0 ) {
                comment.style.opacity = this.fSettings.opacity;
            }
            comment.innerText = comment_config.text;
            _extend(comment.style, {
                color: comment_config.color,
                fontSize: comment_config.fontSize + 'px',
                fontWeight: 'bold',
                fontFamily: 'SimHei, "Microsoft JhengHei", Arial, Helvetica, sans-serif',
                textShadow: 'rgb(0, 0, 0) 1px 0px 1px, rgb(0, 0, 0) 0px 1px 1px, rgb(0, 0, 0) 0px -1px 1px, rgb(0, 0, 0) -1px 0px 1px0',
                whiteSpace: 'nowrap'
            });

            //  Scroll comment
            if ( !comment_config.position || comment_config.position === 'scroll' ) {
                position = '';
                _extend(comment.style, {
                    display: 'inline-block',
                    position: 'absolute',
                    left: this.fSettings.comment_width + 'px',
                    top: this.fSettings.fontSize * Math.round(this.rows * Math.random()) + 'px'
                });
            } else if ( comment_config.position === 'top' ) {
                position = 'top';
                _extend(comment.style, {
                    display: 'block',
                    width: '100%',
                    textAlign: 'center'
                });
            }
            
            return {
                comment: comment,
                position: position
            }
        }

        CommentManager.prototype.resize = function () {}

        //  Destory the comment manager.
        CommentManager.prototype.destory = function () {

        }

        CommentManager.prototype.cmtEvent = function ( eventName, callback ) {
            this.commentBox.addEventListener(eventName, function ( e ) {
                callback( e );
            });
        }

        return CommentManager;
    })();

    window.CommentManager = CommentManager;
    
    return CommentManager;
});

