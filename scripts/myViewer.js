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

            that.$wrap.onclick = function (event) {
                that.close();
            }

            that.$wrap.ontouchstart = function () {
                that.close();
            }
        },
		initCanvas: function initCanvas() {
            let that = this;
            this.$img = document.createElement('img');
            let $canvas = this.$wrap.querySelector('.view-canvas');
			fragment.appendChild(this.$img);
			$canvas.appendChild(fragment);
            that.dragorclick();
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
            let pos = {
                startX: 0,
                startY: 0,
                moveEndX: 0,
                moveEndY: 0,
                startTime: 0,
                endTime: 0,
                distanceX: 0,
                distanceY: 0,
                imgX: 0,
                imgY: 0,
                timer: null,
                isRecord: false
            }
            const darg = new CustomEvent('darg');

            that.$img.onclick = function (event) {
                event.stopPropagation();
                clearTimeout(pos.timer);
                pos.timer = setTimeout(function () {
                    that.close();
                }, 250);
            }

            that.$img.ondblclick = function (event) {
                event.stopPropagation();
                clearTimeout(pos.timer);
            }

            that.$img.addEventListener('darg', () => {
                
                that.$img.ontouchstart = function (event) {
                    // event.preventDefault();
                    // event.stopPropagation();

                    console.log(111)
                    
                    pos.startTime = new Date().getTime();
                    pos.startX = event.touches[0].pageX;
                    pos.startY = event.touches[0].pageY;
                }
    
                that.$img.ontouchmove = function (event) {
                    // event.preventDefault();
                    // event.stopPropagation();

                    pos.distanceX = event.touches[0].pageX - pos.startX;
                    pos.distanceY = event.touches[0].pageY - pos.startY;
    
                    that.$img.style.transform = `translate(${pos.distanceX}px, ${pos.distanceY}px)`;
                }
    
                that.$img.ontouchend = function (event) {
                    // event.preventDefault();
                    // event.stopPropagation();

                    pos.endTime = new Date().getTime();

                    console.log(pos.endTime)
                    console.log(pos.startTime)

                    if (pos.endTime - pos.startTime  < 250) {
                        pos.endTime = 0;
                        pos.startTime  = 0;
                        that.close();
                    } 
                }
            });
    
            that.$img.addEventListener('touchstart', (event) => {
                // event.preventDefault();
                // event.stopPropagation();

                if (event.target !== that.$img) {
                    return;
                }

                that.$img.dispatchEvent(darg);
            });
        },
        open: function open() {
            document.body.classList.add('view-open');
            this.$wrap.children[0].classList.remove('hide');
        },
        close: function close() {
            document.body.classList.remove('view-open');
            this.$wrap.children[0].classList.add('hide');
        }
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


