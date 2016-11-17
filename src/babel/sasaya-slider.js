'use strict';

(($) => {
  const NAME = 'sasayaSlider';

  const VERSION = '0.2.0';

  const DATA_KEY = 'sasaya-slider';

  const JQUERY_NO_CONFLICT = $.fn[NAME];

  const TRANSITION_DURATION = 800;

  const DEFAULTS = {
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

  class SasayaSlider {
    constructor ($el, opts) {
      this.$el = $el;
      this.opts = opts;

      this.init();
    }

    init() {
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
      for (let i = 0; this.$main.find('.item').length < this.opts.pc.list.showCount + 2; i++) {
        this.$main.append(this.$main.find('.item').eq(i).clone());
      }

      this.$slides = this.$main.find('.item');

      // 建立 thumbs
      this.$slides.clone(true).appendTo(this.$list);
      this.$thumbs = this.$list.find('.item');
      this.thumbHeight = this.$main.height() / this.opts.pc.list.showCount;

      // 初始 chain
      ['$slides', '$thumbs'].forEach((type) => {
        this[type].each((_, current) => {
          let $current = $(current);
          [{
            name: 'next',
            fallback: ($elements) => {
              return $elements.first();
            }
          }, {
            name: 'prev',
            fallback: ($elements) => {
              return $elements.last();
            }
          }].forEach((direction) => {
            let $target = $current[direction.name].call($current);

            if (!$target.length) {
              $target = direction.fallback.call(this[type], this[type]);
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
      $(window).resize(() => {
        this.currentDevice = this.getDevice();

        if (this.currentDevice != this.lastDevice) {
          this.lastDevice = this.currentDevice;
          this.setSlidesPosition();
        }
      });

      // 開始輪播
      this.setTimeout();
    }

    getDevice() {
      return $(window).width() <= 768 ? 'mobile' : 'pc';
    }

    makeActive() {
      $.each(this.active, (_, $element) => {
        $element.addClass('active').siblings().removeClass('active');
      });
    }

    setSlidesPosition(animate, callback) {
      [{
        properties: { left: '-100%' },
        elements: this.active.main.data('prev')
      }, {
        properties: { left: 0 },
        elements: this.active.main
      }, {
        properties: { left: '100%' },
        elements: (() => {
          let elements = [];

          this.active.main.siblings().each((_, element) => {
            if (element === this.active.main.data('prev')[0]) {
              return;
            }

            elements.push(element);
          });

          return $(elements);
        })()
      }, {
        properties: (() => {
          let strategies = {
            pc: {
              top: () => {
                return (this.thumbHeight  * -1) + 'px';
              },
              left: 0
            },
            mobile: {
              top: 0,
              left: () => {
                return (100 / this.opts.mobile.list.showCount * -1) + '%';
              }
            }
          }

          return strategies[this.currentDevice];
        })(),
        elements: this.active.list.data('prev')
      }, {
        properties: (() => {
          let strategies = {
            pc: {
              top: (index) => {
                return (
                  this.thumbHeight *
                  Math.min(index, this.opts.pc.list.showCount)
                ) + 'px';
              },
              left: 0
            },
            mobile: {
              top: 0,
              left: (index) => {
                return (
                  (100 / this.opts.mobile.list.showCount) *
                  Math.min(index, this.opts.mobile.list.showCount)
                ) + '%';
              }
            }
          };

          return strategies[this.currentDevice];
        })(),
        elements: (() => {
          let elements = [];

          for (
            let i = 0, $thumb = this.active.list;
            i < this.$thumbs.length - 1;
            i++, $thumb = $thumb.data('next')
          ) {
            elements.push($thumb);
          }

          return $(elements);
        })()
      }].forEach((position) => {
        position.elements.each((index, element) => {
          $.each(position.properties, (key, value) => {
            let method = animate ? 'animate' : 'css';
            let current = parseInt($(element).css(key));

            if ('function' === typeof value) {
              value = value.call(element, index, element);
            }

            if (
              'animate' === method &&
              0 === current && 0 === value || (
                0 !== current && 0 !== value &&
                (current < 0 && parseInt(value) > 0) ||
                (current > 0 && parseInt(value) < 0)
              )
            ) {
              method = 'css';
            }

            $(element)[method].apply($(element), (() =>{
              let property = {};
              let params = [];

              property[key] = value;
              params.push(property);

              if ('animate' === method) {
                params.push(TRANSITION_DURATION);
              }

              return params;
            })());
          });
        });
      });

      if ('function' === typeof callback) {
        window.setTimeout(() => {
          callback.call(this);
        }, animate ? TRANSITION_DURATION : 1);
      }
    }

    show(method) {
      if (this.busy) {
        return;
      }

      this.busy = true;

      this.clearTimeout();

      $.each(this.active, (key, $obj) => {
        this.active[key] = $obj.data(method);
      });

      this.setSlidesPosition(true, () => {
        this.makeActive();

        this.setTimeout();

        this.busy = false;
      });
    }

    setTimeout() {
      if (this.timeout) {
        this.clearTimeout();
      }

      this.timeout = window.setTimeout(() => {
        this.show('next');
      }, this.opts[this.currentDevice].interval);
    }

    clearTimeout() {
      window.clearTimeout(this.timeout);
    }

    static plugin(opts) {
      let _opts = $.extend({}, DEFAULTS, 'object' === typeof opts ? opts : {});

      return this.each((_, element) => {
        let $element = $(element);
        let slider = $element.data(DATA_KEY);

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
  }

  $.fn.sasayaSlider = SasayaSlider.plugin;
  $.fn.sasayaSlider.Constructor = SasayaSlider;

  $.fn.sasayaSlider.noConflict = () => {
    $.fn.sasayaSlider = JQUERY_NO_CONFLICT;

    return SasayaSlider.plugin;
  };
})(jQuery);
