'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function ($) {
  var NAME = 'sasayaSlider';

  var VERSION = '0.2.0';

  var DATA_KEY = 'sasaya-slider';

  var JQUERY_NO_CONFLICT = $.fn[NAME];

  var TRANSITION_DURATION = 800;

  var DEFAULTS = {
    pc: {
      interval: 7000,
      list: {
        position: 'right',
        showCount: 4
      }
    },
    mobile: {
      interval: 5000,
      list: {
        position: 'bottom',
        showCount: 2
      }
    }
  };

  var SasayaSlider = function () {
    function SasayaSlider($el, opts) {
      _classCallCheck(this, SasayaSlider);

      this.$el = $el;
      this.opts = opts;

      this.init();
    }

    _createClass(SasayaSlider, [{
      key: 'init',
      value: function init() {
        var _this = this;

        this.busy = false;
        this.active = {};

        this.currentDevice = this.getDevice();
        this.lastDevice = this.currentDevice;

        this.$main = this.$el.find('.main');
        this.$list = $('<div>').addClass('list').appendTo(this.$el);

        if (!this.$main.find('.item').length) {
          throw new Error('No slide.');
        }

        // 最少要有 6 個
        for (var i = 0; this.$main.find('.item').length < this.opts.pc.list.showCount + 2; i++) {
          this.$main.append(this.$main.find('.item').eq(i).clone());
        }

        this.$slides = this.$main.find('.item');

        // 建立 thumbs
        this.$slides.clone(true).appendTo(this.$list);
        this.$thumbs = this.$list.find('.item');
        this.thumbHeight = this.$main.height() / this.opts.pc.list.showCount;

        // 初始 chain
        ['$slides', '$thumbs'].forEach(function (type) {
          _this[type].each(function (_, current) {
            var $current = $(current);
            [{
              name: 'next',
              fallback: function fallback($elements) {
                return $elements.first();
              }
            }, {
              name: 'prev',
              fallback: function fallback($elements) {
                return $elements.last();
              }
            }].forEach(function (direction) {
              var $target = $current[direction.name].call($current);

              if (!$target.length) {
                $target = direction.fallback.call(_this[type], _this[type]);
              }

              $current.data(direction.name, $target);
            });
          });
        });

        // 設定 active
        this.active.main = this.$slides.first();
        this.active.list = this.$thumbs.eq(1);
        this.makeActive();

        // 初始 slide 位置
        this.setSlidesPosition();

        // 註冊事件
        $(window).resize(function () {
          _this.currentDevice = _this.getDevice();

          if (_this.currentDevice != _this.lastDevice) {
            _this.lastDevice = _this.currentDevice;
            _this.setSlidesPosition();
          }
        });

        // 開始輪播
        this.setTimeout();
      }
    }, {
      key: 'getDevice',
      value: function getDevice() {
        return $(window).width() <= 768 ? 'mobile' : 'pc';
      }
    }, {
      key: 'makeActive',
      value: function makeActive() {
        $.each(this.active, function (_, $element) {
          $element.addClass('active').siblings().removeClass('active');
        });
      }
    }, {
      key: 'setSlidesPosition',
      value: function setSlidesPosition(animate, callback) {
        var _this2 = this;

        [{
          properties: { left: '-100%' },
          elements: this.active.main.data('prev')
        }, {
          properties: { left: 0 },
          elements: this.active.main
        }, {
          properties: { left: '100%' },
          elements: function () {
            var elements = [];

            _this2.active.main.siblings().each(function (_, element) {
              if (element === _this2.active.main.data('prev')[0]) {
                return;
              }

              elements.push(element);
            });

            return $(elements);
          }()
        }, {
          properties: function () {
            var strategies = {
              pc: {
                top: function top() {
                  return _this2.thumbHeight * -1 + 'px';
                },
                left: 0
              },
              mobile: {
                top: 0,
                left: function left() {
                  return 100 / _this2.opts.mobile.list.showCount * -1 + '%';
                }
              }
            };

            return strategies[_this2.currentDevice];
          }(),
          elements: this.active.list.data('prev')
        }, {
          properties: function () {
            var strategies = {
              pc: {
                top: function top(index) {
                  return _this2.thumbHeight * Math.min(index, _this2.opts.pc.list.showCount) + 'px';
                },
                left: 0
              },
              mobile: {
                top: 0,
                left: function left(index) {
                  return 100 / _this2.opts.mobile.list.showCount * Math.min(index, _this2.opts.mobile.list.showCount) + '%';
                }
              }
            };

            return strategies[_this2.currentDevice];
          }(),
          elements: function () {
            var elements = [];

            for (var i = 0, $thumb = _this2.active.list; i < _this2.$thumbs.length - 1; i++, $thumb = $thumb.data('next')) {
              elements.push($thumb);
            }

            return $(elements);
          }()
        }].forEach(function (position) {
          position.elements.each(function (index, element) {
            $.each(position.properties, function (key, value) {
              var method = animate ? 'animate' : 'css';
              var current = parseInt($(element).css(key));

              if ('function' === typeof value) {
                value = value.call(element, index, element);
              }

              if ('animate' === method && 0 === current && 0 === value || 0 !== current && 0 !== value && current < 0 && parseInt(value) > 0 || current > 0 && parseInt(value) < 0) {
                method = 'css';
              }

              $(element)[method].apply($(element), function () {
                var property = {};
                var params = [];

                property[key] = value;
                params.push(property);

                if ('animate' === method) {
                  params.push(TRANSITION_DURATION);
                }

                return params;
              }());
            });
          });
        });

        if ('function' === typeof callback) {
          window.setTimeout(function () {
            callback.call(_this2);
          }, animate ? TRANSITION_DURATION : 1);
        }
      }
    }, {
      key: 'show',
      value: function show(method) {
        var _this3 = this;

        if (this.busy) {
          return;
        }

        this.busy = true;

        this.clearTimeout();

        $.each(this.active, function (key, $obj) {
          _this3.active[key] = $obj.data(method);
        });

        this.setSlidesPosition(true, function () {
          _this3.makeActive();

          _this3.setTimeout();

          _this3.busy = false;
        });
      }
    }, {
      key: 'setTimeout',
      value: function setTimeout() {
        var _this4 = this;

        if (this.timeout) {
          this.clearTimeout();
        }

        this.timeout = window.setTimeout(function () {
          _this4.show('next');
        }, this.opts[this.currentDevice].interval);
      }
    }, {
      key: 'clearTimeout',
      value: function clearTimeout() {
        window.clearTimeout(this.timeout);
      }
    }], [{
      key: 'plugin',
      value: function plugin(opts) {
        var _opts = $.extend({}, DEFAULTS, 'object' === (typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) ? opts : {});

        return this.each(function (_, element) {
          var $element = $(element);
          var slider = $element.data(DATA_KEY);

          if (!slider) {
            $element.data(DATA_KEY, slider = new SasayaSlider($element, _opts));
          }

          if ('string' === typeof opts) {
            switch (opts) {
              case 'prev':
              case 'next':
                slider.show(opts);
                break;

              default:
                throw new Error('Method [' + opts + '] not found.');
            }
          }
        });
      }
    }]);

    return SasayaSlider;
  }();

  $.fn.sasayaSlider = SasayaSlider.plugin;
  $.fn.sasayaSlider.Constructor = SasayaSlider;

  $.fn.sasayaSlider.noConflict = function () {
    $.fn.sasayaSlider = JQUERY_NO_CONFLICT;

    return SasayaSlider.plugin;
  };
})(jQuery);