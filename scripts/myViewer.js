const PreviewImg = (function () {
	let DEFAULTS = {
		element: '#id',
		toolbar: false,
		container: '.js-view-container',
	};

    const fragment = document.createDocumentFragment();

	const TEMPLATE =
		`` +
		`<div class="view-container hide">
            <div class="view-canvas"></div>
            <div class="view-footer">
                <div class="view-title"></div>
                <div class="view-tool"></div>
                <div class="view-navbar"></div>
            </div>
            <div class="js-close view-close">x</div>
        </div>`;

	function isObject(value) {
		return typeof value === 'object' && value !== null;
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

            that.$wrap.onclick = function (event) {
                event.preventDefault();
                that.close();
            }

            that.$wrap.ontouchstart = function (event) {
                event.preventDefault();
                that.close();
            }
        },
		initCanvas: function initCanvas() {
            this.$img = document.createElement('img');
            this.$img.style.transform = 'translate(0, 0)';
            fragment.appendChild(this.$img);
			this.$wrap.children[0].children[0].appendChild(fragment);
            this.dragorclick();
        },
		initList: function initList() {
            let that = this;
			[].forEach.call(this.images, function (img) {
                img.onclick = function (event) {
                    event.stopPropagation();
                    that.open();
                    that.$img.src = img.src;

                    let $canvas = that.$img.parentNode;
                    let imgHeight = that.$img.offsetHeight;

                    if (imgHeight >= window.screen.height) {
                        $canvas.classList.add('vertical');
                        $canvas.classList.remove('horizontal');
                    }
                    else {
                        $canvas.classList.add('horizontal');
                        $canvas.classList.remove('vertical');
                    }
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
                isMove: false,
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
                console.log(handDetail.imgEndX)
                console.log(handDetail.imgEndY)

                event.preventDefault();
                event.stopPropagation();
                handDetail.startX = event.touches[0].pageX;
                handDetail.startY = event.touches[0].pageY;
                handDetail.startTime = Date.now();
            }

            that.$img.ontouchmove = function (event) {
                clearTimeout(handDetail.timer);
                handDetail.isMove = true;
                handDetail.distanceX = event.touches[0].pageX - handDetail.startX;
                handDetail.distanceY = event.touches[0].pageY - handDetail.startY;
                that.$img.style.transform = `translate(${handDetail.imgEndX + handDetail.distanceX}px, ${handDetail.imgEndY + handDetail.distanceY}px)`;
            }

            that.$img.ontouchend = function () {
                handDetail.spaceTime = Date.now() - handDetail.endTime;
                handDetail.endTime = Date.now();
                clearTimeout(handDetail.timer);
                handDetail.timer = setTimeout(function () {
                    that.close();
                }, 250);
                
                // 拖动
                if (handDetail.isMove) {
                    handDetail.imgEndX += handDetail.distanceX;
                    handDetail.imgEndY += handDetail.distanceY;
                    handDetail.isMove = false;
                    clearTimeout(handDetail.timer);
                } 
                // 双击
                else if (handDetail.spaceTime > 0 && handDetail.spaceTime <= 250) {
                    clearTimeout(handDetail.timer);
                }
                // 长按
                else if (handDetail.endTime - handDetail.startTime >= 250) {
                    clearTimeout(handDetail.timer);
                }
                // 单击
                else {
                    handDetail.imgEndX = 0;
                    handDetail.imgEndY = 0;
                }
            }

            that.$wrap.addEventListener('resetDrag', function () {
                handDetail.imgEndX = 0;
                handDetail.imgEndY = 0;
            });
        },
        open: function open() {
            document.body.classList.add('view-open');
            this.$wrap.children[0].classList.remove('hide');
        },
        close: function close() {
            document.body.classList.remove('view-open');
            this.$wrap.dispatchEvent(this.resetDrag());
            this.$wrap.children[0].classList.add('hide');
            this.$img.style.transform = 'translate(0, 0)';
            this.$img.parentNode.classList.remove('vertical', 'horizontal');
        },
    }

    const events = {
        resetDrag: function resetDrag() {
            return new CustomEvent('resetDrag');
        }
    }

	Viewer.prototype.debug = function () {
		console.error('debug');
	};

	assign(Viewer.prototype, render, methods, events);
	return Viewer;
})();