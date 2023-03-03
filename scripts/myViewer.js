const PreviewImg = (function () {
	let DEFAULTS = {
		element: '#id',
		toolbar: false,
		container: '.js-view-container',
		className: '',
	};

    let fragment = document.createDocumentFragment();

	const TEMPLATE =
		`` +
		`<div class="view-container hide">
            <div class="view-canvas"></div>
            <div class="view-footer">
                <div class="view-title"><div>
                <div class="view-tool"><div>
                <div class="view-navbar"><div>
            </div>
            <div class="js-close view-close">x</div>
        </div>`;

	function getImageNameFromURL(url) {
		// 获取图名
		return Object.prototype.toString.call(url)
			? decodeURIComponent(
					url.replace(/^.*\//, '').replace(/[?&#].*$/, '')
			  )
			: '';
	}

    function getPointersCenter(pointers) {
        var pageX = 0;
        var pageY = 0;
        var count = 0;
        [].forEach.call(pointers, function (_ref3) {
            var startX = _ref3.startX,
                startY = _ref3.startY;
                pageX += startX;
                pageY += startY;
                count += 1;
        });
        pageX /= count;
        pageY /= count;

        return {
            pageX: pageX,
            pageY: pageY
        };
    }

	function isFunction(value) {
		return typeof value === 'function';
	}

	function isObject(value) {
		return typeof value === 'object' && value !== null;
	}

	function isString(value) {
		return typeof value === 'string';
	}

	const assign =
		Object.assign ||
		function assign(obj) {
			// 人工浅拷贝
			for (
				var _len = arguments.length,
					args = new Array(_len > 1 ? _len - 1 : 0),
					_key = 1;
				_key < _len;
				_key++
			) {
				args[_key - 1] = arguments[_key];
			}
			if (isObject(obj) && args.length > 0) {
				args.forEach(function (arg) {
					if (isObject(arg)) {
						Object.keys(arg).forEach(function (key) {
							obj[key] = arg[key];
						});
					}
				});
			}
			return obj;
		};

	const Viewer = function (options) {
		this.options = assign(DEFAULTS, options);
		this.ele = document.querySelector(this.options.element);
		this.images = this.ele.querySelectorAll('img');
		this.$wrap,
        this.$img,
        this.$close = null;

		this.render();
		console.log(this.options);
		console.log('====end====');
	};

	const render = {
		render: function render() {
			this.initBody();
			this.initList();
            this.initCanvas();
            this.initClose();
		},
		initBody: function initBody() {
			let div = document.createElement('div');
			div.classList.add('js-view-container');
			div.innerHTML = TEMPLATE;
			fragment.appendChild(div);
			document.body.appendChild(fragment);
            this.$wrap = document.querySelector(this.options.container);
		},
        initClose: function initClose() {
            let that = this;
            this.$close = this.$wrap.querySelector('.js-close');
            this.$close.onclick = function () {
                that.close();
            }

            that.$wrap.onclick = function () {
                that.close();
            }

            that.$wrap.ontouchstart = function () {
                that.close();
            }
        },
		initCanvas: function initCanvas() {
            let $canvas = this.$wrap.querySelector('.view-canvas');
            this.$img = document.createElement('img');
            // this.$img.style.transformOrigin = '50% 1%';
            fragment.appendChild(this.$img);
			$canvas.appendChild(fragment);
            this.dragorclick();
        },
		initList: function initList() {
            let that = this;
			[].forEach.call(this.images, function (img) {
				console.log(img);
                img.onclick = function (event) {
                    event.stopPropagation();
                    that.open();
                    that.$img.src = img.src;
                }
			});
		},
	};

    const methods = {
        dragorclick: function dragorclick() {
            let that = this;
            let handDetail = {
                startX: 0,
                startY: 0,
                imgEndX: 0,
                imgEndY: 0,
                startTime: 0,
                endTime: 0,
                spaceTime: 0,
                distanceX: 0,
                distanceY: 0,
                timer: null,
            }

            that.$img.onclick = function (event) {
                event.stopPropagation();
                clearTimeout(handDetail.timer);
                handDetail.timer = setTimeout(function () {
                    that.close();
                }, 250);
            }

            that.$img.ondblclick = function (event) {
                event.stopPropagation();
                clearTimeout(handDetail.timer);
            }

            that.$img.ontouchstart = function (event) {
                event.preventDefault();
                event.stopPropagation();
                handDetail.startX = event.touches[0].pageX;
                handDetail.startY = event.touches[0].pageY;
                handDetail.startTime = Date.now();
            }

            that.$img.ontouchmove = function (event) {
                clearTimeout(handDetail.timer);
                handDetail.distanceX = event.touches[0].pageX - handDetail.startX;
                handDetail.distanceY = event.touches[0].pageY - handDetail.startY;

                console.log(handDetail.imgEndX, handDetail.distanceX)

                that.$img.style.transform = `translate(${handDetail.imgEndX + handDetail.distanceX}px, ${handDetail.imgEndY + handDetail.distanceY}px)`;
            }

            that.$img.ontouchend = function (event) {
                handDetail.imgEndX = event.changedTouches[0].pageX + handDetail.distanceX;
                handDetail.imgEndY = event.changedTouches[0].pageY + handDetail.distanceY;
                handDetail.spaceTime = Date.now() - handDetail.endTime;
                handDetail.endTime = Date.now();
                clearTimeout(handDetail.timer);
                handDetail.timer = setTimeout(function () {
                    that.close();
                }, 250);

                // 双击
                if (handDetail.spaceTime > 0 && handDetail.spaceTime <= 250) {
                    clearTimeout(handDetail.timer);
                }
                // 长按
                else if (handDetail.endTime - handDetail.startTime >= 250) {
                    clearTimeout(handDetail.timer);
                }
            }
        },
        moveTo: function moveTo(event) {
            handDetail.startX = event.touches[0].pageX;
            handDetail.startY = event.touches[0].pageY;
        },
        open: function open() {
            document.body.classList.add('view-open');
            this.$wrap.children[0].classList.remove('hide');
        },
        close: function close() {
            document.body.classList.remove('view-open');
            this.$wrap.children[0].classList.add('hide');
        },
    }

	const others = {
		getImageURL: function getImageURL(image) {
			var url = this.options.url;
			if (isString(url)) {
				url = image.getAttribute(url);
			} 
            else if (isFunction(url)) {
				url = url.call(this, image);
			} 
            else {
				url = '';
			}
			return url;
		},
	};

	Viewer.prototype.debug = function () {
		console.error('没交水费');
	};

	assign(Viewer.prototype, render, methods, others);
	return Viewer;
})();


