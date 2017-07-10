/**
 * comment.core.js
 * create on 2017-7-10
 * version 0.0.2
 */

function isObject ( obj ) {
    return Object.prototype.toString.call( obj ) === '[object Object]';
}

var Comment = (function () {
    function Comment ( public_config, comment_config ) {
        this.public_config = public_config;
        this.comment_config = comment_config;
        
        console.log(comment_config)
        var comment = document.createElement('div');
        comment.innerText = comment_config.text;

        Object.assign(comment.style, {
            fontSize: comment_config.fontSize + 'px',
            color: comment_config.color
        })
        return this;
    }

    Comment.prototype.init = function () {
        console.log( this.public_config );
    }

    return Comment;
})();

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
            container: document.body
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
        var comment_config = {
            rows: this.rows
        }
    }

    CommentManager.prototype.send = function ( comment_config ) {
        // console.log(comment_config);
        this.comment_config = comment_config
        var public_config = {
            rows: this.rows,
            commentBox: this.commentBox
        }
        // var comment = new Comment(public_config, comment_config);
        this._newComment();
    }

    CommentManager.prototype._newComment = function () {
        var comment = document.createElement('div');
        comment.innerText = this.comment_config.text;
        
        Object.assign(comment.style, {
            position: 'absolute',
            background: '#399',
            display: 'block',
            whiteSpace: 'nowrap'
        });
        //  test
        this.commentBox.appendChild(comment);
        comment.style.left = this.fSettings.comment_width + 'px';
    }

    CommentManager.prototype.resize = function () {

    }

    return CommentManager;
})();