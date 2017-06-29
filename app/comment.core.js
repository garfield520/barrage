
/**
 * 1、时间轴
 * 2、屏幕滚动
 */


var BinArray = (function (){
    var BinArray = {}

    BinArray.bseach = function ( arr, what, how ) {
        if ( !Array.isArray(arr) ){
            throw new Error('Bsearch can only be run on arrays');
        }
        if( arr.length === 0 ){
            return 0;
        }
        if( how(what, arr[0]) < 0 ){
            return 0;
        }
        if( how(what, arr[arr.length - 1]) >= 0 ){
            return arr.length;
        }

        var
            low = 0,
            i = 0,
            count = 0,
            high = arr.length - 1;
        while ( low <= high ) {
            i = Math.floor((high + low + 1)/2);
            count++;
            if ( how(what, arr[i - 1]) >= 0 && how(what, arr[i]) < 0 ) {
                return i;
            } else if ( hwo(what, arr[i - 1]) < 0 ) {
                high = i - 1;
            } else if ( how(what, arr[i]) >= 0 ) {
                low = i;
            } else {
                throw new Error('Program Error, Inconsistent comparator or unsorted array')
            }
            if ( count > 1500 ) {
                throw new Error('Iteration depth exceeded, Inconsistent comparator or astronomical dataset')
            }
        }
        return -1;
    }

    BinArray.binsert = function ( arr, what, how ) {
        var index = BinArray.bseach(arr, what, how)
        arr.splice(index, 0, what)
        return index;
    }

    return BinArray;
})();

/**
 * util tool functions
 */
var CommentUtils;
(function ( CommentUtils ){
    // console.log(CommentUtils);
})( CommentUtils || (CommentUtils = {}) );

var __extends = ( this && this.__extends ) || function ( d, b ) {
    for ( var p in b ) {
        if ( b.hasOwnProperty(p) ) {
            d[p] = b[p]
        }
    }
    function __ () {
        this.constructor = d
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var CoreComment = (function (){
    /**
     * 基本属性配置
     * @param {*} parent 
     * @param {*} init 
     */
    function CoreComment ( parent, init ) {
        if ( init === void 0 ) {
            init = {}
        }
        this.mode         = 1;
        this.stime        = 0;
        this.text         = '';
        this.ttl          = 4000;
        this.dur          = 4000;
        this.cindex       = -1;
        this.motion       = [];
        this.movable      = true;
        this._alphaMotion = null;
        this.absolute     = true;
        this.align        = 0;
        this.axis         = 0;
        this._alpha       = 1;
        this._size        = 25;
        this._color       = 0xffffff;
        this._shadow      = true;
        this._font        = '';
        this._transform   = null;
        
        if ( !parent ) {
            throw new Error('Comment not bound to comment manager')
        } else {
            this.parent = parent;
        }

        if ( init.hasOwnProperty('stime') ) {
            this.stime = init['stime']
        }
        if ( init.hasOwnProperty('mode') ) {
            this.mode = init['mode']
        } else {
            this.mode = 1
        }
        if ( init.hasOwnProperty('dur') ) {
            this.stime = init['dur']
            this.ttl = this.dur;
        }
        this.dur *= this.parent.options.global.scale;
        this.ttl *= this.parent.options.global.scale;

        if (init.hasOwnProperty('text')) {
            this.text = init['text'];
        }
        if ( init.hasOwnProperty('motion') ) {
            this._motionStart = [];
            this.motionEnd = [];
            this.motion = init['motion'];
            var head = 0;
            for ( var i = 0; i < init['motion'].length; i++ ) {
                this._motionStart.push(head);
                var maxDur = 0;
                for ( var k in init['motion'][i] ) {
                    var m = init['motion'][i][k];
                    maxDur = Math.max(m.dur, maxDur);
                    if ( m.easing === null || m.easing === undefined ) {
                        init['motion'][i][k]['easing'] = CoreComment.LINEAR;
                    }
                }
                head += maxDur;
                this._motionEnd.push(head);
            }
            this._curMotion = 0;
        }
        if (init.hasOwnProperty('color')) {
            this._color = init['color'];
        }
        if (init.hasOwnProperty('size')) {
            this._size = init['size'];
        }
        if (init.hasOwnProperty("border")) {
            this._border = init["border"];
        }
        if (init.hasOwnProperty("opacity")) {
            this._alpha = init["opacity"];
        }
        if (init.hasOwnProperty("alpha")) {
            this._alphaMotion = init["alpha"];
        }
        if (init.hasOwnProperty("font")) {
            this._font = init["font"];
        }
        if (init.hasOwnProperty("x")) {
            this._x = init["x"];
        }
        if (init.hasOwnProperty("y")) {
            this._y = init["y"];
        }
        if (init.hasOwnProperty("shadow")) {
            this._shadow = init["shadow"];
        }
        if (init.hasOwnProperty("align")) {
            this.align = init["align"];
        }
        if (init.hasOwnProperty('axis')) {
            this.axis = init['axis'];
        }
        if (init.hasOwnProperty('transform')) {
            this._transform = new CommentUtils.Matrix3D(init['transform']);
        }
        if (init.hasOwnProperty('position')) {
            if (init['position'] === 'relative') {
                this.absolute = false;
                if (this.mode < 7) {
                    console.warn('Using relative position for CSA comment.');
                }
            }
        }
    }

    /**
     * 初始化方法 inint
     */
    CoreComment.prototype.init = function ( recycle ) {
        if ( recycle === void 0 ) {
            recycle = null
        }
        if ( recycle !== null ) {
            this.dom = recycle.dom
        } else {
            this.dom = document.createElement('div')
        }

        this.dom.className = this.parent.options.global.className;
        this.dom.appendChild(document.createTextNode(this.text));
        this.dom.textContent = this.text;
        this.dom.innerText = this.text;
        this.size = this._size;
        if (this._color != 0xffffff) {
            this.color = this._color;
        }
        this.shadow = this._shadow;
        if (this._border) {
            this.border = this._border;
        }
        if (this._font !== '') {
            this.font = this._font;
        }
        if (this._x !== undefined) {
            this.x = this._x;
        }
        if (this._y !== undefined) {
            this.y = this._y;
        }
        if (this._alpha !== 1 || this.parent.options.global.opacity < 1) {
            this.alpha = this._alpha;
        }
        if (this._transform !== null && !this._transform.isIdentity()) {
            this.transform = this._transform.flatArray;
        }
        if (this.motion.length > 0) {
            this.animate();
        }
    }

    Object.defineProperty(CoreComment.prototype, 'x', {
       get: function () {
           if ( this._x === null || this._x === undefined ) {
               if ( this.axis % 2 === 0 ) {
                   this._x = this.dom.offsetLeft
               } else {
                   this._x = this.dom.offsetLeft + this.width
               }
           }
       } 
    });
})();