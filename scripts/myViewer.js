const PreviewImg = (function () {
	const DEFAULTS = {
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

	const isObject = function (value) {
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
	};

	const render = {
		render: function render() {
			this.initBody();
			this.initList();
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
            let timer = null;
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
                event.stopPropagation();

                if (event.touches.length >= 2) {
                    clearTimeout(timer);
                    return;
                }

                clearTimeout(timer);
                timer = setTimeout(function () {
                    that.close();
                    clearTimeout(timer);
                }, 250)
            }
        },
		initCanvas: function initCanvas() {
            this.$img = new Image();
            this.$img.style.transform = 'translate(0, 0)';
            fragment.appendChild(this.$img);
			this.$wrap.children[0].children[0].appendChild(fragment);
            this.dragorclick();
        },
        setImgStyle: function setImgStyle() {
            let that = this;
            let imgWidth = that.$img.offsetWidth;
            let imgHeight = that.$img.offsetHeight;
            let naturalWidth = that.$img.naturalWidth;
            let naturalHeight = that.$img.naturalHeight;
            let sw = window.screen.width;
            let wh = window.screen.height;

            if (naturalWidth <= sw && naturalHeight <= wh) {
                that.$img.style.width = 'initial';
            }
            else if (imgHeight >= imgWidth && imgHeight >= wh) {
                that.$img.style.width = 'initial';
                that.$img.style.height = `${wh / 1.15}px`;
            }
            else if (imgWidth >= sw) {
                that.$img.style.width = `${sw - 40}px`;
            }
        },
		initList: function initList() {
            let that = this;
			[].forEach.call(this.images, function (image) {
                image.onclick = function (event) {
                    event.stopPropagation();
                    that.open();
                    that.initCanvas();
                    that.loadImg(image);
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
                scaleDistance: 0,
                isScale: false,
                scale: 1,
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
                clearTimeout(handDetail.timer);

                handDetail.isScale = false;
                if (event.touches.length >= 2) {
                    let moveX = event.touches[1].clientX - event.touches[0].clientX;
                    let moveY = event.touches[1].clientY - event.touches[0].clientY;
                    handDetail.distance = Math.sqrt(moveX * moveX + moveY * moveY);
                    handDetail.isScale = true;
                    return;
                }

                handDetail.startX = event.touches[0].pageX;
                handDetail.startY = event.touches[0].pageY;
                handDetail.startTime = Date.now();
            }

            that.$img.ontouchmove = function (event) {
                event.preventDefault();
                event.stopPropagation();

                if (event.touches.length >= 2 && handDetail.isScale) {
                    let moveX = event.touches[1].clientX - event.touches[0].clientX;
                    let moveY = event.touches[1].clientY - event.touches[0].clientY;
                    let distance = Math.sqrt(moveX * moveX + moveY * moveY);
                    let distanceDiff = distance - handDetail.distance;
                    handDetail.distance = distance;
                    handDetail.scale = handDetail.scale + 0.005 * distanceDiff;
                    that.$img.style.transform = `translate(${handDetail.imgEndX}px, ${handDetail.imgEndY}px) scale(${handDetail.scale})`;
                    return;
                }
                // 防止双指离开触发单指移动
                else if (handDetail.isScale) {
                    return;
                }

                handDetail.distanceX = event.touches[0].pageX - handDetail.startX;
                handDetail.distanceY = event.touches[0].pageY - handDetail.startY;
                that.$img.style.transform = `translate(${handDetail.imgEndX + handDetail.distanceX}px, ${handDetail.imgEndY + handDetail.distanceY}px) scale(${handDetail.scale})`;
                if (Math.abs(handDetail.distanceX) >= 2 || Math.abs(handDetail.distanceX >= 2)) {
                    handDetail.isMove = true;
                }
            }

            that.$img.ontouchend = function (event) {
                event.preventDefault();
                event.stopPropagation();
                clearTimeout(handDetail.timer);

                if (handDetail.isScale) {
                    return;
                }

                handDetail.spaceTime = Date.now() - handDetail.endTime;
                handDetail.endTime = Date.now();

                // 拖动
                if (handDetail.isMove) {
                    handDetail.imgEndX += handDetail.distanceX;
                    handDetail.imgEndY += handDetail.distanceY;
                    handDetail.isMove = false;
                } 
                // 双击
                else if (handDetail.spaceTime > 0 && handDetail.spaceTime <= 250) {

                }
                // 长按
                else if (handDetail.endTime - handDetail.startTime >= 250) {

                }
                // 单击
                else {
                    handDetail.timer = setTimeout(function () {
                        that.close();
                    }, 250);
                }
            }

            const reset = function reset() {
                handDetail.imgEndX = 0;
                handDetail.imgEndY = 0;
                handDetail.isScale = false;
                that.$img.onclick = null;
                that.$img.ondblclick = null;
                that.$img.ontouchstart = null;
                that.$img.ontouchmove = null;
                that.$img.ontouchend = null;
                that.$img.onclick = null;
                that.$img.ondblclick = null;
                that.$wrap.removeEventListener('resetDrag', reset);
            }

            that.$wrap.addEventListener('resetDrag', reset);
        },
        open: function open() {
            document.body.classList.add('view-open');
            this.$wrap.children[0].classList.remove('hide');
        },
        close: function close() {
            document.body.classList.remove('view-open');
            this.$wrap.children[0].classList.add('hide');
            this.$wrap.dispatchEvent(this.resetDrag());
            this.$img.onload = null;
            this.$img.onerror = null;
            this.$img.src = '';
            this.$img.remove();
            this.$img = null;
        },
        loadImg: function loadImg(image) {
            let that = this;
            that.$img.src = image.src;
            that.$img.parentNode.classList.add('view-loading');
            that.$img.onload = function () {
                that.setImgStyle();
                that.$img.parentNode.classList.remove('view-loading');
            }
            that.$img.onerror = function () {
                throw Error(image.src + '加载失败');
            }
        }
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