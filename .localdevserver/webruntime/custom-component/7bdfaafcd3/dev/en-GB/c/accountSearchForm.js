Webruntime.define('lwc/accountSearchForm', ['lwc', 'lightning/configProvider', 'wire-service', 'instrumentation/service', 'aura-storage', 'aura', 'lightning/navigation'], function (lwc, configProvider, wireService, service, auraStorage, aura, navigation) { 'use strict';

    auraStorage = auraStorage && Object.prototype.hasOwnProperty.call(auraStorage, 'default') ? auraStorage['default'] : auraStorage;

    function stylesheet(hostSelector, shadowSelector, nativeShadow) {
      return "@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {.slds-slot" + shadowSelector + " {display: flex;}\n}";
    }
    var _implicitStylesheets = [stylesheet];

    function tmpl($api, $cmp, $slotset, $ctx) {
      const {
        s: api_slot
      } = $api;
      return [api_slot("", {
        classMap: {
          "slds-slot": true
        },
        key: 0
      }, [], $slotset)];
    }

    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.slots = [""];
    tmpl.stylesheets = [];

    if (_implicitStylesheets) {
      tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
    }
    tmpl.stylesheetTokens = {
      hostAttribute: "lightning-layout_layout-host",
      shadowAttribute: "lightning-layout_layout"
    };

    function assert(condition, message) {
      {
        if (!condition) {
          throw new Error(message);
        }
      }
    }

    /**
    An emitter implementation based on the Node.js EventEmitter API:
    https://nodejs.org/dist/latest-v6.x/docs/api/events.html#events_class_eventemitter
    **/
    class EventEmitter {
      constructor() {
        this.registry = {};
      }
      /**
      Registers a listener on the emitter
      @method EventEmitter#on
      @param {String} name - The name of the event
      @param {Function} listener - The callback function
      @return {EventEmitter} - Returns a reference to the `EventEmitter` so that calls can be chained
      **/


      on(name, listener) {
        this.registry[name] = this.registry[name] || [];
        this.registry[name].push(listener);
        return this;
      }
      /**
      Registers a listener on the emitter that only executes once
      @method EventEmitter#once
      @param {String} name - The name of the event
      @param {Function} listener - The callback function
      @return {EventEmitter} - Returns a reference to the `EventEmitter` so that calls can be chained
      **/


      once(name, listener) {
        const doOnce = function () {
          listener.apply(null, arguments);
          this.removeListener(name, doOnce);
        }.bind(this);

        this.on(name, doOnce);
        return this;
      }
      /**
      Synchronously calls each listener registered with the specified event
      @method EventEmitter#emit
      @param {String} name - The name of the event
      @return {Boolean} - Returns `true` if the event had listeners, `false` otherwise
      **/


      emit(name) {
        const args = Array.prototype.slice.call(arguments, 1);
        const listeners = this.registry[name];
        let count = 0;

        if (listeners) {
          listeners.forEach(listener => {
            count += 1;
            listener.apply(null, args);
          });
        }

        return count > 0;
      }
      /**
      Removes the specified `listener` from the listener array for the event named `name`
      @method EventEmitter#removeListener
      @param {String} name - The name of the event
      @param {Function} listener - The callback function
      @return {EventEmitter} - Returns a reference to the `EventEmitter` so that calls can be chained
      **/


      removeListener(name, listener) {
        const listeners = this.registry[name];

        if (listeners) {
          for (let i = 0, len = listeners.length; i < len; i += 1) {
            if (listeners[i] === listener) {
              listeners.splice(i, 1);
              return this;
            }
          }
        }

        return this;
      }

    }

    /**
     * Utility function to generate an unique guid.
     * used on state objects to provide a performance aid when iterating
     * through the items and marking them for render
     * @returns {String} an unique string ID
     */
    function guid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      }

      return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    function classListMutation(classList, config) {
      Object.keys(config).forEach(key => {
        if (typeof key === 'string' && key.length) {
          if (config[key]) {
            classList.add(key);
          } else {
            classList.remove(key);
          }
        }
      });
    }

    /**
    A string normalization utility for attributes.
    @param {String} value - The value to normalize.
    @param {Object} config - The optional configuration object.
    @param {String} [config.fallbackValue] - The optional fallback value to use if the given value is not provided or invalid. Defaults to an empty string.
    @param {Array} [config.validValues] - An optional array of valid values. Assumes all input is valid if not provided.
    @return {String} - The normalized value.
    **/
    function normalizeString(value, config = {}) {
      const {
        fallbackValue = '',
        validValues,
        toLowerCase = true
      } = config;
      let normalized = typeof value === 'string' && value.trim() || '';
      normalized = toLowerCase ? normalized.toLowerCase() : normalized;

      if (validValues && validValues.indexOf(normalized) === -1) {
        normalized = fallbackValue;
      }

      return normalized;
    }
    /**
    A boolean normalization utility for attributes.
    @param {Any} value - The value to normalize.
    @return {Boolean} - The normalized value.
    **/

    function normalizeBoolean(value) {
      return typeof value === 'string' || !!value;
    }
    function normalizeArray(value) {
      if (Array.isArray(value)) {
        return value;
      }

      return [];
    }
    /**
    A aria attribute normalization utility.
    @param {Any} value - A single aria value or an array of aria values
    @return {String} - A space separated list of aria values
    **/

    function normalizeAriaAttribute(value) {
      let arias = Array.isArray(value) ? value : [value];
      arias = arias.map(ariaValue => {
        if (typeof ariaValue === 'string') {
          return ariaValue.replace(/\s+/g, ' ').trim();
        }

        return '';
      }).filter(ariaValue => !!ariaValue);
      return arias.length > 0 ? arias.join(' ') : null;
    }

    const buffer = {};
    /**
     * Runs an action and passes the string of buffered keys typed within a short time period.
     * Use for type-ahead like functionality in menus, lists, comboboxes, and similar components.
     *
     * @param {CustomEvent} event A keyboard event
     * @param {Function} action function to run, it's passed the buffered text
     */

    function runActionOnBufferedTypedCharacters(event, action) {
      const letter = event.key;

      if (letter.length > 1) {
        // Not an individual character/letter, but rather a special code (like Shift, Backspace, etc.)
        return;
      } // If we were going to clear what keys were typed, don't yet.


      if (buffer._clearBufferId) {
        clearTimeout(buffer._clearBufferId);
      }

      buffer._keyBuffer = buffer._keyBuffer || [];

      buffer._keyBuffer.push(letter);

      const matchText = buffer._keyBuffer.join('').toLowerCase();

      action(matchText); // eslint-disable-next-line @lwc/lwc/no-async-operation

      buffer._clearBufferId = setTimeout(() => {
        buffer._keyBuffer = [];
      }, 700);
    }

    const isIE11 = isIE11Test(navigator);
    const isChrome = isChromeTest(navigator);
    const isSafari = isSafariTest(navigator); // The following functions are for tests only

    function isIE11Test(navigator) {
      // https://stackoverflow.com/questions/17447373/how-can-i-target-only-internet-explorer-11-with-javascript
      return /Trident.*rv[ :]*11\./.test(navigator.userAgent);
    }
    function isChromeTest(navigator) {
      // https://stackoverflow.com/questions/4565112/javascript-how-to-find-out-if-the-user-browser-is-chrome
      return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    }
    function isSafariTest(navigator) {
      // via https://stackoverflow.com/questions/49872111/detect-safari-and-stop-script
      return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }

    /**
     * Set an attribute on an element, if it's a normal element
     * it will use setAttribute, if it's an LWC component
     * it will use the public property
     *
     * @param {HTMLElement} element The element to act on
     * @param {String} attribute the attribute to set
     * @param {Any} value the value to set
     */
    function smartSetAttribute(element, attribute, value) {
      if (element.tagName.match(/^LIGHTNING/i)) {
        attribute = attribute.replace(/-\w/g, m => m[1].toUpperCase());
        element[attribute] = value ? value : null;
      } else if (value) {
        element.setAttribute(attribute, value);
      } else {
        element.removeAttribute(attribute);
      }
    }

    /**
     * @param {HTMLElement} element Element to act on
     * @param {Object} values values and attributes to set, if the value is
     *                        falsy it the attribute will be removed
     */

    function synchronizeAttrs(element, values) {
      if (!element) {
        return;
      }

      const attributes = Object.keys(values);
      attributes.forEach(attribute => {
        smartSetAttribute(element, attribute, values[attribute]);
      });
    }
    /**
     * Get the actual DOM id for an element
     * @param {HTMLElement|String} el The element to get the id for (string will just be returned)
     *
     * @returns {String} The DOM id or null
     */

    function getRealDOMId(el) {
      if (el && typeof el === 'string') {
        return el;
      } else if (el) {
        return el.getAttribute('id');
      }

      return null;
    }
    const DEFAULT_ZINDEX_BASELINE = 9000;
    /**
     * Returns the zIndex baseline from slds zIndex variable --lwc-zIndexModal.
     * @returns {Number} zIndex baseline
     */

    function getZIndexBaseline() {
      const value = (window.getComputedStyle(document.documentElement) || document.documentElement.style).getPropertyValue('--lwc-zIndexModal');
      const base = parseInt(value, 10);
      return isNaN(base) ? DEFAULT_ZINDEX_BASELINE : base;
    }

    const proto = {
      add(className) {
        if (typeof className === 'string') {
          this[className] = true;
        } else {
          Object.assign(this, className);
        }

        return this;
      },

      invert() {
        Object.keys(this).forEach(key => {
          this[key] = !this[key];
        });
        return this;
      },

      toString() {
        return Object.keys(this).filter(key => this[key]).join(' ');
      }

    };
    function classSet(config) {
      if (typeof config === 'string') {
        const key = config;
        config = {};
        config[key] = true;
      }

      return Object.assign(Object.create(proto), config);
    }

    const HALIN_CLASS = {
      center: 'slds-grid_align-center',
      space: 'slds-grid_align-space',
      spread: 'slds-grid_align-spread',
      end: 'slds-grid_align-end'
    };
    const VALIN_CLASS = {
      start: 'slds-grid_vertical-align-start',
      center: 'slds-grid_vertical-align-center',
      end: 'slds-grid_vertical-align-end',
      stretch: 'slds-grid_vertical-stretch'
    };
    const BOUNDARY_CLASS = {
      small: 'slds-grid_pull-padded',
      medium: 'slds-grid_pull-padded-medium',
      large: 'slds-grid_pull-padded-large'
    };
    const VERTICAL_ALIGN = Object.keys(VALIN_CLASS);
    const BOUNDARY = Object.keys(BOUNDARY_CLASS);
    const HORIZONTAL_ALIGN = Object.keys(HALIN_CLASS);
    const ROWS_CLASS = 'slds-wrap';
    const GRID_CLASS = 'slds-grid';
    function normalizeParam(value, valid, fallback) {
      value = value ? value.toLowerCase() : ' ';
      return normalizeString(value, {
        fallbackValue: fallback || ' ',
        validValues: valid || []
      });
    }
    function computeLayoutClass(hAlign, vAlign, boundary, multiRows) {
      const computedClass = classSet(GRID_CLASS);

      if (hAlign !== ' ' && HALIN_CLASS[hAlign]) {
        computedClass.add(HALIN_CLASS[hAlign]);
      }

      if (vAlign !== ' ' && VALIN_CLASS[vAlign]) {
        computedClass.add(VALIN_CLASS[vAlign]);
      }

      if (boundary !== ' ' && BOUNDARY_CLASS[boundary]) {
        computedClass.add(BOUNDARY_CLASS[boundary]);
      }

      if (multiRows) {
        computedClass.add(ROWS_CLASS);
      }

      return computedClass;
    }

    /**
     * Represents a responsive grid system for arranging containers on a page.
     */

    class LightningLayout extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this._horizontalAlign = void 0;
        this._verticalAlign = void 0;
        this._pullToBoundary = void 0;
        this._multipleRows = void 0;
        this._layoutClass = [];
      }

      /**
       * Determines how to spread the layout items horizontally.
       * The alignment options are center, space, spread, and end.
       * @type {string}
       * @default
       */
      get horizontalAlign() {
        return this._horizontalAlign;
      }

      set horizontalAlign(value) {
        this._horizontalAlign = normalizeParam(value, HORIZONTAL_ALIGN);
        this.updateClassList();
      }

      /**
       * Determines how to align the layout items vertically in the container.
       * The alignment options are start, center, end, and stretch.
       * @type {string}
       * @default
       */
      get verticalAlign() {
        return this._verticalAlign;
      }

      set verticalAlign(value) {
        this._verticalAlign = normalizeParam(value, VERTICAL_ALIGN);
        this.updateClassList();
      }

      /**
       * Pulls layout items to the layout boundaries and corresponds
       * to the padding size on the layout item. Possible values are small, medium, or large.
       * @type {string}
       * @default
       *
       */
      get pullToBoundary() {
        return this._pullToBoundary;
      }

      set pullToBoundary(value) {
        this._pullToBoundary = normalizeParam(value, BOUNDARY);
        this.updateClassList();
      }

      /**
       * If present, layout items wrap to the following line when they exceed the layout width.
       * @type {boolean}
       * @default false
       */
      get multipleRows() {
        return this._multipleRows || false;
      }

      set multipleRows(value) {
        this._multipleRows = normalizeBoolean(value);
        this.updateClassList();
      }

      connectedCallback() {
        this.updateClassList();
      }

      updateClassList() {
        this.classList.remove(...this._layoutClass);
        const config = computeLayoutClass(this.horizontalAlign, this.verticalAlign, this.pullToBoundary, this.multipleRows);
        this._layoutClass = Object.keys(config);
        this.classList.add(...this._layoutClass);
      }

    }

    lwc.registerDecorators(LightningLayout, {
      publicProps: {
        horizontalAlign: {
          config: 3
        },
        verticalAlign: {
          config: 3
        },
        pullToBoundary: {
          config: 3
        },
        multipleRows: {
          config: 3
        }
      },
      track: {
        _horizontalAlign: 1,
        _verticalAlign: 1,
        _pullToBoundary: 1,
        _multipleRows: 1
      },
      fields: ["_layoutClass"]
    });

    var _lightningLayout = lwc.registerComponent(LightningLayout, {
      tmpl: _tmpl
    });

    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {
        s: api_slot
      } = $api;
      return [api_slot("", {
        key: 0
      }, [], $slotset)];
    }

    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.slots = [""];
    tmpl$1.stylesheets = [];
    tmpl$1.stylesheetTokens = {
      hostAttribute: "lightning-layoutItem_layoutItem-host",
      shadowAttribute: "lightning-layoutItem_layoutItem"
    };

    const SIZE_MIN = 1;
    const SIZE_MAX = 12;
    const DEFAULT_LAYOUT_SIZE = {
      default: null,
      small: null,
      medium: null,
      large: null
    };
    const PADDING = ['horizontal-small', 'horizontal-medium', 'horizontal-large', 'around-small', 'around-medium', 'around-large'];
    const PADDING_CLASS = {
      'slds-p-right_small': 'horizontal-small',
      'slds-p-left_small': 'horizontal-small',
      'slds-p-right_medium': 'horizontal-medium',
      'slds-p-left_medium': 'horizontal-medium',
      'slds-p-right_large': 'horizontal-large',
      'slds-p-left_large': 'horizontal-large',
      'slds-p-around_small': 'around-small',
      'slds-p-around_medium': 'around-medium',
      'slds-p-around_large': 'around-large'
    };
    const FLEXIBILITY = ['auto', 'shrink', 'no-shrink', 'grow', 'no-grow', 'no-flex'];
    const FLEX_CLASS = {
      'slds-col': 'auto',
      'slds-grow': 'grow',
      'slds-shrink': 'shrink',
      'slds-grow-none': 'no-grow',
      'slds-shrink-none': 'no-shrink',
      'slds-no-flex': 'no-flex'
    };
    const SIZE_CLASS = {
      default: 'slds-size_',
      small: 'slds-small-size_',
      medium: 'slds-medium-size_',
      large: 'slds-large-size_'
    };
    const DIRECTION = ['left', 'top', 'right', 'bottom'];
    const STYLE_ERROR = {
      FLEX_CONFLICT: 'You cannot have `flexibility` value to be set to `auto` and `no-flex` together for <lightning-layout-item> component',
      SIZE_RANGE: 'Invalid `size` attribute for <lightning-layout-item> component. The `size` attribute should be an integer between 1 and 12',
      SMALL_SIZE_RANGE: 'Invalid `smallDeviceSize` attribute for <lightning-layout-item> component. The `smallDeviceSize` attribute should be an integer between 1 and 12',
      MEDIUM_SIZE_RANGE: 'Invalid `mediumDeviceSize` attribute for <lightning-layout-item> component. The `mediumDeviceSize` attribute should be an integer between 1 and 12',
      LARGE_SIZE_RANGE: 'Invalid `largeDeviceSize` attribute for <lightning-layout-item> component. The `largeDeviceSize` attribute should be an integer between 1 and 12',
      SIZE_REQUIRED: 'You cannot have device specific size attributes for <lightning-layout-item> component without specifying the `size` attribute'
    };

    function hasConflict(value) {
      return value.some(item => item === 'auto') && value.some(item => item === 'no-flex');
    }

    function toArray(value) {
      if (Array.isArray(value)) {
        return value;
      } else if (typeof value === 'string') {
        value = value.split(',');
        return value.map(item => item.trim());
      }

      return [value];
    }

    function normalizeDirection(value, fallback) {
      value = value ? value.toLowerCase() : ' ';
      return normalizeString(value, {
        fallbackValue: fallback || '',
        validValues: DIRECTION
      });
    }
    function normalizePadding(value) {
      value = value ? value.toLowerCase() : ' ';
      return normalizeString(value, {
        fallbackValue: ' ',
        validValues: PADDING
      });
    }
    function normalizeFlexibility(value) {
      value = toArray(value);

      if (hasConflict(value)) {
        throw new Error(STYLE_ERROR.FLEX_CONFLICT);
      }

      return value.filter(item => FLEXIBILITY.some(allowed => item === allowed));
    }
    function normalizeSize(value) {
      if (value != null) {
        const size = parseFloat(value);
        return isNaN(size) ? null : Math.round(size);
      }

      return value;
    }

    function computePaddingClass(padding, computedClass) {
      computedClass = computedClass || classSet();
      padding = padding || ' ';
      Object.keys(PADDING_CLASS).forEach(key => {
        if (PADDING_CLASS[key].toLowerCase() === padding) {
          computedClass.add(key);
        }
      });
      return computedClass;
    }

    function computeFlexibilityClass(flexibility, computedClass) {
      computedClass = computedClass || classSet();
      flexibility = flexibility || [];
      Object.keys(FLEX_CLASS).forEach(key => {
        if (flexibility.some(flex => flex === FLEX_CLASS[key])) {
          computedClass.add(key);
        }
      });
      return computedClass;
    }

    function computeSizeClass(layoutSize, computedClass) {
      computedClass = computedClass || classSet();
      layoutSize = layoutSize || DEFAULT_LAYOUT_SIZE;
      Object.keys(SIZE_CLASS).forEach(key => {
        const size = layoutSize[key];

        if (size != null && size !== 0) {
          computedClass.add(`${SIZE_CLASS[key]}${size}-of-12`);
        }
      });
      return computedClass;
    }

    function computeBumpClass(direction, computedClass) {
      computedClass = computedClass || classSet();
      direction = direction || '';

      if (direction !== '') {
        computedClass.add(`slds-col_bump-${direction}`);
      }

      return computedClass;
    }

    function computeLayoutClass$1(layoutSize, flexibility, padding, bump) {
      const computedClass = computePaddingClass(padding);
      computeFlexibilityClass(flexibility, computedClass);
      computeSizeClass(layoutSize, computedClass);
      computeBumpClass(bump, computedClass);
      return computedClass;
    }
    function validateSize(size, smallDeviceSize, mediumDeviceSize, largeDeviceSize) {
      if (size != null && !(SIZE_MIN <= size && size <= SIZE_MAX)) {
        throw new Error(STYLE_ERROR.SIZE_RANGE);
      }

      if (smallDeviceSize != null && !(SIZE_MIN <= smallDeviceSize && smallDeviceSize <= SIZE_MAX)) {
        throw new Error(STYLE_ERROR.SMALL_SIZE_RANGE);
      }

      if (mediumDeviceSize != null && !(SIZE_MIN <= mediumDeviceSize && mediumDeviceSize <= SIZE_MAX)) {
        throw new Error(STYLE_ERROR.MEDIUM_SIZE_RANGE);
      }

      if (largeDeviceSize && !(SIZE_MIN <= largeDeviceSize && largeDeviceSize <= SIZE_MAX)) {
        throw new Error(STYLE_ERROR.LARGE_SIZE_RANGE);
      }

      if (size == null && (smallDeviceSize != null || mediumDeviceSize != null || largeDeviceSize != null)) {
        throw new Error(STYLE_ERROR.SIZE_REQUIRED);
      }

      return true;
    }

    /**
     * The basic element in a lightning-layout component.
     * A layout item groups information together to define visual grids, spacing, and sections.
     * @slot default Placeholder for your content in lightning-layout-item.
     */

    class LightningLayoutItem extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this._flexibility = void 0;
        this._alignmentBump = void 0;
        this._padding = void 0;
        this._size = void 0;
        this._smallDeviceSize = void 0;
        this._mediumDeviceSize = void 0;
        this._largeDeviceSize = void 0;
        this._layoutClass = [];
      }

      /**
       * Make the item fluid so that it absorbs any extra space in its
       * container or shrinks when there is less space. Allowed values are:
       * auto (columns grow or shrink equally as space allows),
       * shrink (columns shrink equally as space decreases),
       * no-shrink (columns don't shrink as space reduces),
       * grow (columns grow equally as space increases),
       * no-grow (columns don't grow as space increases),
       * no-flex (columns don't grow or shrink as space changes).
       * Use a comma-separated value for multiple options, such as 'auto, no-shrink'.
       * @type {object}
       */
      get flexibility() {
        return this._flexibility;
      }

      set flexibility(value) {
        this._flexibility = normalizeFlexibility(value);
        this.updateClassList();
      }

      /**
       * Specifies a direction to bump the alignment of adjacent layout items. Allowed values are left, top, right, bottom.
       * @type {string}
       */
      get alignmentBump() {
        return this._alignmentBump;
      }

      set alignmentBump(value) {
        this._alignmentBump = normalizeDirection(value);
        this.updateClassList();
      }

      /**
       * Sets padding to either the right and left sides of a container,
       * or all sides of a container. Allowed values are horizontal-small,
       * horizontal-medium, horizontal-large, around-small, around-medium, around-large.
       * @type {string}
       */
      get padding() {
        return this._padding;
      }

      set padding(value) {
        this._padding = normalizePadding(value);
        this.updateClassList();
      }

      /**
       * If the viewport is divided into 12 parts, size indicates the
       * relative space the container occupies. Size is expressed as
       * an integer from 1 through 12. This applies for all device-types.
       * @type {number}
       */
      get size() {
        return this._size;
      }

      set size(value) {
        this._size = normalizeSize(value);
        this.validateSize();
        this.updateClassList();
      }

      /**
       * If the viewport is divided into 12 parts, this attribute indicates
       * the relative space the container occupies on device-types larger than
       * mobile. It is expressed as an integer from 1 through 12.
       * @type {number}
       */
      get smallDeviceSize() {
        return this._smallDeviceSize;
      }

      set smallDeviceSize(value) {
        this._smallDeviceSize = normalizeSize(value);
        this.validateSize();
        this.updateClassList();
      }

      /**
       * If the viewport is divided into 12 parts, this attribute indicates
       * the relative space the container occupies on device-types larger than
       * tablet. It is expressed as an integer from 1 through 12.
       * @type {number}
       */
      get mediumDeviceSize() {
        return this._mediumDeviceSize;
      }

      set mediumDeviceSize(value) {
        this._mediumDeviceSize = normalizeSize(value);
        this.validateSize();
      }

      /**
       * If the viewport is divided into 12 parts, this attribute indicates
       * the relative space the container occupies on device-types larger than
       * desktop. It is expressed as an integer from 1 through 12.
       * @type {number}
       */
      get largeDeviceSize() {
        return this._largeDeviceSize;
      }

      set largeDeviceSize(value) {
        this._largeDeviceSize = normalizeSize(value);
        this.validateSize();
        this.updateClassList();
      }

      connectedCallback() {
        this.updateClassList();
      }

      updateClassList() {
        this.classList.remove(...this._layoutClass);
        const config = computeLayoutClass$1({
          default: this.size,
          small: this.smallDeviceSize,
          medium: this.mediumDeviceSize,
          large: this.largeDeviceSize
        }, this.flexibility, this.padding, this.alignmentBump);
        this._layoutClass = Object.keys(config);
        this.classList.add(...this._layoutClass);
      }

      validateSize() {
        validateSize(this.size, this.smallDeviceSize, this.mediumDeviceSize, this.largeDeviceSize);
      }

    }

    lwc.registerDecorators(LightningLayoutItem, {
      publicProps: {
        flexibility: {
          config: 3
        },
        alignmentBump: {
          config: 3
        },
        padding: {
          config: 3
        },
        size: {
          config: 3
        },
        smallDeviceSize: {
          config: 3
        },
        mediumDeviceSize: {
          config: 3
        },
        largeDeviceSize: {
          config: 3
        }
      },
      track: {
        _flexibility: 1,
        _alignmentBump: 1,
        _padding: 1,
        _size: 1,
        _smallDeviceSize: 1,
        _mediumDeviceSize: 1,
        _largeDeviceSize: 1
      },
      fields: ["_layoutClass"]
    });

    var _lightningLayoutItem = lwc.registerComponent(LightningLayoutItem, {
      tmpl: _tmpl$1
    });

    function stylesheet$1(hostSelector, shadowSelector, nativeShadow) {
      return "_:-ms-lang(x)" + shadowSelector + ", svg" + shadowSelector + " {pointer-events: none;}\n";
    }
    var _implicitStylesheets$1 = [stylesheet$1];

    function tmpl$2($api, $cmp, $slotset, $ctx) {
      const {
        fid: api_scoped_frag_id,
        h: api_element
      } = $api;
      return [api_element("svg", {
        className: $cmp.computedClass,
        attrs: {
          "focusable": "false",
          "data-key": $cmp.name,
          "aria-hidden": "true"
        },
        key: 1
      }, [api_element("use", {
        attrs: {
          "xlink:href": lwc.sanitizeAttribute("use", "http://www.w3.org/2000/svg", "xlink:href", api_scoped_frag_id($cmp.href))
        },
        key: 0
      }, [])])];
    }

    var _tmpl$2 = lwc.registerTemplate(tmpl$2);
    tmpl$2.stylesheets = [];

    if (_implicitStylesheets$1) {
      tmpl$2.stylesheets.push.apply(tmpl$2.stylesheets, _implicitStylesheets$1);
    }
    tmpl$2.stylesheetTokens = {
      hostAttribute: "lightning-primitiveIcon_primitiveIcon-host",
      shadowAttribute: "lightning-primitiveIcon_primitiveIcon"
    };

    var dir = 'ltr';

    var _tmpl$3 = void 0;

    // Taken from https://github.com/jonathantneal/svg4everybody/pull/139
    // Remove this iframe-in-edge check once the following is resolved https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8323875/
    const isEdgeUA = /\bEdge\/.(\d+)\b/.test(navigator.userAgent);
    const inIframe = window.top !== window.self;
    const isIframeInEdge = isEdgeUA && inIframe;
    var isIframeInEdge$1 = lwc.registerComponent(isIframeInEdge, {
      tmpl: _tmpl$3
    });

    // Taken from https://git.soma.salesforce.com/aura/lightning-global/blob/999dc35f948246181510df6e56f45ad4955032c2/src/main/components/lightning/SVGLibrary/stamper.js#L38-L60
    function fetchSvg(url) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.send();

        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              resolve(xhr.responseText);
            } else {
              reject(xhr);
            }
          }
        };
      });
    }

    // Which looks like it was inspired by https://github.com/jonathantneal/svg4everybody/blob/377d27208fcad3671ed466e9511556cb9c8b5bd8/lib/svg4everybody.js#L92-L107
    // Modify at your own risk!

    const newerIEUA = /\bTrident\/[567]\b|\bMSIE (?:9|10)\.0\b/;
    const webkitUA = /\bAppleWebKit\/(\d+)\b/;
    const olderEdgeUA = /\bEdge\/12\.(\d+)\b/;
    const isIE = newerIEUA.test(navigator.userAgent) || (navigator.userAgent.match(olderEdgeUA) || [])[1] < 10547 || (navigator.userAgent.match(webkitUA) || [])[1] < 537;
    const supportsSvg = !isIE && !isIframeInEdge$1;
    var supportsSvg$1 = lwc.registerComponent(supportsSvg, {
      tmpl: _tmpl$3
    });

    /**
    This polyfill injects SVG sprites into the document for clients that don't
    fully support SVG. We do this globally at the document level for performance
    reasons. This causes us to lose namespacing of IDs across sprites. For example,
    if both #image from utility sprite and #image from doctype sprite need to be
    rendered on the page, both end up as #image from the doctype sprite (last one
    wins). SLDS cannot change their image IDs due to backwards-compatibility
    reasons so we take care of this issue at runtime by adding namespacing as we
    polyfill SVG elements.

    For example, given "/assets/icons/action-sprite/svg/symbols.svg#approval", we
    replace the "#approval" id with "#${namespace}-approval" and a similar
    operation is done on the corresponding symbol element.
    **/
    const svgTagName = /svg/i;

    const isSvgElement = el => el && svgTagName.test(el.nodeName);

    const requestCache = {};
    const symbolEls = {};
    const svgFragments = {};
    const spritesContainerId = 'slds-svg-sprites';
    let spritesEl;
    function polyfill(el) {
      if (!supportsSvg$1 && isSvgElement(el)) {
        if (!spritesEl) {
          spritesEl = document.createElement('svg');
          spritesEl.xmlns = 'http://www.w3.org/2000/svg';
          spritesEl['xmlns:xlink'] = 'http://www.w3.org/1999/xlink';
          spritesEl.style.display = 'none';
          spritesEl.id = spritesContainerId;
          document.body.insertBefore(spritesEl, document.body.childNodes[0]);
        }

        Array.from(el.getElementsByTagName('use')).forEach(use => {
          // We access the href differently in raptor and in aura, probably
          // due to difference in the way the svg is constructed.
          const src = use.getAttribute('xlink:href') || use.getAttribute('href');

          if (src) {
            // "/assets/icons/action-sprite/svg/symbols.svg#approval" =>
            // ["/assets/icons/action-sprite/svg/symbols.svg", "approval"]
            const parts = src.split('#');
            const url = parts[0];
            const id = parts[1];
            const namespace = url.replace(/[^\w]/g, '-');
            const href = `#${namespace}-${id}`;

            if (url.length) {
              // set the HREF value to no longer be an external reference
              if (use.getAttribute('xlink:href')) {
                use.setAttribute('xlink:href', href);
              } else {
                use.setAttribute('href', href);
              } // only insert SVG content if it hasn't already been retrieved


              if (!requestCache[url]) {
                requestCache[url] = fetchSvg(url);
              }

              requestCache[url].then(svgContent => {
                // create a document fragment from the svgContent returned (is parsed by HTML parser)
                if (!svgFragments[url]) {
                  const svgFragment = document.createRange().createContextualFragment(svgContent);
                  svgFragments[url] = svgFragment;
                }

                if (!symbolEls[href]) {
                  const svgFragment = svgFragments[url];
                  const symbolEl = svgFragment.querySelector(`#${id}`);
                  symbolEls[href] = true;
                  symbolEl.id = `${namespace}-${id}`;
                  spritesEl.appendChild(symbolEl);
                }
              });
            }
          }
        });
      }
    }

    const validNameRe = /^([a-zA-Z]+):([a-zA-Z]\w*)$/;
    const underscoreRe = /_/g;
    let pathPrefix;
    const tokenNameMap = Object.assign(Object.create(null), {
      action: 'lightning.actionSprite',
      custom: 'lightning.customSprite',
      doctype: 'lightning.doctypeSprite',
      standard: 'lightning.standardSprite',
      utility: 'lightning.utilitySprite'
    });
    const tokenNameMapRtl = Object.assign(Object.create(null), {
      action: 'lightning.actionSpriteRtl',
      custom: 'lightning.customSpriteRtl',
      doctype: 'lightning.doctypeSpriteRtl',
      standard: 'lightning.standardSpriteRtl',
      utility: 'lightning.utilitySpriteRtl'
    });
    const defaultTokenValueMap = Object.assign(Object.create(null), {
      'lightning.actionSprite': '/assets/icons/action-sprite/svg/symbols.svg',
      'lightning.actionSpriteRtl': '/assets/icons/action-sprite/svg/symbols.svg',
      'lightning.customSprite': '/assets/icons/custom-sprite/svg/symbols.svg',
      'lightning.customSpriteRtl': '/assets/icons/custom-sprite/svg/symbols.svg',
      'lightning.doctypeSprite': '/assets/icons/doctype-sprite/svg/symbols.svg',
      'lightning.doctypeSpriteRtl': '/assets/icons/doctype-sprite/svg/symbols.svg',
      'lightning.standardSprite': '/assets/icons/standard-sprite/svg/symbols.svg',
      'lightning.standardSpriteRtl': '/assets/icons/standard-sprite/svg/symbols.svg',
      'lightning.utilitySprite': '/assets/icons/utility-sprite/svg/symbols.svg',
      'lightning.utilitySpriteRtl': '/assets/icons/utility-sprite/svg/symbols.svg'
    });

    const getDefaultBaseIconPath = (category, nameMap) => defaultTokenValueMap[nameMap[category]];

    const getBaseIconPath = (category, direction) => {
      const nameMap = direction === 'rtl' ? tokenNameMapRtl : tokenNameMap;
      return configProvider.getToken(nameMap[category]) || getDefaultBaseIconPath(category, nameMap);
    };

    const getMatchAtIndex = index => iconName => {
      const result = validNameRe.exec(iconName);
      return result ? result[index] : '';
    };

    const getCategory = getMatchAtIndex(1);
    const getName = getMatchAtIndex(2);
    const isValidName = iconName => validNameRe.test(iconName);
    const getIconPath = (iconName, direction = 'ltr') => {
      pathPrefix = pathPrefix !== undefined ? pathPrefix : configProvider.getPathPrefix();

      if (isValidName(iconName)) {
        const baseIconPath = getBaseIconPath(getCategory(iconName), direction);

        if (baseIconPath) {
          // This check was introduced the following MS-Edge issue:
          // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/9655192/
          // If and when this get fixed, we can safely remove this block of code.
          if (isIframeInEdge$1) {
            // protocol => 'https:' or 'http:'
            // host => hostname + port
            const origin = `${window.location.protocol}//${window.location.host}`;
            return `${origin}${pathPrefix}${baseIconPath}#${getName(iconName)}`;
          }

          return `${pathPrefix}${baseIconPath}#${getName(iconName)}`;
        }
      }

      return '';
    };
    const computeSldsClass = iconName => {
      if (isValidName(iconName)) {
        const category = getCategory(iconName);
        const name = getName(iconName).replace(underscoreRe, '-');
        return `slds-icon-${category}-${name}`;
      }

      return '';
    };

    class LightningPrimitiveIcon extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.iconName = void 0;
        this.src = void 0;
        this.svgClass = void 0;
        this.size = 'medium';
        this.variant = void 0;
        this.privateIconSvgTemplates = configProvider.getIconSvgTemplates();
      }

      get inlineSvgProvided() {
        return !!this.privateIconSvgTemplates;
      }

      renderedCallback() {
        if (this.iconName !== this.prevIconName && !this.inlineSvgProvided) {
          this.prevIconName = this.iconName;
          const svgElement = this.template.querySelector('svg');
          polyfill(svgElement);
        }
      }

      get href() {
        return this.src || getIconPath(this.iconName, dir);
      }

      get name() {
        return getName(this.iconName);
      }

      get normalizedSize() {
        return normalizeString(this.size, {
          fallbackValue: 'medium',
          validValues: ['xx-small', 'x-small', 'small', 'medium', 'large']
        });
      }

      get normalizedVariant() {
        // NOTE: Leaving a note here because I just wasted a bunch of time
        // investigating why both 'bare' and 'inverse' are supported in
        // lightning-primitive-icon. lightning-icon also has a deprecated
        // 'bare', but that one is synonymous to 'inverse'. This 'bare' means
        // that no classes should be applied. So this component needs to
        // support both 'bare' and 'inverse' while lightning-icon only needs to
        // support 'inverse'.
        return normalizeString(this.variant, {
          fallbackValue: '',
          validValues: ['bare', 'error', 'inverse', 'warning', 'success']
        });
      }

      get computedClass() {
        const {
          normalizedSize,
          normalizedVariant
        } = this;
        const classes = classSet(this.svgClass);

        if (normalizedVariant !== 'bare') {
          classes.add('slds-icon');
        }

        switch (normalizedVariant) {
          case 'error':
            classes.add('slds-icon-text-error');
            break;

          case 'warning':
            classes.add('slds-icon-text-warning');
            break;

          case 'success':
            classes.add('slds-icon-text-success');
            break;

          case 'inverse':
          case 'bare':
            break;

          default:
            // if custom icon is set, we don't want to set
            // the text-default class
            if (!this.src) {
              classes.add('slds-icon-text-default');
            }

        }

        if (normalizedSize !== 'medium') {
          classes.add(`slds-icon_${normalizedSize}`);
        }

        return classes.toString();
      }

      resolveTemplate() {
        const name = this.iconName;

        if (isValidName(name)) {
          const [spriteName, iconName] = name.split(':');
          const template = this.privateIconSvgTemplates[`${spriteName}_${iconName}`];

          if (template) {
            return template;
          }
        }

        return _tmpl$2;
      }

      render() {
        if (this.inlineSvgProvided) {
          return this.resolveTemplate();
        }

        return _tmpl$2;
      }

    }

    lwc.registerDecorators(LightningPrimitiveIcon, {
      publicProps: {
        iconName: {
          config: 0
        },
        src: {
          config: 0
        },
        svgClass: {
          config: 0
        },
        size: {
          config: 0
        },
        variant: {
          config: 0
        }
      },
      fields: ["privateIconSvgTemplates"]
    });

    var _lightningPrimitiveIcon = lwc.registerComponent(LightningPrimitiveIcon, {
      tmpl: _tmpl$2
    });

    function tmpl$3($api, $cmp, $slotset, $ctx) {
      const {
        c: api_custom_element,
        d: api_dynamic,
        h: api_element
      } = $api;
      return [api_custom_element("lightning-primitive-icon", _lightningPrimitiveIcon, {
        props: {
          "iconName": $cmp.state.iconName,
          "size": $cmp.size,
          "variant": $cmp.variant,
          "src": $cmp.state.src
        },
        key: 0
      }, []), $cmp.alternativeText ? api_element("span", {
        classMap: {
          "slds-assistive-text": true
        },
        key: 1
      }, [api_dynamic($cmp.alternativeText)]) : null];
    }

    var _tmpl$4 = lwc.registerTemplate(tmpl$3);
    tmpl$3.stylesheets = [];
    tmpl$3.stylesheetTokens = {
      hostAttribute: "lightning-icon_icon-host",
      shadowAttribute: "lightning-icon_icon"
    };

    /**
     * Represents a visual element that provides context and enhances usability.
     */

    class LightningIcon extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.state = {};
        this.alternativeText = void 0;
      }

      /**
       * A uri path to a custom svg sprite, including the name of the resouce,
       * for example: /assets/icons/standard-sprite/svg/test.svg#icon-heart
       * @type {string}
       */
      get src() {
        return this.privateSrc;
      }

      set src(value) {
        this.privateSrc = value; // if value is not present, then we set the state back
        // to the original iconName that was passed
        // this might happen if the user sets a custom icon, then
        // decides to revert back to SLDS by removing the src attribute

        if (!value) {
          this.state.iconName = this.iconName;
          this.classList.remove('slds-icon-standard-default');
        } // if isIE11 and the src is set
        // we'd like to show the 'standard:default' icon instead
        // for performance reasons.


        if (value && isIE11) {
          this.setDefault();
          return;
        }

        this.state.src = value;
      }
      /**
       * The Lightning Design System name of the icon.
       * Names are written in the format 'utility:down' where 'utility' is the category,
       * and 'down' is the specific icon to be displayed.
       * @type {string}
       * @required
       */


      get iconName() {
        return this.privateIconName;
      }

      set iconName(value) {
        this.privateIconName = value; // if src is set, we don't need to validate
        // iconName

        if (this.src) {
          return;
        }

        if (isValidName(value)) {
          const isAction = getCategory(value) === 'action'; // update classlist only if new iconName is different than state.iconName
          // otherwise classListMutation receives class:true and class: false and removes slds class

          if (value !== this.state.iconName) {
            classListMutation(this.classList, {
              'slds-icon_container_circle': isAction,
              [computeSldsClass(value)]: true,
              [computeSldsClass(this.state.iconName)]: false
            });
          }

          this.state.iconName = value;
        } else {
          console.warn(`<lightning-icon> Invalid icon name ${value}`); // eslint-disable-line no-console
          // Invalid icon names should render a blank icon. Remove any
          // classes that might have been previously added.

          classListMutation(this.classList, {
            'slds-icon_container_circle': false,
            [computeSldsClass(this.state.iconName)]: false
          });
          this.state.iconName = undefined;
        }
      }
      /**
       * The size of the icon. Options include xx-small, x-small, small, medium, or large.
       * The default is medium.
       * @type {string}
       * @default medium
       */


      get size() {
        return normalizeString(this.state.size, {
          fallbackValue: 'medium',
          validValues: ['xx-small', 'x-small', 'small', 'medium', 'large']
        });
      }

      set size(value) {
        this.state.size = value;
      }
      /**
       * The variant changes the appearance of a utility icon.
       * Accepted variants include inverse, success, warning, and error.
       * Use the inverse variant to implement a white fill in utility icons on dark backgrounds.
       * @type {string}
       */


      get variant() {
        return normalizeVariant(this.state.variant, this.state.iconName);
      }

      set variant(value) {
        this.state.variant = value;
      }

      connectedCallback() {
        this.classList.add('slds-icon_container');
      }

      setDefault() {
        this.state.src = undefined;
        this.state.iconName = 'standard:default';
        this.classList.add('slds-icon-standard-default');
      }

    }

    lwc.registerDecorators(LightningIcon, {
      publicProps: {
        alternativeText: {
          config: 0
        },
        src: {
          config: 3
        },
        iconName: {
          config: 3
        },
        size: {
          config: 3
        },
        variant: {
          config: 3
        }
      },
      track: {
        state: 1
      }
    });

    var _lightningIcon = lwc.registerComponent(LightningIcon, {
      tmpl: _tmpl$4
    });

    function normalizeVariant(variant, iconName) {
      // Unfortunately, the `bare` variant was implemented to do what the
      // `inverse` variant should have done. Keep this logic for as long as
      // we support the `bare` variant.
      if (variant === 'bare') {
        // TODO: Deprecation warning using strippable assertion
        variant = 'inverse';
      }

      if (getCategory(iconName) === 'utility') {
        return normalizeString(variant, {
          fallbackValue: '',
          validValues: ['error', 'inverse', 'warning', 'success']
        });
      }

      return 'inverse';
    }

    function tmpl$4($api, $cmp, $slotset, $ctx) {
      const {
        c: api_custom_element,
        h: api_element,
        d: api_dynamic,
        s: api_slot
      } = $api;
      return [api_element("article", {
        className: $cmp.computedWrapperClassNames,
        key: 14
      }, [api_element("header", {
        classMap: {
          "slds-card__header": true,
          "slds-grid": true
        },
        key: 9
      }, [api_element("div", {
        classMap: {
          "slds-media": true,
          "slds-media_center": true,
          "slds-has-flexi-truncate": true
        },
        key: 6
      }, [$cmp.hasIcon ? api_element("div", {
        classMap: {
          "slds-media__figure": true
        },
        key: 1
      }, [api_custom_element("lightning-icon", _lightningIcon, {
        props: {
          "iconName": $cmp.iconName,
          "size": "small"
        },
        key: 0
      }, [])]) : null, api_element("div", {
        classMap: {
          "slds-media__body": true,
          "slds-truncate": true
        },
        key: 5
      }, [api_element("h2", {
        key: 4
      }, [api_element("span", {
        classMap: {
          "slds-text-heading_small": true
        },
        key: 3
      }, [$cmp.hasStringTitle ? api_dynamic($cmp.title) : null, !$cmp.hasStringTitle ? api_slot("title", {
        attrs: {
          "name": "title"
        },
        key: 2
      }, [], $slotset) : null])])])]), api_element("div", {
        classMap: {
          "slds-no-flex": true
        },
        key: 8
      }, [api_slot("actions", {
        attrs: {
          "name": "actions"
        },
        key: 7
      }, [], $slotset)])]), api_element("div", {
        classMap: {
          "slds-card__body": true
        },
        key: 11
      }, [api_slot("", {
        key: 10
      }, [], $slotset)]), $cmp.showFooter ? api_element("div", {
        classMap: {
          "slds-card__footer": true
        },
        key: 13
      }, [api_slot("footer", {
        attrs: {
          "name": "footer"
        },
        key: 12
      }, [], $slotset)]) : null])];
    }

    var _tmpl$5 = lwc.registerTemplate(tmpl$4);
    tmpl$4.slots = ["title", "actions", "", "footer"];
    tmpl$4.stylesheets = [];
    tmpl$4.stylesheetTokens = {
      hostAttribute: "lightning-card_card-host",
      shadowAttribute: "lightning-card_card"
    };

    function isNarrow(variant) {
      return typeof variant === 'string' && variant.toLowerCase() === 'narrow';
    }
    function isBase(variant) {
      return typeof variant === 'string' && variant.toLowerCase() === 'base';
    }

    /**
     * Cards apply a container around a related grouping of information.
     * @slot title Placeholder for the card title, which can be represented by a header or h1 element.
     * The title is displayed at the top of the card, to the right of the icon.
     * Alternatively, use the title attribute if you don't need to pass in extra markup in your title.
     * @slot actions Placeholder for actionable components, such as lightning-button or lightning-button-menu.
     * Actions are displayed on the top right corner of the card next to the title.
     * @slot footer Placeholder for the card footer, which is displayed at the bottom of the card and is usually optional.
     * For example, the footer can display a "View All" link to navigate to a list view.
     * @slot default Placeholder for your content in the card body.
     */

    class LightningCard extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.title = void 0;
        this.iconName = void 0;
        this.privateVariant = 'base';
        this.showFooter = true;
      }

      set variant(value) {
        if (isNarrow(value) || isBase(value)) {
          this.privateVariant = value;
        } else {
          this.privateVariant = 'base';
        }
      }
      /**
       * The variant changes the appearance of the card.
       * Accepted variants include base or narrow.
       * This value defaults to base.
       *
       * @type {string}
       * @default base
       */


      get variant() {
        return this.privateVariant;
      }

      renderedCallback() {
        // initial check for no items
        if (this.footerSlot) {
          this.showFooter = this.footerSlot.assignedElements().length !== 0;
        }
      }

      get footerSlot() {
        return this.template.querySelector('slot[name=footer]');
      }

      get computedWrapperClassNames() {
        return classSet('slds-card').add({
          'slds-card_narrow': isNarrow(this.privateVariant)
        });
      }

      get hasIcon() {
        return !!this.iconName;
      }

      get hasStringTitle() {
        return !!this.title;
      }

    }

    lwc.registerDecorators(LightningCard, {
      publicProps: {
        title: {
          config: 0
        },
        iconName: {
          config: 0
        },
        variant: {
          config: 3
        }
      },
      track: {
        privateVariant: 1,
        showFooter: 1
      }
    });

    var _lightningCard = lwc.registerComponent(LightningCard, {
      tmpl: _tmpl$5
    });

    function tmpl$5($api, $cmp, $slotset, $ctx) {
      const {
        c: api_custom_element,
        d: api_dynamic,
        b: api_bind,
        h: api_element
      } = $api;
      const {
        _m0,
        _m1
      } = $ctx;
      return [api_element("button", {
        className: $cmp.computedButtonClass,
        attrs: {
          "name": $cmp.name,
          "accesskey": $cmp.computedAccessKey,
          "title": $cmp.computedTitle,
          "type": $cmp.normalizedType,
          "value": $cmp.value,
          "aria-label": $cmp.computedAriaLabel,
          "aria-expanded": $cmp.computedAriaExpanded,
          "aria-live": $cmp.computedAriaLive,
          "aria-atomic": $cmp.computedAriaAtomic
        },
        props: {
          "disabled": $cmp.disabled
        },
        key: 2,
        on: {
          "focus": _m0 || ($ctx._m0 = api_bind($cmp.handleButtonFocus)),
          "blur": _m1 || ($ctx._m1 = api_bind($cmp.handleButtonBlur))
        }
      }, [$cmp.showIconLeft ? api_custom_element("lightning-primitive-icon", _lightningPrimitiveIcon, {
        props: {
          "iconName": $cmp.iconName,
          "svgClass": $cmp.computedIconClass,
          "variant": "bare"
        },
        key: 0
      }, []) : null, api_dynamic($cmp.label), $cmp.showIconRight ? api_custom_element("lightning-primitive-icon", _lightningPrimitiveIcon, {
        props: {
          "iconName": $cmp.iconName,
          "svgClass": $cmp.computedIconClass,
          "variant": "bare"
        },
        key: 1
      }, []) : null])];
    }

    var _tmpl$6 = lwc.registerTemplate(tmpl$5);
    tmpl$5.stylesheets = [];
    tmpl$5.stylesheetTokens = {
      hostAttribute: "lightning-button_button-host",
      shadowAttribute: "lightning-button_button"
    };

    function tmpl$6($api, $cmp, $slotset, $ctx) {
      return [];
    }

    var _tmpl$7 = lwc.registerTemplate(tmpl$6);
    tmpl$6.stylesheets = [];
    tmpl$6.stylesheetTokens = {
      hostAttribute: "lightning-primitiveButton_primitiveButton-host",
      shadowAttribute: "lightning-primitiveButton_primitiveButton"
    };

    const ARIA_DESCRIBEDBY = 'aria-describedby';
    const ARIA_CONTROLS = 'aria-controls';
    /**
     * Primitive for button, buttonIcon and buttonIconStateful
     */

    class LightningPrimitiveButton extends lwc.LightningElement {
      /**
       * Specifies whether this button should be displayed in a disabled state.
       * Disabled buttons can't be clicked. This value defaults to false.
       *
       * @type {boolean}
       * @default false
       */
      get disabled() {
        return this.state.disabled;
      }

      set disabled(value) {
        this.state.disabled = normalizeBoolean(value);
      }

      set accessKey(value) {
        this.state.accesskey = value;
      }
      /**
       * Specifies a shortcut key to activate or focus an element.
       *
       * @type {string}
       */


      get accessKey() {
        return this.state.accesskey;
      }

      get computedAccessKey() {
        return this.state.accesskey;
      }
      /**
       * Displays tooltip text when the mouse cursor moves over the element.
       *
       * @type {string}
       */


      get title() {
        return this.state.title;
      }

      set title(value) {
        this.state.title = value;
      }
      /**
       * Label describing the button to assistive technologies.
       *
       * @type {string}
       */


      get ariaLabel() {
        return this.state.ariaLabel;
      }

      set ariaLabel(value) {
        this.state.ariaLabel = value;
      }

      get computedAriaLabel() {
        return this.state.ariaLabel;
      }
      /**
       * A space-separated list of element IDs that provide descriptive labels for the button.
       *
       * @type {string}
       */


      get ariaDescribedBy() {
        return this.state.ariaDescribedBy;
      }

      set ariaDescribedBy(value) {
        this.state.ariaDescribedBy = value;
        const button = this.template.querySelector('button');
        synchronizeAttrs(button, {
          [ARIA_DESCRIBEDBY]: value
        });
      }
      /**
       * A space-separated list of element IDs whose presence or content is controlled by this button.
       *
       * @type {string}
       */


      get ariaControls() {
        return this.state.ariaControls;
      }

      set ariaControls(value) {
        this.state.ariaControls = value;
        const button = this.template.querySelector('button');
        synchronizeAttrs(button, {
          [ARIA_CONTROLS]: value
        });
      }
      /**
       * Indicates whether an element that the button controls is expanded or collapsed.
       * Valid values are 'true' or 'false'. The default value is undefined.
       *
       * @type {string}
       * @default undefined
       */


      get ariaExpanded() {
        return this.state.ariaExpanded;
      }

      set ariaExpanded(value) {
        this.state.ariaExpanded = normalizeString(value, {
          fallbackValue: undefined,
          validValues: ['true', 'false']
        });
      }

      get computedAriaExpanded() {
        return this.state.ariaExpanded || null;
      }

      set ariaLive(value) {
        this.state.ariaLive = value;
      }
      /**
       * Indicates that the button can be updated when it doesn't have focus.
       * Valid values are 'polite', 'assertive', or 'off'. The polite value causes assistive
       * technologies to notify users of updates at a low priority, generally without interrupting.
       * The assertive value causes assistive technologies to notify users immediately,
       * potentially clearing queued speech updates.
       *
       * @type {string}
       */


      get ariaLive() {
        return this.state.ariaLive;
      }

      get computedAriaLive() {
        return this.state.ariaLive;
      }
      /**
       * Indicates whether assistive technologies present all, or only parts of,
       * the changed region. Valid values are 'true' or 'false'.
       *
       * @type {string}
       */


      get ariaAtomic() {
        return this.state.ariaAtomic || null;
      }

      set ariaAtomic(value) {
        this.state.ariaAtomic = normalizeString(value, {
          fallbackValue: undefined,
          validValues: ['true', 'false']
        });
      }

      get computedAriaAtomic() {
        return this.state.ariaAtomic || null;
      }
      /**
       * Sets focus on the element.
       */


      focus() {}

      constructor() {
        super(); // Workaround for an IE11 bug where click handlers on button ancestors
        // receive the click event even if the button element has the `disabled`
        // attribute set.

        this._initialized = false;
        this.state = {
          accesskey: null,
          ariaAtomic: null,
          ariaControls: null,
          ariaDescribedBy: null,
          ariaExpanded: null,
          ariaLabel: null,
          ariaLive: null,
          disabled: false
        };

        if (isIE11) {
          this.template.addEventListener('click', event => {
            if (this.disabled) {
              event.stopImmediatePropagation();
            }
          });
        }
      }

      renderedCallback() {
        if (!this._initialized) {
          const button = this.template.querySelector('button');
          synchronizeAttrs(button, {
            [ARIA_CONTROLS]: this.state.ariaControls,
            [ARIA_DESCRIBEDBY]: this.state.ariaDescribedBy
          });
          this._initialized = true;
        }
      }

    }

    lwc.registerDecorators(LightningPrimitiveButton, {
      publicProps: {
        disabled: {
          config: 3
        },
        accessKey: {
          config: 3
        },
        title: {
          config: 3
        },
        ariaLabel: {
          config: 3
        },
        ariaDescribedBy: {
          config: 3
        },
        ariaControls: {
          config: 3
        },
        ariaExpanded: {
          config: 3
        },
        ariaLive: {
          config: 3
        },
        ariaAtomic: {
          config: 3
        }
      },
      publicMethods: ["focus"],
      track: {
        state: 1
      },
      fields: ["_initialized"]
    });

    var LightningPrimitiveButton$1 = lwc.registerComponent(LightningPrimitiveButton, {
      tmpl: _tmpl$7
    });

    /**
     * A clickable element used to perform an action.
     */

    class LightningButton extends LightningPrimitiveButton$1 {
      constructor(...args) {
        super(...args);
        this.name = void 0;
        this.value = void 0;
        this.label = void 0;
        this.variant = 'neutral';
        this.iconName = void 0;
        this.iconPosition = 'left';
        this.type = 'button';
        this.title = null;
        this._order = null;
      }

      render() {
        return _tmpl$6;
      }

      get computedButtonClass() {
        return classSet('slds-button').add({
          'slds-button_neutral': this.normalizedVariant === 'neutral',
          'slds-button_brand': this.normalizedVariant === 'brand',
          'slds-button_outline-brand': this.normalizedVariant === 'brand-outline',
          'slds-button_destructive': this.normalizedVariant === 'destructive',
          'slds-button_text-destructive': this.normalizedVariant === 'destructive-text',
          'slds-button_inverse': this.normalizedVariant === 'inverse',
          'slds-button_success': this.normalizedVariant === 'success',
          'slds-button_first': this._order === 'first',
          'slds-button_middle': this._order === 'middle',
          'slds-button_last': this._order === 'last'
        }).toString();
      }

      get computedTitle() {
        return this.title;
      }

      get normalizedVariant() {
        return normalizeString(this.variant, {
          fallbackValue: 'neutral',
          validValues: ['base', 'neutral', 'brand', 'brand-outline', 'destructive', 'destructive-text', 'inverse', 'success']
        });
      }

      get normalizedType() {
        return normalizeString(this.type, {
          fallbackValue: 'button',
          validValues: ['button', 'reset', 'submit']
        });
      }

      get normalizedIconPosition() {
        return normalizeString(this.iconPosition, {
          fallbackValue: 'left',
          validValues: ['left', 'right']
        });
      }

      get showIconLeft() {
        return this.iconName && this.normalizedIconPosition === 'left';
      }

      get showIconRight() {
        return this.iconName && this.normalizedIconPosition === 'right';
      }

      get computedIconClass() {
        return classSet('slds-button__icon').add({
          'slds-button__icon_left': this.normalizedIconPosition === 'left',
          'slds-button__icon_right': this.normalizedIconPosition === 'right'
        }).toString();
      }

      handleButtonFocus() {
        this.dispatchEvent(new CustomEvent('focus'));
      }

      handleButtonBlur() {
        this.dispatchEvent(new CustomEvent('blur'));
      }
      /**
       * Sets focus on the button.
       */


      focus() {
        if (this._connected) {
          this.template.querySelector('button').focus();
        }
      }
      /**
       * Clicks the button.
       */


      click() {
        if (this._connected) {
          this.template.querySelector('button').click();
        }
      }
      /**
       * {Function} setOrder - Sets the order value of the button when in the context of a button-group or other ordered component
       * @param {String} order -  The order string (first, middle, last)
       */


      setOrder(order) {
        this._order = order;
      }
      /**
       * Once we are connected, we fire a register event so the button-group (or other) component can register
       * the buttons.
       */


      connectedCallback() {
        this._connected = true;
        const privatebuttonregister = new CustomEvent('privatebuttonregister', {
          bubbles: true,
          detail: {
            callbacks: {
              setOrder: this.setOrder.bind(this),
              setDeRegistrationCallback: deRegistrationCallback => {
                this._deRegistrationCallback = deRegistrationCallback;
              }
            }
          }
        });
        this.dispatchEvent(privatebuttonregister);
      }

      disconnectedCallback() {
        this._connected = false;

        if (this._deRegistrationCallback) {
          this._deRegistrationCallback();
        }
      }

    }

    LightningButton.delegatesFocus = true;

    lwc.registerDecorators(LightningButton, {
      publicProps: {
        name: {
          config: 0
        },
        value: {
          config: 0
        },
        label: {
          config: 0
        },
        variant: {
          config: 0
        },
        iconName: {
          config: 0
        },
        iconPosition: {
          config: 0
        },
        type: {
          config: 0
        }
      },
      publicMethods: ["focus", "click"],
      track: {
        title: 1,
        _order: 1
      }
    });

    var _lightningButton = lwc.registerComponent(LightningButton, {
      tmpl: _tmpl$6
    });
    LightningButton.interopMap = {
      exposeNativeEvent: {
        click: true,
        focus: true,
        blur: true
      }
    };

    function stylesheet$2(hostSelector, shadowSelector, nativeShadow) {
      return "\n" + (nativeShadow ? (":host {display: block;}") : (hostSelector + " {display: block;}")) + "\n";
    }
    var _implicitStylesheets$2 = [stylesheet$2];

    function tmpl$7($api, $cmp, $slotset, $ctx) {
      const {
        c: api_custom_element,
        d: api_dynamic,
        h: api_element
      } = $api;
      return [api_element("div", {
        classMap: {
          "slds-form-element__icon": true
        },
        key: 3
      }, [api_element("button", {
        classMap: {
          "slds-button": true,
          "slds-button_icon": true
        },
        attrs: {
          "type": "button"
        },
        key: 2
      }, [api_custom_element("lightning-primitive-icon", _lightningPrimitiveIcon, {
        props: {
          "svgClass": $cmp.computedSvgClass,
          "iconName": $cmp.iconName,
          "variant": "bare"
        },
        key: 0
      }, []), api_element("span", {
        classMap: {
          "slds-assistive-text": true
        },
        key: 1
      }, [api_dynamic($cmp.i18n.buttonAlternativeText)])])])];
    }

    var _tmpl$8 = lwc.registerTemplate(tmpl$7);
    tmpl$7.stylesheets = [];
    tmpl$7.stylesheetTokens = {
      hostAttribute: "lightning-helptext_helptext-host",
      shadowAttribute: "lightning-helptext_helptext"
    };

    var labelButtonAlternativeText = 'Help';

    const POSITION_ATTR_NAME = 'data-position-id';

    class BrowserWindow {
      get window() {
        if (!this._window) {
          this._window = window; // JTEST/Ingtegration: getComputedStyle may be null

          if (!this.window.getComputedStyle) {
            this.window.getComputedStyle = node => {
              return node.style;
            };
          }
        }

        return this._window;
      }

      mockWindow(value) {
        // For test, allow mock window.
        this._window = value;
      }

      get documentElement() {
        assert(this.window.document, 'Missing window.document');
        return this.window.document.documentElement;
      }

      get MutationObserver() {
        return this.window.MutationObserver;
      }

      isWindow(element) {
        return element && element.toString() === '[object Window]';
      }

    }

    const WindowManager = new BrowserWindow();

    function isShadowRoot(node) {
      return node && node.nodeType === 11;
    }

    function enumerateParent(elem, stopEl, checker) {
      // document.body is not necessarily a body tag, because of the (very rare)
      // case of a frameset.
      if (!elem || elem === stopEl || elem === document.body) {
        return null;
      } // if overflow is auto and overflow-y is also auto,
      // however in firefox the opposite is not true


      try {
        // getComputedStyle throws an exception
        // if elem is not an element
        // (can happen during unrender)
        const computedStyle = WindowManager.window.getComputedStyle(elem);

        if (!computedStyle) {
          return null;
        }

        if (checker(computedStyle)) {
          return elem;
        }

        return enumerateParent(isShadowRoot(elem.parentNode) ? elem.parentNode.host : elem.parentNode, stopEl, checker);
      } catch (e) {
        return null;
      }
    }

    function getScrollableParent(elem, stopEl) {
      return enumerateParent(elem, stopEl, computedStyle => {
        const overflow = computedStyle['overflow-y'];
        return overflow === 'auto' || overflow === 'scroll';
      });
    }

    function queryOverflowHiddenParent(elem, stopEl) {
      return enumerateParent(elem, stopEl, computedStyle => {
        return computedStyle['overflow-x'] === 'hidden' || computedStyle['overflow-y'] === 'hidden';
      });
    }

    function isInDom(el) {
      if (el === WindowManager.window) {
        return true;
      }

      if (!isShadowRoot(el.parentNode) && el.parentNode && el.parentNode.tagName && el.parentNode.tagName.toUpperCase() === 'BODY') {
        return true;
      }

      if (isShadowRoot(el.parentNode) && el.parentNode.host) {
        return isInDom(el.parentNode.host);
      }

      if (el.parentNode) {
        return isInDom(el.parentNode);
      }

      return false;
    }
    function isDomNode(obj) {
      return obj.nodeType && (obj.nodeType === 1 || obj.nodeType === 11);
    }
    function timeout(time) {
      return new Promise(resolve => {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
          resolve();
        }, time);
      });
    }
    function getPositionTarget(element) {
      return element.tagName === 'TEXTAREA' ? isShadowRoot(element.parentNode) ? element.parentNode.host : element.parentNode : element;
    }
    let lastId = 1000000;
    function generateUniqueSelector() {
      return `lgcp-${lastId++}`;
    }
    function normalizeElement(element) {
      const selector = generateUniqueSelector();
      element.setAttribute(POSITION_ATTR_NAME, selector);
      element = // eslint-disable-next-line @lwc/lwc/no-document-query
      document.querySelector(`[${POSITION_ATTR_NAME}="${selector}"]`) || element;
      return element;
    }

    function isInsideOverlay(element, modalOnly) {
      if (!element) {
        return {
          isInside: false,
          overlay: null
        };
      }

      if (element.classList && (element.classList.contains('uiModal') || element.localName === 'lightning-dialog' || !modalOnly && element.classList.contains('uiPanel'))) {
        return {
          isInside: true,
          overlay: element
        };
      }

      if (!element.parentNode) {
        return {
          isInside: false,
          overlay: null
        };
      }

      return isInsideOverlay(isShadowRoot(element.parentNode) ? element.parentNode.host : element.parentNode, modalOnly);
    }

    function isInsideModal(element) {
      return isInsideOverlay(element, true);
    }
    function normalizePosition(element, nextIndex, target, alignWidth) {
      // Set element position to fixed
      // 1. element is inside overlay
      // or 2. When element isn't align with target's width, and target's parent has overflow-x:hidden setting.
      const isFixed = isInsideOverlay(element).isInside || !alignWidth && queryOverflowHiddenParent(target, WindowManager.window);
      element.style.position = isFixed ? 'fixed' : 'absolute';
      element.style.zIndex = nextIndex || 0;
      element.style.left = '-9999px'; // Avoid flicker
      // we always position from the left, but in RTL mode Omakase swaps left and right properties.
      // To always allow positioning from the left we set right to auto so position library can do its work.

      element.style.right = 'auto';
      element.style.top = '0px'; // Avoid flicker

      return element;
    }
    function requestAnimationFrameAsPromise() {
      return new Promise(resolve => {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        requestAnimationFrame(() => resolve());
      });
    }

    const Direction = {
      Center: 'center',
      Middle: 'middle',
      Right: 'right',
      Left: 'left',
      Bottom: 'bottom',
      Top: 'top',
      Default: 'default'
    };
    const VerticalMap = {
      top: Direction.Top,
      bottom: Direction.Bottom,
      center: Direction.Middle
    };
    const HorizontalMap = {
      left: Direction.Left,
      right: Direction.Right,
      center: Direction.Center
    };
    const FlipMap = {
      left: Direction.Right,
      right: Direction.Left,
      top: Direction.Bottom,
      bottom: Direction.Top,
      center: Direction.Center,
      default: Direction.Right
    };

    function getWindowSize() {
      return {
        width: WindowManager.window.innerWidth || document.body.clientWidth || 0,
        height: WindowManager.window.innerHeight || document.body.clientHeight || 0
      };
    }

    function normalizeDirection$1(direction, defaultValue) {
      return normalizeString(direction, {
        fallbackValue: defaultValue || Direction.Default,
        validValues: [Direction.Center, Direction.Right, Direction.Left, Direction.Bottom, Direction.Top, Direction.Middle, Direction.Default]
      });
    }
    function mapToHorizontal(value) {
      value = normalizeDirection$1(value, Direction.Left);
      return HorizontalMap[value];
    }
    function mapToVertical(value) {
      value = normalizeDirection$1(value, Direction.Left);
      return VerticalMap[value];
    }
    function flipDirection(value) {
      value = normalizeDirection$1(value, Direction.Left);
      return FlipMap[value];
    } // TODO: Remove, not currently in use.
    function checkFlipPossibility(element, target, leftAsBoundary) {
      const viewPort = getWindowSize();
      const elemRect = element.getBoundingClientRect();
      const referenceElemRect = target.getBoundingClientRect();
      const height = typeof elemRect.height !== 'undefined' ? elemRect.height : elemRect.bottom - elemRect.top;
      const width = typeof elemRect.width !== 'undefined' ? elemRect.width : elemRect.right - elemRect.left; // TODO: We'll need to revisit the leftAsBoundary config property. Either we'll need a better
      // name to cover the RTL language cases and maybe open up the possibility of bounding the
      // element to the target in both the horizontal and vertical directions.
      // The boundary shrinks the available area to the edge of the target rather than the viewport.

      let rightAsBoundary = false;

      if (document.dir === 'rtl') {
        rightAsBoundary = leftAsBoundary;
        leftAsBoundary = false;
      }

      const hasSpaceAbove = referenceElemRect.top >= height;
      const hasSpaceBelow = viewPort.height - referenceElemRect.bottom >= height; // Assuming left alignment is specified this tests if:
      // - there's room to accommodate the element with right alignment
      // - there's not enough room to accommodate the element with left alignment

      const shouldAlignToRight = referenceElemRect.right >= width && referenceElemRect.left + width > (rightAsBoundary ? referenceElemRect.right : viewPort.width); // Assuming right alignment is specified this tests if:
      // - there's room to accommodate the element with left alignment
      // - there's not enough room to accommodate the element with right alignment

      const shouldAlignToLeft = referenceElemRect.left + width <= viewPort.width && referenceElemRect.right - width < (leftAsBoundary ? referenceElemRect.left : 0); // Assuming center alignment, does the viewport have space to fit half of the element around
      // the target?

      const centerOverflow = {
        left: referenceElemRect.left - width * 0.5 < 0,
        right: referenceElemRect.right + width * 0.5 > viewPort.width,
        top: referenceElemRect.top - height * 0.5 < 0,
        bottom: referenceElemRect.bottom + height * 0.5 > viewPort.height
      };
      return {
        shouldAlignToLeft,
        shouldAlignToRight,
        hasSpaceAbove,
        hasSpaceBelow,
        centerOverflow
      };
    }

    class Transformer {
      constructor(pad, boxDirections, transformX, transformY) {
        this.pad = pad || 0;
        this.boxDirections = boxDirections || {
          left: true,
          right: true
        };

        this.transformX = transformX || function () {};

        this.transformY = transformY || function () {};
      }

      transform() {// no-op
      }

    }

    class TopTransformer extends Transformer {
      transform(targetBox, elementBox) {
        return {
          top: this.transformY(targetBox.top, targetBox, elementBox) + this.pad
        };
      }

    }

    class BottomTransFormer extends Transformer {
      transform(targetBox, elementBox) {
        return {
          top: this.transformY(targetBox.top, targetBox, elementBox) - elementBox.height - this.pad
        };
      }

    }

    class CenterTransformer extends Transformer {
      transform(targetBox, elementBox) {
        return {
          left: Math.floor(this.transformX(targetBox.left, targetBox, elementBox) - 0.5 * elementBox.width)
        };
      }

    }

    class MiddleTransformer extends Transformer {
      transform(targetBox, elementBox) {
        return {
          top: Math.floor(0.5 * (2 * targetBox.top + targetBox.height - elementBox.height))
        };
      }

    }

    class LeftTransformer extends Transformer {
      transform(targetBox, elementBox) {
        return {
          left: this.transformX(targetBox.left, targetBox, elementBox) + this.pad
        };
      }

    }

    class RightTransformer extends Transformer {
      transform(targetBox, elementBox) {
        return {
          left: this.transformX(targetBox.left, targetBox, elementBox) - elementBox.width - this.pad
        };
      }

    }

    class BelowTransformer extends Transformer {
      transform(targetBox, elementBox) {
        const top = targetBox.top + targetBox.height + this.pad;
        return elementBox.top < top ? {
          top
        } : {};
      }

    }

    const MIN_HEIGHT = 36; // Minimum Line Height

    const MIN_WIDTH = 36;

    class ShrinkingBoxTransformer extends Transformer {
      transform(targetBox, elementBox) {
        const retBox = {};

        if (this.boxDirections.top && elementBox.top < targetBox.top + this.pad) {
          retBox.top = targetBox.top + this.pad;
          retBox.height = Math.max(elementBox.height - (retBox.top - elementBox.top), MIN_HEIGHT);
        }

        if (this.boxDirections.left && elementBox.left < targetBox.left + this.pad) {
          retBox.left = targetBox.left + this.pad;
          retBox.width = Math.max(elementBox.width - (retBox.left - elementBox.left), MIN_WIDTH);
        }

        if (this.boxDirections.right && elementBox.left + elementBox.width > targetBox.left + targetBox.width - this.pad) {
          retBox.right = targetBox.left + targetBox.width - this.pad;
          retBox.width = Math.max(retBox.right - (retBox.left || elementBox.left), MIN_WIDTH);
        }

        if (this.boxDirections.bottom && elementBox.top + elementBox.height > targetBox.top + targetBox.height - this.pad) {
          retBox.bottom = targetBox.top + targetBox.height - this.pad;
          retBox.height = Math.max(retBox.bottom - (retBox.top || elementBox.top), MIN_HEIGHT);
        }

        return retBox;
      }

    }

    class BoundingBoxTransformer extends Transformer {
      transform(targetBox, elementBox) {
        const retBox = {};

        if (this.boxDirections.top && elementBox.top < targetBox.top + this.pad) {
          retBox.top = targetBox.top + this.pad;
        }

        if (this.boxDirections.left && elementBox.left < targetBox.left + this.pad) {
          retBox.left = targetBox.left + this.pad;
        }

        if (this.boxDirections.right && elementBox.left + elementBox.width > targetBox.left + targetBox.width - this.pad) {
          retBox.left = targetBox.left + targetBox.width - elementBox.width - this.pad;
        }

        if (this.boxDirections.bottom && elementBox.top + elementBox.height > targetBox.top + targetBox.height - this.pad) {
          retBox.top = targetBox.top + targetBox.height - elementBox.height - this.pad;
        }

        return retBox;
      }

    }

    class InverseBoundingBoxTransformer extends Transformer {
      transform(targetBox, elementBox) {
        const retBox = {};

        if (this.boxDirections.left && targetBox.left - this.pad < elementBox.left) {
          retBox.left = targetBox.left - this.pad;
        }

        if (this.boxDirections.right && elementBox.left + elementBox.width < targetBox.left + targetBox.width + this.pad) {
          retBox.left = targetBox.width + this.pad - elementBox.width + targetBox.left;
        }

        if (this.boxDirections.top && targetBox.top < elementBox.top + this.pad) {
          retBox.top = targetBox.top - this.pad;
        }

        if (this.boxDirections.bottom && elementBox.top + elementBox.height < targetBox.top + targetBox.height + this.pad) {
          retBox.top = targetBox.height + this.pad - elementBox.height + targetBox.top;
        }

        return retBox;
      }

    }

    const TransformFunctions = {
      center(input, targetBox) {
        return Math.floor(input + 0.5 * targetBox.width);
      },

      right(input, targetBox) {
        return input + targetBox.width;
      },

      left(input) {
        return input;
      },

      bottom(input, targetBox) {
        return input + targetBox.height;
      }

    };
    const Transformers = {
      top: TopTransformer,
      bottom: BottomTransFormer,
      center: CenterTransformer,
      middle: MiddleTransformer,
      left: LeftTransformer,
      right: RightTransformer,
      below: BelowTransformer,
      'bounding box': BoundingBoxTransformer,
      'shrinking box': ShrinkingBoxTransformer,
      'inverse bounding box': InverseBoundingBoxTransformer,
      default: Transformer
    };
    function toTransformFunctions(value) {
      return TransformFunctions[value] || TransformFunctions.left;
    }

    class TransformBuilder {
      type(value) {
        this._type = value;
        return this;
      }

      align(horizontal, vertical) {
        this._transformX = toTransformFunctions(horizontal);
        this._transformY = toTransformFunctions(vertical);
        return this;
      }

      pad(value) {
        this._pad = parseInt(value, 10);
        return this;
      }

      boxDirections(value) {
        this._boxDirections = value;
        return this;
      }

      build() {
        const AConstructor = Transformers[this._type] ? Transformers[this._type] : Transformers[Direction.Default];
        return new AConstructor(this._pad || 0, this._boxDirections || {}, this._transformX || toTransformFunctions(Direction.left), this._transformY || toTransformFunctions(Direction.left));
      }

    }

    class Constraint {
      constructor(type, config) {
        const {
          target,
          element,
          pad,
          boxDirections
        } = config;
        const {
          horizontal,
          vertical
        } = config.targetAlign;
        this._element = element;
        this._targetElement = target;
        this.destroyed = false;
        this._transformer = new TransformBuilder().type(type).align(horizontal, vertical).pad(pad).boxDirections(boxDirections).build();
      }

      detach() {
        this._disabled = true;
      }

      attach() {
        this._disabled = false;
      }

      computeDisplacement() {
        if (!this._disabled) {
          this._targetElement.refresh();

          this._element.refresh();

          this._pendingBox = this._transformer.transform(this._targetElement, this._element);
        }

        return this;
      }

      computePosition() {
        const el = this._element;

        if (!this._disabled) {
          Object.keys(this._pendingBox).forEach(key => {
            el.setDirection(key, this._pendingBox[key]);
          });
        }

        return this;
      }

      destroy() {
        this._element.release();

        this._targetElement.release();

        this._disabled = true;
        this.destroyed = true;
      }

    }

    class ElementProxy {
      constructor(el, id) {
        this.id = id;
        this.width = 0;
        this.height = 0;
        this.left = 0;
        this.top = 0;
        this.right = 0;
        this.bottom = 0;
        this._dirty = false;
        this._node = null;
        this._releaseCb = null;

        if (!el) {
          throw new Error('Element missing');
        } // W-3262919
        // for some reason I cannot figure out sometimes the
        // window, which clearly a window object, is not the window object
        // this will correct that. It might be related to locker


        if (WindowManager.isWindow(el)) {
          el = WindowManager.window;
        }

        this._node = el;
        this.setupObserver();
        this.refresh();
      }

      setupObserver() {
        // this check is because phantomjs does not support
        // mutation observers. The consqeuence here
        // is that any browser without mutation observers will
        // fail to update dimensions if they changwe after the proxy
        // is created and the proxy is not not refreshed
        if (WindowManager.MutationObserver && !this._node.isObserved) {
          // Use mutation observers to invalidate cache. It's magic!
          this._observer = new WindowManager.MutationObserver(this.refresh.bind(this)); // do not observe the window

          if (!WindowManager.isWindow(this._node)) {
            this._observer.observe(this._node, {
              attributes: true,
              childList: true,
              characterData: true,
              subtree: true
            });

            this._node.isObserved = true;
          }
        }
      }

      setReleaseCallback(cb, scope) {
        const scopeObj = scope || this;
        this._releaseCb = cb.bind(scopeObj);
      }

      checkNodeIsInDom() {
        // if underlying DOM node is gone,
        // this proxy should be released
        if (!isInDom(this._node)) {
          return false;
        }

        return true;
      }

      refresh() {
        const w = WindowManager.window;

        if (!this.isDirty()) {
          if (!this.checkNodeIsInDom()) {
            return this.release();
          }

          let box, x, scrollTop, scrollLeft;

          if (typeof w.pageYOffset !== 'undefined') {
            scrollTop = w.pageYOffset;
            scrollLeft = w.pageXOffset;
          } else {
            scrollTop = w.scrollY;
            scrollLeft = w.scrollX;
          }

          if (!WindowManager.isWindow(this._node)) {
            // force paint
            // eslint-disable-next-line no-unused-vars
            const offsetHeight = this._node.offsetHeight;
            box = this._node.getBoundingClientRect(); // not using integers causes weird rounding errors
            // eslint-disable-next-line guard-for-in

            for (x in box) {
              this[x] = Math.floor(box[x]);
            }

            this.top = Math.floor(this.top + scrollTop);
            this.bottom = Math.floor(this.top + box.height);
            this.left = Math.floor(this.left + scrollLeft);
            this.right = Math.floor(this.left + box.width);
          } else {
            box = {};
            this.width = WindowManager.documentElement.clientWidth;
            this.height = WindowManager.documentElement.clientHeight;
            this.left = scrollLeft;
            this.top = scrollTop;
            this.right = WindowManager.documentElement.clientWidth + scrollLeft;
            this.bottom = WindowManager.documentElement.clientHeight;
          }

          this._dirty = false;
        }

        return this._dirty;
      }

      getNode() {
        return this._node;
      }

      isDirty() {
        return this._dirty;
      }

      bake() {
        const w = WindowManager.window;

        const absPos = this._node.getBoundingClientRect();

        const style = w.getComputedStyle(this._node) || this._node.style;

        const hasPageOffset = typeof w.pageYOffset !== 'undefined';
        const scrollTop = hasPageOffset ? w.pageYOffset : w.scrollY;
        const scrollLeft = hasPageOffset ? w.pageXOffset : w.scrollX;
        const originalLeft = style.left.match(/auto|fixed/) ? '0' : parseInt(style.left.replace('px', ''), 10);
        const originalTop = style.top.match(/auto|fixed/) ? '0' : parseInt(style.top.replace('px', ''), 10);
        const leftDif = Math.round(this.left - (absPos.left + scrollLeft));
        const topDif = this.top - (absPos.top + scrollTop);
        this._node.style.left = `${originalLeft + leftDif}px`;
        this._node.style.top = `${originalTop + topDif}px`;

        if (this._restoreSize) {
          // Only store the first height/width which is the original height/width.
          if (this.originalHeight === undefined) {
            this.originalHeight = this._node.style.height;
          }

          if (this.originalWidth === undefined) {
            this.originalWidth = this._node.style.width;
          }

          this._node.style.width = `${this.width}px`;
          this._node.style.height = `${this.height}px`;
        }

        this._dirty = false;
      }

      setDirection(direction, val) {
        this[direction] = val;
        this._dirty = true; // if size is changed, should restore the original size.

        if (direction === 'height' || direction === 'width') {
          this._restoreSize = true;
        }
      }

      release() {
        if (this._restoreSize) {
          this._node.style.width = this.originalWidth;
          this._node.style.height = this.originalHeight;

          if (this._removeMinHeight) {
            this._node.style.minHeight = '';
          }
        }

        if (this._releaseCb) {
          this._releaseCb(this);
        } // Due to https://github.com/salesforce/lwc/pull/1423
        // require to call disconnect explicitly.


        if (this._observer) {
          this._observer.disconnect();

          this._observer = null;
        }
      }

      querySelectorAll(selector) {
        return this._node.querySelectorAll(selector);
      }

    }

    class ProxyCache {
      constructor() {
        this.proxyCache = {};
      }

      get count() {
        return Object.keys(this.proxyCache).length;
      }

      releaseOrphanProxies() {
        for (const proxy in this.proxyCache) {
          if (!this.proxyCache[proxy].el.checkNodeIsInDom()) {
            this.proxyCache[proxy].el.release();
          }
        }
      }

      bakeOff() {
        for (const proxy in this.proxyCache) {
          if (this.proxyCache[proxy].el.isDirty()) {
            this.proxyCache[proxy].el.bake();
          }
        }
      }

      getReferenceCount(proxy) {
        const id = proxy.id;

        if (!id || !this.proxyCache[id]) {
          return 0;
        }

        return this.proxyCache[id].refCount;
      }

      release(proxy) {
        const proxyInstance = this.proxyCache[proxy.id];

        if (proxyInstance) {
          --proxyInstance.refCount;
        }

        if (proxyInstance && proxyInstance.refCount <= 0) {
          delete this.proxyCache[proxy.id];
        }
      }

      reset() {
        this.proxyCache = {};
      }

      create(element) {
        let key = 'window';

        if (!WindowManager.isWindow(element)) {
          key = element ? element.getAttribute(POSITION_ATTR_NAME) : null; // 1 - Node.ELEMENT_NODE, 11 - Node.DOCUMENT_FRAGMENT_NODE

          assert(key && element.nodeType && (element.nodeType !== 1 || element.nodeType !== 11), `Element Proxy requires an element and has property ${POSITION_ATTR_NAME}`);
        }

        if (this.proxyCache[key]) {
          this.proxyCache[key].refCount++;
          return this.proxyCache[key].el;
        }

        const newProxy = new ElementProxy(element, key);
        newProxy.setReleaseCallback(release, newProxy);
        this.proxyCache[key] = {
          el: newProxy,
          refCount: 1
        }; // run GC

        timeout(0).then(() => {
          this.releaseOrphanProxies();
        });
        return this.proxyCache[key].el;
      }

    }

    lwc.registerDecorators(ProxyCache, {
      fields: ["proxyCache"]
    });

    const elementProxyCache = new ProxyCache();
    function bakeOff() {
      elementProxyCache.bakeOff();
    }
    function release(proxy) {
      return elementProxyCache.release(proxy);
    }
    function createProxy(element) {
      return elementProxyCache.create(element);
    }

    class RepositionQueue {
      constructor() {
        this.callbacks = [];
        this.repositionScheduled = false;
        this._constraints = [];
        this.timeoutId = 0;
        this.lastIndex = getZIndexBaseline();
        this.eventsBound = false;
      }

      get nextIndex() {
        return this.lastIndex++;
      }

      get constraints() {
        return this._constraints;
      }

      set constraints(value) {
        this._constraints = this._constraints.concat(value);
      }

      dispatchRepositionCallbacks() {
        while (this.callbacks.length > 0) {
          this.callbacks.shift()();
        }
      }

      add(callback) {
        if (typeof callback === 'function') {
          this.callbacks.push(callback);
          return true;
        }

        return false;
      }

      scheduleReposition(callback) {
        if (this.timeoutId === 0) {
          // eslint-disable-next-line @lwc/lwc/no-async-operation
          this.timeoutId = setTimeout(() => {
            this.reposition(callback);
          }, 10);
        }
      }

      reposition(callback) {
        // all the callbacks will be called
        if (typeof callback === 'function') {
          this.callbacks.push(callback);
        } // this is for throttling


        clearTimeout(this.timeoutId);
        this.timeoutId = 0; // this semaphore is to make sure
        // if reposition is called twice within one frame
        // we only run this once

        if (!this.repositionScheduled) {
          // eslint-disable-next-line @lwc/lwc/no-async-operation
          requestAnimationFrame(() => {
            this.repositionScheduled = false; // this must be executed in order or constraints
            // will behave oddly

            this._constraints = this._constraints.filter(constraint => {
              if (!constraint.destroyed) {
                constraint.computeDisplacement().computePosition();
                return true;
              }

              return false;
            });
            bakeOff();
            this.dispatchRepositionCallbacks();
          });
          this.repositionScheduled = true;
        }
      }

      get repositioning() {
        if (!this._reposition) {
          this._reposition = this.scheduleReposition.bind(this);
        }

        return this._reposition;
      }

      bindEvents() {
        if (!this.eventsBound) {
          window.addEventListener('resize', this.repositioning);
          window.addEventListener('scroll', this.repositioning);
          this.eventsBound = true;
        }
      }

      detachEvents() {
        window.removeEventListener('resize', this.repositioning);
        window.removeEventListener('scroll', this.repositioning);
        this.eventsBound = false;
      }

      rebase(index) {
        if (this.lastIndex <= index) {
          this.lastIndex = index + 1;
        }
      }

    }

    lwc.registerDecorators(RepositionQueue, {
      fields: ["callbacks", "repositionScheduled", "_constraints", "timeoutId", "lastIndex", "eventsBound"]
    });

    const positionQueue = new RepositionQueue();
    function scheduleReposition(callback) {
      positionQueue.scheduleReposition(callback);
    }
    function bindEvents() {
      positionQueue.bindEvents();
    }
    function addConstraints(list) {
      positionQueue.constraints = list;
    }
    function reposition(callback) {
      positionQueue.reposition(callback);
    }
    function nextIndex() {
      return positionQueue.nextIndex;
    }
    function rebaseIndex(index) {
      return positionQueue.rebase(index);
    }

    class Relationship {
      constructor(config, constraintList, scrollableParent, observer) {
        this.config = config;
        this.constraintList = constraintList;
        this.scrollableParent = scrollableParent;
        this.observer = observer;
      }

      disable() {
        this.constraintList.forEach(constraintToDisable => {
          constraintToDisable.detach();
        });
      }

      enable() {
        this.constraintList.forEach(constraintToEnable => {
          constraintToEnable.attach();
        });
      }

      destroy() {
        if (this.config.removeListeners) {
          this.config.removeListeners();
          this.config.removeListeners = undefined;
        }

        while (this.constraintList.length > 0) {
          this.constraintList.pop().destroy();
        } // Clean up node appended to body of dom


        if (this.config.appendToBody && this.config.element) {
          // eslint-disable-next-line @lwc/lwc/no-document-query
          const nodeToRemove = document.querySelector(`[${POSITION_ATTR_NAME}="${this.config.element.getAttribute(POSITION_ATTR_NAME)}"]`);

          if (nodeToRemove) {
            nodeToRemove.parentNode.removeChild(nodeToRemove);
          }
        } // Due to https://github.com/salesforce/lwc/pull/1423
        // require to call disconnect explicitly.


        if (this.observer) {
          this.observer.disconnect();
          this.observer = null;
        }
      }

      reposition() {
        return new Promise(resolve => {
          reposition(() => {
            resolve();
          });
        });
      }

    }

    const DEFAULT_MIN_HEIGHT = '1.875rem';

    function setupObserver(config, scrollableParent) {
      const observedElement = config.element;
      let observer = null;

      if (WindowManager.MutationObserver && !observedElement.isObserved) {
        observer = new WindowManager.MutationObserver(() => {});
        observer.observe(observedElement, {
          attributes: true,
          subtree: true,
          childList: true
        });
        observedElement.isObserved = true;
      }

      if (scrollableParent) {
        scrollableParent.addEventListener('scroll', scheduleReposition);

        config.removeListeners = () => {
          scrollableParent.removeEventListener('scroll', scheduleReposition);
        };
      }

      return observer;
    }

    function validateConfig(config) {
      assert(config.element && isDomNode(config.element), 'Element is undefined or missing, or not a Dom Node');
      assert(config.target && (WindowManager.isWindow(config.target) || isDomNode(config.target)), 'Target is undefined or missing');
    }

    function createRelationship(config) {
      bindEvents();

      if (config.alignWidth && config.element.style.position === 'fixed') {
        config.element.style.width = config.target.getBoundingClientRect().width + 'px';
      }

      const constraintList = [];
      const scrollableParent = getScrollableParent(getPositionTarget(config.target), WindowManager.window); // This observer and the test for scrolling children
      // is so that if a panel contains a scroll we do not
      // proxy the events to the "parent"  (actually the target's parent)

      const observer = setupObserver(config, scrollableParent);

      if (config.appendToBody) {
        document.body.appendChild(config.element);
      }

      config.element = createProxy(config.element);
      config.target = createProxy(config.target); // Add horizontal constraint.

      const horizontalConfig = Object.assign({}, config);

      if (horizontalConfig.padLeft !== undefined) {
        horizontalConfig.pad = horizontalConfig.padLeft;
      } // Add vertical constraint.


      const verticalConfig = Object.assign({}, config);

      if (verticalConfig.padTop !== undefined) {
        verticalConfig.pad = verticalConfig.padTop;
      }

      constraintList.push(new Constraint(mapToHorizontal(config.align.horizontal), horizontalConfig));
      constraintList.push(new Constraint(mapToVertical(config.align.vertical), verticalConfig));
      const autoShrink = config.autoShrink.height || config.autoShrink.width;

      if (config.scrollableParentBound && scrollableParent) {
        const parent = normalizeElement(scrollableParent);
        const boxConfig = {
          element: config.element,
          enabled: config.enabled,
          target: createProxy(parent),
          align: {},
          targetAlign: {},
          pad: 3,
          boxDirections: {
            top: true,
            bottom: true,
            left: true,
            right: true
          }
        };

        if (autoShrink) {
          const style = boxConfig.element.getNode().style;

          if (!style.minHeight) {
            style.minHeight = config.minHeight;
            boxConfig.element._removeMinHeight = true;
          }

          boxConfig.boxDirections = {
            top: !!config.autoShrink.height,
            bottom: !!config.autoShrink.height,
            left: !!config.autoShrink.width,
            right: !!config.autoShrink.width
          };
          constraintList.push(new Constraint('shrinking box', boxConfig));
        } else {
          constraintList.push(new Constraint('bounding box', boxConfig));
        }
      }

      if (config.keepInViewport) {
        constraintList.push(new Constraint('bounding box', {
          element: config.element,
          enabled: config.enabled,
          target: createProxy(window),
          align: {},
          targetAlign: {},
          pad: 3,
          boxDirections: {
            top: true,
            bottom: true,
            left: true,
            right: true
          }
        }));
      }

      addConstraints(constraintList);
      reposition();
      return new Relationship(config, constraintList, scrollableParent, observer);
    }

    function isAutoFlipHorizontal(config) {
      return config.autoFlip || config.autoFlipHorizontal;
    }

    function isAutoFlipVertical(config) {
      return config.autoFlip || config.autoFlipVertical;
    }

    function normalizeAlignments(config, flipConfig) {
      const align = {
        horizontal: config.align.horizontal,
        vertical: config.align.vertical
      };
      const targetAlign = {
        horizontal: config.targetAlign.horizontal,
        vertical: config.targetAlign.vertical
      }; // Horizontal alignments flip for RTL languages.

      if (document.dir === 'rtl') {
        align.horizontal = flipDirection(align.horizontal);
        targetAlign.horizontal = flipDirection(targetAlign.horizontal);
      } // When using the autoFlip flags with center alignment, we change the element alignment to fit
      // within the viewport when it's detected that it overflows the edge of the viewport.


      let vFlip = false;

      if (isAutoFlipVertical(config)) {
        if (align.vertical === Direction.Bottom) {
          vFlip = !flipConfig.hasSpaceAbove && flipConfig.hasSpaceBelow;
        } else if (align.vertical === Direction.Top) {
          vFlip = flipConfig.hasSpaceAbove && !flipConfig.hasSpaceBelow;
        } else if (align.vertical === Direction.Center) {
          if (flipConfig.centerOverflow.top && !flipConfig.centerOverflow.bottom) {
            align.vertical = targetAlign.vertical = Direction.Top;
          } else if (flipConfig.centerOverflow.bottom && !flipConfig.centerOverflow.top) {
            align.vertical = targetAlign.vertical = Direction.Bottom;
          }
        }
      }

      let hFlip = false;

      if (isAutoFlipHorizontal(config)) {
        if (align.horizontal === Direction.Left) {
          hFlip = flipConfig.shouldAlignToRight;
        } else if (align.horizontal === Direction.Right) {
          hFlip = flipConfig.shouldAlignToLeft;
        } else if (align.horizontal === Direction.Center) {
          if (flipConfig.centerOverflow.left && !flipConfig.centerOverflow.right) {
            align.horizontal = targetAlign.horizontal = Direction.Left;
          } else if (flipConfig.centerOverflow.right && !flipConfig.centerOverflow.left) {
            align.horizontal = targetAlign.horizontal = Direction.Right;
          }
        }
      }

      return {
        align: {
          horizontal: hFlip ? flipDirection(align.horizontal) : normalizeDirection$1(align.horizontal, Direction.Left),
          vertical: vFlip ? flipDirection(align.vertical) : normalizeDirection$1(align.vertical, Direction.Top)
        },
        targetAlign: {
          horizontal: hFlip ? flipDirection(targetAlign.horizontal) : normalizeDirection$1(targetAlign.horizontal, Direction.Left),
          vertical: vFlip ? flipDirection(targetAlign.vertical) : normalizeDirection$1(targetAlign.vertical, Direction.Bottom)
        }
      };
    }

    function normalizeConfig(config) {
      config.align = config.align || {};
      config.targetAlign = config.targetAlign || {};
      const flipConfig = checkFlipPossibility(config.element, config.target, config.leftAsBoundary);
      const {
        align,
        targetAlign
      } = normalizeAlignments(config, flipConfig); // When inside modal, element may expand out of the viewport and be cut off.
      // So if inside modal, and don't have enough space above or below, will add bounding box rule.

      if (config.isInsideModal && !flipConfig.hasSpaceAbove && !flipConfig.hasSpaceBelow) {
        config.scrollableParentBound = true;
      }

      return {
        target: config.target,
        element: config.element,
        align,
        targetAlign,
        alignWidth: config.alignWidth,
        scrollableParentBound: config.scrollableParentBound,
        keepInViewport: config.keepInViewport,
        pad: config.pad,
        padTop: config.padTop,
        padLeft: config.padLeft,
        autoShrink: {
          height: config.autoShrink || config.autoShrinkHeight,
          width: config.autoShrink || config.autoShrinkWidth
        },
        minHeight: config.minHeight || DEFAULT_MIN_HEIGHT
      };
    }

    function toElement(root, target) {
      if (target && typeof target === 'string') {
        return root.querySelector(target);
      } else if (target && typeof target === 'function') {
        return target();
      }

      return target;
    }

    function startPositioning(root, config) {
      assert(root, 'Root is undefined or missing');
      assert(config, 'Config is undefined or missing');
      const node = normalizeElement(root);
      const target = toElement(node, config.target);
      const element = toElement(node, config.element); // when target/element is selector, there is chance, dom isn't present anymore.

      if (!target || !element) {
        return null;
      }

      config.target = normalizeElement(target);
      config.element = normalizeElement(element);
      const result = isInsideModal(config.element);
      config.isInsideModal = result.isInside; // stackManager will increase the zIndex too.
      // if detect inside modal, read modal zindex and rebase to it.

      if (config.isInsideModal && result.overlay) {
        const index = parseInt(result.overlay.style.zIndex, 10);
        rebaseIndex(index);
      } // Also should check if target inside modal too.


      const targetResult = isInsideModal(config.target);
      config.isInsideModal = targetResult.isInside; // if detect inside modal, read modal zindex and rebase to it.

      if (config.isInsideModal && targetResult.overlay) {
        const index = parseInt(targetResult.overlay.style.zIndex, 10);
        rebaseIndex(index);
      } // Element absolute / fixed must be set prior to getBoundingClientRect call or
      // the scrollable parent (usually due to uiModal/uiPanel) will push the page down.


      config.element = normalizePosition(config.element, nextIndex(), config.target, config.alignWidth);
      validateConfig(config);
      return createRelationship(normalizeConfig(config));
    }
    function stopPositioning(relationship) {
      if (relationship) {
        relationship.destroy();
      }
    }
    class AutoPosition {
      constructor(root) {
        this._autoPositionUpdater = null;
        this._root = root;
      }

      start(config) {
        return requestAnimationFrameAsPromise().then(() => {
          let promise = Promise.resolve();

          if (!this._autoPositionUpdater) {
            this._autoPositionUpdater = startPositioning(this._root, config);
          } else {
            promise = promise.then(() => {
              return this._autoPositionUpdater.reposition();
            });
          }

          return promise.then(() => {
            return this._autoPositionUpdater;
          });
        });
      }

      stop() {
        if (this._autoPositionUpdater) {
          stopPositioning(this._autoPositionUpdater);
          this._autoPositionUpdater = null;
        }

        return Promise.resolve();
      }

    }

    lwc.registerDecorators(AutoPosition, {
      fields: ["_autoPositionUpdater"]
    });

    function tmpl$8($api, $cmp, $slotset, $ctx) {
      const {
        b: api_bind,
        h: api_element
      } = $api;
      const {
        _m0
      } = $ctx;
      return [api_element("div", {
        classMap: {
          "slds-popover__body": true
        },
        context: {
          lwc: {
            dom: "manual"
          }
        },
        key: 0,
        on: {
          "mouseleave": _m0 || ($ctx._m0 = api_bind($cmp.handleMouseLeave))
        }
      }, [])];
    }

    var _tmpl$9 = lwc.registerTemplate(tmpl$8);
    tmpl$8.stylesheets = [];
    tmpl$8.stylesheetTokens = {
      hostAttribute: "lightning-primitiveBubble_primitiveBubble-host",
      shadowAttribute: "lightning-primitiveBubble_primitiveBubble"
    };

    const DEFAULT_ALIGN = {
      horizontal: 'left',
      vertical: 'bottom'
    };

    class LightningPrimitiveBubble extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.state = {
          visible: false,
          contentId: ''
        };
        this.divElement = void 0;
      }

      get contentId() {
        return this.state.contentId;
      }

      set contentId(value) {
        this.state.contentId = value;

        if (this.state.inDOM) {
          this.divEl.setAttribute('id', this.state.contentId);
        }
      }

      connectedCallback() {
        this.updateClassList();
        this.state.inDOM = true;
      }

      disconnectedCallback() {
        this.state.inDOM = false;
      }

      renderedCallback() {
        // set content manually once rendered
        // - this is required to avoid the content update being in the wrong 'tick'
        this.setContentManually();
        this.setIdManually();
      }

      set content(value) {
        this.state.content = value;

        if (this.state.inDOM) {
          this.setContentManually();
        }
      }

      get content() {
        return this.state.content || '';
      }

      get align() {
        return this.state.align || DEFAULT_ALIGN;
      }

      set align(value) {
        this.state.align = value;
        this.updateClassList();
      }

      get visible() {
        return this.state.visible;
      }

      set visible(value) {
        this.state.visible = value;
        this.updateClassList();
      }

      setIdManually() {
        this.divElement = this.divElement ? this.divElement : this.template.querySelector('div');
        this.divElement.setAttribute('id', this.state.contentId);
      } // manually set the content value


      setContentManually() {
        /* manipulate DOM directly */
        this.template.querySelector('.slds-popover__body').textContent = this.state.content;
      } // compute class value for this bubble


      updateClassList() {
        const classes = classSet('slds-popover').add('slds-popover_tooltip'); // show or hide bubble

        classes.add({
          'slds-rise-from-ground': this.visible,
          'slds-fall-into-ground': !this.visible
        }); // apply the proper nubbin CSS class

        const {
          horizontal,
          vertical
        } = this.align;
        classes.add({
          'slds-nubbin_top-left': horizontal === 'left' && vertical === 'top',
          'slds-nubbin_top-right': horizontal === 'right' && vertical === 'top',
          'slds-nubbin_bottom-left': horizontal === 'left' && vertical === 'bottom',
          'slds-nubbin_bottom-right': horizontal === 'right' && vertical === 'bottom',
          'slds-nubbin_bottom': horizontal === 'center' && vertical === 'bottom',
          'slds-nubbin_top': horizontal === 'center' && vertical === 'top',
          'slds-nubbin_left': horizontal === 'left' && vertical === 'center',
          'slds-nubbin_right': horizontal === 'right' && vertical === 'center'
        });
        classListMutation(this.classList, classes);
      }

      handleMouseLeave() {
        this.visible = false;
      }

    }

    lwc.registerDecorators(LightningPrimitiveBubble, {
      publicProps: {
        contentId: {
          config: 3
        },
        content: {
          config: 3
        },
        align: {
          config: 3
        },
        visible: {
          config: 3
        }
      },
      track: {
        state: 1
      },
      fields: ["divElement"]
    });

    var LightningPrimitiveBubble$1 = lwc.registerComponent(LightningPrimitiveBubble, {
      tmpl: _tmpl$9
    });

    function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? Object(arguments[i]) : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
    const BUBBLE_ID = `salesforce-lightning-tooltip-bubble_${guid()}`;

    function isResizeObserverSupported() {
      return window.ResizeObserver != null;
    }

    function buildResizeObserver(callback) {
      if (isResizeObserverSupported()) {
        return new ResizeObserver(callback);
      }

      return {
        observe() {},

        unobserve() {}

      };
    }
    /**
     * Shared instance of a primitive bubble used as a tooltip by most components. This was originally
     * defined in the helptext component which is where the minWidth style came from.
     * TODO: We may want to revisit the minWidth style with the PO and/or UX.
     */


    let CACHED_BUBBLE_ELEMENT;

    function getCachedBubbleElement() {
      if (!CACHED_BUBBLE_ELEMENT) {
        CACHED_BUBBLE_ELEMENT = lwc.createElement('lightning-primitive-bubble', {
          is: LightningPrimitiveBubble$1
        });
        CACHED_BUBBLE_ELEMENT.contentId = BUBBLE_ID;
        CACHED_BUBBLE_ELEMENT.style.position = 'absolute';
        CACHED_BUBBLE_ELEMENT.style.minWidth = '75px'; // hide bubble element on create

        CACHED_BUBBLE_ELEMENT.classList.add('slds-hide');
        CACHED_BUBBLE_ELEMENT.addEventListener('transitionend', () => {
          // W-7201022 https://gus.lightning.force.com/lightning/r/ADM_Work__c/a07B00000079kNjIAI/view
          // The tooltip uses absolute positioning and visibility gets set to hidden to
          // hide it from view which means it's still part of the document layout.
          // If we don't hide the bubble it could stay on the page and accidentally scroll pages
          // in the console app after a tab switch, especially when the tab content lengths differ.
          if (!CACHED_BUBBLE_ELEMENT.visible) {
            CACHED_BUBBLE_ELEMENT.classList.add('slds-hide');
          }
        });
      }

      return CACHED_BUBBLE_ELEMENT;
    }

    const ARIA_DESCRIBEDBY$1 = 'aria-describedby';
    /**
     * Used as a position offset to compensate for the nubbin. The dimensions of the nubbin are not
     * included in the position library bounding box calculations. This is the size in pixels of the
     * nubbin.
     * TODO: We may want to measure this instead in cases it changes.
     */

    const NUBBIN_SIZE = 16;
    /**
     * Used in the calculation that moves the tooltip to a location that places the nubbin at the
     * center of the target element. This is the nubbin offset from the edge of the bubble in pixels
     * when using slds-nubbin_bottom-left or slds-nubbin_bottom-right.
     * TODO: We may want to measure this instead in case it changes.
     */

    const NUBBIN_OFFSET = 24;
    /**
     * Known tooltip types:
     * - info: used in cases where target already has click handlers such as button-icon
     * - toggle: used in cases where target only shows a tooltip such as helptext
     */

    const TooltipType = {
      Info: 'info',
      Toggle: 'toggle'
    };
    /**
     * Allows us to attach a tooltip to components. Typical usage is as follows:
     * - Create an instance of Tooltip
     * - Call Tooltip.initialize() to add the appropriate listeners to the element that needs a tooltip
     * See buttonIcon and buttonMenu for example usage.
     */

    class Tooltip {
      /**
       * A shared instance of primitiveBubble is used when an element is not specified in the config
       * object.
       * @param {string} value the content of the tooltip
       * @param {object} config specifies the root component, target element of the tooltip
       */
      constructor(value, config) {
        this._autoPosition = null;
        this._disabled = true;
        this._initialized = false;
        this._visible = false;
        this._config = {};
        assert(config.target, 'target for tooltip is undefined or missing');
        this.value = value;
        this._root = config.root;
        this._target = config.target;
        this._config = _objectSpread({}, config);
        this._config.align = config.align || {};
        this._config.targetAlign = config.targetAlign || {};
        this._type = normalizeString(config.type, {
          fallbackValue: TooltipType.Info,
          validValues: Object.values(TooltipType)
        }); // If a tooltip element is not given, fall back on the globally shared instance.

        this._element = config.element;

        if (!this._element) {
          this._element = getCachedBubbleElement;
          const bubbleElement = getCachedBubbleElement();

          if (bubbleElement.parentNode === null) {
            document.body.appendChild(bubbleElement);
          }
        }

        this.handleDocumentTouch = this.handleDocumentTouch.bind(this);
      }
      /**
       * Disables the tooltip.
       */


      detach() {
        this._disabled = true;
      }
      /**
       * Enables the tooltip.
       */


      attach() {
        this._disabled = false;
      }
      /**
       * Adds the appropriate event listeners to the target element to make the tooltip appear. Also
       * links the tooltip and target element via the aria-describedby attribute for screen readers.
       */


      initialize() {
        const target = this._target();

        if (!this._initialized && target) {
          switch (this._type) {
            case TooltipType.Toggle:
              this.addToggleListeners();
              break;

            case TooltipType.Info:
            default:
              this.addInfoListeners();
              break;
          }

          const ariaDescribedBy = normalizeAriaAttribute([target.getAttribute(ARIA_DESCRIBEDBY$1), this._element().contentId]);
          target.setAttribute(ARIA_DESCRIBEDBY$1, ariaDescribedBy);
          this._initialized = true;
        }
      }

      addInfoListeners() {
        const target = this._target();

        if (!this._initialized && target) {
          ['mouseenter', 'focus'].forEach(name => target.addEventListener(name, () => this.show())); // Unlike the tooltip in Aura, we want clicks and keys to dismiss the tooltip.

          ['mouseleave', 'blur', 'click', 'keydown'].forEach(name => target.addEventListener(name, event => this.hideIfNotSelfCover(event)));
        }
      }

      hideIfNotSelfCover(event) {
        if (event.type === 'mouseleave' && event.clientX && event.clientY) {
          // In any chance, if mouseleave is caused by tooltip itself, it would means
          // tooltip cover the target which mostly caused by dynamic resize of tooltip by CSS or JS.
          try {
            const elementMouseIsOver = document.elementFromPoint ? document.elementFromPoint(event.clientX, event.clientY) : null;

            if (elementMouseIsOver === this._element()) {
              if (!isResizeObserverSupported()) {
                this.startPositioning();
              }

              return;
            }
          } catch (ex) {// Jest Throw Exception
          }
        }

        this.hide();
      }

      handleDocumentTouch() {
        if (this._visible) {
          this.hide();
        }
      }

      addToggleListeners() {
        const target = this._target();

        if (!this._initialized && target) {
          target.addEventListener('touchstart', e => {
            e.stopPropagation();
            this.toggle();
          });
          ['mouseenter', 'focus'].forEach(name => target.addEventListener(name, () => this.show()));
          ['mouseleave', 'blur'].forEach(name => target.addEventListener(name, event => this.hideIfNotSelfCover(event)));
        }
      }

      get resizeObserver() {
        if (!this._resizeObserver) {
          this._resizeObserver = buildResizeObserver(() => {
            if (this._visible && this._autoPosition) {
              this.startPositioning();
            }
          });
        }

        return this._resizeObserver;
      }

      show() {
        if (this._disabled) {
          return;
        }

        this._visible = true;

        const tooltip = this._element();
        /* We only change the visibility of the cached bubble element here,
           for custom bubble elements, we expect them to react to `visible`
           property change */


        if (CACHED_BUBBLE_ELEMENT) {
          // Show cached bubble element
          CACHED_BUBBLE_ELEMENT.classList.remove('slds-hide');
        }

        tooltip.content = this._value;
        this.startPositioning();
        document.addEventListener('touchstart', this.handleDocumentTouch);
        this.resizeObserver.observe(tooltip);
      }

      hide() {
        this._visible = false;

        const tooltip = this._element();

        tooltip.visible = this._visible;
        this.stopPositioning();
        document.removeEventListener('touchstart', this.handleDocumentTouch);
        this.resizeObserver.unobserve(tooltip);
      }

      toggle() {
        if (this._visible) {
          this.hide();
        } else {
          this.show();
        }
      }

      get value() {
        return this._value;
      }

      set value(value) {
        this._value = value;
        this._disabled = !value;
      }

      get initialized() {
        return this._initialized;
      }

      get visible() {
        return this._visible;
      }

      startPositioning() {
        if (!this._autoPosition) {
          this._autoPosition = new AutoPosition(this._root);
        } // The lightning-helptext component was originally left aligned.


        const align = {
          horizontal: this._config.align.horizontal || Direction.Left,
          vertical: this._config.align.vertical || Direction.Bottom
        };
        const targetAlign = {
          horizontal: this._config.targetAlign.horizontal || Direction.Left,
          vertical: this._config.targetAlign.vertical || Direction.Top
        }; // Pads the tooltip so its nubbin is at the center of the target element.

        const targetBox = this._target().getBoundingClientRect();

        const padLeft = targetBox.width * 0.5 - NUBBIN_OFFSET;

        this._autoPosition.start({
          target: this._target,
          element: this._element,
          align,
          targetAlign,
          autoFlip: true,
          padTop: NUBBIN_SIZE,
          padLeft
        }).then(autoPositionUpdater => {
          // The calculation above may have flipped the alignment of the tooltip. When the
          // tooltip changes alignment we need to update the nubbin class to have it draw in
          // the appropriate place.
          if (autoPositionUpdater) {
            const tooltip = this._element();

            tooltip.align = autoPositionUpdater.config.align;
            tooltip.visible = this._visible;
          }
        });
      }

      stopPositioning() {
        if (this._autoPosition) {
          this._autoPosition.stop();
        }
      }

    }

    lwc.registerDecorators(Tooltip, {
      fields: ["_autoPosition", "_disabled", "_initialized", "_visible", "_config"]
    });

    const i18n = {
      buttonAlternativeText: labelButtonAlternativeText
    };
    const DEFAULT_ICON_NAME = 'utility:info';
    const DEFAULT_ICON_VARIANT = 'bare';
    /**
     * An icon with a text popover used for tooltips.
     */

    class LightningHelptext extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.state = {
          iconName: DEFAULT_ICON_NAME,
          iconVariant: DEFAULT_ICON_VARIANT
        };
        this._tooltip = null;
      }

      /**
       * Text to be shown in the popover.
       * @type {string}
       * @param {string} value - The plain text string for the tooltip
       */
      set content(value) {
        if (this._tooltip) {
          this._tooltip.value = value;
        } else if (value) {
          // Note that because the tooltip target is a child element it may not be present in the
          // dom during initial rendering.
          this._tooltip = new Tooltip(value, {
            root: this,
            target: () => this.template.querySelector('button'),
            type: TooltipType.Toggle
          });

          this._tooltip.initialize();
        }
      }

      get content() {
        return this._tooltip ? this._tooltip.value : undefined;
      }
      /**
       * The Lightning Design System name of the icon used as the visible element.
       * Names are written in the format 'utility:info' where 'utility' is the category,
       * and 'info' is the specific icon to be displayed.
       * The default is 'utility:info'.
       * @type {string}
       * @param {string} value the icon name to use
       * @default utility:info
       */


      set iconName(value) {
        this.state.iconName = value;
      }

      get iconName() {
        if (isValidName(this.state.iconName)) {
          return this.state.iconName;
        }

        return DEFAULT_ICON_NAME;
      }
      /**
       * Changes the appearance of the icon.
       * Accepted variants include inverse, warning, error.
       * @type {string}
       * @param {string} value the icon variant to use
       * @default bare
       */


      set iconVariant(value) {
        this.state.iconVariant = value;
      }

      get iconVariant() {
        // NOTE: Leaving a note here because I just wasted a bunch of time
        // investigating why both 'bare' and 'inverse' are supported in
        // lightning-primitive-icon. lightning-icon also has a deprecated
        // 'bare', but that one is synonymous to 'inverse'. This 'bare' means
        // that no classes should be applied. So this component needs to
        // support both 'bare' and 'inverse' while lightning-icon only needs to
        // support 'inverse'.
        return normalizeString(this.state.iconVariant, {
          fallbackValue: DEFAULT_ICON_VARIANT,
          validValues: ['bare', 'error', 'inverse', 'warning']
        });
      }

      disconnectedCallback() {
        // W-6441609 helptext maybe destroyed first, and tooltip won't receive events to hide.
        if (this._tooltip && !this._tooltip.initialized) {
          this._tooltip.hide();
        }

        this._tooltip = null;
      }

      renderedCallback() {
        if (this._tooltip && !this._tooltip.initialized) {
          this._tooltip.initialize();
        }
      }

      get i18n() {
        return i18n;
      } // compute SVG CSS classes to apply to the icon


      get computedSvgClass() {
        const classes = classSet('slds-button__icon');

        switch (this.iconVariant) {
          case 'error':
            classes.add('slds-icon-text-error');
            break;

          case 'warning':
            classes.add('slds-icon-text-warning');
            break;

          case 'inverse':
          case 'bare':
            break;

          default:
            // if custom icon is set, we don't want to set
            // the text-default class
            classes.add('slds-icon-text-default');
        }

        return classes.toString();
      }

    }

    lwc.registerDecorators(LightningHelptext, {
      publicProps: {
        content: {
          config: 3
        },
        iconName: {
          config: 3
        },
        iconVariant: {
          config: 3
        }
      },
      track: {
        state: 1
      },
      fields: ["_tooltip"]
    });

    var _lightningHelptext = lwc.registerComponent(LightningHelptext, {
      tmpl: _tmpl$8
    });

    function stylesheet$3(hostSelector, shadowSelector, nativeShadow) {
      return ".slds-inline-logo" + shadowSelector + " {height: 1rem;margin-top: 1rem;margin-bottom: 1rem;}\n";
    }
    var _implicitStylesheets$3 = [stylesheet$3];

    function tmpl$9($api, $cmp, $slotset, $ctx) {
      const {
        d: api_dynamic,
        k: api_key,
        h: api_element,
        i: api_iterator,
        f: api_flatten
      } = $api;
      return api_flatten([$cmp.hasParts ? api_iterator($cmp.text, function (item) {
        return [item.part.highlight ? api_element("strong", {
          key: api_key(0, item.key)
        }, [api_dynamic(item.part.text)]) : null, !item.part.highlight ? api_dynamic(item.part.text) : null];
      }) : [], !$cmp.hasParts ? api_dynamic($cmp.text) : null]);
    }

    var _tmpl$a = lwc.registerTemplate(tmpl$9);
    tmpl$9.stylesheets = [];
    tmpl$9.stylesheetTokens = {
      hostAttribute: "lightning-baseComboboxFormattedText_baseComboboxFormattedText-host",
      shadowAttribute: "lightning-baseComboboxFormattedText_baseComboboxFormattedText"
    };

    class LightningBaseComboboxFormattedText extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this._text = '';
        this.hasParts = void 0;
      }

      get text() {
        return this._text;
      }

      set text(value) {
        this.hasParts = Array.isArray(value) && value.length > 0;

        if (this.hasParts) {
          // Generate keys for LWC DOM
          this._text = value.map((part, i) => ({
            part,
            key: i
          }));
        } else {
          this._text = value;
        }
      }

    }

    lwc.registerDecorators(LightningBaseComboboxFormattedText, {
      publicProps: {
        text: {
          config: 3
        }
      },
      track: {
        _text: 1,
        hasParts: 1
      }
    });

    var _lightningBaseComboboxFormattedText = lwc.registerComponent(LightningBaseComboboxFormattedText, {
      tmpl: _tmpl$a
    });

    function tmpl$a($api, $cmp, $slotset, $ctx) {
      const {
        c: api_custom_element,
        h: api_element,
        d: api_dynamic
      } = $api;
      return [api_element("span", {
        classMap: {
          "slds-media__figure": true
        },
        key: 1
      }, [api_custom_element("lightning-icon", _lightningIcon, {
        props: {
          "size": $cmp.iconSize,
          "alternativeText": $cmp.item.iconAlternativeText,
          "iconName": $cmp.item.iconName
        },
        key: 0
      }, [])]), api_element("span", {
        classMap: {
          "slds-media__body": true
        },
        key: 8
      }, [api_element("span", {
        classMap: {
          "slds-listbox__option-text": true,
          "slds-listbox__option-text_entity": true
        },
        key: 4
      }, [!$cmp.textHasParts ? api_element("span", {
        classMap: {
          "slds-truncate": true
        },
        attrs: {
          "title": $cmp.item.text
        },
        key: 2
      }, [api_dynamic($cmp.item.text)]) : null, $cmp.textHasParts ? api_custom_element("lightning-base-combobox-formatted-text", _lightningBaseComboboxFormattedText, {
        classMap: {
          "slds-truncate": true
        },
        props: {
          "title": $cmp.text,
          "text": $cmp.item.text
        },
        key: 3
      }, []) : null]), $cmp.hasSubText ? api_element("span", {
        classMap: {
          "slds-listbox__option-meta": true,
          "slds-listbox__option-meta_entity": true
        },
        key: 7
      }, [!$cmp.subTextHasParts ? api_element("span", {
        classMap: {
          "slds-truncate": true
        },
        attrs: {
          "title": $cmp.item.subText
        },
        key: 5
      }, [api_dynamic($cmp.item.subText)]) : null, $cmp.subTextHasParts ? api_custom_element("lightning-base-combobox-formatted-text", _lightningBaseComboboxFormattedText, {
        classMap: {
          "slds-truncate": true
        },
        props: {
          "title": $cmp.subText,
          "text": $cmp.item.subText
        },
        key: 6
      }, []) : null]) : null]), $cmp.item.rightIconName ? api_element("span", {
        classMap: {
          "slds-media__figure": true,
          "slds-media__figure_reverse": true
        },
        key: 10
      }, [api_custom_element("lightning-icon", _lightningIcon, {
        props: {
          "size": $cmp.rightIconSize,
          "alternativeText": $cmp.item.rightIconAlternativeText,
          "iconName": $cmp.item.rightIconName
        },
        key: 9
      }, [])]) : null];
    }

    var card = lwc.registerTemplate(tmpl$a);
    tmpl$a.stylesheets = [];
    tmpl$a.stylesheetTokens = {
      hostAttribute: "lightning-baseComboboxItem_card-host",
      shadowAttribute: "lightning-baseComboboxItem_card"
    };

    function tmpl$b($api, $cmp, $slotset, $ctx) {
      const {
        c: api_custom_element,
        h: api_element,
        d: api_dynamic
      } = $api;
      return [api_element("span", {
        classMap: {
          "slds-media__figure": true,
          "slds-listbox__option-icon": true
        },
        key: 1
      }, [$cmp.item.iconName ? api_custom_element("lightning-icon", _lightningIcon, {
        props: {
          "alternativeText": $cmp.item.iconAlternativeText,
          "iconName": $cmp.item.iconName,
          "size": "x-small"
        },
        key: 0
      }, []) : null]), api_element("span", {
        classMap: {
          "slds-media__body": true
        },
        key: 4
      }, [!$cmp.textHasParts ? api_element("span", {
        classMap: {
          "slds-truncate": true
        },
        attrs: {
          "title": $cmp.item.text
        },
        key: 2
      }, [api_dynamic($cmp.item.text)]) : null, $cmp.textHasParts ? api_custom_element("lightning-base-combobox-formatted-text", _lightningBaseComboboxFormattedText, {
        classMap: {
          "slds-truncate": true
        },
        props: {
          "text": $cmp.item.text,
          "title": $cmp.text
        },
        key: 3
      }, []) : null])];
    }

    var inline = lwc.registerTemplate(tmpl$b);
    tmpl$b.stylesheets = [];
    tmpl$b.stylesheetTokens = {
      hostAttribute: "lightning-baseComboboxItem_inline-host",
      shadowAttribute: "lightning-baseComboboxItem_inline"
    };

    class LightningBaseComboboxItem extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.item = {};
      }

      connectedCallback() {
        // We want to make sure that the item has 'aria-selected' if it's selectable
        if (this.item.selectable) {
          this.setAttribute('aria-selected', 'false');
        }

        if (this.item.type === 'option-inline') {
          this.classList.add('slds-media_small', 'slds-listbox__option_plain');
        } else {
          this.classList.add('slds-listbox__option_entity');
        }
      }

      get textHasParts() {
        const text = this.item.text;
        return text && Array.isArray(text) && text.length > 0;
      }

      get subTextHasParts() {
        const subText = this.item.subText;
        return subText && Array.isArray(subText) && subText.length > 0;
      } // Return html based on the specified item type


      render() {
        if (this.item.type === 'option-card') {
          return card;
        }

        return inline;
      }

      highlight() {
        this.toggleHighlight(true);
      }

      removeHighlight() {
        this.toggleHighlight(false);
      }

      toggleHighlight(highlighted) {
        if (this.item.selectable) {
          this.setAttribute('aria-selected', highlighted ? 'true' : 'false');
          this.classList.toggle('slds-has-focus', highlighted);
        }
      } // Parts are needed for highlighting


      partsToText(parts) {
        if (parts && Array.isArray(parts) && parts.length > 0) {
          return parts.map(part => part.text).join('');
        }

        return parts;
      }

      get rightIconSize() {
        return this.item.rightIconSize || 'small';
      }

      get iconSize() {
        return this.item.iconSize || 'small';
      }

      get text() {
        return this.partsToText(this.item.text);
      }

      get subText() {
        return this.partsToText(this.item.subText);
      }

      get hasSubText() {
        const subText = this.item.subText;
        return subText && subText.length > 0;
      }

    }

    lwc.registerDecorators(LightningBaseComboboxItem, {
      publicProps: {
        item: {
          config: 0
        }
      },
      publicMethods: ["highlight", "removeHighlight"]
    });

    var _lightningBaseComboboxItem = lwc.registerComponent(LightningBaseComboboxItem, {
      tmpl: _tmpl$3
    });

    function tmpl$c($api, $cmp, $slotset, $ctx) {
      const {
        c: api_custom_element,
        gid: api_scoped_id,
        b: api_bind,
        h: api_element,
        d: api_dynamic,
        k: api_key,
        i: api_iterator,
        f: api_flatten
      } = $api;
      const {
        _m0,
        _m1,
        _m2,
        _m3,
        _m4,
        _m5,
        _m6,
        _m7,
        _m8,
        _m9,
        _m10,
        _m11,
        _m12,
        _m13,
        _m14
      } = $ctx;
      return [api_element("div", {
        className: $cmp.computedDropdownTriggerClass,
        attrs: {
          "role": "combobox",
          "aria-expanded": $cmp.computedAriaExpanded,
          "aria-haspopup": "listbox"
        },
        key: 29,
        on: {
          "click": _m14 || ($ctx._m14 = api_bind($cmp.handleTriggerClick))
        }
      }, [api_element("div", {
        className: $cmp.computedFormElementClass,
        attrs: {
          "role": "none"
        },
        key: 12
      }, [$cmp.hasInputPill ? api_custom_element("lightning-icon", _lightningIcon, {
        classMap: {
          "slds-icon_container": true,
          "slds-combobox__input-entity-icon": true
        },
        props: {
          "iconName": $cmp.inputPill.iconName,
          "alternativeText": $cmp.inputPill.iconAlternativeText,
          "size": "x-small"
        },
        key: 0
      }, []) : null, api_element("input", {
        className: $cmp.computedInputClass,
        attrs: {
          "id": api_scoped_id("input"),
          "type": "text",
          "role": "textbox",
          "autocomplete": "off",
          "name": $cmp.name,
          "placeholder": $cmp.computedPlaceholder,
          "maxlength": $cmp.inputMaxlength,
          "aria-autocomplete": $cmp.computedAriaAutocomplete,
          "aria-label": $cmp.inputLabel
        },
        props: {
          "required": $cmp.required,
          "value": $cmp.computedInputValue,
          "disabled": $cmp.disabled,
          "readOnly": $cmp._inputReadOnly
        },
        key: 1,
        on: {
          "focus": _m0 || ($ctx._m0 = api_bind($cmp.handleFocus)),
          "select": _m1 || ($ctx._m1 = api_bind($cmp.handleInputSelect)),
          "change": _m2 || ($ctx._m2 = api_bind($cmp.handleTextChange)),
          "input": _m3 || ($ctx._m3 = api_bind($cmp.handleInput)),
          "keydown": _m4 || ($ctx._m4 = api_bind($cmp.handleInputKeyDown)),
          "blur": _m5 || ($ctx._m5 = api_bind($cmp.handleBlur))
        }
      }, []), $cmp.hasInputPill ? api_element("div", {
        classMap: {
          "slds-input__icon-group": true,
          "slds-input__icon-group_right": true
        },
        key: 5
      }, [api_element("button", {
        classMap: {
          "slds-button": true,
          "slds-button_icon": true,
          "slds-input__icon": true,
          "slds-input__icon_right": true
        },
        attrs: {
          "type": "button",
          "title": $cmp.i18n.pillCloseButtonAlternativeText
        },
        key: 4,
        on: {
          "click": _m6 || ($ctx._m6 = api_bind($cmp.handlePillRemove))
        }
      }, [api_custom_element("lightning-primitive-icon", _lightningPrimitiveIcon, {
        props: {
          "iconName": "utility:close",
          "variant": "bare",
          "svgClass": "slds-button__icon"
        },
        key: 2
      }, []), api_element("span", {
        classMap: {
          "slds-assistive-text": true
        },
        key: 3
      }, [api_dynamic($cmp.i18n.pillCloseButtonAlternativeText)])])]) : null, !$cmp.hasInputPill ? api_element("div", {
        classMap: {
          "slds-input__icon-group": true,
          "slds-input__icon-group_right": true
        },
        key: 11
      }, [$cmp.showInputActivityIndicator ? api_element("div", {
        classMap: {
          "slds-spinner": true,
          "slds-spinner_brand": true,
          "slds-spinner_x-small": true,
          "slds-input__spinner": true
        },
        attrs: {
          "role": "status"
        },
        key: 9
      }, [api_element("span", {
        classMap: {
          "slds-assistive-text": true
        },
        key: 6
      }, [api_dynamic($cmp.i18n.loadingText)]), api_element("div", {
        classMap: {
          "slds-spinner__dot-a": true
        },
        key: 7
      }, []), api_element("div", {
        classMap: {
          "slds-spinner__dot-b": true
        },
        key: 8
      }, [])]) : null, $cmp.inputIconName ? api_custom_element("lightning-icon", _lightningIcon, {
        classMap: {
          "slds-input__icon": true,
          "slds-input__icon_right": true
        },
        props: {
          "alternativeText": $cmp.inputIconAlternativeText,
          "iconName": $cmp.inputIconName,
          "size": $cmp.inputIconSize
        },
        key: 10
      }, []) : null]) : null]), api_element("div", {
        className: $cmp.computedDropdownClass,
        attrs: {
          "id": api_scoped_id("dropdown-element"),
          "data-dropdown-element": true,
          "role": "listbox"
        },
        key: 28,
        on: {
          "scroll": _m9 || ($ctx._m9 = api_bind($cmp.handleListboxScroll)),
          "mousedown": _m10 || ($ctx._m10 = api_bind($cmp.handleDropdownMouseDown)),
          "mouseup": _m11 || ($ctx._m11 = api_bind($cmp.handleDropdownMouseUp)),
          "mouseleave": _m12 || ($ctx._m12 = api_bind($cmp.handleDropdownMouseLeave)),
          "click": _m13 || ($ctx._m13 = api_bind($cmp.handleOptionClick))
        }
      }, $cmp._hasDropdownOpened ? api_flatten([api_iterator($cmp._items, function (item) {
        return [!item.items ? api_custom_element("lightning-base-combobox-item", _lightningBaseComboboxItem, {
          classMap: {
            "slds-media": true,
            "slds-listbox__option": true,
            "slds-media_center": true
          },
          attrs: {
            "data-item-id": item.id,
            "data-value": item.value
          },
          props: {
            "role": "option",
            "item": item,
            "id": api_scoped_id(item.id)
          },
          key: api_key(13, item.value),
          on: {
            "mouseenter": _m7 || ($ctx._m7 = api_bind($cmp.handleOptionMouseEnter))
          }
        }, []) : null, item.items ? api_element("ul", {
          attrs: {
            "role": "group",
            "aria-label": item.label
          },
          key: api_key(19, item.label)
        }, api_flatten([item.label ? api_element("li", {
          classMap: {
            "slds-listbox__item": true
          },
          attrs: {
            "role": "presentation"
          },
          key: 16
        }, [api_element("div", {
          classMap: {
            "slds-media": true,
            "slds-listbox__option": true,
            "slds-listbox__option_plain": true,
            "slds-media_small": true
          },
          attrs: {
            "role": "presentation"
          },
          key: 15
        }, [api_element("h3", {
          attrs: {
            "role": "presentation",
            "title": item.label
          },
          key: 14
        }, [api_dynamic(item.label)])])]) : null, api_iterator(item.items, function (groupItem) {
          return api_element("li", {
            classMap: {
              "slds-listbox__item": true
            },
            attrs: {
              "role": "presentation"
            },
            key: api_key(18, groupItem.value)
          }, [api_custom_element("lightning-base-combobox-item", _lightningBaseComboboxItem, {
            classMap: {
              "slds-media": true,
              "slds-listbox__option": true,
              "slds-media_center": true
            },
            attrs: {
              "data-item-id": groupItem.id,
              "data-value": groupItem.value
            },
            props: {
              "role": "option",
              "item": groupItem,
              "id": api_scoped_id(groupItem.id)
            },
            key: 17,
            on: {
              "mouseenter": _m8 || ($ctx._m8 = api_bind($cmp.handleOptionMouseEnter))
            }
          }, [])]);
        })])) : null];
      }), $cmp.showDropdownActivityIndicator ? api_element("div", {
        classMap: {
          "slds-listbox__item": true
        },
        attrs: {
          "role": "presentation"
        },
        key: 25
      }, [api_element("div", {
        classMap: {
          "slds-align_absolute-center": true,
          "slds-p-top_medium": true
        },
        key: 24
      }, [api_element("div", {
        classMap: {
          "slds-spinner": true,
          "slds-spinner_x-small": true,
          "slds-spinner_inline": true
        },
        attrs: {
          "role": "status"
        },
        key: 23
      }, [api_element("span", {
        classMap: {
          "slds-assistive-text": true
        },
        key: 20
      }, [api_dynamic($cmp.i18n.loadingText)]), api_element("div", {
        classMap: {
          "slds-spinner__dot-a": true
        },
        key: 21
      }, []), api_element("div", {
        classMap: {
          "slds-spinner__dot-b": true
        },
        key: 22
      }, [])])])]) : null, $cmp.showAttribution ? api_element("div", {
        classMap: {
          "slds-align_absolute-center": true
        },
        key: 27
      }, [api_element("img", {
        classMap: {
          "slds-inline-logo": true
        },
        attrs: {
          "src": $cmp.attributionLogoUrl,
          "alt": $cmp.attributionLogoAssistiveText,
          "title": $cmp.attributionLogoAssistiveText
        },
        key: 26
      }, [])]) : null]) : [])])];
    }

    var _tmpl$b = lwc.registerTemplate(tmpl$c);
    tmpl$c.stylesheets = [];

    if (_implicitStylesheets$3) {
      tmpl$c.stylesheets.push.apply(tmpl$c.stylesheets, _implicitStylesheets$3);
    }
    tmpl$c.stylesheetTokens = {
      hostAttribute: "lightning-baseCombobox_baseCombobox-host",
      shadowAttribute: "lightning-baseCombobox_baseCombobox"
    };

    var labelAriaSelectedOptions = 'Selected Options:';

    var labelDeselectOptionKeyboard = 'Press delete or backspace to remove';

    var labelLoadingText = 'Loading';

    var labelPillCloseButtonAlternativeText = 'Clear Selection';

    function preventDefaultAndStopPropagation(event) {
      event.preventDefault();
      event.stopPropagation();
    }

    function handleEnterKey({
      event,
      currentIndex,
      dropdownInterface
    }) {
      preventDefaultAndStopPropagation(event);

      if (dropdownInterface.isDropdownVisible() && currentIndex >= 0) {
        dropdownInterface.selectByIndex(currentIndex);
      } else {
        dropdownInterface.openDropdownIfNotEmpty();
      }
    }

    function handlePageUpOrDownKey({
      event,
      currentIndex,
      dropdownInterface
    }) {
      preventDefaultAndStopPropagation(event);

      if (!dropdownInterface.isDropdownVisible()) {
        dropdownInterface.openDropdownIfNotEmpty();
      }

      const pageUpDownOptionSkipCount = 10;

      if (dropdownInterface.getTotalOptions() > 0) {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        requestAnimationFrame(() => {
          let highlightIndex = 0;

          if (event.key === 'PageUp') {
            highlightIndex = Math.max(currentIndex - pageUpDownOptionSkipCount, 0);
          } else {
            // Jump 10 options down
            highlightIndex = Math.min(currentIndex + pageUpDownOptionSkipCount, dropdownInterface.getTotalOptions() - 1);
          }

          dropdownInterface.highlightOptionWithIndex(highlightIndex);
        });
      }
    }

    function handleHomeOrEndKey({
      event,
      dropdownInterface
    }) {
      // If not a read-only input we want the default browser behaviour
      if (!dropdownInterface.isInputReadOnly()) {
        return;
      }

      preventDefaultAndStopPropagation(event);

      if (!dropdownInterface.isDropdownVisible()) {
        dropdownInterface.openDropdownIfNotEmpty();
      }

      if (dropdownInterface.getTotalOptions() > 0) {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        requestAnimationFrame(() => {
          const highlightIndex = event.key === 'Home' ? 0 : dropdownInterface.getTotalOptions() - 1;
          dropdownInterface.highlightOptionWithIndex(highlightIndex);
        });
      }
    }

    function handleUpOrDownKey({
      event,
      currentIndex,
      dropdownInterface
    }) {
      preventDefaultAndStopPropagation(event);

      if (!dropdownInterface.isDropdownVisible()) {
        dropdownInterface.openDropdownIfNotEmpty();
      }

      const isUpKey = event.key === 'Up' || event.key === 'ArrowUp';
      let nextIndex;

      if (currentIndex >= 0) {
        nextIndex = isUpKey ? currentIndex - 1 : currentIndex + 1;

        if (nextIndex >= dropdownInterface.getTotalOptions()) {
          nextIndex = 0;
        } else if (nextIndex < 0) {
          nextIndex = dropdownInterface.getTotalOptions() - 1;
        }
      } else {
        nextIndex = isUpKey ? dropdownInterface.getTotalOptions() - 1 : 0;
      }

      if (dropdownInterface.getTotalOptions() > 0) {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        requestAnimationFrame(() => {
          dropdownInterface.highlightOptionWithIndex(nextIndex);
        });
      }
    }

    function handleEscapeOrTabKey({
      event,
      dropdownInterface
    }) {
      if (dropdownInterface.isDropdownVisible()) {
        event.stopPropagation();
        dropdownInterface.closeDropdown();
      }
    }

    function handleTypedCharacters({
      event,
      currentIndex,
      dropdownInterface
    }) {
      if (event.key && event.key.length > 1) {
        // not a printable character
        return;
      }

      if (!dropdownInterface.isDropdownVisible()) {
        dropdownInterface.openDropdownIfNotEmpty();
      }

      if (dropdownInterface.isInputReadOnly()) {
        // The element should be read only, it's a work-around for IE11 as it will still make editable an input
        // that has focus and was dynamically changed to be readonly on focus change. Remove once we no longer
        // support IE11
        event.preventDefault(); // eslint-disable-next-line @lwc/lwc/no-async-operation

        requestAnimationFrame(() => runActionOnBufferedTypedCharacters(event, dropdownInterface.highlightOptionWithText.bind(this, currentIndex || 0)));
      }
    }

    const eventKeyToHandlerMap = {
      Enter: handleEnterKey,
      PageUp: handlePageUpOrDownKey,
      PageDown: handlePageUpOrDownKey,
      Home: handleHomeOrEndKey,
      End: handleHomeOrEndKey,
      Down: handleUpOrDownKey,
      // IE11/Edge specific
      Up: handleUpOrDownKey,
      // IE11/Edge specific
      ArrowUp: handleUpOrDownKey,
      ArrowDown: handleUpOrDownKey,
      Esc: handleEscapeOrTabKey,
      // IE11/Edge specific
      Escape: handleEscapeOrTabKey,
      Tab: handleEscapeOrTabKey
    };
    function handleKeyDownOnInput({
      event,
      currentIndex,
      dropdownInterface
    }) {
      const parameters = {
        event,
        currentIndex,
        dropdownInterface
      };

      if (eventKeyToHandlerMap[event.key]) {
        eventKeyToHandlerMap[event.key](parameters);
      } else {
        handleTypedCharacters(parameters);
      }
    }

    class BaseComboboxEvents {
      constructor(baseCombobox) {
        this.dispatchEvent = baseCombobox.dispatchEvent.bind(baseCombobox);
      }

      dispatchPillRemove(pill) {
        this.dispatchEvent(new CustomEvent('pillremove', {
          detail: {
            item: pill
          }
        }));
      }

      dispatchEndReached() {
        this.dispatchEvent(new CustomEvent('endreached'));
      }

      dispatchFocus() {
        this.dispatchEvent(new CustomEvent('focus'));
      }

      dispatchBlur() {
        this.dispatchEvent(new CustomEvent('blur'));
      }

      dispatchTextInput(text) {
        this.dispatchEvent(new CustomEvent('textinput', {
          detail: {
            text
          }
        }));
      }

      dispatchTextChange(text) {
        this.dispatchEvent(new CustomEvent('textchange', {
          detail: {
            text
          }
        }));
      }

      dispatchSelect(value) {
        this.dispatchEvent(new CustomEvent('select', {
          detail: {
            value
          }
        }));
      }

      dispatchDropdownOpen() {
        this.dispatchEvent(new CustomEvent('dropdownopen'));
      }

      dispatchDropdownOpenRequest() {
        this.dispatchEvent(new CustomEvent('dropdownopenrequest'));
      }

    }

    /**
     Represents an object which keeps track of a user's interacting state.
     @constructor InteractingState
     @param {Object} options - The options object.
     @param {Object} [options.duration=2000] - The number of milliseconds of idle time to wait before exiting the interacting state.
     @param {Object} [options.debounceInteraction=false] - Whether to debounce interaction to ignore consecutive leave-enter interactions.
     **/

    class InteractingState {
      constructor(options) {
        const duration = options && options.duration >= 0 ? options.duration : 2000;
        this.eventemitter = new EventEmitter();
        this._interacting = false;
        this._debouncedLeave = debounce(this.leave.bind(this), duration);
        this._debounceInteraction = options && options.debounceInteraction;
        this._interactedRecently = false;

        if (this._debounceInteraction) {
          // debounce leave until a short time later
          this._debouncedEmitLeave = debounce(() => {
            if (!this._interacting) {
              this._interactedRecently = false;
              this.eventemitter.emit('leave');
            }
          }, 200); // debounce enter until left

          this._debouncedEmitEnter = () => {
            if (!this._interactedRecently) {
              this._interactedRecently = true;
              this.eventemitter.emit('enter');
            }
          };
        }
      }
      /**
       Checks whether or not we are in the interacting state.
       @method InteractingState#isInteracting
       @return {Boolean} - Whether or not we are interacting.
       **/


      isInteracting() {
        return this._interacting;
      }
      /**
       Enters the interacting state.
       @method InteractingState#enter
       @returns {void}
       **/


      enter() {
        if (!this._interacting) {
          this._interacting = true;

          if (this._debounceInteraction) {
            this._debouncedEmitEnter();
          } else {
            this.eventemitter.emit('enter');
          }
        }
      }
      /**
       Registers a handler to execute when we enter the interacting state.
       @method InteractingState#onenter
       @param {Function} handler - The callback function.
       **/


      onenter(handler) {
        this.eventemitter.on('enter', handler);
      }
      /**
       Leaves the interacting state.
       @method InteractingState#leave
       @returns {void}
       **/


      leave() {
        if (this._interacting) {
          this._interacting = false;

          if (this._debounceInteraction) {
            this._debouncedEmitLeave();
          } else {
            this.eventemitter.emit('leave');
          }
        }
      }
      /**
       Registers a handler to execute when we leave the interacting state.
       @method InteractingState#onleave
       @param {Function} handler - The callback function.
       **/


      onleave(handler) {
        this.eventemitter.on('leave', handler);
      }
      /**
       Signals the start of the transition into the interacting state and
       schedules a transition out of the interacting state after an idle
       duration. Calling this method multiple times will reset the timer.
       @method InteractingState#interacting
       @returns {void}
       **/


      interacting() {
        this.enter();

        this._debouncedLeave();
      }

    }
    /**
     Creates a debounced function that delays invoking `func` until after
     `delay` milliseconds have elapsed since the last time the debounced
     function was invoked.
     @function debounce
     @param {Function} func - The function to debounce
     @param {Number} delay - The number of milliseconds to delay
     @param {Object} options - The options object
     @param {Boolean} options.leading - Specify invoking on the leading edge of the timeout
     @return {Function} - debounced function
     **/

    function debounce(func, delay, options) {
      const _options = options || {};

      let invokeLeading = _options.leading;
      let timer;
      return function debounced() {
        const args = Array.prototype.slice.apply(arguments);

        if (invokeLeading) {
          func.apply(this, args);
          invokeLeading = false;
        }

        clearTimeout(timer); // eslint-disable-next-line @lwc/lwc/no-async-operation

        timer = setTimeout(function () {
          func.apply(this, args);
          invokeLeading = _options.leading; // reset for next debounce sequence
        }, delay);
      };
    }

    var labelBadInput = 'Enter a valid value.';

    var labelPatternMismatch = 'Your entry does not match the allowed pattern.';

    var labelRangeOverflow = 'The number is too high.';

    var labelRangeUnderflow = 'The number is too low.';

    var labelStepMismatch = 'Your entry isn\'t a valid increment.';

    var labelTooLong = 'Your entry is too long.';

    var labelTooShort = 'Your entry is too short.';

    var labelTypeMismatch = 'You have entered an invalid format.';

    var labelValueMissing = 'Complete this field.';

    const constraintsSortedByPriority = ['customError', 'badInput', 'patternMismatch', 'rangeOverflow', 'rangeUnderflow', 'stepMismatch', 'tooLong', 'tooShort', 'typeMismatch', 'valueMissing'];
    const defaultLabels = {
      badInput: labelBadInput,
      customError: labelBadInput,
      patternMismatch: labelPatternMismatch,
      rangeOverflow: labelRangeOverflow,
      rangeUnderflow: labelRangeUnderflow,
      stepMismatch: labelStepMismatch,
      tooLong: labelTooLong,
      tooShort: labelTooShort,
      typeMismatch: labelTypeMismatch,
      valueMissing: labelValueMissing
    };

    function resolveBestMatch(validity) {
      let validityState;

      if (validity && validity.valid === false) {
        validityState = 'badInput';
        constraintsSortedByPriority.some(stateName => {
          if (validity[stateName] === true) {
            validityState = stateName;
            return true;
          }

          return false;
        });
      }

      return validityState;
    }

    function computeConstraint(valueProvider, constraint) {
      const provider = valueProvider[constraint];

      if (typeof provider === 'function') {
        return provider();
      }

      if (typeof provider === 'boolean') {
        return provider;
      }

      return false;
    } // We're doing the below to avoid exposing the constraintsProvider in the ValidityState


    function newValidityState(constraintsProvider) {
      class ValidityState {
        get valueMissing() {
          return computeConstraint(constraintsProvider, 'valueMissing');
        }

        get typeMismatch() {
          return computeConstraint(constraintsProvider, 'typeMismatch');
        }

        get patternMismatch() {
          return computeConstraint(constraintsProvider, 'patternMismatch');
        }

        get tooLong() {
          return computeConstraint(constraintsProvider, 'tooLong');
        }

        get tooShort() {
          return computeConstraint(constraintsProvider, 'tooShort');
        }

        get rangeUnderflow() {
          return computeConstraint(constraintsProvider, 'rangeUnderflow');
        }

        get rangeOverflow() {
          return computeConstraint(constraintsProvider, 'rangeOverflow');
        }

        get stepMismatch() {
          return computeConstraint(constraintsProvider, 'stepMismatch');
        }

        get customError() {
          return computeConstraint(constraintsProvider, 'customError');
        }

        get badInput() {
          return computeConstraint(constraintsProvider, 'badInput');
        }

        get valid() {
          return !(this.valueMissing || this.typeMismatch || this.patternMismatch || this.tooLong || this.tooShort || this.rangeUnderflow || this.rangeOverflow || this.stepMismatch || this.customError || this.badInput);
        }

      }

      return new ValidityState();
    }

    function buildSyntheticValidity(constraintProvider) {
      return Object.freeze(newValidityState(constraintProvider));
    }
    function getErrorMessage(validity, labelMap) {
      const key = resolveBestMatch(validity);

      if (key) {
        return labelMap[key] ? labelMap[key] : defaultLabels[key];
      }

      return '';
    }
    class FieldConstraintApi {
      constructor(inputComponentProvider, constraintProviders) {
        assert(typeof inputComponentProvider === 'function');
        this._inputComponentProvider = inputComponentProvider;
        this._constraintsProvider = Object.assign({}, constraintProviders);

        if (!this._constraintsProvider.customError) {
          this._constraintsProvider.customError = () => typeof this._customValidityMessage === 'string' && this._customValidityMessage !== '';
        }
      }

      get validity() {
        if (!this._constraint) {
          this._constraint = buildSyntheticValidity(this._constraintsProvider);
        }

        return this._constraint;
      }

      checkValidity() {
        const isValid = this.validity.valid;

        if (!isValid) {
          if (this.inputComponent) {
            this.inputComponent.dispatchEvent(new CustomEvent('invalid', {
              cancellable: true
            }));
          }
        }

        return isValid;
      }

      reportValidity(callback) {
        const valid = this.checkValidity(); // the input might have been removed from the DOM by the time we query it

        if (this.inputComponent) {
          this.inputComponent.classList.toggle('slds-has-error', !valid);

          if (callback) {
            callback(this.validationMessage);
          }
        }

        return valid;
      }

      setCustomValidity(message) {
        this._customValidityMessage = message;
      }

      get validationMessage() {
        return getErrorMessage(this.validity, {
          customError: this._customValidityMessage,
          badInput: this.inputComponent.messageWhenBadInput,
          patternMismatch: this.inputComponent.messageWhenPatternMismatch,
          rangeOverflow: this.inputComponent.messageWhenRangeOverflow,
          rangeUnderflow: this.inputComponent.messageWhenRangeUnderflow,
          stepMismatch: this.inputComponent.messageWhenStepMismatch,
          tooShort: this.inputComponent.messageWhenTooShort,
          tooLong: this.inputComponent.messageWhenTooLong,
          typeMismatch: this.inputComponent.messageWhenTypeMismatch,
          valueMissing: this.inputComponent.messageWhenValueMissing
        });
      }

      get inputComponent() {
        if (!this._inputComponentElement) {
          this._inputComponentElement = this._inputComponentProvider();
        }

        return this._inputComponentElement;
      }

    }

    const VARIANT = {
      STANDARD: 'standard',
      LABEL_HIDDEN: 'label-hidden',
      LABEL_STACKED: 'label-stacked',
      LABEL_INLINE: 'label-inline'
    };
    /**
    A variant normalization utility for attributes.
    @param {Any} value - The value to normalize.
    @return {Boolean} - The normalized value.
    **/

    function normalizeVariant$1(value) {
      return normalizeString(value, {
        fallbackValue: VARIANT.STANDARD,
        validValues: [VARIANT.STANDARD, VARIANT.LABEL_HIDDEN, VARIANT.LABEL_STACKED, VARIANT.LABEL_INLINE]
      });
    }

    function isEmptyString(s) {
      return s === undefined || s === null || typeof s === 'string' && s.trim() === '';
    }

    const i18n$1 = {
      ariaSelectedOptions: labelAriaSelectedOptions,
      deselectOptionKeyboard: labelDeselectOptionKeyboard,
      pillCloseButtonAlternativeText: labelPillCloseButtonAlternativeText,
      loadingText: labelLoadingText
    };
    const SMALL_MIN_HEIGHT = '2.25rem';
    const MEDIUM_MIN_HEIGHT = '6.75rem';
    const ARIA_CONTROLS$1 = 'aria-controls';
    const ARIA_LABELLEDBY = 'aria-labelledby';
    const ARIA_DESCRIBEDBY$2 = 'aria-describedby';
    const ARIA_LABEL = 'aria-label';
    const ARIA_ACTIVEDESCENDANT = 'aria-activedescendant';

    class LightningBaseCombobox extends lwc.LightningElement {
      constructor() {
        super();
        this.inputText = '';
        this.inputIconName = 'utility:down';
        this.inputIconSize = 'x-small';
        this.inputIconAlternativeText = void 0;
        this.inputMaxlength = void 0;
        this.showInputActivityIndicator = false;
        this.required = false;
        this.dropdownAlignment = 'left';
        this.placeholder = 'Select an Item';
        this.inputLabel = void 0;
        this.name = void 0;
        this.inputPill = void 0;
        this.attributionLogoUrl = void 0;
        this.attributionLogoAssistiveText = void 0;
        this._showDropdownActivityIndicator = false;
        this._items = [];
        this._disabled = false;
        this._dropdownVisible = false;
        this._hasDropdownOpened = false;
        this._highlightedOptionElementId = null;
        this._variant = void 0;
        this._dropdownHeight = 'standard';
        this._readonly = false;
        this._logoLoaded = false;
        this._inputDescribedBy = [];
        this._inputAriaControls = void 0;
        this._activeElementDomId = void 0;
        this._events = new BaseComboboxEvents(this);
      }

      renderedCallback() {
        this.dispatchEvent(new CustomEvent('ready', {
          detail: {
            id: this.inputId,
            name: this.name
          }
        }));
        this.synchronizeA11y();
      }

      connectedCallback() {
        this.classList.add('slds-combobox_container');
        this._connected = true;
        this._keyboardInterface = this.dropdownKeyboardInterface();
      }

      disconnectedCallback() {
        this._connected = false;
        this._listBoxElementCache = undefined;
      }

      get inputControlsElement() {
        return this._inputAriaControls;
      }

      set inputControlsElement(el) {
        this._inputAriaControls = el;
        this.synchronizeA11y();
      }

      get inputDescribedByElements() {
        return this._inputDescribedBy;
      }

      set inputDescribedByElements(elements) {
        if (Array.isArray(elements)) {
          this._inputDescribedBy = elements;
        } else {
          this._inputDescribedBy = [elements];
        }

        this.synchronizeA11y();
      }

      get inputLabelledByElement() {
        return this._inputLabelledBy;
      }

      set inputLabelledByElement(el) {
        this._inputLabelledBy = el;
        this.synchronizeA11y();
      }

      get inputLabelledById() {
        return getRealDOMId(this._inputLabelledBy);
      }

      get inputAriaControlsId() {
        return getRealDOMId(this._inputAriaControls);
      }

      get inputId() {
        return getRealDOMId(this.template.querySelector('input'));
      }

      get computedAriaDescribedBy() {
        const ariaValues = [];

        this._inputDescribedBy.forEach(el => {
          ariaValues.push(getRealDOMId(el));
        });

        return normalizeAriaAttribute(ariaValues);
      }

      get dropdownHeight() {
        return this._dropdownHeight;
      }

      set dropdownHeight(height) {
        this._dropdownHeight = normalizeString(height, {
          fallbackValue: 'standard',
          validValues: ['standard', 'small']
        });
      }

      get showDropdownActivityIndicator() {
        return this._showDropdownActivityIndicator;
      }

      set showDropdownActivityIndicator(value) {
        this._showDropdownActivityIndicator = normalizeBoolean(value);

        if (this._connected) {
          if (this._showDropdownActivityIndicator) {
            if (this._shouldOpenDropDown) {
              this.openDropdownIfNotEmpty();
            }
          } else if (this._dropdownVisible && this.isDropdownEmpty) {
            this.closeDropdown();
          }
        }
      }

      get disabled() {
        return this._disabled;
      }

      set disabled(value) {
        this._disabled = normalizeBoolean(value);

        if (this._disabled && this._dropdownVisible) {
          this.closeDropdown();
        }
      }

      get readOnly() {
        return this._readonly;
      }

      set readOnly(value) {
        this._readonly = normalizeBoolean(value);

        if (this._readonly && this._dropdownVisible) {
          this.closeDropdown();
        }
      }

      get variant() {
        return this._variant || VARIANT.STANDARD;
      }

      set variant(value) {
        this._variant = normalizeString(value, {
          fallbackValue: VARIANT.STANDARD,
          validValues: [VARIANT.STANDARD, 'lookup']
        });
      }

      get items() {
        return this._unprocessedItems;
      }

      set items(items = []) {
        this._unprocessedItems = items;

        if (this._connected) {
          if (this._hasDropdownOpened) {
            // The dropdown has already been opened at least once, so process the items immediately
            this.updateItems(items);

            if (this._dropdownVisible) {
              // The dropdown is visible but there are no items to show, close it
              if (this.isDropdownEmpty) {
                this.closeDropdown();
              } else {
                // We have new items, update highlight
                this.highlightDefaultItem(); // Since the items have changed, the positioning should be recomputed
                // remove-next-line-for-c-namespace

                this.startDropdownAutoPositioning();
              }
            }
          }

          if (this._shouldOpenDropDown) {
            this.openDropdownIfNotEmpty();
          }
        }
      }

      highlightInputText() {
        if (this._connected) {
          // Safari has issues with invoking set selection range immediately in the 'focus' handler, instead
          // we'd be doing it in an animation frame. Remove the requestAnimationFrame once/if this is fixed
          // in Safari
          // eslint-disable-next-line @lwc/lwc/no-async-operation
          requestAnimationFrame(() => {
            const {
              inputElement
            } = this;
            inputElement.setSelectionRange(0, inputElement.value.length);
          });
        }
      }

      get showAttribution() {
        return this.attributionLogoUrl;
      }

      focus() {
        if (this._connected) {
          this.inputElement.focus();
        }
      }

      focusAndOpenDropdownIfNotEmpty() {
        if (this._connected) {
          if (!this._inputHasFocus) {
            this.focus();
          }

          this.openDropdownIfNotEmpty();
        }
      }

      blur() {
        if (this._connected) {
          this.inputElement.blur();
        }
      }

      synchronizeA11y() {
        const input = this.template.querySelector('input');

        if (!input) {
          return;
        }

        synchronizeAttrs(input, {
          [ARIA_LABELLEDBY]: this.inputLabelledById,
          [ARIA_DESCRIBEDBY$2]: this.computedAriaDescribedBy,
          [ARIA_ACTIVEDESCENDANT]: this._activeElementDomId,
          [ARIA_CONTROLS$1]: this.computedInputControls,
          [ARIA_LABEL]: this.inputLabel
        });
      }

      itemId(index) {
        return this.inputId + '-' + index;
      }

      itemIndexFromId(id) {
        // Extracts the index from an item id.
        return parseInt(id.substring(id.lastIndexOf('-') + 1), 10);
      }

      processItem(item) {
        const itemCopy = {}; // Supported item properties:
        // 'type' (string): option-inline, option-card
        // 'highlight' (boolean): Whether to highlight the item when dropdown opens
        // 'iconName': left icon name
        // 'iconSize': left icon size
        // 'iconAlternativeText': assistive text for the left icon
        // 'rightIconName': right icon name
        // 'rightIconSize': right icon size
        // 'rightIconAlternativeText': assistive text for the right icon
        // 'text': text to display
        // 'subText': sub-text to display (only option-card supports it)
        // 'value': value associated with the option

        itemCopy.type = item.type;
        itemCopy.iconName = item.iconName;
        itemCopy.iconSize = item.iconSize;
        itemCopy.iconAlternativeText = item.iconAlternativeText;
        itemCopy.rightIconName = item.rightIconName;
        itemCopy.rightIconSize = item.rightIconSize;
        itemCopy.rightIconAlternativeText = item.rightIconAlternativeText;
        itemCopy.text = item.text;
        itemCopy.subText = item.subText;
        itemCopy.value = item.value; // extra metadata needed

        itemCopy.selectable = ['option-card', 'option-inline'].indexOf(item.type) >= 0;

        if (itemCopy.selectable) {
          itemCopy.index = this._selectableItems;
          itemCopy.id = this.itemId(itemCopy.index);
          this._selectableItems += 1;

          if (item.highlight) {
            this._highlightedItemIndex = itemCopy.index;
          }
        }

        return itemCopy;
      }

      get _inputReadOnly() {
        return this._readonly || this.variant === VARIANT.STANDARD || this.hasInputPill;
      }

      get computedAriaAutocomplete() {
        if (this.hasInputPill) {
          // no aria-autocomplete when pill is showing
          return null;
        }

        return this._inputReadOnly ? 'none' : 'list';
      }

      get computedPlaceholder() {
        return this.hasInputPill ? this.inputPill.label : this.placeholder;
      }

      get computedInputValue() {
        return this.hasInputPill ? this.inputPill.label : this.inputText;
      }

      handleListboxScroll(event) {
        // We don't want this to bubble up to the modal which due to event retargeting wouldn't be able
        // to know what is actually being scrolled and thus may lead to the scrolling of the modal
        event.stopPropagation();
        const listbox = event.target;
        const height = listbox.getBoundingClientRect().height;
        const maxScroll = listbox.scrollHeight - height; // Account for variation between browsers when it comes to calculation of margins/padding

        const buffer = 20;
        const bottomReached = listbox.scrollTop + buffer >= maxScroll;

        if (bottomReached) {
          this._events.dispatchEndReached();
        }
      }

      get listboxElement() {
        if (!this._listBoxElementCache) {
          this._listBoxElementCache = this.template.querySelector('[role="listbox"]');
        }

        return this._listBoxElementCache;
      }

      get computedUniqueElementId() {
        return this.inputId;
      }

      get computedUniqueDropdownElementId() {
        return getRealDOMId(this.template.querySelector('[data-dropdown-element]'));
      }

      get computedInputControls() {
        const ariaValues = [this.computedUniqueDropdownElementId];

        if (this.inputControlsElement) {
          ariaValues.push(this.inputAriaControlsId);
        }

        return normalizeAriaAttribute(ariaValues);
      }

      get i18n() {
        return i18n$1;
      }

      get computedDropdownTriggerClass() {
        return classSet('slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click').add({
          'slds-is-open': this._dropdownVisible
        }).toString();
      }

      get computedDropdownClass() {
        const alignment = this.dropdownAlignment;
        return classSet('slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid').add({
          'slds-dropdown_length-with-icon-10': this._dropdownHeight === 'standard',
          'slds-dropdown_length-with-icon-5': this._dropdownHeight === 'small',
          'slds-dropdown_left': alignment === 'left' || alignment === 'auto',
          'slds-dropdown_center': alignment === 'center',
          'slds-dropdown_right': alignment === 'right',
          'slds-dropdown_bottom': alignment === 'bottom-center',
          'slds-dropdown_bottom slds-dropdown_right slds-dropdown_bottom-right': alignment === 'bottom-right',
          'slds-dropdown_bottom slds-dropdown_left slds-dropdown_bottom-left': alignment === 'bottom-left'
        }).toString();
      }

      get computedInputClass() {
        const classes = classSet('slds-input slds-combobox__input');

        if (this.hasInputPill) {
          classes.add('slds-combobox__input-value');
        } else {
          classes.add({
            'slds-input-has-icon_group-right': this.showInputActivityIndicator
          });
        }

        return classes.toString();
      }

      get _shouldOpenDropDown() {
        // If items were empty and through a user interaction the dropdown should have opened, and if the
        // component still has the focus we'll open it on items update instead.
        return !this.dropdownDisabled && this._inputHasFocus && this._requestedDropdownOpen;
      }

      get dropdownDisabled() {
        return this.readOnly || this.disabled;
      }

      handleOptionClick(event) {
        if (event.target.hasAttribute('aria-selected')) {
          event.stopPropagation();
          event.preventDefault();
          this.selectOptionAndCloseDropdown(event.target);
        }
      }

      handleOptionMouseEnter(event) {
        if (event.target.hasAttribute('aria-selected')) {
          this.highlightOption(event.target);
        }
      }

      handleDropdownMouseLeave() {
        this.removeHighlight(); // This is to account for when a user makes a mousedown press on the dropdown and then leaves the dropdown
        // area, it would leave the dropdown open even though the focus would no longer be on the input

        if (!this._inputHasFocus) {
          this.closeDropdown();
        }
      }

      handleTriggerClick(event) {
        event.stopPropagation();
        this.allowBlur();

        if (this.dropdownDisabled) {
          return;
        }

        if (!this.hasInputPill) {
          // toggle dropdown only for readonly combobox, only open the dropdown otherwise
          // if it's not already opened.
          if (this._inputReadOnly) {
            if (this._dropdownVisible) {
              this.closeDropdown();
            } else {
              this.openDropdownIfNotEmpty();
            }
          } else {
            this.openDropdownIfNotEmpty();
          }

          this.inputElement.focus();
        }
      }

      handlePillKeyDown(event) {
        if (this.dropdownDisabled) {
          return;
        } // 'Del' is IE11 specific, remove once IE11 is no longer supported


        if (event.key === 'Delete' || event.key === 'Del') {
          this.handlePillRemove();
        }
      }

      handleInputKeyDown(event) {
        if (this.dropdownDisabled) {
          return;
        }

        if (this.hasInputPill) {
          this.handlePillKeyDown(event);
        } else {
          handleKeyDownOnInput({
            event,
            currentIndex: this.getCurrentHighlightedOptionIndex(),
            dropdownInterface: this._keyboardInterface
          });
        }
      }

      handleTextChange() {
        this._events.dispatchTextChange(this.inputElement.value);
      }

      handleFocus() {
        this._inputHasFocus = true;

        this._events.dispatchFocus();
      }

      handleInput() {
        // Do not dispatch any events if the pill is showing, this is specifically an IE11 problem,
        // which fires an 'input' event when the placeholder on an input is changed (which is what happens when
        // the pill is shown). The check can be removed when IE11 is no longer supported.
        if (!this.hasInputPill) {
          this._events.dispatchTextInput(this.inputElement.value);
        }
      }

      handleBlur() {
        this._inputHasFocus = false;

        if (this._cancelBlur) {
          return;
        }

        this.closeDropdown();

        this._events.dispatchBlur();
      }

      handleDropdownMouseDown(event) {
        const mainButton = 0;

        if (event.button === mainButton) {
          this.cancelBlur();
        }
      }

      handleDropdownMouseUp() {
        // We need this to make sure that if a scrollbar is being dragged with the mouse, upon release
        // of the drag we allow blur, otherwise the dropdown would not close on blur since we'd have cancel blur
        // set
        this.allowBlur();
      }

      highlightOption(option) {
        this.removeHighlight();

        if (option) {
          option.highlight();
          this._highlightedOptionElement = option;
          this._highlightedOptionElementId = option.getAttribute('data-item-id'); // active element is a component id getter works properly

          this._activeElementDomId = option.id;
        }

        this.synchronizeA11y();
      }

      highlightOptionAndScrollIntoView(optionElement) {
        if (this._selectableItems.length === 0 || !optionElement) {
          return;
        }

        this.highlightOption(optionElement);
        scrollIntoViewIfNeeded(optionElement, this.listboxElement);
      }

      removeHighlight() {
        const option = this._highlightedOptionElement;

        if (option) {
          option.removeHighlight();
          this._highlightedOptionElement = null;
          this._highlightedOptionElementId = null;
          this._activeElementDomId = null;
        }
      }

      selectOptionAndCloseDropdown(optionElement) {
        this.closeDropdown();
        this.inputElement.focus();
        const value = optionElement.getAttribute('data-value');

        this._events.dispatchSelect(value);
      }

      handleInputSelect(event) {
        event.stopPropagation();
      }

      openDropdownIfNotEmpty() {
        if (this._dropdownVisible) {
          // Already visible
          return;
        }

        const noOptions = !Array.isArray(this.items) || this.items.length === 0; // Do not dispatch the open request event if there already was a request to open

        if (noOptions && !this._requestedDropdownOpen) {
          // Dispatch dropdown open request
          this._events.dispatchDropdownOpenRequest();
        } // Do not open if there's nothing to show in the dropdown (eg. no options and no dropdown activity indicator)


        if (this.isDropdownEmpty) {
          // We use this attribute to flag whether an attempt has been made via user-interaction
          // to open the dropdown
          this._requestedDropdownOpen = true;
          return;
        }

        if (!this._hasDropdownOpened) {
          if (this._unprocessedItems) {
            this.updateItems(this._unprocessedItems);
          }

          this._hasDropdownOpened = true;
        }

        this._requestedDropdownOpen = false;
        this._dropdownVisible = true; // remove-next-line-for-c-namespace

        this.startDropdownAutoPositioning();
        this.highlightDefaultItem();

        this._events.dispatchDropdownOpen();
      }

      closeDropdown() {
        if (!this._dropdownVisible) {
          // Already closed
          return;
        } // remove-next-line-for-c-namespace


        this.stopDropdownPositioning();
        this.removeHighlight();
        this._dropdownVisible = false;
      }

      findOptionElementByIndex(index) {
        return this.template.querySelector(`[data-item-id="${this.itemId(index)}"]`);
      }

      allowBlur() {
        this._cancelBlur = false;
      }

      cancelBlur() {
        this._cancelBlur = true;
      }

      getCurrentHighlightedOptionIndex() {
        if (this._highlightedOptionElementId && this._highlightedOptionElementId.length > 0) {
          return this.itemIndexFromId(this._highlightedOptionElementId);
        }

        return -1;
      }

      get inputElement() {
        return this.template.querySelector('input');
      } // remove-next-line-for-c-namespace


      startDropdownAutoPositioning() {
        if (this.dropdownAlignment !== 'auto') {
          return;
        }

        if (!this._autoPosition) {
          this._autoPosition = new AutoPosition(this);
        }

        this._autoPosition.start({
          target: () => this.template.querySelector('input'),
          element: () => this.template.querySelector('div.slds-dropdown'),
          align: {
            horizontal: Direction.Left,
            vertical: Direction.Top
          },
          targetAlign: {
            horizontal: Direction.Left,
            vertical: Direction.Bottom
          },
          autoFlip: true,
          alignWidth: true,
          autoShrinkHeight: true,
          minHeight: this._selectableItems < 3 ? SMALL_MIN_HEIGHT : MEDIUM_MIN_HEIGHT
        });
      } // remove-next-line-for-c-namespace


      stopDropdownPositioning() {
        if (this._autoPosition) {
          this._autoPosition.stop();
        }
      }

      get hasInputPill() {
        return this.inputPill && Object.keys(this.inputPill).length > 0;
      }

      handlePillRemove() {
        this.inputElement.focus();

        this._events.dispatchPillRemove(this.inputPill);
      }

      get computedFormElementClass() {
        const hasIcon = this.hasInputPill && this.inputPill.iconName;
        return classSet('slds-combobox__form-element slds-input-has-icon').add({
          'slds-input-has-icon_right': !hasIcon,
          'slds-input-has-icon_left-right': hasIcon
        }).toString();
      }

      get computedAriaExpanded() {
        return this._dropdownVisible ? 'true' : 'false';
      }

      updateItems(items) {
        if (!items) {
          return;
        }

        assert(Array.isArray(items), '"items" must be an array');
        this._selectableItems = 0;
        this._highlightedItemIndex = 0;
        this._items = items.map(item => {
          if (item.items) {
            // This is a group
            const groupCopy = {
              label: item.label
            };
            groupCopy.items = item.items.map(groupItem => {
              return this.processItem(groupItem);
            });
            return groupCopy;
          }

          return this.processItem(item);
        });
      }

      highlightDefaultItem() {
        this.removeHighlight(); // eslint-disable-next-line @lwc/lwc/no-async-operation

        requestAnimationFrame(() => {
          this.highlightOptionAndScrollIntoView(this.findOptionElementByIndex(this._highlightedItemIndex));
        });
      }

      get isDropdownEmpty() {
        // If the activity indicator is showing then it's not empty
        return !this.showDropdownActivityIndicator && (!Array.isArray(this.items) || this.items.length === 0);
      }

      dropdownKeyboardInterface() {
        const that = this;
        return {
          getTotalOptions() {
            return that._selectableItems;
          },

          selectByIndex(index) {
            that.selectOptionAndCloseDropdown(that.findOptionElementByIndex(index));
          },

          highlightOptionWithIndex(index) {
            that.highlightOptionAndScrollIntoView(that.findOptionElementByIndex(index));
          },

          isInputReadOnly() {
            return that._inputReadOnly;
          },

          highlightOptionWithText(currentIndex, text) {
            // This only supports a flat structure, groups are not supported
            for (let index = currentIndex + 1; index < that._items.length; index++) {
              const option = that._items[index];

              if (option.selectable && option.text && option.text.toLowerCase().indexOf(text.toLowerCase()) === 0) {
                that.highlightOptionAndScrollIntoView(that.findOptionElementByIndex(index));
                return;
              }
            }

            for (let index = 0; index < currentIndex; index++) {
              const option = that._items[index];

              if (option.selectable && option.text && option.text.toLowerCase().indexOf(text.toLowerCase()) === 0) {
                that.highlightOptionAndScrollIntoView(that.findOptionElementByIndex(index));
                return;
              }
            }
          },

          isDropdownVisible() {
            return that._dropdownVisible;
          },

          openDropdownIfNotEmpty() {
            that.openDropdownIfNotEmpty();
          },

          closeDropdown() {
            that.closeDropdown();
          }

        };
      }

    }

    LightningBaseCombobox.delegatesFocus = true;

    lwc.registerDecorators(LightningBaseCombobox, {
      publicProps: {
        inputText: {
          config: 0
        },
        inputIconName: {
          config: 0
        },
        inputIconSize: {
          config: 0
        },
        inputIconAlternativeText: {
          config: 0
        },
        inputMaxlength: {
          config: 0
        },
        showInputActivityIndicator: {
          config: 0
        },
        required: {
          config: 0
        },
        dropdownAlignment: {
          config: 0
        },
        placeholder: {
          config: 0
        },
        inputLabel: {
          config: 0
        },
        name: {
          config: 0
        },
        inputPill: {
          config: 0
        },
        attributionLogoUrl: {
          config: 0
        },
        attributionLogoAssistiveText: {
          config: 0
        },
        inputControlsElement: {
          config: 3
        },
        inputDescribedByElements: {
          config: 3
        },
        inputLabelledByElement: {
          config: 3
        },
        dropdownHeight: {
          config: 3
        },
        showDropdownActivityIndicator: {
          config: 3
        },
        disabled: {
          config: 3
        },
        readOnly: {
          config: 3
        },
        variant: {
          config: 3
        },
        items: {
          config: 3
        }
      },
      publicMethods: ["highlightInputText", "focus", "focusAndOpenDropdownIfNotEmpty", "blur"],
      track: {
        _showDropdownActivityIndicator: 1,
        _items: 1,
        _disabled: 1,
        _dropdownVisible: 1,
        _hasDropdownOpened: 1,
        _highlightedOptionElementId: 1,
        _variant: 1,
        _dropdownHeight: 1,
        _readonly: 1,
        _logoLoaded: 1
      },
      fields: ["_inputDescribedBy", "_inputAriaControls", "_activeElementDomId"]
    });

    var _lightningBaseCombobox = lwc.registerComponent(LightningBaseCombobox, {
      tmpl: _tmpl$b
    });

    function scrollIntoViewIfNeeded(element, scrollingParent) {
      const parentRect = scrollingParent.getBoundingClientRect();
      const findMeRect = element.getBoundingClientRect();

      if (findMeRect.top < parentRect.top) {
        if (element.offsetTop + findMeRect.height < parentRect.height) {
          // If element fits by scrolling to the top, then do that
          scrollingParent.scrollTop = 0;
        } else {
          // Otherwise, top align the element
          scrollingParent.scrollTop = element.offsetTop;
        }
      } else if (findMeRect.bottom > parentRect.bottom) {
        // bottom align the element
        scrollingParent.scrollTop += findMeRect.bottom - parentRect.bottom;
      }
    }

    function tmpl$d($api, $cmp, $slotset, $ctx) {
      const {
        t: api_text,
        h: api_element,
        d: api_dynamic,
        c: api_custom_element,
        b: api_bind,
        gid: api_scoped_id
      } = $api;
      const {
        _m0,
        _m1,
        _m2,
        _m3,
        _m4
      } = $ctx;
      return [api_element("label", {
        className: $cmp.computedLabelClass,
        key: 1
      }, [$cmp.required ? api_element("abbr", {
        classMap: {
          "slds-required": true
        },
        attrs: {
          "title": $cmp.i18n.required
        },
        key: 0
      }, [api_text("*")]) : null, api_dynamic($cmp.label)]), $cmp._fieldLevelHelp ? api_custom_element("lightning-helptext", _lightningHelptext, {
        props: {
          "content": $cmp._fieldLevelHelp
        },
        key: 2
      }, []) : null, api_element("div", {
        classMap: {
          "slds-form-element__control": true
        },
        key: 4
      }, [api_custom_element("lightning-base-combobox", _lightningBaseCombobox, {
        props: {
          "name": $cmp.name,
          "required": $cmp.required,
          "disabled": $cmp.disabled,
          "placeholder": $cmp.placeholder,
          "items": $cmp._items,
          "inputText": $cmp._selectedLabel,
          "inputIconSize": "xx-small",
          "inputIconName": "utility:down",
          "showDropdownActivityIndicator": $cmp.spinnerActive,
          "dropdownAlignment": $cmp.dropdownAlignment
        },
        key: 3,
        on: {
          "dropdownopen": _m0 || ($ctx._m0 = api_bind($cmp.handleDropdownOpen)),
          "focus": _m1 || ($ctx._m1 = api_bind($cmp.handleFocus)),
          "blur": _m2 || ($ctx._m2 = api_bind($cmp.handleBlur)),
          "ready": _m3 || ($ctx._m3 = api_bind($cmp.handleComboboxReady)),
          "select": _m4 || ($ctx._m4 = api_bind($cmp.handleSelect))
        }
      }, [])]), $cmp._helpMessage ? api_element("div", {
        classMap: {
          "slds-form-element__help": true
        },
        attrs: {
          "id": api_scoped_id("help-text"),
          "data-help-text": true,
          "aria-live": "assertive"
        },
        key: 5
      }, [api_dynamic($cmp._helpMessage)]) : null];
    }

    var _tmpl$c = lwc.registerTemplate(tmpl$d);
    tmpl$d.stylesheets = [];

    if (_implicitStylesheets$2) {
      tmpl$d.stylesheets.push.apply(tmpl$d.stylesheets, _implicitStylesheets$2);
    }
    tmpl$d.stylesheetTokens = {
      hostAttribute: "lightning-combobox_combobox-host",
      shadowAttribute: "lightning-combobox_combobox"
    };

    var labelRequired = 'required';

    var labelPlaceholder = 'Select an Option';

    const i18n$2 = {
      required: labelRequired,
      placeholder: labelPlaceholder
    };
    /**
     * A widget that provides an input field that is readonly,
     * accompanied by a dropdown list of selectable options.
     */

    class LightningCombobox extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this._ariaLabelledBy = '';
        this._ariaDescribedBy = '';
        this._fieldLevelHelp = '';
        this._selectedLabel = '';
        this._disabled = false;
        this._readOnly = false;
        this._spinnerActive = false;
        this._required = false;
        this.label = void 0;
        this.dropdownAlignment = 'left';
        this.placeholder = i18n$2.placeholder;
        this.messageWhenValueMissing = void 0;
        this.name = void 0;
        this._items = [];
        this._variant = void 0;
        this._helpMessage = void 0;
        this._labelForId = void 0;
      }

      renderedCallback() {
        this.synchronizeA11y();
      }

      connectedCallback() {
        this.classList.add('slds-form-element');
        this.updateClassList();
        this.interactingState = new InteractingState();
        this.interactingState.onleave(() => this.showHelpMessageIfInvalid()); // The connected logic here is needed because at the point when @api setters
        // are called other values may not have been set yet, so it could happen that the 'value' was set, but 'options'
        // are not available, or that the 'options' and 'value' have been set but 'multiple' hasn't been set yet.
        // So here we make sure that we start processing the data only once the element is actually in DOM, which
        // should be beneficial for performance as well

        this.connected = true;
        this._items = this.generateItems(this.options);

        if (this.options && this.selectedValue !== undefined) {
          this.updateSelectedOptions();
        }
      }

      updateClassList() {
        classListMutation(this.classList, {
          'slds-form-element_stacked': this.variant === VARIANT.LABEL_STACKED,
          'slds-form-element_horizontal': this.variant === VARIANT.LABEL_INLINE
        });
      }

      disconnectedCallback() {
        this.connected = false;
      }
      /**
       * Reserved for internal use. Use the standard aria-labelledby instead. A space-separated list of element IDs that provide labels for the combobox.
       * @type {string}
       */


      get ariaLabelledBy() {
        return this._ariaLabelledBy;
      }

      set ariaLabelledBy(labelledBy) {
        this._ariaLabelledBy = labelledBy;
      }
      /**
       * Reserved for internal use. Use the standard aria-describedby instead. A space-separated list of element IDs that provide descriptive labels for the combobox.
       * @type {string}
       */


      get ariaDescribedBy() {
        return this._ariaDescribedBy;
      }

      set ariaDescribedBy(describedBy) {
        this._ariaDescribedBy = describedBy;
      }
      /**
       * Help text detailing the purpose and function of the combobox.
       * @type {string}
       */


      get fieldLevelHelp() {
        return this._fieldLevelHelp;
      }

      set fieldLevelHelp(value) {
        this._fieldLevelHelp = value;
      }
      /**
       * The variant changes the appearance of the combobox.
       * Accepted variants include standard, label-hidden, label-inline, and label-stacked.
       * This value defaults to standard.
       * Use label-hidden to hide the label but make it available to assistive technology.
       * Use label-inline to horizontally align the label and combobox.
       * Use label-stacked to place the label above the combobox.
       * @type {string}
       * @default standard
       */


      get variant() {
        return this._variant || VARIANT.STANDARD;
      }

      set variant(value) {
        this._variant = normalizeVariant$1(value);
        this.updateClassList();
      }
      /**
       * Specifies the value of an input element.
       * @type {object}
       */


      get value() {
        return this.selectedValue;
      }

      set value(newValue) {
        // There are some cases where this won't work correctly
        // See https://git.soma.salesforce.com/raptor/raptor/issues/457
        if (newValue !== this.selectedValue) {
          this.selectedValue = newValue;

          if (this.connected && this.options) {
            this.updateSelectedOptions();
          }
        }
      }
      /**
       * A list of options that are available for selection. Each option has the following attributes: label and value.
       * @type {object[]}
       * @required
       */


      get options() {
        return this._options || [];
      }

      set options(newValue) {
        this._options = normalizeArray(newValue);

        if (this.connected) {
          this._items = this.generateItems(this._options);
          this.updateSelectedOptions();
        }
      }
      /**
       * If present, the combobox is disabled and users cannot interact with it.
       * @type {boolean}
       * @default false
       */


      get disabled() {
        return this._disabled || this._readOnly || false;
      }

      set disabled(value) {
        this._disabled = normalizeBoolean(value);
      }
      /**
       * If present, the combobox is read-only.
       * A read-only combobox is also disabled.
       * @type {boolean}
       * @default false
       */


      get readOnly() {
        return this.disabled;
      }

      set readOnly(value) {
        this._readOnly = normalizeBoolean(value);
      }
      /**
       * If present, a value must be selected before the form can be submitted.
       * @type {boolean}
       * @default false
       */


      get required() {
        return this._required;
      }

      set required(value) {
        this._required = normalizeBoolean(value);
      }
      /**
       * If present, a spinner is displayed below the menu items to indicate loading activity.
       * @type {boolean}
       * @default false
       */


      get spinnerActive() {
        return this._spinnerActive;
      }

      set spinnerActive(value) {
        this._spinnerActive = normalizeBoolean(value);
      }
      /**
       * Sets focus on the combobox.
       */


      focus() {
        if (this.connected) {
          this.getBaseComboboxElement().focus();
        }
      }
      /**
       * Removes focus from the combobox.
       */


      blur() {
        if (this.connected) {
          this.getBaseComboboxElement().blur();
        }
      }
      /**
       * Represents the validity states that an element can be in, with respect to constraint validation.
       * @type {object}
       * @required
       */


      get validity() {
        return this._constraint.validity;
      }
      /**
       * Returns the valid attribute value (Boolean) on the ValidityState object.
       * @returns {boolean} Indicates whether the combobox has any validity errors.
       */


      checkValidity() {
        return this._constraint.checkValidity();
      }
      /**
       * Displays the error messages and returns false if the input is invalid.
       * If the input is valid, reportValidity() clears displayed error messages and returns true.
       * @returns {boolean} - The validity status of the combobox.
       */


      reportValidity() {
        return this._constraint.reportValidity(message => {
          this._helpMessage = message;
        });
      }
      /**
       * Sets a custom error message to be displayed when the combobox value is submitted.
       * @param {string} message - The string that describes the error. If message is an empty string, the error message
       * is reset.
       */


      setCustomValidity(message) {
        this._constraint.setCustomValidity(message);
      }
      /**
       * Shows the help message if the combobox is in an invalid state.
       */


      showHelpMessageIfInvalid() {
        this.reportValidity();
      }

      handleComboboxReady(e) {
        this._labelForId = e.detail.id;
      }

      synchronizeA11y() {
        synchronizeAttrs(this.template.querySelector('label'), {
          for: this._labelForId
        });
        const baseCombobox = this.template.querySelector('lightning-base-combobox');
        baseCombobox.inputLabelledByElement = this.ariaLabelledBy;
        baseCombobox.inputDescribedByElements = this.computedAriaDescribedBy;
      }

      get i18n() {
        return i18n$2;
      }

      get isLabelHidden() {
        return this.variant === VARIANT.LABEL_HIDDEN;
      }

      get computedLabelClass() {
        return classSet('slds-form-element__label').add({
          'slds-assistive-text': this.isLabelHidden
        }).toString();
      }

      get computedAriaDescribedBy() {
        const describedByElements = [];

        if (this._helpMessage) {
          const helpText = this.template.querySelector('[data-help-text]');
          describedByElements.push(helpText);
        }

        if (typeof this.ariaDescribedBy === 'string') {
          describedByElements.push(this.ariaDescribedBy);
        }

        return describedByElements;
      }

      handleSelect(event) {
        if (event.detail.value === this.selectedValue) {
          return;
        }

        this.selectedValue = event.detail.value;
        this.updateSelectedOptions(); // the change event needs to propagate to elements outside of the light-DOM, hence making it composed.

        this.dispatchEvent(new CustomEvent('change', {
          composed: true,
          bubbles: true,
          detail: {
            value: this.selectedValue
          }
        }));
      }

      handleFocus() {
        this.interactingState.enter();
        this.dispatchEvent(new CustomEvent('focus'));
      }

      handleBlur() {
        this.interactingState.leave();
        this.dispatchEvent(new CustomEvent('blur'));
      }

      handleDropdownOpen() {
        this.dispatchEvent(new CustomEvent('open'));
      }

      updateSelectedOptions() {
        this.updateSelectedLabelFromValue(this.selectedValue);
        this.markOptionSelectedFromValue(this.selectedValue);
      }

      markOptionSelectedFromValue(value) {
        if (this._items) {
          const selectedItem = this._items.find(item => item.value === value); // de-select previously selected item


          if (this._selectedItem) {
            this._selectedItem.iconName = undefined;
            this._selectedItem.highlight = false;
          }

          this._selectedItem = selectedItem;

          if (selectedItem) {
            selectedItem.iconName = 'utility:check';
            this._selectedItem.highlight = true;
          } // Make a shallow copy to trigger an update on the combobox


          this._items = this._items.slice();
        }
      }

      updateSelectedLabelFromValue(newValue) {
        this._selectedLabel = this.getOptionLabelByValue(newValue);
      }

      getOptionLabelByValue(value) {
        const foundOption = this.options.find(option => option.value === value);

        if (foundOption) {
          return foundOption.label;
        }

        return '';
      }

      generateItems(options) {
        return options.map(option => {
          return {
            type: 'option-inline',
            text: option.label,
            highlight: this.value === option.value,
            value: option.value
          };
        });
      }

      getBaseComboboxElement() {
        return this.template.querySelector('lightning-base-combobox');
      }

      get _constraint() {
        if (!this._constraintApi) {
          this._constraintApi = new FieldConstraintApi(() => this, {
            valueMissing: () => !this.disabled && this.required && isEmptyString(this.selectedValue)
          });
        }

        return this._constraintApi;
      }

    }

    LightningCombobox.delegatesFocus = true;

    lwc.registerDecorators(LightningCombobox, {
      publicProps: {
        label: {
          config: 0
        },
        dropdownAlignment: {
          config: 0
        },
        placeholder: {
          config: 0
        },
        messageWhenValueMissing: {
          config: 0
        },
        name: {
          config: 0
        },
        ariaLabelledBy: {
          config: 3
        },
        ariaDescribedBy: {
          config: 3
        },
        fieldLevelHelp: {
          config: 3
        },
        variant: {
          config: 3
        },
        value: {
          config: 3
        },
        options: {
          config: 3
        },
        disabled: {
          config: 3
        },
        readOnly: {
          config: 3
        },
        required: {
          config: 3
        },
        spinnerActive: {
          config: 3
        },
        validity: {
          config: 1
        }
      },
      publicMethods: ["focus", "blur", "checkValidity", "reportValidity", "setCustomValidity", "showHelpMessageIfInvalid"],
      track: {
        _ariaLabelledBy: 1,
        _ariaDescribedBy: 1,
        _fieldLevelHelp: 1,
        _selectedLabel: 1,
        _disabled: 1,
        _readOnly: 1,
        _spinnerActive: 1,
        _required: 1,
        _items: 1,
        _variant: 1,
        _helpMessage: 1
      },
      fields: ["_labelForId"]
    });

    var _lightningCombobox = lwc.registerComponent(LightningCombobox, {
      tmpl: _tmpl$c
    });

    function tmpl$e($api, $cmp, $slotset, $ctx) {
      const {
        b: api_bind,
        c: api_custom_element,
        h: api_element
      } = $api;
      const {
        _m0,
        _m1
      } = $ctx;
      return [api_custom_element("lightning-layout", _lightningLayout, {
        props: {
          "multipleRows": true
        },
        key: 7
      }, [api_custom_element("lightning-layout-item", _lightningLayoutItem, {
        props: {
          "size": "6"
        },
        key: 6
      }, [api_custom_element("lightning-card", _lightningCard, {
        props: {
          "title": "Select Account"
        },
        key: 5
      }, [api_element("div", {
        attrs: {
          "slot": "actions"
        },
        key: 1
      }, [api_custom_element("lightning-button", _lightningButton, {
        attrs: {
          "slot": "actions"
        },
        props: {
          "title": "New Account",
          "label": "New Account"
        },
        key: 0,
        on: {
          "click": _m0 || ($ctx._m0 = api_bind($cmp.createNewAccount))
        }
      }, [])]), api_element("p", {
        classMap: {
          "slds-var-p-horizontal_small": true
        },
        key: 4
      }, [api_custom_element("lightning-layout-item", _lightningLayoutItem, {
        classMap: {
          "slds-align-middle": true
        },
        key: 3
      }, [api_custom_element("lightning-combobox", _lightningCombobox, {
        classMap: {
          "slds-align-middle": true
        },
        props: {
          "value": $cmp.selectedAccountId,
          "options": $cmp.searchAccount
        },
        key: 2,
        on: {
          "change": _m1 || ($ctx._m1 = api_bind($cmp.handleAccountChange))
        }
      }, [])])])])])])];
    }

    var _tmpl$d = lwc.registerTemplate(tmpl$e);
    tmpl$e.stylesheets = [];
    tmpl$e.stylesheetTokens = {
      hostAttribute: "lwc-accountSearchForm_accountSearchForm-host",
      shadowAttribute: "lwc-accountSearchForm_accountSearchForm"
    };

    function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? Object(arguments[i]) : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty$1(target, key, source[key]); }); } return target; }

    function _defineProperty$1(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    var LayoutType;

    (function (LayoutType) {
      LayoutType["Full"] = "Full";
      LayoutType["Compact"] = "Compact";
    })(LayoutType || (LayoutType = {}));

    var LayoutMode;

    (function (LayoutMode) {
      LayoutMode["View"] = "View";
      LayoutMode["Edit"] = "Edit";
      LayoutMode["Create"] = "Create";
    })(LayoutMode || (LayoutMode = {}));

    const getListUiByApiName_ConfigPropertyNames = {
      displayName: 'getListUiByApiName',
      parameters: {
        required: ['objectApiName', 'listViewApiName'],
        optional: ['fields', 'optionalFields', 'pageSize', 'pageToken', 'sortBy']
      }
    };
    const getListUiByListViewId_ConfigPropertyNames = {
      displayName: 'getListUiByListViewId',
      parameters: {
        required: ['listViewId'],
        optional: ['fields', 'optionalFields', 'pageSize', 'pageToken', 'sortBy']
      }
    };
    const getMruListUi_ConfigPropertyNames = {
      displayName: 'getMruListUi',
      parameters: {
        required: ['objectApiName'],
        optional: ['fields', 'optionalFields', 'pageSize', 'pageToken', 'sortBy']
      }
    }; // make local copies of the adapter configs so we can ignore other getListUi config parameters to match
    // lds222 behavior

    const getMruListUi_ConfigPropertyNames_augmented = _objectSpread$1({}, getMruListUi_ConfigPropertyNames, {
      parameters: _objectSpread$1({}, getMruListUi_ConfigPropertyNames.parameters, {
        optional: [...getMruListUi_ConfigPropertyNames.parameters.optional, 'listViewApiName', 'listViewId']
      })
    }); // make local copies of the adapter configs so we can have them ignore each other's config parameters
    // to match lds222 behavior


    const getListUiByApiName_ConfigPropertyNames_augmented = _objectSpread$1({}, getListUiByApiName_ConfigPropertyNames, {
      parameters: _objectSpread$1({}, getListUiByApiName_ConfigPropertyNames.parameters, {
        optional: [...getListUiByApiName_ConfigPropertyNames.parameters.optional, 'listViewId']
      })
    });

    const getListUiByListViewId_ConfigPropertyNames_augmented = _objectSpread$1({}, getListUiByListViewId_ConfigPropertyNames, {
      parameters: _objectSpread$1({}, getListUiByListViewId_ConfigPropertyNames.parameters, {
        optional: [...getListUiByListViewId_ConfigPropertyNames.parameters.optional, 'listViewApiName', 'objectApiName']
      })
    });

    const DEFAULT_MODE = LayoutMode.View;
    var DiscriminatorValues;

    (function (DiscriminatorValues) {
      DiscriminatorValues["Photo"] = "Photo";
      DiscriminatorValues["Theme"] = "Theme";
    })(DiscriminatorValues || (DiscriminatorValues = {}));

    var FormFactor;

    (function (FormFactor) {
      FormFactor["Large"] = "Large";
      FormFactor["Medium"] = "Medium";
      FormFactor["Small"] = "Small";
    })(FormFactor || (FormFactor = {}));

    const select$j = function LeadStatusPicklistValueAttributesRepresentationSelect() {
      const {
        selections: AbstractPicklistValueAttributesRepresentationSelections
      } = select$m();
      return {
        kind: 'Fragment',
        selections: [...AbstractPicklistValueAttributesRepresentationSelections, {
          name: 'converted',
          kind: 'Scalar'
        }]
      };
    };

    const select$k = function CaseStatusPicklistValueAttributesRepresentationSelect() {
      const {
        selections: AbstractPicklistValueAttributesRepresentationSelections
      } = select$m();
      return {
        kind: 'Fragment',
        selections: [...AbstractPicklistValueAttributesRepresentationSelections, {
          name: 'closed',
          kind: 'Scalar'
        }]
      };
    };

    const select$l = function OpportunityStagePicklistValueAttributesRepresentationSelect() {
      const {
        selections: AbstractPicklistValueAttributesRepresentationSelections
      } = select$m();
      return {
        kind: 'Fragment',
        selections: [...AbstractPicklistValueAttributesRepresentationSelections, {
          name: 'closed',
          kind: 'Scalar'
        }, {
          name: 'defaultProbability',
          kind: 'Scalar'
        }, {
          name: 'forecastCategoryName',
          kind: 'Scalar'
        }, {
          name: 'won',
          kind: 'Scalar'
        }]
      };
    };

    var DiscriminatorValues$2;

    (function (DiscriminatorValues) {
      DiscriminatorValues["LeadStatus"] = "LeadStatus";
      DiscriminatorValues["CaseStatus"] = "CaseStatus";
      DiscriminatorValues["OpportunityStage"] = "OpportunityStage";
    })(DiscriminatorValues$2 || (DiscriminatorValues$2 = {}));

    const selectChildren$2 = function AbstractPicklistValueAttributesRepresentationSelectChildren(params) {
      const {
        selections: LeadStatusPicklistValueAttributesRepresentationSelections
      } = select$j();
      const {
        selections: CaseStatusPicklistValueAttributesRepresentationSelections
      } = select$k();
      const {
        selections: OpportunityStagePicklistValueAttributesRepresentationSelections
      } = select$l();
      return {
        kind: 'Object',
        name: params.propertyName,
        nullable: params.nullable,
        union: true,
        discriminator: 'picklistAtrributesValueType',
        unionSelections: {
          [DiscriminatorValues$2.LeadStatus]: LeadStatusPicklistValueAttributesRepresentationSelections,
          [DiscriminatorValues$2.CaseStatus]: CaseStatusPicklistValueAttributesRepresentationSelections,
          [DiscriminatorValues$2.OpportunityStage]: OpportunityStagePicklistValueAttributesRepresentationSelections
        }
      };
    };

    const select$m = function AbstractPicklistValueAttributesRepresentationSelect() {
      return {
        kind: 'Fragment',
        selections: [{
          name: 'picklistAtrributesValueType',
          kind: 'Scalar'
        }]
      };
    };

    const select$n = function PicklistValueRepresentationSelect() {
      const AbstractPicklistValueAttributesRepresentation__unionSelections = selectChildren$2({
        propertyName: 'attributes',
        nullable: true
      });
      return {
        kind: 'Fragment',
        selections: [AbstractPicklistValueAttributesRepresentation__unionSelections, {
          name: 'label',
          kind: 'Scalar'
        }, {
          name: 'validFor',
          kind: 'Scalar',
          plural: true
        }, {
          name: 'value',
          kind: 'Scalar'
        }]
      };
    };

    const select$o = function PicklistValuesRepresentationSelect() {
      const {
        selections: PicklistValueRepresentation__selections,
        opaque: PicklistValueRepresentation__opaque
      } = select$n();
      return {
        kind: 'Fragment',
        selections: [{
          name: 'controllerValues',
          kind: 'Scalar',
          map: true
        }, {
          name: 'defaultValue',
          kind: 'Object',
          nullable: true,
          selections: PicklistValueRepresentation__selections
        }, {
          name: 'url',
          kind: 'Scalar'
        }, {
          name: 'values',
          kind: 'Object',
          plural: true,
          selections: PicklistValueRepresentation__selections
        }]
      };
    };

    const path = select$o().selections;

    function _objectSpread$2(target){for(var i=1;i<arguments.length;i++){var source=arguments[i]!=null?Object(arguments[i]):{};var ownKeys=Object.keys(source);if(typeof Object.getOwnPropertySymbols==='function'){ownKeys=ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym){return Object.getOwnPropertyDescriptor(source,sym).enumerable;}));}ownKeys.forEach(function(key){_defineProperty$2(target,key,source[key]);});}return target;}function _defineProperty$2(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj;}// really should just be whatever the server sends back for currentPageToken
    // when the request did not specify a pageToken parameter.
    const DEFAULT_TOKEN='0';const END_TOKEN='__END__';// TODO: re-evaluate passing save function vs something like getPaginationData
    function pagination(pd,save){const pd_=pd||{[DEFAULT_TOKEN]:0};return {defaultToken:()=>DEFAULT_TOKEN,endOffset:()=>pd_[END_TOKEN],isPastEnd:offset=>{return END_TOKEN in pd_&&offset>=pd_[END_TOKEN];},limitToEnd:offset=>{return END_TOKEN in pd_&&offset>=pd_[END_TOKEN]?pd_[END_TOKEN]:offset;},offsetFor:token=>{return pd_[token||DEFAULT_TOKEN];},save:()=>{if(!save){{throw new Error('pagination.save() invoked but no save function supplied');}}else {save(pd_);}},setEnd:offset=>{if(offset===undefined){delete pd_[END_TOKEN];}else {pd_[END_TOKEN]=offset;}},setToken:(token,offset)=>{if(offset===undefined){delete pd_[token];}else {pd_[token]=offset;}},tokenFor:offset=>{const tokens=Object.keys(pd_);for(let i=0;i<tokens.length;++i){if(pd_[tokens[i]]===offset){return tokens[i];}}},tokenForAtMost:offset=>{let result=[DEFAULT_TOKEN,0];const tokens=Object.keys(pd_);for(let i=0;i<tokens.length;++i){let offsetI=pd_[tokens[i]];if(offsetI<=offset&&offsetI>result[1]){result=[tokens[i],offsetI];}}return result;}};}function isUnionLinkSelection(sel){return sel.union===true&&sel.kind==='Link';}function isUnionObjectSelection(sel){return sel.union===true&&sel.kind==='Object';}function isFragmentUnionSelection(sel){return sel.union===true;}const{keys,create,freeze}=Object;const{hasOwnProperty}=Object.prototype;const{isArray}=Array;const{push,indexOf,slice}=Array.prototype;const{stringify}=JSON;function formatStorageKey(name,argValues){if(!argValues){return name;}var values=[];for(var _argName in argValues){if(hasOwnProperty.call(argValues,_argName)){var value=argValues[_argName];if(value!==null||value!==undefined){values.push(_argName+':'+stringify(value));}}}return values.length===0?name:name+'('.concat(values.join(','),')');}function getArgumentValues(args,variables){const values={};args.forEach(arg=>{if(arg.kind==='Variable'){// Variables are provided at runtime and are not guaranteed to be stable.
    values[arg.name]=variables[arg.variableName];}else {values[arg.name]=arg.value;}});return values;}function getStorageKey(field,variables){const{args,name}=field;if(args&&args.length!==0){return formatStorageKey(name,getArgumentValues(args,variables));}return name;}const READER_PATH_ROOT='ROOT';const EMPTY_STRING='';function validateUnionSelection(record,selection,path){const{discriminator}=selection;const discriminatorValue=record[discriminator];if(discriminatorValue===undefined){throw new Error(`Invalid discriminator. Expected discriminator at path "${path.fullPath}.${discriminator}" but received "${stringify(record)}"`);}const unionSelection=selection.unionSelections[discriminatorValue];if(unionSelection===undefined){const keys=Object.keys(selection.unionSelections).map(key=>`"${key}"`).join(', ');throw new Error(`Invalid union selection. Expected to be one of ${keys} but received "${discriminatorValue}"`);}}class Reader{constructor(records,expirationMap,variables,refresh,baseSnapshot){this.missingPaths={};this.hasPendingData=false;this.variables=variables;this.records=records;this.seenIds={};this.isMissingData=false;this.refresh=refresh;// When we aren't passed a base snapshot, we don't have to worry about
    // marking the snapshot as changed because there is nothing to compare against.
    // Therefore, our initial state is that the snapshot has changed.
    let snapshotChanged=true;// When we aren't passed a base snapshot, we do not have any previous data
    // So we can just assign this to undefined
    let baseSnapshotValue=undefined;// When we are passed a base snapshot, we want to keep track of the previous data
    // We also will need to compare all of our data against the snapshot's previous data
    // Our initial state is that the snapshot has not changed. The reason for this is because
    // Once we detect a change, we can just flip this boolean on the first change and then
    // not have to worry about it for additional changes.
    if(baseSnapshot!==undefined&&baseSnapshot.state===SnapshotState.Fulfilled){baseSnapshotValue=baseSnapshot.data;snapshotChanged=false;}this.snapshotChanged=snapshotChanged;this.currentPath={fullPath:EMPTY_STRING,key:READER_PATH_ROOT,parent:null,baseSnapshotValue};this.baseSnapshot=baseSnapshot;this.expirationMap=expirationMap;this.timestamp=Date.now();}pagination(key){return pagination(this.records[key]);}readFragmentUnion(recordId,record,selection){{validateUnionSelection(record,selection,this.currentPath);}const{discriminator}=selection;const discriminatorValue=record[discriminator];return this.read({recordId,node:{kind:'Fragment',selections:selection.unionSelections[discriminatorValue]},variables:this.variables});}read(selector){const{recordId}=selector;const record=this.storeLookup(recordId);const{node:selectorNode}=selector;// Record does not exist or is expired
    if(record===undefined){if(this.isMissingData===false){this.isMissingData=true;this.snapshotChanged=true;}return this.createSnapshot(undefined,selector);}if(isFragmentUnionSelection(selectorNode)){return this.readFragmentUnion(recordId,record,selectorNode);}// top level record could be null when opaque
    if(record===null&&selectorNode.opaque===true){return this.createSnapshot(null,selector);}if(isStoreRecordError(record)){return this.createErrorSnapshot(record.error);}if(selectorNode.opaque===true){this.checkIfChanged(record);return this.createSnapshot(record,selector);}let data=isArray(record)?[]:{};this.traverseSelections(selectorNode,record,data);freeze(data);return this.createSnapshot(data,selector);}getSnapshotState(){if(this.isMissingData===true){return SnapshotState.Unfulfilled;}if(this.hasPendingData===true){return SnapshotState.Pending;}return SnapshotState.Fulfilled;}createErrorSnapshot(data){return {data:undefined,error:data,state:SnapshotState.Error,refresh:this.refresh};}createSnapshot(data,selector){if(this.snapshotChanged===false){return this.baseSnapshot;}return {recordId:selector.recordId,select:selector,variables:this.variables,seenRecords:this.seenIds,data,state:this.getSnapshotState(),missingPaths:this.missingPaths,refresh:this.refresh};// Typescript complains about unfulfilled vs fulfilled snapshot if we don't cast
    }deepCopy(record,data,key,visitedKeys){const value=record[key];this.enterPath(key);if(isArray(value)){// Array
    const items=[];this.selectAll(value,items,visitedKeys);data[key]=items;}else if(typeof value==='object'&&value!==null){// Object
    if(value.__ref!==undefined){// Link
    const nextRecordId=value.__ref;if(isArray(nextRecordId)){const items=[];this.selectAll(nextRecordId,items,visitedKeys);data[key]=items;}else {if(hasOwnProperty.call(visitedKeys,nextRecordId)===true){throw new Error(`Invalid eager selection on records with circular references.`);}this.seenIds[nextRecordId]=true;const nextRecord=this.storeLookup(nextRecordId);if(nextRecord===undefined){this.markMissing();data[key]=undefined;}else {const nested={};this.selectAll(nextRecord,nested,_objectSpread$2({},visitedKeys,{[nextRecordId]:true}));data[key]=nested;}}}else {// Inlined object
    const items={};this.selectAll(value,items,visitedKeys);data[key]=items;}}else {// Scalar
    this.checkIfChanged(value);data[key]=value;}this.exitPath();}selectAllArray(record,data,visitedKeys){const{length}=record;for(let key=0;key<length;key+=1){this.deepCopy(record,data,key,visitedKeys);}}selectAllObject(record,data,visitedKeys){const recordKeys=keys(record);const{length}=recordKeys;for(let i=0;i<length;i+=1){const key=recordKeys[i];this.deepCopy(record,data,key,visitedKeys);}}selectAll(record,data,visitedKeys={}){const recordIsArray=isArray(record);if(recordIsArray===true){this.selectAllArray(record,data,visitedKeys);}else {this.selectAllObject(record,data,visitedKeys);}freeze(data);}markPending(){this.hasPendingData=true;}markMissing(){this.isMissingData=true;this.missingPaths[this.currentPath.fullPath]=true;this.checkIfChanged(undefined);}assignNonScalar(sink,key,value){sink[key]=value;freeze(value);}enterPath(key){const parent=this.currentPath;const{key:parentKey,fullPath:parentFullPath,baseSnapshotValue:parentBaseSnapshotValue}=parent;let baseSnapshotValue=undefined;if(parentBaseSnapshotValue!==undefined&&parentBaseSnapshotValue!==null){baseSnapshotValue=parentBaseSnapshotValue[key];}this.currentPath={parent,key,fullPath:parentKey===READER_PATH_ROOT?key:parentFullPath+'.'+key,baseSnapshotValue};}exitPath(){this.currentPath=this.currentPath.parent;}readSingleLink(propertyName,selection,record,data){const{seenIds:ids}=this;const link=record[propertyName];// This condition is hit when the link it self isn't present
    if(link===undefined){return this.markMissing();}if(selection.nullable===true&&link===null){this.readScalar(propertyName,record,data);return;}const{__ref:refId,pending,isMissing}=link;if(pending===true){this.markPending();return;}if(isMissing===true&&selection.required===false){return;}if(refId===undefined){return this.markMissing();}const linkedRecord=this.storeLookup(refId);// This condition is hit when the link is present
    // but the node it is pointing to is not present
    if(linkedRecord===undefined){if(selection.required===false){return;}return this.markMissing();}ids[refId]=true;const obj=isArray(linkedRecord)?[]:{};if(selection.selections===undefined){this.selectAll(linkedRecord,obj);}else {this.traverseSelections(selection,linkedRecord,obj);}this.assignNonScalar(data,propertyName,obj);}readObject(key,selection,source,sink){const sourceValue=source[key];if(selection.nullable===true&&sourceValue===null){this.readScalar(key,source,sink);return;}if(selection.opaque===true){this.readOpaque(sink,key,sourceValue);return;}if(sourceValue===undefined){if(selection.required===false){return;}return this.markMissing();}const sinkValue=isArray(sourceValue)?[]:{};if(selection.selections===undefined){this.selectAll(sourceValue,sinkValue);}else {this.traverseSelections(selection,sourceValue,sinkValue);}this.assignNonScalar(sink,key,sinkValue);}checkIfChanged(value){// If we've already detected a change, just return
    if(this.snapshotChanged===true){return;}this.snapshotChanged=this.currentPath.baseSnapshotValue!==value;}computeCopyBounds(array,selection){// pageToken *can* be undefined
    if(selection.tokenDataKey!==undefined&&selection.pageSize!==undefined){const pagination=this.pagination(selection.tokenDataKey);const startingOffset=pagination.offsetFor(selection.pageToken);if(startingOffset===undefined){return;}const endingOffset=pagination.limitToEnd(startingOffset+selection.pageSize);this.seenIds[selection.tokenDataKey]=true;return [startingOffset,endingOffset];}else {return [0,array.length];}}/**
         * This method is public *only* so CustomReaders can call it.
         */readPluralLink(propertyName,selection,record,data){if(selection.selections===undefined){return;}const{storeLookup,seenIds:ids}=this;const array=record[propertyName];const[start,end]=this.computeCopyBounds(array,selection)||[-1,-1];if(start<0){return this.markMissing();}const sink=data[propertyName]=[];for(let i=start;i<end;i+=1){this.enterPath(i);const next=array[i];const nextId=next&&next.__ref;const nextRecord=nextId&&storeLookup.call(this,nextId);if(nextRecord===undefined){this.markMissing();this.exitPath();return;}ids[nextId]=true;const obj={};this.traverseSelections(selection,nextRecord,obj);this.assignNonScalar(sink,i-start,obj);freeze(obj);this.exitPath();}freeze(sink);}readObjectMap(propertyName,selection,record,data){const obj=record[propertyName];if(obj===undefined){if(selection.required===false){return;}return this.markMissing();}const sink=data[propertyName]={};const keys$1=keys(obj);for(let i=0,len=keys$1.length;i<len;i+=1){const key=keys$1[i];this.enterPath(key);this.readObject(key,selection,obj,sink);this.exitPath();}freeze(sink);}readLinkMap(propertyName,selection,record,data){const{seenIds:ids}=this;const map=record[propertyName];const keys$1=keys(map);const sink=data[propertyName]={};for(let i=0,len=keys$1.length;i<len;i+=1){const key=keys$1[i];this.enterPath(key);const next=map[key];const nextId=next.__ref;const nextRecord=this.storeLookup(nextId);if(nextRecord===undefined){this.markMissing();this.exitPath();return;}ids[nextId]=true;const obj={};this.traverseSelections(selection,nextRecord,obj);this.assignNonScalar(sink,key,obj);freeze(obj);this.exitPath();}freeze(sink);}/**
         * This method is public *only* so CustomReaders can call it.
         */readPluralObject(propertyName,selection,record,data){if(selection.selections===undefined){return;}const array=record[propertyName];const[start,end]=this.computeCopyBounds(array,selection)||[-1,-1];if(start<0){return this.markMissing();}const sink=data[propertyName]=[];for(let i=start;i<end;i+=1){this.enterPath(i);const nextRecord=array[i];if(nextRecord===undefined){this.markMissing();this.exitPath();return;}const obj={};this.traverseSelections(selection,nextRecord,obj);push.call(sink,obj);freeze(obj);this.exitPath();}freeze(sink);}readOpaque(sink,propertyName,value){sink[propertyName]=value;this.checkIfChanged(value);}readScalarMap(propertyName,record,data){const obj=record[propertyName];const sink=data[propertyName]={};const keys$1=keys(obj);for(let i=0,len=keys$1.length;i<len;i+=1){const key=keys$1[i];this.enterPath(key);this.readScalar(key,obj,sink);this.exitPath();}freeze(sink);}readScalarPlural(propertyName,record,data){const array=record[propertyName];const sink=data[propertyName]=[];for(let i=0,len=array.length;i<len;i+=1){this.enterPath(i);const value=array[i];push.call(sink,value);this.checkIfChanged(value);this.exitPath();}freeze(sink);}/**
         * This method is public *only* so CustomReaders can call it.
         */readScalar(propertyName,record,data){if(!hasOwnProperty.call(record,propertyName)){return this.markMissing();}data[propertyName]=record[propertyName];this.checkIfChanged(record[propertyName]);}/**
         * This method is public *only* so CustomReaders can call it.
         */storeLookup(recordId){const value=this.records[recordId];if(value===undefined){return undefined;}const expiration=this.expirationMap[recordId];if(expiration!==undefined&&this.timestamp>expiration){return undefined;}return value;}selectUnion(selection,storeEntry,discriminatedObject,sink){const{discriminator}=selection;const discriminatorValue=discriminatedObject[discriminator];{validateUnionSelection(discriminatedObject,selection,this.currentPath);}const unionSelection=selection.unionSelections[discriminatorValue];const childSelection={selections:unionSelection,name:selection.name,kind:selection.kind};this.traverseSelection(childSelection,storeEntry,sink);}selectObjectUnion(selection,source,sink){const{name:propertyName}=selection;const object=source[propertyName];if(object===undefined){this.markMissing();return;}if(selection.nullable===true&&object===null){this.readScalar(propertyName,source,sink);return;}this.selectUnion(selection,source,object,sink);}selectLinkUnion(selection,source,sink){const{name:propertyName}=selection;const sourceValue=source[propertyName];const link=source[propertyName];// This condition is hit when the link it self isn't present
    if(link===undefined){return this.markMissing();}if(selection.nullable===true&&sourceValue===null){this.readScalar(propertyName,sourceValue,sink);return;}const{__ref:refId}=link;if(refId===undefined){return this.markMissing();}const linkedRecord=this.records[refId];// If we can't find the link, mark it as missing
    if(linkedRecord===undefined){return this.markMissing();}this.selectUnion(selection,source,linkedRecord,sink);}traverseSelection(selection,record,data){const{variables}=this;const key=getStorageKey(selection,variables);if(isUnionLinkSelection(selection)){this.selectLinkUnion(selection,record,data);return;}else if(isUnionObjectSelection(selection)){this.selectObjectUnion(selection,record,data);return;}if(selection.kind==='Link'){if(selection.plural===true){this.readPluralLink(key,selection,record,data);}else if(selection.map===true){this.readLinkMap(key,selection,record,data);}else {this.readSingleLink(key,selection,record,data);}}else if(selection.kind==='Scalar'){if(selection.map===true){this.readScalarMap(key,record,data);}else if(selection.plural===true){this.readScalarPlural(key,record,data);}else {this.readScalar(key,record,data);}}else if(selection.kind==='Object'){if(selection.map===true){this.readObjectMap(key,selection,record,data);}else if(selection.plural===true){this.readPluralObject(key,selection,record,data);}else {this.readObject(key,selection,record,data);}}else if(selection.kind==='Custom'){selection.reader(key,selection,record,data,variables,this);}}traverseSelections(node,record,data){const{selections}=node;if(selections===undefined){this.selectAll(record,data);return;}const{length:len}=selections;for(let i=0;i<len;i+=1){const selection=selections[i];this.enterPath(selection.name);this.traverseSelection(selection,record,data);this.exitPath();}}}function deepFreeze(value){// No need to freeze primitives
    if(typeof value!=='object'||value===null){return;}if(isArray(value)){for(let i=0,len=value.length;i<len;i+=1){deepFreeze(value[i]);}}else {const keys$1=keys(value);for(let i=0,len=keys$1.length;i<len;i+=1){deepFreeze(value[keys$1[i]]);}}freeze(value);}var SnapshotState;(function(SnapshotState){SnapshotState["Fulfilled"]="Fulfilled";SnapshotState["Unfulfilled"]="Unfulfilled";SnapshotState["Error"]="Error";SnapshotState["Pending"]="Pending";})(SnapshotState||(SnapshotState={}));function isErrorSnapshot(snapshot){return snapshot.state===SnapshotState.Error;}function isFulfilledSnapshot(snapshot){return snapshot.state===SnapshotState.Fulfilled;}function isUnfulfilledSnapshot(snapshot){return snapshot.state===SnapshotState.Unfulfilled;}function createErrorSnapshot(error){deepFreeze(error);const snap={error,state:SnapshotState.Error,data:undefined};return snap;}function createSnapshot(records,recordExpirations,selector,refresh){return new Reader(records,recordExpirations,selector.variables,refresh).read(selector);}function rebuildSnapshot(snapshot,records,recordExpirations){return new Reader(records,recordExpirations,snapshot.variables,snapshot.refresh,snapshot).read(snapshot.select);}// Cannot use a symbol because we cannot serialize a symbol
    // Also, IE11 polyfill have problems when a lot of symbols
    // are created
    var StoreErrorStatus;(function(StoreErrorStatus){StoreErrorStatus[StoreErrorStatus["RESOURCE_NOT_FOUND"]=404]="RESOURCE_NOT_FOUND";})(StoreErrorStatus||(StoreErrorStatus={}));var StoreRecordType;(function(StoreRecordType){StoreRecordType["Error"]="error";})(StoreRecordType||(StoreRecordType={}));function isStoreRecordError(storeRecord){return storeRecord.__type===StoreRecordType.Error;}function hasOverlappingIds(snapshot,visitedIds){const{length:len}=visitedIds;const{seenRecords}=snapshot;for(let i=0;i<len;i+=1){const id=visitedIds[i];if(seenRecords[id]||id===snapshot.recordId){return true;}}return false;}function getMatchingIds(prefix,visitedIds){const matchingIds=[];for(let i=0,len=visitedIds.length;i<len;i++){const visitedId=visitedIds[i];if(visitedId.indexOf(prefix)===0){push.call(matchingIds,visitedId);}}return matchingIds;}class Store{constructor(){this.recordExpirations=create(null);this.records=create(null);this.snapshotSubscriptions=[];this.watchSubscriptions=[];this.visitedIds=create(null);this.insertedIds=create(null);this.selectorToDataSnapshotMap=new WeakMap();}reset(){this.recordExpirations=create(null);this.records=create(null);this.snapshotSubscriptions=[];this.watchSubscriptions=[];this.visitedIds=create(null);this.insertedIds=create(null);}publish(recordId,record){const{records,visitedIds,insertedIds}=this;if(hasOwnProperty.call(records,recordId)===false){insertedIds[recordId]=true;}records[recordId]=record;{freeze(record);}visitedIds[recordId]=true;}setExpiration(recordId,time){this.recordExpirations[recordId]=time;}broadcast(){// Note: we should always get the subscription references from this at the beginning
    // of the function, in case the reference changes (because of an unsubscribe)
    const{snapshotSubscriptions,watchSubscriptions,visitedIds,insertedIds,records}=this;const allVisitedIds=keys(visitedIds);// Early exit if nothing has changed
    if(allVisitedIds.length===0){return;}// Process snapshot subscriptions
    for(let i=0,len=snapshotSubscriptions.length;i<len;i++){const subscription=snapshotSubscriptions[i];const{snapshot,callback}=subscription;// Don't re-emit the snapshot if there is no overlap between the visited keys and the
    // snapshot seen keys.
    if(isErrorSnapshot(snapshot)||hasOverlappingIds(snapshot,allVisitedIds)===false){continue;}const updatedSnapshot=subscription.snapshot=rebuildSnapshot(snapshot,records,{});if((isFulfilledSnapshot(updatedSnapshot)||isErrorSnapshot(updatedSnapshot))&&updatedSnapshot!==snapshot){callback(updatedSnapshot);}else if(isUnfulfilledSnapshot(updatedSnapshot)){const{refresh}=updatedSnapshot;if(refresh!==undefined){refresh.resolve(refresh.config);}}}// Process watch subscriptions
    for(let i=0,len=watchSubscriptions.length;i<len;i++){const{prefix,callback}=watchSubscriptions[i];const matchingIds=getMatchingIds(prefix,allVisitedIds);if(matchingIds.length>0){const watchCallbackEntries=[];for(let i=0,len=matchingIds.length;i<len;i++){const id=matchingIds[i];const inserted=insertedIds[id]||false;push.call(watchCallbackEntries,{id,inserted});}callback(watchCallbackEntries);}}this.visitedIds=create(null);this.insertedIds=create(null);}lookup(selector,refresh){const{records,recordExpirations}=this;return createSnapshot(records,recordExpirations,selector,refresh);}lookupMemoize(selector,refresh){const{records,recordExpirations}=this;const snapshot=this.selectorToDataSnapshotMap.get(selector);let returnSnapshot;if(snapshot===undefined||isErrorSnapshot(snapshot)){returnSnapshot=createSnapshot(records,recordExpirations,selector,refresh);}else {returnSnapshot=rebuildSnapshot(snapshot,records,recordExpirations);}this.selectorToDataSnapshotMap.set(selector,returnSnapshot);return returnSnapshot;}subscribe(snapshot,callback){const subscription={snapshot,callback};this.snapshotSubscriptions=[...this.snapshotSubscriptions,subscription];return ()=>{const{snapshotSubscriptions}=this;const index=indexOf.call(snapshotSubscriptions,subscription);this.snapshotSubscriptions=[...slice.call(snapshotSubscriptions,0,index),...slice.call(snapshotSubscriptions,index+1)];{this.snapshotSubscriptions=freeze(this.snapshotSubscriptions);}};}watch(prefix,callback){const subscription={prefix,callback};this.watchSubscriptions=[...this.watchSubscriptions,subscription];return ()=>{const{watchSubscriptions}=this;const index=indexOf.call(watchSubscriptions,subscription);this.watchSubscriptions=[...slice.call(watchSubscriptions,0,index),...slice.call(watchSubscriptions,index+1)];{this.watchSubscriptions=freeze(this.watchSubscriptions);}};}evict(key){delete this.records[key];this.visitedIds[key]=true;}}function isNodeLink(node){return typeof node==='object'&&node!==null&&hasOwnProperty.call(node,'__ref');}var GraphNodeType;(function(GraphNodeType){GraphNodeType["Link"]="Link";GraphNodeType["Node"]="Node";GraphNodeType["Error"]="Error";})(GraphNodeType||(GraphNodeType={}));class GraphNodeError{constructor(store,data){this.type=GraphNodeType.Error;this.store=store;this.data=data;}retrieve(){return this.data;}}function followLink(store,key){return store.records[key];}class GraphLink{constructor(store,data){this.type=GraphNodeType.Link;this.store=store;this.data=data;}isPending(){return this.data.pending===true;}isMissing(){return this.data.isMissing===true;}follow(){const{__ref}=this.data;if(__ref===undefined){return null;}const linked=followLink(this.store,__ref);if(linked===null||linked===undefined){return null;}if(isStoreRecordError(linked)){return new GraphNodeError(this.store,linked);}return new GraphNode(this.store,linked);}linkData(){return this.data.data;}writeLinkData(data){this.data.data=data;}}class GraphNode{constructor(store,data){this.type=GraphNodeType.Node;this.store=store;this.data=data;}object(propertyName){const value=this.data[propertyName];if(isNodeLink(value)){throw new Error(`Cannot walk to path ${propertyName}. "${propertyName}" is a link: "${value}"`);}if(typeof value!=='object'||value===null){throw new Error(`Cannot walk to path ${propertyName}. "${propertyName}" is a scalar: "${value}"`);}return new GraphNode(this.store,value);}link(propertyName){const value=this.data[propertyName];if(!isNodeLink(value)){throw new Error(`Cannot walk to link ${propertyName}. "${propertyName}" is not a link: "${value}"`);}return new GraphLink(this.store,value);}scalar(propertyName){const value=this.data[propertyName];if(typeof value==='object'&&value!==null){throw new Error(`Cannot return value at path ${propertyName}. ${propertyName} is not a scalar.`);}return value;}keys(){return keys(this.data);}isScalar(propertyName){// TODO W-6900046 - merge.ts casts these to any and manually sets `data`
    // so this guard is required
    if(this.data===undefined){return true;}const value=this.data[propertyName];return typeof value!=='object'||value===null;}write(propertyName,value){this.data[propertyName]=value;}isUndefined(propertyName){return this.data[propertyName]===undefined;}retrieve(){return this.data;}}class LDS{constructor(store,networkAdapter,options={}){this.store=store;this.networkAdapter=networkAdapter;this.options=options;}pagination(key){let data=this.store.records[key];data=data&&_objectSpread$2({},data);return pagination(data,pd=>{this.storePublish(key,pd);});}storePublish(key,data){this.store.publish(key,data);}storeBroadcast(){this.store.broadcast();}storeIngest(key,request,response){if(request.ingest!==null){request.ingest(response,{fullPath:key,parent:null},this,this.store,Date.now());}}storeIngestFetchResponse(key,response,ttl){const{status}=response;deepFreeze(response);if(status===404){const{store}=this;const entry={__type:StoreRecordType.Error,status:StoreErrorStatus.RESOURCE_NOT_FOUND,error:response};freeze(entry);store.publish(key,entry);if(ttl!==undefined){store.setExpiration(key,Date.now()+ttl);}}}storeSubscribe(snapshot,callback){return this.store.subscribe(snapshot,callback);}storeWatch(prefix,callback){return this.store.watch(prefix,callback);}storeLookup(sel){return this.store.lookup(sel);}storeLookupMemoize(sel){return this.store.lookupMemoize(sel);}storeEvict(key){this.store.evict(key);}errorSnapshot(error){return createErrorSnapshot(error);}dispatchResourceRequest(resourceRequest,overrides){let mergedResourceRequest=resourceRequest;// Apply resource request override if passed as argument.
    if(overrides!==undefined){mergedResourceRequest=_objectSpread$2({},resourceRequest,{headers:_objectSpread$2({},resourceRequest.headers,overrides.headers)});}return this.networkAdapter(mergedResourceRequest);}refreshSnapshot(snapshot){const{refresh}=snapshot;if(refresh!==undefined){return refresh.resolve(refresh.config);}throw new Error('Snapshot is not refreshable');}getNode(key){const{store}=this;const value=store.records[key];// doesn't exist
    if(value===undefined){return null;}return this.wrapNormalizedGraphNode(value);}wrapNormalizedGraphNode(normalized){if(normalized===null){return null;}if(isStoreRecordError(normalized)){return new GraphNodeError(this.store,normalized);}return new GraphNode(this.store,normalized);}instrument(paramsBuilder){const{instrument}=this.options;if(instrument){instrument(paramsBuilder());}}}var HttpStatusCode;(function(HttpStatusCode){HttpStatusCode[HttpStatusCode["Ok"]=200]="Ok";HttpStatusCode[HttpStatusCode["NotModified"]=304]="NotModified";HttpStatusCode[HttpStatusCode["NotFound"]=404]="NotFound";HttpStatusCode[HttpStatusCode["BadRequest"]=400]="BadRequest";HttpStatusCode[HttpStatusCode["ServerError"]=500]="ServerError";})(HttpStatusCode||(HttpStatusCode={}));const{freeze:freeze$1,keys:keys$1}=Object;const{isArray:isArray$1}=Array;const{stringify:stringify$1}=JSON;class Sanitizer{constructor(obj){this.obj=obj;this.copy={};this.currentPath={key:'',value:obj,parent:null,data:this.copy};}sanitize(){const sanitizer=this;stringify$1(this.obj,function(key,value){if(key===''){return value;}const parent=this;if(parent!==sanitizer.currentPath.value){sanitizer.exit(parent);}if(typeof value==='object'&&value!==null){sanitizer.enter(key,value);return value;}sanitizer.currentPath.data[key]=value;return value;});return this.copy;}enter(key,value){const{currentPath:parentPath}=this;const data=parentPath.data[key]=isArray$1(value)?[]:{};this.currentPath={key,value,parent:parentPath,data};}exit(parent){while(this.currentPath.value!==parent){this.currentPath=this.currentPath.parent||this.currentPath;}}}/**
     * Returns a sanitized version of an object by recursively unwrapping the Proxies.
     *
     * In order to keep the LDS performance optimal on IE11, we need to make sure that LDS code get
     * transform by the es5-proxy-compat. At the same, time we need to ensure that no ProxyCompat leaks
     * into the LDS engine code nor into the adapters. All the data coming from LWC-land need to be
     * sanitized first.
     */function sanitize(obj){return new Sanitizer(obj).sanitize();}const USERLAND_PROVISION_ERROR_MESSAGE="LWC component's @wire target property or method threw an error during value provisioning. Original error:";const ADAPTER_SNAPSHOT_REJECTED_MESSAGE='Lightning Data Service wire adapter Promise<Snapshot> rejected. Original error:';const dataToSnapshotWeakMap=new WeakMap();function buildAdapterEventPayload(snapshot){// We should never broadcast an unfulfilled snapshot to a component
    {if(isUnfulfilledSnapshot(snapshot)){throw new Error(`Unfulfilled snapshot emitted to component from subscription, missingPaths: ${keys$1(snapshot.missingPaths)}`);}}if(isErrorSnapshot(snapshot)){return {data:undefined,error:snapshot.error};}else {// fulfilled
    return {data:snapshot.data,error:undefined};}}function dispatchValue(eventTarget,ValueChangedEvent,snapshot,_lds){const payload=buildAdapterEventPayload(snapshot);dataToSnapshotWeakMap.set(payload,snapshot);// ideally this should be handled by LWC event handler error handling
    try{eventTarget.dispatchEvent(new ValueChangedEvent(payload));}catch(error){if(error instanceof Error){error.message=`${USERLAND_PROVISION_ERROR_MESSAGE}\n[${error.message}]`;throw error;}}}function isPromise(value){// check for Thenable due to test frameworks using custom Promise impls
    return value.then!==undefined;}function dispatchAndSubscribe(wireService,eventTarget,lds){const{ValueChangedEvent}=wireService;return snapshot=>{if(isFulfilledSnapshot(snapshot)||isErrorSnapshot(snapshot)){dispatchValue(eventTarget,ValueChangedEvent,snapshot);}if(isErrorSnapshot(snapshot)){return;}if(isUnfulfilledSnapshot(snapshot)){{throw new Error(`Unfulfilled snapshot from adapterDispatchAndSubscribe, missingPaths: ${keys$1(snapshot.missingPaths)}`);}}return lds.storeSubscribe(snapshot,updated=>{dispatchValue(eventTarget,ValueChangedEvent,updated);});};}function register(lds,wireService,adapter,identifier){const wireIdentifier=typeof identifier==='function'?identifier:()=>{if(identifier!==undefined){throw new Error(`Wire identifier ${stringify$1(identifier)} is not directly invocable.`);}throw new Error(`Wire identifier ${adapter.name!==undefined?adapter.name:''} is not directly invocable.`);};const{register:wireServiceRegister,ValueChangedEvent}=wireService;wireServiceRegister(wireIdentifier,eventTarget=>{const adapterDispatchAndSubscribe=dispatchAndSubscribe(wireService,eventTarget,lds);let unsubscribe;let isConnected=false;let config;// initialize the wired property with a properly shaped object so cmps can use <template if:true={wiredProperty.data}>
    try{eventTarget.dispatchEvent(new ValueChangedEvent({data:undefined,error:undefined}));}catch(error){if(error instanceof Error){error.message=`${USERLAND_PROVISION_ERROR_MESSAGE}\n[${error.message}]`;throw error;}}function unsub(){if(unsubscribe){unsubscribe();unsubscribe=undefined;}}eventTarget.addEventListener('config',newConfig=>{unsub();config=newConfig;const snapshotOrPromise=adapter(sanitize(config));// insufficient config
    if(snapshotOrPromise===null){return;}// Data resolved sync
    if(!isPromise(snapshotOrPromise)){unsubscribe=adapterDispatchAndSubscribe(snapshotOrPromise);return;}// We want to let errors from this promise propagate to the app container,
    // which is why we do not have a reject handler here.
    // If an error is thrown here, it means that there was an error somewhere
    // inside an adapter which means that there was a mistake by the implementor.
    // Errors that come from the network should never hit this block because
    // they are treated like regular snapshots, not true error paths.
    function asyncHandler(oldConfig,snapshot){// if config has changed before promise resolves then ignore resolved value
    if(oldConfig!==config){return;}unsub();if(isConnected){unsubscribe=adapterDispatchAndSubscribe(snapshot);}}snapshotOrPromise.then(asyncHandler.bind(undefined,config),reason=>{if(reason instanceof Error){reason.message=`${ADAPTER_SNAPSHOT_REJECTED_MESSAGE}\n[${reason.message}]`;throw reason;}else {throw new Error(`${ADAPTER_SNAPSHOT_REJECTED_MESSAGE}\n[${stringify$1(reason)}]`);}});});eventTarget.addEventListener('connect',()=>{// TODO W-6568533 - wire reform changes this behavior
    isConnected=true;});eventTarget.addEventListener('disconnect',()=>{isConnected=false;unsub();});});return wireIdentifier;}const{keys:keys$2,values}=Object;const{isArray:isArray$2}=Array;const{stringify:stringify$2}=JSON;/**
     * A deterministic JSON stringify implementation. Heavily adapted from https://github.com/epoberezkin/fast-json-stable-stringify.
     * This is needed because insertion order for JSON.stringify(object) affects output:
     * JSON.stringify({a: 1, b: 2})
     *      "{"a":1,"b":2}"
     * JSON.stringify({b: 2, a: 1})
     *      "{"b":2,"a":1}"
     * @param data Data to be JSON-stringified.
     * @returns JSON.stringified value with consistent ordering of keys.
     */function stableJSONStringify(node){// This is for Date values.
    if(node&&node.toJSON&&typeof node.toJSON==='function'){// eslint-disable-next-line no-param-reassign
    node=node.toJSON();}if(node===undefined){return;}if(typeof node==='number'){return isFinite(node)?''+node:'null';}if(typeof node!=='object'){return stringify$2(node);}let i;let out;if(isArray$2(node)){out='[';for(i=0;i<node.length;i++){if(i){out+=',';}out+=stableJSONStringify(node[i])||'null';}return out+']';}if(node===null){return 'null';}const keys$1=keys$2(node).sort();out='';for(i=0;i<keys$1.length;i++){const key=keys$1[i];const value=stableJSONStringify(node[key]);if(!value){continue;}if(out){out+=',';}out+=stringify$2(key)+':'+value;}return '{'+out+'}';}const{isArray:ArrayIsArray}=Array;function isPromise$1(value){return value.then!==undefined;}function untrustedIsObject(untrusted){return typeof untrusted==='object'&&untrusted!==null&&ArrayIsArray(untrusted)===false;}function refreshable(adapter,resolve){return config=>{const result=adapter(config);if(result===null){return result;}if(isPromise$1(result)){return result.then(snapshot=>{snapshot.refresh={config,resolve};return snapshot;});}result.refresh={config,resolve};return result;};}function postApex(config){const key=null;const headers={};return {path:'/apex',method:'post',body:config.body,urlParams:{},queryParams:{},key:key,ingest:null,headers};}const{freeze:ObjectFreeze,keys:ObjectKeys}=Object;const{isArray:ArrayIsArray$1}=Array;function deepFreeze$1(value){// No need to freeze primitives
    if(typeof value!=='object'||value===null){return;}if(ArrayIsArray$1(value)){for(let i=0,len=value.length;i<len;i+=1){deepFreeze$1(value[i]);}}else {const keys=ObjectKeys(value);for(let i=0,len=keys.length;i<len;i+=1){deepFreeze$1(value[keys[i]]);}}ObjectFreeze(value);}function createLink(ref){return {__ref:ref};}function cache(lds,config,namespace,classname,method,isContinuation){const recordId=getApexId(namespace,classname,method,isContinuation,config);const cacheableSnap=lds.storeLookup({recordId:recordId+'_cacheable',node:{kind:'Fragment',selections:[{kind:'Scalar',name:'cacheable'}]},variables:{}});// adapter always storeIngest the response, but only cacheable response should be used
    if(cacheableSnap.state!=='Fulfilled'||cacheableSnap.data.cacheable===false){return null;}const snap=lds.storeLookup({recordId,node:{kind:'Fragment',opaque:true},variables:{}});if(snap.state!=='Fulfilled'){return null;}return snap;}// TODO: APEX_TTL, apexResponseEquals, apexResponseIngest, and validateAdapterConfig should have been code generated
    // however compiler does not support response body type any so hand roll for now
    /**
     * Time to live for the Apex cache value. 5 minutes.
     */const APEX_TTL=5*60*1000;function apexResponseEquals(existing,incoming){return stringify$2(incoming)===stringify$2(existing);}const apexResponseIngest=(input,path,_lds,store,timestamp)=>{// skip validation since input type is any
    const key=path.fullPath;const existingRecord=store.records[key];// no normalization
    let incomingRecord=input;deepFreeze$1(input);if(existingRecord===undefined||apexResponseEquals(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}store.setExpiration(key,timestamp+APEX_TTL);return createLink(key);};/**
     *  Validates the apex request configuration passed in from @wire.
     *  @param config The configuration object passed from @wire.
     *  @returns True if config is null/undefined or false if it does not contain undefined values.
     */function validateAdapterConfig(untrustedConfig){if(untrustedIsObject(untrustedConfig)){const values$1=values(untrustedConfig);return values$1.indexOf(undefined)===-1;}return true;}function network(lds,config,namespace,classname,method,isContinuation,cacheable){const recordId=getApexId(namespace,classname,method,isContinuation,config);const select={recordId,node:{kind:'Fragment',opaque:true},variables:{}};const body={namespace,classname,method,isContinuation,params:config,cacheable};const requestConfig={body};const request=_objectSpread$2({},postApex(requestConfig),{ingest:apexResponseIngest});return lds.dispatchResourceRequest(request).then(resp=>{const{cacheable}=resp.headers;if(cacheable===true){lds.storePublish(recordId+'_cacheable',resp.headers);lds.storeIngest(recordId,request,resp.body);lds.storeBroadcast();return lds.storeLookup(select);}// if cacheable is not set or set to false, return a synthetic snapshot
    return {recordId,variables:{},seenRecords:{},select,state:'Fulfilled',data:resp.body};},err=>{return lds.errorSnapshot(err);});}const factory=(lds,invokerParams)=>{const{namespace,classname,method,isContinuation}=invokerParams;const adapter=getLdsAdapterFactory(lds,namespace,classname,method,isContinuation,true);return refreshable(function apexWireAdapter(untrustedConfig){// Invalid or incomplete config
    if(!validateAdapterConfig(untrustedConfig)){return null;}return adapter(untrustedConfig);},untrustedConfig=>{// This should never happen
    if(!validateAdapterConfig(untrustedConfig)){throw new Error('Invalid config passed to "apexWireAdapter" refresh function');}return network(lds,untrustedConfig,namespace,classname,method,isContinuation,true);});};const invoker=(lds,invokerParams)=>{const{namespace,classname,method,isContinuation}=invokerParams;const ldsAdapter=getLdsAdapterFactory(lds,namespace,classname,method,isContinuation,false);return getInvoker(ldsAdapter);};function getInvoker(ldsAdapter){return config=>{const snapshotOrPromise=ldsAdapter(config);return Promise.resolve(snapshotOrPromise).then(snapshot=>{if(snapshot.state==='Error'){throw snapshot.error;}return snapshot.data;});};}/**
     * A standard delimiter when producing cache keys.
     */const KEY_DELIM=':';function isEmptyParam(param){return param===undefined||param===null||typeof param==='object'&&keys$2(param).length===0;}/**
     * Constructs a cache key for the Apex value type.
     * @param namespace The name space.
     * @param classname The class name.
     * @param functionName The function name.
     * @param isContinuation Indicates whether the Apex method returns a continuation.
     * @param params The params.
     * @returns A new cache key representing the Apex value type.
     */function getApexId(namespace,classname,functionName,isContinuation,params){return [namespace,classname,functionName,isContinuation,isEmptyParam(params)?'':stableJSONStringify(params)].join(`${KEY_DELIM}`);}function getLdsAdapterFactory(lds,namespace,classname,method,isContinuation,cacheable){return config=>{const snap=cache(lds,config,namespace,classname,method,isContinuation);if(snap!==null){return snap;}return network(lds,config,namespace,classname,method,isContinuation,cacheable);};}const{hasOwnProperty:ObjectPrototypeHasOwnProperty}=Object.prototype;const{keys:ObjectKeys$1}=Object;const{isArray:ArrayIsArray$2}=Array;function isPromise$2(value){return value.then!==undefined;}/**
     * Validates an adapter config is well-formed.
     * @param config The config to validate.
     * @param adapter The adapter validation configuration.
     * @param oneOf The keys the config must contain at least one of.
     * @throws A TypeError if config doesn't satisfy the adapter's config validation.
     */function validateConfig$1(config,adapter,oneOf){const{displayName}=adapter;const{required,optional,unsupported}=adapter.parameters;if(config===undefined||required.every(req=>ObjectPrototypeHasOwnProperty.call(config,req))===false){throw new TypeError(`adapter ${displayName} configuration must specify ${required.sort().join(', ')}`);}if(oneOf&&oneOf.some(req=>ObjectPrototypeHasOwnProperty.call(config,req))===false){throw new TypeError(`adapter ${displayName} configuration must specify one of ${oneOf.sort().join(', ')}`);}if(unsupported!==undefined&&unsupported.some(req=>ObjectPrototypeHasOwnProperty.call(config,req))){throw new TypeError(`adapter ${displayName} does not yet support ${unsupported.sort().join(', ')}`);}const supported=required.concat(optional);if(ObjectKeys$1(config).some(key=>!supported.includes(key))){throw new TypeError(`adapter ${displayName} configuration supports only ${supported.sort().join(', ')}`);}}function untrustedIsObject$1(untrusted){return typeof untrusted==='object'&&untrusted!==null&&ArrayIsArray$2(untrusted)===false;}function areRequiredParametersPresent(config,configPropertyNames){return configPropertyNames.parameters.required.every(req=>req in config);}function refreshable$1(adapter,resolve){return config=>{const result=adapter(config);if(result===null){return result;}if(isPromise$2(result)){return result.then(snapshot=>{snapshot.refresh={config,resolve};return snapshot;});}result.refresh={config,resolve};return result;};}const SNAPSHOT_STATE_FULFILLED='Fulfilled';const keyPrefix='Commerce::';const{freeze:ObjectFreeze$1,keys:ObjectKeys$1$1}=Object;const{isArray:ArrayIsArray$1$1}=Array;const{stringify:JSONStrinify}=JSON;function createLink$1(ref){return {__ref:ref};}function validate(obj,path='ProductMediaRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$1$1(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_alternateText=obj.alternateText;const path_alternateText=path+'.alternateText';let obj_alternateText_union0=null;const obj_alternateText_union0_error=(()=>{if(typeof obj_alternateText!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_alternateText+'" (at "'+path_alternateText+'")');}})();if(obj_alternateText_union0_error!=null){obj_alternateText_union0=obj_alternateText_union0_error.message;}let obj_alternateText_union1=null;const obj_alternateText_union1_error=(()=>{if(obj_alternateText!==null){return new TypeError('Expected "null" but received "'+typeof obj_alternateText+'" (at "'+path_alternateText+'")');}})();if(obj_alternateText_union1_error!=null){obj_alternateText_union1=obj_alternateText_union1_error.message;}if(obj_alternateText_union0&&obj_alternateText_union1){let message='Object doesn\'t match union (at "'+path_alternateText+'")';message+='\n'+obj_alternateText_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_alternateText_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_contentVersionId=obj.contentVersionId;const path_contentVersionId=path+'.contentVersionId';let obj_contentVersionId_union0=null;const obj_contentVersionId_union0_error=(()=>{if(typeof obj_contentVersionId!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_contentVersionId+'" (at "'+path_contentVersionId+'")');}})();if(obj_contentVersionId_union0_error!=null){obj_contentVersionId_union0=obj_contentVersionId_union0_error.message;}let obj_contentVersionId_union1=null;const obj_contentVersionId_union1_error=(()=>{if(obj_contentVersionId!==null){return new TypeError('Expected "null" but received "'+typeof obj_contentVersionId+'" (at "'+path_contentVersionId+'")');}})();if(obj_contentVersionId_union1_error!=null){obj_contentVersionId_union1=obj_contentVersionId_union1_error.message;}if(obj_contentVersionId_union0&&obj_contentVersionId_union1){let message='Object doesn\'t match union (at "'+path_contentVersionId+'")';message+='\n'+obj_contentVersionId_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_contentVersionId_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_id=obj.id;const path_id=path+'.id';let obj_id_union0=null;const obj_id_union0_error=(()=>{if(typeof obj_id!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_id+'" (at "'+path_id+'")');}})();if(obj_id_union0_error!=null){obj_id_union0=obj_id_union0_error.message;}let obj_id_union1=null;const obj_id_union1_error=(()=>{if(obj_id!==null){return new TypeError('Expected "null" but received "'+typeof obj_id+'" (at "'+path_id+'")');}})();if(obj_id_union1_error!=null){obj_id_union1=obj_id_union1_error.message;}if(obj_id_union0&&obj_id_union1){let message='Object doesn\'t match union (at "'+path_id+'")';message+='\n'+obj_id_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_id_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_mediaType=obj.mediaType;const path_mediaType=path+'.mediaType';if(typeof obj_mediaType!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_mediaType+'" (at "'+path_mediaType+'")');}const obj_sortOrder=obj.sortOrder;const path_sortOrder=path+'.sortOrder';if(typeof obj_sortOrder!=='number'||typeof obj_sortOrder==='number'&&Math.floor(obj_sortOrder)!==obj_sortOrder){return new TypeError('Expected "integer" but received "'+typeof obj_sortOrder+'" (at "'+path_sortOrder+'")');}const obj_title=obj.title;const path_title=path+'.title';if(typeof obj_title!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_title+'" (at "'+path_title+'")');}const obj_url=obj.url;const path_url=path+'.url';if(typeof obj_url!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_url+'" (at "'+path_url+'")');}})();return v_error===undefined?null:v_error;}function deepFreeze$2(input){ObjectFreeze$1(input);}function validate$1(obj,path='ProductEntitlementRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$1$1(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_canViewPrice=obj.canViewPrice;const path_canViewPrice=path+'.canViewPrice';let obj_canViewPrice_union0=null;const obj_canViewPrice_union0_error=(()=>{if(typeof obj_canViewPrice!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_canViewPrice+'" (at "'+path_canViewPrice+'")');}})();if(obj_canViewPrice_union0_error!=null){obj_canViewPrice_union0=obj_canViewPrice_union0_error.message;}let obj_canViewPrice_union1=null;const obj_canViewPrice_union1_error=(()=>{if(obj_canViewPrice!==null){return new TypeError('Expected "null" but received "'+typeof obj_canViewPrice+'" (at "'+path_canViewPrice+'")');}})();if(obj_canViewPrice_union1_error!=null){obj_canViewPrice_union1=obj_canViewPrice_union1_error.message;}if(obj_canViewPrice_union0&&obj_canViewPrice_union1){let message='Object doesn\'t match union (at "'+path_canViewPrice+'")';message+='\n'+obj_canViewPrice_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_canViewPrice_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}})();return v_error===undefined?null:v_error;}function deepFreeze$1$1(input){ObjectFreeze$1(input);}function validate$2(obj,path='ProductMediaGroupRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$1$1(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_developerName=obj.developerName;const path_developerName=path+'.developerName';if(typeof obj_developerName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_developerName+'" (at "'+path_developerName+'")');}const obj_id=obj.id;const path_id=path+'.id';if(typeof obj_id!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_id+'" (at "'+path_id+'")');}const obj_mediaItems=obj.mediaItems;const path_mediaItems=path+'.mediaItems';if(!ArrayIsArray$1$1(obj_mediaItems)){return new TypeError('Expected "array" but received "'+typeof obj_mediaItems+'" (at "'+path_mediaItems+'")');}for(let i=0;i<obj_mediaItems.length;i++){const obj_mediaItems_item=obj_mediaItems[i];const path_mediaItems_item=path_mediaItems+'['+i+']';const referenceProductMediaRepresentationValidationError=validate(obj_mediaItems_item,path_mediaItems_item);if(referenceProductMediaRepresentationValidationError!==null){let message='Object doesn\'t match ProductMediaRepresentation (at "'+path_mediaItems_item+'")\n';message+=referenceProductMediaRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}const obj_name=obj.name;const path_name=path+'.name';if(typeof obj_name!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_name+'" (at "'+path_name+'")');}const obj_usageType=obj.usageType;const path_usageType=path+'.usageType';if(typeof obj_usageType!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_usageType+'" (at "'+path_usageType+'")');}})();return v_error===undefined?null:v_error;}function deepFreeze$2$1(input){const input_mediaItems=input.mediaItems;for(let i=0;i<input_mediaItems.length;i++){const input_mediaItems_item=input_mediaItems[i];deepFreeze$2(input_mediaItems_item);}ObjectFreeze$1(input_mediaItems);ObjectFreeze$1(input);}function validate$3(obj,path='ProductCategoryRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$1$1(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_description=obj.description;const path_description=path+'.description';let obj_description_union0=null;const obj_description_union0_error=(()=>{if(typeof obj_description!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_description+'" (at "'+path_description+'")');}})();if(obj_description_union0_error!=null){obj_description_union0=obj_description_union0_error.message;}let obj_description_union1=null;const obj_description_union1_error=(()=>{if(obj_description!==null){return new TypeError('Expected "null" but received "'+typeof obj_description+'" (at "'+path_description+'")');}})();if(obj_description_union1_error!=null){obj_description_union1=obj_description_union1_error.message;}if(obj_description_union0&&obj_description_union1){let message='Object doesn\'t match union (at "'+path_description+'")';message+='\n'+obj_description_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_description_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_id=obj.id;const path_id=path+'.id';let obj_id_union0=null;const obj_id_union0_error=(()=>{if(typeof obj_id!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_id+'" (at "'+path_id+'")');}})();if(obj_id_union0_error!=null){obj_id_union0=obj_id_union0_error.message;}let obj_id_union1=null;const obj_id_union1_error=(()=>{if(obj_id!==null){return new TypeError('Expected "null" but received "'+typeof obj_id+'" (at "'+path_id+'")');}})();if(obj_id_union1_error!=null){obj_id_union1=obj_id_union1_error.message;}if(obj_id_union0&&obj_id_union1){let message='Object doesn\'t match union (at "'+path_id+'")';message+='\n'+obj_id_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_id_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_name=obj.name;const path_name=path+'.name';if(typeof obj_name!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_name+'" (at "'+path_name+'")');}})();return v_error===undefined?null:v_error;}function deepFreeze$3(input){ObjectFreeze$1(input);}function validate$4(obj,path='ProductCategoryPathRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$1$1(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_path=obj.path;const path_path=path+'.path';if(!ArrayIsArray$1$1(obj_path)){return new TypeError('Expected "array" but received "'+typeof obj_path+'" (at "'+path_path+'")');}for(let i=0;i<obj_path.length;i++){const obj_path_item=obj_path[i];const path_path_item=path_path+'['+i+']';const referenceProductCategoryRepresentationValidationError=validate$3(obj_path_item,path_path_item);if(referenceProductCategoryRepresentationValidationError!==null){let message='Object doesn\'t match ProductCategoryRepresentation (at "'+path_path_item+'")\n';message+=referenceProductCategoryRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}})();return v_error===undefined?null:v_error;}function normalize(input,existing,path,lds,store,timestamp){return input;}const select=function ProductCategoryPathRepresentationSelect(){return {kind:'Fragment',opaque:true};};function equals(existing,incoming){if(JSONStrinify(incoming)!==JSONStrinify(existing)){return false;}return true;}function deepFreeze$4(input){const input_path=input.path;for(let i=0;i<input_path.length;i++){const input_path_item=input_path[i];deepFreeze$3(input_path_item);}ObjectFreeze$1(input_path);ObjectFreeze$1(input);}const ingest=function ProductCategoryPathRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$4(input);if(validateError!==null){throw validateError;}}const key=path.fullPath;let incomingRecord=normalize(input,store.records[key],{fullPath:key,parent:path.parent});const existingRecord=store.records[key];deepFreeze$4(input);if(existingRecord===undefined||equals(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}return createLink$1(key);};function validate$5(obj,path='ProductDetailRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$1$1(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_defaultImage=obj.defaultImage;const path_defaultImage=path+'.defaultImage';const referenceProductMediaRepresentationValidationError=validate(obj_defaultImage,path_defaultImage);if(referenceProductMediaRepresentationValidationError!==null){let message='Object doesn\'t match ProductMediaRepresentation (at "'+path_defaultImage+'")\n';message+=referenceProductMediaRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_entitlement=obj.entitlement;const path_entitlement=path+'.entitlement';const referenceProductEntitlementRepresentationValidationError=validate$1(obj_entitlement,path_entitlement);if(referenceProductEntitlementRepresentationValidationError!==null){let message='Object doesn\'t match ProductEntitlementRepresentation (at "'+path_entitlement+'")\n';message+=referenceProductEntitlementRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_fields=obj.fields;const path_fields=path+'.fields';if(typeof obj_fields!=='object'||ArrayIsArray$1$1(obj_fields)||obj_fields===null){return new TypeError('Expected "object" but received "'+typeof obj_fields+'" (at "'+path_fields+'")');}const obj_fields_keys=ObjectKeys$1$1(obj_fields);for(let i=0;i<obj_fields_keys.length;i++){const key=obj_fields_keys[i];const obj_fields_prop=obj_fields[key];const path_fields_prop=path_fields+'["'+key+'"]';let obj_fields_prop_union0=null;const obj_fields_prop_union0_error=(()=>{if(typeof obj_fields_prop!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_fields_prop+'" (at "'+path_fields_prop+'")');}})();if(obj_fields_prop_union0_error!=null){obj_fields_prop_union0=obj_fields_prop_union0_error.message;}let obj_fields_prop_union1=null;const obj_fields_prop_union1_error=(()=>{if(obj_fields_prop!==null){return new TypeError('Expected "null" but received "'+typeof obj_fields_prop+'" (at "'+path_fields_prop+'")');}})();if(obj_fields_prop_union1_error!=null){obj_fields_prop_union1=obj_fields_prop_union1_error.message;}if(obj_fields_prop_union0&&obj_fields_prop_union1){let message='Object doesn\'t match union (at "'+path_fields_prop+'")';message+='\n'+obj_fields_prop_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_fields_prop_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}const obj_id=obj.id;const path_id=path+'.id';if(typeof obj_id!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_id+'" (at "'+path_id+'")');}const obj_mediaGroups=obj.mediaGroups;const path_mediaGroups=path+'.mediaGroups';if(!ArrayIsArray$1$1(obj_mediaGroups)){return new TypeError('Expected "array" but received "'+typeof obj_mediaGroups+'" (at "'+path_mediaGroups+'")');}for(let i=0;i<obj_mediaGroups.length;i++){const obj_mediaGroups_item=obj_mediaGroups[i];const path_mediaGroups_item=path_mediaGroups+'['+i+']';const referenceProductMediaGroupRepresentationValidationError=validate$2(obj_mediaGroups_item,path_mediaGroups_item);if(referenceProductMediaGroupRepresentationValidationError!==null){let message='Object doesn\'t match ProductMediaGroupRepresentation (at "'+path_mediaGroups_item+'")\n';message+=referenceProductMediaGroupRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}const obj_primaryProductCategoryPath=obj.primaryProductCategoryPath;const path_primaryProductCategoryPath=path+'.primaryProductCategoryPath';const referenceProductCategoryPathRepresentationValidationError=validate$4(obj_primaryProductCategoryPath,path_primaryProductCategoryPath);if(referenceProductCategoryPathRepresentationValidationError!==null){let message='Object doesn\'t match ProductCategoryPathRepresentation (at "'+path_primaryProductCategoryPath+'")\n';message+=referenceProductCategoryPathRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}})();return v_error===undefined?null:v_error;}function normalize$1(input,existing,path,lds,store,timestamp){return input;}const select$1=function ProductDetailRepresentationSelect(){return {kind:'Fragment',opaque:true};};function equals$1(existing,incoming){if(JSONStrinify(incoming)!==JSONStrinify(existing)){return false;}return true;}function deepFreeze$5(input){const input_defaultImage=input.defaultImage;deepFreeze$2(input_defaultImage);const input_entitlement=input.entitlement;deepFreeze$1$1(input_entitlement);const input_fields=input.fields;const input_fields_keys=Object.keys(input_fields);const input_fields_length=input_fields_keys.length;for(let i=0;i<input_fields_length;i++){const key=input_fields_keys[i];}ObjectFreeze$1(input_fields);const input_mediaGroups=input.mediaGroups;for(let i=0;i<input_mediaGroups.length;i++){const input_mediaGroups_item=input_mediaGroups[i];deepFreeze$2$1(input_mediaGroups_item);}ObjectFreeze$1(input_mediaGroups);const input_primaryProductCategoryPath=input.primaryProductCategoryPath;deepFreeze$4(input_primaryProductCategoryPath);ObjectFreeze$1(input);}const ingest$1=function ProductDetailRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$5(input);if(validateError!==null){throw validateError;}}const key=path.fullPath;let incomingRecord=normalize$1(input,store.records[key],{fullPath:key,parent:path.parent});const existingRecord=store.records[key];deepFreeze$5(input);if(existingRecord===undefined||equals$1(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}return createLink$1(key);};function getCommerceWebstoresProductsByProductIdAndWebstoreId(config){const key=keyPrefix+'ProductDetailRepresentation('+'effectiveAccountId:'+config.queryParams.effectiveAccountId+','+'excludeEntitlement:'+config.queryParams.excludeEntitlement+','+'excludeFields:'+config.queryParams.excludeFields+','+'excludeMedia:'+config.queryParams.excludeMedia+','+'excludePrimaryProductCategory:'+config.queryParams.excludePrimaryProductCategory+','+'fields:'+config.queryParams.fields+','+'mediaGroups:'+config.queryParams.mediaGroups+','+'productId:'+config.urlParams.productId+','+'webstoreId:'+config.urlParams.webstoreId+')';const headers={};return {path:'/services/data/v49.0/commerce/webstores/'+config.urlParams.webstoreId+'/products/'+config.urlParams.productId+'',method:'get',body:null,urlParams:config.urlParams,queryParams:config.queryParams,key:key,ingest:ingest$1,headers};}const getProduct_ConfigPropertyNames={displayName:'getProduct',parameters:{required:['productId','webstoreId'],optional:['effectiveAccountId','excludeEntitlement','excludeFields','excludeMedia','excludePrimaryProductCategory','fields','mediaGroups']}};function typeCheckConfig(untrustedConfig){const config={};const untrustedConfig_productId=untrustedConfig.productId;if(typeof untrustedConfig_productId==='string'){config.productId=untrustedConfig_productId;}const untrustedConfig_webstoreId=untrustedConfig.webstoreId;if(typeof untrustedConfig_webstoreId==='string'){config.webstoreId=untrustedConfig_webstoreId;}const untrustedConfig_effectiveAccountId=untrustedConfig.effectiveAccountId;if(typeof untrustedConfig_effectiveAccountId==='string'){config.effectiveAccountId=untrustedConfig_effectiveAccountId;}const untrustedConfig_excludeEntitlement=untrustedConfig.excludeEntitlement;if(typeof untrustedConfig_excludeEntitlement==='boolean'){config.excludeEntitlement=untrustedConfig_excludeEntitlement;}const untrustedConfig_excludeFields=untrustedConfig.excludeFields;if(typeof untrustedConfig_excludeFields==='boolean'){config.excludeFields=untrustedConfig_excludeFields;}const untrustedConfig_excludeMedia=untrustedConfig.excludeMedia;if(typeof untrustedConfig_excludeMedia==='boolean'){config.excludeMedia=untrustedConfig_excludeMedia;}const untrustedConfig_excludePrimaryProductCategory=untrustedConfig.excludePrimaryProductCategory;if(typeof untrustedConfig_excludePrimaryProductCategory==='boolean'){config.excludePrimaryProductCategory=untrustedConfig_excludePrimaryProductCategory;}const untrustedConfig_fields=untrustedConfig.fields;if(ArrayIsArray$2(untrustedConfig_fields)){const untrustedConfig_fields_array=[];for(let i=0,arrayLength=untrustedConfig_fields.length;i<arrayLength;i++){const untrustedConfig_fields_item=untrustedConfig_fields[i];if(typeof untrustedConfig_fields_item==='string'){untrustedConfig_fields_array.push(untrustedConfig_fields_item);}}config.fields=untrustedConfig_fields_array;}const untrustedConfig_mediaGroups=untrustedConfig.mediaGroups;if(ArrayIsArray$2(untrustedConfig_mediaGroups)){const untrustedConfig_mediaGroups_array=[];for(let i=0,arrayLength=untrustedConfig_mediaGroups.length;i<arrayLength;i++){const untrustedConfig_mediaGroups_item=untrustedConfig_mediaGroups[i];if(typeof untrustedConfig_mediaGroups_item==='string'){untrustedConfig_mediaGroups_array.push(untrustedConfig_mediaGroups_item);}}config.mediaGroups=untrustedConfig_mediaGroups_array;}return config;}function validateAdapterConfig$1(untrustedConfig,configPropertyNames){if(!untrustedIsObject$1(untrustedConfig)){return null;}{validateConfig$1(untrustedConfig,configPropertyNames);}const config=typeCheckConfig(untrustedConfig);if(!areRequiredParametersPresent(config,configPropertyNames)){return null;}return config;}function buildInMemorySnapshot(lds,config){const request=getCommerceWebstoresProductsByProductIdAndWebstoreId({urlParams:{productId:config.productId,webstoreId:config.webstoreId},queryParams:{effectiveAccountId:config.effectiveAccountId,excludeEntitlement:config.excludeEntitlement,excludeFields:config.excludeFields,excludeMedia:config.excludeMedia,excludePrimaryProductCategory:config.excludePrimaryProductCategory,fields:config.fields,mediaGroups:config.mediaGroups}});const selector={recordId:request.key,node:select$1(),variables:{}};return lds.storeLookup(selector);}function buildNetworkSnapshot(lds,config,override){const request=getCommerceWebstoresProductsByProductIdAndWebstoreId({urlParams:{productId:config.productId,webstoreId:config.webstoreId},queryParams:{effectiveAccountId:config.effectiveAccountId,excludeEntitlement:config.excludeEntitlement,excludeFields:config.excludeFields,excludeMedia:config.excludeMedia,excludePrimaryProductCategory:config.excludePrimaryProductCategory,fields:config.fields,mediaGroups:config.mediaGroups}});return lds.dispatchResourceRequest(request,override).then(response=>{const{body}=response;lds.storeIngest(request.key,request,body);lds.storeBroadcast();return buildInMemorySnapshot(lds,config);},error=>{lds.storeIngestFetchResponse(request.key,error);lds.storeBroadcast();return lds.errorSnapshot(error);});}const getProductAdapterFactory=lds=>{return refreshable$1(// Create snapshot either via a cache hit or via the network
    function getProduct(untrustedConfig){const config=validateAdapterConfig$1(untrustedConfig,getProduct_ConfigPropertyNames);// Invalid or incomplete config
    if(config===null){return null;}const cacheSnapshot=buildInMemorySnapshot(lds,config);// Cache Hit
    if(cacheSnapshot.state===SNAPSHOT_STATE_FULFILLED){return cacheSnapshot;}return buildNetworkSnapshot(lds,config);},// Refresh snapshot
    // TODO W-6900511 - This currently passes the untrusted config
    // because we don't have a way to pass the validated config back to LDS
    untrustedConfig=>{const config=validateAdapterConfig$1(untrustedConfig,getProduct_ConfigPropertyNames);// This should never happen
    if(config===null){throw new Error('Invalid config passed to "getProduct" refresh function');}return buildNetworkSnapshot(lds,config,{headers:{'Cache-Control':'no-cache'}});});};function getCommerceWebstoresProductCategoryPathProductCategoriesByProductCategoryIdAndWebstoreId(config){const key=keyPrefix+'ProductCategoryPathRepresentation('+'productCategoryId:'+config.urlParams.productCategoryId+','+'webstoreId:'+config.urlParams.webstoreId+')';const headers={};return {path:'/services/data/v49.0/commerce/webstores/'+config.urlParams.webstoreId+'/product-category-path/product-categories/'+config.urlParams.productCategoryId+'',method:'get',body:null,urlParams:config.urlParams,queryParams:{},key:key,ingest:ingest,headers};}const getProductCategoryPath_ConfigPropertyNames={displayName:'getProductCategoryPath',parameters:{required:['productCategoryId','webstoreId'],optional:[]}};function typeCheckConfig$1(untrustedConfig){const config={};const untrustedConfig_productCategoryId=untrustedConfig.productCategoryId;if(typeof untrustedConfig_productCategoryId==='string'){config.productCategoryId=untrustedConfig_productCategoryId;}const untrustedConfig_webstoreId=untrustedConfig.webstoreId;if(typeof untrustedConfig_webstoreId==='string'){config.webstoreId=untrustedConfig_webstoreId;}return config;}function validateAdapterConfig$1$1(untrustedConfig,configPropertyNames){if(!untrustedIsObject$1(untrustedConfig)){return null;}{validateConfig$1(untrustedConfig,configPropertyNames);}const config=typeCheckConfig$1(untrustedConfig);if(!areRequiredParametersPresent(config,configPropertyNames)){return null;}return config;}function buildInMemorySnapshot$1(lds,config){const request=getCommerceWebstoresProductCategoryPathProductCategoriesByProductCategoryIdAndWebstoreId({urlParams:{productCategoryId:config.productCategoryId,webstoreId:config.webstoreId}});const selector={recordId:request.key,node:select(),variables:{}};return lds.storeLookup(selector);}function buildNetworkSnapshot$1(lds,config,override){const request=getCommerceWebstoresProductCategoryPathProductCategoriesByProductCategoryIdAndWebstoreId({urlParams:{productCategoryId:config.productCategoryId,webstoreId:config.webstoreId}});return lds.dispatchResourceRequest(request,override).then(response=>{const{body}=response;lds.storeIngest(request.key,request,body);lds.storeBroadcast();return buildInMemorySnapshot$1(lds,config);},error=>{lds.storeIngestFetchResponse(request.key,error);lds.storeBroadcast();return lds.errorSnapshot(error);});}const getProductCategoryPathAdapterFactory=lds=>{return refreshable$1(// Create snapshot either via a cache hit or via the network
    function getProductCategoryPath(untrustedConfig){const config=validateAdapterConfig$1$1(untrustedConfig,getProductCategoryPath_ConfigPropertyNames);// Invalid or incomplete config
    if(config===null){return null;}const cacheSnapshot=buildInMemorySnapshot$1(lds,config);// Cache Hit
    if(cacheSnapshot.state===SNAPSHOT_STATE_FULFILLED){return cacheSnapshot;}return buildNetworkSnapshot$1(lds,config);},// Refresh snapshot
    // TODO W-6900511 - This currently passes the untrusted config
    // because we don't have a way to pass the validated config back to LDS
    untrustedConfig=>{const config=validateAdapterConfig$1$1(untrustedConfig,getProductCategoryPath_ConfigPropertyNames);// This should never happen
    if(config===null){throw new Error('Invalid config passed to "getProductCategoryPath" refresh function');}return buildNetworkSnapshot$1(lds,config,{headers:{'Cache-Control':'no-cache'}});});};const{hasOwnProperty:ObjectPrototypeHasOwnProperty$1}=Object.prototype;const{keys:ObjectKeys$2}=Object;const{isArray:ArrayIsArray$3}=Array;function isPromise$3(value){return value.then!==undefined;}/**
     * Validates an adapter config is well-formed.
     * @param config The config to validate.
     * @param adapter The adapter validation configuration.
     * @param oneOf The keys the config must contain at least one of.
     * @throws A TypeError if config doesn't satisfy the adapter's config validation.
     */function validateConfig$1$1(config,adapter,oneOf){const{displayName}=adapter;const{required,optional,unsupported}=adapter.parameters;if(config===undefined||required.every(req=>ObjectPrototypeHasOwnProperty$1.call(config,req))===false){throw new TypeError(`adapter ${displayName} configuration must specify ${required.sort().join(', ')}`);}if(oneOf&&oneOf.some(req=>ObjectPrototypeHasOwnProperty$1.call(config,req))===false){throw new TypeError(`adapter ${displayName} configuration must specify one of ${oneOf.sort().join(', ')}`);}if(unsupported!==undefined&&unsupported.some(req=>ObjectPrototypeHasOwnProperty$1.call(config,req))){throw new TypeError(`adapter ${displayName} does not yet support ${unsupported.sort().join(', ')}`);}const supported=required.concat(optional);if(ObjectKeys$2(config).some(key=>!supported.includes(key))){throw new TypeError(`adapter ${displayName} configuration supports only ${supported.sort().join(', ')}`);}}function untrustedIsObject$2(untrusted){return typeof untrusted==='object'&&untrusted!==null&&ArrayIsArray$3(untrusted)===false;}function areRequiredParametersPresent$1(config,configPropertyNames){return configPropertyNames.parameters.required.every(req=>req in config);}function refreshable$2(adapter,resolve){return config=>{const result=adapter(config);if(result===null){return result;}if(isPromise$3(result)){return result.then(snapshot=>{snapshot.refresh={config,resolve};return snapshot;});}result.refresh={config,resolve};return result;};}const SNAPSHOT_STATE_FULFILLED$1='Fulfilled';const keyPrefix$1='Commerce::';const{freeze:ObjectFreeze$2,keys:ObjectKeys$1$2}=Object;const{isArray:ArrayIsArray$1$2}=Array;const{stringify:JSONStrinify$1}=JSON;function createLink$2(ref){return {__ref:ref};}function validate$6(obj,path='SearchCategoryRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$1$2(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_children=obj.children;const path_children=path+'.children';if(!ArrayIsArray$1$2(obj_children)){return new TypeError('Expected "array" but received "'+typeof obj_children+'" (at "'+path_children+'")');}for(let i=0;i<obj_children.length;i++){const obj_children_item=obj_children[i];const path_children_item=path_children+'['+i+']';const referenceSearchCategoryRepresentationValidationError=validate$6(obj_children_item,path_children_item);if(referenceSearchCategoryRepresentationValidationError!==null){let message='Object doesn\'t match SearchCategoryRepresentation (at "'+path_children_item+'")\n';message+=referenceSearchCategoryRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}const obj_productCount=obj.productCount;const path_productCount=path+'.productCount';if(typeof obj_productCount!=='number'||typeof obj_productCount==='number'&&Math.floor(obj_productCount)!==obj_productCount){return new TypeError('Expected "integer" but received "'+typeof obj_productCount+'" (at "'+path_productCount+'")');}})();return v_error===undefined?null:v_error;}function deepFreeze$6(input){const input_children=input.children;for(let i=0;i<input_children.length;i++){const input_children_item=input_children[i];deepFreeze$6(input_children_item);}ObjectFreeze$2(input_children);ObjectFreeze$2(input);}function validate$1$1(obj,path='SearchFacetRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$1$2(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}if(obj.attributeType!==undefined){const obj_attributeType=obj.attributeType;const path_attributeType=path+'.attributeType';if(typeof obj_attributeType!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_attributeType+'" (at "'+path_attributeType+'")');}}const obj_displayName=obj.displayName;const path_displayName=path+'.displayName';if(typeof obj_displayName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_displayName+'" (at "'+path_displayName+'")');}const obj_displayRank=obj.displayRank;const path_displayRank=path+'.displayRank';if(typeof obj_displayRank!=='number'||typeof obj_displayRank==='number'&&Math.floor(obj_displayRank)!==obj_displayRank){return new TypeError('Expected "integer" but received "'+typeof obj_displayRank+'" (at "'+path_displayRank+'")');}const obj_displayType=obj.displayType;const path_displayType=path+'.displayType';if(typeof obj_displayType!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_displayType+'" (at "'+path_displayType+'")');}if(obj.facetType!==undefined){const obj_facetType=obj.facetType;const path_facetType=path+'.facetType';if(typeof obj_facetType!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_facetType+'" (at "'+path_facetType+'")');}}const obj_nameOrId=obj.nameOrId;const path_nameOrId=path+'.nameOrId';if(typeof obj_nameOrId!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_nameOrId+'" (at "'+path_nameOrId+'")');}})();return v_error===undefined?null:v_error;}function deepFreeze$1$2(input){ObjectFreeze$2(input);}function validate$2$1(obj,path='ProductSummaryRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$1$2(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_fields=obj.fields;const path_fields=path+'.fields';if(typeof obj_fields!=='object'||ArrayIsArray$1$2(obj_fields)||obj_fields===null){return new TypeError('Expected "object" but received "'+typeof obj_fields+'" (at "'+path_fields+'")');}const obj_fields_keys=ObjectKeys$1$2(obj_fields);for(let i=0;i<obj_fields_keys.length;i++){const key=obj_fields_keys[i];const obj_fields_prop=obj_fields[key];const path_fields_prop=path_fields+'["'+key+'"]';let obj_fields_prop_union0=null;const obj_fields_prop_union0_error=(()=>{if(typeof obj_fields_prop!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_fields_prop+'" (at "'+path_fields_prop+'")');}})();if(obj_fields_prop_union0_error!=null){obj_fields_prop_union0=obj_fields_prop_union0_error.message;}let obj_fields_prop_union1=null;const obj_fields_prop_union1_error=(()=>{if(obj_fields_prop!==null){return new TypeError('Expected "null" but received "'+typeof obj_fields_prop+'" (at "'+path_fields_prop+'")');}})();if(obj_fields_prop_union1_error!=null){obj_fields_prop_union1=obj_fields_prop_union1_error.message;}if(obj_fields_prop_union0&&obj_fields_prop_union1){let message='Object doesn\'t match union (at "'+path_fields_prop+'")';message+='\n'+obj_fields_prop_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_fields_prop_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}const obj_id=obj.id;const path_id=path+'.id';if(typeof obj_id!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_id+'" (at "'+path_id+'")');}const obj_name=obj.name;const path_name=path+'.name';if(typeof obj_name!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_name+'" (at "'+path_name+'")');}})();return v_error===undefined?null:v_error;}function deepFreeze$2$2(input){const input_fields=input.fields;const input_fields_keys=Object.keys(input_fields);const input_fields_length=input_fields_keys.length;for(let i=0;i<input_fields_length;i++){const key=input_fields_keys[i];}ObjectFreeze$2(input_fields);ObjectFreeze$2(input);}function validate$3$1(obj,path='ProductSummaryCollectionRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$1$2(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_currencyIsoCode=obj.currencyIsoCode;const path_currencyIsoCode=path+'.currencyIsoCode';if(typeof obj_currencyIsoCode!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_currencyIsoCode+'" (at "'+path_currencyIsoCode+'")');}if(obj.pageSize!==undefined){const obj_pageSize=obj.pageSize;const path_pageSize=path+'.pageSize';if(typeof obj_pageSize!=='number'||typeof obj_pageSize==='number'&&Math.floor(obj_pageSize)!==obj_pageSize){return new TypeError('Expected "integer" but received "'+typeof obj_pageSize+'" (at "'+path_pageSize+'")');}}const obj_products=obj.products;const path_products=path+'.products';if(!ArrayIsArray$1$2(obj_products)){return new TypeError('Expected "array" but received "'+typeof obj_products+'" (at "'+path_products+'")');}for(let i=0;i<obj_products.length;i++){const obj_products_item=obj_products[i];const path_products_item=path_products+'['+i+']';const referenceProductSummaryRepresentationValidationError=validate$2$1(obj_products_item,path_products_item);if(referenceProductSummaryRepresentationValidationError!==null){let message='Object doesn\'t match ProductSummaryRepresentation (at "'+path_products_item+'")\n';message+=referenceProductSummaryRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}const obj_total=obj.total;const path_total=path+'.total';if(typeof obj_total!=='number'||typeof obj_total==='number'&&Math.floor(obj_total)!==obj_total){return new TypeError('Expected "integer" but received "'+typeof obj_total+'" (at "'+path_total+'")');}})();return v_error===undefined?null:v_error;}function deepFreeze$3$1(input){const input_products=input.products;for(let i=0;i<input_products.length;i++){const input_products_item=input_products[i];deepFreeze$2$2(input_products_item);}ObjectFreeze$2(input_products);ObjectFreeze$2(input);}function validate$4$1(obj,path='ProductSearchResultsRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$1$2(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_categories=obj.categories;const path_categories=path+'.categories';const referenceSearchCategoryRepresentationValidationError=validate$6(obj_categories,path_categories);if(referenceSearchCategoryRepresentationValidationError!==null){let message='Object doesn\'t match SearchCategoryRepresentation (at "'+path_categories+'")\n';message+=referenceSearchCategoryRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_facets=obj.facets;const path_facets=path+'.facets';if(!ArrayIsArray$1$2(obj_facets)){return new TypeError('Expected "array" but received "'+typeof obj_facets+'" (at "'+path_facets+'")');}for(let i=0;i<obj_facets.length;i++){const obj_facets_item=obj_facets[i];const path_facets_item=path_facets+'['+i+']';const referenceSearchFacetRepresentationValidationError=validate$1$1(obj_facets_item,path_facets_item);if(referenceSearchFacetRepresentationValidationError!==null){let message='Object doesn\'t match SearchFacetRepresentation (at "'+path_facets_item+'")\n';message+=referenceSearchFacetRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}const obj_locale=obj.locale;const path_locale=path+'.locale';if(typeof obj_locale!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_locale+'" (at "'+path_locale+'")');}const obj_productsPage=obj.productsPage;const path_productsPage=path+'.productsPage';const referenceProductSummaryCollectionRepresentationValidationError=validate$3$1(obj_productsPage,path_productsPage);if(referenceProductSummaryCollectionRepresentationValidationError!==null){let message='Object doesn\'t match ProductSummaryCollectionRepresentation (at "'+path_productsPage+'")\n';message+=referenceProductSummaryCollectionRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}})();return v_error===undefined?null:v_error;}function normalize$2(input,existing,path,lds,store,timestamp){return input;}const select$2=function ProductSearchResultsRepresentationSelect(){return {kind:'Fragment',opaque:true};};function equals$2(existing,incoming){if(JSONStrinify$1(incoming)!==JSONStrinify$1(existing)){return false;}return true;}function deepFreeze$4$1(input){const input_categories=input.categories;deepFreeze$6(input_categories);const input_facets=input.facets;for(let i=0;i<input_facets.length;i++){const input_facets_item=input_facets[i];deepFreeze$1$2(input_facets_item);}ObjectFreeze$2(input_facets);const input_productsPage=input.productsPage;deepFreeze$3$1(input_productsPage);ObjectFreeze$2(input);}const ingest$2=function ProductSearchResultsRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$4$1(input);if(validateError!==null){throw validateError;}}const key=path.fullPath;let incomingRecord=normalize$2(input,store.records[key],{fullPath:key,parent:path.parent});const existingRecord=store.records[key];deepFreeze$4$1(input);if(existingRecord===undefined||equals$2(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}return createLink$2(key);};function postCommerceWebstoresSearchProductSearchByWebstoreId(config){const key=keyPrefix$1+'ProductSearchResultsRepresentation('+'effectiveAccountId:'+config.queryParams.effectiveAccountId+','+'webstoreId:'+config.urlParams.webstoreId+')';const headers={};return {path:'/services/data/v49.0/commerce/webstores/'+config.urlParams.webstoreId+'/search/product-search',method:'post',body:config.body,urlParams:config.urlParams,queryParams:config.queryParams,key:key,ingest:ingest$2,headers};}const productSearch_ConfigPropertyNames={displayName:'productSearch',parameters:{required:['webstoreId','categoryId','fields','page','pageSize','refinements','searchTerm','sortOrderId'],optional:['effectiveAccountId']}};function typeCheckConfig$2(untrustedConfig){const config={};const untrustedConfig_webstoreId=untrustedConfig.webstoreId;if(typeof untrustedConfig_webstoreId==='string'){config.webstoreId=untrustedConfig_webstoreId;}const untrustedConfig_effectiveAccountId=untrustedConfig.effectiveAccountId;if(typeof untrustedConfig_effectiveAccountId==='string'){config.effectiveAccountId=untrustedConfig_effectiveAccountId;}const untrustedConfig_categoryId=untrustedConfig.categoryId;if(typeof untrustedConfig_categoryId==='string'){config.categoryId=untrustedConfig_categoryId;}const untrustedConfig_fields=untrustedConfig.fields;if(ArrayIsArray$3(untrustedConfig_fields)){const untrustedConfig_fields_array=[];for(let i=0,arrayLength=untrustedConfig_fields.length;i<arrayLength;i++){const untrustedConfig_fields_item=untrustedConfig_fields[i];if(typeof untrustedConfig_fields_item==='string'){untrustedConfig_fields_array.push(untrustedConfig_fields_item);}}config.fields=untrustedConfig_fields_array;}const untrustedConfig_page=untrustedConfig.page;if(typeof untrustedConfig_page==='number'&&Math.floor(untrustedConfig_page)===untrustedConfig_page){config.page=untrustedConfig_page;}const untrustedConfig_pageSize=untrustedConfig.pageSize;if(typeof untrustedConfig_pageSize==='number'&&Math.floor(untrustedConfig_pageSize)===untrustedConfig_pageSize){config.pageSize=untrustedConfig_pageSize;}const untrustedConfig_refinements=untrustedConfig.refinements;if(ArrayIsArray$3(untrustedConfig_refinements)){const untrustedConfig_refinements_array=[];for(let i=0,arrayLength=untrustedConfig_refinements.length;i<arrayLength;i++){const untrustedConfig_refinements_item=untrustedConfig_refinements[i];if(untrustedIsObject$2(untrustedConfig_refinements_item)){const untrustedConfig_refinements_item_object={};if(Object.keys(untrustedConfig_refinements_item_object).length>0){untrustedConfig_refinements_array.push(untrustedConfig_refinements_item_object);}}}config.refinements=untrustedConfig_refinements_array;}const untrustedConfig_searchTerm=untrustedConfig.searchTerm;if(typeof untrustedConfig_searchTerm==='string'){config.searchTerm=untrustedConfig_searchTerm;}const untrustedConfig_sortOrderId=untrustedConfig.sortOrderId;if(typeof untrustedConfig_sortOrderId==='string'){config.sortOrderId=untrustedConfig_sortOrderId;}return config;}function validateAdapterConfig$2(untrustedConfig,configPropertyNames){if(!untrustedIsObject$2(untrustedConfig)){return null;}{validateConfig$1$1(untrustedConfig,configPropertyNames);}const config=typeCheckConfig$2(untrustedConfig);if(!areRequiredParametersPresent$1(config,configPropertyNames)){return null;}return config;}function buildInMemorySnapshot$2(lds,config){const request=postCommerceWebstoresSearchProductSearchByWebstoreId({urlParams:{webstoreId:config.webstoreId},queryParams:{effectiveAccountId:config.effectiveAccountId},body:{categoryId:config.categoryId,fields:config.fields,page:config.page,pageSize:config.pageSize,refinements:config.refinements,searchTerm:config.searchTerm,sortOrderId:config.sortOrderId}});const selector={recordId:request.key,node:select$2(),variables:{}};return lds.storeLookup(selector);}function buildNetworkSnapshot$2(lds,config,override){const request=postCommerceWebstoresSearchProductSearchByWebstoreId({urlParams:{webstoreId:config.webstoreId},queryParams:{effectiveAccountId:config.effectiveAccountId},body:{categoryId:config.categoryId,fields:config.fields,page:config.page,pageSize:config.pageSize,refinements:config.refinements,searchTerm:config.searchTerm,sortOrderId:config.sortOrderId}});return lds.dispatchResourceRequest(request,override).then(response=>{const{body}=response;lds.storeIngest(request.key,request,body);lds.storeBroadcast();return buildInMemorySnapshot$2(lds,config);},error=>{lds.storeIngestFetchResponse(request.key,error);lds.storeBroadcast();return lds.errorSnapshot(error);});}const productSearchAdapterFactory=lds=>{return refreshable$2(// Create snapshot either via a cache hit or via the network
    function productSearch(untrustedConfig){const config=validateAdapterConfig$2(untrustedConfig,productSearch_ConfigPropertyNames);// Invalid or incomplete config
    if(config===null){return null;}const cacheSnapshot=buildInMemorySnapshot$2(lds,config);// Cache Hit
    if(cacheSnapshot.state===SNAPSHOT_STATE_FULFILLED$1){return cacheSnapshot;}return buildNetworkSnapshot$2(lds,config);},// Refresh snapshot
    // TODO W-6900511 - This currently passes the untrusted config
    // because we don't have a way to pass the validated config back to LDS
    untrustedConfig=>{const config=validateAdapterConfig$2(untrustedConfig,productSearch_ConfigPropertyNames);// This should never happen
    if(config===null){throw new Error('Invalid config passed to "productSearch" refresh function');}return buildNetworkSnapshot$2(lds,config,{headers:{'Cache-Control':'no-cache'}});});};const{hasOwnProperty:ObjectPrototypeHasOwnProperty$2}=Object.prototype;const{keys:ObjectKeys$3}=Object;const{isArray:ArrayIsArray$4}=Array;function isPromise$4(value){return value.then!==undefined;}/**
     * Validates an adapter config is well-formed.
     * @param config The config to validate.
     * @param adapter The adapter validation configuration.
     * @param oneOf The keys the config must contain at least one of.
     * @throws A TypeError if config doesn't satisfy the adapter's config validation.
     */function validateConfig$2(config,adapter,oneOf){const{displayName}=adapter;const{required,optional,unsupported}=adapter.parameters;if(config===undefined||required.every(req=>ObjectPrototypeHasOwnProperty$2.call(config,req))===false){throw new TypeError(`adapter ${displayName} configuration must specify ${required.sort().join(', ')}`);}if(oneOf&&oneOf.some(req=>ObjectPrototypeHasOwnProperty$2.call(config,req))===false){throw new TypeError(`adapter ${displayName} configuration must specify one of ${oneOf.sort().join(', ')}`);}if(unsupported!==undefined&&unsupported.some(req=>ObjectPrototypeHasOwnProperty$2.call(config,req))){throw new TypeError(`adapter ${displayName} does not yet support ${unsupported.sort().join(', ')}`);}const supported=required.concat(optional);if(ObjectKeys$3(config).some(key=>!supported.includes(key))){throw new TypeError(`adapter ${displayName} configuration supports only ${supported.sort().join(', ')}`);}}function untrustedIsObject$3(untrusted){return typeof untrusted==='object'&&untrusted!==null&&ArrayIsArray$4(untrusted)===false;}function areRequiredParametersPresent$2(config,configPropertyNames){return configPropertyNames.parameters.required.every(req=>req in config);}function refreshable$3(adapter,resolve){return config=>{const result=adapter(config);if(result===null){return result;}if(isPromise$4(result)){return result.then(snapshot=>{snapshot.refresh={config,resolve};return snapshot;});}result.refresh={config,resolve};return result;};}const SNAPSHOT_STATE_FULFILLED$2='Fulfilled';const keyPrefix$2='Commerce::';const{freeze:ObjectFreeze$3,keys:ObjectKeys$1$3}=Object;const{isArray:ArrayIsArray$1$3}=Array;const{stringify:JSONStrinify$2}=JSON;function createLink$3(ref){return {__ref:ref};}function validate$7(obj,path='PriceAdjustmentTierRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$1$3(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_adjustmentType=obj.adjustmentType;const path_adjustmentType=path+'.adjustmentType';if(typeof obj_adjustmentType!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_adjustmentType+'" (at "'+path_adjustmentType+'")');}const obj_adjustmentValue=obj.adjustmentValue;const path_adjustmentValue=path+'.adjustmentValue';if(typeof obj_adjustmentValue!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_adjustmentValue+'" (at "'+path_adjustmentValue+'")');}const obj_id=obj.id;const path_id=path+'.id';if(typeof obj_id!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_id+'" (at "'+path_id+'")');}const obj_lowerBound=obj.lowerBound;const path_lowerBound=path+'.lowerBound';if(typeof obj_lowerBound!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_lowerBound+'" (at "'+path_lowerBound+'")');}const obj_tierUnitPrice=obj.tierUnitPrice;const path_tierUnitPrice=path+'.tierUnitPrice';if(typeof obj_tierUnitPrice!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_tierUnitPrice+'" (at "'+path_tierUnitPrice+'")');}const obj_upperBound=obj.upperBound;const path_upperBound=path+'.upperBound';if(typeof obj_upperBound!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_upperBound+'" (at "'+path_upperBound+'")');}})();return v_error===undefined?null:v_error;}function deepFreeze$7(input){ObjectFreeze$3(input);}function validate$1$2(obj,path='PriceAdjustmentScheduleRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$1$3(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_id=obj.id;const path_id=path+'.id';if(typeof obj_id!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_id+'" (at "'+path_id+'")');}const obj_priceAdjustmentTiers=obj.priceAdjustmentTiers;const path_priceAdjustmentTiers=path+'.priceAdjustmentTiers';if(!ArrayIsArray$1$3(obj_priceAdjustmentTiers)){return new TypeError('Expected "array" but received "'+typeof obj_priceAdjustmentTiers+'" (at "'+path_priceAdjustmentTiers+'")');}for(let i=0;i<obj_priceAdjustmentTiers.length;i++){const obj_priceAdjustmentTiers_item=obj_priceAdjustmentTiers[i];const path_priceAdjustmentTiers_item=path_priceAdjustmentTiers+'['+i+']';const referencePriceAdjustmentTierRepresentationValidationError=validate$7(obj_priceAdjustmentTiers_item,path_priceAdjustmentTiers_item);if(referencePriceAdjustmentTierRepresentationValidationError!==null){let message='Object doesn\'t match PriceAdjustmentTierRepresentation (at "'+path_priceAdjustmentTiers_item+'")\n';message+=referencePriceAdjustmentTierRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}})();return v_error===undefined?null:v_error;}function deepFreeze$1$3(input){const input_priceAdjustmentTiers=input.priceAdjustmentTiers;for(let i=0;i<input_priceAdjustmentTiers.length;i++){const input_priceAdjustmentTiers_item=input_priceAdjustmentTiers[i];deepFreeze$7(input_priceAdjustmentTiers_item);}ObjectFreeze$3(input_priceAdjustmentTiers);ObjectFreeze$3(input);}function validate$2$2(obj,path='ProductPriceRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$1$3(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_currencyIsoCode=obj.currencyIsoCode;const path_currencyIsoCode=path+'.currencyIsoCode';if(typeof obj_currencyIsoCode!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_currencyIsoCode+'" (at "'+path_currencyIsoCode+'")');}const obj_listPrice=obj.listPrice;const path_listPrice=path+'.listPrice';if(typeof obj_listPrice!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_listPrice+'" (at "'+path_listPrice+'")');}const obj_priceAdjustment=obj.priceAdjustment;const path_priceAdjustment=path+'.priceAdjustment';let obj_priceAdjustment_union0=null;const obj_priceAdjustment_union0_error=(()=>{const referencePriceAdjustmentScheduleRepresentationValidationError=validate$1$2(obj_priceAdjustment,path_priceAdjustment);if(referencePriceAdjustmentScheduleRepresentationValidationError!==null){let message='Object doesn\'t match PriceAdjustmentScheduleRepresentation (at "'+path_priceAdjustment+'")\n';message+=referencePriceAdjustmentScheduleRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}})();if(obj_priceAdjustment_union0_error!=null){obj_priceAdjustment_union0=obj_priceAdjustment_union0_error.message;}let obj_priceAdjustment_union1=null;const obj_priceAdjustment_union1_error=(()=>{if(obj_priceAdjustment!==null){return new TypeError('Expected "null" but received "'+typeof obj_priceAdjustment+'" (at "'+path_priceAdjustment+'")');}})();if(obj_priceAdjustment_union1_error!=null){obj_priceAdjustment_union1=obj_priceAdjustment_union1_error.message;}if(obj_priceAdjustment_union0&&obj_priceAdjustment_union1){let message='Object doesn\'t match union (at "'+path_priceAdjustment+'")';message+='\n'+obj_priceAdjustment_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_priceAdjustment_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_pricebookEntryId=obj.pricebookEntryId;const path_pricebookEntryId=path+'.pricebookEntryId';if(typeof obj_pricebookEntryId!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_pricebookEntryId+'" (at "'+path_pricebookEntryId+'")');}const obj_unitPrice=obj.unitPrice;const path_unitPrice=path+'.unitPrice';if(typeof obj_unitPrice!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_unitPrice+'" (at "'+path_unitPrice+'")');}})();return v_error===undefined?null:v_error;}function normalize$3(input,existing,path,lds,store,timestamp){return input;}const select$3=function ProductPriceRepresentationSelect(){return {kind:'Fragment',opaque:true};};function equals$3(existing,incoming){if(JSONStrinify$2(incoming)!==JSONStrinify$2(existing)){return false;}return true;}function deepFreeze$2$3(input){const input_priceAdjustment=input.priceAdjustment;if(input_priceAdjustment!==null&&typeof input_priceAdjustment==='object'){deepFreeze$1$3(input_priceAdjustment);}ObjectFreeze$3(input);}const ingest$3=function ProductPriceRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$2$2(input);if(validateError!==null){throw validateError;}}const key=path.fullPath;let incomingRecord=normalize$3(input,store.records[key],{fullPath:key,parent:path.parent});const existingRecord=store.records[key];deepFreeze$2$3(input);if(existingRecord===undefined||equals$3(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}return createLink$3(key);};function getCommerceWebstoresPricingProductsByProductIdAndWebstoreId(config){const key=keyPrefix$2+'ProductPriceRepresentation('+'effectiveAccountId:'+config.queryParams.effectiveAccountId+','+'productId:'+config.urlParams.productId+','+'webstoreId:'+config.urlParams.webstoreId+')';const headers={};return {path:'/services/data/v49.0/commerce/webstores/'+config.urlParams.webstoreId+'/pricing/products/'+config.urlParams.productId+'',method:'get',body:null,urlParams:config.urlParams,queryParams:config.queryParams,key:key,ingest:ingest$3,headers};}const getProductPrice_ConfigPropertyNames={displayName:'getProductPrice',parameters:{required:['productId','webstoreId','effectiveAccountId'],optional:[]}};function typeCheckConfig$3(untrustedConfig){const config={};const untrustedConfig_productId=untrustedConfig.productId;if(typeof untrustedConfig_productId==='string'){config.productId=untrustedConfig_productId;}const untrustedConfig_webstoreId=untrustedConfig.webstoreId;if(typeof untrustedConfig_webstoreId==='string'){config.webstoreId=untrustedConfig_webstoreId;}const untrustedConfig_effectiveAccountId=untrustedConfig.effectiveAccountId;if(typeof untrustedConfig_effectiveAccountId==='string'){config.effectiveAccountId=untrustedConfig_effectiveAccountId;}return config;}function validateAdapterConfig$3(untrustedConfig,configPropertyNames){if(!untrustedIsObject$3(untrustedConfig)){return null;}{validateConfig$2(untrustedConfig,configPropertyNames);}const config=typeCheckConfig$3(untrustedConfig);if(!areRequiredParametersPresent$2(config,configPropertyNames)){return null;}return config;}function buildInMemorySnapshot$3(lds,config){const request=getCommerceWebstoresPricingProductsByProductIdAndWebstoreId({urlParams:{productId:config.productId,webstoreId:config.webstoreId},queryParams:{effectiveAccountId:config.effectiveAccountId}});const selector={recordId:request.key,node:select$3(),variables:{}};return lds.storeLookup(selector);}function buildNetworkSnapshot$3(lds,config,override){const request=getCommerceWebstoresPricingProductsByProductIdAndWebstoreId({urlParams:{productId:config.productId,webstoreId:config.webstoreId},queryParams:{effectiveAccountId:config.effectiveAccountId}});return lds.dispatchResourceRequest(request,override).then(response=>{const{body}=response;lds.storeIngest(request.key,request,body);lds.storeBroadcast();return buildInMemorySnapshot$3(lds,config);},error=>{lds.storeIngestFetchResponse(request.key,error);lds.storeBroadcast();return lds.errorSnapshot(error);});}const getProductPriceAdapterFactory=lds=>{return refreshable$3(// Create snapshot either via a cache hit or via the network
    function getProductPrice(untrustedConfig){const config=validateAdapterConfig$3(untrustedConfig,getProductPrice_ConfigPropertyNames);// Invalid or incomplete config
    if(config===null){return null;}const cacheSnapshot=buildInMemorySnapshot$3(lds,config);// Cache Hit
    if(cacheSnapshot.state===SNAPSHOT_STATE_FULFILLED$2){return cacheSnapshot;}return buildNetworkSnapshot$3(lds,config);},// Refresh snapshot
    // TODO W-6900511 - This currently passes the untrusted config
    // because we don't have a way to pass the validated config back to LDS
    untrustedConfig=>{const config=validateAdapterConfig$3(untrustedConfig,getProductPrice_ConfigPropertyNames);// This should never happen
    if(config===null){throw new Error('Invalid config passed to "getProductPrice" refresh function');}return buildNetworkSnapshot$3(lds,config,{headers:{'Cache-Control':'no-cache'}});});};const{hasOwnProperty:ObjectPrototypeHasOwnProperty$3}=Object.prototype;const{keys:ObjectKeys$4}=Object;const{isArray:ArrayIsArray$5}=Array;function isPromise$5(value){return value.then!==undefined;}/**
     * Validates an adapter config is well-formed.
     * @param config The config to validate.
     * @param adapter The adapter validation configuration.
     * @param oneOf The keys the config must contain at least one of.
     * @throws A TypeError if config doesn't satisfy the adapter's config validation.
     */function validateConfig$3(config,adapter,oneOf){const{displayName}=adapter;const{required,optional,unsupported}=adapter.parameters;if(config===undefined||required.every(req=>ObjectPrototypeHasOwnProperty$3.call(config,req))===false){throw new TypeError(`adapter ${displayName} configuration must specify ${required.sort().join(', ')}`);}if(oneOf&&oneOf.some(req=>ObjectPrototypeHasOwnProperty$3.call(config,req))===false){throw new TypeError(`adapter ${displayName} configuration must specify one of ${oneOf.sort().join(', ')}`);}if(unsupported!==undefined&&unsupported.some(req=>ObjectPrototypeHasOwnProperty$3.call(config,req))){throw new TypeError(`adapter ${displayName} does not yet support ${unsupported.sort().join(', ')}`);}const supported=required.concat(optional);if(ObjectKeys$4(config).some(key=>!supported.includes(key))){throw new TypeError(`adapter ${displayName} configuration supports only ${supported.sort().join(', ')}`);}}function untrustedIsObject$4(untrusted){return typeof untrusted==='object'&&untrusted!==null&&ArrayIsArray$5(untrusted)===false;}function areRequiredParametersPresent$3(config,configPropertyNames){return configPropertyNames.parameters.required.every(req=>req in config);}function refreshable$4(adapter,resolve){return config=>{const result=adapter(config);if(result===null){return result;}if(isPromise$5(result)){return result.then(snapshot=>{snapshot.refresh={config,resolve};return snapshot;});}result.refresh={config,resolve};return result;};}const SNAPSHOT_STATE_FULFILLED$3='Fulfilled';const keyPrefix$3='CommunityNavigation::';const{freeze:ObjectFreeze$4,keys:ObjectKeys$1$4}=Object;const{isArray:ArrayIsArray$1$4}=Array;const{stringify:JSONStrinify$3}=JSON;function createLink$4(ref){return {__ref:ref};}function validate$8(obj,path='NavigationMenuItemRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$1$4(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_actionType=obj.actionType;const path_actionType=path+'.actionType';if(typeof obj_actionType!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_actionType+'" (at "'+path_actionType+'")');}const obj_actionValue=obj.actionValue;const path_actionValue=path+'.actionValue';let obj_actionValue_union0=null;const obj_actionValue_union0_error=(()=>{if(typeof obj_actionValue!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_actionValue+'" (at "'+path_actionValue+'")');}})();if(obj_actionValue_union0_error!=null){obj_actionValue_union0=obj_actionValue_union0_error.message;}let obj_actionValue_union1=null;const obj_actionValue_union1_error=(()=>{if(obj_actionValue!==null){return new TypeError('Expected "null" but received "'+typeof obj_actionValue+'" (at "'+path_actionValue+'")');}})();if(obj_actionValue_union1_error!=null){obj_actionValue_union1=obj_actionValue_union1_error.message;}if(obj_actionValue_union0&&obj_actionValue_union1){let message='Object doesn\'t match union (at "'+path_actionValue+'")';message+='\n'+obj_actionValue_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_actionValue_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_imageUrl=obj.imageUrl;const path_imageUrl=path+'.imageUrl';let obj_imageUrl_union0=null;const obj_imageUrl_union0_error=(()=>{if(typeof obj_imageUrl!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_imageUrl+'" (at "'+path_imageUrl+'")');}})();if(obj_imageUrl_union0_error!=null){obj_imageUrl_union0=obj_imageUrl_union0_error.message;}let obj_imageUrl_union1=null;const obj_imageUrl_union1_error=(()=>{if(obj_imageUrl!==null){return new TypeError('Expected "null" but received "'+typeof obj_imageUrl+'" (at "'+path_imageUrl+'")');}})();if(obj_imageUrl_union1_error!=null){obj_imageUrl_union1=obj_imageUrl_union1_error.message;}if(obj_imageUrl_union0&&obj_imageUrl_union1){let message='Object doesn\'t match union (at "'+path_imageUrl+'")';message+='\n'+obj_imageUrl_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_imageUrl_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_label=obj.label;const path_label=path+'.label';if(typeof obj_label!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_label+'" (at "'+path_label+'")');}const obj_subMenu=obj.subMenu;const path_subMenu=path+'.subMenu';if(!ArrayIsArray$1$4(obj_subMenu)){return new TypeError('Expected "array" but received "'+typeof obj_subMenu+'" (at "'+path_subMenu+'")');}for(let i=0;i<obj_subMenu.length;i++){const obj_subMenu_item=obj_subMenu[i];const path_subMenu_item=path_subMenu+'['+i+']';const referenceNavigationMenuItemRepresentationValidationError=validate$8(obj_subMenu_item,path_subMenu_item);if(referenceNavigationMenuItemRepresentationValidationError!==null){let message='Object doesn\'t match NavigationMenuItemRepresentation (at "'+path_subMenu_item+'")\n';message+=referenceNavigationMenuItemRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}const obj_target=obj.target;const path_target=path+'.target';if(typeof obj_target!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_target+'" (at "'+path_target+'")');}})();return v_error===undefined?null:v_error;}function deepFreeze$8(input){const input_subMenu=input.subMenu;for(let i=0;i<input_subMenu.length;i++){const input_subMenu_item=input_subMenu[i];deepFreeze$8(input_subMenu_item);}ObjectFreeze$4(input_subMenu);ObjectFreeze$4(input);}function validate$1$3(obj,path='NavigationMenuItemCollectionRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$1$4(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_menuItems=obj.menuItems;const path_menuItems=path+'.menuItems';if(!ArrayIsArray$1$4(obj_menuItems)){return new TypeError('Expected "array" but received "'+typeof obj_menuItems+'" (at "'+path_menuItems+'")');}for(let i=0;i<obj_menuItems.length;i++){const obj_menuItems_item=obj_menuItems[i];const path_menuItems_item=path_menuItems+'['+i+']';const referenceNavigationMenuItemRepresentationValidationError=validate$8(obj_menuItems_item,path_menuItems_item);if(referenceNavigationMenuItemRepresentationValidationError!==null){let message='Object doesn\'t match NavigationMenuItemRepresentation (at "'+path_menuItems_item+'")\n';message+=referenceNavigationMenuItemRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}})();return v_error===undefined?null:v_error;}function normalize$4(input,existing,path,lds,store,timestamp){return input;}const select$4=function NavigationMenuItemCollectionRepresentationSelect(){return {kind:'Fragment',opaque:true};};function equals$4(existing,incoming){if(JSONStrinify$3(incoming)!==JSONStrinify$3(existing)){return false;}return true;}function deepFreeze$1$4(input){const input_menuItems=input.menuItems;for(let i=0;i<input_menuItems.length;i++){const input_menuItems_item=input_menuItems[i];deepFreeze$8(input_menuItems_item);}ObjectFreeze$4(input_menuItems);ObjectFreeze$4(input);}const ingest$4=function NavigationMenuItemCollectionRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$1$3(input);if(validateError!==null){throw validateError;}}const key=path.fullPath;let incomingRecord=normalize$4(input,store.records[key],{fullPath:key,parent:path.parent});const existingRecord=store.records[key];deepFreeze$1$4(input);if(existingRecord===undefined||equals$4(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}return createLink$4(key);};function getConnectCommunitiesNavigationMenuNavigationMenuItemsByCommunityId(config){const key=keyPrefix$3+'NavigationMenuItemCollectionRepresentation('+'addHomeMenuItem:'+config.queryParams.addHomeMenuItem+','+'includeImageUrl:'+config.queryParams.includeImageUrl+','+'menuItemTypesToSkip:'+config.queryParams.menuItemTypesToSkip+','+'navigationLinkSetDeveloperName:'+config.queryParams.navigationLinkSetDeveloperName+','+'navigationLinkSetId:'+config.queryParams.navigationLinkSetId+','+'publishStatus:'+config.queryParams.publishStatus+','+'communityId:'+config.urlParams.communityId+')';const headers={};return {path:'/services/data/v49.0/connect/communities/'+config.urlParams.communityId+'/navigation-menu/navigation-menu-items',method:'get',body:null,urlParams:config.urlParams,queryParams:config.queryParams,key:key,ingest:ingest$4,headers};}const getCommunityNavigationMenu_ConfigPropertyNames={displayName:'getCommunityNavigationMenu',parameters:{required:['communityId'],optional:['addHomeMenuItem','includeImageUrl','menuItemTypesToSkip','navigationLinkSetDeveloperName','navigationLinkSetId','publishStatus']}};function typeCheckConfig$4(untrustedConfig){const config={};const untrustedConfig_communityId=untrustedConfig.communityId;if(typeof untrustedConfig_communityId==='string'){config.communityId=untrustedConfig_communityId;}const untrustedConfig_addHomeMenuItem=untrustedConfig.addHomeMenuItem;if(typeof untrustedConfig_addHomeMenuItem==='boolean'){config.addHomeMenuItem=untrustedConfig_addHomeMenuItem;}const untrustedConfig_includeImageUrl=untrustedConfig.includeImageUrl;if(typeof untrustedConfig_includeImageUrl==='boolean'){config.includeImageUrl=untrustedConfig_includeImageUrl;}const untrustedConfig_menuItemTypesToSkip=untrustedConfig.menuItemTypesToSkip;if(ArrayIsArray$5(untrustedConfig_menuItemTypesToSkip)){const untrustedConfig_menuItemTypesToSkip_array=[];for(let i=0,arrayLength=untrustedConfig_menuItemTypesToSkip.length;i<arrayLength;i++){const untrustedConfig_menuItemTypesToSkip_item=untrustedConfig_menuItemTypesToSkip[i];if(typeof untrustedConfig_menuItemTypesToSkip_item==='string'){untrustedConfig_menuItemTypesToSkip_array.push(untrustedConfig_menuItemTypesToSkip_item);}}config.menuItemTypesToSkip=untrustedConfig_menuItemTypesToSkip_array;}const untrustedConfig_navigationLinkSetDeveloperName=untrustedConfig.navigationLinkSetDeveloperName;if(typeof untrustedConfig_navigationLinkSetDeveloperName==='string'){config.navigationLinkSetDeveloperName=untrustedConfig_navigationLinkSetDeveloperName;}const untrustedConfig_navigationLinkSetId=untrustedConfig.navigationLinkSetId;if(typeof untrustedConfig_navigationLinkSetId==='string'){config.navigationLinkSetId=untrustedConfig_navigationLinkSetId;}const untrustedConfig_publishStatus=untrustedConfig.publishStatus;if(typeof untrustedConfig_publishStatus==='string'){config.publishStatus=untrustedConfig_publishStatus;}return config;}function validateAdapterConfig$4(untrustedConfig,configPropertyNames){if(!untrustedIsObject$4(untrustedConfig)){return null;}{validateConfig$3(untrustedConfig,configPropertyNames);}const config=typeCheckConfig$4(untrustedConfig);if(!areRequiredParametersPresent$3(config,configPropertyNames)){return null;}return config;}function buildInMemorySnapshot$4(lds,config){const request=getConnectCommunitiesNavigationMenuNavigationMenuItemsByCommunityId({urlParams:{communityId:config.communityId},queryParams:{addHomeMenuItem:config.addHomeMenuItem,includeImageUrl:config.includeImageUrl,menuItemTypesToSkip:config.menuItemTypesToSkip,navigationLinkSetDeveloperName:config.navigationLinkSetDeveloperName,navigationLinkSetId:config.navigationLinkSetId,publishStatus:config.publishStatus}});const selector={recordId:request.key,node:select$4(),variables:{}};return lds.storeLookup(selector);}function buildNetworkSnapshot$4(lds,config,override){const request=getConnectCommunitiesNavigationMenuNavigationMenuItemsByCommunityId({urlParams:{communityId:config.communityId},queryParams:{addHomeMenuItem:config.addHomeMenuItem,includeImageUrl:config.includeImageUrl,menuItemTypesToSkip:config.menuItemTypesToSkip,navigationLinkSetDeveloperName:config.navigationLinkSetDeveloperName,navigationLinkSetId:config.navigationLinkSetId,publishStatus:config.publishStatus}});return lds.dispatchResourceRequest(request,override).then(response=>{const{body}=response;lds.storeIngest(request.key,request,body);lds.storeBroadcast();return buildInMemorySnapshot$4(lds,config);},error=>{lds.storeIngestFetchResponse(request.key,error);lds.storeBroadcast();return lds.errorSnapshot(error);});}const getCommunityNavigationMenuAdapterFactory=lds=>{return refreshable$4(// Create snapshot either via a cache hit or via the network
    function getCommunityNavigationMenu(untrustedConfig){const config=validateAdapterConfig$4(untrustedConfig,getCommunityNavigationMenu_ConfigPropertyNames);// Invalid or incomplete config
    if(config===null){return null;}const cacheSnapshot=buildInMemorySnapshot$4(lds,config);// Cache Hit
    if(cacheSnapshot.state===SNAPSHOT_STATE_FULFILLED$3){return cacheSnapshot;}return buildNetworkSnapshot$4(lds,config);},// Refresh snapshot
    // TODO W-6900511 - This currently passes the untrusted config
    // because we don't have a way to pass the validated config back to LDS
    untrustedConfig=>{const config=validateAdapterConfig$4(untrustedConfig,getCommunityNavigationMenu_ConfigPropertyNames);// This should never happen
    if(config===null){throw new Error('Invalid config passed to "getCommunityNavigationMenu" refresh function');}return buildNetworkSnapshot$4(lds,config,{headers:{'Cache-Control':'no-cache'}});});};const{assign,create:create$1,freeze:freeze$2,keys:keys$3}=Object;const{hasOwnProperty:hasOwnProperty$1}=Object.prototype;const{split,endsWith}=String.prototype;const{isArray:isArray$3}=Array;const{push:push$1}=Array.prototype;const{parse,stringify:stringify$3}=JSON;function deepFreeze$9(value){// No need to freeze primitives
    if(typeof value!=='object'||value===null){return;}if(isArray$3(value)){for(let i=0,len=value.length;i<len;i+=1){deepFreeze$9(value[i]);}}else {const keys$1=keys$3(value);for(let i=0,len=keys$1.length;i<len;i+=1){deepFreeze$9(value[keys$1[i]]);}}freeze$2(value);}const MAX_RECORD_DEPTH=5;const FIELD_SEPARATOR='.';const API_NAME_SELECTION={kind:'Scalar',name:'apiName'};const CHILD_RELATIONSHIP_SELECTION={// We don't support RecordRep.childRelationships because it has a nasty
    // degenerate case of multiple pages of child records
    kind:'Object',name:'childRelationships'};const ID_SELECTION={kind:'Scalar',name:'id'};const LAST_MODIFIED_BY_ID_SELECTION={kind:'Scalar',name:'lastModifiedById'};const LAST_MODIFIED_BY_DATE_SELECTION={kind:'Scalar',name:'lastModifiedDate'};const RECORD_TYPE_ID_SELECTION={kind:'Scalar',name:'recordTypeId'};const RECORD_TYPE_INFO_SELECTION={kind:'Object',name:'recordTypeInfo',nullable:true,selections:[{kind:'Scalar',name:'available'},{kind:'Scalar',name:'defaultRecordTypeMapping'},{kind:'Scalar',name:'master'},{kind:'Scalar',name:'name'},{kind:'Scalar',name:'recordTypeId'}]};const SYSTEM_MODSTAMP_SELECTION={kind:'Scalar',name:'systemModstamp'};const DISPLAY_VALUE_SELECTION={kind:'Scalar',name:'displayValue'};const SCALAR_VALUE_SELECTION={kind:'Scalar',name:'value'};function isSpanningRecord(fieldValue){return fieldValue!==null&&typeof fieldValue==='object';}function insertFieldsIntoTrie(root,fields,optional){for(let i=0,len=fields.length;i<len;i++){const field=fields[i].split(FIELD_SEPARATOR);let current=root;for(let j=1,len=field.length;j<len&&j<=MAX_RECORD_DEPTH+1;j++){const fieldName=field[j];let next=current.children[fieldName];if(next===undefined){// A field is scalar only if it is the last field name in the field.
    const scalar=j===len-1;// LDS restricts the numbers of fields that can be traversed to MAX_RECORD_DEPTH,
    // however we still denormalize fields at MAX_RECORD_DEPTH + 1, only if they are
    // scalar fields.
    if(j<=MAX_RECORD_DEPTH||scalar===true){// We now know that there are children fields, so we can mark the parent
    // as not a scalar
    current.scalar=false;next={name:fieldName,scalar,optional,children:{}};current.children[fieldName]=next;}}current=next;}}}function convertTrieToSelection(fieldDefinition){const fieldsSelection=[];const{children}=fieldDefinition;const childrenKeys=keys$3(children);for(let i=0,len=childrenKeys.length;i<len;i+=1){const childKey=childrenKeys[i];const childFieldDefinition=children[childKey];let fieldValueSelection;if(childFieldDefinition.scalar===true){fieldValueSelection=SCALAR_VALUE_SELECTION;}else {fieldValueSelection={kind:'Link',name:'value',nullable:true,selections:convertTrieToSelection(childFieldDefinition)};}push$1.call(fieldsSelection,{kind:'Link',name:childFieldDefinition.name,required:childFieldDefinition.optional===true?false:undefined,selections:[DISPLAY_VALUE_SELECTION,fieldValueSelection]});}return [API_NAME_SELECTION,CHILD_RELATIONSHIP_SELECTION,ID_SELECTION,LAST_MODIFIED_BY_ID_SELECTION,LAST_MODIFIED_BY_DATE_SELECTION,RECORD_TYPE_ID_SELECTION,RECORD_TYPE_INFO_SELECTION,SYSTEM_MODSTAMP_SELECTION,{kind:'Object',name:'fields',selections:fieldsSelection}];}/**
     * Convert a list of fields and optional fields into RecordRepresentation its equivalent
     * selection.
     */function buildSelectionFromFields(fields,optionalFields=[]){const root={name:'<root>',optional:false,scalar:false,children:{}};insertFieldsIntoTrie(root,fields,false);insertFieldsIntoTrie(root,optionalFields,true);return convertTrieToSelection(root);}/**
     * Convert a RecordRepresentationLike into its equivalent selection.
     */function buildSelectionFromRecord(record){const fieldsSelection=[];const{fields}=record;const fieldNames=keys$3(fields);for(let i=0,len=fieldNames.length;i<len;i++){const fieldName=fieldNames[i];const{value:fieldValue}=fields[fieldName];let fieldValueSelection=SCALAR_VALUE_SELECTION;if(isSpanningRecord(fieldValue)){fieldValueSelection={kind:'Link',name:'value',nullable:true,selections:buildSelectionFromRecord(fieldValue)};}push$1.call(fieldsSelection,{kind:'Link',name:fieldName,required:undefined,selections:[DISPLAY_VALUE_SELECTION,fieldValueSelection]});}return [API_NAME_SELECTION,CHILD_RELATIONSHIP_SELECTION,ID_SELECTION,LAST_MODIFIED_BY_ID_SELECTION,LAST_MODIFIED_BY_DATE_SELECTION,RECORD_TYPE_ID_SELECTION,RECORD_TYPE_INFO_SELECTION,SYSTEM_MODSTAMP_SELECTION,{kind:'Object',name:'fields',selections:fieldsSelection}];}function extractRecordFieldsRecursively(record){const fields=[];const fieldNames=keys$3(record.fields);for(let i=0,len=fieldNames.length;i<len;i++){const fieldName=fieldNames[i];const{value:fieldValue}=record.fields[fieldName];if(isSpanningRecord(fieldValue)){const spanningRecordFields=extractRecordFieldsRecursively(fieldValue);for(let j=0,len=spanningRecordFields.length;j<len;j++){spanningRecordFields[j]=`${fieldName}.${spanningRecordFields[j]}`;}push$1.apply(fields,spanningRecordFields);}else {push$1.call(fields,fieldName);}}return fields;}/**
     * Returns a list of fields for a RecordRepresentationLike.
     *
     * TODO W-6900271 - Remove this function once getRelatedList don't depend on it anymore. Always prefer
     * generating a selection out of a record, than convert a record to a field list and back to a
     * selection.
     */function extractRecordFields(record){const{apiName}=record;const fields=extractRecordFieldsRecursively(record);for(let i=0,len=fields.length;i<len;i++){fields[i]=`${apiName}.${fields[i]}`;}return fields;}const{freeze:ObjectFreeze$5,keys:ObjectKeys$5}=Object;const{isArray:ArrayIsArray$6}=Array;const{stringify:JSONStrinify$4}=JSON;function equalsArray(a,b,equalsItem){const aLength=a.length;const bLength=b.length;if(aLength!==bLength){return false;}for(let i=0;i<aLength;i++){if(equalsItem(a[i],b[i])===false){return false;}}return true;}function equalsObject(a,b,equalsProp){const aKeys=ObjectKeys$5(a).sort();const bKeys=ObjectKeys$5(b).sort();const aKeysLength=aKeys.length;const bKeysLength=bKeys.length;if(aKeysLength!==bKeysLength){return false;}for(let i=0;i<aKeys.length;i++){const key=aKeys[i];if(key!==bKeys[i]){return false;}if(equalsProp(a[key],b[key])===false){return false;}}return true;}function createLink$5(ref){return {__ref:ref};}function validate$9(obj,path='RecordTypeInfoRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_available=obj.available;const path_available=path+'.available';if(typeof obj_available!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_available+'" (at "'+path_available+'")');}const obj_defaultRecordTypeMapping=obj.defaultRecordTypeMapping;const path_defaultRecordTypeMapping=path+'.defaultRecordTypeMapping';if(typeof obj_defaultRecordTypeMapping!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_defaultRecordTypeMapping+'" (at "'+path_defaultRecordTypeMapping+'")');}const obj_master=obj.master;const path_master=path+'.master';if(typeof obj_master!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_master+'" (at "'+path_master+'")');}const obj_name=obj.name;const path_name=path+'.name';if(typeof obj_name!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_name+'" (at "'+path_name+'")');}const obj_recordTypeId=obj.recordTypeId;const path_recordTypeId=path+'.recordTypeId';if(typeof obj_recordTypeId!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_recordTypeId+'" (at "'+path_recordTypeId+'")');}})();return v_error===undefined?null:v_error;}function equals$5(existing,incoming){const existing_available=existing.available;const incoming_available=incoming.available;if(!(existing_available===incoming_available)){return false;}const existing_defaultRecordTypeMapping=existing.defaultRecordTypeMapping;const incoming_defaultRecordTypeMapping=incoming.defaultRecordTypeMapping;if(!(existing_defaultRecordTypeMapping===incoming_defaultRecordTypeMapping)){return false;}const existing_master=existing.master;const incoming_master=incoming.master;if(!(existing_master===incoming_master)){return false;}const existing_name=existing.name;const incoming_name=incoming.name;if(!(existing_name===incoming_name)){return false;}const existing_recordTypeId=existing.recordTypeId;const incoming_recordTypeId=incoming.recordTypeId;if(!(existing_recordTypeId===incoming_recordTypeId)){return false;}return true;}function deepFreeze$1$5(input){ObjectFreeze$5(input);}function validate$1$4(obj,path='RecordCollectionRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_count=obj.count;const path_count=path+'.count';if(typeof obj_count!=='number'||typeof obj_count==='number'&&Math.floor(obj_count)!==obj_count){return new TypeError('Expected "integer" but received "'+typeof obj_count+'" (at "'+path_count+'")');}const obj_currentPageToken=obj.currentPageToken;const path_currentPageToken=path+'.currentPageToken';let obj_currentPageToken_union0=null;const obj_currentPageToken_union0_error=(()=>{if(typeof obj_currentPageToken!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_currentPageToken+'" (at "'+path_currentPageToken+'")');}})();if(obj_currentPageToken_union0_error!=null){obj_currentPageToken_union0=obj_currentPageToken_union0_error.message;}let obj_currentPageToken_union1=null;const obj_currentPageToken_union1_error=(()=>{if(obj_currentPageToken!==null){return new TypeError('Expected "null" but received "'+typeof obj_currentPageToken+'" (at "'+path_currentPageToken+'")');}})();if(obj_currentPageToken_union1_error!=null){obj_currentPageToken_union1=obj_currentPageToken_union1_error.message;}if(obj_currentPageToken_union0&&obj_currentPageToken_union1){let message='Object doesn\'t match union (at "'+path_currentPageToken+'")';message+='\n'+obj_currentPageToken_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_currentPageToken_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_currentPageUrl=obj.currentPageUrl;const path_currentPageUrl=path+'.currentPageUrl';if(typeof obj_currentPageUrl!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_currentPageUrl+'" (at "'+path_currentPageUrl+'")');}const obj_nextPageToken=obj.nextPageToken;const path_nextPageToken=path+'.nextPageToken';let obj_nextPageToken_union0=null;const obj_nextPageToken_union0_error=(()=>{if(typeof obj_nextPageToken!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_nextPageToken+'" (at "'+path_nextPageToken+'")');}})();if(obj_nextPageToken_union0_error!=null){obj_nextPageToken_union0=obj_nextPageToken_union0_error.message;}let obj_nextPageToken_union1=null;const obj_nextPageToken_union1_error=(()=>{if(obj_nextPageToken!==null){return new TypeError('Expected "null" but received "'+typeof obj_nextPageToken+'" (at "'+path_nextPageToken+'")');}})();if(obj_nextPageToken_union1_error!=null){obj_nextPageToken_union1=obj_nextPageToken_union1_error.message;}if(obj_nextPageToken_union0&&obj_nextPageToken_union1){let message='Object doesn\'t match union (at "'+path_nextPageToken+'")';message+='\n'+obj_nextPageToken_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_nextPageToken_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_nextPageUrl=obj.nextPageUrl;const path_nextPageUrl=path+'.nextPageUrl';let obj_nextPageUrl_union0=null;const obj_nextPageUrl_union0_error=(()=>{if(typeof obj_nextPageUrl!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_nextPageUrl+'" (at "'+path_nextPageUrl+'")');}})();if(obj_nextPageUrl_union0_error!=null){obj_nextPageUrl_union0=obj_nextPageUrl_union0_error.message;}let obj_nextPageUrl_union1=null;const obj_nextPageUrl_union1_error=(()=>{if(obj_nextPageUrl!==null){return new TypeError('Expected "null" but received "'+typeof obj_nextPageUrl+'" (at "'+path_nextPageUrl+'")');}})();if(obj_nextPageUrl_union1_error!=null){obj_nextPageUrl_union1=obj_nextPageUrl_union1_error.message;}if(obj_nextPageUrl_union0&&obj_nextPageUrl_union1){let message='Object doesn\'t match union (at "'+path_nextPageUrl+'")';message+='\n'+obj_nextPageUrl_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_nextPageUrl_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_previousPageToken=obj.previousPageToken;const path_previousPageToken=path+'.previousPageToken';let obj_previousPageToken_union0=null;const obj_previousPageToken_union0_error=(()=>{if(typeof obj_previousPageToken!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_previousPageToken+'" (at "'+path_previousPageToken+'")');}})();if(obj_previousPageToken_union0_error!=null){obj_previousPageToken_union0=obj_previousPageToken_union0_error.message;}let obj_previousPageToken_union1=null;const obj_previousPageToken_union1_error=(()=>{if(obj_previousPageToken!==null){return new TypeError('Expected "null" but received "'+typeof obj_previousPageToken+'" (at "'+path_previousPageToken+'")');}})();if(obj_previousPageToken_union1_error!=null){obj_previousPageToken_union1=obj_previousPageToken_union1_error.message;}if(obj_previousPageToken_union0&&obj_previousPageToken_union1){let message='Object doesn\'t match union (at "'+path_previousPageToken+'")';message+='\n'+obj_previousPageToken_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_previousPageToken_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_previousPageUrl=obj.previousPageUrl;const path_previousPageUrl=path+'.previousPageUrl';let obj_previousPageUrl_union0=null;const obj_previousPageUrl_union0_error=(()=>{if(typeof obj_previousPageUrl!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_previousPageUrl+'" (at "'+path_previousPageUrl+'")');}})();if(obj_previousPageUrl_union0_error!=null){obj_previousPageUrl_union0=obj_previousPageUrl_union0_error.message;}let obj_previousPageUrl_union1=null;const obj_previousPageUrl_union1_error=(()=>{if(obj_previousPageUrl!==null){return new TypeError('Expected "null" but received "'+typeof obj_previousPageUrl+'" (at "'+path_previousPageUrl+'")');}})();if(obj_previousPageUrl_union1_error!=null){obj_previousPageUrl_union1=obj_previousPageUrl_union1_error.message;}if(obj_previousPageUrl_union0&&obj_previousPageUrl_union1){let message='Object doesn\'t match union (at "'+path_previousPageUrl+'")';message+='\n'+obj_previousPageUrl_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_previousPageUrl_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_records=obj.records;const path_records=path+'.records';if(!ArrayIsArray$6(obj_records)){return new TypeError('Expected "array" but received "'+typeof obj_records+'" (at "'+path_records+'")');}for(let i=0;i<obj_records.length;i++){const obj_records_item=obj_records[i];const path_records_item=path_records+'['+i+']';if(typeof obj_records_item!=='object'){return new TypeError('Expected "object" but received "'+typeof obj_records_item+'" (at "'+path_records_item+'")');}}})();return v_error===undefined?null:v_error;}function normalize$5(input,existing,path,lds,store,timestamp){const input_records=input.records;const input_records_id=path.fullPath+'__records';for(let i=0;i<input_records.length;i++){const input_records_item=input_records[i];let input_records_item_id=input_records_id+'__'+i;input_records[i]=ingest$2$1(input_records_item,{fullPath:input_records_item_id,parent:{data:input,key:path.fullPath,existing:existing}},lds,store,timestamp);}return input;}function equals$1$1(existing,incoming){const existing_count=existing.count;const incoming_count=incoming.count;if(!(existing_count===incoming_count)){return false;}const existing_currentPageUrl=existing.currentPageUrl;const incoming_currentPageUrl=incoming.currentPageUrl;if(!(existing_currentPageUrl===incoming_currentPageUrl)){return false;}const existing_currentPageToken=existing.currentPageToken;const incoming_currentPageToken=incoming.currentPageToken;if(!(existing_currentPageToken===incoming_currentPageToken)){return false;}const existing_nextPageToken=existing.nextPageToken;const incoming_nextPageToken=incoming.nextPageToken;if(!(existing_nextPageToken===incoming_nextPageToken)){return false;}const existing_nextPageUrl=existing.nextPageUrl;const incoming_nextPageUrl=incoming.nextPageUrl;if(!(existing_nextPageUrl===incoming_nextPageUrl)){return false;}const existing_previousPageToken=existing.previousPageToken;const incoming_previousPageToken=incoming.previousPageToken;if(!(existing_previousPageToken===incoming_previousPageToken)){return false;}const existing_previousPageUrl=existing.previousPageUrl;const incoming_previousPageUrl=incoming.previousPageUrl;if(!(existing_previousPageUrl===incoming_previousPageUrl)){return false;}const existing_records=existing.records;const incoming_records=incoming.records;const equals_records_items=equalsArray(existing_records,incoming_records,(existing_records_item,incoming_records_item)=>{if(!(existing_records_item.__ref===incoming_records_item.__ref)){return false;}});if(equals_records_items===false){return false;}return true;}const ingest$5=function RecordCollectionRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$1$4(input);if(validateError!==null){throw validateError;}}const key=path.fullPath;let incomingRecord=normalize$5(input,store.records[key],{fullPath:key,parent:path.parent},lds,store,timestamp);const existingRecord=store.records[key];if(existingRecord===undefined||equals$1$1(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}store.setExpiration(key,timestamp+120000);return createLink$5(key);};function merge(existing,incoming,_lds,path){if(existing===undefined){return incoming;}// TODO: (W-7164913) remove once UISDK is done with a long term fix.
    // Temporary fix for the issue that non-null displayValue gets replaced by null.
    // If displayValue and value are both null, it means the field is empty.
    if(incoming.displayValue===null&&incoming.value!==null&&existing.displayValue!==null){incoming.displayValue=existing.displayValue;}const{value}=incoming;if(value===null||value.__ref===undefined){// Parent will never be null this field only exists in the context of a RecordRep.
    const parent=path.parent;// It may happen that a parent.exists is null, this is the case when the same field is
    // ingested multiple times in the same ingestion cycle. For example: when the same record
    // is present multiple time in the ingested payload.
    if(parent.existing===undefined){return incoming;}const existingVersion=parent.existing.weakEtag;const incomingVersion=parent.data.weakEtag;if(existingVersion>incomingVersion){return existing;}}return incoming;}function validate$2$3(obj,path='FieldValueRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_displayValue=obj.displayValue;const path_displayValue=path+'.displayValue';let obj_displayValue_union0=null;const obj_displayValue_union0_error=(()=>{if(typeof obj_displayValue!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_displayValue+'" (at "'+path_displayValue+'")');}})();if(obj_displayValue_union0_error!=null){obj_displayValue_union0=obj_displayValue_union0_error.message;}let obj_displayValue_union1=null;const obj_displayValue_union1_error=(()=>{if(obj_displayValue!==null){return new TypeError('Expected "null" but received "'+typeof obj_displayValue+'" (at "'+path_displayValue+'")');}})();if(obj_displayValue_union1_error!=null){obj_displayValue_union1=obj_displayValue_union1_error.message;}if(obj_displayValue_union0&&obj_displayValue_union1){let message='Object doesn\'t match union (at "'+path_displayValue+'")';message+='\n'+obj_displayValue_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_displayValue_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_value=obj.value;const path_value=path+'.value';let obj_value_union0=null;const obj_value_union0_error=(()=>{if(obj_value!==null){return new TypeError('Expected "null" but received "'+typeof obj_value+'" (at "'+path_value+'")');}})();if(obj_value_union0_error!=null){obj_value_union0=obj_value_union0_error.message;}let obj_value_union1=null;const obj_value_union1_error=(()=>{if(typeof obj_value!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_value+'" (at "'+path_value+'")');}})();if(obj_value_union1_error!=null){obj_value_union1=obj_value_union1_error.message;}let obj_value_union2=null;const obj_value_union2_error=(()=>{if(typeof obj_value!=='number'){return new TypeError('Expected "number" but received "'+typeof obj_value+'" (at "'+path_value+'")');}})();if(obj_value_union2_error!=null){obj_value_union2=obj_value_union2_error.message;}let obj_value_union3=null;const obj_value_union3_error=(()=>{if(typeof obj_value!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_value+'" (at "'+path_value+'")');}})();if(obj_value_union3_error!=null){obj_value_union3=obj_value_union3_error.message;}let obj_value_union4=null;const obj_value_union4_error=(()=>{if(typeof obj_value!=='object'){return new TypeError('Expected "object" but received "'+typeof obj_value+'" (at "'+path_value+'")');}})();if(obj_value_union4_error!=null){obj_value_union4=obj_value_union4_error.message;}if(obj_value_union0&&obj_value_union1&&obj_value_union2&&obj_value_union3&&obj_value_union4){let message='Object doesn\'t match union (at "'+path_value+'")';message+='\n'+obj_value_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_value_union1.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_value_union2.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_value_union3.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_value_union4.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}})();return v_error===undefined?null:v_error;}function normalize$1$1(input,existing,path,lds,store,timestamp){const input_value=input.value;const input_value_id=path.fullPath+'__value';if(input_value!==null&&typeof input_value==='object'){input.value=ingest$2$1(input_value,{fullPath:input_value_id,parent:{data:input,key:path.fullPath,existing:existing}},lds,store,timestamp);}return input;}function equals$2$1(existing,incoming){const existing_displayValue=existing.displayValue;const incoming_displayValue=incoming.displayValue;if(!(existing_displayValue===incoming_displayValue)){return false;}const existing_value=existing.value;const incoming_value=incoming.value;if(!(existing_value===incoming_value||existing_value!=null&&incoming_value!=null&&existing_value.__ref!=null&&incoming_value.__ref!=null&&existing_value.__ref===incoming_value.__ref)){return false;}return true;}const ingest$1$1=function FieldValueRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$2$3(input);if(validateError!==null){throw validateError;}}const key=path.fullPath;let incomingRecord=normalize$1$1(input,store.records[key],{fullPath:key,parent:path.parent},lds,store,timestamp);const existingRecord=store.records[key];incomingRecord=merge(existingRecord,incomingRecord,lds,path);if(existingRecord===undefined||equals$2$1(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}return createLink$5(key);};const{hasOwnProperty:ObjectPrototypeHasOwnProperty$4}=Object.prototype;const{keys:ObjectKeys$1$5}=Object;const{isArray:ArrayIsArray$1$5}=Array;function isPromise$6(value){return value.then!==undefined;}/**
     * Validates an adapter config is well-formed.
     * @param config The config to validate.
     * @param adapter The adapter validation configuration.
     * @param oneOf The keys the config must contain at least one of.
     * @throws A TypeError if config doesn't satisfy the adapter's config validation.
     */function validateConfig$4(config,adapter,oneOf){const{displayName}=adapter;const{required,optional,unsupported}=adapter.parameters;if(config===undefined||required.every(req=>ObjectPrototypeHasOwnProperty$4.call(config,req))===false){throw new TypeError(`adapter ${displayName} configuration must specify ${required.sort().join(', ')}`);}if(oneOf&&oneOf.some(req=>ObjectPrototypeHasOwnProperty$4.call(config,req))===false){throw new TypeError(`adapter ${displayName} configuration must specify one of ${oneOf.sort().join(', ')}`);}if(unsupported!==undefined&&unsupported.some(req=>ObjectPrototypeHasOwnProperty$4.call(config,req))){throw new TypeError(`adapter ${displayName} does not yet support ${unsupported.sort().join(', ')}`);}const supported=required.concat(optional);if(ObjectKeys$1$5(config).some(key=>!supported.includes(key))){throw new TypeError(`adapter ${displayName} configuration supports only ${supported.sort().join(', ')}`);}}function untrustedIsObject$5(untrusted){return typeof untrusted==='object'&&untrusted!==null&&ArrayIsArray$1$5(untrusted)===false;}function areRequiredParametersPresent$4(config,configPropertyNames){return configPropertyNames.parameters.required.every(req=>req in config);}function refreshable$5(adapter,resolve){return config=>{const result=adapter(config);if(result===null){return result;}if(isPromise$6(result)){return result.then(snapshot=>{snapshot.refresh={config,resolve};return snapshot;});}result.refresh={config,resolve};return result;};}const SNAPSHOT_STATE_FULFILLED$4='Fulfilled';const keyPrefix$4='UiApi::';const VIEW_ENTITY_API_NAME='Name';const VIEW_ENTITY_KEY_PREFIX=`${keyPrefix$4}RecordViewEntityRepresentation:${VIEW_ENTITY_API_NAME}:`;function polymorph(input){const{apiName,id}=input;if(apiName===VIEW_ENTITY_API_NAME){return VIEW_ENTITY_KEY_PREFIX+id;}return keyBuilder({recordId:id});}function isString(value){return typeof value==='string';}/**
     * @param value The array to inspect.
     * @returns True if the array is non-empty and contains only non-empty strings.
     */function isArrayOfNonEmptyStrings(value){if(value.length===0){return false;}return value.every(v=>isString(v)&&v.trim().length>0);}/**
     * @param value The array to dedupe
     * @returns An array without duplicates.
     */function dedupe(value){const result={};for(let i=0,len=value.length;i<len;i+=1){result[value[i]]=true;}return keys$3(result);}/**
     * @param source The array of string to filter
     * @param compare The array to filter against
     * @returns An array with values from source that do not exist in compare
     * If the "compare" array is empty, "source" array itself is returned, not a shallow copy
     */function difference(source,compare){const{length:sourceLength}=source;const{length:compareLength}=compare;if(sourceLength===0||source===compare){return [];}if(compareLength===0){return source;}// Put all the values from "compare" into a map
    // This should be faster than doing an indexOf for every string in source
    const map={};for(let i=0;i<compareLength;i+=1){map[compare[i]]=true;}const strings=[];for(let i=0;i<sourceLength;i+=1){const string=source[i];if(map[string]===undefined){strings.push(string);}}return strings;}function isFieldId(unknown){if(typeof unknown!=='object'||unknown===null){return false;}const value=unknown;return isString(value.objectApiName)&&isString(value.fieldApiName);}function stringToFieldId(fieldApiName){const split=fieldApiName.split('.');{if(split.length===1){// object api name must non-empty
    throw new TypeError('Value does not include an object API name.');}}return {objectApiName:split[0],fieldApiName:split[1]};}function getFieldId(value){if(isFieldId(value)){return value;}return stringToFieldId(value);}/**
     * Returns the field API name, qualified with an object name if possible.
     * @param value The value from which to get the qualified field API name.
     * @return The qualified field API name.
     */function getFieldApiName(value){// Note: tightening validation logic changes behavior from userland getting
    // a server-provided error to the adapter noop'ing. In 224 we decided to not
    // change the behavior.
    if(isString(value)){const trimmed=value.trim();if(trimmed.length>0){return trimmed;}}else if(isFieldId(value)){return value.objectApiName+'.'+value.fieldApiName;}return undefined;}/**
     * The master record type id.
     */const MASTER_RECORD_TYPE_ID='012000000000000AAA';function isGraphNode(node){return node!==null&&node.type==='Node';}function extractTrackedFields(node,parentFieldName,fieldsList=[],visitedRecordIds={},depth=0){// Filter Error and null nodes
    if(!isGraphNode(node)||depth>MAX_RECORD_DEPTH){return [];}const recordId=node.data.id;// Stop the traversal if the key has already been visited, since the fields for this record
    // have already been gathered at this point.
    if(hasOwnProperty$1.call(visitedRecordIds,recordId)){return fieldsList;}// The visitedRecordIds object passed to the spanning record is a copy of the original
    // visitedRecordIds + the current record id, since we want to detect circular references within
    // a given path.
    let spanningVisitedRecordIds=_objectSpread$2({},visitedRecordIds,{[recordId]:true});const fields=node.object('fields');const keys=fields.keys();for(let i=0,len=keys.length;i<len;i+=1){const key=keys[i];const fieldValueRep=fields.link(key);const fieldName=`${parentFieldName}.${key}`;if(fieldValueRep.isMissing()){push$1.call(fieldsList,fieldName);continue;}const field=fieldValueRep.follow();// Filter Error and null nodes
    if(!isGraphNode(field)){continue;}if(field.isScalar('value')===false){const spanning=field.link('value').follow();extractTrackedFields(spanning,fieldName,fieldsList,spanningVisitedRecordIds,depth+1);}else {const state=fieldValueRep.linkData();if(state!==undefined){const{fields}=state;for(let s=0,len=fields.length;s<len;s+=1){const childFieldName=fields[s];push$1.call(fieldsList,`${fieldName}.${childFieldName}`);}}else {push$1.call(fieldsList,fieldName);}}}return fieldsList;}function getTrackedFields(lds,recordId,fieldsFromConfig){const key=keyBuilder({recordId});const fieldsList=fieldsFromConfig===undefined?[]:[...fieldsFromConfig];const graphNode=lds.getNode(key);if(!isGraphNode(graphNode)){return fieldsList;}const fileName=graphNode.scalar('apiName');const fields=extractTrackedFields(graphNode,fileName,fieldsList);return dedupe(fields).sort();}function getRecordTypeId(record){return record.recordTypeId===null?MASTER_RECORD_TYPE_ID:record.recordTypeId;}// This function traverses through a record and marks missing
    // optional fields as "missing"
    function markMissingOptionalFields(record,optionalFields){if(!isGraphNode(record)){return;}const apiName=record.scalar('apiName');for(let a=0,aLen=optionalFields.length;a<aLen;a++){const parts=optionalFields[a].split('.');if(parts[0]===apiName){_markMissingPath(record,parts.slice(1));}}}function markNulledOutPath(record,path){if(!isGraphNode(record)){return;}const fieldValueRepresentation=record.object('fields');const fieldName=path.shift();if(fieldValueRepresentation.isUndefined(fieldName)){return;}const link=fieldValueRepresentation.link(fieldName);const resolved=link.follow();if(isGraphNode(resolved)&&resolved.isScalar('value')&&path.length>0){const linkState=link.linkData();const fields=linkState===undefined?[]:linkState.fields;link.writeLinkData({fields:dedupe([...fields,path.join('.')])});}}function markNulledOutRequiredFields(record,fields){if(!isGraphNode(record)){return;}const apiName=record.scalar('apiName');for(let a=0,aLen=fields.length;a<aLen;a++){const parts=fields[a].split('.');if(parts[0]===apiName){markNulledOutPath(record,parts.slice(1));}}}function _markMissingPath(record,path){// Filter out Error and null nodes
    if(!isGraphNode(record)){return;}const fieldValueRepresentation=record.object('fields');const fieldName=path.shift();if(fieldValueRepresentation.isUndefined(fieldName)===true){// TODO W-6900046 - remove cast, make RecordRepresentationNormalized['fields'] accept
    // an undefined/non-present __ref if isMissing is present
    fieldValueRepresentation.write(fieldName,{__ref:undefined,isMissing:true});return;}const link=fieldValueRepresentation.link(fieldName);if(link.isPending()){// TODO W-6900046 - remove cast, make RecordRepresentationNormalized['fields'] accept
    // an undefined/non-present __ref if isMissing is present
    fieldValueRepresentation.write(fieldName,{__ref:undefined,isMissing:true});}else if(path.length>0&&link.isMissing()===false){const fieldValue=link.follow();// Filter out Error and null nodes
    if(!isGraphNode(fieldValue)){return;}// if value is not a scalar, follow the link and mark it as missing
    if(fieldValue.isScalar('value')===false){_markMissingPath(fieldValue.link('value').follow(),path);}}}const CUSTOM_API_NAME_SUFFIX='__c';/**
     * A set of the string names of known ui-api supported entities.
     * Source: ui-uisdk-connect-impl-object-whitelist.yaml
     */const UIAPI_SUPPORTED_ENTITY_API_NAMES={Account:true,AccountBrand:true,AccountContactRelation:true,AccountForecast:true,AccountForecastPeriodMetric:true,AccountParticipant:true,AccountPartner:true,AccountProductForecast:true,AccountProductPeriodForecast:true,AccountTeamMember:true,AcctMgrPeriodicTargetDstr:true,AcctMgrTarget:true,AcctMgrTargetDstr:true,ActionCadence:true,ActionPlanItem:true,ActionPlanTemplate:true,ActionPlanTemplateItem:true,ActionPlanTemplateItemValue:true,ActionPlanTemplateVersion:true,ActivationTarget:true,Address:true,AssessmentIndDefinedValue:true,AssessmentIndicatorDefinition:true,AssessmentTask:true,AssessmentTaskContentDocument:true,AssessmentTaskOrder:true,Asset:true,AssetRelationship:true,AssetStatePeriod:true,AssignedResource:true,AttachedContentNote:true,AuthorizedInsuranceLine:true,Award:true,BCEntityPermission:true,BCEntityPermissionSet:true,BCFieldPermission:true,BCParticipant:true,BCParticipantAccess:true,BCPermissionSet:true,BCRecordAccess:true,BCRecordAccessApproval:true,BCRelatedParticipant:true,BasicDataRecord:true,BlockchainAppMember:true,BlockchainApplication:true,BlockchainEntity:true,BlockchainField:true,BlockchainMember:true,BusinessLicense:true,BusinessMilestone:true,BusinessProfile:true,Campaign:true,CampaignMember:true,CareBarrier:true,CareBarrierType:true,CarePgmProvHealthcareProvider:true,CareProgram:true,CareProgramEnrollee:true,CareRegisteredDevice:true,Case:true,Claim:true,ClaimCase:true,ClaimItem:true,ClaimParticipant:true,Contact:true,ContactRequest:true,ContentDocument:true,ContentNote:true,ContentVersion:true,ContentWorkspace:true,Contract:true,ContractContactRole:true,ContractLineItem:true,CoverageType:true,CustomerProperty:true,DeleteEvent:true,DigitalSignature:true,DistributorAuthorization:true,ElectronicMediaGroup:true,Employee:true,EmployeeJob:true,EmployeeJobPosition:true,EmployeeOrganization:true,Entitlement:true,EntityArchivingSetup:true,EntityMilestone:true,EnvironmentHubMember:true,Expense:true,FtestZosUiPrototypeChild1:true,FtestZosUiPrototypeChild2:true,FtestZosUiPrototypeParent:true,HealthCareDiagnosis:true,HealthCareProcedure:true,HealthcareProvider:true,IdentityDocument:true,Image:true,Individual:true,InspectionAssessmentInd:true,InsuranceClaimAsset:true,InsurancePolicy:true,InsurancePolicyAsset:true,InsurancePolicyCoverage:true,InsurancePolicyMemberAsset:true,InsurancePolicyParticipant:true,InsuranceProfile:true,JobFamily:true,JobPosition:true,JobProfile:true,KnowledgeArticleVersion:true,Lead:true,LegalEntity:true,LicensingRequest:true,ListEmail:true,Location:true,LoyaltyProgram:true,LoyaltyProgramCurrency:true,LoyaltyProgramMember:true,LoyaltyProgramPartner:true,LoyaltyTier:true,LoyaltyTierGroup:true,MaintenanceAsset:true,MaintenancePlan:true,MaintenanceWorkRule:true,MarketSegment:true,MarketSegmentActivation:true,MarketingAction:true,MarketingResource:true,Note:true,OperatingHours:true,Opportunity:true,OpportunityLineItem:true,OpportunityLineItemSchedule:true,OpportunityPartner:true,OpportunityTeamMember:true,Order:true,OrderItem:true,OrderItemSummaryChange:true,OrderSummary:true,OrgMetric:true,OrgMetricScanResult:true,OrgMetricScanSummary:true,Partner:true,PersonAccount:true,PersonEducation:true,PersonEmployment:true,PersonLifeEvent:true,PriceAdjustmentSchedule:true,Pricebook2:true,PricebookEntry:true,Producer:true,ProducerPolicyAssignment:true,Product2:true,Product2DataTranslation:true,ProductCategoryDataTranslation:true,ProductCategoryMedia:true,ProductCoverage:true,ProductMedia:true,Promotion:true,Quote:true,QuoteDocument:true,QuoteLineItem:true,RecordAction:true,RecordType:true,RecordsetFilterCriteria:true,RecordsetFilterCriteriaRule:true,RegulatoryCode:true,ResourceAbsence:true,ResourcePreference:true,RetailStore:true,RetailVisitKpi:true,ReturnOrder:true,ReturnOrderLineItem:true,SalesAgreement:true,SalesAgreementProduct:true,SalesAgreementProductSchedule:true,SecuritiesHolding:true,ServiceAppointment:true,ServiceContract:true,ServiceCrew:true,ServiceCrewMember:true,ServiceResource:true,ServiceResourceCapacity:true,ServiceResourceSkill:true,ServiceTerritory:true,ServiceTerritoryLocation:true,ServiceTerritoryMember:true,Shift:true,Shipment:true,SkillRequirement:true,SocialPost:true,SurveyInvitation:true,SurveyResponse:true,SurveySubject:true,Tenant:true,TimeSheet:true,TimeSheetEntry:true,TimeSlot:true,UsageEntitlement:true,UsageEntitlementPeriod:true,User:true,Visit:true,VisitedParty:true,Visitor:true,VoiceCall:true,WebStoreSearchProdSettings:true,WorkOrder:true,WorkOrderLineItem:true,WorkType:true,WorkerCompCoverageClass:true};/**
     * Tells you if an objectApiName is supported by UI API or not.
     * Note: LDS does not currently support all the entities, the list is limited to UI API supported entities
     * @param objectApiName the object API name from a record.
     * @return True if the provided objectApiName is supported in UI API.
     */function isSupportedEntity(objectApiName){return UIAPI_SUPPORTED_ENTITY_API_NAMES[objectApiName]===true||endsWith.call(objectApiName,CUSTOM_API_NAME_SUFFIX);}/** Return true if a >= b */function isSuperset(a,b){if(b.length>a.length){return false;}const aMap={};// Put all keys from subset into a map
    // so we don't have to use subset.includes which will be slow
    for(let i=0,len=a.length;i<len;i+=1){aMap[a[i]]=true;}for(let i=0,len=b.length;i<len;i+=1){if(aMap[b[i]]===undefined){return false;}}return true;}function fulfill(existing,incoming){// early out if incoming isn't a request only for fields and optionalFields
    const{queryParams,headers,path}=incoming;const{path:existingPath,headers:existingHeaders}=existing;if(queryParams.layoutTypes!==undefined){return false;}if(existingPath!==path){return false;}const headersKeys=keys$3(headers);const headersKeyLength=headersKeys.length;if(headersKeyLength!==keys$3(existingHeaders).length){return false;}for(let i=0,len=headersKeyLength;i<len;i++){let key=headersKeys[i];if(headers[key]!==existingHeaders[key]){return false;}}// TODO W-6900100 - handle when incoming.fields are only in existing.optionalFields, and
    // existing's response doesn't include those fields. We need to detect this then
    // re-issue the request to get the relevant error response.
    const existingFieldsUnion=unionFields(existing.queryParams.fields,existing.queryParams.optionalFields);const incomingFieldsUnion=unionFields(queryParams.fields,queryParams.optionalFields);return isSuperset(existingFieldsUnion,incomingFieldsUnion);}function unionFields(fields,optionalFields){const fieldsArray=isArray$3(fields)?fields:[];const optionalFieldsArray=isArray$3(optionalFields)?optionalFields:[];return [...fieldsArray,...optionalFieldsArray];}function getUiApiRecordsByRecordId(config){const key=keyBuilder({recordId:config.urlParams.recordId});const headers={};return {path:'/services/data/v49.0/ui-api/records/'+config.urlParams.recordId+'',method:'get',body:null,urlParams:config.urlParams,queryParams:config.queryParams,key:key,ingest:ingest$2$1,headers,fulfill:fulfill};}function isFulfilledSnapshot$1(snapshot){return snapshot.state==='Fulfilled';}function isUnfulfilledSnapshot$1(snapshot){return snapshot.state==='Unfulfilled';}function isErrorSnapshot$1(snapshot){return snapshot.state==='Error';}function buildRecordSelector(recordId,fields,optionalFields){return {recordId:keyBuilder({recordId}),node:{kind:'Fragment',selections:buildSelectionFromFields(fields,optionalFields)},variables:{}};}function buildNetworkSnapshot$5(lds,config){const{recordId,fields}=config;// Should this go into the coersion logic?
    const allTrackedFields=getTrackedFields(lds,recordId,config.optionalFields);const request=getUiApiRecordsByRecordId({urlParams:{recordId},queryParams:{fields,optionalFields:fields===undefined?allTrackedFields:difference(allTrackedFields,fields)}});return lds.dispatchResourceRequest(request).then(response=>{const{body}=response;const fields=config.fields===undefined?[]:config.fields;const optionalFields=config.optionalFields===undefined?[]:config.optionalFields;lds.storeIngest(request.key,request,body);const recordNode=lds.getNode(request.key);markNulledOutRequiredFields(recordNode,[...fields,...optionalFields]);markMissingOptionalFields(recordNode,allTrackedFields);lds.storeBroadcast();return lds.storeLookup(buildRecordSelector(config.recordId,fields,optionalFields));},err=>{lds.storeIngestFetchResponse(request.key,err,TTL);lds.storeBroadcast();return lds.errorSnapshot(err);});}// used by getRecordLayoutType#refresh
    function buildInMemorySnapshot$5(lds,config){const fields=config.fields===undefined?[]:config.fields;const optionalFields=config.optionalFields===undefined?[]:config.optionalFields;const sel=buildRecordSelector(config.recordId,fields,optionalFields);return lds.storeLookup(sel);}function getRecordByFields(lds,config){const snapshot=buildInMemorySnapshot$5(lds,config);if(isFulfilledSnapshot$1(snapshot)||isErrorSnapshot$1(snapshot)){return snapshot;}return buildNetworkSnapshot$5(lds,config);}const INCOMING_WEAKETAG_0_KEY='incoming-weaketag-0';const EXISTING_WEAKETAG_0_KEY='existing-weaketag-0';// This function sets fields that we are refreshing to pending
    // These values will go into the store
    function mergePendingFields(newRecord,oldRecord){// TODO W-6900046 - avoid casting to any by updating
    // RecordRepresentationNormalized['fields'] to include `pending:true` property
    const mergedFields=_objectSpread$2({},newRecord.fields);const merged=_objectSpread$2({},newRecord,{fields:mergedFields});const existingFields=keys$3(oldRecord.fields);for(let i=0,len=existingFields.length;i<len;i+=1){const spanningFieldName=existingFields[i];if(newRecord.fields[spanningFieldName]===undefined){// TODO W-6900046 - fix above casting issue so we're not stuffing arbitrary things
    // into RecordRepresentationNormalized['fields']
    mergedFields[spanningFieldName]={__ref:undefined,pending:true};}}return merged;}// This method gets called
    // when incoming record has a higher version
    // than the record that is currently in the store
    function mergeAndRefreshHigherVersionRecord(lds,incoming,existing,incomingQualifiedApiNames,existingQualifiedApiNames){// If the higher version (incoming) does not contain a superset of fields as existing
    // then we need to refresh to get updated versions of fields in existing
    if(isSuperset(incomingQualifiedApiNames,existingQualifiedApiNames)===false){// If this is an unsupported entity, do NOT attempt to go to the network
    // Simply merge what we have and move on
    if(isSupportedEntity(incoming.apiName)===false){return mergeRecordFields(incoming,existing);}buildNetworkSnapshot$5(lds,{recordId:incoming.id,optionalFields:incomingQualifiedApiNames});// We want to mark fields in the store as pending
    // Because we don't want to emit any data to components
    return mergePendingFields(incoming,existing);}return incoming;}// This method gets called
    // when incoming record has a lower version
    // than the record that is currently in the store
    function mergeAndRefreshLowerVersionRecord(lds,incoming,existing,incomingQualifiedApiNames,existingQualifiedApiNames){// If the higher version (existing) does not have a superset of fields as incoming
    // then we need to refresh to get updated versions of fields on incoming
    if(isSuperset(existingQualifiedApiNames,incomingQualifiedApiNames)===false){// If this is an unsupported entity, do NOT attempt to go to the network
    // Simply merge what we have and move on
    if(isSupportedEntity(incoming.apiName)===false){return mergeRecordFields(existing,incoming);}const merged=mergePendingFields(existing,incoming);buildNetworkSnapshot$5(lds,{recordId:incoming.id,optionalFields:incomingQualifiedApiNames});return merged;}return existing;}function mergeRecordConflict(lds,incoming,existing){const{apiName}=incoming;const incomingNode=lds.wrapNormalizedGraphNode(incoming);const existingNode=lds.wrapNormalizedGraphNode(existing);const incomingQualifiedApiNames=extractTrackedFields(incomingNode,apiName);const existingQualifiedApiNames=extractTrackedFields(existingNode,apiName);if(incoming.weakEtag>existing.weakEtag){return mergeAndRefreshHigherVersionRecord(lds,incoming,existing,incomingQualifiedApiNames,existingQualifiedApiNames);}return mergeAndRefreshLowerVersionRecord(lds,incoming,existing,incomingQualifiedApiNames,existingQualifiedApiNames);}function getNotNull(recordAValue,recordBValue){return recordAValue===null?recordBValue:recordAValue;}function mergeRecordFields(recordA,recordB){const lastModifiedDate=getNotNull(recordA.lastModifiedDate,recordB.lastModifiedDate);const lastModifiedById=getNotNull(recordA.lastModifiedById,recordB.lastModifiedById);const systemModstamp=getNotNull(recordA.systemModstamp,recordB.systemModstamp);return _objectSpread$2({},recordA,{fields:_objectSpread$2({},recordB.fields,recordA.fields),lastModifiedDate,lastModifiedById,systemModstamp});}function isErrorEntry(entry){return entry.__type==='error';}function merge$1(existing,incoming,lds,_path){if(existing===undefined||isErrorEntry(existing)){return incoming;}// recordTypeId may get changed based on record state.
    // Evicts all dependencies from store.
    if(incoming.recordTypeId!==existing.recordTypeId){const recordDepKey=depenpendencyKeyBuilder({recordId:existing.id});const node=lds.getNode(recordDepKey);if(isGraphNode(node)){const dependencies=node.retrieve();if(dependencies!==null){const depKeys=keys$3(dependencies);for(let i=0,len=depKeys.length;i<len;i++){lds.storeEvict(depKeys[i]);}}}}// TODO - handle merging of records that change apiName
    // if (existing.apiName !== incoming.apiName) {
    //     if ("development" === 'production') {
    //         lds.log(`API Name changed from ${existing.apiName} to ${incoming.apiName}`);
    //     } else {
    //         throw new Error('API Name cannot be different for merging records.');
    //     }
    // }
    const incomingWeakEtag=incoming.weakEtag;const existingWeakEtag=existing.weakEtag;if(incomingWeakEtag===0||existingWeakEtag===0){const paramsBuilder=()=>{return {[INCOMING_WEAKETAG_0_KEY]:incomingWeakEtag===0,[EXISTING_WEAKETAG_0_KEY]:existingWeakEtag===0,apiName:incoming.apiName};};lds.instrument(paramsBuilder);}// TODO W-6900085 - UIAPI returns weakEtag=0 when the record is >2 levels nested. For now
    // we treat the record as mergeable.
    if(incomingWeakEtag!==0&&existingWeakEtag!==0&&incomingWeakEtag!==existingWeakEtag){return mergeRecordConflict(lds,incoming,existing);}return mergeRecordFields(incoming,existing);}function depenpendencyKeyBuilder(config){return `UiApi::RecordRepresentationDependency:${config.recordId}`;}const TTL=30000;function validate$3$2(obj,path='RecordRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_apiName=obj.apiName;const path_apiName=path+'.apiName';if(typeof obj_apiName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_apiName+'" (at "'+path_apiName+'")');}const obj_childRelationships=obj.childRelationships;const path_childRelationships=path+'.childRelationships';if(typeof obj_childRelationships!=='object'||ArrayIsArray$6(obj_childRelationships)||obj_childRelationships===null){return new TypeError('Expected "object" but received "'+typeof obj_childRelationships+'" (at "'+path_childRelationships+'")');}const obj_childRelationships_keys=ObjectKeys$5(obj_childRelationships);for(let i=0;i<obj_childRelationships_keys.length;i++){const key=obj_childRelationships_keys[i];const obj_childRelationships_prop=obj_childRelationships[key];const path_childRelationships_prop=path_childRelationships+'["'+key+'"]';if(typeof obj_childRelationships_prop!=='object'){return new TypeError('Expected "object" but received "'+typeof obj_childRelationships_prop+'" (at "'+path_childRelationships_prop+'")');}}const obj_eTag=obj.eTag;const path_eTag=path+'.eTag';if(typeof obj_eTag!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_eTag+'" (at "'+path_eTag+'")');}const obj_fields=obj.fields;const path_fields=path+'.fields';if(typeof obj_fields!=='object'||ArrayIsArray$6(obj_fields)||obj_fields===null){return new TypeError('Expected "object" but received "'+typeof obj_fields+'" (at "'+path_fields+'")');}const obj_fields_keys=ObjectKeys$5(obj_fields);for(let i=0;i<obj_fields_keys.length;i++){const key=obj_fields_keys[i];const obj_fields_prop=obj_fields[key];const path_fields_prop=path_fields+'["'+key+'"]';if(typeof obj_fields_prop!=='object'){return new TypeError('Expected "object" but received "'+typeof obj_fields_prop+'" (at "'+path_fields_prop+'")');}}const obj_id=obj.id;const path_id=path+'.id';if(typeof obj_id!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_id+'" (at "'+path_id+'")');}const obj_lastModifiedById=obj.lastModifiedById;const path_lastModifiedById=path+'.lastModifiedById';let obj_lastModifiedById_union0=null;const obj_lastModifiedById_union0_error=(()=>{if(typeof obj_lastModifiedById!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_lastModifiedById+'" (at "'+path_lastModifiedById+'")');}})();if(obj_lastModifiedById_union0_error!=null){obj_lastModifiedById_union0=obj_lastModifiedById_union0_error.message;}let obj_lastModifiedById_union1=null;const obj_lastModifiedById_union1_error=(()=>{if(obj_lastModifiedById!==null){return new TypeError('Expected "null" but received "'+typeof obj_lastModifiedById+'" (at "'+path_lastModifiedById+'")');}})();if(obj_lastModifiedById_union1_error!=null){obj_lastModifiedById_union1=obj_lastModifiedById_union1_error.message;}if(obj_lastModifiedById_union0&&obj_lastModifiedById_union1){let message='Object doesn\'t match union (at "'+path_lastModifiedById+'")';message+='\n'+obj_lastModifiedById_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_lastModifiedById_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_lastModifiedDate=obj.lastModifiedDate;const path_lastModifiedDate=path+'.lastModifiedDate';let obj_lastModifiedDate_union0=null;const obj_lastModifiedDate_union0_error=(()=>{if(typeof obj_lastModifiedDate!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_lastModifiedDate+'" (at "'+path_lastModifiedDate+'")');}})();if(obj_lastModifiedDate_union0_error!=null){obj_lastModifiedDate_union0=obj_lastModifiedDate_union0_error.message;}let obj_lastModifiedDate_union1=null;const obj_lastModifiedDate_union1_error=(()=>{if(obj_lastModifiedDate!==null){return new TypeError('Expected "null" but received "'+typeof obj_lastModifiedDate+'" (at "'+path_lastModifiedDate+'")');}})();if(obj_lastModifiedDate_union1_error!=null){obj_lastModifiedDate_union1=obj_lastModifiedDate_union1_error.message;}if(obj_lastModifiedDate_union0&&obj_lastModifiedDate_union1){let message='Object doesn\'t match union (at "'+path_lastModifiedDate+'")';message+='\n'+obj_lastModifiedDate_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_lastModifiedDate_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_recordTypeId=obj.recordTypeId;const path_recordTypeId=path+'.recordTypeId';let obj_recordTypeId_union0=null;const obj_recordTypeId_union0_error=(()=>{if(typeof obj_recordTypeId!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_recordTypeId+'" (at "'+path_recordTypeId+'")');}})();if(obj_recordTypeId_union0_error!=null){obj_recordTypeId_union0=obj_recordTypeId_union0_error.message;}let obj_recordTypeId_union1=null;const obj_recordTypeId_union1_error=(()=>{if(obj_recordTypeId!==null){return new TypeError('Expected "null" but received "'+typeof obj_recordTypeId+'" (at "'+path_recordTypeId+'")');}})();if(obj_recordTypeId_union1_error!=null){obj_recordTypeId_union1=obj_recordTypeId_union1_error.message;}if(obj_recordTypeId_union0&&obj_recordTypeId_union1){let message='Object doesn\'t match union (at "'+path_recordTypeId+'")';message+='\n'+obj_recordTypeId_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_recordTypeId_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_recordTypeInfo=obj.recordTypeInfo;const path_recordTypeInfo=path+'.recordTypeInfo';let obj_recordTypeInfo_union0=null;const obj_recordTypeInfo_union0_error=(()=>{const referenceRecordTypeInfoRepresentationValidationError=validate$9(obj_recordTypeInfo,path_recordTypeInfo);if(referenceRecordTypeInfoRepresentationValidationError!==null){let message='Object doesn\'t match RecordTypeInfoRepresentation (at "'+path_recordTypeInfo+'")\n';message+=referenceRecordTypeInfoRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}})();if(obj_recordTypeInfo_union0_error!=null){obj_recordTypeInfo_union0=obj_recordTypeInfo_union0_error.message;}let obj_recordTypeInfo_union1=null;const obj_recordTypeInfo_union1_error=(()=>{if(obj_recordTypeInfo!==null){return new TypeError('Expected "null" but received "'+typeof obj_recordTypeInfo+'" (at "'+path_recordTypeInfo+'")');}})();if(obj_recordTypeInfo_union1_error!=null){obj_recordTypeInfo_union1=obj_recordTypeInfo_union1_error.message;}if(obj_recordTypeInfo_union0&&obj_recordTypeInfo_union1){let message='Object doesn\'t match union (at "'+path_recordTypeInfo+'")';message+='\n'+obj_recordTypeInfo_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_recordTypeInfo_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_systemModstamp=obj.systemModstamp;const path_systemModstamp=path+'.systemModstamp';let obj_systemModstamp_union0=null;const obj_systemModstamp_union0_error=(()=>{if(typeof obj_systemModstamp!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_systemModstamp+'" (at "'+path_systemModstamp+'")');}})();if(obj_systemModstamp_union0_error!=null){obj_systemModstamp_union0=obj_systemModstamp_union0_error.message;}let obj_systemModstamp_union1=null;const obj_systemModstamp_union1_error=(()=>{if(obj_systemModstamp!==null){return new TypeError('Expected "null" but received "'+typeof obj_systemModstamp+'" (at "'+path_systemModstamp+'")');}})();if(obj_systemModstamp_union1_error!=null){obj_systemModstamp_union1=obj_systemModstamp_union1_error.message;}if(obj_systemModstamp_union0&&obj_systemModstamp_union1){let message='Object doesn\'t match union (at "'+path_systemModstamp+'")';message+='\n'+obj_systemModstamp_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_systemModstamp_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_weakEtag=obj.weakEtag;const path_weakEtag=path+'.weakEtag';if(typeof obj_weakEtag!=='number'||typeof obj_weakEtag==='number'&&Math.floor(obj_weakEtag)!==obj_weakEtag){return new TypeError('Expected "integer" but received "'+typeof obj_weakEtag+'" (at "'+path_weakEtag+'")');}})();return v_error===undefined?null:v_error;}function keyBuilder(config){return keyPrefix$4+'RecordRepresentation:'+config.recordId;}function normalize$2$1(input,existing,path,lds,store,timestamp){const input_childRelationships=input.childRelationships;const input_childRelationships_id=path.fullPath+'__childRelationships';const input_childRelationships_keys=Object.keys(input_childRelationships);const input_childRelationships_length=input_childRelationships_keys.length;for(let i=0;i<input_childRelationships_length;i++){const key=input_childRelationships_keys[i];const input_childRelationships_prop=input_childRelationships[key];const input_childRelationships_prop_id=input_childRelationships_id+'__'+key;input_childRelationships[key]=ingest$5(input_childRelationships_prop,{fullPath:input_childRelationships_prop_id,parent:{data:input,key:path.fullPath,existing:existing}},lds,store,timestamp);}const input_fields=input.fields;const input_fields_id=path.fullPath+'__fields';const input_fields_keys=Object.keys(input_fields);const input_fields_length=input_fields_keys.length;for(let i=0;i<input_fields_length;i++){const key=input_fields_keys[i];const input_fields_prop=input_fields[key];const input_fields_prop_id=input_fields_id+'__'+key;input_fields[key]=ingest$1$1(input_fields_prop,{fullPath:input_fields_prop_id,parent:{data:input,key:path.fullPath,existing:existing}},lds,store,timestamp);}return input;}function equals$3$1(existing,incoming){const existing_weakEtag=existing.weakEtag;const incoming_weakEtag=incoming.weakEtag;if(!(existing_weakEtag===incoming_weakEtag)){return false;}const existing_apiName=existing.apiName;const incoming_apiName=incoming.apiName;if(!(existing_apiName===incoming_apiName)){return false;}const existing_eTag=existing.eTag;const incoming_eTag=incoming.eTag;if(!(existing_eTag===incoming_eTag)){return false;}const existing_id=existing.id;const incoming_id=incoming.id;if(!(existing_id===incoming_id)){return false;}const existing_childRelationships=existing.childRelationships;const incoming_childRelationships=incoming.childRelationships;const equals_childRelationships_props=equalsObject(existing_childRelationships,incoming_childRelationships,(existing_childRelationships_prop,incoming_childRelationships_prop)=>{if(!(existing_childRelationships_prop.__ref===incoming_childRelationships_prop.__ref)){return false;}});if(equals_childRelationships_props===false){return false;}const existing_fields=existing.fields;const incoming_fields=incoming.fields;const equals_fields_props=equalsObject(existing_fields,incoming_fields,(existing_fields_prop,incoming_fields_prop)=>{if(!(existing_fields_prop.__ref===incoming_fields_prop.__ref)){return false;}});if(equals_fields_props===false){return false;}const existing_lastModifiedById=existing.lastModifiedById;const incoming_lastModifiedById=incoming.lastModifiedById;if(!(existing_lastModifiedById===incoming_lastModifiedById)){return false;}const existing_lastModifiedDate=existing.lastModifiedDate;const incoming_lastModifiedDate=incoming.lastModifiedDate;if(!(existing_lastModifiedDate===incoming_lastModifiedDate)){return false;}const existing_recordTypeId=existing.recordTypeId;const incoming_recordTypeId=incoming.recordTypeId;if(!(existing_recordTypeId===incoming_recordTypeId)){return false;}const existing_recordTypeInfo=existing.recordTypeInfo;const incoming_recordTypeInfo=incoming.recordTypeInfo;if(!(existing_recordTypeInfo===incoming_recordTypeInfo||existing_recordTypeInfo!=null&&incoming_recordTypeInfo!=null&&equals$5(existing_recordTypeInfo,incoming_recordTypeInfo))){return false;}const existing_systemModstamp=existing.systemModstamp;const incoming_systemModstamp=incoming.systemModstamp;if(!(existing_systemModstamp===incoming_systemModstamp)){return false;}return true;}const ingest$2$1=function RecordRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$3$2(input);if(validateError!==null){throw validateError;}}const key=polymorph(input);let incomingRecord=normalize$2$1(input,store.records[key],{fullPath:key,parent:path.parent},lds,store,timestamp);const existingRecord=store.records[key];incomingRecord=merge$1(existingRecord,incomingRecord,lds);if(existingRecord===undefined||equals$3$1(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}store.setExpiration(key,timestamp+30000);return createLink$5(key);};const RECORD_ID_DECODER='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456';/**
     * Converts to 18-char record ids. Details at http://sfdc.co/bnBMvm.
     * @param value A 15- or 18-char record id.
     * @returns An 18-char record id, and throws error if an invalid record id was provided.
     */function getRecordId18(value){if(!isString(value)){return undefined;}else if(value.length===18){return value;}else if(value.length===15){// Add the 3 character suffix
    let recordId=value;for(let offset=0;offset<15;offset+=5){let decodeValue=0;for(let bit=0;bit<5;bit++){const c=value[offset+bit];if(c>='A'&&c<='Z'){decodeValue+=1<<bit;}}recordId+=RECORD_ID_DECODER[decodeValue];}return recordId;}return undefined;}function isObjectId(unknown){if(typeof unknown!=='object'||unknown===null){return false;}return isString(unknown.objectApiName);}/**
     * Returns the object API name.
     * @param value The value from which to get the object API name.
     * @returns The object API name.
     */function getObjectApiName(value){// Note: tightening validation logic changes behavior from userland getting
    // a server-provided error to the adapter noop'ing. In 224 we decided to not
    // change the behavior.
    if(typeof value==='string'){const trimmed=value.trim();if(trimmed.length>0){return trimmed;}}else if(isObjectId(value)){return value.objectApiName.trim();}return undefined;}var LayoutType$1;(function(LayoutType){LayoutType["Full"]="Full";LayoutType["Compact"]="Compact";})(LayoutType$1||(LayoutType$1={}));function coerceLayoutType(value){if(value===LayoutType$1.Full||value===LayoutType$1.Compact){return value;}return undefined;}var LayoutMode$1;(function(LayoutMode){LayoutMode["View"]="View";LayoutMode["Edit"]="Edit";LayoutMode["Create"]="Create";})(LayoutMode$1||(LayoutMode$1={}));function coerceLayoutMode(value){if(value===LayoutMode$1.Create||value===LayoutMode$1.Edit||value===LayoutMode$1.View){return value;}return undefined;}function validate$4$2(obj,path='AbstractRecordLayoutComponentRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_apiName=obj.apiName;const path_apiName=path+'.apiName';let obj_apiName_union0=null;const obj_apiName_union0_error=(()=>{if(typeof obj_apiName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_apiName+'" (at "'+path_apiName+'")');}})();if(obj_apiName_union0_error!=null){obj_apiName_union0=obj_apiName_union0_error.message;}let obj_apiName_union1=null;const obj_apiName_union1_error=(()=>{if(obj_apiName!==null){return new TypeError('Expected "null" but received "'+typeof obj_apiName+'" (at "'+path_apiName+'")');}})();if(obj_apiName_union1_error!=null){obj_apiName_union1=obj_apiName_union1_error.message;}if(obj_apiName_union0&&obj_apiName_union1){let message='Object doesn\'t match union (at "'+path_apiName+'")';message+='\n'+obj_apiName_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_apiName_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_componentType=obj.componentType;const path_componentType=path+'.componentType';if(typeof obj_componentType!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_componentType+'" (at "'+path_componentType+'")');}})();return v_error===undefined?null:v_error;}function deepFreeze$2$4(input){ObjectFreeze$5(input);}function validate$5$1(obj,path='RecordLayoutItemRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_editableForNew=obj.editableForNew;const path_editableForNew=path+'.editableForNew';if(typeof obj_editableForNew!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_editableForNew+'" (at "'+path_editableForNew+'")');}const obj_editableForUpdate=obj.editableForUpdate;const path_editableForUpdate=path+'.editableForUpdate';if(typeof obj_editableForUpdate!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_editableForUpdate+'" (at "'+path_editableForUpdate+'")');}const obj_label=obj.label;const path_label=path+'.label';if(typeof obj_label!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_label+'" (at "'+path_label+'")');}const obj_layoutComponents=obj.layoutComponents;const path_layoutComponents=path+'.layoutComponents';if(!ArrayIsArray$6(obj_layoutComponents)){return new TypeError('Expected "array" but received "'+typeof obj_layoutComponents+'" (at "'+path_layoutComponents+'")');}for(let i=0;i<obj_layoutComponents.length;i++){const obj_layoutComponents_item=obj_layoutComponents[i];const path_layoutComponents_item=path_layoutComponents+'['+i+']';const referenceAbstractRecordLayoutComponentRepresentationValidationError=validate$4$2(obj_layoutComponents_item,path_layoutComponents_item);if(referenceAbstractRecordLayoutComponentRepresentationValidationError!==null){let message='Object doesn\'t match AbstractRecordLayoutComponentRepresentation (at "'+path_layoutComponents_item+'")\n';message+=referenceAbstractRecordLayoutComponentRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}const obj_lookupIdApiName=obj.lookupIdApiName;const path_lookupIdApiName=path+'.lookupIdApiName';let obj_lookupIdApiName_union0=null;const obj_lookupIdApiName_union0_error=(()=>{if(typeof obj_lookupIdApiName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_lookupIdApiName+'" (at "'+path_lookupIdApiName+'")');}})();if(obj_lookupIdApiName_union0_error!=null){obj_lookupIdApiName_union0=obj_lookupIdApiName_union0_error.message;}let obj_lookupIdApiName_union1=null;const obj_lookupIdApiName_union1_error=(()=>{if(obj_lookupIdApiName!==null){return new TypeError('Expected "null" but received "'+typeof obj_lookupIdApiName+'" (at "'+path_lookupIdApiName+'")');}})();if(obj_lookupIdApiName_union1_error!=null){obj_lookupIdApiName_union1=obj_lookupIdApiName_union1_error.message;}if(obj_lookupIdApiName_union0&&obj_lookupIdApiName_union1){let message='Object doesn\'t match union (at "'+path_lookupIdApiName+'")';message+='\n'+obj_lookupIdApiName_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_lookupIdApiName_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_required=obj.required;const path_required=path+'.required';if(typeof obj_required!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_required+'" (at "'+path_required+'")');}const obj_sortable=obj.sortable;const path_sortable=path+'.sortable';if(typeof obj_sortable!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_sortable+'" (at "'+path_sortable+'")');}})();return v_error===undefined?null:v_error;}function deepFreeze$3$2(input){const input_layoutComponents=input.layoutComponents;for(let i=0;i<input_layoutComponents.length;i++){const input_layoutComponents_item=input_layoutComponents[i];deepFreeze$2$4(input_layoutComponents_item);}ObjectFreeze$5(input_layoutComponents);ObjectFreeze$5(input);}function validate$6$1(obj,path='RecordLayoutRowRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_layoutItems=obj.layoutItems;const path_layoutItems=path+'.layoutItems';if(!ArrayIsArray$6(obj_layoutItems)){return new TypeError('Expected "array" but received "'+typeof obj_layoutItems+'" (at "'+path_layoutItems+'")');}for(let i=0;i<obj_layoutItems.length;i++){const obj_layoutItems_item=obj_layoutItems[i];const path_layoutItems_item=path_layoutItems+'['+i+']';const referenceRecordLayoutItemRepresentationValidationError=validate$5$1(obj_layoutItems_item,path_layoutItems_item);if(referenceRecordLayoutItemRepresentationValidationError!==null){let message='Object doesn\'t match RecordLayoutItemRepresentation (at "'+path_layoutItems_item+'")\n';message+=referenceRecordLayoutItemRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}})();return v_error===undefined?null:v_error;}function deepFreeze$4$2(input){const input_layoutItems=input.layoutItems;for(let i=0;i<input_layoutItems.length;i++){const input_layoutItems_item=input_layoutItems[i];deepFreeze$3$2(input_layoutItems_item);}ObjectFreeze$5(input_layoutItems);ObjectFreeze$5(input);}function validate$7$1(obj,path='RecordLayoutSectionRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_collapsible=obj.collapsible;const path_collapsible=path+'.collapsible';if(typeof obj_collapsible!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_collapsible+'" (at "'+path_collapsible+'")');}const obj_columns=obj.columns;const path_columns=path+'.columns';if(typeof obj_columns!=='number'||typeof obj_columns==='number'&&Math.floor(obj_columns)!==obj_columns){return new TypeError('Expected "integer" but received "'+typeof obj_columns+'" (at "'+path_columns+'")');}const obj_heading=obj.heading;const path_heading=path+'.heading';let obj_heading_union0=null;const obj_heading_union0_error=(()=>{if(typeof obj_heading!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_heading+'" (at "'+path_heading+'")');}})();if(obj_heading_union0_error!=null){obj_heading_union0=obj_heading_union0_error.message;}let obj_heading_union1=null;const obj_heading_union1_error=(()=>{if(obj_heading!==null){return new TypeError('Expected "null" but received "'+typeof obj_heading+'" (at "'+path_heading+'")');}})();if(obj_heading_union1_error!=null){obj_heading_union1=obj_heading_union1_error.message;}if(obj_heading_union0&&obj_heading_union1){let message='Object doesn\'t match union (at "'+path_heading+'")';message+='\n'+obj_heading_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_heading_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_id=obj.id;const path_id=path+'.id';let obj_id_union0=null;const obj_id_union0_error=(()=>{if(typeof obj_id!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_id+'" (at "'+path_id+'")');}})();if(obj_id_union0_error!=null){obj_id_union0=obj_id_union0_error.message;}let obj_id_union1=null;const obj_id_union1_error=(()=>{if(obj_id!==null){return new TypeError('Expected "null" but received "'+typeof obj_id+'" (at "'+path_id+'")');}})();if(obj_id_union1_error!=null){obj_id_union1=obj_id_union1_error.message;}if(obj_id_union0&&obj_id_union1){let message='Object doesn\'t match union (at "'+path_id+'")';message+='\n'+obj_id_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_id_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_layoutRows=obj.layoutRows;const path_layoutRows=path+'.layoutRows';if(!ArrayIsArray$6(obj_layoutRows)){return new TypeError('Expected "array" but received "'+typeof obj_layoutRows+'" (at "'+path_layoutRows+'")');}for(let i=0;i<obj_layoutRows.length;i++){const obj_layoutRows_item=obj_layoutRows[i];const path_layoutRows_item=path_layoutRows+'['+i+']';const referenceRecordLayoutRowRepresentationValidationError=validate$6$1(obj_layoutRows_item,path_layoutRows_item);if(referenceRecordLayoutRowRepresentationValidationError!==null){let message='Object doesn\'t match RecordLayoutRowRepresentation (at "'+path_layoutRows_item+'")\n';message+=referenceRecordLayoutRowRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}const obj_rows=obj.rows;const path_rows=path+'.rows';if(typeof obj_rows!=='number'||typeof obj_rows==='number'&&Math.floor(obj_rows)!==obj_rows){return new TypeError('Expected "integer" but received "'+typeof obj_rows+'" (at "'+path_rows+'")');}const obj_useHeading=obj.useHeading;const path_useHeading=path+'.useHeading';if(typeof obj_useHeading!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_useHeading+'" (at "'+path_useHeading+'")');}})();return v_error===undefined?null:v_error;}function deepFreeze$5$1(input){const input_layoutRows=input.layoutRows;for(let i=0;i<input_layoutRows.length;i++){const input_layoutRows_item=input_layoutRows[i];deepFreeze$4$2(input_layoutRows_item);}ObjectFreeze$5(input_layoutRows);ObjectFreeze$5(input);}function validate$8$1(obj,path='RecordLayoutRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_eTag=obj.eTag;const path_eTag=path+'.eTag';if(typeof obj_eTag!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_eTag+'" (at "'+path_eTag+'")');}const obj_id=obj.id;const path_id=path+'.id';let obj_id_union0=null;const obj_id_union0_error=(()=>{if(typeof obj_id!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_id+'" (at "'+path_id+'")');}})();if(obj_id_union0_error!=null){obj_id_union0=obj_id_union0_error.message;}let obj_id_union1=null;const obj_id_union1_error=(()=>{if(obj_id!==null){return new TypeError('Expected "null" but received "'+typeof obj_id+'" (at "'+path_id+'")');}})();if(obj_id_union1_error!=null){obj_id_union1=obj_id_union1_error.message;}if(obj_id_union0&&obj_id_union1){let message='Object doesn\'t match union (at "'+path_id+'")';message+='\n'+obj_id_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_id_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_apiName=obj.apiName;const path_apiName=path+'.apiName';if(typeof obj_apiName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_apiName+'" (at "'+path_apiName+'")');}const obj_recordTypeId=obj.recordTypeId;const path_recordTypeId=path+'.recordTypeId';if(typeof obj_recordTypeId!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_recordTypeId+'" (at "'+path_recordTypeId+'")');}const obj_layoutType=obj.layoutType;const path_layoutType=path+'.layoutType';if(typeof obj_layoutType!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_layoutType+'" (at "'+path_layoutType+'")');}const obj_mode=obj.mode;const path_mode=path+'.mode';if(typeof obj_mode!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_mode+'" (at "'+path_mode+'")');}const obj_sections=obj.sections;const path_sections=path+'.sections';if(!ArrayIsArray$6(obj_sections)){return new TypeError('Expected "array" but received "'+typeof obj_sections+'" (at "'+path_sections+'")');}for(let i=0;i<obj_sections.length;i++){const obj_sections_item=obj_sections[i];const path_sections_item=path_sections+'['+i+']';const referenceRecordLayoutSectionRepresentationValidationError=validate$7$1(obj_sections_item,path_sections_item);if(referenceRecordLayoutSectionRepresentationValidationError!==null){let message='Object doesn\'t match RecordLayoutSectionRepresentation (at "'+path_sections_item+'")\n';message+=referenceRecordLayoutSectionRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}})();return v_error===undefined?null:v_error;}function keyBuilder$1(config){return keyPrefix$4+'RecordLayoutRepresentation:'+config.recordTypeId+':'+config.apiName+':'+config.layoutType+':'+config.mode;}function normalize$3$1(input,existing,path,lds,store,timestamp){return input;}const select$5=function RecordLayoutRepresentationSelect(){return {kind:'Fragment',selections:[{name:'id',kind:'Scalar'},{name:'layoutType',kind:'Scalar'},{name:'mode',kind:'Scalar'},{name:'sections',kind:'Object',opaque:true}]};};function equals$4$1(existing,incoming){if(existing.eTag!==incoming.eTag){return false;}return true;}function deepFreeze$6$1(input){const input_sections=input.sections;for(let i=0;i<input_sections.length;i++){const input_sections_item=input_sections[i];deepFreeze$5$1(input_sections_item);}ObjectFreeze$5(input_sections);ObjectFreeze$5(input);}const ingest$3$1=function RecordLayoutRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$8$1(input);if(validateError!==null){throw validateError;}}const key=keyBuilder$1({recordTypeId:input.recordTypeId,apiName:input.apiName,layoutType:input.layoutType,mode:input.mode});let incomingRecord=normalize$3$1(input,store.records[key],{fullPath:key,parent:path.parent});const existingRecord=store.records[key];deepFreeze$6$1(input);if(existingRecord===undefined||equals$4$1(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}store.setExpiration(key,timestamp+900000);return createLink$5(key);};function getUiApiLayoutByObjectApiName(config){const key=keyPrefix$4+'RecordLayoutRepresentation('+'formFactor:'+config.queryParams.formFactor+','+'layoutType:'+config.queryParams.layoutType+','+'mode:'+config.queryParams.mode+','+'recordTypeId:'+config.queryParams.recordTypeId+','+'objectApiName:'+config.urlParams.objectApiName+')';const headers={};return {path:'/services/data/v49.0/ui-api/layout/'+config.urlParams.objectApiName+'',method:'get',body:null,urlParams:config.urlParams,queryParams:config.queryParams,key:key,ingest:ingest$3$1,headers};}function coerceConfig(config){const coercedConfig={};const objectApiName=getObjectApiName(config.objectApiName);if(objectApiName!==undefined){coercedConfig.objectApiName=objectApiName;}const formFactor=config.formFactor;if(formFactor!==undefined){coercedConfig.formFactor=formFactor;}const layoutType=coerceLayoutType(config.layoutType);if(layoutType!==undefined){coercedConfig.layoutType=layoutType;}const mode=coerceLayoutMode(config.mode);if(mode!==undefined){coercedConfig.mode=mode;}const recordTypeId=getRecordId18(config.recordTypeId);if(recordTypeId!==undefined){coercedConfig.recordTypeId=recordTypeId;}return coercedConfig;}function typeCheckConfig$5(untrustedConfig){const config={};const untrustedConfig_objectApiName=untrustedConfig.objectApiName;if(typeof untrustedConfig_objectApiName==='string'){config.objectApiName=untrustedConfig_objectApiName;}const untrustedConfig_formFactor=untrustedConfig.formFactor;if(typeof untrustedConfig_formFactor==='string'){config.formFactor=untrustedConfig_formFactor;}const untrustedConfig_layoutType=untrustedConfig.layoutType;if(typeof untrustedConfig_layoutType==='string'){config.layoutType=untrustedConfig_layoutType;}const untrustedConfig_mode=untrustedConfig.mode;if(typeof untrustedConfig_mode==='string'){config.mode=untrustedConfig_mode;}const untrustedConfig_recordTypeId=untrustedConfig.recordTypeId;if(typeof untrustedConfig_recordTypeId==='string'){config.recordTypeId=untrustedConfig_recordTypeId;}return config;}function validateAdapterConfig$5(untrustedConfig,configPropertyNames){if(!untrustedIsObject$5(untrustedConfig)){return null;}{validateConfig$4(untrustedConfig,configPropertyNames);}const coercedConfig=coerceConfig(untrustedConfig);const config=typeCheckConfig$5(coercedConfig);if(!areRequiredParametersPresent$4(config,configPropertyNames)){return null;}return config;}const layoutSelections=select$5();// FYI stricter required set than RAML, matches lds222 behavior
    const getLayout_ConfigPropertyNames$1={displayName:'getLayout',parameters:{required:['objectApiName','layoutType','mode'],optional:['recordTypeId']}};function buildNetworkSnapshot$1$1(lds,config,requestOverride){const recordTypeId=config.recordTypeId;const request=getUiApiLayoutByObjectApiName({urlParams:{objectApiName:config.objectApiName},queryParams:{layoutType:config.layoutType,mode:config.mode,recordTypeId}});const key=keyBuilder$1({apiName:config.objectApiName,recordTypeId,layoutType:config.layoutType,mode:config.mode});return lds.dispatchResourceRequest(request,requestOverride).then(response=>{const{body}=response;// TODO W-6399239 - fix API so we don't have to augment the response with request details in order
    // to support refresh. these are never emitted out per (private).
    body.apiName=config.objectApiName;body.recordTypeId=recordTypeId;lds.storeIngest(key,request,body);lds.storeBroadcast();return lds.storeLookup({recordId:key,node:layoutSelections,variables:{}});},error=>{lds.storeIngestFetchResponse(key,error);lds.storeBroadcast();return lds.errorSnapshot(error);});}function buildInMemorySnapshot$1$1(lds,config){const{recordTypeId,layoutType,mode}=config;const key=keyBuilder$1({apiName:config.objectApiName,recordTypeId,layoutType,mode});return lds.storeLookup({recordId:key,node:layoutSelections,variables:{}});}function coerceConfigWithDefaults(untrusted){const config=validateAdapterConfig$5(untrusted,getLayout_ConfigPropertyNames$1);if(config===null){return null;}// recordTypeId coercion is nuts: if `null` (but not undefined) then use MASTER record type id
    let recordTypeId=config.recordTypeId;if(recordTypeId===undefined){// must check untrusted bc config has been coerced
    if(untrusted.recordTypeId!==null){return null;}recordTypeId=MASTER_RECORD_TYPE_ID;}// layoutType and mode are required during validation.
    // They will always be valid at this point.
    return _objectSpread$2({},config,{recordTypeId,layoutType:config.layoutType,mode:config.mode});}const factory$2=lds=>{return refreshable$5(untrusted=>{const config=coerceConfigWithDefaults(untrusted);if(config===null){return null;}const snapshot=buildInMemorySnapshot$1$1(lds,config);// Cache hit
    if(isFulfilledSnapshot$1(snapshot)){return snapshot;}return buildNetworkSnapshot$1$1(lds,config);},untrusted=>{const config=coerceConfigWithDefaults(untrusted);if(config===null){throw new Error('Refresh should not be called with partial configuration');}return buildNetworkSnapshot$1$1(lds,config,{headers:{'Cache-Control':'no-cache'}});});};function validate$9$1(obj,path='RecordLayoutSectionUserStateRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_collapsed=obj.collapsed;const path_collapsed=path+'.collapsed';if(typeof obj_collapsed!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_collapsed+'" (at "'+path_collapsed+'")');}const obj_id=obj.id;const path_id=path+'.id';if(typeof obj_id!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_id+'" (at "'+path_id+'")');}})();return v_error===undefined?null:v_error;}function deepFreeze$7$1(input){ObjectFreeze$5(input);}function validate$a(obj,path='RecordLayoutUserStateRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_id=obj.id;const path_id=path+'.id';if(typeof obj_id!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_id+'" (at "'+path_id+'")');}const obj_sectionUserStates=obj.sectionUserStates;const path_sectionUserStates=path+'.sectionUserStates';if(typeof obj_sectionUserStates!=='object'||ArrayIsArray$6(obj_sectionUserStates)||obj_sectionUserStates===null){return new TypeError('Expected "object" but received "'+typeof obj_sectionUserStates+'" (at "'+path_sectionUserStates+'")');}const obj_sectionUserStates_keys=ObjectKeys$5(obj_sectionUserStates);for(let i=0;i<obj_sectionUserStates_keys.length;i++){const key=obj_sectionUserStates_keys[i];const obj_sectionUserStates_prop=obj_sectionUserStates[key];const path_sectionUserStates_prop=path_sectionUserStates+'["'+key+'"]';const referenceRecordLayoutSectionUserStateRepresentationValidationError=validate$9$1(obj_sectionUserStates_prop,path_sectionUserStates_prop);if(referenceRecordLayoutSectionUserStateRepresentationValidationError!==null){let message='Object doesn\'t match RecordLayoutSectionUserStateRepresentation (at "'+path_sectionUserStates_prop+'")\n';message+=referenceRecordLayoutSectionUserStateRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}const obj_apiName=obj.apiName;const path_apiName=path+'.apiName';if(typeof obj_apiName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_apiName+'" (at "'+path_apiName+'")');}const obj_recordTypeId=obj.recordTypeId;const path_recordTypeId=path+'.recordTypeId';if(typeof obj_recordTypeId!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_recordTypeId+'" (at "'+path_recordTypeId+'")');}const obj_layoutType=obj.layoutType;const path_layoutType=path+'.layoutType';if(typeof obj_layoutType!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_layoutType+'" (at "'+path_layoutType+'")');}const obj_mode=obj.mode;const path_mode=path+'.mode';if(typeof obj_mode!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_mode+'" (at "'+path_mode+'")');}})();return v_error===undefined?null:v_error;}function keyBuilder$2(config){return keyPrefix$4+'RecordLayoutUserStateRepresentation:'+config.recordTypeId+':'+config.apiName+':'+config.layoutType+':'+config.mode;}function normalize$4$1(input,existing,path,lds,store,timestamp){return input;}const select$1$1=function RecordLayoutUserStateRepresentationSelect(){return {kind:'Fragment',selections:[{name:'id',kind:'Scalar'},{name:'sectionUserStates',kind:'Object',opaque:true}]};};function equals$5$1(existing,incoming){if(JSONStrinify$4(incoming)!==JSONStrinify$4(existing)){return false;}return true;}function deepFreeze$8$1(input){const input_sectionUserStates=input.sectionUserStates;const input_sectionUserStates_keys=Object.keys(input_sectionUserStates);const input_sectionUserStates_length=input_sectionUserStates_keys.length;for(let i=0;i<input_sectionUserStates_length;i++){const key=input_sectionUserStates_keys[i];const input_sectionUserStates_prop=input_sectionUserStates[key];deepFreeze$7$1(input_sectionUserStates_prop);}ObjectFreeze$5(input_sectionUserStates);ObjectFreeze$5(input);}const ingest$4$1=function RecordLayoutUserStateRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$a(input);if(validateError!==null){throw validateError;}}const key=keyBuilder$2({recordTypeId:input.recordTypeId,apiName:input.apiName,layoutType:input.layoutType,mode:input.mode});let incomingRecord=normalize$4$1(input,store.records[key],{fullPath:key,parent:path.parent});const existingRecord=store.records[key];deepFreeze$8$1(input);if(existingRecord===undefined||equals$5$1(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}store.setExpiration(key,timestamp+900000);return createLink$5(key);};function getUiApiLayoutUserStateByObjectApiName(config){const key=keyPrefix$4+'RecordLayoutUserStateRepresentation('+'formFactor:'+config.queryParams.formFactor+','+'layoutType:'+config.queryParams.layoutType+','+'mode:'+config.queryParams.mode+','+'recordTypeId:'+config.queryParams.recordTypeId+','+'objectApiName:'+config.urlParams.objectApiName+')';const headers={};return {path:'/services/data/v49.0/ui-api/layout/'+config.urlParams.objectApiName+'/user-state',method:'get',body:null,urlParams:config.urlParams,queryParams:config.queryParams,key:key,ingest:ingest$4$1,headers};}function coerceConfig$1(config){const coercedConfig={};const objectApiName=getObjectApiName(config.objectApiName);if(objectApiName!==undefined){coercedConfig.objectApiName=objectApiName;}const formFactor=config.formFactor;if(formFactor!==undefined){coercedConfig.formFactor=formFactor;}const layoutType=coerceLayoutType(config.layoutType);if(layoutType!==undefined){coercedConfig.layoutType=layoutType;}const mode=coerceLayoutMode(config.mode);if(mode!==undefined){coercedConfig.mode=mode;}const recordTypeId=getRecordId18(config.recordTypeId);if(recordTypeId!==undefined){coercedConfig.recordTypeId=recordTypeId;}return coercedConfig;}function typeCheckConfig$1$1(untrustedConfig){const config={};const untrustedConfig_objectApiName=untrustedConfig.objectApiName;if(typeof untrustedConfig_objectApiName==='string'){config.objectApiName=untrustedConfig_objectApiName;}const untrustedConfig_formFactor=untrustedConfig.formFactor;if(typeof untrustedConfig_formFactor==='string'){config.formFactor=untrustedConfig_formFactor;}const untrustedConfig_layoutType=untrustedConfig.layoutType;if(typeof untrustedConfig_layoutType==='string'){config.layoutType=untrustedConfig_layoutType;}const untrustedConfig_mode=untrustedConfig.mode;if(typeof untrustedConfig_mode==='string'){config.mode=untrustedConfig_mode;}const untrustedConfig_recordTypeId=untrustedConfig.recordTypeId;if(typeof untrustedConfig_recordTypeId==='string'){config.recordTypeId=untrustedConfig_recordTypeId;}return config;}function validateAdapterConfig$1$2(untrustedConfig,configPropertyNames){if(!untrustedIsObject$5(untrustedConfig)){return null;}{validateConfig$4(untrustedConfig,configPropertyNames);}const coercedConfig=coerceConfig$1(untrustedConfig);const config=typeCheckConfig$1$1(coercedConfig);if(!areRequiredParametersPresent$4(config,configPropertyNames)){return null;}return config;}const recordLayoutSelect=select$1$1();// FYI stricter required set than RAML defines, matches lds222 behavior
    const getLayoutUserState_ConfigPropertyNames$1={displayName:'getLayoutUserState',parameters:{required:['objectApiName','recordTypeId'],optional:['formFactor','layoutType','mode']}};function coerceConfigWithDefaults$1(untrustedConfig){const config=validateAdapterConfig$1$2(untrustedConfig,getLayoutUserState_ConfigPropertyNames$1);if(config===null){return null;}// recordTypeId is overridden to be required
    const recordTypeId=config.recordTypeId;const untrusted=untrustedConfig;let layoutType=config.layoutType;if(layoutType===undefined){if(untrusted.layoutType===undefined){layoutType=LayoutType$1.Full;}else {return null;}}let mode=config.mode;if(mode===undefined){if(untrusted.mode===undefined){mode=LayoutMode$1.View;}else {return null;}}return _objectSpread$2({},config,{recordTypeId,layoutType,mode});}function buildInMemorySnapshot$2$1(lds,config){const{objectApiName,recordTypeId,layoutType,mode}=config;const key=keyBuilder$2({apiName:objectApiName,recordTypeId,layoutType,mode});return lds.storeLookup({recordId:key,node:recordLayoutSelect,variables:{}});}function buildNetworkSnapshot$2$1(lds,config){const{recordTypeId,layoutType,mode,objectApiName}=config;const key=keyBuilder$2({apiName:objectApiName,recordTypeId,layoutType,mode});const request=getUiApiLayoutUserStateByObjectApiName({urlParams:{objectApiName:config.objectApiName},queryParams:{layoutType:config.layoutType,mode:config.mode,recordTypeId:config.recordTypeId}});return lds.dispatchResourceRequest(request).then(response=>{const{body}=response;// Hack- adding in this params so record-ui will be able to use normed values.
    body.apiName=config.objectApiName;body.recordTypeId=recordTypeId;body.layoutType=layoutType;body.mode=mode;lds.storeIngest(key,request,body);lds.storeBroadcast();return buildInMemorySnapshot$2$1(lds,config);},error=>{lds.storeIngestFetchResponse(key,error);lds.storeBroadcast();return lds.errorSnapshot(error);});}const factory$3=lds=>{return refreshable$5(function getLayoutUserState(untrustedConfig){const config=coerceConfigWithDefaults$1(untrustedConfig);if(config===null){return null;}const cacheSnapshot=buildInMemorySnapshot$2$1(lds,config);// Cache Hit
    if(isFulfilledSnapshot$1(cacheSnapshot)){return cacheSnapshot;}return buildNetworkSnapshot$2$1(lds,config);},untrustedConfig=>{const config=coerceConfigWithDefaults$1(untrustedConfig);if(config===null){throw new Error('Refresh should not be called with partial configuration');}return buildNetworkSnapshot$2$1(lds,config);});};/**
     * Returns the field API name.
     * @param value The value from which to get the field API name.
     * @returns The field API name.
     */function getFieldApiNamesArray(value){const valueArray=isArray$3(value)?value:[value];const array=[];for(let i=0,len=valueArray.length;i<len;i+=1){const item=valueArray[i];const apiName=getFieldApiName(item);if(apiName===undefined){return undefined;}push$1.call(array,apiName);}if(array.length===0){return undefined;}return dedupe(array).sort();}function validate$b(obj,path='ListColumnRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_fieldApiName=obj.fieldApiName;const path_fieldApiName=path+'.fieldApiName';if(typeof obj_fieldApiName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_fieldApiName+'" (at "'+path_fieldApiName+'")');}const obj_label=obj.label;const path_label=path+'.label';if(typeof obj_label!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_label+'" (at "'+path_label+'")');}const obj_sortable=obj.sortable;const path_sortable=path+'.sortable';if(typeof obj_sortable!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_sortable+'" (at "'+path_sortable+'")');}})();return v_error===undefined?null:v_error;}const select$2$1=function ListColumnRepresentationSelect(){return {kind:'Fragment',selections:[{name:'fieldApiName',kind:'Scalar'},{name:'label',kind:'Scalar'},{name:'sortable',kind:'Scalar'}]};};function validate$c(obj,path='ListFilterByInfoRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_fieldApiName=obj.fieldApiName;const path_fieldApiName=path+'.fieldApiName';if(typeof obj_fieldApiName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_fieldApiName+'" (at "'+path_fieldApiName+'")');}const obj_label=obj.label;const path_label=path+'.label';if(typeof obj_label!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_label+'" (at "'+path_label+'")');}const obj_operandLabels=obj.operandLabels;const path_operandLabels=path+'.operandLabels';if(!ArrayIsArray$6(obj_operandLabels)){return new TypeError('Expected "array" but received "'+typeof obj_operandLabels+'" (at "'+path_operandLabels+'")');}for(let i=0;i<obj_operandLabels.length;i++){const obj_operandLabels_item=obj_operandLabels[i];const path_operandLabels_item=path_operandLabels+'['+i+']';if(typeof obj_operandLabels_item!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_operandLabels_item+'" (at "'+path_operandLabels_item+'")');}}const obj_operator=obj.operator;const path_operator=path+'.operator';if(typeof obj_operator!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_operator+'" (at "'+path_operator+'")');}})();return v_error===undefined?null:v_error;}const select$3$1=function ListFilterByInfoRepresentationSelect(){return {kind:'Fragment',selections:[{name:'fieldApiName',kind:'Scalar'},{name:'label',kind:'Scalar'},{name:'operandLabels',kind:'Scalar',plural:true},{name:'operator',kind:'Scalar'}]};};function validate$d(obj,path='ListOrderByInfoRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_fieldApiName=obj.fieldApiName;const path_fieldApiName=path+'.fieldApiName';if(typeof obj_fieldApiName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_fieldApiName+'" (at "'+path_fieldApiName+'")');}const obj_isAscending=obj.isAscending;const path_isAscending=path+'.isAscending';if(typeof obj_isAscending!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_isAscending+'" (at "'+path_isAscending+'")');}const obj_label=obj.label;const path_label=path+'.label';if(typeof obj_label!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_label+'" (at "'+path_label+'")');}})();return v_error===undefined?null:v_error;}const select$4$1=function ListOrderByInfoRepresentationSelect(){return {kind:'Fragment',selections:[{name:'fieldApiName',kind:'Scalar'},{name:'isAscending',kind:'Scalar'},{name:'label',kind:'Scalar'}]};};function validate$e(obj,path='ListUserPreferenceRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_columnWidths=obj.columnWidths;const path_columnWidths=path+'.columnWidths';if(typeof obj_columnWidths!=='object'||ArrayIsArray$6(obj_columnWidths)||obj_columnWidths===null){return new TypeError('Expected "object" but received "'+typeof obj_columnWidths+'" (at "'+path_columnWidths+'")');}const obj_columnWidths_keys=ObjectKeys$5(obj_columnWidths);for(let i=0;i<obj_columnWidths_keys.length;i++){const key=obj_columnWidths_keys[i];const obj_columnWidths_prop=obj_columnWidths[key];const path_columnWidths_prop=path_columnWidths+'["'+key+'"]';if(typeof obj_columnWidths_prop!=='number'||typeof obj_columnWidths_prop==='number'&&Math.floor(obj_columnWidths_prop)!==obj_columnWidths_prop){return new TypeError('Expected "integer" but received "'+typeof obj_columnWidths_prop+'" (at "'+path_columnWidths_prop+'")');}}const obj_columnWrap=obj.columnWrap;const path_columnWrap=path+'.columnWrap';if(typeof obj_columnWrap!=='object'||ArrayIsArray$6(obj_columnWrap)||obj_columnWrap===null){return new TypeError('Expected "object" but received "'+typeof obj_columnWrap+'" (at "'+path_columnWrap+'")');}const obj_columnWrap_keys=ObjectKeys$5(obj_columnWrap);for(let i=0;i<obj_columnWrap_keys.length;i++){const key=obj_columnWrap_keys[i];const obj_columnWrap_prop=obj_columnWrap[key];const path_columnWrap_prop=path_columnWrap+'["'+key+'"]';if(typeof obj_columnWrap_prop!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_columnWrap_prop+'" (at "'+path_columnWrap_prop+'")');}}})();return v_error===undefined?null:v_error;}const select$5$1=function ListUserPreferenceRepresentationSelect(){return {kind:'Fragment',selections:[{name:'columnWidths',kind:'Scalar',map:true},{name:'columnWrap',kind:'Scalar',map:true}]};};function validate$f(obj,path='ListReferenceRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_id=obj.id;const path_id=path+'.id';let obj_id_union0=null;const obj_id_union0_error=(()=>{if(typeof obj_id!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_id+'" (at "'+path_id+'")');}})();if(obj_id_union0_error!=null){obj_id_union0=obj_id_union0_error.message;}let obj_id_union1=null;const obj_id_union1_error=(()=>{if(obj_id!==null){return new TypeError('Expected "null" but received "'+typeof obj_id+'" (at "'+path_id+'")');}})();if(obj_id_union1_error!=null){obj_id_union1=obj_id_union1_error.message;}if(obj_id_union0&&obj_id_union1){let message='Object doesn\'t match union (at "'+path_id+'")';message+='\n'+obj_id_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_id_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_listViewApiName=obj.listViewApiName;const path_listViewApiName=path+'.listViewApiName';let obj_listViewApiName_union0=null;const obj_listViewApiName_union0_error=(()=>{if(typeof obj_listViewApiName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_listViewApiName+'" (at "'+path_listViewApiName+'")');}})();if(obj_listViewApiName_union0_error!=null){obj_listViewApiName_union0=obj_listViewApiName_union0_error.message;}let obj_listViewApiName_union1=null;const obj_listViewApiName_union1_error=(()=>{if(obj_listViewApiName!==null){return new TypeError('Expected "null" but received "'+typeof obj_listViewApiName+'" (at "'+path_listViewApiName+'")');}})();if(obj_listViewApiName_union1_error!=null){obj_listViewApiName_union1=obj_listViewApiName_union1_error.message;}if(obj_listViewApiName_union0&&obj_listViewApiName_union1){let message='Object doesn\'t match union (at "'+path_listViewApiName+'")';message+='\n'+obj_listViewApiName_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_listViewApiName_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_objectApiName=obj.objectApiName;const path_objectApiName=path+'.objectApiName';if(typeof obj_objectApiName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_objectApiName+'" (at "'+path_objectApiName+'")');}const obj_type=obj.type;const path_type=path+'.type';if(typeof obj_type!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_type+'" (at "'+path_type+'")');}})();return v_error===undefined?null:v_error;}function keyBuilder$3(config){return keyPrefix$4+'ListReferenceRepresentation:'+(config.id===null?'':config.id);}function normalize$5$1(input,existing,path,lds,store,timestamp){return input;}const select$6=function ListReferenceRepresentationSelect(){return {kind:'Fragment',selections:[{name:'id',kind:'Scalar'},{name:'listViewApiName',kind:'Scalar'},{name:'objectApiName',kind:'Scalar'},{name:'type',kind:'Scalar'}]};};function equals$6(existing,incoming){const existing_objectApiName=existing.objectApiName;const incoming_objectApiName=incoming.objectApiName;if(!(existing_objectApiName===incoming_objectApiName)){return false;}const existing_type=existing.type;const incoming_type=incoming.type;if(!(existing_type===incoming_type)){return false;}const existing_id=existing.id;const incoming_id=incoming.id;if(!(existing_id===incoming_id)){return false;}const existing_listViewApiName=existing.listViewApiName;const incoming_listViewApiName=incoming.listViewApiName;if(!(existing_listViewApiName===incoming_listViewApiName)){return false;}return true;}const ingest$5$1=function ListReferenceRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$f(input);if(validateError!==null){throw validateError;}}const key=keyBuilder$3({id:input.id});let incomingRecord=normalize$5$1(input,store.records[key],{fullPath:key,parent:path.parent});const existingRecord=store.records[key];if(existingRecord===undefined||equals$6(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}return createLink$5(key);};function validate$g(obj,path='ListInfoRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_cloneable=obj.cloneable;const path_cloneable=path+'.cloneable';if(typeof obj_cloneable!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_cloneable+'" (at "'+path_cloneable+'")');}const obj_createable=obj.createable;const path_createable=path+'.createable';if(typeof obj_createable!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_createable+'" (at "'+path_createable+'")');}const obj_deletable=obj.deletable;const path_deletable=path+'.deletable';if(typeof obj_deletable!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_deletable+'" (at "'+path_deletable+'")');}const obj_displayColumns=obj.displayColumns;const path_displayColumns=path+'.displayColumns';if(!ArrayIsArray$6(obj_displayColumns)){return new TypeError('Expected "array" but received "'+typeof obj_displayColumns+'" (at "'+path_displayColumns+'")');}for(let i=0;i<obj_displayColumns.length;i++){const obj_displayColumns_item=obj_displayColumns[i];const path_displayColumns_item=path_displayColumns+'['+i+']';const referenceListColumnRepresentationValidationError=validate$b(obj_displayColumns_item,path_displayColumns_item);if(referenceListColumnRepresentationValidationError!==null){let message='Object doesn\'t match ListColumnRepresentation (at "'+path_displayColumns_item+'")\n';message+=referenceListColumnRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}const obj_eTag=obj.eTag;const path_eTag=path+'.eTag';if(typeof obj_eTag!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_eTag+'" (at "'+path_eTag+'")');}const obj_filterLogicString=obj.filterLogicString;const path_filterLogicString=path+'.filterLogicString';let obj_filterLogicString_union0=null;const obj_filterLogicString_union0_error=(()=>{if(typeof obj_filterLogicString!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_filterLogicString+'" (at "'+path_filterLogicString+'")');}})();if(obj_filterLogicString_union0_error!=null){obj_filterLogicString_union0=obj_filterLogicString_union0_error.message;}let obj_filterLogicString_union1=null;const obj_filterLogicString_union1_error=(()=>{if(obj_filterLogicString!==null){return new TypeError('Expected "null" but received "'+typeof obj_filterLogicString+'" (at "'+path_filterLogicString+'")');}})();if(obj_filterLogicString_union1_error!=null){obj_filterLogicString_union1=obj_filterLogicString_union1_error.message;}if(obj_filterLogicString_union0&&obj_filterLogicString_union1){let message='Object doesn\'t match union (at "'+path_filterLogicString+'")';message+='\n'+obj_filterLogicString_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_filterLogicString_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_filteredByInfo=obj.filteredByInfo;const path_filteredByInfo=path+'.filteredByInfo';if(!ArrayIsArray$6(obj_filteredByInfo)){return new TypeError('Expected "array" but received "'+typeof obj_filteredByInfo+'" (at "'+path_filteredByInfo+'")');}for(let i=0;i<obj_filteredByInfo.length;i++){const obj_filteredByInfo_item=obj_filteredByInfo[i];const path_filteredByInfo_item=path_filteredByInfo+'['+i+']';const referenceListFilterByInfoRepresentationValidationError=validate$c(obj_filteredByInfo_item,path_filteredByInfo_item);if(referenceListFilterByInfoRepresentationValidationError!==null){let message='Object doesn\'t match ListFilterByInfoRepresentation (at "'+path_filteredByInfo_item+'")\n';message+=referenceListFilterByInfoRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}const obj_label=obj.label;const path_label=path+'.label';if(typeof obj_label!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_label+'" (at "'+path_label+'")');}const obj_listReference=obj.listReference;const path_listReference=path+'.listReference';if(typeof obj_listReference!=='object'){return new TypeError('Expected "object" but received "'+typeof obj_listReference+'" (at "'+path_listReference+'")');}const obj_orderedByInfo=obj.orderedByInfo;const path_orderedByInfo=path+'.orderedByInfo';if(!ArrayIsArray$6(obj_orderedByInfo)){return new TypeError('Expected "array" but received "'+typeof obj_orderedByInfo+'" (at "'+path_orderedByInfo+'")');}for(let i=0;i<obj_orderedByInfo.length;i++){const obj_orderedByInfo_item=obj_orderedByInfo[i];const path_orderedByInfo_item=path_orderedByInfo+'['+i+']';const referenceListOrderByInfoRepresentationValidationError=validate$d(obj_orderedByInfo_item,path_orderedByInfo_item);if(referenceListOrderByInfoRepresentationValidationError!==null){let message='Object doesn\'t match ListOrderByInfoRepresentation (at "'+path_orderedByInfo_item+'")\n';message+=referenceListOrderByInfoRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}const obj_updateable=obj.updateable;const path_updateable=path+'.updateable';if(typeof obj_updateable!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_updateable+'" (at "'+path_updateable+'")');}const obj_userPreferences=obj.userPreferences;const path_userPreferences=path+'.userPreferences';const referenceListUserPreferenceRepresentationValidationError=validate$e(obj_userPreferences,path_userPreferences);if(referenceListUserPreferenceRepresentationValidationError!==null){let message='Object doesn\'t match ListUserPreferenceRepresentation (at "'+path_userPreferences+'")\n';message+=referenceListUserPreferenceRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_visibility=obj.visibility;const path_visibility=path+'.visibility';if(typeof obj_visibility!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_visibility+'" (at "'+path_visibility+'")');}const obj_visibilityEditable=obj.visibilityEditable;const path_visibilityEditable=path+'.visibilityEditable';if(typeof obj_visibilityEditable!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_visibilityEditable+'" (at "'+path_visibilityEditable+'")');}})();return v_error===undefined?null:v_error;}function keyBuilder$4(config){return keyPrefix$4+'ListInfoRepresentation:'+(config.listViewApiName===null?'':config.listViewApiName)+':'+config.objectApiName+':'+config.type;}function normalize$6(input,existing,path,lds,store,timestamp){const input_listReference=input.listReference;const input_listReference_id=path.fullPath+'__listReference';input.listReference=ingest$5$1(input_listReference,{fullPath:input_listReference_id,parent:{data:input,key:path.fullPath,existing:existing}},lds,store);return input;}const select$7=function ListInfoRepresentationSelect(){const{selections:ListColumnRepresentation__selections,opaque:ListColumnRepresentation__opaque}=select$2$1();const{selections:ListFilterByInfoRepresentation__selections,opaque:ListFilterByInfoRepresentation__opaque}=select$3$1();const{selections:ListReferenceRepresentation__selections,opaque:ListReferenceRepresentation__opaque}=select$6();const{selections:ListOrderByInfoRepresentation__selections,opaque:ListOrderByInfoRepresentation__opaque}=select$4$1();const{selections:ListUserPreferenceRepresentation__selections,opaque:ListUserPreferenceRepresentation__opaque}=select$5$1();return {kind:'Fragment',selections:[{name:'cloneable',kind:'Scalar'},{name:'createable',kind:'Scalar'},{name:'deletable',kind:'Scalar'},{name:'displayColumns',kind:'Object',plural:true,selections:ListColumnRepresentation__selections},{name:'filterLogicString',kind:'Scalar'},{name:'filteredByInfo',kind:'Object',plural:true,selections:ListFilterByInfoRepresentation__selections},{name:'label',kind:'Scalar'},{name:'listReference',kind:'Link',selections:ListReferenceRepresentation__selections},{name:'orderedByInfo',kind:'Object',plural:true,selections:ListOrderByInfoRepresentation__selections},{name:'updateable',kind:'Scalar'},{name:'userPreferences',kind:'Object',selections:ListUserPreferenceRepresentation__selections},{name:'visibility',kind:'Scalar'},{name:'visibilityEditable',kind:'Scalar'}]};};function equals$7(existing,incoming){if(existing.eTag!==incoming.eTag){return false;}return true;}const ingest$6=function ListInfoRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$g(input);if(validateError!==null){throw validateError;}}const key=keyBuilder$4({listViewApiName:input.listReference.listViewApiName,objectApiName:input.listReference.objectApiName,type:input.listReference.type});let incomingRecord=normalize$6(input,store.records[key],{fullPath:key,parent:path.parent},lds,store);const existingRecord=store.records[key];if(existingRecord===undefined||equals$7(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}return createLink$5(key);};function validate$h(obj,path='ListRecordCollectionRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_count=obj.count;const path_count=path+'.count';if(typeof obj_count!=='number'||typeof obj_count==='number'&&Math.floor(obj_count)!==obj_count){return new TypeError('Expected "integer" but received "'+typeof obj_count+'" (at "'+path_count+'")');}const obj_currentPageToken=obj.currentPageToken;const path_currentPageToken=path+'.currentPageToken';if(typeof obj_currentPageToken!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_currentPageToken+'" (at "'+path_currentPageToken+'")');}const obj_currentPageUrl=obj.currentPageUrl;const path_currentPageUrl=path+'.currentPageUrl';if(typeof obj_currentPageUrl!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_currentPageUrl+'" (at "'+path_currentPageUrl+'")');}const obj_fields=obj.fields;const path_fields=path+'.fields';if(!ArrayIsArray$6(obj_fields)){return new TypeError('Expected "array" but received "'+typeof obj_fields+'" (at "'+path_fields+'")');}for(let i=0;i<obj_fields.length;i++){const obj_fields_item=obj_fields[i];const path_fields_item=path_fields+'['+i+']';if(typeof obj_fields_item!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_fields_item+'" (at "'+path_fields_item+'")');}}const obj_listInfoETag=obj.listInfoETag;const path_listInfoETag=path+'.listInfoETag';if(typeof obj_listInfoETag!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_listInfoETag+'" (at "'+path_listInfoETag+'")');}const obj_listReference=obj.listReference;const path_listReference=path+'.listReference';if(typeof obj_listReference!=='object'){return new TypeError('Expected "object" but received "'+typeof obj_listReference+'" (at "'+path_listReference+'")');}const obj_nextPageToken=obj.nextPageToken;const path_nextPageToken=path+'.nextPageToken';let obj_nextPageToken_union0=null;const obj_nextPageToken_union0_error=(()=>{if(typeof obj_nextPageToken!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_nextPageToken+'" (at "'+path_nextPageToken+'")');}})();if(obj_nextPageToken_union0_error!=null){obj_nextPageToken_union0=obj_nextPageToken_union0_error.message;}let obj_nextPageToken_union1=null;const obj_nextPageToken_union1_error=(()=>{if(obj_nextPageToken!==null){return new TypeError('Expected "null" but received "'+typeof obj_nextPageToken+'" (at "'+path_nextPageToken+'")');}})();if(obj_nextPageToken_union1_error!=null){obj_nextPageToken_union1=obj_nextPageToken_union1_error.message;}if(obj_nextPageToken_union0&&obj_nextPageToken_union1){let message='Object doesn\'t match union (at "'+path_nextPageToken+'")';message+='\n'+obj_nextPageToken_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_nextPageToken_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_nextPageUrl=obj.nextPageUrl;const path_nextPageUrl=path+'.nextPageUrl';let obj_nextPageUrl_union0=null;const obj_nextPageUrl_union0_error=(()=>{if(typeof obj_nextPageUrl!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_nextPageUrl+'" (at "'+path_nextPageUrl+'")');}})();if(obj_nextPageUrl_union0_error!=null){obj_nextPageUrl_union0=obj_nextPageUrl_union0_error.message;}let obj_nextPageUrl_union1=null;const obj_nextPageUrl_union1_error=(()=>{if(obj_nextPageUrl!==null){return new TypeError('Expected "null" but received "'+typeof obj_nextPageUrl+'" (at "'+path_nextPageUrl+'")');}})();if(obj_nextPageUrl_union1_error!=null){obj_nextPageUrl_union1=obj_nextPageUrl_union1_error.message;}if(obj_nextPageUrl_union0&&obj_nextPageUrl_union1){let message='Object doesn\'t match union (at "'+path_nextPageUrl+'")';message+='\n'+obj_nextPageUrl_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_nextPageUrl_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_optionalFields=obj.optionalFields;const path_optionalFields=path+'.optionalFields';if(!ArrayIsArray$6(obj_optionalFields)){return new TypeError('Expected "array" but received "'+typeof obj_optionalFields+'" (at "'+path_optionalFields+'")');}for(let i=0;i<obj_optionalFields.length;i++){const obj_optionalFields_item=obj_optionalFields[i];const path_optionalFields_item=path_optionalFields+'['+i+']';if(typeof obj_optionalFields_item!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_optionalFields_item+'" (at "'+path_optionalFields_item+'")');}}const obj_pageSize=obj.pageSize;const path_pageSize=path+'.pageSize';if(typeof obj_pageSize!=='number'||typeof obj_pageSize==='number'&&Math.floor(obj_pageSize)!==obj_pageSize){return new TypeError('Expected "integer" but received "'+typeof obj_pageSize+'" (at "'+path_pageSize+'")');}const obj_previousPageToken=obj.previousPageToken;const path_previousPageToken=path+'.previousPageToken';let obj_previousPageToken_union0=null;const obj_previousPageToken_union0_error=(()=>{if(typeof obj_previousPageToken!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_previousPageToken+'" (at "'+path_previousPageToken+'")');}})();if(obj_previousPageToken_union0_error!=null){obj_previousPageToken_union0=obj_previousPageToken_union0_error.message;}let obj_previousPageToken_union1=null;const obj_previousPageToken_union1_error=(()=>{if(obj_previousPageToken!==null){return new TypeError('Expected "null" but received "'+typeof obj_previousPageToken+'" (at "'+path_previousPageToken+'")');}})();if(obj_previousPageToken_union1_error!=null){obj_previousPageToken_union1=obj_previousPageToken_union1_error.message;}if(obj_previousPageToken_union0&&obj_previousPageToken_union1){let message='Object doesn\'t match union (at "'+path_previousPageToken+'")';message+='\n'+obj_previousPageToken_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_previousPageToken_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_previousPageUrl=obj.previousPageUrl;const path_previousPageUrl=path+'.previousPageUrl';let obj_previousPageUrl_union0=null;const obj_previousPageUrl_union0_error=(()=>{if(typeof obj_previousPageUrl!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_previousPageUrl+'" (at "'+path_previousPageUrl+'")');}})();if(obj_previousPageUrl_union0_error!=null){obj_previousPageUrl_union0=obj_previousPageUrl_union0_error.message;}let obj_previousPageUrl_union1=null;const obj_previousPageUrl_union1_error=(()=>{if(obj_previousPageUrl!==null){return new TypeError('Expected "null" but received "'+typeof obj_previousPageUrl+'" (at "'+path_previousPageUrl+'")');}})();if(obj_previousPageUrl_union1_error!=null){obj_previousPageUrl_union1=obj_previousPageUrl_union1_error.message;}if(obj_previousPageUrl_union0&&obj_previousPageUrl_union1){let message='Object doesn\'t match union (at "'+path_previousPageUrl+'")';message+='\n'+obj_previousPageUrl_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_previousPageUrl_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_records=obj.records;const path_records=path+'.records';if(!ArrayIsArray$6(obj_records)){return new TypeError('Expected "array" but received "'+typeof obj_records+'" (at "'+path_records+'")');}for(let i=0;i<obj_records.length;i++){const obj_records_item=obj_records[i];const path_records_item=path_records+'['+i+']';if(typeof obj_records_item!=='object'){return new TypeError('Expected "object" but received "'+typeof obj_records_item+'" (at "'+path_records_item+'")');}}const obj_sortBy=obj.sortBy;const path_sortBy=path+'.sortBy';let obj_sortBy_union0=null;const obj_sortBy_union0_error=(()=>{if(!ArrayIsArray$6(obj_sortBy)){return new TypeError('Expected "array" but received "'+typeof obj_sortBy+'" (at "'+path_sortBy+'")');}for(let i=0;i<obj_sortBy.length;i++){const obj_sortBy_item=obj_sortBy[i];const path_sortBy_item=path_sortBy+'['+i+']';if(typeof obj_sortBy_item!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_sortBy_item+'" (at "'+path_sortBy_item+'")');}}})();if(obj_sortBy_union0_error!=null){obj_sortBy_union0=obj_sortBy_union0_error.message;}let obj_sortBy_union1=null;const obj_sortBy_union1_error=(()=>{if(obj_sortBy!==null){return new TypeError('Expected "null" but received "'+typeof obj_sortBy+'" (at "'+path_sortBy+'")');}})();if(obj_sortBy_union1_error!=null){obj_sortBy_union1=obj_sortBy_union1_error.message;}if(obj_sortBy_union0&&obj_sortBy_union1){let message='Object doesn\'t match union (at "'+path_sortBy+'")';message+='\n'+obj_sortBy_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_sortBy_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}})();return v_error===undefined?null:v_error;}function keyBuilder$5(config){return keyPrefix$4+'ListRecordCollectionRepresentation:'+config.listViewId+':'+(config.sortBy===null?'':'['+config.sortBy.join(',')+']');}function paginationKeyBuilder(config){return keyBuilder$5(config)+'__pagination';}function normalize$7(input,existing,path,lds,store,timestamp){const input_listReference=input.listReference;const input_listReference_id=path.fullPath+'__listReference';input.listReference=ingest$5$1(input_listReference,{fullPath:input_listReference_id,parent:{data:input,key:path.fullPath,existing:existing}},lds,store);const input_records=input.records;const input_records_id=path.fullPath+'__records';for(let i=0;i<input_records.length;i++){const input_records_item=input_records[i];let input_records_item_id=input_records_id+'__'+i;input_records[i]=ingest$2$1(input_records_item,{fullPath:input_records_item_id,parent:{data:input,key:path.fullPath,existing:existing}},lds,store,timestamp);}return input;}function equals$8(existing,incoming){const existing_count=existing.count;const incoming_count=incoming.count;if(!(existing_count===incoming_count)){return false;}const existing_pageSize=existing.pageSize;const incoming_pageSize=incoming.pageSize;if(!(existing_pageSize===incoming_pageSize)){return false;}const existing_currentPageToken=existing.currentPageToken;const incoming_currentPageToken=incoming.currentPageToken;if(!(existing_currentPageToken===incoming_currentPageToken)){return false;}const existing_currentPageUrl=existing.currentPageUrl;const incoming_currentPageUrl=incoming.currentPageUrl;if(!(existing_currentPageUrl===incoming_currentPageUrl)){return false;}const existing_listInfoETag=existing.listInfoETag;const incoming_listInfoETag=incoming.listInfoETag;if(!(existing_listInfoETag===incoming_listInfoETag)){return false;}const existing_fields=existing.fields;const incoming_fields=incoming.fields;const equals_fields_items=equalsArray(existing_fields,incoming_fields,(existing_fields_item,incoming_fields_item)=>{if(!(existing_fields_item===incoming_fields_item)){return false;}});if(equals_fields_items===false){return false;}const existing_listReference=existing.listReference;const incoming_listReference=incoming.listReference;if(!(existing_listReference.__ref===incoming_listReference.__ref)){return false;}const existing_nextPageToken=existing.nextPageToken;const incoming_nextPageToken=incoming.nextPageToken;if(!(existing_nextPageToken===incoming_nextPageToken)){return false;}const existing_nextPageUrl=existing.nextPageUrl;const incoming_nextPageUrl=incoming.nextPageUrl;if(!(existing_nextPageUrl===incoming_nextPageUrl)){return false;}const existing_optionalFields=existing.optionalFields;const incoming_optionalFields=incoming.optionalFields;const equals_optionalFields_items=equalsArray(existing_optionalFields,incoming_optionalFields,(existing_optionalFields_item,incoming_optionalFields_item)=>{if(!(existing_optionalFields_item===incoming_optionalFields_item)){return false;}});if(equals_optionalFields_items===false){return false;}const existing_previousPageToken=existing.previousPageToken;const incoming_previousPageToken=incoming.previousPageToken;if(!(existing_previousPageToken===incoming_previousPageToken)){return false;}const existing_previousPageUrl=existing.previousPageUrl;const incoming_previousPageUrl=incoming.previousPageUrl;if(!(existing_previousPageUrl===incoming_previousPageUrl)){return false;}const existing_records=existing.records;const incoming_records=incoming.records;const equals_records_items=equalsArray(existing_records,incoming_records,(existing_records_item,incoming_records_item)=>{if(!(existing_records_item.__ref===incoming_records_item.__ref)){return false;}});if(equals_records_items===false){return false;}const existing_sortBy=existing.sortBy;const incoming_sortBy=incoming.sortBy;if(!(()=>{if(existing_sortBy===null||incoming_sortBy===null){return existing_sortBy===incoming_sortBy;}const equals_sortBy_items=equalsArray(existing_sortBy,incoming_sortBy,(existing_sortBy_item,incoming_sortBy_item)=>{if(!(existing_sortBy_item===incoming_sortBy_item)){return false;}});if(equals_sortBy_items===false){return false;}})()){return false;}return true;}const ingest$7=function ListRecordCollectionRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$h(input);if(validateError!==null){throw validateError;}}const key=keyBuilder$5({listViewId:input.listInfoETag,sortBy:input.sortBy});let incomingRecord=normalize$7(input,store.records[key],{fullPath:key,parent:path.parent},lds,store,timestamp);const existingRecord=store.records[key];const paginationKey=paginationKeyBuilder({listViewId:input.listInfoETag,sortBy:input.sortBy});const{isPastEnd,offsetFor,save,setEnd,setToken}=lds.pagination(paginationKey);const currentOffset=offsetFor(input.currentPageToken);{if(currentOffset===undefined||existingRecord&&existingRecord.records.length<currentOffset){throw new RangeError("currentPageToken value "+input.currentPageToken+" not recognized");}}const nextOffset=currentOffset+input.count;if(input.nextPageToken){setToken(input.nextPageToken,nextOffset);if(isPastEnd(nextOffset)){setEnd(undefined);}}else {setEnd(nextOffset);}if(input.previousPageToken){// TODO - need request's pageSize to ingest previousPageToken at end of list
    if(input.nextPageToken){setToken(input.previousPageToken,currentOffset-input.count);}}save();if(existingRecord){incomingRecord.currentPageUrl=existingRecord.currentPageUrl;// TODO: needs optimization
    incomingRecord.records=[...existingRecord.records.slice(0,currentOffset),...incomingRecord.records,...(input.nextPageToken?existingRecord.records.slice(nextOffset):[])];}if(existingRecord===undefined||equals$8(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}return createLink$5(key);};function validate$i(obj,path='ListUiRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_eTag=obj.eTag;const path_eTag=path+'.eTag';if(typeof obj_eTag!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_eTag+'" (at "'+path_eTag+'")');}const obj_info=obj.info;const path_info=path+'.info';if(typeof obj_info!=='object'){return new TypeError('Expected "object" but received "'+typeof obj_info+'" (at "'+path_info+'")');}const obj_records=obj.records;const path_records=path+'.records';if(typeof obj_records!=='object'){return new TypeError('Expected "object" but received "'+typeof obj_records+'" (at "'+path_records+'")');}})();return v_error===undefined?null:v_error;}function keyBuilder$6(config){return keyPrefix$4+'ListUiRepresentation:'+(config.listViewApiName===null?'':config.listViewApiName)+':'+config.objectApiName+':'+config.type+':'+(config.sortBy===null?'':'['+config.sortBy.join(',')+']');}function normalize$8(input,existing,path,lds,store,timestamp){const input_info=input.info;const input_info_id=path.fullPath+'__info';input.info=ingest$6(input_info,{fullPath:input_info_id,parent:{data:input,key:path.fullPath,existing:existing}},lds,store);const input_records=input.records;const input_records_id=path.fullPath+'__records';input.records=ingest$7(input_records,{fullPath:input_records_id,parent:{data:input,key:path.fullPath,existing:existing}},lds,store,timestamp);return input;}function equals$9(existing,incoming){const existing_eTag=existing.eTag;const incoming_eTag=incoming.eTag;if(!(existing_eTag===incoming_eTag)){return false;}const existing_info=existing.info;const incoming_info=incoming.info;if(!(existing_info.__ref===incoming_info.__ref)){return false;}const existing_records=existing.records;const incoming_records=incoming.records;if(!(existing_records.__ref===incoming_records.__ref)){return false;}return true;}const ingest$8=function ListUiRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$i(input);if(validateError!==null){throw validateError;}}const key=keyBuilder$6({listViewApiName:input.info.listReference.listViewApiName,objectApiName:input.info.listReference.objectApiName,type:input.info.listReference.type,sortBy:input.records.sortBy});let incomingRecord=normalize$8(input,store.records[key],{fullPath:key,parent:path.parent},lds,store,timestamp);const existingRecord=store.records[key];if(existingRecord===undefined||equals$9(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}return createLink$5(key);};function getUiApiListUiByObjectApiNameAndListViewApiName(config){const key=keyBuilder$6({listViewApiName:config.urlParams.listViewApiName,objectApiName:config.urlParams.objectApiName,type:"listView",sortBy:config.queryParams.sortBy||null});const headers={};return {path:'/services/data/v49.0/ui-api/list-ui/'+config.urlParams.objectApiName+'/'+config.urlParams.listViewApiName+'',method:'get',body:null,urlParams:config.urlParams,queryParams:config.queryParams,key:key,ingest:ingest$8,headers};}const getListUiByApiName_ConfigPropertyNames$1={displayName:'getListUiByApiName',parameters:{required:['objectApiName','listViewApiName'],optional:['fields','optionalFields','pageSize','pageToken','sortBy']}};function coerceConfig$2(config){const coercedConfig={};const objectApiName=getObjectApiName(config.objectApiName);if(objectApiName!==undefined){coercedConfig.objectApiName=objectApiName;}const listViewApiName=config.listViewApiName;if(listViewApiName!==undefined){coercedConfig.listViewApiName=listViewApiName;}const fields=getFieldApiNamesArray(config.fields);if(fields!==undefined){coercedConfig.fields=fields;}const optionalFields=getFieldApiNamesArray(config.optionalFields);if(optionalFields!==undefined){coercedConfig.optionalFields=optionalFields;}const pageSize=config.pageSize;if(pageSize!==undefined){coercedConfig.pageSize=pageSize;}const pageToken=config.pageToken;if(pageToken!==undefined){coercedConfig.pageToken=pageToken;}const sortBy=config.sortBy;if(sortBy!==undefined){coercedConfig.sortBy=sortBy;}return coercedConfig;}function typeCheckConfig$2$1(untrustedConfig){const config={};const untrustedConfig_objectApiName=untrustedConfig.objectApiName;if(typeof untrustedConfig_objectApiName==='string'){config.objectApiName=untrustedConfig_objectApiName;}const untrustedConfig_listViewApiName=untrustedConfig.listViewApiName;if(typeof untrustedConfig_listViewApiName==='string'){config.listViewApiName=untrustedConfig_listViewApiName;}const untrustedConfig_fields=untrustedConfig.fields;if(ArrayIsArray$1$5(untrustedConfig_fields)){const untrustedConfig_fields_array=[];for(let i=0,arrayLength=untrustedConfig_fields.length;i<arrayLength;i++){const untrustedConfig_fields_item=untrustedConfig_fields[i];if(typeof untrustedConfig_fields_item==='string'){untrustedConfig_fields_array.push(untrustedConfig_fields_item);}}config.fields=untrustedConfig_fields_array;}const untrustedConfig_optionalFields=untrustedConfig.optionalFields;if(ArrayIsArray$1$5(untrustedConfig_optionalFields)){const untrustedConfig_optionalFields_array=[];for(let i=0,arrayLength=untrustedConfig_optionalFields.length;i<arrayLength;i++){const untrustedConfig_optionalFields_item=untrustedConfig_optionalFields[i];if(typeof untrustedConfig_optionalFields_item==='string'){untrustedConfig_optionalFields_array.push(untrustedConfig_optionalFields_item);}}config.optionalFields=untrustedConfig_optionalFields_array;}const untrustedConfig_pageSize=untrustedConfig.pageSize;if(typeof untrustedConfig_pageSize==='number'&&Math.floor(untrustedConfig_pageSize)===untrustedConfig_pageSize){config.pageSize=untrustedConfig_pageSize;}const untrustedConfig_pageToken=untrustedConfig.pageToken;if(typeof untrustedConfig_pageToken==='string'){config.pageToken=untrustedConfig_pageToken;}const untrustedConfig_sortBy=untrustedConfig.sortBy;if(ArrayIsArray$1$5(untrustedConfig_sortBy)){const untrustedConfig_sortBy_array=[];for(let i=0,arrayLength=untrustedConfig_sortBy.length;i<arrayLength;i++){const untrustedConfig_sortBy_item=untrustedConfig_sortBy[i];if(typeof untrustedConfig_sortBy_item==='string'){untrustedConfig_sortBy_array.push(untrustedConfig_sortBy_item);}}config.sortBy=untrustedConfig_sortBy_array;}return config;}function validateAdapterConfig$2$1(untrustedConfig,configPropertyNames){if(!untrustedIsObject$5(untrustedConfig)){return null;}{validateConfig$4(untrustedConfig,configPropertyNames);}const coercedConfig=coerceConfig$2(untrustedConfig);const config=typeCheckConfig$2$1(coercedConfig);if(!areRequiredParametersPresent$4(config,configPropertyNames)){return null;}return config;}function getUiApiListUiByListViewId(config){const key=keyPrefix$4+'ListUiRepresentation('+'fields:'+config.queryParams.fields+','+'optionalFields:'+config.queryParams.optionalFields+','+'pageSize:'+config.queryParams.pageSize+','+'pageToken:'+config.queryParams.pageToken+','+'sortBy:'+config.queryParams.sortBy+','+'listViewId:'+config.urlParams.listViewId+')';const headers={};return {path:'/services/data/v49.0/ui-api/list-ui/'+config.urlParams.listViewId+'',method:'get',body:null,urlParams:config.urlParams,queryParams:config.queryParams,key:key,ingest:ingest$8,headers};}const getListUiByListViewId_ConfigPropertyNames$1={displayName:'getListUiByListViewId',parameters:{required:['listViewId'],optional:['fields','optionalFields','pageSize','pageToken','sortBy']}};function coerceConfig$3(config){const coercedConfig={};const listViewId=config.listViewId;if(listViewId!==undefined){coercedConfig.listViewId=listViewId;}const fields=getFieldApiNamesArray(config.fields);if(fields!==undefined){coercedConfig.fields=fields;}const optionalFields=getFieldApiNamesArray(config.optionalFields);if(optionalFields!==undefined){coercedConfig.optionalFields=optionalFields;}const pageSize=config.pageSize;if(pageSize!==undefined){coercedConfig.pageSize=pageSize;}const pageToken=config.pageToken;if(pageToken!==undefined){coercedConfig.pageToken=pageToken;}const sortBy=config.sortBy;if(sortBy!==undefined){coercedConfig.sortBy=sortBy;}return coercedConfig;}function typeCheckConfig$3$1(untrustedConfig){const config={};const untrustedConfig_listViewId=untrustedConfig.listViewId;if(typeof untrustedConfig_listViewId==='string'){config.listViewId=untrustedConfig_listViewId;}const untrustedConfig_fields=untrustedConfig.fields;if(ArrayIsArray$1$5(untrustedConfig_fields)){const untrustedConfig_fields_array=[];for(let i=0,arrayLength=untrustedConfig_fields.length;i<arrayLength;i++){const untrustedConfig_fields_item=untrustedConfig_fields[i];if(typeof untrustedConfig_fields_item==='string'){untrustedConfig_fields_array.push(untrustedConfig_fields_item);}}config.fields=untrustedConfig_fields_array;}const untrustedConfig_optionalFields=untrustedConfig.optionalFields;if(ArrayIsArray$1$5(untrustedConfig_optionalFields)){const untrustedConfig_optionalFields_array=[];for(let i=0,arrayLength=untrustedConfig_optionalFields.length;i<arrayLength;i++){const untrustedConfig_optionalFields_item=untrustedConfig_optionalFields[i];if(typeof untrustedConfig_optionalFields_item==='string'){untrustedConfig_optionalFields_array.push(untrustedConfig_optionalFields_item);}}config.optionalFields=untrustedConfig_optionalFields_array;}const untrustedConfig_pageSize=untrustedConfig.pageSize;if(typeof untrustedConfig_pageSize==='number'&&Math.floor(untrustedConfig_pageSize)===untrustedConfig_pageSize){config.pageSize=untrustedConfig_pageSize;}const untrustedConfig_pageToken=untrustedConfig.pageToken;if(typeof untrustedConfig_pageToken==='string'){config.pageToken=untrustedConfig_pageToken;}const untrustedConfig_sortBy=untrustedConfig.sortBy;if(ArrayIsArray$1$5(untrustedConfig_sortBy)){const untrustedConfig_sortBy_array=[];for(let i=0,arrayLength=untrustedConfig_sortBy.length;i<arrayLength;i++){const untrustedConfig_sortBy_item=untrustedConfig_sortBy[i];if(typeof untrustedConfig_sortBy_item==='string'){untrustedConfig_sortBy_array.push(untrustedConfig_sortBy_item);}}config.sortBy=untrustedConfig_sortBy_array;}return config;}function validateAdapterConfig$3$1(untrustedConfig,configPropertyNames){if(!untrustedIsObject$5(untrustedConfig)){return null;}{validateConfig$4(untrustedConfig,configPropertyNames);}const coercedConfig=coerceConfig$3(untrustedConfig);const config=typeCheckConfig$3$1(coercedConfig);if(!areRequiredParametersPresent$4(config,configPropertyNames)){return null;}return config;}function validate$j(obj,path='ListViewSummaryRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_apiName=obj.apiName;const path_apiName=path+'.apiName';if(typeof obj_apiName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_apiName+'" (at "'+path_apiName+'")');}const obj_id=obj.id;const path_id=path+'.id';if(typeof obj_id!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_id+'" (at "'+path_id+'")');}const obj_label=obj.label;const path_label=path+'.label';if(typeof obj_label!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_label+'" (at "'+path_label+'")');}const obj_listUiUrl=obj.listUiUrl;const path_listUiUrl=path+'.listUiUrl';if(typeof obj_listUiUrl!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_listUiUrl+'" (at "'+path_listUiUrl+'")');}})();return v_error===undefined?null:v_error;}const select$8=function ListViewSummaryRepresentationSelect(){return {kind:'Fragment',selections:[{name:'apiName',kind:'Scalar'},{name:'id',kind:'Scalar'},{name:'label',kind:'Scalar'},{name:'listUiUrl',kind:'Scalar'}]};};function equals$a(existing,incoming){const existing_apiName=existing.apiName;const incoming_apiName=incoming.apiName;if(!(existing_apiName===incoming_apiName)){return false;}const existing_id=existing.id;const incoming_id=incoming.id;if(!(existing_id===incoming_id)){return false;}const existing_label=existing.label;const incoming_label=incoming.label;if(!(existing_label===incoming_label)){return false;}const existing_listUiUrl=existing.listUiUrl;const incoming_listUiUrl=incoming.listUiUrl;if(!(existing_listUiUrl===incoming_listUiUrl)){return false;}return true;}function validate$k(obj,path='ListViewSummaryCollectionRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_count=obj.count;const path_count=path+'.count';if(typeof obj_count!=='number'||typeof obj_count==='number'&&Math.floor(obj_count)!==obj_count){return new TypeError('Expected "integer" but received "'+typeof obj_count+'" (at "'+path_count+'")');}const obj_currentPageToken=obj.currentPageToken;const path_currentPageToken=path+'.currentPageToken';if(typeof obj_currentPageToken!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_currentPageToken+'" (at "'+path_currentPageToken+'")');}const obj_currentPageUrl=obj.currentPageUrl;const path_currentPageUrl=path+'.currentPageUrl';if(typeof obj_currentPageUrl!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_currentPageUrl+'" (at "'+path_currentPageUrl+'")');}const obj_eTag=obj.eTag;const path_eTag=path+'.eTag';if(typeof obj_eTag!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_eTag+'" (at "'+path_eTag+'")');}const obj_lists=obj.lists;const path_lists=path+'.lists';if(!ArrayIsArray$6(obj_lists)){return new TypeError('Expected "array" but received "'+typeof obj_lists+'" (at "'+path_lists+'")');}for(let i=0;i<obj_lists.length;i++){const obj_lists_item=obj_lists[i];const path_lists_item=path_lists+'['+i+']';const referenceListViewSummaryRepresentationValidationError=validate$j(obj_lists_item,path_lists_item);if(referenceListViewSummaryRepresentationValidationError!==null){let message='Object doesn\'t match ListViewSummaryRepresentation (at "'+path_lists_item+'")\n';message+=referenceListViewSummaryRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}const obj_nextPageToken=obj.nextPageToken;const path_nextPageToken=path+'.nextPageToken';let obj_nextPageToken_union0=null;const obj_nextPageToken_union0_error=(()=>{if(typeof obj_nextPageToken!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_nextPageToken+'" (at "'+path_nextPageToken+'")');}})();if(obj_nextPageToken_union0_error!=null){obj_nextPageToken_union0=obj_nextPageToken_union0_error.message;}let obj_nextPageToken_union1=null;const obj_nextPageToken_union1_error=(()=>{if(obj_nextPageToken!==null){return new TypeError('Expected "null" but received "'+typeof obj_nextPageToken+'" (at "'+path_nextPageToken+'")');}})();if(obj_nextPageToken_union1_error!=null){obj_nextPageToken_union1=obj_nextPageToken_union1_error.message;}if(obj_nextPageToken_union0&&obj_nextPageToken_union1){let message='Object doesn\'t match union (at "'+path_nextPageToken+'")';message+='\n'+obj_nextPageToken_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_nextPageToken_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_nextPageUrl=obj.nextPageUrl;const path_nextPageUrl=path+'.nextPageUrl';let obj_nextPageUrl_union0=null;const obj_nextPageUrl_union0_error=(()=>{if(typeof obj_nextPageUrl!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_nextPageUrl+'" (at "'+path_nextPageUrl+'")');}})();if(obj_nextPageUrl_union0_error!=null){obj_nextPageUrl_union0=obj_nextPageUrl_union0_error.message;}let obj_nextPageUrl_union1=null;const obj_nextPageUrl_union1_error=(()=>{if(obj_nextPageUrl!==null){return new TypeError('Expected "null" but received "'+typeof obj_nextPageUrl+'" (at "'+path_nextPageUrl+'")');}})();if(obj_nextPageUrl_union1_error!=null){obj_nextPageUrl_union1=obj_nextPageUrl_union1_error.message;}if(obj_nextPageUrl_union0&&obj_nextPageUrl_union1){let message='Object doesn\'t match union (at "'+path_nextPageUrl+'")';message+='\n'+obj_nextPageUrl_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_nextPageUrl_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_objectApiName=obj.objectApiName;const path_objectApiName=path+'.objectApiName';if(typeof obj_objectApiName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_objectApiName+'" (at "'+path_objectApiName+'")');}const obj_pageSize=obj.pageSize;const path_pageSize=path+'.pageSize';if(typeof obj_pageSize!=='number'||typeof obj_pageSize==='number'&&Math.floor(obj_pageSize)!==obj_pageSize){return new TypeError('Expected "integer" but received "'+typeof obj_pageSize+'" (at "'+path_pageSize+'")');}const obj_previousPageToken=obj.previousPageToken;const path_previousPageToken=path+'.previousPageToken';let obj_previousPageToken_union0=null;const obj_previousPageToken_union0_error=(()=>{if(typeof obj_previousPageToken!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_previousPageToken+'" (at "'+path_previousPageToken+'")');}})();if(obj_previousPageToken_union0_error!=null){obj_previousPageToken_union0=obj_previousPageToken_union0_error.message;}let obj_previousPageToken_union1=null;const obj_previousPageToken_union1_error=(()=>{if(obj_previousPageToken!==null){return new TypeError('Expected "null" but received "'+typeof obj_previousPageToken+'" (at "'+path_previousPageToken+'")');}})();if(obj_previousPageToken_union1_error!=null){obj_previousPageToken_union1=obj_previousPageToken_union1_error.message;}if(obj_previousPageToken_union0&&obj_previousPageToken_union1){let message='Object doesn\'t match union (at "'+path_previousPageToken+'")';message+='\n'+obj_previousPageToken_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_previousPageToken_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_previousPageUrl=obj.previousPageUrl;const path_previousPageUrl=path+'.previousPageUrl';let obj_previousPageUrl_union0=null;const obj_previousPageUrl_union0_error=(()=>{if(typeof obj_previousPageUrl!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_previousPageUrl+'" (at "'+path_previousPageUrl+'")');}})();if(obj_previousPageUrl_union0_error!=null){obj_previousPageUrl_union0=obj_previousPageUrl_union0_error.message;}let obj_previousPageUrl_union1=null;const obj_previousPageUrl_union1_error=(()=>{if(obj_previousPageUrl!==null){return new TypeError('Expected "null" but received "'+typeof obj_previousPageUrl+'" (at "'+path_previousPageUrl+'")');}})();if(obj_previousPageUrl_union1_error!=null){obj_previousPageUrl_union1=obj_previousPageUrl_union1_error.message;}if(obj_previousPageUrl_union0&&obj_previousPageUrl_union1){let message='Object doesn\'t match union (at "'+path_previousPageUrl+'")';message+='\n'+obj_previousPageUrl_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_previousPageUrl_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_queryString=obj.queryString;const path_queryString=path+'.queryString';let obj_queryString_union0=null;const obj_queryString_union0_error=(()=>{if(typeof obj_queryString!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_queryString+'" (at "'+path_queryString+'")');}})();if(obj_queryString_union0_error!=null){obj_queryString_union0=obj_queryString_union0_error.message;}let obj_queryString_union1=null;const obj_queryString_union1_error=(()=>{if(obj_queryString!==null){return new TypeError('Expected "null" but received "'+typeof obj_queryString+'" (at "'+path_queryString+'")');}})();if(obj_queryString_union1_error!=null){obj_queryString_union1=obj_queryString_union1_error.message;}if(obj_queryString_union0&&obj_queryString_union1){let message='Object doesn\'t match union (at "'+path_queryString+'")';message+='\n'+obj_queryString_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_queryString_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_recentListsOnly=obj.recentListsOnly;const path_recentListsOnly=path+'.recentListsOnly';if(typeof obj_recentListsOnly!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_recentListsOnly+'" (at "'+path_recentListsOnly+'")');}})();return v_error===undefined?null:v_error;}function keyBuilder$7(config){return keyPrefix$4+'ListViewSummaryCollectionRepresentation:'+config.objectApiName+':'+(config.queryString===null?'':config.queryString)+':'+config.recentListsOnly;}function paginationKeyBuilder$1(config){return keyBuilder$7(config)+'__pagination';}function normalize$9(input,existing,path,lds,store,timestamp){return input;}function equals$b(existing,incoming){const existing_recentListsOnly=existing.recentListsOnly;const incoming_recentListsOnly=incoming.recentListsOnly;if(!(existing_recentListsOnly===incoming_recentListsOnly)){return false;}const existing_count=existing.count;const incoming_count=incoming.count;if(!(existing_count===incoming_count)){return false;}const existing_pageSize=existing.pageSize;const incoming_pageSize=incoming.pageSize;if(!(existing_pageSize===incoming_pageSize)){return false;}const existing_currentPageToken=existing.currentPageToken;const incoming_currentPageToken=incoming.currentPageToken;if(!(existing_currentPageToken===incoming_currentPageToken)){return false;}const existing_currentPageUrl=existing.currentPageUrl;const incoming_currentPageUrl=incoming.currentPageUrl;if(!(existing_currentPageUrl===incoming_currentPageUrl)){return false;}const existing_eTag=existing.eTag;const incoming_eTag=incoming.eTag;if(!(existing_eTag===incoming_eTag)){return false;}const existing_objectApiName=existing.objectApiName;const incoming_objectApiName=incoming.objectApiName;if(!(existing_objectApiName===incoming_objectApiName)){return false;}const existing_lists=existing.lists;const incoming_lists=incoming.lists;const equals_lists_items=equalsArray(existing_lists,incoming_lists,(existing_lists_item,incoming_lists_item)=>{if(!equals$a(existing_lists_item,incoming_lists_item)){return false;}});if(equals_lists_items===false){return false;}const existing_nextPageToken=existing.nextPageToken;const incoming_nextPageToken=incoming.nextPageToken;if(!(existing_nextPageToken===incoming_nextPageToken)){return false;}const existing_nextPageUrl=existing.nextPageUrl;const incoming_nextPageUrl=incoming.nextPageUrl;if(!(existing_nextPageUrl===incoming_nextPageUrl)){return false;}const existing_previousPageToken=existing.previousPageToken;const incoming_previousPageToken=incoming.previousPageToken;if(!(existing_previousPageToken===incoming_previousPageToken)){return false;}const existing_previousPageUrl=existing.previousPageUrl;const incoming_previousPageUrl=incoming.previousPageUrl;if(!(existing_previousPageUrl===incoming_previousPageUrl)){return false;}const existing_queryString=existing.queryString;const incoming_queryString=incoming.queryString;if(!(existing_queryString===incoming_queryString)){return false;}return true;}const ingest$9=function ListViewSummaryCollectionRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$k(input);if(validateError!==null){throw validateError;}}const key=keyBuilder$7({objectApiName:input.objectApiName,queryString:input.queryString,recentListsOnly:input.recentListsOnly});let incomingRecord=normalize$9(input,store.records[key],{fullPath:key,parent:path.parent});const existingRecord=store.records[key];const paginationKey=paginationKeyBuilder$1({objectApiName:input.objectApiName,queryString:input.queryString,recentListsOnly:input.recentListsOnly});const{isPastEnd,offsetFor,save,setEnd,setToken}=lds.pagination(paginationKey);const currentOffset=offsetFor(input.currentPageToken);{if(currentOffset===undefined||existingRecord&&existingRecord.lists.length<currentOffset){throw new RangeError("currentPageToken value "+input.currentPageToken+" not recognized");}}const nextOffset=currentOffset+input.count;if(input.nextPageToken){setToken(input.nextPageToken,nextOffset);if(isPastEnd(nextOffset)){setEnd(undefined);}}else {setEnd(nextOffset);}if(input.previousPageToken){// TODO - need request's pageSize to ingest previousPageToken at end of list
    if(input.nextPageToken){setToken(input.previousPageToken,currentOffset-input.count);}}save();if(existingRecord){incomingRecord.currentPageUrl=existingRecord.currentPageUrl;// TODO: needs optimization
    incomingRecord.lists=[...existingRecord.lists.slice(0,currentOffset),...incomingRecord.lists,...(input.nextPageToken?existingRecord.lists.slice(nextOffset):[])];}if(existingRecord===undefined||equals$b(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}return createLink$5(key);};function getUiApiListUiByObjectApiName(config){const key=keyBuilder$7({objectApiName:config.urlParams.objectApiName,queryString:config.queryParams.q||null,recentListsOnly:config.queryParams.recentListsOnly||false});const headers={};return {path:'/services/data/v49.0/ui-api/list-ui/'+config.urlParams.objectApiName+'',method:'get',body:null,urlParams:config.urlParams,queryParams:config.queryParams,key:key,ingest:ingest$9,headers};}const getListViewSummaryCollection_ConfigPropertyNames={displayName:'getListViewSummaryCollection',parameters:{required:['objectApiName'],optional:['pageSize','pageToken','q','recentListsOnly']}};function coerceConfig$4(config){const coercedConfig={};const objectApiName=getObjectApiName(config.objectApiName);if(objectApiName!==undefined){coercedConfig.objectApiName=objectApiName;}const pageSize=config.pageSize;if(pageSize!==undefined){coercedConfig.pageSize=pageSize;}const pageToken=config.pageToken;if(pageToken!==undefined){coercedConfig.pageToken=pageToken;}const q=config.q;if(q!==undefined){coercedConfig.q=q;}const recentListsOnly=config.recentListsOnly;if(recentListsOnly!==undefined){coercedConfig.recentListsOnly=recentListsOnly;}return coercedConfig;}function typeCheckConfig$4$1(untrustedConfig){const config={};const untrustedConfig_objectApiName=untrustedConfig.objectApiName;if(typeof untrustedConfig_objectApiName==='string'){config.objectApiName=untrustedConfig_objectApiName;}const untrustedConfig_pageSize=untrustedConfig.pageSize;if(typeof untrustedConfig_pageSize==='number'&&Math.floor(untrustedConfig_pageSize)===untrustedConfig_pageSize){config.pageSize=untrustedConfig_pageSize;}const untrustedConfig_pageToken=untrustedConfig.pageToken;if(typeof untrustedConfig_pageToken==='string'){config.pageToken=untrustedConfig_pageToken;}const untrustedConfig_q=untrustedConfig.q;if(typeof untrustedConfig_q==='string'){config.q=untrustedConfig_q;}const untrustedConfig_recentListsOnly=untrustedConfig.recentListsOnly;if(typeof untrustedConfig_recentListsOnly==='boolean'){config.recentListsOnly=untrustedConfig_recentListsOnly;}return config;}function validateAdapterConfig$4$1(untrustedConfig,configPropertyNames){if(!untrustedIsObject$5(untrustedConfig)){return null;}{validateConfig$4(untrustedConfig,configPropertyNames);}const coercedConfig=coerceConfig$4(untrustedConfig);const config=typeCheckConfig$4$1(coercedConfig);if(!areRequiredParametersPresent$4(config,configPropertyNames)){return null;}return config;}function getUiApiMruListUiByObjectApiName(config){const key=keyBuilder$6({listViewApiName:null,objectApiName:config.urlParams.objectApiName,type:"mru",sortBy:config.queryParams.sortBy||null});const headers={};return {path:'/services/data/v49.0/ui-api/mru-list-ui/'+config.urlParams.objectApiName+'',method:'get',body:null,urlParams:config.urlParams,queryParams:config.queryParams,key:key,ingest:ingest$8,headers};}const getMruListUi_ConfigPropertyNames$1={displayName:'getMruListUi',parameters:{required:['objectApiName'],optional:['fields','optionalFields','pageSize','pageToken','sortBy']}};function coerceConfig$5(config){const coercedConfig={};const objectApiName=getObjectApiName(config.objectApiName);if(objectApiName!==undefined){coercedConfig.objectApiName=objectApiName;}const fields=getFieldApiNamesArray(config.fields);if(fields!==undefined){coercedConfig.fields=fields;}const optionalFields=getFieldApiNamesArray(config.optionalFields);if(optionalFields!==undefined){coercedConfig.optionalFields=optionalFields;}const pageSize=config.pageSize;if(pageSize!==undefined){coercedConfig.pageSize=pageSize;}const pageToken=config.pageToken;if(pageToken!==undefined){coercedConfig.pageToken=pageToken;}const sortBy=config.sortBy;if(sortBy!==undefined){coercedConfig.sortBy=sortBy;}return coercedConfig;}function typeCheckConfig$5$1(untrustedConfig){const config={};const untrustedConfig_objectApiName=untrustedConfig.objectApiName;if(typeof untrustedConfig_objectApiName==='string'){config.objectApiName=untrustedConfig_objectApiName;}const untrustedConfig_fields=untrustedConfig.fields;if(ArrayIsArray$1$5(untrustedConfig_fields)){const untrustedConfig_fields_array=[];for(let i=0,arrayLength=untrustedConfig_fields.length;i<arrayLength;i++){const untrustedConfig_fields_item=untrustedConfig_fields[i];if(typeof untrustedConfig_fields_item==='string'){untrustedConfig_fields_array.push(untrustedConfig_fields_item);}}config.fields=untrustedConfig_fields_array;}const untrustedConfig_optionalFields=untrustedConfig.optionalFields;if(ArrayIsArray$1$5(untrustedConfig_optionalFields)){const untrustedConfig_optionalFields_array=[];for(let i=0,arrayLength=untrustedConfig_optionalFields.length;i<arrayLength;i++){const untrustedConfig_optionalFields_item=untrustedConfig_optionalFields[i];if(typeof untrustedConfig_optionalFields_item==='string'){untrustedConfig_optionalFields_array.push(untrustedConfig_optionalFields_item);}}config.optionalFields=untrustedConfig_optionalFields_array;}const untrustedConfig_pageSize=untrustedConfig.pageSize;if(typeof untrustedConfig_pageSize==='number'&&Math.floor(untrustedConfig_pageSize)===untrustedConfig_pageSize){config.pageSize=untrustedConfig_pageSize;}const untrustedConfig_pageToken=untrustedConfig.pageToken;if(typeof untrustedConfig_pageToken==='string'){config.pageToken=untrustedConfig_pageToken;}const untrustedConfig_sortBy=untrustedConfig.sortBy;if(ArrayIsArray$1$5(untrustedConfig_sortBy)){const untrustedConfig_sortBy_array=[];for(let i=0,arrayLength=untrustedConfig_sortBy.length;i<arrayLength;i++){const untrustedConfig_sortBy_item=untrustedConfig_sortBy[i];if(typeof untrustedConfig_sortBy_item==='string'){untrustedConfig_sortBy_array.push(untrustedConfig_sortBy_item);}}config.sortBy=untrustedConfig_sortBy_array;}return config;}function validateAdapterConfig$5$1(untrustedConfig,configPropertyNames){if(!untrustedIsObject$5(untrustedConfig)){return null;}{validateConfig$4(untrustedConfig,configPropertyNames);}const coercedConfig=coerceConfig$5(untrustedConfig);const config=typeCheckConfig$5$1(coercedConfig);if(!areRequiredParametersPresent$4(config,configPropertyNames)){return null;}return config;}function getUiApiListRecordsByListViewId(config){const key=keyBuilder$5({listViewId:config.urlParams.listViewId,sortBy:config.queryParams.sortBy||null});const headers={};return {path:'/services/data/v49.0/ui-api/list-records/'+config.urlParams.listViewId+'',method:'get',body:null,urlParams:config.urlParams,queryParams:config.queryParams,key:key,ingest:ingest$7,headers};}function getUiApiListRecordsByObjectApiNameAndListViewApiName(config){const key=keyPrefix$4+'ListRecordCollectionRepresentation('+'fields:'+config.queryParams.fields+','+'optionalFields:'+config.queryParams.optionalFields+','+'pageSize:'+config.queryParams.pageSize+','+'pageToken:'+config.queryParams.pageToken+','+'sortBy:'+config.queryParams.sortBy+','+'objectApiName:'+config.urlParams.objectApiName+','+'listViewApiName:'+config.urlParams.listViewApiName+')';const headers={};return {path:'/services/data/v49.0/ui-api/list-records/'+config.urlParams.objectApiName+'/'+config.urlParams.listViewApiName+'',method:'get',body:null,urlParams:config.urlParams,queryParams:config.queryParams,key:key,ingest:ingest$7,headers};}const listReferences={byId:{},byApiNames:{}};/**
     * Adds a list reference so it can be retrieved with #getListReference later.
     *
     * @param listRef list refenence
     */function addListReference(listRef){if(listRef.id){listReferences.byId[listRef.id]=listRef;}listReferences.byApiNames[`${listRef.objectApiName}:${listRef.listViewApiName}`]=listRef;}/**
     * Returns a list reference from the store if it's present.
     *
     * @param query list view to look for
     * @param lds LDS
     */function getListReference(query){return query.listViewId?listReferences.byId[query.listViewId]:listReferences.byApiNames[`${query.objectApiName}:${query.listViewApiName}`];}/**
     * Reader selections to copy a list info
     */const LIST_INFO_SELECTIONS=select$7().selections;const LIST_INFO_SELECTIONS_ETAG=[...LIST_INFO_SELECTIONS,{kind:'Scalar',name:'eTag'}];/**
     * Retrieves the list info corresponding to the specified list reference from the store.
     *
     * @param listRef list reference
     * @param lds LDS
     */function getListInfo(listRef,lds){const key=keyBuilder$4(listRef);const lookupResult=lds.storeLookup({recordId:key,node:{kind:'Fragment',selections:LIST_INFO_SELECTIONS_ETAG},variables:{}});if(isFulfilledSnapshot$1(lookupResult)){return lookupResult.data;}}const serverDefaults={};/**
     * Update the default values based on a server response.
     *
     * @param config getListUi config
     * @param serverResponse ListUiRepresentation from the server
     */function addServerDefaults(config,serverResponse){const key=`${serverResponse.info.listReference.objectApiName}:${serverResponse.info.listReference.listViewApiName}`;let defaults=serverDefaults[key]||(serverDefaults[key]={});if(config.sortBy===undefined&&serverResponse.records.sortBy!==null){defaults.sortBy=serverResponse.records.sortBy;}}/**
     * Returns default values observed on previous requests for a list.
     *
     * @param config getListUi config
     * @returns defaults from previous requests for this list, or {} if no defaults are known
     */function getServerDefaults(config){const listRef=getListReference(config);if(listRef===undefined){return {};}const key=`${listRef.objectApiName}:${listRef.listViewApiName}`;return serverDefaults[key]||{};}// Logic to deal with fields on the list view. This would be reasonably straightforward
    // except that the server sometimes adds 5 well-known fields to every record & nested
    // record in its responses.
    // hardcoded fields that the server adds
    const DEFAULT_SERVER_FIELDS=['CreatedDate','Id','LastModifiedById','LastModifiedDate','SystemModstamp'];/**
     * Adds default fields for every record referenced in a given field name. E.g. if field
     * is "Opportunity.Account.Name" then add default fields "Opportunity.CreatedDate",
     * "Opportunity.Id", ..., "Opportunity.Account.CreatedDate", "Opportunity.Account.Id", ... .
     *
     * @param field explicitly included field
     * @param defaultFields fields object to be updated with the fields that the server will
     *    implicitly add
     */function addDefaultFields(field,defaultFields){const fieldParts=field.split('.');for(let i=1;i<fieldParts.length;++i){const fieldPrefix=fieldParts.slice(0,i).join('.');for(let j=0;j<DEFAULT_SERVER_FIELDS.length;++j){defaultFields[`${fieldPrefix}.${DEFAULT_SERVER_FIELDS[j]}`]=true;}}}/**
     * Indicates if a RecordRepresntation contains a specified field.
     *
     * @param record record
     * @param field field to check for, split on '.'s, with the leading object api name omitted.
     *    E.g. if searching an Opportunity for "Opportunity.Account.Name" this parameter should
     *    be ['Account','Name'].
     */function recordContainsField(record,field){// make sure it looks like a record and the first piece of the field path has a value
    if(!record||!record.fields||!record.fields[field[0]]||record.fields[field[0]].value===undefined){return false;}// recurse if nested record
    else if(field.length>1){return recordContainsField(record.fields[field[0]].value,field.slice(1));}// found it
    return true;}function listFields(lds,{fields=[],optionalFields=[],sortBy},listInfo){const{displayColumns,listReference:{objectApiName}}=listInfo;let fields_={},optionalFields_={},defaultFields_={};// all the fields in the list info are required
    for(let i=0,len=displayColumns.length;i<len;++i){const qualifiedField=`${objectApiName}.${displayColumns[i].fieldApiName}`;fields_[qualifiedField]=true;addDefaultFields(qualifiedField,defaultFields_);}// required fields from the component
    for(let i=0,len=fields.length;i<len;++i){const qualifiedField=fields[i].startsWith(`${objectApiName}.`)?fields[i]:`${objectApiName}.${fields[i]}`;if(!fields_[qualifiedField]){fields_[qualifiedField]=true;addDefaultFields(qualifiedField,defaultFields_);}}// optional fields from the component
    for(let i=0,len=optionalFields.length;i<len;++i){const qualifiedField=optionalFields[i].startsWith(`${objectApiName}.`)?optionalFields[i]:`${objectApiName}.${optionalFields[i]}`;if(!fields_[qualifiedField]){optionalFields_[qualifiedField]=true;addDefaultFields(qualifiedField,defaultFields_);}}const key=keyBuilder$5({listViewId:listInfo.eTag,sortBy:sortBy||null})+'__fieldstatus';const node=lds.getNode(key);const defaultServerFieldStatus=isGraphNode(node)?node.retrieve():{missingFields:_objectSpread$2({},defaultFields_)};return {getRecordSelectionFieldSets(){const optionalPlusDefaultFields=_objectSpread$2({},optionalFields_);const fields=keys$3(defaultFields_);for(let i=0;i<fields.length;++i){const field=fields[i];if(!fields_[field]&&!defaultServerFieldStatus.missingFields[field]){optionalPlusDefaultFields[field]=true;}}return [keys$3(fields_).sort(),keys$3(optionalPlusDefaultFields).sort()];},processRecords(records){const{missingFields}=defaultServerFieldStatus;const fields=keys$3(missingFields);for(let i=0;i<fields.length;++i){const field=fields[i],splitField=field.split('.').slice(1);for(let i=0;i<records.length;++i){if(recordContainsField(records[i],splitField)){delete missingFields[field];break;}}}lds.storePublish(key,defaultServerFieldStatus);// snapshots do not subscribe to this key, so no need to broadcast
    return this;}};}function paginatedDataCustomReader(key,selection,record,data,variables,reader){const nonCustomSelection={name:selection.name,plural:true,selections:selection.selections,pageToken:selection.pageToken,pageSize:selection.pageSize,tokenDataKey:selection.tokenDataKey};if(record[selection.name]&&record[selection.name][0]&&record[selection.name][0].__ref){nonCustomSelection.kind='Link';reader.readPluralLink(key,nonCustomSelection,record,data);}else {nonCustomSelection.kind='Object';reader.readPluralObject(key,nonCustomSelection,record,data);}const pagination=reader.pagination(selection.tokenDataKey);variables.__pageSize=selection.pageSize;const currentOffset=pagination.offsetFor(selection.pageToken);const nextOffset=currentOffset+selection.pageSize;const previousOffset=currentOffset-selection.pageSize;// count
    variables.count=data[selection.name].length;// current/next/previousPageToken
    variables.currentPageToken=selection.pageToken||pagination.defaultToken();const nextPageToken=pagination.isPastEnd(nextOffset)?null:pagination.tokenFor(nextOffset);if(nextPageToken!==undefined){variables.nextPageToken=nextPageToken;}const previousPageToken=previousOffset<0?null:pagination.tokenFor(previousOffset);if(previousPageToken!==undefined){variables.previousPageToken=previousPageToken;}// current/next/previousPageUrls cannot be generated until we have a template url
    }function variablesCustomReader(key,selection,record,data,variables,reader){reader.readScalar(selection.name,variables,data);}function urlCustomReader(key,selection,record,data,variables,reader){let urlProp=selection.name;let tokenProp=`${urlProp.substring(0,urlProp.indexOf('Url'))}Token`;if(variables[tokenProp]){// currentPageUrl should never be empty so use that as the template
    variables[urlProp]=record.currentPageUrl.replace(/pageToken=[^&]+/,`pageToken=${variables[tokenProp]}`).replace(/pageSize=\d+/,`pageSize=${variables.__pageSize}`);}else if(variables[tokenProp]===null){variables[urlProp]=null;}reader.readScalar(selection.name,variables,data);}/**
     * Constructs a PathSelection[] to have Reader correctly populate paginated data
     * and metadata in a Snapshot. The metadata is assumed to follow the standard
     * UI API naming conventions: count, currentPageToken, currentPageUrl,
     * nextPageToken, nextPageUrl, previousPageToken, and previousPageUrl.
     *
     * @param config.name name of the field containing the paginated data
     * @param config.pageSize number of items to be included
     * @param config.pageToken token corresponding to starting offset
     * @param config.selections PathSelection[] to apply to each item
     * @param config.tokenDataKey store key of the pagination data
     * @returns PathSelection[] to populate the paginated data and associated metadata
     */function pathSelectionsFor(config){return [{kind:'Custom',name:config.name,pageToken:config.pageToken,pageSize:config.pageSize,plural:true,reader:paginatedDataCustomReader,selections:config.selections,tokenDataKey:config.tokenDataKey},{kind:'Custom',name:'count',reader:variablesCustomReader},{kind:'Custom',name:'currentPageToken',reader:variablesCustomReader},{kind:'Custom',name:'currentPageUrl',reader:urlCustomReader},{kind:'Custom',name:'nextPageToken',reader:variablesCustomReader},{kind:'Custom',name:'nextPageUrl',reader:urlCustomReader},{kind:'Custom',name:'previousPageToken',reader:variablesCustomReader},{kind:'Custom',name:'previousPageUrl',reader:urlCustomReader}];}/**
     * Returns a PathSelection that injects a predetermined value at the specified name.
     *
     * @param config.name key associated with the value
     * @param config.value value to be injected
     */function staticValuePathSelection(config){return {kind:'Custom',name:config.name,reader:(key,_selection,_record,data,_variables,_reader)=>{data[key]=config.value;}};}/**
     * Examines a set of paginated data & metadata from an UnfulfilledSnapshot and computes a
     * pageToken and pageSize that will minimize the amount of data requested while still
     * satisfying the original request.
     *
     * @param config.name name of the field within data that contains the items
     * @param conifg.data paginated data/metadata from an UnfulfilledSnapshot
     * @param config.pageSize requested pageSize
     * @param config.pagination pagination data/functions from engine
     * @returns pageToken & pageSize to fill in the missing data
     */function minimizeRequest(config){// the only way to handle missing current or previous token is to ask for the full set of requested records
    if(!config.data||!config.data[config.name]||config.data.previousPageToken===undefined){return {pageSize:config.pageSize,pageToken:config.pageToken};}else {// compute the offset of the last record that was found
    const pageTokenOffset=config.pagination.offsetFor(config.data.currentPageToken);const lastFoundOffset=pageTokenOffset+config.data[config.name].length;// backup to the nearest offset for which we have a token
    const[newToken,newOffset]=config.pagination.tokenForAtMost(lastFoundOffset);// recompute pageToken and pageSize for query based on new starting token
    return {pageSize:pageTokenOffset-newOffset+config.pageSize,pageToken:newToken};}}// TODO RAML - this more properly goes in the generated resource files
    const DEFAULT_PAGE_SIZE=20;const LISTVIEWSUMMARY_PATH_SELECTIONS=select$8().selections;function buildListViewSummaryCollectionFragment(config){return {kind:'Fragment',selections:[...pathSelectionsFor({name:'lists',selections:LISTVIEWSUMMARY_PATH_SELECTIONS,pageSize:config.pageSize||DEFAULT_PAGE_SIZE,pageToken:config.pageToken,tokenDataKey:paginationKeyBuilder$1({objectApiName:config.objectApiName,queryString:config.q===undefined?null:config.q,recentListsOnly:config.recentListsOnly===undefined?false:config.recentListsOnly})}),{kind:'Scalar',name:'objectApiName'},staticValuePathSelection({name:'pageSize',value:config.pageSize===undefined?DEFAULT_PAGE_SIZE:config.pageSize}),{kind:'Scalar',name:'queryString'},{kind:'Scalar',name:'recentListsOnly'}]};}function buildInMemorySnapshot$3$1(lds,config){const request=getUiApiListUiByObjectApiName({urlParams:{objectApiName:config.objectApiName},queryParams:{pageSize:config.pageSize,pageToken:config.pageToken,q:config.q,recentListsOnly:config.recentListsOnly}});const selector={recordId:request.key,node:buildListViewSummaryCollectionFragment(config),variables:{}};return lds.storeLookup(selector);}function buildNetworkSnapshot$3$1(lds,config,snapshot){const request=getUiApiListUiByObjectApiName({urlParams:{objectApiName:config.objectApiName},queryParams:{pageSize:config.pageSize,pageToken:config.pageToken,q:config.q,recentListsOnly:config.recentListsOnly}});if(snapshot){// compute the minimum number of records we need to request
    const{pageSize,pageToken}=minimizeRequest({data:snapshot.data,name:'lists',pageSize:config.pageSize||DEFAULT_PAGE_SIZE,pageToken:config.pageToken,pagination:lds.pagination(paginationKeyBuilder$1({objectApiName:config.objectApiName,queryString:config.q===undefined?null:config.q,recentListsOnly:config.recentListsOnly===undefined?false:config.recentListsOnly}))});// update request, but don't harden default values unless they were already present
    if(pageSize!==DEFAULT_PAGE_SIZE||request.queryParams.pageSize!==undefined){request.queryParams.pageSize=pageSize;}if(pageToken||request.queryParams.pageToken!==undefined){request.queryParams.pageToken=pageToken;}}return lds.dispatchResourceRequest(request).then(resp=>{const{body}=resp;lds.storeIngest(request.key,request,body);lds.storeBroadcast();return buildInMemorySnapshot$3$1(lds,config);},error=>{lds.storeIngestFetchResponse(request.key,error);lds.storeBroadcast();return lds.errorSnapshot(error);});}const getListViewSummaryCollectionAdapterFactory=lds=>{return refreshable$5(function getListViewSummaryCollection(untrustedConfig){const config=validateAdapterConfig$4$1(untrustedConfig,getListViewSummaryCollection_ConfigPropertyNames);// Invalid or incomplete config
    if(config===null){return null;}const cacheSnapshot=buildInMemorySnapshot$3$1(lds,config);// Cache Hit
    if(isFulfilledSnapshot$1(cacheSnapshot)){return cacheSnapshot;}return buildNetworkSnapshot$3$1(lds,config,cacheSnapshot);},// Refresh snapshot
    untrustedConfig=>{const config=validateAdapterConfig$4$1(untrustedConfig,getListViewSummaryCollection_ConfigPropertyNames);// This should never happen
    if(config===null){throw new Error('Invalid config passed to "getListViewSummaryCollection" refresh function');}return buildNetworkSnapshot$3$1(lds,config);});};function getUiApiMruListRecordsByObjectApiName(config){const key=keyPrefix$4+'ListRecordCollectionRepresentation('+'fields:'+config.queryParams.fields+','+'optionalFields:'+config.queryParams.optionalFields+','+'pageSize:'+config.queryParams.pageSize+','+'pageToken:'+config.queryParams.pageToken+','+'sortBy:'+config.queryParams.sortBy+','+'objectApiName:'+config.urlParams.objectApiName+')';const headers={};return {path:'/services/data/v49.0/ui-api/mru-list-records/'+config.urlParams.objectApiName+'',method:'get',body:null,urlParams:config.urlParams,queryParams:config.queryParams,key:key,ingest:ingest$7,headers};}const LIST_REFERENCE_SELECTIONS=select$6().selections;// TODO RAML - this more properly goes in the generated resource files
    const DEFAULT_PAGE_SIZE$1=50;// make local copies of the adapter configs so we can ignore other getListUi config parameters to match
    // lds222 behavior
    const getMruListUi_ConfigPropertyNames_augmented$1=_objectSpread$2({},getMruListUi_ConfigPropertyNames$1,{parameters:_objectSpread$2({},getMruListUi_ConfigPropertyNames$1.parameters,{optional:[...getMruListUi_ConfigPropertyNames$1.parameters.optional,'listViewApiName','listViewId']})});function buildListUiFragment(config,listInfo,fields){return {kind:'Fragment',selections:[{kind:'Link',name:'info',selections:LIST_INFO_SELECTIONS},{kind:'Link',name:'records',selections:[...pathSelectionsFor({name:'records',pageSize:config.pageSize||DEFAULT_PAGE_SIZE$1,pageToken:config.pageToken,selections:buildSelectionFromFields(...fields.getRecordSelectionFieldSets()),tokenDataKey:paginationKeyBuilder({listViewId:listInfo.eTag,sortBy:config.sortBy===undefined?null:config.sortBy})}),{kind:'Scalar',name:'fields',plural:true},{kind:'Scalar',name:'listInfoETag'},{kind:'Link',name:'listReference',selections:LIST_REFERENCE_SELECTIONS},{kind:'Scalar',name:'optionalFields',plural:true},staticValuePathSelection({name:'pageSize',value:config.pageSize===undefined?DEFAULT_PAGE_SIZE$1:config.pageSize}),{// TODO - check type; re-verify after sortBy added to key
    kind:'Scalar',name:'sortBy'}]}]};}function buildInMemorySnapshot$4$1(lds,config,listInfo,fields){const listFields_=fields||listFields(lds,config,listInfo);const request=getUiApiMruListUiByObjectApiName({urlParams:{objectApiName:config.objectApiName},queryParams:{fields:config.fields,optionalFields:config.optionalFields,pageSize:config.pageSize,pageToken:config.pageToken,sortBy:config.sortBy}});const selector={recordId:request.key,node:buildListUiFragment(config,listInfo,listFields_),variables:{}};return lds.storeLookup(selector);}/**
     * Builds, sends, and processes the result of a mru-list-ui request, ignoring any cached
     * data for the list.
     *
     * @param lds LDS engine
     * @param config wire config
     */function buildNetworkSnapshot_getMruListUi(lds,config){const{fields,optionalFields,pageSize,pageToken,sortBy}=config;const queryParams={fields,optionalFields,pageSize,pageToken,sortBy};let request=getUiApiMruListUiByObjectApiName({urlParams:{objectApiName:config.objectApiName},queryParams});return lds.dispatchResourceRequest(request).then(response=>{const{body}=response;const listInfo=body.info;// TODO: server botches records.listReference but gets info.listReference correct,
    // see W-6933698
    body.records.listReference=body.info.listReference;// TODO: server should inject default pageSize when none was specified, see
    // W-6935308
    if(body.records.pageSize===null){body.records.pageSize=DEFAULT_PAGE_SIZE$1;}// TODO: server should inject default sortBy when none was specified, see
    // W-6935308
    if(body.records.sortBy===null);// server returns sortBy in csv format
    if(body.records.sortBy){body.records.sortBy=body.records.sortBy.split(',');}const listUiKey=keyBuilder$6(_objectSpread$2({},listInfo.listReference,{sortBy:body.records.sortBy}));// grab relevant bits before ingest destroys the structure
    const fields=listFields(lds,config,listInfo);fields.processRecords(body.records.records);// build the selector while the list info is still easily accessible
    const fragment=buildListUiFragment(config,listInfo,fields);lds.storeIngest(listUiKey,request,body);lds.storeBroadcast();return lds.storeLookup({recordId:listUiKey,node:fragment,variables:{}});},err=>{return lds.errorSnapshot(err);});}function buildNetworkSnapshot_getMruListRecords(lds,config,listInfo,snapshot){const{fields,optionalFields,pageSize,pageToken,sortBy}=config;const queryParams={fields,optionalFields,pageSize,pageToken,sortBy};const request=getUiApiMruListRecordsByObjectApiName({urlParams:{objectApiName:config.objectApiName},queryParams});if(snapshot){// compute the minimum number of records we need to request
    const{pageSize,pageToken}=minimizeRequest({data:snapshot.data?snapshot.data.records:null,name:'records',pageSize:config.pageSize||DEFAULT_PAGE_SIZE$1,pageToken:config.pageToken,pagination:lds.pagination(paginationKeyBuilder({listViewId:listInfo.eTag,sortBy:config.sortBy===undefined?null:config.sortBy}))});// update request, but don't harden default values unless they were already present
    if(pageSize!==DEFAULT_PAGE_SIZE$1||request.queryParams.pageSize!==undefined){request.queryParams.pageSize=pageSize;}if(pageToken!==undefined||request.queryParams.pageToken!==undefined){request.queryParams.pageToken=pageToken;}}return lds.dispatchResourceRequest(request).then(response=>{const{body}=response;const{listInfoETag}=body;// fall back to mru-list-ui if list view has changed
    if(listInfoETag!==listInfo.eTag){return buildNetworkSnapshot_getMruListUi(lds,config);}// TODO: server botches records.listReference but gets info.listReference correct,
    // see W-6933698
    body.listReference=listInfo.listReference;// TODO: server should inject default pageSize when none was specified, see
    // W-6935308
    if(body.pageSize===null){body.pageSize=DEFAULT_PAGE_SIZE$1;}// TODO: server should inject default sortBy when none was specified, see
    // W-6935308
    if(body.sortBy===null);// server returns sortBy in csv format
    if(body.sortBy){body.sortBy=body.sortBy.split(',');}const fields=listFields(lds,config,listInfo).processRecords(body.records);lds.storeIngest(keyBuilder$5({listViewId:listInfoETag,sortBy:body.sortBy}),request,body);lds.storeBroadcast();return buildInMemorySnapshot$4$1(lds,config,listInfo,fields);},err=>{lds.storeIngestFetchResponse(keyBuilder$6(_objectSpread$2({},listInfo.listReference,{sortBy:config.sortBy===undefined?null:config.sortBy})),err);lds.storeBroadcast();return lds.errorSnapshot(err);});}const getMruListUiAdapterFactory=lds=>{return refreshable$5(untrustedConfig=>{const config=validateAdapterConfig$5$1(untrustedConfig,getMruListUi_ConfigPropertyNames_augmented$1);if(config===null){return null;}// try to get a list reference and a list info for the list; this should come back
    // non-null if we have the list info cached
    const listInfo=getListInfo({id:null,listViewApiName:null,objectApiName:config.objectApiName,type:'mru'},lds);// no list info means it's not in the cache - make a full list-ui request
    if(!listInfo){return buildNetworkSnapshot_getMruListUi(lds,config);}// with the list info we can construct the full selector and try to get the
    // list ui from the store
    const snapshot=buildInMemorySnapshot$4$1(lds,config,listInfo);if(isFulfilledSnapshot$1(snapshot)){// cache hit :partyparrot:
    return snapshot;}// if there was an error or if the list ui was not found in the store then
    // make a full list-ui request
    else if(isErrorSnapshot$1(snapshot)||!snapshot.data){return buildNetworkSnapshot_getMruListUi(lds,config);}// we *should* only be missing records and/or tokens at this point; send a list-records
    // request to fill them in
    return buildNetworkSnapshot_getMruListRecords(lds,config,listInfo,snapshot);},untrustedConfig=>{const config=validateAdapterConfig$5$1(untrustedConfig,getMruListUi_ConfigPropertyNames$1);// This should never happen
    if(config===null){throw new Error('Invalid config passed to "getMruListUi" refresh function');}return buildNetworkSnapshot_getMruListUi(lds,config);});};const LIST_REFERENCE_SELECTIONS$1=select$6().selections;// TODO RAML - this more properly goes in the generated resource files
    const DEFAULT_PAGE_SIZE$2=50;// make local copies of the adapter configs so we can have them ignore each other's config parameters
    // to match lds222 behavior
    const getListUiByApiName_ConfigPropertyNames_augmented$1=_objectSpread$2({},getListUiByApiName_ConfigPropertyNames$1,{parameters:_objectSpread$2({},getListUiByApiName_ConfigPropertyNames$1.parameters,{optional:[...getListUiByApiName_ConfigPropertyNames$1.parameters.optional,'listViewId']})});const getListUiByListViewId_ConfigPropertyNames_augmented$1=_objectSpread$2({},getListUiByListViewId_ConfigPropertyNames$1,{parameters:_objectSpread$2({},getListUiByListViewId_ConfigPropertyNames$1.parameters,{optional:[...getListUiByListViewId_ConfigPropertyNames$1.parameters.optional,'listViewApiName','objectApiName']})});function getSortBy(config){if(config.sortBy!==undefined){return config.sortBy;}const defaults=getServerDefaults(config);if(defaults.sortBy!==undefined){return defaults.sortBy;}return null;}function buildListUiFragment$1(config,listInfo,fields){const defaultedConfig=_objectSpread$2({},getServerDefaults(config),config);return {kind:'Fragment',selections:[{kind:'Link',name:'info',selections:LIST_INFO_SELECTIONS},{kind:'Link',name:'records',selections:[...pathSelectionsFor({name:'records',pageSize:defaultedConfig.pageSize||DEFAULT_PAGE_SIZE$2,pageToken:defaultedConfig.pageToken,selections:buildSelectionFromFields(...fields.getRecordSelectionFieldSets()),tokenDataKey:paginationKeyBuilder({listViewId:listInfo.eTag,sortBy:defaultedConfig.sortBy===undefined?null:defaultedConfig.sortBy})}),{kind:'Scalar',name:'fields',plural:true},{kind:'Scalar',name:'listInfoETag'},{kind:'Link',name:'listReference',selections:LIST_REFERENCE_SELECTIONS$1},{kind:'Scalar',name:'optionalFields',plural:true},staticValuePathSelection({name:'pageSize',value:defaultedConfig.pageSize===undefined?DEFAULT_PAGE_SIZE$2:defaultedConfig.pageSize}),{kind:'Scalar',name:'sortBy',plural:true}]}]};}function buildInMemorySnapshot$5$1(lds,config,listInfo,fields){const listUiKey=keyBuilder$6(_objectSpread$2({},listInfo.listReference,{sortBy:getSortBy(config)}));const listFields_=fields||listFields(lds,config,listInfo);const selector={recordId:listUiKey,node:buildListUiFragment$1(config,listInfo,listFields_),variables:{}};return lds.storeLookup(selector);}/**
     * Builds, sends, and processes the result of a list-ui request, ignoring any cached
     * data for the list view.
     *
     * @param lds LDS engine
     * @param config wire config
     */function buildNetworkSnapshot_getListUi(lds,config){const{fields,optionalFields,pageSize,pageToken,sortBy}=config;const queryParams={fields,optionalFields,pageSize,pageToken,sortBy};let request;if(isGetListUiByApiNameConfig(config)){request=getUiApiListUiByObjectApiNameAndListViewApiName({urlParams:{listViewApiName:config.listViewApiName,objectApiName:config.objectApiName},queryParams});}else if(isGetListUiByListViewIdConfig(config)){request=getUiApiListUiByListViewId({urlParams:{listViewId:config.listViewId},queryParams});}else {throw new Error('unrecognized config');}return lds.dispatchResourceRequest(request).then(response=>{const{body}=response,listInfo=body.info,{listReference}=listInfo;// TODO: server botches records.listReference but gets info.listReference correct,
    // see W-6933698
    body.records.listReference=listReference;// TODO: server should inject default pageSize when none was specified, see
    // W-6935308
    if(body.records.pageSize===null){body.records.pageSize=DEFAULT_PAGE_SIZE$2;}// TODO: server should inject default sortBy when none was specified, see
    // W-6935308
    if(body.records.sortBy===null);// server returns sortBy in csv format
    if(body.records.sortBy){body.records.sortBy=body.records.sortBy.split(',');}const listUiKey=keyBuilder$6(_objectSpread$2({},listReference,{sortBy:body.records.sortBy}));// grab relevant bits before ingest destroys the structure
    const fields=listFields(lds,config,listInfo);fields.processRecords(body.records.records);// remember the id/name of this list
    addListReference(listReference);// remember any default values that the server filled in
    addServerDefaults(config,body);// build the selector while the list info is still easily accessible
    const fragment=buildListUiFragment$1(config,listInfo,fields);lds.storeIngest(listUiKey,request,body);lds.storeBroadcast();return lds.storeLookup({recordId:listUiKey,node:fragment,variables:{}});},err=>{return lds.errorSnapshot(err);});}function buildNetworkSnapshot_getListRecords(lds,config,listInfo,snapshot){const{fields,optionalFields,pageSize,pageToken,sortBy}=config;const queryParams={fields,optionalFields,pageSize,pageToken,sortBy};let request;if(isGetListUiByApiNameConfig(config)){request=getUiApiListRecordsByObjectApiNameAndListViewApiName({urlParams:{listViewApiName:config.listViewApiName,objectApiName:config.objectApiName},queryParams});}else if(isGetListUiByListViewIdConfig(config)){request=getUiApiListRecordsByListViewId({urlParams:{listViewId:config.listViewId},queryParams});}else {throw new Error('how did MRU config get here?');}if(snapshot){// compute the minimum number of records we need to request
    const{pageSize,pageToken}=minimizeRequest({data:snapshot.data?snapshot.data.records:null,name:'records',pageSize:config.pageSize||DEFAULT_PAGE_SIZE$2,pageToken:config.pageToken,pagination:lds.pagination(paginationKeyBuilder({listViewId:listInfo.eTag,sortBy:getSortBy(config)}))});// update request, but don't harden default values unless they were already present
    if(pageSize!==DEFAULT_PAGE_SIZE$2||request.queryParams.pageSize!==undefined){request.queryParams.pageSize=pageSize;}if(pageToken||request.queryParams.pageToken!==undefined){request.queryParams.pageToken=pageToken;}}return lds.dispatchResourceRequest(request).then(response=>{const{body}=response;const{listInfoETag}=body;// fall back to list-ui if list view has changed
    if(listInfoETag!==listInfo.eTag){return buildNetworkSnapshot_getListUi(lds,config);}// TODO: server botches records.listReference but gets info.listReference correct,
    // see W-6933698
    body.listReference=listInfo.listReference;// TODO: server should inject default pageSize when none was specified, see
    // W-6935308
    if(body.pageSize===null){body.pageSize=DEFAULT_PAGE_SIZE$2;}// TODO: server should inject default sortBy when none was specified, see
    // W-6935308
    if(body.sortBy===null);// server returns sortBy in csv format
    if(body.sortBy){body.sortBy=body.sortBy.split(',');}const fields=listFields(lds,config,listInfo).processRecords(body.records);lds.storeIngest(keyBuilder$5({listViewId:listInfoETag,sortBy:body.sortBy}),request,body);lds.storeBroadcast();return buildInMemorySnapshot$5$1(lds,config,listInfo,fields);},err=>{lds.storeIngestFetchResponse(keyBuilder$6(_objectSpread$2({},listInfo.listReference,{sortBy:getSortBy(config)})),err);lds.storeBroadcast();return lds.errorSnapshot(err);});}// functions to discern config variations
    function isGetListUiByApiNameConfig(config){return config.listViewApiName!==undefined;}function looksLikeGetListUiByApiNameConfig(untrustedConfig){return untrustedIsObject$5(untrustedConfig)&&untrustedConfig.objectApiName&&untrustedConfig.listViewApiName;}function isGetListUiByListViewIdConfig(config){return !!config.listViewId;}function looksLikeGetListUiByListViewIdConfig(untrustedConfig){return untrustedIsObject$5(untrustedConfig)&&untrustedConfig.listViewId;}function looksLikeGetListViewSummaryCollectionConfig(untrustedConfig){return untrustedIsObject$5(untrustedConfig)&&untrustedConfig.objectApiName&&!untrustedConfig.listViewId&&!untrustedConfig.listViewApiName;}function looksLikeGetMruListUiConfig(untrustedConfig){// the MRU symbol is a carryover hack from 222 and doesn't show up in any
    // of the generated config types, so we cast to any in order to check for it
    return untrustedIsObject$5(untrustedConfig)&&untrustedConfig.listViewApiName===MRU;}function validateGetListUiConfig(untrustedConfig){return looksLikeGetListUiByApiNameConfig(untrustedConfig)?validateAdapterConfig$2$1(untrustedConfig,getListUiByApiName_ConfigPropertyNames_augmented$1):looksLikeGetListUiByListViewIdConfig(untrustedConfig)?validateAdapterConfig$3$1(untrustedConfig,getListUiByListViewId_ConfigPropertyNames_augmented$1):null;}// the listViewApiName value to pass to getListUi() to request the MRU list
    const MRU=Symbol.for('MRU');const factory$4=lds=>{// adapter implementation for getListUiBy*
    const listUiAdapter=refreshable$5(untrustedConfig=>{const config=validateGetListUiConfig(untrustedConfig);if(config===null){return null;}// try to get a list reference and a list info for the list; this should come back
    // non-null if we have the list info cached
    const listRef=getListReference(config);const listInfo=listRef&&getListInfo(listRef,lds);// no list info means it's not in the cache - make a full list-ui request
    if(!listInfo){return buildNetworkSnapshot_getListUi(lds,config);}// with the list info we can construct the full selector and try to get the
    // list ui from the store
    const snapshot=buildInMemorySnapshot$5$1(lds,config,listInfo);if(isFulfilledSnapshot$1(snapshot)){// cache hit :partyparrot:
    return snapshot;}// if there was an error or if the list ui was not found in the store then
    // make a full list-ui request
    else if(isErrorSnapshot$1(snapshot)||!snapshot.data){return buildNetworkSnapshot_getListUi(lds,config);}// we *should* only be missing records and/or tokens at this point; send a list-records
    // request to fill them in
    return buildNetworkSnapshot_getListRecords(lds,config,listInfo,snapshot);},untrustedConfig=>{const config=validateGetListUiConfig(untrustedConfig);// This should never happen
    if(config===null){throw new Error('Invalid config passed to "getListUi" refresh function');}return buildNetworkSnapshot_getListUi(lds,config);});let listViewSummaryCollectionAdapter=null;let mruAdapter=null;// delegate to various other adapter based on what config looks like; note that the adapters
    // we delegate to are responsible for returning refreshable results
    return function(untrustedConfig){// if the MRU symbol is there then just return the getMruListUi adapter
    if(looksLikeGetMruListUiConfig(untrustedConfig)){if(mruAdapter===null){mruAdapter=getMruListUiAdapterFactory(lds);}// the symbol in the listViewApiName is just a hack so we can recognize the request as MRU
    const mruConfig=_objectSpread$2({},untrustedConfig);delete mruConfig.listViewApiName;return mruAdapter(mruConfig);}// if config has objectApiName but no listViewId or listViewApiName then hand off
    // to listViewSummaryCollectionAdapter
    if(looksLikeGetListViewSummaryCollectionConfig(untrustedConfig)){if(listViewSummaryCollectionAdapter===null){listViewSummaryCollectionAdapter=getListViewSummaryCollectionAdapterFactory(lds);}return listViewSummaryCollectionAdapter(untrustedConfig);}// see if config looks like a listViewId or listViewApiName request
    if(looksLikeGetListUiByApiNameConfig(untrustedConfig)||looksLikeGetListUiByListViewIdConfig(untrustedConfig)){return listUiAdapter(untrustedConfig);}return null;};};function getUiApiLookupsByObjectApiNameAndFieldApiNameAndTargetApiName(config){const key=keyPrefix$4+'RecordCollectionRepresentation('+'dependentFieldBindings:'+config.queryParams.dependentFieldBindings+','+'page:'+config.queryParams.page+','+'pageSize:'+config.queryParams.pageSize+','+'q:'+config.queryParams.q+','+'searchType:'+config.queryParams.searchType+','+'sourceRecordId:'+config.queryParams.sourceRecordId+','+'objectApiName:'+config.urlParams.objectApiName+','+'fieldApiName:'+config.urlParams.fieldApiName+','+'targetApiName:'+config.urlParams.targetApiName+')';const headers={};return {path:'/services/data/v49.0/ui-api/lookups/'+config.urlParams.objectApiName+'/'+config.urlParams.fieldApiName+'/'+config.urlParams.targetApiName+'',method:'get',body:null,urlParams:config.urlParams,queryParams:config.queryParams,key:key,ingest:ingest$5,headers};}function coerceConfig$6(config){const coercedConfig={};const objectApiName=config.objectApiName;if(objectApiName!==undefined){coercedConfig.objectApiName=objectApiName;}const fieldApiName=getFieldApiName(config.fieldApiName);if(fieldApiName!==undefined){coercedConfig.fieldApiName=fieldApiName;}const targetApiName=getObjectApiName(config.targetApiName);if(targetApiName!==undefined){coercedConfig.targetApiName=targetApiName;}const dependentFieldBindings=config.dependentFieldBindings;if(dependentFieldBindings!==undefined){coercedConfig.dependentFieldBindings=dependentFieldBindings;}const page=config.page;if(page!==undefined){coercedConfig.page=page;}const pageSize=config.pageSize;if(pageSize!==undefined){coercedConfig.pageSize=pageSize;}const q=config.q;if(q!==undefined){coercedConfig.q=q;}const searchType=config.searchType;if(searchType!==undefined){coercedConfig.searchType=searchType;}const sourceRecordId=config.sourceRecordId;if(sourceRecordId!==undefined){coercedConfig.sourceRecordId=sourceRecordId;}return coercedConfig;}function typeCheckConfig$6(untrustedConfig){const config={};const untrustedConfig_objectApiName=untrustedConfig.objectApiName;if(typeof untrustedConfig_objectApiName==='string'){config.objectApiName=untrustedConfig_objectApiName;}const untrustedConfig_fieldApiName=untrustedConfig.fieldApiName;if(typeof untrustedConfig_fieldApiName==='string'){config.fieldApiName=untrustedConfig_fieldApiName;}const untrustedConfig_targetApiName=untrustedConfig.targetApiName;if(typeof untrustedConfig_targetApiName==='string'){config.targetApiName=untrustedConfig_targetApiName;}const untrustedConfig_dependentFieldBindings=untrustedConfig.dependentFieldBindings;if(ArrayIsArray$1$5(untrustedConfig_dependentFieldBindings)){const untrustedConfig_dependentFieldBindings_array=[];for(let i=0,arrayLength=untrustedConfig_dependentFieldBindings.length;i<arrayLength;i++){const untrustedConfig_dependentFieldBindings_item=untrustedConfig_dependentFieldBindings[i];if(typeof untrustedConfig_dependentFieldBindings_item==='string'){untrustedConfig_dependentFieldBindings_array.push(untrustedConfig_dependentFieldBindings_item);}}config.dependentFieldBindings=untrustedConfig_dependentFieldBindings_array;}const untrustedConfig_page=untrustedConfig.page;if(typeof untrustedConfig_page==='number'&&Math.floor(untrustedConfig_page)===untrustedConfig_page){config.page=untrustedConfig_page;}const untrustedConfig_pageSize=untrustedConfig.pageSize;if(typeof untrustedConfig_pageSize==='number'&&Math.floor(untrustedConfig_pageSize)===untrustedConfig_pageSize){config.pageSize=untrustedConfig_pageSize;}const untrustedConfig_q=untrustedConfig.q;if(typeof untrustedConfig_q==='string'){config.q=untrustedConfig_q;}const untrustedConfig_searchType=untrustedConfig.searchType;if(typeof untrustedConfig_searchType==='string'){config.searchType=untrustedConfig_searchType;}const untrustedConfig_sourceRecordId=untrustedConfig.sourceRecordId;if(typeof untrustedConfig_sourceRecordId==='string'){config.sourceRecordId=untrustedConfig_sourceRecordId;}return config;}function validateAdapterConfig$6(untrustedConfig,configPropertyNames){if(!untrustedIsObject$5(untrustedConfig)){return null;}{validateConfig$4(untrustedConfig,configPropertyNames);}const coercedConfig=coerceConfig$6(untrustedConfig);const config=typeCheckConfig$6(coercedConfig);if(!areRequiredParametersPresent$4(config,configPropertyNames)){return null;}return config;}const paramNames={displayName:'getLookupRecords',parameters:{required:['fieldApiName','targetApiName'],optional:['requestParams']}};function coerceRequestParams(untrusted){if(!untrustedIsObject$5(untrusted)){return {};}const coercedConfig={};const requestParams=untrusted.requestParams||{};const dependentFieldBindings=requestParams.dependentFieldBindings;if(dependentFieldBindings!==undefined){coercedConfig.dependentFieldBindings=dependentFieldBindings;}const page=requestParams.page;if(page!==undefined){coercedConfig.page=page;}const pageSize=requestParams.pageSize;if(pageSize!==undefined){coercedConfig.pageSize=pageSize;}const q=requestParams.q;if(q!==undefined){coercedConfig.q=q;}const searchType=requestParams.searchType;if(searchType!==undefined){coercedConfig.searchType=searchType;}const sourceRecordId=requestParams.sourceRecordId;if(sourceRecordId!==undefined){coercedConfig.sourceRecordId=sourceRecordId;}return coercedConfig;}function coerceConfigWithDefaults$2(untrusted){const config=validateAdapterConfig$6(untrusted,paramNames);if(config===null){return config;}const coercedRequestParams=coerceRequestParams(untrusted);const{objectApiName,fieldApiName}=getFieldId(config.fieldApiName);return _objectSpread$2({},config,{objectApiName,fieldApiName},coercedRequestParams);}function removeEtags(recordRep){const{fields}=recordRep;delete recordRep.eTag;delete recordRep.weakEtag;Object.keys(fields).forEach(fieldName=>{const{value:nestedValue}=fields[fieldName];if(isSpanningRecord(nestedValue)){removeEtags(nestedValue);}});}function buildNetworkSnapshot$4$1(lds,config){const{objectApiName,fieldApiName,targetApiName}=config;const request=getUiApiLookupsByObjectApiNameAndFieldApiNameAndTargetApiName({urlParams:{objectApiName,fieldApiName,targetApiName},queryParams:{page:config.page,pageSize:config.pageSize,q:config.q,searchType:config.searchType,dependentFieldBindings:config.dependentFieldBindings,sourceRecordId:config.sourceRecordId}});return lds.dispatchResourceRequest(request).then(response=>{// TODO W-7235112 - remove this hack to never ingest lookup responses that
    // avoids issues caused by them not being real RecordRepresentations
    const{body}=response;const{records}=body;for(let i=0,len=records.length;i<len;i+=1){removeEtags(records[i]);}deepFreeze$9(body);return {state:'Fulfilled',recordId:request.key,variables:{},seenRecords:{},select:{recordId:request.key,node:{kind:'Fragment'},variables:{}},data:body};},err=>{return lds.errorSnapshot(err);});}const factory$5=lds=>{return refreshable$5(function(untrusted){const config=coerceConfigWithDefaults$2(untrusted);if(config===null){return null;}return buildNetworkSnapshot$4$1(lds,config);},untrusted=>{const config=coerceConfigWithDefaults$2(untrusted);if(config===null){throw new Error('Refresh should not be called with partial configuration');}return buildNetworkSnapshot$4$1(lds,config);});};function toSortedStringArray(value){const valueArray=isArray$3(value)?value:[value];if(valueArray.length!==0&&isArrayOfNonEmptyStrings(valueArray)){return dedupe(valueArray).sort();}return undefined;}const oneOfConfigPropertiesIdentifier=['layoutTypes','fields','optionalFields'];function coerceConfig$7(config){const coercedConfig={};const recordId=getRecordId18(config.recordId);if(recordId!==undefined){coercedConfig.recordId=recordId;}const childRelationships=config.childRelationships;if(childRelationships!==undefined){coercedConfig.childRelationships=childRelationships;}const fields=getFieldApiNamesArray(config.fields);if(fields!==undefined){coercedConfig.fields=fields;}const forms=config.forms;if(forms!==undefined){coercedConfig.forms=forms;}const layoutTypes=toSortedStringArray(config.layoutTypes);if(layoutTypes!==undefined){coercedConfig.layoutTypes=layoutTypes;}const modes=toSortedStringArray(config.modes);if(modes!==undefined){coercedConfig.modes=modes;}const optionalFields=getFieldApiNamesArray(config.optionalFields);if(optionalFields!==undefined){coercedConfig.optionalFields=optionalFields;}const pageSize=config.pageSize;if(pageSize!==undefined){coercedConfig.pageSize=pageSize;}const updateMru=config.updateMru;if(updateMru!==undefined){coercedConfig.updateMru=updateMru;}return coercedConfig;}function typeCheckConfig$7(untrustedConfig){const config={};const untrustedConfig_recordId=untrustedConfig.recordId;if(typeof untrustedConfig_recordId==='string'){config.recordId=untrustedConfig_recordId;}const untrustedConfig_childRelationships=untrustedConfig.childRelationships;if(ArrayIsArray$1$5(untrustedConfig_childRelationships)){const untrustedConfig_childRelationships_array=[];for(let i=0,arrayLength=untrustedConfig_childRelationships.length;i<arrayLength;i++){const untrustedConfig_childRelationships_item=untrustedConfig_childRelationships[i];if(typeof untrustedConfig_childRelationships_item==='string'){untrustedConfig_childRelationships_array.push(untrustedConfig_childRelationships_item);}}config.childRelationships=untrustedConfig_childRelationships_array;}const untrustedConfig_fields=untrustedConfig.fields;if(ArrayIsArray$1$5(untrustedConfig_fields)){const untrustedConfig_fields_array=[];for(let i=0,arrayLength=untrustedConfig_fields.length;i<arrayLength;i++){const untrustedConfig_fields_item=untrustedConfig_fields[i];if(typeof untrustedConfig_fields_item==='string'){untrustedConfig_fields_array.push(untrustedConfig_fields_item);}}config.fields=untrustedConfig_fields_array;}const untrustedConfig_forms=untrustedConfig.forms;if(ArrayIsArray$1$5(untrustedConfig_forms)){const untrustedConfig_forms_array=[];for(let i=0,arrayLength=untrustedConfig_forms.length;i<arrayLength;i++){const untrustedConfig_forms_item=untrustedConfig_forms[i];if(typeof untrustedConfig_forms_item==='string'){untrustedConfig_forms_array.push(untrustedConfig_forms_item);}}config.forms=untrustedConfig_forms_array;}const untrustedConfig_layoutTypes=untrustedConfig.layoutTypes;if(ArrayIsArray$1$5(untrustedConfig_layoutTypes)){const untrustedConfig_layoutTypes_array=[];for(let i=0,arrayLength=untrustedConfig_layoutTypes.length;i<arrayLength;i++){const untrustedConfig_layoutTypes_item=untrustedConfig_layoutTypes[i];if(typeof untrustedConfig_layoutTypes_item==='string'){untrustedConfig_layoutTypes_array.push(untrustedConfig_layoutTypes_item);}}config.layoutTypes=untrustedConfig_layoutTypes_array;}const untrustedConfig_modes=untrustedConfig.modes;if(ArrayIsArray$1$5(untrustedConfig_modes)){const untrustedConfig_modes_array=[];for(let i=0,arrayLength=untrustedConfig_modes.length;i<arrayLength;i++){const untrustedConfig_modes_item=untrustedConfig_modes[i];if(typeof untrustedConfig_modes_item==='string'){untrustedConfig_modes_array.push(untrustedConfig_modes_item);}}config.modes=untrustedConfig_modes_array;}const untrustedConfig_optionalFields=untrustedConfig.optionalFields;if(ArrayIsArray$1$5(untrustedConfig_optionalFields)){const untrustedConfig_optionalFields_array=[];for(let i=0,arrayLength=untrustedConfig_optionalFields.length;i<arrayLength;i++){const untrustedConfig_optionalFields_item=untrustedConfig_optionalFields[i];if(typeof untrustedConfig_optionalFields_item==='string'){untrustedConfig_optionalFields_array.push(untrustedConfig_optionalFields_item);}}config.optionalFields=untrustedConfig_optionalFields_array;}const untrustedConfig_pageSize=untrustedConfig.pageSize;if(typeof untrustedConfig_pageSize==='number'&&Math.floor(untrustedConfig_pageSize)===untrustedConfig_pageSize){config.pageSize=untrustedConfig_pageSize;}const untrustedConfig_updateMru=untrustedConfig.updateMru;if(typeof untrustedConfig_updateMru==='boolean'){config.updateMru=untrustedConfig_updateMru;}return config;}function validateAdapterConfig$7(untrustedConfig,configPropertyNames){if(!untrustedIsObject$5(untrustedConfig)){return null;}{validateConfig$4(untrustedConfig,configPropertyNames,oneOfConfigPropertiesIdentifier);}const coercedConfig=coerceConfig$7(untrustedConfig);const config=typeCheckConfig$7(coercedConfig);if(!areRequiredParametersPresent$4(config,configPropertyNames)){return null;}if(config.layoutTypes===undefined&&config.fields===undefined&&config.optionalFields===undefined){return null;}return config;}function validate$l(obj,path='ChildRelationshipRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_childObjectApiName=obj.childObjectApiName;const path_childObjectApiName=path+'.childObjectApiName';if(typeof obj_childObjectApiName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_childObjectApiName+'" (at "'+path_childObjectApiName+'")');}const obj_fieldName=obj.fieldName;const path_fieldName=path+'.fieldName';if(typeof obj_fieldName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_fieldName+'" (at "'+path_fieldName+'")');}const obj_junctionIdListNames=obj.junctionIdListNames;const path_junctionIdListNames=path+'.junctionIdListNames';if(!ArrayIsArray$6(obj_junctionIdListNames)){return new TypeError('Expected "array" but received "'+typeof obj_junctionIdListNames+'" (at "'+path_junctionIdListNames+'")');}for(let i=0;i<obj_junctionIdListNames.length;i++){const obj_junctionIdListNames_item=obj_junctionIdListNames[i];const path_junctionIdListNames_item=path_junctionIdListNames+'['+i+']';if(typeof obj_junctionIdListNames_item!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_junctionIdListNames_item+'" (at "'+path_junctionIdListNames_item+'")');}}const obj_junctionReferenceTo=obj.junctionReferenceTo;const path_junctionReferenceTo=path+'.junctionReferenceTo';if(!ArrayIsArray$6(obj_junctionReferenceTo)){return new TypeError('Expected "array" but received "'+typeof obj_junctionReferenceTo+'" (at "'+path_junctionReferenceTo+'")');}for(let i=0;i<obj_junctionReferenceTo.length;i++){const obj_junctionReferenceTo_item=obj_junctionReferenceTo[i];const path_junctionReferenceTo_item=path_junctionReferenceTo+'['+i+']';if(typeof obj_junctionReferenceTo_item!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_junctionReferenceTo_item+'" (at "'+path_junctionReferenceTo_item+'")');}}const obj_relationshipName=obj.relationshipName;const path_relationshipName=path+'.relationshipName';if(typeof obj_relationshipName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_relationshipName+'" (at "'+path_relationshipName+'")');}})();return v_error===undefined?null:v_error;}function deepFreeze$9$1(input){const input_junctionIdListNames=input.junctionIdListNames;ObjectFreeze$5(input_junctionIdListNames);const input_junctionReferenceTo=input.junctionReferenceTo;ObjectFreeze$5(input_junctionReferenceTo);ObjectFreeze$5(input);}function validate$m(obj,path='FilteredLookupInfoRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_controllingFields=obj.controllingFields;const path_controllingFields=path+'.controllingFields';if(!ArrayIsArray$6(obj_controllingFields)){return new TypeError('Expected "array" but received "'+typeof obj_controllingFields+'" (at "'+path_controllingFields+'")');}for(let i=0;i<obj_controllingFields.length;i++){const obj_controllingFields_item=obj_controllingFields[i];const path_controllingFields_item=path_controllingFields+'['+i+']';if(typeof obj_controllingFields_item!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_controllingFields_item+'" (at "'+path_controllingFields_item+'")');}}const obj_dependent=obj.dependent;const path_dependent=path+'.dependent';if(typeof obj_dependent!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_dependent+'" (at "'+path_dependent+'")');}const obj_optionalFilter=obj.optionalFilter;const path_optionalFilter=path+'.optionalFilter';if(typeof obj_optionalFilter!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_optionalFilter+'" (at "'+path_optionalFilter+'")');}})();return v_error===undefined?null:v_error;}function deepFreeze$a(input){const input_controllingFields=input.controllingFields;ObjectFreeze$5(input_controllingFields);ObjectFreeze$5(input);}function validate$n(obj,path='ReferenceToInfoRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_apiName=obj.apiName;const path_apiName=path+'.apiName';if(typeof obj_apiName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_apiName+'" (at "'+path_apiName+'")');}const obj_nameFields=obj.nameFields;const path_nameFields=path+'.nameFields';if(!ArrayIsArray$6(obj_nameFields)){return new TypeError('Expected "array" but received "'+typeof obj_nameFields+'" (at "'+path_nameFields+'")');}for(let i=0;i<obj_nameFields.length;i++){const obj_nameFields_item=obj_nameFields[i];const path_nameFields_item=path_nameFields+'['+i+']';if(typeof obj_nameFields_item!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_nameFields_item+'" (at "'+path_nameFields_item+'")');}}})();return v_error===undefined?null:v_error;}function deepFreeze$b(input){const input_nameFields=input.nameFields;ObjectFreeze$5(input_nameFields);ObjectFreeze$5(input);}function validate$o(obj,path='FieldRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_apiName=obj.apiName;const path_apiName=path+'.apiName';if(typeof obj_apiName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_apiName+'" (at "'+path_apiName+'")');}const obj_calculated=obj.calculated;const path_calculated=path+'.calculated';if(typeof obj_calculated!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_calculated+'" (at "'+path_calculated+'")');}const obj_compound=obj.compound;const path_compound=path+'.compound';if(typeof obj_compound!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_compound+'" (at "'+path_compound+'")');}const obj_compoundComponentName=obj.compoundComponentName;const path_compoundComponentName=path+'.compoundComponentName';let obj_compoundComponentName_union0=null;const obj_compoundComponentName_union0_error=(()=>{if(typeof obj_compoundComponentName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_compoundComponentName+'" (at "'+path_compoundComponentName+'")');}})();if(obj_compoundComponentName_union0_error!=null){obj_compoundComponentName_union0=obj_compoundComponentName_union0_error.message;}let obj_compoundComponentName_union1=null;const obj_compoundComponentName_union1_error=(()=>{if(obj_compoundComponentName!==null){return new TypeError('Expected "null" but received "'+typeof obj_compoundComponentName+'" (at "'+path_compoundComponentName+'")');}})();if(obj_compoundComponentName_union1_error!=null){obj_compoundComponentName_union1=obj_compoundComponentName_union1_error.message;}if(obj_compoundComponentName_union0&&obj_compoundComponentName_union1){let message='Object doesn\'t match union (at "'+path_compoundComponentName+'")';message+='\n'+obj_compoundComponentName_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_compoundComponentName_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_compoundFieldName=obj.compoundFieldName;const path_compoundFieldName=path+'.compoundFieldName';let obj_compoundFieldName_union0=null;const obj_compoundFieldName_union0_error=(()=>{if(typeof obj_compoundFieldName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_compoundFieldName+'" (at "'+path_compoundFieldName+'")');}})();if(obj_compoundFieldName_union0_error!=null){obj_compoundFieldName_union0=obj_compoundFieldName_union0_error.message;}let obj_compoundFieldName_union1=null;const obj_compoundFieldName_union1_error=(()=>{if(obj_compoundFieldName!==null){return new TypeError('Expected "null" but received "'+typeof obj_compoundFieldName+'" (at "'+path_compoundFieldName+'")');}})();if(obj_compoundFieldName_union1_error!=null){obj_compoundFieldName_union1=obj_compoundFieldName_union1_error.message;}if(obj_compoundFieldName_union0&&obj_compoundFieldName_union1){let message='Object doesn\'t match union (at "'+path_compoundFieldName+'")';message+='\n'+obj_compoundFieldName_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_compoundFieldName_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_controllerName=obj.controllerName;const path_controllerName=path+'.controllerName';let obj_controllerName_union0=null;const obj_controllerName_union0_error=(()=>{if(typeof obj_controllerName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_controllerName+'" (at "'+path_controllerName+'")');}})();if(obj_controllerName_union0_error!=null){obj_controllerName_union0=obj_controllerName_union0_error.message;}let obj_controllerName_union1=null;const obj_controllerName_union1_error=(()=>{if(obj_controllerName!==null){return new TypeError('Expected "null" but received "'+typeof obj_controllerName+'" (at "'+path_controllerName+'")');}})();if(obj_controllerName_union1_error!=null){obj_controllerName_union1=obj_controllerName_union1_error.message;}if(obj_controllerName_union0&&obj_controllerName_union1){let message='Object doesn\'t match union (at "'+path_controllerName+'")';message+='\n'+obj_controllerName_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_controllerName_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_controllingFields=obj.controllingFields;const path_controllingFields=path+'.controllingFields';if(!ArrayIsArray$6(obj_controllingFields)){return new TypeError('Expected "array" but received "'+typeof obj_controllingFields+'" (at "'+path_controllingFields+'")');}for(let i=0;i<obj_controllingFields.length;i++){const obj_controllingFields_item=obj_controllingFields[i];const path_controllingFields_item=path_controllingFields+'['+i+']';if(typeof obj_controllingFields_item!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_controllingFields_item+'" (at "'+path_controllingFields_item+'")');}}const obj_createable=obj.createable;const path_createable=path+'.createable';if(typeof obj_createable!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_createable+'" (at "'+path_createable+'")');}const obj_custom=obj.custom;const path_custom=path+'.custom';if(typeof obj_custom!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_custom+'" (at "'+path_custom+'")');}const obj_dataType=obj.dataType;const path_dataType=path+'.dataType';if(typeof obj_dataType!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_dataType+'" (at "'+path_dataType+'")');}const obj_extraTypeInfo=obj.extraTypeInfo;const path_extraTypeInfo=path+'.extraTypeInfo';let obj_extraTypeInfo_union0=null;const obj_extraTypeInfo_union0_error=(()=>{if(typeof obj_extraTypeInfo!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_extraTypeInfo+'" (at "'+path_extraTypeInfo+'")');}})();if(obj_extraTypeInfo_union0_error!=null){obj_extraTypeInfo_union0=obj_extraTypeInfo_union0_error.message;}let obj_extraTypeInfo_union1=null;const obj_extraTypeInfo_union1_error=(()=>{if(obj_extraTypeInfo!==null){return new TypeError('Expected "null" but received "'+typeof obj_extraTypeInfo+'" (at "'+path_extraTypeInfo+'")');}})();if(obj_extraTypeInfo_union1_error!=null){obj_extraTypeInfo_union1=obj_extraTypeInfo_union1_error.message;}if(obj_extraTypeInfo_union0&&obj_extraTypeInfo_union1){let message='Object doesn\'t match union (at "'+path_extraTypeInfo+'")';message+='\n'+obj_extraTypeInfo_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_extraTypeInfo_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_filterable=obj.filterable;const path_filterable=path+'.filterable';if(typeof obj_filterable!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_filterable+'" (at "'+path_filterable+'")');}const obj_filteredLookupInfo=obj.filteredLookupInfo;const path_filteredLookupInfo=path+'.filteredLookupInfo';let obj_filteredLookupInfo_union0=null;const obj_filteredLookupInfo_union0_error=(()=>{const referenceFilteredLookupInfoRepresentationValidationError=validate$m(obj_filteredLookupInfo,path_filteredLookupInfo);if(referenceFilteredLookupInfoRepresentationValidationError!==null){let message='Object doesn\'t match FilteredLookupInfoRepresentation (at "'+path_filteredLookupInfo+'")\n';message+=referenceFilteredLookupInfoRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}})();if(obj_filteredLookupInfo_union0_error!=null){obj_filteredLookupInfo_union0=obj_filteredLookupInfo_union0_error.message;}let obj_filteredLookupInfo_union1=null;const obj_filteredLookupInfo_union1_error=(()=>{if(obj_filteredLookupInfo!==null){return new TypeError('Expected "null" but received "'+typeof obj_filteredLookupInfo+'" (at "'+path_filteredLookupInfo+'")');}})();if(obj_filteredLookupInfo_union1_error!=null){obj_filteredLookupInfo_union1=obj_filteredLookupInfo_union1_error.message;}if(obj_filteredLookupInfo_union0&&obj_filteredLookupInfo_union1){let message='Object doesn\'t match union (at "'+path_filteredLookupInfo+'")';message+='\n'+obj_filteredLookupInfo_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_filteredLookupInfo_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_highScaleNumber=obj.highScaleNumber;const path_highScaleNumber=path+'.highScaleNumber';if(typeof obj_highScaleNumber!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_highScaleNumber+'" (at "'+path_highScaleNumber+'")');}const obj_htmlFormatted=obj.htmlFormatted;const path_htmlFormatted=path+'.htmlFormatted';if(typeof obj_htmlFormatted!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_htmlFormatted+'" (at "'+path_htmlFormatted+'")');}const obj_inlineHelpText=obj.inlineHelpText;const path_inlineHelpText=path+'.inlineHelpText';let obj_inlineHelpText_union0=null;const obj_inlineHelpText_union0_error=(()=>{if(typeof obj_inlineHelpText!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_inlineHelpText+'" (at "'+path_inlineHelpText+'")');}})();if(obj_inlineHelpText_union0_error!=null){obj_inlineHelpText_union0=obj_inlineHelpText_union0_error.message;}let obj_inlineHelpText_union1=null;const obj_inlineHelpText_union1_error=(()=>{if(obj_inlineHelpText!==null){return new TypeError('Expected "null" but received "'+typeof obj_inlineHelpText+'" (at "'+path_inlineHelpText+'")');}})();if(obj_inlineHelpText_union1_error!=null){obj_inlineHelpText_union1=obj_inlineHelpText_union1_error.message;}if(obj_inlineHelpText_union0&&obj_inlineHelpText_union1){let message='Object doesn\'t match union (at "'+path_inlineHelpText+'")';message+='\n'+obj_inlineHelpText_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_inlineHelpText_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_label=obj.label;const path_label=path+'.label';if(typeof obj_label!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_label+'" (at "'+path_label+'")');}const obj_length=obj.length;const path_length=path+'.length';if(typeof obj_length!=='number'||typeof obj_length==='number'&&Math.floor(obj_length)!==obj_length){return new TypeError('Expected "integer" but received "'+typeof obj_length+'" (at "'+path_length+'")');}const obj_nameField=obj.nameField;const path_nameField=path+'.nameField';if(typeof obj_nameField!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_nameField+'" (at "'+path_nameField+'")');}const obj_polymorphicForeignKey=obj.polymorphicForeignKey;const path_polymorphicForeignKey=path+'.polymorphicForeignKey';if(typeof obj_polymorphicForeignKey!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_polymorphicForeignKey+'" (at "'+path_polymorphicForeignKey+'")');}const obj_precision=obj.precision;const path_precision=path+'.precision';if(typeof obj_precision!=='number'||typeof obj_precision==='number'&&Math.floor(obj_precision)!==obj_precision){return new TypeError('Expected "integer" but received "'+typeof obj_precision+'" (at "'+path_precision+'")');}const obj_reference=obj.reference;const path_reference=path+'.reference';if(typeof obj_reference!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_reference+'" (at "'+path_reference+'")');}const obj_referenceTargetField=obj.referenceTargetField;const path_referenceTargetField=path+'.referenceTargetField';let obj_referenceTargetField_union0=null;const obj_referenceTargetField_union0_error=(()=>{if(typeof obj_referenceTargetField!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_referenceTargetField+'" (at "'+path_referenceTargetField+'")');}})();if(obj_referenceTargetField_union0_error!=null){obj_referenceTargetField_union0=obj_referenceTargetField_union0_error.message;}let obj_referenceTargetField_union1=null;const obj_referenceTargetField_union1_error=(()=>{if(obj_referenceTargetField!==null){return new TypeError('Expected "null" but received "'+typeof obj_referenceTargetField+'" (at "'+path_referenceTargetField+'")');}})();if(obj_referenceTargetField_union1_error!=null){obj_referenceTargetField_union1=obj_referenceTargetField_union1_error.message;}if(obj_referenceTargetField_union0&&obj_referenceTargetField_union1){let message='Object doesn\'t match union (at "'+path_referenceTargetField+'")';message+='\n'+obj_referenceTargetField_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_referenceTargetField_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_referenceToInfos=obj.referenceToInfos;const path_referenceToInfos=path+'.referenceToInfos';if(!ArrayIsArray$6(obj_referenceToInfos)){return new TypeError('Expected "array" but received "'+typeof obj_referenceToInfos+'" (at "'+path_referenceToInfos+'")');}for(let i=0;i<obj_referenceToInfos.length;i++){const obj_referenceToInfos_item=obj_referenceToInfos[i];const path_referenceToInfos_item=path_referenceToInfos+'['+i+']';const referenceReferenceToInfoRepresentationValidationError=validate$n(obj_referenceToInfos_item,path_referenceToInfos_item);if(referenceReferenceToInfoRepresentationValidationError!==null){let message='Object doesn\'t match ReferenceToInfoRepresentation (at "'+path_referenceToInfos_item+'")\n';message+=referenceReferenceToInfoRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}const obj_relationshipName=obj.relationshipName;const path_relationshipName=path+'.relationshipName';let obj_relationshipName_union0=null;const obj_relationshipName_union0_error=(()=>{if(typeof obj_relationshipName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_relationshipName+'" (at "'+path_relationshipName+'")');}})();if(obj_relationshipName_union0_error!=null){obj_relationshipName_union0=obj_relationshipName_union0_error.message;}let obj_relationshipName_union1=null;const obj_relationshipName_union1_error=(()=>{if(obj_relationshipName!==null){return new TypeError('Expected "null" but received "'+typeof obj_relationshipName+'" (at "'+path_relationshipName+'")');}})();if(obj_relationshipName_union1_error!=null){obj_relationshipName_union1=obj_relationshipName_union1_error.message;}if(obj_relationshipName_union0&&obj_relationshipName_union1){let message='Object doesn\'t match union (at "'+path_relationshipName+'")';message+='\n'+obj_relationshipName_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_relationshipName_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_required=obj.required;const path_required=path+'.required';if(typeof obj_required!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_required+'" (at "'+path_required+'")');}const obj_scale=obj.scale;const path_scale=path+'.scale';if(typeof obj_scale!=='number'||typeof obj_scale==='number'&&Math.floor(obj_scale)!==obj_scale){return new TypeError('Expected "integer" but received "'+typeof obj_scale+'" (at "'+path_scale+'")');}const obj_searchPrefilterable=obj.searchPrefilterable;const path_searchPrefilterable=path+'.searchPrefilterable';if(typeof obj_searchPrefilterable!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_searchPrefilterable+'" (at "'+path_searchPrefilterable+'")');}const obj_sortable=obj.sortable;const path_sortable=path+'.sortable';if(typeof obj_sortable!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_sortable+'" (at "'+path_sortable+'")');}const obj_unique=obj.unique;const path_unique=path+'.unique';if(typeof obj_unique!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_unique+'" (at "'+path_unique+'")');}const obj_updateable=obj.updateable;const path_updateable=path+'.updateable';if(typeof obj_updateable!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_updateable+'" (at "'+path_updateable+'")');}})();return v_error===undefined?null:v_error;}function deepFreeze$c(input){const input_controllingFields=input.controllingFields;ObjectFreeze$5(input_controllingFields);const input_filteredLookupInfo=input.filteredLookupInfo;if(input_filteredLookupInfo!==null&&typeof input_filteredLookupInfo==='object'){deepFreeze$a(input_filteredLookupInfo);}const input_referenceToInfos=input.referenceToInfos;for(let i=0;i<input_referenceToInfos.length;i++){const input_referenceToInfos_item=input_referenceToInfos[i];deepFreeze$b(input_referenceToInfos_item);}ObjectFreeze$5(input_referenceToInfos);ObjectFreeze$5(input);}function validate$p(obj,path='ThemeInfoRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_color=obj.color;const path_color=path+'.color';if(typeof obj_color!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_color+'" (at "'+path_color+'")');}const obj_iconUrl=obj.iconUrl;const path_iconUrl=path+'.iconUrl';let obj_iconUrl_union0=null;const obj_iconUrl_union0_error=(()=>{if(typeof obj_iconUrl!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_iconUrl+'" (at "'+path_iconUrl+'")');}})();if(obj_iconUrl_union0_error!=null){obj_iconUrl_union0=obj_iconUrl_union0_error.message;}let obj_iconUrl_union1=null;const obj_iconUrl_union1_error=(()=>{if(obj_iconUrl!==null){return new TypeError('Expected "null" but received "'+typeof obj_iconUrl+'" (at "'+path_iconUrl+'")');}})();if(obj_iconUrl_union1_error!=null){obj_iconUrl_union1=obj_iconUrl_union1_error.message;}if(obj_iconUrl_union0&&obj_iconUrl_union1){let message='Object doesn\'t match union (at "'+path_iconUrl+'")';message+='\n'+obj_iconUrl_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_iconUrl_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}})();return v_error===undefined?null:v_error;}function deepFreeze$d(input){ObjectFreeze$5(input);}const TTL$1=900000;function validate$q(obj,path='ObjectInfoRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_apiName=obj.apiName;const path_apiName=path+'.apiName';if(typeof obj_apiName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_apiName+'" (at "'+path_apiName+'")');}const obj_childRelationships=obj.childRelationships;const path_childRelationships=path+'.childRelationships';if(!ArrayIsArray$6(obj_childRelationships)){return new TypeError('Expected "array" but received "'+typeof obj_childRelationships+'" (at "'+path_childRelationships+'")');}for(let i=0;i<obj_childRelationships.length;i++){const obj_childRelationships_item=obj_childRelationships[i];const path_childRelationships_item=path_childRelationships+'['+i+']';const referenceChildRelationshipRepresentationValidationError=validate$l(obj_childRelationships_item,path_childRelationships_item);if(referenceChildRelationshipRepresentationValidationError!==null){let message='Object doesn\'t match ChildRelationshipRepresentation (at "'+path_childRelationships_item+'")\n';message+=referenceChildRelationshipRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}const obj_createable=obj.createable;const path_createable=path+'.createable';if(typeof obj_createable!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_createable+'" (at "'+path_createable+'")');}const obj_custom=obj.custom;const path_custom=path+'.custom';if(typeof obj_custom!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_custom+'" (at "'+path_custom+'")');}const obj_defaultRecordTypeId=obj.defaultRecordTypeId;const path_defaultRecordTypeId=path+'.defaultRecordTypeId';let obj_defaultRecordTypeId_union0=null;const obj_defaultRecordTypeId_union0_error=(()=>{if(typeof obj_defaultRecordTypeId!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_defaultRecordTypeId+'" (at "'+path_defaultRecordTypeId+'")');}})();if(obj_defaultRecordTypeId_union0_error!=null){obj_defaultRecordTypeId_union0=obj_defaultRecordTypeId_union0_error.message;}let obj_defaultRecordTypeId_union1=null;const obj_defaultRecordTypeId_union1_error=(()=>{if(obj_defaultRecordTypeId!==null){return new TypeError('Expected "null" but received "'+typeof obj_defaultRecordTypeId+'" (at "'+path_defaultRecordTypeId+'")');}})();if(obj_defaultRecordTypeId_union1_error!=null){obj_defaultRecordTypeId_union1=obj_defaultRecordTypeId_union1_error.message;}if(obj_defaultRecordTypeId_union0&&obj_defaultRecordTypeId_union1){let message='Object doesn\'t match union (at "'+path_defaultRecordTypeId+'")';message+='\n'+obj_defaultRecordTypeId_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_defaultRecordTypeId_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_deletable=obj.deletable;const path_deletable=path+'.deletable';if(typeof obj_deletable!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_deletable+'" (at "'+path_deletable+'")');}const obj_dependentFields=obj.dependentFields;const path_dependentFields=path+'.dependentFields';if(typeof obj_dependentFields!=='object'||ArrayIsArray$6(obj_dependentFields)||obj_dependentFields===null){return new TypeError('Expected "object" but received "'+typeof obj_dependentFields+'" (at "'+path_dependentFields+'")');}const obj_dependentFields_keys=ObjectKeys$5(obj_dependentFields);for(let i=0;i<obj_dependentFields_keys.length;i++){const key=obj_dependentFields_keys[i];const obj_dependentFields_prop=obj_dependentFields[key];const path_dependentFields_prop=path_dependentFields+'["'+key+'"]';if(typeof obj_dependentFields_prop!=='object'||ArrayIsArray$6(obj_dependentFields_prop)||obj_dependentFields_prop===null){return new TypeError('Expected "object" but received "'+typeof obj_dependentFields_prop+'" (at "'+path_dependentFields_prop+'")');}}const obj_eTag=obj.eTag;const path_eTag=path+'.eTag';if(typeof obj_eTag!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_eTag+'" (at "'+path_eTag+'")');}const obj_feedEnabled=obj.feedEnabled;const path_feedEnabled=path+'.feedEnabled';if(typeof obj_feedEnabled!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_feedEnabled+'" (at "'+path_feedEnabled+'")');}const obj_fields=obj.fields;const path_fields=path+'.fields';if(typeof obj_fields!=='object'||ArrayIsArray$6(obj_fields)||obj_fields===null){return new TypeError('Expected "object" but received "'+typeof obj_fields+'" (at "'+path_fields+'")');}const obj_fields_keys=ObjectKeys$5(obj_fields);for(let i=0;i<obj_fields_keys.length;i++){const key=obj_fields_keys[i];const obj_fields_prop=obj_fields[key];const path_fields_prop=path_fields+'["'+key+'"]';const referenceFieldRepresentationValidationError=validate$o(obj_fields_prop,path_fields_prop);if(referenceFieldRepresentationValidationError!==null){let message='Object doesn\'t match FieldRepresentation (at "'+path_fields_prop+'")\n';message+=referenceFieldRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}const obj_keyPrefix=obj.keyPrefix;const path_keyPrefix=path+'.keyPrefix';let obj_keyPrefix_union0=null;const obj_keyPrefix_union0_error=(()=>{if(typeof obj_keyPrefix!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_keyPrefix+'" (at "'+path_keyPrefix+'")');}})();if(obj_keyPrefix_union0_error!=null){obj_keyPrefix_union0=obj_keyPrefix_union0_error.message;}let obj_keyPrefix_union1=null;const obj_keyPrefix_union1_error=(()=>{if(obj_keyPrefix!==null){return new TypeError('Expected "null" but received "'+typeof obj_keyPrefix+'" (at "'+path_keyPrefix+'")');}})();if(obj_keyPrefix_union1_error!=null){obj_keyPrefix_union1=obj_keyPrefix_union1_error.message;}if(obj_keyPrefix_union0&&obj_keyPrefix_union1){let message='Object doesn\'t match union (at "'+path_keyPrefix+'")';message+='\n'+obj_keyPrefix_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_keyPrefix_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_label=obj.label;const path_label=path+'.label';if(typeof obj_label!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_label+'" (at "'+path_label+'")');}const obj_labelPlural=obj.labelPlural;const path_labelPlural=path+'.labelPlural';if(typeof obj_labelPlural!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_labelPlural+'" (at "'+path_labelPlural+'")');}const obj_layoutable=obj.layoutable;const path_layoutable=path+'.layoutable';if(typeof obj_layoutable!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_layoutable+'" (at "'+path_layoutable+'")');}const obj_mruEnabled=obj.mruEnabled;const path_mruEnabled=path+'.mruEnabled';if(typeof obj_mruEnabled!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_mruEnabled+'" (at "'+path_mruEnabled+'")');}const obj_nameFields=obj.nameFields;const path_nameFields=path+'.nameFields';if(!ArrayIsArray$6(obj_nameFields)){return new TypeError('Expected "array" but received "'+typeof obj_nameFields+'" (at "'+path_nameFields+'")');}for(let i=0;i<obj_nameFields.length;i++){const obj_nameFields_item=obj_nameFields[i];const path_nameFields_item=path_nameFields+'['+i+']';if(typeof obj_nameFields_item!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_nameFields_item+'" (at "'+path_nameFields_item+'")');}}const obj_queryable=obj.queryable;const path_queryable=path+'.queryable';if(typeof obj_queryable!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_queryable+'" (at "'+path_queryable+'")');}const obj_recordTypeInfos=obj.recordTypeInfos;const path_recordTypeInfos=path+'.recordTypeInfos';if(typeof obj_recordTypeInfos!=='object'||ArrayIsArray$6(obj_recordTypeInfos)||obj_recordTypeInfos===null){return new TypeError('Expected "object" but received "'+typeof obj_recordTypeInfos+'" (at "'+path_recordTypeInfos+'")');}const obj_recordTypeInfos_keys=ObjectKeys$5(obj_recordTypeInfos);for(let i=0;i<obj_recordTypeInfos_keys.length;i++){const key=obj_recordTypeInfos_keys[i];const obj_recordTypeInfos_prop=obj_recordTypeInfos[key];const path_recordTypeInfos_prop=path_recordTypeInfos+'["'+key+'"]';const referenceRecordTypeInfoRepresentationValidationError=validate$9(obj_recordTypeInfos_prop,path_recordTypeInfos_prop);if(referenceRecordTypeInfoRepresentationValidationError!==null){let message='Object doesn\'t match RecordTypeInfoRepresentation (at "'+path_recordTypeInfos_prop+'")\n';message+=referenceRecordTypeInfoRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}const obj_searchable=obj.searchable;const path_searchable=path+'.searchable';if(typeof obj_searchable!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_searchable+'" (at "'+path_searchable+'")');}const obj_themeInfo=obj.themeInfo;const path_themeInfo=path+'.themeInfo';let obj_themeInfo_union0=null;const obj_themeInfo_union0_error=(()=>{const referenceThemeInfoRepresentationValidationError=validate$p(obj_themeInfo,path_themeInfo);if(referenceThemeInfoRepresentationValidationError!==null){let message='Object doesn\'t match ThemeInfoRepresentation (at "'+path_themeInfo+'")\n';message+=referenceThemeInfoRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}})();if(obj_themeInfo_union0_error!=null){obj_themeInfo_union0=obj_themeInfo_union0_error.message;}let obj_themeInfo_union1=null;const obj_themeInfo_union1_error=(()=>{if(obj_themeInfo!==null){return new TypeError('Expected "null" but received "'+typeof obj_themeInfo+'" (at "'+path_themeInfo+'")');}})();if(obj_themeInfo_union1_error!=null){obj_themeInfo_union1=obj_themeInfo_union1_error.message;}if(obj_themeInfo_union0&&obj_themeInfo_union1){let message='Object doesn\'t match union (at "'+path_themeInfo+'")';message+='\n'+obj_themeInfo_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_themeInfo_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_updateable=obj.updateable;const path_updateable=path+'.updateable';if(typeof obj_updateable!=='boolean'){return new TypeError('Expected "boolean" but received "'+typeof obj_updateable+'" (at "'+path_updateable+'")');}})();return v_error===undefined?null:v_error;}function keyBuilder$8(config){return keyPrefix$4+'ObjectInfoRepresentation:'+config.apiName;}function normalize$a(input,existing,path,lds,store,timestamp){return input;}const select$9=function ObjectInfoRepresentationSelect(){return {kind:'Fragment',selections:[{name:'apiName',kind:'Scalar'},{name:'childRelationships',kind:'Object',opaque:true},{name:'createable',kind:'Scalar'},{name:'custom',kind:'Scalar'},{name:'defaultRecordTypeId',kind:'Scalar'},{name:'deletable',kind:'Scalar'},{name:'dependentFields',kind:'Object',opaque:true},{name:'feedEnabled',kind:'Scalar'},{name:'fields',kind:'Object',opaque:true},{name:'keyPrefix',kind:'Scalar'},{name:'label',kind:'Scalar'},{name:'labelPlural',kind:'Scalar'},{name:'layoutable',kind:'Scalar'},{name:'mruEnabled',kind:'Scalar'},{name:'nameFields',kind:'Object',opaque:true},{name:'queryable',kind:'Scalar'},{name:'recordTypeInfos',kind:'Object',opaque:true},{name:'searchable',kind:'Scalar'},{name:'themeInfo',kind:'Object',opaque:true},{name:'updateable',kind:'Scalar'}]};};function equals$c(existing,incoming){if(existing.eTag!==incoming.eTag){return false;}return true;}function deepFreeze$e(input){const input_childRelationships=input.childRelationships;for(let i=0;i<input_childRelationships.length;i++){const input_childRelationships_item=input_childRelationships[i];deepFreeze$9$1(input_childRelationships_item);}ObjectFreeze$5(input_childRelationships);const input_dependentFields=input.dependentFields;const input_dependentFields_keys=Object.keys(input_dependentFields);const input_dependentFields_length=input_dependentFields_keys.length;for(let i=0;i<input_dependentFields_length;i++){const key=input_dependentFields_keys[i];const input_dependentFields_prop=input_dependentFields[key];ObjectFreeze$5(input_dependentFields_prop);}ObjectFreeze$5(input_dependentFields);const input_fields=input.fields;const input_fields_keys=Object.keys(input_fields);const input_fields_length=input_fields_keys.length;for(let i=0;i<input_fields_length;i++){const key=input_fields_keys[i];const input_fields_prop=input_fields[key];deepFreeze$c(input_fields_prop);}ObjectFreeze$5(input_fields);const input_nameFields=input.nameFields;ObjectFreeze$5(input_nameFields);const input_recordTypeInfos=input.recordTypeInfos;const input_recordTypeInfos_keys=Object.keys(input_recordTypeInfos);const input_recordTypeInfos_length=input_recordTypeInfos_keys.length;for(let i=0;i<input_recordTypeInfos_length;i++){const key=input_recordTypeInfos_keys[i];const input_recordTypeInfos_prop=input_recordTypeInfos[key];deepFreeze$1$5(input_recordTypeInfos_prop);}ObjectFreeze$5(input_recordTypeInfos);const input_themeInfo=input.themeInfo;if(input_themeInfo!==null&&typeof input_themeInfo==='object'){deepFreeze$d(input_themeInfo);}ObjectFreeze$5(input);}const ingest$a=function ObjectInfoRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$q(input);if(validateError!==null){throw validateError;}}const key=keyBuilder$8({apiName:input.apiName});let incomingRecord=normalize$a(input,store.records[key],{fullPath:key,parent:path.parent});const existingRecord=store.records[key];deepFreeze$e(input);if(existingRecord===undefined||equals$c(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}store.setExpiration(key,timestamp+900000);return createLink$5(key);};function getUiApiObjectInfoByObjectApiName(config){const key=keyBuilder$8({apiName:config.urlParams.objectApiName});const headers={};return {path:'/services/data/v49.0/ui-api/object-info/'+config.urlParams.objectApiName+'',method:'get',body:null,urlParams:config.urlParams,queryParams:{},key:key,ingest:ingest$a,headers};}const getObjectInfo_ConfigPropertyNames={displayName:'getObjectInfo',parameters:{required:['objectApiName'],optional:[]}};function coerceConfig$8(config){const coercedConfig={};const objectApiName=getObjectApiName(config.objectApiName);if(objectApiName!==undefined){coercedConfig.objectApiName=objectApiName;}return coercedConfig;}function typeCheckConfig$8(untrustedConfig){const config={};const untrustedConfig_objectApiName=untrustedConfig.objectApiName;if(typeof untrustedConfig_objectApiName==='string'){config.objectApiName=untrustedConfig_objectApiName;}return config;}function validateAdapterConfig$8(untrustedConfig,configPropertyNames){if(!untrustedIsObject$5(untrustedConfig)){return null;}{validateConfig$4(untrustedConfig,configPropertyNames);}const coercedConfig=coerceConfig$8(untrustedConfig);const config=typeCheckConfig$8(coercedConfig);if(!areRequiredParametersPresent$4(config,configPropertyNames)){return null;}return config;}function buildInMemorySnapshot$6(lds,config){const request=getUiApiObjectInfoByObjectApiName({urlParams:{objectApiName:config.objectApiName}});const selector={recordId:request.key,node:select$9(),variables:{}};return lds.storeLookup(selector);}function buildNetworkSnapshot$5$1(lds,config,override){const request=getUiApiObjectInfoByObjectApiName({urlParams:{objectApiName:config.objectApiName}});return lds.dispatchResourceRequest(request,override).then(response=>{const{body}=response;lds.storeIngest(request.key,request,body);lds.storeBroadcast();return buildInMemorySnapshot$6(lds,config);},error=>{lds.storeIngestFetchResponse(request.key,error,TTL$1);lds.storeBroadcast();return lds.errorSnapshot(error);});}const getObjectInfoAdapterFactory=lds=>{return refreshable$5(// Create snapshot either via a cache hit or via the network
    function getObjectInfo(untrustedConfig){const config=validateAdapterConfig$8(untrustedConfig,getObjectInfo_ConfigPropertyNames);// Invalid or incomplete config
    if(config===null){return null;}const cacheSnapshot=buildInMemorySnapshot$6(lds,config);// Cache Hit
    if(cacheSnapshot.state===SNAPSHOT_STATE_FULFILLED$4){return cacheSnapshot;}return buildNetworkSnapshot$5$1(lds,config);},// Refresh snapshot
    // TODO W-6900511 - This currently passes the untrusted config
    // because we don't have a way to pass the validated config back to LDS
    untrustedConfig=>{const config=validateAdapterConfig$8(untrustedConfig,getObjectInfo_ConfigPropertyNames);// This should never happen
    if(config===null){throw new Error('Invalid config passed to "getObjectInfo" refresh function');}return buildNetworkSnapshot$5$1(lds,config,{headers:{'Cache-Control':'no-cache'}});});};const FIELD_ID='Id';const FIELD_NAME='Name';const COMPONENT_TYPE_FIELD='Field';function isFieldAReferenceWithRelationshipName(objectInfo,fieldApiName){const field=objectInfo.fields[fieldApiName];if(field===undefined){return false;}// TODO - can reference===true and relationshipName===null?
    return field.reference===true&&field.relationshipName!==null;}function getRelationshipName(objectInfo,fieldApiName){// TODO RAML - fix typing so isFieldAReferenceWithRelationshipName enables calling this without `relationshipName!`
    return objectInfo.fields[fieldApiName].relationshipName;}function getNameField(objectInfo,fieldApiName){// TODO - this logic is adopted from lds222. It searches
    // ObjectInfoRep.ReferenceToInfoRep[].nameFields[]:
    // 1. If any of the arrays are empty returns `Name`
    // 2. If `Name` is found in any array position then returns it
    // 2. Else returns ObjectInfoRep.ReferenceToInfoRep[0].nameFields[0]
    // Rationale for this is unclear and needs clarification.
    const referenceToInfos=objectInfo.fields[fieldApiName].referenceToInfos;if(referenceToInfos.length<1){return FIELD_NAME;}const firstReferenceNameFields=referenceToInfos[0].nameFields;if(firstReferenceNameFields.length<1){return FIELD_NAME;}for(let a=0,alen=referenceToInfos.length;a<alen;a++){const nameFields=referenceToInfos[a].nameFields;for(let b=0,blen=nameFields.length;b<blen;b++){const nameField=nameFields[b];if(nameField===FIELD_NAME){return nameField;}}}return firstReferenceNameFields[0];}function getQualifiedFieldApiNamesFromLayout(layout,objectInfo){const qualifiedFieldNames=[];for(let a=0,alen=layout.sections.length;a<alen;a++){const section=layout.sections[a];for(let b=0,blen=section.layoutRows.length;b<blen;b++){const row=section.layoutRows[b];for(let c=0,clen=row.layoutItems.length;c<clen;c++){const item=row.layoutItems[c];for(let d=0,dlen=item.layoutComponents.length;d<dlen;d++){const component=item.layoutComponents[d];const{apiName}=component;if(apiName&&component.componentType===COMPONENT_TYPE_FIELD){if(isFieldAReferenceWithRelationshipName(objectInfo,apiName)){const relationshipFieldApiName=getRelationshipName(objectInfo,apiName);// By default, include the "Id" field on spanning records that are on the layout.
    qualifiedFieldNames.push(`${objectInfo.apiName}.${relationshipFieldApiName}.${FIELD_ID}`);const nameField=getNameField(objectInfo,apiName);qualifiedFieldNames.push(`${objectInfo.apiName}.${relationshipFieldApiName}.${nameField}`);}qualifiedFieldNames.push(`${objectInfo.apiName}.${component.apiName}`);}}}}}return qualifiedFieldNames;}/**
     * Returns the object API name.
     * @param value The value from which to get the object API name.
     * @returns The object API name.
     */function getRecordId18Array(value){const valueArray=isArray$3(value)?value:[value];const array=[];for(let i=0,len=valueArray.length;i<len;i+=1){const item=valueArray[i];const apiName=getRecordId18(item);if(apiName===undefined){return undefined;}push$1.call(array,apiName);}if(array.length===0){return undefined;}return dedupe(array).sort();}const TTL$2=900000;function validate$r(obj,path='RecordUiRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_eTag=obj.eTag;const path_eTag=path+'.eTag';if(typeof obj_eTag!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_eTag+'" (at "'+path_eTag+'")');}const obj_layoutUserStates=obj.layoutUserStates;const path_layoutUserStates=path+'.layoutUserStates';if(typeof obj_layoutUserStates!=='object'||ArrayIsArray$6(obj_layoutUserStates)||obj_layoutUserStates===null){return new TypeError('Expected "object" but received "'+typeof obj_layoutUserStates+'" (at "'+path_layoutUserStates+'")');}const obj_layoutUserStates_keys=ObjectKeys$5(obj_layoutUserStates);for(let i=0;i<obj_layoutUserStates_keys.length;i++){const key=obj_layoutUserStates_keys[i];const obj_layoutUserStates_prop=obj_layoutUserStates[key];const path_layoutUserStates_prop=path_layoutUserStates+'["'+key+'"]';if(typeof obj_layoutUserStates_prop!=='object'){return new TypeError('Expected "object" but received "'+typeof obj_layoutUserStates_prop+'" (at "'+path_layoutUserStates_prop+'")');}}const obj_layouts=obj.layouts;const path_layouts=path+'.layouts';if(typeof obj_layouts!=='object'||ArrayIsArray$6(obj_layouts)||obj_layouts===null){return new TypeError('Expected "object" but received "'+typeof obj_layouts+'" (at "'+path_layouts+'")');}const obj_layouts_keys=ObjectKeys$5(obj_layouts);for(let i=0;i<obj_layouts_keys.length;i++){const key=obj_layouts_keys[i];const obj_layouts_prop=obj_layouts[key];const path_layouts_prop=path_layouts+'["'+key+'"]';if(typeof obj_layouts_prop!=='object'||ArrayIsArray$6(obj_layouts_prop)||obj_layouts_prop===null){return new TypeError('Expected "object" but received "'+typeof obj_layouts_prop+'" (at "'+path_layouts_prop+'")');}const obj_layouts_prop_keys=ObjectKeys$5(obj_layouts_prop);for(let i=0;i<obj_layouts_prop_keys.length;i++){const key=obj_layouts_prop_keys[i];const obj_layouts_prop_prop=obj_layouts_prop[key];const path_layouts_prop_prop=path_layouts_prop+'["'+key+'"]';if(typeof obj_layouts_prop_prop!=='object'||ArrayIsArray$6(obj_layouts_prop_prop)||obj_layouts_prop_prop===null){return new TypeError('Expected "object" but received "'+typeof obj_layouts_prop_prop+'" (at "'+path_layouts_prop_prop+'")');}const obj_layouts_prop_prop_keys=ObjectKeys$5(obj_layouts_prop_prop);for(let i=0;i<obj_layouts_prop_prop_keys.length;i++){const key=obj_layouts_prop_prop_keys[i];const obj_layouts_prop_prop_prop=obj_layouts_prop_prop[key];const path_layouts_prop_prop_prop=path_layouts_prop_prop+'["'+key+'"]';if(typeof obj_layouts_prop_prop_prop!=='object'||ArrayIsArray$6(obj_layouts_prop_prop_prop)||obj_layouts_prop_prop_prop===null){return new TypeError('Expected "object" but received "'+typeof obj_layouts_prop_prop_prop+'" (at "'+path_layouts_prop_prop_prop+'")');}const obj_layouts_prop_prop_prop_keys=ObjectKeys$5(obj_layouts_prop_prop_prop);for(let i=0;i<obj_layouts_prop_prop_prop_keys.length;i++){const key=obj_layouts_prop_prop_prop_keys[i];const obj_layouts_prop_prop_prop_prop=obj_layouts_prop_prop_prop[key];const path_layouts_prop_prop_prop_prop=path_layouts_prop_prop_prop+'["'+key+'"]';if(typeof obj_layouts_prop_prop_prop_prop!=='object'){return new TypeError('Expected "object" but received "'+typeof obj_layouts_prop_prop_prop_prop+'" (at "'+path_layouts_prop_prop_prop_prop+'")');}}}}}const obj_objectInfos=obj.objectInfos;const path_objectInfos=path+'.objectInfos';if(typeof obj_objectInfos!=='object'||ArrayIsArray$6(obj_objectInfos)||obj_objectInfos===null){return new TypeError('Expected "object" but received "'+typeof obj_objectInfos+'" (at "'+path_objectInfos+'")');}const obj_objectInfos_keys=ObjectKeys$5(obj_objectInfos);for(let i=0;i<obj_objectInfos_keys.length;i++){const key=obj_objectInfos_keys[i];const obj_objectInfos_prop=obj_objectInfos[key];const path_objectInfos_prop=path_objectInfos+'["'+key+'"]';if(typeof obj_objectInfos_prop!=='object'){return new TypeError('Expected "object" but received "'+typeof obj_objectInfos_prop+'" (at "'+path_objectInfos_prop+'")');}}const obj_records=obj.records;const path_records=path+'.records';if(typeof obj_records!=='object'||ArrayIsArray$6(obj_records)||obj_records===null){return new TypeError('Expected "object" but received "'+typeof obj_records+'" (at "'+path_records+'")');}const obj_records_keys=ObjectKeys$5(obj_records);for(let i=0;i<obj_records_keys.length;i++){const key=obj_records_keys[i];const obj_records_prop=obj_records[key];const path_records_prop=path_records+'["'+key+'"]';if(typeof obj_records_prop!=='object'){return new TypeError('Expected "object" but received "'+typeof obj_records_prop+'" (at "'+path_records_prop+'")');}}})();return v_error===undefined?null:v_error;}function normalize$b(input,existing,path,lds,store,timestamp){const input_layoutUserStates=input.layoutUserStates;const input_layoutUserStates_id=path.fullPath+'__layoutUserStates';const input_layoutUserStates_keys=Object.keys(input_layoutUserStates);const input_layoutUserStates_length=input_layoutUserStates_keys.length;for(let i=0;i<input_layoutUserStates_length;i++){const key=input_layoutUserStates_keys[i];const input_layoutUserStates_prop=input_layoutUserStates[key];const input_layoutUserStates_prop_id=input_layoutUserStates_id+'__'+key;input_layoutUserStates[key]=ingest$4$1(input_layoutUserStates_prop,{fullPath:input_layoutUserStates_prop_id,parent:{data:input,key:path.fullPath,existing:existing}},lds,store,timestamp);}const input_layouts=input.layouts;const input_layouts_id=path.fullPath+'__layouts';const input_layouts_keys=Object.keys(input_layouts);const input_layouts_length=input_layouts_keys.length;for(let i=0;i<input_layouts_length;i++){const key=input_layouts_keys[i];const input_layouts_prop=input_layouts[key];const input_layouts_prop_id=input_layouts_id+'__'+key;const input_layouts_prop_keys=Object.keys(input_layouts_prop);const input_layouts_prop_length=input_layouts_prop_keys.length;for(let i=0;i<input_layouts_prop_length;i++){const key=input_layouts_prop_keys[i];const input_layouts_prop_prop=input_layouts_prop[key];const input_layouts_prop_prop_id=input_layouts_prop_id+'__'+key;const input_layouts_prop_prop_keys=Object.keys(input_layouts_prop_prop);const input_layouts_prop_prop_length=input_layouts_prop_prop_keys.length;for(let i=0;i<input_layouts_prop_prop_length;i++){const key=input_layouts_prop_prop_keys[i];const input_layouts_prop_prop_prop=input_layouts_prop_prop[key];const input_layouts_prop_prop_prop_id=input_layouts_prop_prop_id+'__'+key;const input_layouts_prop_prop_prop_keys=Object.keys(input_layouts_prop_prop_prop);const input_layouts_prop_prop_prop_length=input_layouts_prop_prop_prop_keys.length;for(let i=0;i<input_layouts_prop_prop_prop_length;i++){const key=input_layouts_prop_prop_prop_keys[i];const input_layouts_prop_prop_prop_prop=input_layouts_prop_prop_prop[key];const input_layouts_prop_prop_prop_prop_id=input_layouts_prop_prop_prop_id+'__'+key;input_layouts_prop_prop_prop[key]=ingest$3$1(input_layouts_prop_prop_prop_prop,{fullPath:input_layouts_prop_prop_prop_prop_id,parent:{data:input,key:path.fullPath,existing:existing}},lds,store,timestamp);}}}}const input_objectInfos=input.objectInfos;const input_objectInfos_id=path.fullPath+'__objectInfos';const input_objectInfos_keys=Object.keys(input_objectInfos);const input_objectInfos_length=input_objectInfos_keys.length;for(let i=0;i<input_objectInfos_length;i++){const key=input_objectInfos_keys[i];const input_objectInfos_prop=input_objectInfos[key];const input_objectInfos_prop_id=input_objectInfos_id+'__'+key;input_objectInfos[key]=ingest$a(input_objectInfos_prop,{fullPath:input_objectInfos_prop_id,parent:{data:input,key:path.fullPath,existing:existing}},lds,store,timestamp);}const input_records=input.records;const input_records_id=path.fullPath+'__records';const input_records_keys=Object.keys(input_records);const input_records_length=input_records_keys.length;for(let i=0;i<input_records_length;i++){const key=input_records_keys[i];const input_records_prop=input_records[key];const input_records_prop_id=input_records_id+'__'+key;input_records[key]=ingest$2$1(input_records_prop,{fullPath:input_records_prop_id,parent:{data:input,key:path.fullPath,existing:existing}},lds,store,timestamp);}return input;}function equals$d(existing,incoming){const existing_eTag=existing.eTag;const incoming_eTag=incoming.eTag;if(!(existing_eTag===incoming_eTag)){return false;}const existing_layoutUserStates=existing.layoutUserStates;const incoming_layoutUserStates=incoming.layoutUserStates;const equals_layoutUserStates_props=equalsObject(existing_layoutUserStates,incoming_layoutUserStates,(existing_layoutUserStates_prop,incoming_layoutUserStates_prop)=>{if(!(existing_layoutUserStates_prop.__ref===incoming_layoutUserStates_prop.__ref)){return false;}});if(equals_layoutUserStates_props===false){return false;}const existing_layouts=existing.layouts;const incoming_layouts=incoming.layouts;const equals_layouts_props=equalsObject(existing_layouts,incoming_layouts,(existing_layouts_prop,incoming_layouts_prop)=>{const equals_layouts_props=equalsObject(existing_layouts_prop,incoming_layouts_prop,(existing_layouts_prop_prop,incoming_layouts_prop_prop)=>{const equals_layouts_props=equalsObject(existing_layouts_prop_prop,incoming_layouts_prop_prop,(existing_layouts_prop_prop_prop,incoming_layouts_prop_prop_prop)=>{const equals_layouts_props=equalsObject(existing_layouts_prop_prop_prop,incoming_layouts_prop_prop_prop,(existing_layouts_prop_prop_prop_prop,incoming_layouts_prop_prop_prop_prop)=>{if(!(existing_layouts_prop_prop_prop_prop.__ref===incoming_layouts_prop_prop_prop_prop.__ref)){return false;}});if(equals_layouts_props===false){return false;}});if(equals_layouts_props===false){return false;}});if(equals_layouts_props===false){return false;}});if(equals_layouts_props===false){return false;}const existing_objectInfos=existing.objectInfos;const incoming_objectInfos=incoming.objectInfos;const equals_objectInfos_props=equalsObject(existing_objectInfos,incoming_objectInfos,(existing_objectInfos_prop,incoming_objectInfos_prop)=>{if(!(existing_objectInfos_prop.__ref===incoming_objectInfos_prop.__ref)){return false;}});if(equals_objectInfos_props===false){return false;}const existing_records=existing.records;const incoming_records=incoming.records;const equals_records_props=equalsObject(existing_records,incoming_records,(existing_records_prop,incoming_records_prop)=>{if(!(existing_records_prop.__ref===incoming_records_prop.__ref)){return false;}});if(equals_records_props===false){return false;}return true;}const ingest$b=function RecordUiRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$r(input);if(validateError!==null){throw validateError;}}const key=path.fullPath;let incomingRecord=normalize$b(input,store.records[key],{fullPath:key,parent:path.parent},lds,store,timestamp);const existingRecord=store.records[key];if(existingRecord===undefined||equals$d(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}store.setExpiration(key,timestamp+900000);return createLink$5(key);};function getUiApiRecordUiByRecordIds(config){const key=keyPrefix$4+'RecordUiRepresentation('+'childRelationships:'+config.queryParams.childRelationships+','+'formFactor:'+config.queryParams.formFactor+','+'layoutTypes:'+config.queryParams.layoutTypes+','+'modes:'+config.queryParams.modes+','+'optionalFields:'+config.queryParams.optionalFields+','+'pageSize:'+config.queryParams.pageSize+','+'updateMru:'+config.queryParams.updateMru+','+'recordIds:'+config.urlParams.recordIds+')';const headers={};return {path:'/services/data/v49.0/ui-api/record-ui/'+config.urlParams.recordIds+'',method:'get',body:null,urlParams:config.urlParams,queryParams:config.queryParams,key:key,ingest:ingest$b,headers};}function coerceConfig$9(config){const coercedConfig={};const recordIds=getRecordId18Array(config.recordIds);if(recordIds!==undefined){coercedConfig.recordIds=recordIds;}const childRelationships=config.childRelationships;if(childRelationships!==undefined){coercedConfig.childRelationships=childRelationships;}const formFactor=config.formFactor;if(formFactor!==undefined){coercedConfig.formFactor=formFactor;}const layoutTypes=toSortedStringArray(config.layoutTypes);if(layoutTypes!==undefined){coercedConfig.layoutTypes=layoutTypes;}const modes=toSortedStringArray(config.modes);if(modes!==undefined){coercedConfig.modes=modes;}const optionalFields=getFieldApiNamesArray(config.optionalFields);if(optionalFields!==undefined){coercedConfig.optionalFields=optionalFields;}const pageSize=config.pageSize;if(pageSize!==undefined){coercedConfig.pageSize=pageSize;}const updateMru=config.updateMru;if(updateMru!==undefined){coercedConfig.updateMru=updateMru;}return coercedConfig;}function typeCheckConfig$9(untrustedConfig){const config={};const untrustedConfig_recordIds=untrustedConfig.recordIds;if(ArrayIsArray$1$5(untrustedConfig_recordIds)){const untrustedConfig_recordIds_array=[];for(let i=0,arrayLength=untrustedConfig_recordIds.length;i<arrayLength;i++){const untrustedConfig_recordIds_item=untrustedConfig_recordIds[i];if(typeof untrustedConfig_recordIds_item==='string'){untrustedConfig_recordIds_array.push(untrustedConfig_recordIds_item);}}config.recordIds=untrustedConfig_recordIds_array;}const untrustedConfig_childRelationships=untrustedConfig.childRelationships;if(ArrayIsArray$1$5(untrustedConfig_childRelationships)){const untrustedConfig_childRelationships_array=[];for(let i=0,arrayLength=untrustedConfig_childRelationships.length;i<arrayLength;i++){const untrustedConfig_childRelationships_item=untrustedConfig_childRelationships[i];if(typeof untrustedConfig_childRelationships_item==='string'){untrustedConfig_childRelationships_array.push(untrustedConfig_childRelationships_item);}}config.childRelationships=untrustedConfig_childRelationships_array;}const untrustedConfig_formFactor=untrustedConfig.formFactor;if(typeof untrustedConfig_formFactor==='string'){config.formFactor=untrustedConfig_formFactor;}const untrustedConfig_layoutTypes=untrustedConfig.layoutTypes;if(ArrayIsArray$1$5(untrustedConfig_layoutTypes)){const untrustedConfig_layoutTypes_array=[];for(let i=0,arrayLength=untrustedConfig_layoutTypes.length;i<arrayLength;i++){const untrustedConfig_layoutTypes_item=untrustedConfig_layoutTypes[i];if(typeof untrustedConfig_layoutTypes_item==='string'){untrustedConfig_layoutTypes_array.push(untrustedConfig_layoutTypes_item);}}config.layoutTypes=untrustedConfig_layoutTypes_array;}const untrustedConfig_modes=untrustedConfig.modes;if(ArrayIsArray$1$5(untrustedConfig_modes)){const untrustedConfig_modes_array=[];for(let i=0,arrayLength=untrustedConfig_modes.length;i<arrayLength;i++){const untrustedConfig_modes_item=untrustedConfig_modes[i];if(typeof untrustedConfig_modes_item==='string'){untrustedConfig_modes_array.push(untrustedConfig_modes_item);}}config.modes=untrustedConfig_modes_array;}const untrustedConfig_optionalFields=untrustedConfig.optionalFields;if(ArrayIsArray$1$5(untrustedConfig_optionalFields)){const untrustedConfig_optionalFields_array=[];for(let i=0,arrayLength=untrustedConfig_optionalFields.length;i<arrayLength;i++){const untrustedConfig_optionalFields_item=untrustedConfig_optionalFields[i];if(typeof untrustedConfig_optionalFields_item==='string'){untrustedConfig_optionalFields_array.push(untrustedConfig_optionalFields_item);}}config.optionalFields=untrustedConfig_optionalFields_array;}const untrustedConfig_pageSize=untrustedConfig.pageSize;if(typeof untrustedConfig_pageSize==='number'&&Math.floor(untrustedConfig_pageSize)===untrustedConfig_pageSize){config.pageSize=untrustedConfig_pageSize;}const untrustedConfig_updateMru=untrustedConfig.updateMru;if(typeof untrustedConfig_updateMru==='boolean'){config.updateMru=untrustedConfig_updateMru;}return config;}function validateAdapterConfig$9(untrustedConfig,configPropertyNames){if(!untrustedIsObject$5(untrustedConfig)){return null;}{validateConfig$4(untrustedConfig,configPropertyNames);}const coercedConfig=coerceConfig$9(untrustedConfig);const config=typeCheckConfig$9(coercedConfig);if(!areRequiredParametersPresent$4(config,configPropertyNames)){return null;}return config;}const layoutSelections$1=select$5().selections;const objectInfoPathSelection=select$9().selections;const layoutUserStatePathSelector=select$1$1().selections;function buildRecordUiSelector(recordDefs,layoutTypes,modes,recordOptionalFields){const layoutTypeSelections=[];for(let i=0,len=layoutTypes.length;i<len;i+=1){const layoutType=layoutTypes[i];const modeSelections=[];const sel={kind:'Object',name:layoutType,selections:modeSelections};for(let m=0;m<modes.length;m+=1){const mode=modes[m];const modeSel={kind:'Link',name:mode,selections:layoutSelections$1};push$1.call(modeSelections,modeSel);}push$1.call(layoutTypeSelections,sel);}const recordLayoutSelections=[];const recordSelections=[];for(let i=0,len=recordDefs.length;i<len;i+=1){const{recordId,recordData}=recordDefs[i];push$1.call(recordLayoutSelections,{kind:'Object',name:recordData.apiName,required:false,map:true,selections:layoutTypeSelections});const optionalFields=recordOptionalFields[recordId];const fields=extractRecordFields(recordData);push$1.call(recordSelections,{kind:'Link',name:recordId,selections:buildSelectionFromFields(fields,optionalFields)});}return {kind:'Fragment',selections:[{kind:'Link',name:'layoutUserStates',map:true,selections:layoutUserStatePathSelector},{kind:'Object',name:'layouts',selections:recordLayoutSelections},{kind:'Link',name:'objectInfos',map:true,selections:objectInfoPathSelection},{name:'records',kind:'Object',selections:recordSelections}]};}function getMissingRecordLookupFields(record,objectInfo){const lookupFields={};const{apiName,fields:recordFields}=record;const{fields:objectInfoFields}=objectInfo;const objectInfoFieldNames=keys$3(objectInfoFields);for(let i=0,len=objectInfoFieldNames.length;i<len;i+=1){const fieldName=objectInfoFieldNames[i];const field=objectInfoFields[fieldName];const{relationshipName}=field;if(relationshipName===null){continue;}const recordFieldValue=recordFields[relationshipName];// Only interested in record fields that are present and that are null
    if(recordFieldValue===undefined||recordFieldValue.value!==null){continue;}const{referenceToInfos}=field;for(let r=0,referenceLen=referenceToInfos.length;r<referenceLen;r+=1){const referenceToInfo=referenceToInfos[r];// Include the Id field. Ex: Opportunity.Account.Id, Opportunity.relation1__r.Id
    const idFieldName=`${apiName}.${relationshipName}.Id`;lookupFields[idFieldName]=true;const{nameFields}=referenceToInfo;// Include all name fields so UIAPI populates the displayValue. Ex: Account.Owner.FirstName, Account.Owner.LastName. Or Account.custom__r.Name.
    for(let n=0,nameFieldsLen=nameFields.length;n<nameFieldsLen;n+=1){const nameField=nameFields[n];const nameFieldName=`${apiName}.${relationshipName}.${nameField}`;lookupFields[nameFieldName]=true;}}}return keys$3(lookupFields);}function getRecordUiMissingRecordLookupFields(recordUi){const{records,objectInfos}=recordUi;const recordLookupFields={};const recordIds=keys$3(records);for(let i=0,len=recordIds.length;i<len;i+=1){const recordId=recordIds[i];const recordData=records[recordId];const{apiName}=recordData;const objectInfo=objectInfos[apiName];recordLookupFields[recordId]=getMissingRecordLookupFields(recordData,objectInfo);}return recordLookupFields;}// Custom adapter config due to `unsupported` items
    const GET_RECORDUI_ADAPTER_CONFIG={displayName:'getRecordUi',parameters:{required:['recordIds','layoutTypes','modes'],optional:['optionalFields'],unsupported:['formFactor','childRelationships','pageSize','updateMru']}};function eachLayout(recordUi,cb){const{layouts}=recordUi;const layoutApiNames=keys$3(layouts);for(let a=0,len=layoutApiNames.length;a<len;a+=1){const apiName=layoutApiNames[a];const apiNameData=layouts[apiName];const recordTypeIds=keys$3(apiNameData);for(let b=0,recordTypeIdsLen=recordTypeIds.length;b<recordTypeIdsLen;b+=1){const recordTypeId=recordTypeIds[b];const recordTypeData=apiNameData[recordTypeId];const layoutTypes=keys$3(recordTypeData);for(let c=0,layoutTypesLen=layoutTypes.length;c<layoutTypesLen;c+=1){const layoutType=layoutTypes[c];const layoutTypeData=recordTypeData[layoutType];const modes=keys$3(layoutTypeData);for(let d=0,modesLen=modes.length;d<modesLen;d+=1){const mode=modes[d];const layout=layoutTypeData[mode];cb(apiName,recordTypeId,layout);}}}}}function collectRecordDefs(resp,recordIds){const recordDefs=[];for(let i=0,len=recordIds.length;i<len;i+=1){const recordId=recordIds[i];const recordData=resp.records[recordId];push$1.call(recordDefs,{recordId,recordData,recordTypeId:getRecordTypeId(recordData)});}return recordDefs;}function keyBuilder$9(recordIds,layoutTypes,modes,optionalFields){const joinedRecordIds=recordIds.sort().join(',');const joinedOptionalFields=optionalFields.sort().join(',');const joinedLayoutTypes=layoutTypes.sort().join(',');const joinedModes=modes.sort().join(',');return `${keyPrefix$4}RecordUiRepresentation:${joinedRecordIds}:${joinedLayoutTypes}:${joinedModes}:${joinedOptionalFields}`;}function buildInMemorySnapshot$7(lds,config){const{recordIds,layoutTypes,modes,optionalFields}=config;// TODO: a better hash function for config -> configKey
    const configKey=stringify$3(config);// check to see if we see the selector (config) before
    const selectorNode=getSelectorNode(lds,configKey);// if we do, return the same snapshot instance by calling storeLookupMemoize
    if(selectorNode!==null){const cacheData=lds.storeLookupMemoize(selectorNode);// CACHE HIT
    if(isFulfilledSnapshot$1(cacheData)||isErrorSnapshot$1(cacheData)){return cacheData;}}const key=keyBuilder$9(recordIds,layoutTypes,modes,optionalFields);const cachedSelectorKey=`${key}__selector`;const cacheSel=lds.storeLookup({recordId:cachedSelectorKey,node:{kind:'Fragment',opaque:true},variables:{}});if(isFulfilledSnapshot$1(cacheSel)){const cachedSelector=cacheSel.data;// publish the selector instance for later getNode check
    lds.storePublish(configKey,cachedSelector);const cacheData=lds.storeLookupMemoize(cachedSelector);// CACHE HIT
    if(isFulfilledSnapshot$1(cacheData)){return cacheData;}}return null;}function markRecordUiOptionalFields(lds,optionalFields,recordNodes){if(optionalFields.length===0){return;}for(let i=0,len=recordNodes.length;i<len;i++){markMissingOptionalFields(recordNodes[i],optionalFields);}}function getSelectorNode(lds,key){const selectorNode=lds.getNode(key);if(selectorNode!==null){return selectorNode.retrieve();}return null;}function buildNetworkSnapshot$6(lds,config){const{recordIds,layoutTypes,modes,optionalFields}=config;// TODO: a better hash function for config -> configKey
    const configKey=stringify$3(config);let allOptionalFields=[];for(let i=0,len=recordIds.length;i<len;i++){const recordId=recordIds[i];allOptionalFields=allOptionalFields.concat(getTrackedFields(lds,recordId,optionalFields));}const key=keyBuilder$9(recordIds,layoutTypes,modes,optionalFields);const resourceRequest=getUiApiRecordUiByRecordIds({urlParams:{recordIds},queryParams:{layoutTypes,modes,optionalFields:dedupe(allOptionalFields).sort()}});return lds.dispatchResourceRequest(resourceRequest).then(response=>{const{body}=response;// TODO fix API so we don't have to augment the response with request details in order
    // to support refresh. these are never emitted out per (private).
    eachLayout(body,(apiName,recordTypeId,layout)=>{layout.apiName=apiName;layout.recordTypeId=recordTypeId;if(layout.id===null){return;}const layoutUserState=body.layoutUserStates[layout.id];// Temporary hack since we can't match keys from getLayoutUserState response
    // to record ui's layout users states.
    if(layoutUserState===undefined){return;}layoutUserState.apiName=apiName;layoutUserState.recordTypeId=recordTypeId;layoutUserState.mode=layout.mode;layoutUserState.layoutType=layout.layoutType;});const cachedSelectorKey=`${key}__selector`;const recordLookupFields=getRecordUiMissingRecordLookupFields(body);const selPath=buildRecordUiSelector(collectRecordDefs(body,recordIds),layoutTypes,modes,recordLookupFields);const sel={recordId:key,node:selPath,variables:{}};lds.storePublish(cachedSelectorKey,sel);lds.storeIngest(key,resourceRequest,body);// During ingestion, only valid records are stored.
    const recordNodes=[];const validRecordIds=[];for(let i=0,len=recordIds.length;i<len;i+=1){const recordId=recordIds[i];const recordKey=keyBuilder({recordId});const node=lds.getNode(recordKey);if(isGraphNode(node)){recordNodes.push(node);validRecordIds.push(recordId);}}const{optionalFields}=config;if(optionalFields.length>0){markRecordUiOptionalFields(lds,optionalFields,recordNodes);}lds.storeBroadcast();lds.storePublish(configKey,sel);publishDependencies(lds,validRecordIds,[key,cachedSelectorKey,configKey]);return lds.storeLookupMemoize(sel);},err=>{lds.storeIngestFetchResponse(key,err,TTL$2);lds.storeBroadcast();const{status}=err;if(status===404){const sel={recordId:key,node:{kind:'Fragment',opaque:true},variables:{}};lds.storePublish(configKey,sel);return lds.storeLookupMemoize(sel);}return lds.errorSnapshot(err);});}function publishDependencies(lds,recordIds,depKeys){for(let i=0,len=recordIds.length;i<len;i+=1){const recordDepKey=depenpendencyKeyBuilder({recordId:recordIds[i]});const dependencies=create$1(null);for(let j=0,len=depKeys.length;j<len;j++){dependencies[depKeys[j]]=true;}const node=lds.getNode(recordDepKey);if(isGraphNode(node)){const recordDeps=node.retrieve();assign(dependencies,recordDeps);}lds.storePublish(recordDepKey,dependencies);}}function coerceConfigWithDefaults$3(untrustedConfig){const config=validateAdapterConfig$9(untrustedConfig,GET_RECORDUI_ADAPTER_CONFIG);if(config===null){return null;}const{layoutTypes,modes}=config;// custom config validation
    if(layoutTypes===undefined||modes===undefined){return null;}return _objectSpread$2({},config,{layoutTypes:layoutTypes,modes:modes,optionalFields:config.optionalFields===undefined?[]:config.optionalFields});}const factory$6=lds=>{return refreshable$5(function getRecordUi(untrustedConfig){// standard config validation and coercion
    const config=coerceConfigWithDefaults$3(untrustedConfig);if(config===null){return null;}const cacheSnapshot=buildInMemorySnapshot$7(lds,config);if(cacheSnapshot!==null&&(isFulfilledSnapshot$1(cacheSnapshot)||isErrorSnapshot$1(cacheSnapshot))){return cacheSnapshot;}return buildNetworkSnapshot$6(lds,config);},untrustedConfig=>{const config=coerceConfigWithDefaults$3(untrustedConfig);if(config===null){throw new Error('Refresh should not be called with partial configuration');}return buildNetworkSnapshot$6(lds,config);});};const DEFAULT_MODE$1=LayoutMode$1.View;const layoutSelections$2=select$5();function refresh(lds,config){const{recordId,layoutTypes,modes:configModes,optionalFields:configOptionalFields}=config;const modes=configModes===undefined?[DEFAULT_MODE$1]:configModes;const optionalFields=configOptionalFields===undefined?[]:configOptionalFields;const recordUiConfig={recordIds:[recordId],layoutTypes,modes,optionalFields};return buildNetworkSnapshot$6(lds,recordUiConfig).then(snapshot=>{if(isErrorSnapshot$1(snapshot)){return lds.errorSnapshot(snapshot.error);}if(isUnfulfilledSnapshot$1(snapshot)){throw new Error(`RecordUi adapter resolved with a snapshot with missing data, missingPaths: ${keys$3(snapshot.missingPaths)}`);}const{layoutMap,objectInfo}=getLayoutMapAndObjectInfo(recordId,snapshot.data);const fields=getFieldsFromLayoutMap(layoutMap,objectInfo);return buildInMemorySnapshot$5(lds,{recordId,fields,modes});});}// Makes a request directly to /record-ui/{recordIds}
    function fetchRecordLayout(lds,recordId,layoutTypes,modes,optionalFields){const recordUiConfig={recordIds:[recordId],layoutTypes,modes,optionalFields};const recordUiAdapter=factory$6(lds);const recordUiSnapshotOrPromise=recordUiAdapter(recordUiConfig);if(isPromise$1$1(recordUiSnapshotOrPromise)){return recordUiSnapshotOrPromise.then(snapshot=>{return processRecordUiRepresentation(lds,recordId,modes,snapshot);});}{if(recordUiSnapshotOrPromise===null){throw new Error('RecordUi adapter synchronously resolved with a null snapshot');}}return processRecordUiRepresentation(lds,recordId,modes,recordUiSnapshotOrPromise);}function getLayoutMapAndObjectInfo(recordId,data){const{objectInfos,layouts,records}=data;const record=records[recordId];const{apiName}=record;const objectInfo=objectInfos[apiName];const recordTypeId=getRecordTypeId(record);const layoutMap=layouts[apiName][recordTypeId];return {layoutMap,objectInfo};}function processRecordUiRepresentation(lds,recordId,modes,snapshot){if(isErrorSnapshot$1(snapshot)){return lds.errorSnapshot(snapshot.error);}if(isUnfulfilledSnapshot$1(snapshot)){throw new Error(`RecordUi adapter resolved with a snapshot with missing data, missingPaths: ${keys$3(snapshot.missingPaths)}`);}const{layoutMap,objectInfo}=getLayoutMapAndObjectInfo(recordId,snapshot.data);return getRecord(lds,recordId,layoutMap,objectInfo);}function isPromise$1$1(value){// check for Thenable due to test frameworks using custom Promise impls
    return value!==null&&value.then!==undefined;}function lookupObjectInfo(lds,apiName){const snapshot=buildInMemorySnapshot$6(lds,{objectApiName:apiName});return isFulfilledSnapshot$1(snapshot)?snapshot.data:null;}function lookupLayouts(lds,apiName,recordTypeId,layoutTypes,modes){const map={};for(let i=0;i<layoutTypes.length;i+=1){const layoutType=layoutTypes[i];let layoutMap=map[layoutType];if(layoutMap===undefined){layoutMap=map[layoutType]={};}for(let m=0;m<modes.length;m+=1){const mode=modes[m];const key=keyBuilder$1({apiName,recordTypeId,layoutType,mode});const snapshot=lds.storeLookup({recordId:key,node:layoutSelections$2,variables:{}});// Cache hit
    if(isFulfilledSnapshot$1(snapshot)){layoutMap[mode]=snapshot.data;}else {return null;}}}return map;}const recordLayoutFragmentSelector=[{name:'apiName',kind:'Scalar'},{name:'recordTypeId',kind:'Scalar'}];function getFieldsFromLayoutMap(layoutMap,objectInfo){let fields=[];const layoutTypes=Object.keys(layoutMap);for(let i=0,layoutTypesLen=layoutTypes.length;i<layoutTypesLen;i+=1){const layoutType=layoutTypes[i];const modesMap=layoutMap[layoutType];const modes=Object.keys(modesMap);for(let m=0,modesLen=modes.length;m<modesLen;m+=1){const mode=modes[m];const modeKeys=getQualifiedFieldApiNamesFromLayout(modesMap[mode],objectInfo);fields=fields.concat(modeKeys);}}return dedupe(fields).sort();}function getRecord(lds,recordId,layoutMap,objectInfo){const fields=getFieldsFromLayoutMap(layoutMap,objectInfo);// We know what fields we need so delegate to getRecordByFields
    // This should be a cache hit because we just fetched the record-ui
    return getRecordByFields(lds,{recordId,fields});}function getRecordLayoutType(lds,config){const{recordId,layoutTypes,modes:configModes,optionalFields}=config;const modes=configModes===undefined?[DEFAULT_MODE$1]:configModes;const storeKey=keyBuilder({recordId});const recordSnapshot=lds.storeLookup({recordId:storeKey,node:{kind:'Fragment',selections:recordLayoutFragmentSelector},variables:{}});// If we haven't seen the record then go to the server
    if(!isFulfilledSnapshot$1(recordSnapshot)){return fetchRecordLayout(lds,recordId,layoutTypes,modes,optionalFields);}const record=recordSnapshot.data;const{apiName}=record;const objectInfo=lookupObjectInfo(lds,apiName);// If we do not have object info in cache, call record-ui endpoint directly
    if(objectInfo===null){return fetchRecordLayout(lds,recordId,layoutTypes,modes,optionalFields);}const recordTypeId=getRecordTypeId(record);const layoutMap=lookupLayouts(lds,apiName,recordTypeId,layoutTypes,modes);// It takes one xhr per layout to load so if there are missing layouts
    // give up and call record-ui endpoint directly
    if(layoutMap===null){return fetchRecordLayout(lds,recordId,layoutTypes,modes,optionalFields);}return getRecord(lds,recordId,layoutMap,objectInfo);}// Custom adapter config due to `unsupported` items
    const GET_RECORD_ADAPTER_CONFIG={displayName:'getRecord',parameters:{required:['recordId'],optional:['fields','layoutTypes','modes','optionalFields'],unsupported:['childRelationships','pageSize','updateMru']}};function hasLayoutTypes(config){return 'layoutTypes'in config;}function hasFieldsOrOptionalFields(config){return 'fields'in config||'optionalFields'in config;}function createResourceRequestFromRepresentation(representation,optionalFields){const config={urlParams:{recordId:representation.id},queryParams:{optionalFields}};return getUiApiRecordsByRecordId(config);}// TODO: this should probably be code generated in RecordRepresentation
    function coerceKeyParams(config){const coercedConfig={};const recordId=getRecordId18(config.recordId);if(recordId!==undefined){coercedConfig.recordId=recordId;}return coercedConfig;}const NOTIFY_CHANGE_NETWORK_KEY='notify-change-network';const notifyChangeNetworkRejectInstrumentParamBuilder=()=>{return {[NOTIFY_CHANGE_NETWORK_KEY]:'error'};};const notifyChangeFactory=lds=>{return function getUiApiRecordsByRecordIdNotifyChange(configs){for(let i=0,len=configs.length;i<len;i++){// build key from input
    const coercedConfig=coerceKeyParams(configs[i]);const key=keyBuilder(coercedConfig);// lookup GraphNode from store
    const node=lds.getNode(key);if(node===null||node.type==='Error'){continue;}// retrieve data (Representation) from GraphNode and use createResourceRequestFromRepresentation to build refresh resource request from Representation
    const representation=node.retrieve();const optionalFields=getTrackedFields(lds,representation.id);const refreshRequest=createResourceRequestFromRepresentation(representation,optionalFields);const existingWeakEtag=representation.weakEtag;// dispatch resource request, then ingest and broadcast
    lds.dispatchResourceRequest(refreshRequest).then(response=>{const{body}=response;lds.storeIngest(refreshRequest.key,refreshRequest,body);const recordNode=lds.getNode(refreshRequest.key);markMissingOptionalFields(recordNode,optionalFields);lds.storeBroadcast();const notifyChangeNetworkResolveInstrumentParamBuilder=()=>{return {[NOTIFY_CHANGE_NETWORK_KEY]:existingWeakEtag!==body.weakEtag};};lds.instrument(notifyChangeNetworkResolveInstrumentParamBuilder);},error=>{lds.storeIngestFetchResponse(refreshRequest.key,error,TTL);lds.storeBroadcast();lds.instrument(notifyChangeNetworkRejectInstrumentParamBuilder);});}};};const factory$7=lds=>{return refreshable$5(function getRecord(untrustedConfig){// standard config validation and coercion
    const config=validateAdapterConfig$7(untrustedConfig,GET_RECORD_ADAPTER_CONFIG);if(config===null){return null;}if(hasLayoutTypes(config)){return getRecordLayoutType(lds,config);}else if(hasFieldsOrOptionalFields(config)){return getRecordByFields(lds,config);}return null;},untrustedConfig=>{const config=validateAdapterConfig$7(untrustedConfig,GET_RECORD_ADAPTER_CONFIG);if(config===null){throw new Error('Refresh should not be called with partial configuration');}if(hasLayoutTypes(config)){return refresh(lds,config);}else if(hasFieldsOrOptionalFields(config)){return buildNetworkSnapshot$5(lds,config);}throw new Error('Refresh should be called with either record fields configuration or record by layout configuration');});};function validate$s(obj,path='PhotoMetadataRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_companyBluemasterId=obj.companyBluemasterId;const path_companyBluemasterId=path+'.companyBluemasterId';let obj_companyBluemasterId_union0=null;const obj_companyBluemasterId_union0_error=(()=>{if(typeof obj_companyBluemasterId!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_companyBluemasterId+'" (at "'+path_companyBluemasterId+'")');}})();if(obj_companyBluemasterId_union0_error!=null){obj_companyBluemasterId_union0=obj_companyBluemasterId_union0_error.message;}let obj_companyBluemasterId_union1=null;const obj_companyBluemasterId_union1_error=(()=>{if(obj_companyBluemasterId!==null){return new TypeError('Expected "null" but received "'+typeof obj_companyBluemasterId+'" (at "'+path_companyBluemasterId+'")');}})();if(obj_companyBluemasterId_union1_error!=null){obj_companyBluemasterId_union1=obj_companyBluemasterId_union1_error.message;}if(obj_companyBluemasterId_union0&&obj_companyBluemasterId_union1){let message='Object doesn\'t match union (at "'+path_companyBluemasterId+'")';message+='\n'+obj_companyBluemasterId_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_companyBluemasterId_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_responseId=obj.responseId;const path_responseId=path+'.responseId';let obj_responseId_union0=null;const obj_responseId_union0_error=(()=>{if(typeof obj_responseId!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_responseId+'" (at "'+path_responseId+'")');}})();if(obj_responseId_union0_error!=null){obj_responseId_union0=obj_responseId_union0_error.message;}let obj_responseId_union1=null;const obj_responseId_union1_error=(()=>{if(obj_responseId!==null){return new TypeError('Expected "null" but received "'+typeof obj_responseId+'" (at "'+path_responseId+'")');}})();if(obj_responseId_union1_error!=null){obj_responseId_union1=obj_responseId_union1_error.message;}if(obj_responseId_union0&&obj_responseId_union1){let message='Object doesn\'t match union (at "'+path_responseId+'")';message+='\n'+obj_responseId_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_responseId_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}})();return v_error===undefined?null:v_error;}const select$a=function PhotoMetadataRepresentationSelect(){return {kind:'Fragment',selections:[{name:'companyBluemasterId',kind:'Scalar'},{name:'responseId',kind:'Scalar'}]};};function equals$e(existing,incoming){const existing_companyBluemasterId=existing.companyBluemasterId;const incoming_companyBluemasterId=incoming.companyBluemasterId;if(!(existing_companyBluemasterId===incoming_companyBluemasterId)){return false;}const existing_responseId=existing.responseId;const incoming_responseId=incoming.responseId;if(!(existing_responseId===incoming_responseId)){return false;}return true;}function validate$t(obj,path='PhotoRecordAvatarRepresentation'){const validateAbstractRecordAvatarRepresentation_validateError=validate$v(obj,path);if(validateAbstractRecordAvatarRepresentation_validateError!==null){return validateAbstractRecordAvatarRepresentation_validateError;}const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_backgroundColor=obj.backgroundColor;const path_backgroundColor=path+'.backgroundColor';let obj_backgroundColor_union0=null;const obj_backgroundColor_union0_error=(()=>{if(typeof obj_backgroundColor!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_backgroundColor+'" (at "'+path_backgroundColor+'")');}})();if(obj_backgroundColor_union0_error!=null){obj_backgroundColor_union0=obj_backgroundColor_union0_error.message;}let obj_backgroundColor_union1=null;const obj_backgroundColor_union1_error=(()=>{if(obj_backgroundColor!==null){return new TypeError('Expected "null" but received "'+typeof obj_backgroundColor+'" (at "'+path_backgroundColor+'")');}})();if(obj_backgroundColor_union1_error!=null){obj_backgroundColor_union1=obj_backgroundColor_union1_error.message;}if(obj_backgroundColor_union0&&obj_backgroundColor_union1){let message='Object doesn\'t match union (at "'+path_backgroundColor+'")';message+='\n'+obj_backgroundColor_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_backgroundColor_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_eTag=obj.eTag;const path_eTag=path+'.eTag';if(typeof obj_eTag!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_eTag+'" (at "'+path_eTag+'")');}const obj_height=obj.height;const path_height=path+'.height';let obj_height_union0=null;const obj_height_union0_error=(()=>{if(typeof obj_height!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_height+'" (at "'+path_height+'")');}})();if(obj_height_union0_error!=null){obj_height_union0=obj_height_union0_error.message;}let obj_height_union1=null;const obj_height_union1_error=(()=>{if(obj_height!==null){return new TypeError('Expected "null" but received "'+typeof obj_height+'" (at "'+path_height+'")');}})();if(obj_height_union1_error!=null){obj_height_union1=obj_height_union1_error.message;}if(obj_height_union0&&obj_height_union1){let message='Object doesn\'t match union (at "'+path_height+'")';message+='\n'+obj_height_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_height_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_photoMetadata=obj.photoMetadata;const path_photoMetadata=path+'.photoMetadata';const referencePhotoMetadataRepresentationValidationError=validate$s(obj_photoMetadata,path_photoMetadata);if(referencePhotoMetadataRepresentationValidationError!==null){let message='Object doesn\'t match PhotoMetadataRepresentation (at "'+path_photoMetadata+'")\n';message+=referencePhotoMetadataRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_photoUrl=obj.photoUrl;const path_photoUrl=path+'.photoUrl';if(typeof obj_photoUrl!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_photoUrl+'" (at "'+path_photoUrl+'")');}const obj_provider=obj.provider;const path_provider=path+'.provider';let obj_provider_union0=null;const obj_provider_union0_error=(()=>{if(typeof obj_provider!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_provider+'" (at "'+path_provider+'")');}})();if(obj_provider_union0_error!=null){obj_provider_union0=obj_provider_union0_error.message;}let obj_provider_union1=null;const obj_provider_union1_error=(()=>{if(obj_provider!==null){return new TypeError('Expected "null" but received "'+typeof obj_provider+'" (at "'+path_provider+'")');}})();if(obj_provider_union1_error!=null){obj_provider_union1=obj_provider_union1_error.message;}if(obj_provider_union0&&obj_provider_union1){let message='Object doesn\'t match union (at "'+path_provider+'")';message+='\n'+obj_provider_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_provider_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_width=obj.width;const path_width=path+'.width';let obj_width_union0=null;const obj_width_union0_error=(()=>{if(typeof obj_width!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_width+'" (at "'+path_width+'")');}})();if(obj_width_union0_error!=null){obj_width_union0=obj_width_union0_error.message;}let obj_width_union1=null;const obj_width_union1_error=(()=>{if(obj_width!==null){return new TypeError('Expected "null" but received "'+typeof obj_width+'" (at "'+path_width+'")');}})();if(obj_width_union1_error!=null){obj_width_union1=obj_width_union1_error.message;}if(obj_width_union0&&obj_width_union1){let message='Object doesn\'t match union (at "'+path_width+'")';message+='\n'+obj_width_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_width_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}})();return v_error===undefined?null:v_error;}function keyBuilder$a(config){return keyBuilder$c(config);}function normalize$c(input,existing,path,lds,store,timestamp){return input;}const select$b=function PhotoRecordAvatarRepresentationSelect(){const{selections:AbstractRecordAvatarRepresentationSelections}=select$d();const{selections:PhotoMetadataRepresentation__selections,opaque:PhotoMetadataRepresentation__opaque}=select$a();return {kind:'Fragment',selections:[...AbstractRecordAvatarRepresentationSelections,{name:'backgroundColor',kind:'Scalar'},{name:'height',kind:'Scalar'},{name:'photoMetadata',kind:'Object',selections:PhotoMetadataRepresentation__selections},{name:'photoUrl',kind:'Scalar'},{name:'provider',kind:'Scalar'},{name:'width',kind:'Scalar'}]};};function equals$f(existing,incoming){if(equals$h(existing,incoming)===false){return false;}const existing_eTag=existing.eTag;const incoming_eTag=incoming.eTag;if(!(existing_eTag===incoming_eTag)){return false;}const existing_photoUrl=existing.photoUrl;const incoming_photoUrl=incoming.photoUrl;if(!(existing_photoUrl===incoming_photoUrl)){return false;}const existing_backgroundColor=existing.backgroundColor;const incoming_backgroundColor=incoming.backgroundColor;if(!(existing_backgroundColor===incoming_backgroundColor)){return false;}const existing_height=existing.height;const incoming_height=incoming.height;if(!(existing_height===incoming_height)){return false;}const existing_photoMetadata=existing.photoMetadata;const incoming_photoMetadata=incoming.photoMetadata;if(!equals$e(existing_photoMetadata,incoming_photoMetadata)){return false;}const existing_provider=existing.provider;const incoming_provider=incoming.provider;if(!(existing_provider===incoming_provider)){return false;}const existing_width=existing.width;const incoming_width=incoming.width;if(!(existing_width===incoming_width)){return false;}return true;}const ingest$c=function PhotoRecordAvatarRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$t(input);if(validateError!==null){throw validateError;}}const key=keyBuilder$a({recordId:input.recordId});let incomingRecord=normalize$c(input,store.records[key],{fullPath:key,parent:path.parent});const existingRecord=store.records[key];if(existingRecord===undefined||equals$f(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}return createLink$5(key);};function validate$u(obj,path='ThemeRecordAvatarRepresentation'){const validateAbstractRecordAvatarRepresentation_validateError=validate$v(obj,path);if(validateAbstractRecordAvatarRepresentation_validateError!==null){return validateAbstractRecordAvatarRepresentation_validateError;}const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_backgroundColor=obj.backgroundColor;const path_backgroundColor=path+'.backgroundColor';let obj_backgroundColor_union0=null;const obj_backgroundColor_union0_error=(()=>{if(typeof obj_backgroundColor!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_backgroundColor+'" (at "'+path_backgroundColor+'")');}})();if(obj_backgroundColor_union0_error!=null){obj_backgroundColor_union0=obj_backgroundColor_union0_error.message;}let obj_backgroundColor_union1=null;const obj_backgroundColor_union1_error=(()=>{if(obj_backgroundColor!==null){return new TypeError('Expected "null" but received "'+typeof obj_backgroundColor+'" (at "'+path_backgroundColor+'")');}})();if(obj_backgroundColor_union1_error!=null){obj_backgroundColor_union1=obj_backgroundColor_union1_error.message;}if(obj_backgroundColor_union0&&obj_backgroundColor_union1){let message='Object doesn\'t match union (at "'+path_backgroundColor+'")';message+='\n'+obj_backgroundColor_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_backgroundColor_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_eTag=obj.eTag;const path_eTag=path+'.eTag';if(typeof obj_eTag!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_eTag+'" (at "'+path_eTag+'")');}const obj_iconUrl=obj.iconUrl;const path_iconUrl=path+'.iconUrl';let obj_iconUrl_union0=null;const obj_iconUrl_union0_error=(()=>{if(typeof obj_iconUrl!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_iconUrl+'" (at "'+path_iconUrl+'")');}})();if(obj_iconUrl_union0_error!=null){obj_iconUrl_union0=obj_iconUrl_union0_error.message;}let obj_iconUrl_union1=null;const obj_iconUrl_union1_error=(()=>{if(obj_iconUrl!==null){return new TypeError('Expected "null" but received "'+typeof obj_iconUrl+'" (at "'+path_iconUrl+'")');}})();if(obj_iconUrl_union1_error!=null){obj_iconUrl_union1=obj_iconUrl_union1_error.message;}if(obj_iconUrl_union0&&obj_iconUrl_union1){let message='Object doesn\'t match union (at "'+path_iconUrl+'")';message+='\n'+obj_iconUrl_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_iconUrl_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}})();return v_error===undefined?null:v_error;}function keyBuilder$b(config){return keyBuilder$c(config);}function normalize$d(input,existing,path,lds,store,timestamp){return input;}const select$c=function ThemeRecordAvatarRepresentationSelect(){const{selections:AbstractRecordAvatarRepresentationSelections}=select$d();return {kind:'Fragment',selections:[...AbstractRecordAvatarRepresentationSelections,{name:'backgroundColor',kind:'Scalar'},{name:'iconUrl',kind:'Scalar'}]};};function equals$g(existing,incoming){if(equals$h(existing,incoming)===false){return false;}const existing_eTag=existing.eTag;const incoming_eTag=incoming.eTag;if(!(existing_eTag===incoming_eTag)){return false;}const existing_backgroundColor=existing.backgroundColor;const incoming_backgroundColor=incoming.backgroundColor;if(!(existing_backgroundColor===incoming_backgroundColor)){return false;}const existing_iconUrl=existing.iconUrl;const incoming_iconUrl=incoming.iconUrl;if(!(existing_iconUrl===incoming_iconUrl)){return false;}return true;}const ingest$d=function ThemeRecordAvatarRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$u(input);if(validateError!==null){throw validateError;}}const key=keyBuilder$b({recordId:input.recordId});let incomingRecord=normalize$d(input,store.records[key],{fullPath:key,parent:path.parent});const existingRecord=store.records[key];if(existingRecord===undefined||equals$g(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}return createLink$5(key);};var DiscriminatorValues$1;(function(DiscriminatorValues){DiscriminatorValues["Photo"]="Photo";DiscriminatorValues["Theme"]="Theme";})(DiscriminatorValues$1||(DiscriminatorValues$1={}));function validate$v(obj,path='AbstractRecordAvatarRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_recordId=obj.recordId;const path_recordId=path+'.recordId';if(typeof obj_recordId!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_recordId+'" (at "'+path_recordId+'")');}const obj_type=obj.type;const path_type=path+'.type';if(typeof obj_type!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_type+'" (at "'+path_type+'")');}})();return v_error===undefined?null:v_error;}function keyBuilder$c(config){return keyPrefix$4+'AbstractRecordAvatarRepresentation:'+config.recordId;}const selectChildren=function AbstractRecordAvatarRepresentationSelectChildren(params){const{selections:PhotoRecordAvatarRepresentationSelections}=select$b();const{selections:ThemeRecordAvatarRepresentationSelections}=select$c();return {kind:'Link',name:params.propertyName,nullable:params.nullable,union:true,discriminator:'type',unionSelections:{[DiscriminatorValues$1.Photo]:PhotoRecordAvatarRepresentationSelections,[DiscriminatorValues$1.Theme]:ThemeRecordAvatarRepresentationSelections}};};const select$d=function AbstractRecordAvatarRepresentationSelect(){return {kind:'Fragment',selections:[{name:'recordId',kind:'Scalar'},{name:'type',kind:'Scalar'}]};};function equals$h(existing,incoming){const existing_recordId=existing.recordId;const incoming_recordId=incoming.recordId;if(!(existing_recordId===incoming_recordId)){return false;}const existing_type=existing.type;const incoming_type=incoming.type;if(!(existing_type===incoming_type)){return false;}return true;}const discriminatorIngest=function AbstractRecordAvatarRepresentationDiscriminatorIngest(input,path,lds,store,timestamp){const discriminatorValue=input.type;if(discriminatorValue==='Photo'){return ingest$c(input,path,lds,store);}if(discriminatorValue==='Theme'){return ingest$d(input,path,lds,store);}throw new Error(`Invalid discriminatorValue "${discriminatorValue}". Expected one of "Photo","Theme"`);};function validate$w(obj,path='RecordAvatarBatchRepresentation'){const validateAbstractRecordAvatarBatchRepresentation_validateError=validate$A(obj,path);if(validateAbstractRecordAvatarBatchRepresentation_validateError!==null){return validateAbstractRecordAvatarBatchRepresentation_validateError;}const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_result=obj.result;const path_result=path+'.result';if(typeof obj_result!=='object'){return new TypeError('Expected "object" but received "'+typeof obj_result+'" (at "'+path_result+'")');}})();return v_error===undefined?null:v_error;}function normalize$f(input,existing,path,lds,store,timestamp){const input_result=input.result;const input_result_id=path.fullPath+'__result';input.result=discriminatorIngest(input_result,{fullPath:input_result_id,parent:{data:input,key:path.fullPath,existing:existing}},lds,store);return input;}const select$e=function RecordAvatarBatchRepresentationSelect(){const{selections:AbstractRecordAvatarBatchRepresentationSelections}=select$i();const AbstractRecordAvatarRepresentation__unionSelections=selectChildren({propertyName:'result',nullable:false});return {kind:'Fragment',selections:[...AbstractRecordAvatarBatchRepresentationSelections,AbstractRecordAvatarRepresentation__unionSelections]};};function equals$i(existing,incoming){if(equals$m(existing,incoming)===false){return false;}const existing_result=existing.result;const incoming_result=incoming.result;if(!(existing_result.__ref===incoming_result.__ref)){return false;}return true;}const ingest$f=function RecordAvatarBatchRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$w(input);if(validateError!==null){throw validateError;}}const key=path.fullPath;let incomingRecord=normalize$f(input,store.records[key],{fullPath:key,parent:path.parent},lds,store);const existingRecord=store.records[key];if(existingRecord===undefined||equals$i(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}return createLink$5(key);};function validate$x(obj,path='ErrorSingleRecordAvatarRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_errorCode=obj.errorCode;const path_errorCode=path+'.errorCode';if(typeof obj_errorCode!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_errorCode+'" (at "'+path_errorCode+'")');}const obj_message=obj.message;const path_message=path+'.message';if(typeof obj_message!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_message+'" (at "'+path_message+'")');}})();return v_error===undefined?null:v_error;}const select$f=function ErrorSingleRecordAvatarRepresentationSelect(){return {kind:'Fragment',selections:[{name:'errorCode',kind:'Scalar'},{name:'message',kind:'Scalar'}]};};function equals$j(existing,incoming){const existing_errorCode=existing.errorCode;const incoming_errorCode=incoming.errorCode;if(!(existing_errorCode===incoming_errorCode)){return false;}const existing_message=existing.message;const incoming_message=incoming.message;if(!(existing_message===incoming_message)){return false;}return true;}function validate$y(obj,path='ErrorBadRequestRecordAvatarBatchRepresentation'){const validateAbstractRecordAvatarBatchRepresentation_validateError=validate$A(obj,path);if(validateAbstractRecordAvatarBatchRepresentation_validateError!==null){return validateAbstractRecordAvatarBatchRepresentation_validateError;}const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_result=obj.result;const path_result=path+'.result';if(!ArrayIsArray$6(obj_result)){return new TypeError('Expected "array" but received "'+typeof obj_result+'" (at "'+path_result+'")');}for(let i=0;i<obj_result.length;i++){const obj_result_item=obj_result[i];const path_result_item=path_result+'['+i+']';const referenceErrorSingleRecordAvatarRepresentationValidationError=validate$x(obj_result_item,path_result_item);if(referenceErrorSingleRecordAvatarRepresentationValidationError!==null){let message='Object doesn\'t match ErrorSingleRecordAvatarRepresentation (at "'+path_result_item+'")\n';message+=referenceErrorSingleRecordAvatarRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}})();return v_error===undefined?null:v_error;}function normalize$g(input,existing,path,lds,store,timestamp){return input;}const select$g=function ErrorBadRequestRecordAvatarBatchRepresentationSelect(){const{selections:AbstractRecordAvatarBatchRepresentationSelections}=select$i();const{selections:ErrorSingleRecordAvatarRepresentation__selections,opaque:ErrorSingleRecordAvatarRepresentation__opaque}=select$f();return {kind:'Fragment',selections:[...AbstractRecordAvatarBatchRepresentationSelections,{name:'result',kind:'Object',plural:true,selections:ErrorSingleRecordAvatarRepresentation__selections}]};};function equals$k(existing,incoming){if(equals$m(existing,incoming)===false){return false;}const existing_result=existing.result;const incoming_result=incoming.result;const equals_result_items=equalsArray(existing_result,incoming_result,(existing_result_item,incoming_result_item)=>{if(!equals$j(existing_result_item,incoming_result_item)){return false;}});if(equals_result_items===false){return false;}return true;}const ingest$g=function ErrorBadRequestRecordAvatarBatchRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$y(input);if(validateError!==null){throw validateError;}}const key=path.fullPath;let incomingRecord=normalize$g(input,store.records[key],{fullPath:key,parent:path.parent});const existingRecord=store.records[key];if(existingRecord===undefined||equals$k(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}return createLink$5(key);};function validate$z(obj,path='ErrorRecordAvatarBatchRepresentation'){const validateAbstractRecordAvatarBatchRepresentation_validateError=validate$A(obj,path);if(validateAbstractRecordAvatarBatchRepresentation_validateError!==null){return validateAbstractRecordAvatarBatchRepresentation_validateError;}const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_result=obj.result;const path_result=path+'.result';if(!ArrayIsArray$6(obj_result)){return new TypeError('Expected "array" but received "'+typeof obj_result+'" (at "'+path_result+'")');}for(let i=0;i<obj_result.length;i++){const obj_result_item=obj_result[i];const path_result_item=path_result+'['+i+']';const referenceErrorSingleRecordAvatarRepresentationValidationError=validate$x(obj_result_item,path_result_item);if(referenceErrorSingleRecordAvatarRepresentationValidationError!==null){let message='Object doesn\'t match ErrorSingleRecordAvatarRepresentation (at "'+path_result_item+'")\n';message+=referenceErrorSingleRecordAvatarRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}})();return v_error===undefined?null:v_error;}function normalize$h(input,existing,path,lds,store,timestamp){return input;}const select$h=function ErrorRecordAvatarBatchRepresentationSelect(){const{selections:AbstractRecordAvatarBatchRepresentationSelections}=select$i();const{selections:ErrorSingleRecordAvatarRepresentation__selections,opaque:ErrorSingleRecordAvatarRepresentation__opaque}=select$f();return {kind:'Fragment',selections:[...AbstractRecordAvatarBatchRepresentationSelections,{name:'result',kind:'Object',plural:true,selections:ErrorSingleRecordAvatarRepresentation__selections}]};};function equals$l(existing,incoming){if(equals$m(existing,incoming)===false){return false;}const existing_result=existing.result;const incoming_result=incoming.result;const equals_result_items=equalsArray(existing_result,incoming_result,(existing_result_item,incoming_result_item)=>{if(!equals$j(existing_result_item,incoming_result_item)){return false;}});if(equals_result_items===false){return false;}return true;}const ingest$h=function ErrorRecordAvatarBatchRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$z(input);if(validateError!==null){throw validateError;}}const key=path.fullPath;let incomingRecord=normalize$h(input,store.records[key],{fullPath:key,parent:path.parent});const existingRecord=store.records[key];if(existingRecord===undefined||equals$l(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}return createLink$5(key);};const DiscriminatorValues$1$1={'200':200,'400':400,'404':404};function validate$A(obj,path='AbstractRecordAvatarBatchRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_statusCode=obj.statusCode;const path_statusCode=path+'.statusCode';if(typeof obj_statusCode!=='number'){return new TypeError('Expected "number" but received "'+typeof obj_statusCode+'" (at "'+path_statusCode+'")');}})();return v_error===undefined?null:v_error;}const selectChildren$1=function AbstractRecordAvatarBatchRepresentationSelectChildren(params){const{selections:RecordAvatarBatchRepresentationSelections}=select$e();const{selections:ErrorBadRequestRecordAvatarBatchRepresentationSelections}=select$g();const{selections:ErrorRecordAvatarBatchRepresentationSelections}=select$h();return {kind:'Link',name:params.propertyName,nullable:params.nullable,union:true,discriminator:'statusCode',unionSelections:{[DiscriminatorValues$1$1['200']]:RecordAvatarBatchRepresentationSelections,[DiscriminatorValues$1$1['400']]:ErrorBadRequestRecordAvatarBatchRepresentationSelections,[DiscriminatorValues$1$1['404']]:ErrorRecordAvatarBatchRepresentationSelections}};};const select$i=function AbstractRecordAvatarBatchRepresentationSelect(){return {kind:'Fragment',selections:[{name:'statusCode',kind:'Scalar'}]};};function equals$m(existing,incoming){const existing_statusCode=existing.statusCode;const incoming_statusCode=incoming.statusCode;if(!(existing_statusCode===incoming_statusCode)){return false;}return true;}const discriminatorIngest$1=function AbstractRecordAvatarBatchRepresentationDiscriminatorIngest(input,path,lds,store,timestamp){const discriminatorValue=input.statusCode;if(discriminatorValue===200){return ingest$f(input,path,lds,store);}if(discriminatorValue===400){return ingest$g(input,path,lds,store);}if(discriminatorValue===404){return ingest$h(input,path,lds,store);}throw new Error(`Invalid discriminatorValue "${discriminatorValue}". Expected one of "200","400","404"`);};function merge$2(existing,incoming,_lds,_path){if(existing===undefined){return incoming;}// Merge RecordRepresentation field values together
    return _objectSpread$2({},existing,incoming);}function validate$B(obj,path='RecordAvatarBulkMapRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_keys=ObjectKeys$5(obj);for(let i=0;i<obj_keys.length;i++){const key=obj_keys[i];const obj_prop=obj[key];const path_prop=path+'["'+key+'"]';if(typeof obj_prop!=='object'){return new TypeError('Expected "object" but received "'+typeof obj_prop+'" (at "'+path_prop+'")');}}})();return v_error===undefined?null:v_error;}function normalize$i(input,existing,path,lds,store,timestamp){const input_keys=Object.keys(input);const input_length=input_keys.length;for(let i=0;i<input_length;i++){const key=input_keys[i];const input_prop=input[key];const input_prop_id=path.fullPath+'__'+key;input[key]=discriminatorIngest$1(input_prop,{fullPath:input_prop_id,parent:{data:input,key:path.fullPath,existing:existing}},lds,store);}return input;}function equals$n(existing,incoming){const equals_props=equalsObject(existing,incoming,(existing_prop,incoming_prop)=>{if(!(existing_prop.__ref===incoming_prop.__ref)){return false;}});if(equals_props===false){return false;}return true;}const ingest$i=function RecordAvatarBulkMapRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$B(input);if(validateError!==null){throw validateError;}}const key=path.fullPath;let incomingRecord=normalize$i(input,store.records[key],{fullPath:key,parent:path.parent},lds,store);const existingRecord=store.records[key];incomingRecord=merge$2(existingRecord,incomingRecord);if(existingRecord===undefined||equals$n(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}store.setExpiration(key,timestamp+300000);return createLink$5(key);};function getUiApiRecordAvatarsBatchByRecordIds(config){const key=keyPrefix$4+'RecordAvatarBulkMapRepresentation('+'formFactor:'+config.queryParams.formFactor+','+'recordIds:'+config.urlParams.recordIds+')';const headers={};return {path:'/services/data/v49.0/ui-api/record-avatars/batch/'+config.urlParams.recordIds+'',method:'get',body:null,urlParams:config.urlParams,queryParams:config.queryParams,key:key,ingest:ingest$i,headers};}var FormFactor$1;(function(FormFactor){FormFactor["Large"]="Large";FormFactor["Medium"]="Medium";FormFactor["Small"]="Small";})(FormFactor$1||(FormFactor$1={}));function coerceFormFactor(form){if(form===FormFactor$1.Large||form===FormFactor$1.Medium||form===FormFactor$1.Small){return form;}return undefined;}const getRecordAvatars_ConfigPropertyNames={displayName:'getRecordAvatars',parameters:{required:['recordIds'],optional:['formFactor']}};function coerceConfig$a(config){const coercedConfig={};const recordIds=getRecordId18Array(config.recordIds);if(recordIds!==undefined){coercedConfig.recordIds=recordIds;}const formFactor=coerceFormFactor(config.formFactor);if(formFactor!==undefined){coercedConfig.formFactor=formFactor;}return coercedConfig;}function typeCheckConfig$a(untrustedConfig){const config={};const untrustedConfig_recordIds=untrustedConfig.recordIds;if(ArrayIsArray$1$5(untrustedConfig_recordIds)){const untrustedConfig_recordIds_array=[];for(let i=0,arrayLength=untrustedConfig_recordIds.length;i<arrayLength;i++){const untrustedConfig_recordIds_item=untrustedConfig_recordIds[i];if(typeof untrustedConfig_recordIds_item==='string'){untrustedConfig_recordIds_array.push(untrustedConfig_recordIds_item);}}config.recordIds=untrustedConfig_recordIds_array;}const untrustedConfig_formFactor=untrustedConfig.formFactor;if(typeof untrustedConfig_formFactor==='string'){config.formFactor=untrustedConfig_formFactor;}return config;}function validateAdapterConfig$a(untrustedConfig,configPropertyNames){if(!untrustedIsObject$5(untrustedConfig)){return null;}{validateConfig$4(untrustedConfig,configPropertyNames);}const coercedConfig=coerceConfig$a(untrustedConfig);const config=typeCheckConfig$a(coercedConfig);if(!areRequiredParametersPresent$4(config,configPropertyNames)){return null;}return config;}function selectAvatars(recordIds){return recordIds.map(recordId=>{return selectChildren$1({propertyName:recordId});});}// All of the avatars are ingested into
    // the same top level object
    const KEY=`${keyPrefix$4}RecordAvatarsBulk`;function buildInMemorySnapshot$8(lds,config){const sel=selectAvatars(config.recordIds);return lds.storeLookup({recordId:KEY,node:{kind:'Fragment',selections:sel},variables:{}});}/**
     *
     * The third argument, "recordIds", is here because
     * We only want to fetch avatars that are actually missing
     * This list will be a subset of the recordIds that are on the adapter config.
     *
     */function buildNetworkSnapshot$7(lds,config,recordIds){const resourceRequest=getUiApiRecordAvatarsBatchByRecordIds({urlParams:{recordIds},queryParams:{}});return lds.dispatchResourceRequest(resourceRequest).then(response=>{const formatted=response.body.results.reduce((seed,avatar,index)=>{const recordId=recordIds[index];seed[recordId]=avatar;return seed;},{});lds.storeIngest(KEY,resourceRequest,formatted);lds.storeBroadcast();return buildInMemorySnapshot$8(lds,config);},err=>{lds.storeIngestFetchResponse(KEY,err);lds.storeBroadcast();return lds.errorSnapshot(err);});}// We have to type guard against pending snapshots
    // We should only ever get UnfulfilledSnapshot here
    function getRecordIds(config,snapshot){{if(isUnfulfilledSnapshot$1(snapshot)===false){throw new Error('Unexpected snapshot state in "getRecordIds" in "getRecordAvatars"');}}// Missing all avatars
    if(snapshot.data===undefined){return config.recordIds;}return keys$3(snapshot.missingPaths).sort();}const factory$8=lds=>{return refreshable$5(function(unknown){const config=validateAdapterConfig$a(unknown,getRecordAvatars_ConfigPropertyNames);if(config===null){return null;}const cacheLookup=buildInMemorySnapshot$8(lds,config);// CACHE HIT
    if(isFulfilledSnapshot$1(cacheLookup)){return cacheLookup;}// CACHE MISS
    // Only fetch avatars that are missing
    const recordIds=getRecordIds(config,cacheLookup);return buildNetworkSnapshot$7(lds,config,recordIds);},untrusted=>{const config=validateAdapterConfig$a(untrusted,getRecordAvatars_ConfigPropertyNames);if(config===null){throw new Error('Refresh should not be called with partial configuration');}return buildNetworkSnapshot$7(lds,config,config.recordIds);});};const select$j$1=function LeadStatusPicklistValueAttributesRepresentationSelect(){const{selections:AbstractPicklistValueAttributesRepresentationSelections}=select$m$1();return {kind:'Fragment',selections:[...AbstractPicklistValueAttributesRepresentationSelections,{name:'converted',kind:'Scalar'}]};};const select$k$1=function CaseStatusPicklistValueAttributesRepresentationSelect(){const{selections:AbstractPicklistValueAttributesRepresentationSelections}=select$m$1();return {kind:'Fragment',selections:[...AbstractPicklistValueAttributesRepresentationSelections,{name:'closed',kind:'Scalar'}]};};const select$l$1=function OpportunityStagePicklistValueAttributesRepresentationSelect(){const{selections:AbstractPicklistValueAttributesRepresentationSelections}=select$m$1();return {kind:'Fragment',selections:[...AbstractPicklistValueAttributesRepresentationSelections,{name:'closed',kind:'Scalar'},{name:'defaultProbability',kind:'Scalar'},{name:'forecastCategoryName',kind:'Scalar'},{name:'won',kind:'Scalar'}]};};var DiscriminatorValues$2$1;(function(DiscriminatorValues){DiscriminatorValues["LeadStatus"]="LeadStatus";DiscriminatorValues["CaseStatus"]="CaseStatus";DiscriminatorValues["OpportunityStage"]="OpportunityStage";})(DiscriminatorValues$2$1||(DiscriminatorValues$2$1={}));function validate$C(obj,path='AbstractPicklistValueAttributesRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_picklistAtrributesValueType=obj.picklistAtrributesValueType;const path_picklistAtrributesValueType=path+'.picklistAtrributesValueType';if(typeof obj_picklistAtrributesValueType!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_picklistAtrributesValueType+'" (at "'+path_picklistAtrributesValueType+'")');}})();return v_error===undefined?null:v_error;}const selectChildren$2$1=function AbstractPicklistValueAttributesRepresentationSelectChildren(params){const{selections:LeadStatusPicklistValueAttributesRepresentationSelections}=select$j$1();const{selections:CaseStatusPicklistValueAttributesRepresentationSelections}=select$k$1();const{selections:OpportunityStagePicklistValueAttributesRepresentationSelections}=select$l$1();return {kind:'Object',name:params.propertyName,nullable:params.nullable,union:true,discriminator:'picklistAtrributesValueType',unionSelections:{[DiscriminatorValues$2$1.LeadStatus]:LeadStatusPicklistValueAttributesRepresentationSelections,[DiscriminatorValues$2$1.CaseStatus]:CaseStatusPicklistValueAttributesRepresentationSelections,[DiscriminatorValues$2$1.OpportunityStage]:OpportunityStagePicklistValueAttributesRepresentationSelections}};};const select$m$1=function AbstractPicklistValueAttributesRepresentationSelect(){return {kind:'Fragment',selections:[{name:'picklistAtrributesValueType',kind:'Scalar'}]};};function validate$D(obj,path='PicklistValueRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_attributes=obj.attributes;const path_attributes=path+'.attributes';let obj_attributes_union0=null;const obj_attributes_union0_error=(()=>{const referenceAbstractPicklistValueAttributesRepresentationValidationError=validate$C(obj_attributes,path_attributes);if(referenceAbstractPicklistValueAttributesRepresentationValidationError!==null){let message='Object doesn\'t match AbstractPicklistValueAttributesRepresentation (at "'+path_attributes+'")\n';message+=referenceAbstractPicklistValueAttributesRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}})();if(obj_attributes_union0_error!=null){obj_attributes_union0=obj_attributes_union0_error.message;}let obj_attributes_union1=null;const obj_attributes_union1_error=(()=>{if(obj_attributes!==null){return new TypeError('Expected "null" but received "'+typeof obj_attributes+'" (at "'+path_attributes+'")');}})();if(obj_attributes_union1_error!=null){obj_attributes_union1=obj_attributes_union1_error.message;}if(obj_attributes_union0&&obj_attributes_union1){let message='Object doesn\'t match union (at "'+path_attributes+'")';message+='\n'+obj_attributes_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_attributes_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_label=obj.label;const path_label=path+'.label';if(typeof obj_label!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_label+'" (at "'+path_label+'")');}const obj_validFor=obj.validFor;const path_validFor=path+'.validFor';if(!ArrayIsArray$6(obj_validFor)){return new TypeError('Expected "array" but received "'+typeof obj_validFor+'" (at "'+path_validFor+'")');}for(let i=0;i<obj_validFor.length;i++){const obj_validFor_item=obj_validFor[i];const path_validFor_item=path_validFor+'['+i+']';if(typeof obj_validFor_item!=='number'||typeof obj_validFor_item==='number'&&Math.floor(obj_validFor_item)!==obj_validFor_item){return new TypeError('Expected "integer" but received "'+typeof obj_validFor_item+'" (at "'+path_validFor_item+'")');}}const obj_value=obj.value;const path_value=path+'.value';if(typeof obj_value!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_value+'" (at "'+path_value+'")');}})();return v_error===undefined?null:v_error;}const select$n$1=function PicklistValueRepresentationSelect(){const AbstractPicklistValueAttributesRepresentation__unionSelections=selectChildren$2$1({propertyName:'attributes',nullable:true});return {kind:'Fragment',selections:[AbstractPicklistValueAttributesRepresentation__unionSelections,{name:'label',kind:'Scalar'},{name:'validFor',kind:'Scalar',plural:true},{name:'value',kind:'Scalar'}]};};function validate$E(obj,path='PicklistValuesRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_controllerValues=obj.controllerValues;const path_controllerValues=path+'.controllerValues';if(typeof obj_controllerValues!=='object'||ArrayIsArray$6(obj_controllerValues)||obj_controllerValues===null){return new TypeError('Expected "object" but received "'+typeof obj_controllerValues+'" (at "'+path_controllerValues+'")');}const obj_controllerValues_keys=ObjectKeys$5(obj_controllerValues);for(let i=0;i<obj_controllerValues_keys.length;i++){const key=obj_controllerValues_keys[i];const obj_controllerValues_prop=obj_controllerValues[key];const path_controllerValues_prop=path_controllerValues+'["'+key+'"]';if(typeof obj_controllerValues_prop!=='number'||typeof obj_controllerValues_prop==='number'&&Math.floor(obj_controllerValues_prop)!==obj_controllerValues_prop){return new TypeError('Expected "integer" but received "'+typeof obj_controllerValues_prop+'" (at "'+path_controllerValues_prop+'")');}}const obj_defaultValue=obj.defaultValue;const path_defaultValue=path+'.defaultValue';let obj_defaultValue_union0=null;const obj_defaultValue_union0_error=(()=>{const referencePicklistValueRepresentationValidationError=validate$D(obj_defaultValue,path_defaultValue);if(referencePicklistValueRepresentationValidationError!==null){let message='Object doesn\'t match PicklistValueRepresentation (at "'+path_defaultValue+'")\n';message+=referencePicklistValueRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}})();if(obj_defaultValue_union0_error!=null){obj_defaultValue_union0=obj_defaultValue_union0_error.message;}let obj_defaultValue_union1=null;const obj_defaultValue_union1_error=(()=>{if(obj_defaultValue!==null){return new TypeError('Expected "null" but received "'+typeof obj_defaultValue+'" (at "'+path_defaultValue+'")');}})();if(obj_defaultValue_union1_error!=null){obj_defaultValue_union1=obj_defaultValue_union1_error.message;}if(obj_defaultValue_union0&&obj_defaultValue_union1){let message='Object doesn\'t match union (at "'+path_defaultValue+'")';message+='\n'+obj_defaultValue_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_defaultValue_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_eTag=obj.eTag;const path_eTag=path+'.eTag';if(typeof obj_eTag!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_eTag+'" (at "'+path_eTag+'")');}const obj_url=obj.url;const path_url=path+'.url';if(typeof obj_url!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_url+'" (at "'+path_url+'")');}const obj_values=obj.values;const path_values=path+'.values';if(!ArrayIsArray$6(obj_values)){return new TypeError('Expected "array" but received "'+typeof obj_values+'" (at "'+path_values+'")');}for(let i=0;i<obj_values.length;i++){const obj_values_item=obj_values[i];const path_values_item=path_values+'['+i+']';const referencePicklistValueRepresentationValidationError=validate$D(obj_values_item,path_values_item);if(referencePicklistValueRepresentationValidationError!==null){let message='Object doesn\'t match PicklistValueRepresentation (at "'+path_values_item+'")\n';message+=referencePicklistValueRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}})();return v_error===undefined?null:v_error;}function keyBuilder$d(config){return keyPrefix$4+'PicklistValuesRepresentation:'+config.id;}function normalize$j(input,existing,path,lds,store,timestamp){return input;}const select$o$1=function PicklistValuesRepresentationSelect(){const{selections:PicklistValueRepresentation__selections,opaque:PicklistValueRepresentation__opaque}=select$n$1();return {kind:'Fragment',selections:[{name:'controllerValues',kind:'Scalar',map:true},{name:'defaultValue',kind:'Object',nullable:true,selections:PicklistValueRepresentation__selections},{name:'url',kind:'Scalar'},{name:'values',kind:'Object',plural:true,selections:PicklistValueRepresentation__selections}]};};function equals$o(existing,incoming){if(existing.eTag!==incoming.eTag){return false;}return true;}const ingest$j=function PicklistValuesRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$E(input);if(validateError!==null){throw validateError;}}const key=keyBuilder$d({id:input.url});let incomingRecord=normalize$j(input,store.records[key],{fullPath:key,parent:path.parent});const existingRecord=store.records[key];if(existingRecord===undefined||equals$o(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}store.setExpiration(key,timestamp+300000);return createLink$5(key);};function getUiApiObjectInfoPicklistValuesByObjectApiNameAndRecordTypeIdAndFieldApiName(config){const key=keyPrefix$4+'PicklistValuesRepresentation('+'objectApiName:'+config.urlParams.objectApiName+','+'recordTypeId:'+config.urlParams.recordTypeId+','+'fieldApiName:'+config.urlParams.fieldApiName+')';const headers={};return {path:'/services/data/v49.0/ui-api/object-info/'+config.urlParams.objectApiName+'/picklist-values/'+config.urlParams.recordTypeId+'/'+config.urlParams.fieldApiName+'',method:'get',body:null,urlParams:config.urlParams,queryParams:{},key:key,ingest:ingest$j,headers};}const adapterName$b='getPicklistValues';function coerceConfig$b(config){const coercedConfig={};const objectApiName=config.objectApiName;if(objectApiName!==undefined){coercedConfig.objectApiName=objectApiName;}const recordTypeId=getRecordId18(config.recordTypeId);if(recordTypeId!==undefined){coercedConfig.recordTypeId=recordTypeId;}const fieldApiName=getFieldApiName(config.fieldApiName);if(fieldApiName!==undefined){coercedConfig.fieldApiName=fieldApiName;}return coercedConfig;}function typeCheckConfig$b(untrustedConfig){const config={};const untrustedConfig_objectApiName=untrustedConfig.objectApiName;if(typeof untrustedConfig_objectApiName==='string'){config.objectApiName=untrustedConfig_objectApiName;}const untrustedConfig_recordTypeId=untrustedConfig.recordTypeId;if(typeof untrustedConfig_recordTypeId==='string'){config.recordTypeId=untrustedConfig_recordTypeId;}const untrustedConfig_fieldApiName=untrustedConfig.fieldApiName;if(typeof untrustedConfig_fieldApiName==='string'){config.fieldApiName=untrustedConfig_fieldApiName;}return config;}function validateAdapterConfig$b(untrustedConfig,configPropertyNames){if(!untrustedIsObject$5(untrustedConfig)){return null;}{validateConfig$4(untrustedConfig,configPropertyNames);}const coercedConfig=coerceConfig$b(untrustedConfig);const config=typeCheckConfig$b(coercedConfig);if(!areRequiredParametersPresent$4(config,configPropertyNames)){return null;}return config;}const path$1=select$o$1().selections;function buildNetworkSnapshot$8(lds,config){const{recordTypeId,fieldApiName}=config;const fieldNames=getFieldId(fieldApiName);const request=getUiApiObjectInfoPicklistValuesByObjectApiNameAndRecordTypeIdAndFieldApiName({urlParams:{objectApiName:fieldNames.objectApiName,fieldApiName:fieldNames.fieldApiName,recordTypeId}});const key=keyBuilder$d({id:request.path});return lds.dispatchResourceRequest(request).then(response=>{const{body}=response;lds.storeIngest(key,request,body);lds.storeBroadcast();return buildInMemorySnapshot$9(lds,config);},err=>{lds.storeIngestFetchResponse(key,err);lds.storeBroadcast();return lds.errorSnapshot(err);});}function buildInMemorySnapshot$9(lds,config){const fieldNames=getFieldId(config.fieldApiName);const request=getUiApiObjectInfoPicklistValuesByObjectApiNameAndRecordTypeIdAndFieldApiName({urlParams:{objectApiName:fieldNames.objectApiName,fieldApiName:fieldNames.fieldApiName,recordTypeId:config.recordTypeId}});const key=keyBuilder$d({id:request.path});return lds.storeLookup({recordId:key,node:{kind:'Fragment',selections:path$1},variables:{}});}const picklistValuesConfigPropertyNames={displayName:adapterName$b,parameters:{required:['recordTypeId','fieldApiName'],optional:[]}};const factory$9=lds=>{return refreshable$5(function(untrusted){const config=validateAdapterConfig$b(untrusted,picklistValuesConfigPropertyNames);if(config===null){return null;}const snapshot=buildInMemorySnapshot$9(lds,config);if(isFulfilledSnapshot$1(snapshot)){return snapshot;}return buildNetworkSnapshot$8(lds,config);},untrusted=>{const config=validateAdapterConfig$b(untrusted,picklistValuesConfigPropertyNames);if(config===null){throw new Error('Refresh should not be called with partial configuration');}return buildNetworkSnapshot$8(lds,config);});};function validate$F(obj,path='PicklistValuesCollectionRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_eTag=obj.eTag;const path_eTag=path+'.eTag';if(typeof obj_eTag!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_eTag+'" (at "'+path_eTag+'")');}const obj_picklistFieldValues=obj.picklistFieldValues;const path_picklistFieldValues=path+'.picklistFieldValues';if(typeof obj_picklistFieldValues!=='object'||ArrayIsArray$6(obj_picklistFieldValues)||obj_picklistFieldValues===null){return new TypeError('Expected "object" but received "'+typeof obj_picklistFieldValues+'" (at "'+path_picklistFieldValues+'")');}const obj_picklistFieldValues_keys=ObjectKeys$5(obj_picklistFieldValues);for(let i=0;i<obj_picklistFieldValues_keys.length;i++){const key=obj_picklistFieldValues_keys[i];const obj_picklistFieldValues_prop=obj_picklistFieldValues[key];const path_picklistFieldValues_prop=path_picklistFieldValues+'["'+key+'"]';if(typeof obj_picklistFieldValues_prop!=='object'){return new TypeError('Expected "object" but received "'+typeof obj_picklistFieldValues_prop+'" (at "'+path_picklistFieldValues_prop+'")');}}})();return v_error===undefined?null:v_error;}function normalize$k(input,existing,path,lds,store,timestamp){const input_picklistFieldValues=input.picklistFieldValues;const input_picklistFieldValues_id=path.fullPath+'__picklistFieldValues';const input_picklistFieldValues_keys=Object.keys(input_picklistFieldValues);const input_picklistFieldValues_length=input_picklistFieldValues_keys.length;for(let i=0;i<input_picklistFieldValues_length;i++){const key=input_picklistFieldValues_keys[i];const input_picklistFieldValues_prop=input_picklistFieldValues[key];const input_picklistFieldValues_prop_id=input_picklistFieldValues_id+'__'+key;input_picklistFieldValues[key]=ingest$j(input_picklistFieldValues_prop,{fullPath:input_picklistFieldValues_prop_id,parent:{data:input,key:path.fullPath,existing:existing}},lds,store,timestamp);}return input;}function equals$p(existing,incoming){const existing_eTag=existing.eTag;const incoming_eTag=incoming.eTag;if(!(existing_eTag===incoming_eTag)){return false;}const existing_picklistFieldValues=existing.picklistFieldValues;const incoming_picklistFieldValues=incoming.picklistFieldValues;const equals_picklistFieldValues_props=equalsObject(existing_picklistFieldValues,incoming_picklistFieldValues,(existing_picklistFieldValues_prop,incoming_picklistFieldValues_prop)=>{if(!(existing_picklistFieldValues_prop.__ref===incoming_picklistFieldValues_prop.__ref)){return false;}});if(equals_picklistFieldValues_props===false){return false;}return true;}const ingest$k=function PicklistValuesCollectionRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$F(input);if(validateError!==null){throw validateError;}}const key=path.fullPath;let incomingRecord=normalize$k(input,store.records[key],{fullPath:key,parent:path.parent},lds,store,timestamp);const existingRecord=store.records[key];if(existingRecord===undefined||equals$p(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}store.setExpiration(key,timestamp+300000);return createLink$5(key);};function getUiApiObjectInfoPicklistValuesByObjectApiNameAndRecordTypeId(config){const key=keyPrefix$4+'PicklistValuesCollectionRepresentation('+'objectApiName:'+config.urlParams.objectApiName+','+'recordTypeId:'+config.urlParams.recordTypeId+')';const headers={};return {path:'/services/data/v49.0/ui-api/object-info/'+config.urlParams.objectApiName+'/picklist-values/'+config.urlParams.recordTypeId+'',method:'get',body:null,urlParams:config.urlParams,queryParams:{},key:key,ingest:ingest$k,headers};}const getPicklistValuesByRecordType_ConfigPropertyNames={displayName:'getPicklistValuesByRecordType',parameters:{required:['objectApiName','recordTypeId'],optional:[]}};function coerceConfig$c(config){const coercedConfig={};const objectApiName=getObjectApiName(config.objectApiName);if(objectApiName!==undefined){coercedConfig.objectApiName=objectApiName;}const recordTypeId=getRecordId18(config.recordTypeId);if(recordTypeId!==undefined){coercedConfig.recordTypeId=recordTypeId;}return coercedConfig;}function typeCheckConfig$c(untrustedConfig){const config={};const untrustedConfig_objectApiName=untrustedConfig.objectApiName;if(typeof untrustedConfig_objectApiName==='string'){config.objectApiName=untrustedConfig_objectApiName;}const untrustedConfig_recordTypeId=untrustedConfig.recordTypeId;if(typeof untrustedConfig_recordTypeId==='string'){config.recordTypeId=untrustedConfig_recordTypeId;}return config;}function validateAdapterConfig$c(untrustedConfig,configPropertyNames){if(!untrustedIsObject$5(untrustedConfig)){return null;}{validateConfig$4(untrustedConfig,configPropertyNames);}const coercedConfig=coerceConfig$c(untrustedConfig);const config=typeCheckConfig$c(coercedConfig);if(!areRequiredParametersPresent$4(config,configPropertyNames)){return null;}return config;}function select$p(picklistNames){return [{kind:'Object',name:'picklistFieldValues',selections:picklistNames.map(name=>{return {kind:'Link',name,selections:path$1};})}];}function buildNetworkSnapshot$9(lds,config){const{objectApiName,recordTypeId}=config;const request=getUiApiObjectInfoPicklistValuesByObjectApiNameAndRecordTypeId({urlParams:{objectApiName,recordTypeId}});const selectorKey=request.key+'__selector';return lds.dispatchResourceRequest(request).then(response=>{const{body}=response;const picklistFieldValueNames=keys$3(body.picklistFieldValues);const sel={recordId:request.key,node:{kind:'Fragment',selections:select$p(picklistFieldValueNames)},variables:{}};// Remember the selector
    lds.storePublish(selectorKey,sel);lds.storeIngest(request.key,request,body);lds.storeBroadcast();return lds.storeLookup(sel);},err=>{lds.storeIngestFetchResponse(request.key,err);lds.storeBroadcast();return lds.errorSnapshot(err);});}function buildInMemorySnapshot$a(lds,config){const request=getUiApiObjectInfoPicklistValuesByObjectApiNameAndRecordTypeId({urlParams:{objectApiName:config.objectApiName,recordTypeId:config.recordTypeId}});const selectorKey=request.key+'__selector';const selectorSnapshot=lds.storeLookup({recordId:selectorKey,node:{kind:'Fragment',opaque:true},variables:{}});// We've seen the response for this request before
    if(isFulfilledSnapshot$1(selectorSnapshot)){const cacheSnapshot=lds.storeLookup(selectorSnapshot.data);// Cache hit
    if(isFulfilledSnapshot$1(cacheSnapshot)){return cacheSnapshot;}}return null;}const factory$a=lds=>{return refreshable$5(untrusted=>{const config=validateAdapterConfig$c(untrusted,getPicklistValuesByRecordType_ConfigPropertyNames);if(config===null){return null;}const snapshot=buildInMemorySnapshot$a(lds,config);if(snapshot!==null){return snapshot;}return buildNetworkSnapshot$9(lds,config);},untrusted=>{const config=validateAdapterConfig$c(untrusted,getPicklistValuesByRecordType_ConfigPropertyNames);if(config===null){throw new Error('Refresh should not be called with partial configuration');}return buildNetworkSnapshot$9(lds,config);});};function merge$3(existing,incoming,_lds,_path){if(existing===undefined){return incoming;}// Merge RecordCreateDefaultRecordRepresentationNormalized record field values together
    return _objectSpread$2({},incoming,{fields:_objectSpread$2({},existing.fields,incoming.fields)});}function validate$H(obj,path='RecordCreateDefaultRecordRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_apiName=obj.apiName;const path_apiName=path+'.apiName';if(typeof obj_apiName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_apiName+'" (at "'+path_apiName+'")');}const obj_childRelationships=obj.childRelationships;const path_childRelationships=path+'.childRelationships';if(typeof obj_childRelationships!=='object'||ArrayIsArray$6(obj_childRelationships)||obj_childRelationships===null){return new TypeError('Expected "object" but received "'+typeof obj_childRelationships+'" (at "'+path_childRelationships+'")');}const obj_childRelationships_keys=ObjectKeys$5(obj_childRelationships);for(let i=0;i<obj_childRelationships_keys.length;i++){const key=obj_childRelationships_keys[i];const obj_childRelationships_prop=obj_childRelationships[key];const path_childRelationships_prop=path_childRelationships+'["'+key+'"]';if(typeof obj_childRelationships_prop!=='object'){return new TypeError('Expected "object" but received "'+typeof obj_childRelationships_prop+'" (at "'+path_childRelationships_prop+'")');}}const obj_fields=obj.fields;const path_fields=path+'.fields';if(typeof obj_fields!=='object'||ArrayIsArray$6(obj_fields)||obj_fields===null){return new TypeError('Expected "object" but received "'+typeof obj_fields+'" (at "'+path_fields+'")');}const obj_fields_keys=ObjectKeys$5(obj_fields);for(let i=0;i<obj_fields_keys.length;i++){const key=obj_fields_keys[i];const obj_fields_prop=obj_fields[key];const path_fields_prop=path_fields+'["'+key+'"]';if(typeof obj_fields_prop!=='object'){return new TypeError('Expected "object" but received "'+typeof obj_fields_prop+'" (at "'+path_fields_prop+'")');}}const obj_id=obj.id;const path_id=path+'.id';if(obj_id!==null){return new TypeError('Expected "null" but received "'+typeof obj_id+'" (at "'+path_id+'")');}const obj_lastModifiedById=obj.lastModifiedById;const path_lastModifiedById=path+'.lastModifiedById';let obj_lastModifiedById_union0=null;const obj_lastModifiedById_union0_error=(()=>{if(typeof obj_lastModifiedById!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_lastModifiedById+'" (at "'+path_lastModifiedById+'")');}})();if(obj_lastModifiedById_union0_error!=null){obj_lastModifiedById_union0=obj_lastModifiedById_union0_error.message;}let obj_lastModifiedById_union1=null;const obj_lastModifiedById_union1_error=(()=>{if(obj_lastModifiedById!==null){return new TypeError('Expected "null" but received "'+typeof obj_lastModifiedById+'" (at "'+path_lastModifiedById+'")');}})();if(obj_lastModifiedById_union1_error!=null){obj_lastModifiedById_union1=obj_lastModifiedById_union1_error.message;}if(obj_lastModifiedById_union0&&obj_lastModifiedById_union1){let message='Object doesn\'t match union (at "'+path_lastModifiedById+'")';message+='\n'+obj_lastModifiedById_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_lastModifiedById_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_lastModifiedDate=obj.lastModifiedDate;const path_lastModifiedDate=path+'.lastModifiedDate';let obj_lastModifiedDate_union0=null;const obj_lastModifiedDate_union0_error=(()=>{if(typeof obj_lastModifiedDate!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_lastModifiedDate+'" (at "'+path_lastModifiedDate+'")');}})();if(obj_lastModifiedDate_union0_error!=null){obj_lastModifiedDate_union0=obj_lastModifiedDate_union0_error.message;}let obj_lastModifiedDate_union1=null;const obj_lastModifiedDate_union1_error=(()=>{if(obj_lastModifiedDate!==null){return new TypeError('Expected "null" but received "'+typeof obj_lastModifiedDate+'" (at "'+path_lastModifiedDate+'")');}})();if(obj_lastModifiedDate_union1_error!=null){obj_lastModifiedDate_union1=obj_lastModifiedDate_union1_error.message;}if(obj_lastModifiedDate_union0&&obj_lastModifiedDate_union1){let message='Object doesn\'t match union (at "'+path_lastModifiedDate+'")';message+='\n'+obj_lastModifiedDate_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_lastModifiedDate_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_recordTypeId=obj.recordTypeId;const path_recordTypeId=path+'.recordTypeId';let obj_recordTypeId_union0=null;const obj_recordTypeId_union0_error=(()=>{if(typeof obj_recordTypeId!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_recordTypeId+'" (at "'+path_recordTypeId+'")');}})();if(obj_recordTypeId_union0_error!=null){obj_recordTypeId_union0=obj_recordTypeId_union0_error.message;}let obj_recordTypeId_union1=null;const obj_recordTypeId_union1_error=(()=>{if(obj_recordTypeId!==null){return new TypeError('Expected "null" but received "'+typeof obj_recordTypeId+'" (at "'+path_recordTypeId+'")');}})();if(obj_recordTypeId_union1_error!=null){obj_recordTypeId_union1=obj_recordTypeId_union1_error.message;}if(obj_recordTypeId_union0&&obj_recordTypeId_union1){let message='Object doesn\'t match union (at "'+path_recordTypeId+'")';message+='\n'+obj_recordTypeId_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_recordTypeId_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_recordTypeInfo=obj.recordTypeInfo;const path_recordTypeInfo=path+'.recordTypeInfo';let obj_recordTypeInfo_union0=null;const obj_recordTypeInfo_union0_error=(()=>{const referenceRecordTypeInfoRepresentationValidationError=validate$9(obj_recordTypeInfo,path_recordTypeInfo);if(referenceRecordTypeInfoRepresentationValidationError!==null){let message='Object doesn\'t match RecordTypeInfoRepresentation (at "'+path_recordTypeInfo+'")\n';message+=referenceRecordTypeInfoRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}})();if(obj_recordTypeInfo_union0_error!=null){obj_recordTypeInfo_union0=obj_recordTypeInfo_union0_error.message;}let obj_recordTypeInfo_union1=null;const obj_recordTypeInfo_union1_error=(()=>{if(obj_recordTypeInfo!==null){return new TypeError('Expected "null" but received "'+typeof obj_recordTypeInfo+'" (at "'+path_recordTypeInfo+'")');}})();if(obj_recordTypeInfo_union1_error!=null){obj_recordTypeInfo_union1=obj_recordTypeInfo_union1_error.message;}if(obj_recordTypeInfo_union0&&obj_recordTypeInfo_union1){let message='Object doesn\'t match union (at "'+path_recordTypeInfo+'")';message+='\n'+obj_recordTypeInfo_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_recordTypeInfo_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_systemModstamp=obj.systemModstamp;const path_systemModstamp=path+'.systemModstamp';let obj_systemModstamp_union0=null;const obj_systemModstamp_union0_error=(()=>{if(typeof obj_systemModstamp!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_systemModstamp+'" (at "'+path_systemModstamp+'")');}})();if(obj_systemModstamp_union0_error!=null){obj_systemModstamp_union0=obj_systemModstamp_union0_error.message;}let obj_systemModstamp_union1=null;const obj_systemModstamp_union1_error=(()=>{if(obj_systemModstamp!==null){return new TypeError('Expected "null" but received "'+typeof obj_systemModstamp+'" (at "'+path_systemModstamp+'")');}})();if(obj_systemModstamp_union1_error!=null){obj_systemModstamp_union1=obj_systemModstamp_union1_error.message;}if(obj_systemModstamp_union0&&obj_systemModstamp_union1){let message='Object doesn\'t match union (at "'+path_systemModstamp+'")';message+='\n'+obj_systemModstamp_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_systemModstamp_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_eTag=obj.eTag;const path_eTag=path+'.eTag';if(typeof obj_eTag!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_eTag+'" (at "'+path_eTag+'")');}const obj_weakEtag=obj.weakEtag;const path_weakEtag=path+'.weakEtag';if(typeof obj_weakEtag!=='number'||typeof obj_weakEtag==='number'&&Math.floor(obj_weakEtag)!==obj_weakEtag){return new TypeError('Expected "integer" but received "'+typeof obj_weakEtag+'" (at "'+path_weakEtag+'")');}})();return v_error===undefined?null:v_error;}function keyBuilder$e(config){return keyPrefix$4+'RecordCreateDefaultRecordRepresentation:'+config.apiName+':'+(config.recordTypeId===null?'':config.recordTypeId);}function normalize$l(input,existing,path,lds,store,timestamp){const input_childRelationships=input.childRelationships;const input_childRelationships_id=path.fullPath+'__childRelationships';const input_childRelationships_keys=Object.keys(input_childRelationships);const input_childRelationships_length=input_childRelationships_keys.length;for(let i=0;i<input_childRelationships_length;i++){const key=input_childRelationships_keys[i];const input_childRelationships_prop=input_childRelationships[key];const input_childRelationships_prop_id=input_childRelationships_id+'__'+key;input_childRelationships[key]=ingest$5(input_childRelationships_prop,{fullPath:input_childRelationships_prop_id,parent:{data:input,key:path.fullPath,existing:existing}},lds,store,timestamp);}const input_fields=input.fields;const input_fields_id=path.fullPath+'__fields';const input_fields_keys=Object.keys(input_fields);const input_fields_length=input_fields_keys.length;for(let i=0;i<input_fields_length;i++){const key=input_fields_keys[i];const input_fields_prop=input_fields[key];const input_fields_prop_id=input_fields_id+'__'+key;input_fields[key]=ingest$1$1(input_fields_prop,{fullPath:input_fields_prop_id,parent:{data:input,key:path.fullPath,existing:existing}},lds,store,timestamp);}return input;}function equals$q(existing,incoming){const existing_weakEtag=existing.weakEtag;const incoming_weakEtag=incoming.weakEtag;if(!(existing_weakEtag===incoming_weakEtag)){return false;}const existing_apiName=existing.apiName;const incoming_apiName=incoming.apiName;if(!(existing_apiName===incoming_apiName)){return false;}const existing_eTag=existing.eTag;const incoming_eTag=incoming.eTag;if(!(existing_eTag===incoming_eTag)){return false;}const existing_childRelationships=existing.childRelationships;const incoming_childRelationships=incoming.childRelationships;const equals_childRelationships_props=equalsObject(existing_childRelationships,incoming_childRelationships,(existing_childRelationships_prop,incoming_childRelationships_prop)=>{if(!(existing_childRelationships_prop.__ref===incoming_childRelationships_prop.__ref)){return false;}});if(equals_childRelationships_props===false){return false;}const existing_fields=existing.fields;const incoming_fields=incoming.fields;const equals_fields_props=equalsObject(existing_fields,incoming_fields,(existing_fields_prop,incoming_fields_prop)=>{if(!(existing_fields_prop.__ref===incoming_fields_prop.__ref)){return false;}});if(equals_fields_props===false){return false;}const existing_id=existing.id;const incoming_id=incoming.id;if(!(existing_id===incoming_id)){return false;}const existing_lastModifiedById=existing.lastModifiedById;const incoming_lastModifiedById=incoming.lastModifiedById;if(!(existing_lastModifiedById===incoming_lastModifiedById)){return false;}const existing_lastModifiedDate=existing.lastModifiedDate;const incoming_lastModifiedDate=incoming.lastModifiedDate;if(!(existing_lastModifiedDate===incoming_lastModifiedDate)){return false;}const existing_recordTypeId=existing.recordTypeId;const incoming_recordTypeId=incoming.recordTypeId;if(!(existing_recordTypeId===incoming_recordTypeId)){return false;}const existing_recordTypeInfo=existing.recordTypeInfo;const incoming_recordTypeInfo=incoming.recordTypeInfo;if(!(existing_recordTypeInfo===incoming_recordTypeInfo||existing_recordTypeInfo!=null&&incoming_recordTypeInfo!=null&&equals$5(existing_recordTypeInfo,incoming_recordTypeInfo))){return false;}const existing_systemModstamp=existing.systemModstamp;const incoming_systemModstamp=incoming.systemModstamp;if(!(existing_systemModstamp===incoming_systemModstamp)){return false;}return true;}const ingest$l=function RecordCreateDefaultRecordRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$H(input);if(validateError!==null){throw validateError;}}const key=keyBuilder$e({apiName:input.apiName,recordTypeId:input.recordTypeId});let incomingRecord=normalize$l(input,store.records[key],{fullPath:key,parent:path.parent},lds,store,timestamp);const existingRecord=store.records[key];incomingRecord=merge$3(existingRecord,incomingRecord);if(existingRecord===undefined||equals$q(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}return createLink$5(key);};function validate$I(obj,path='RecordDefaultsRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_layout=obj.layout;const path_layout=path+'.layout';let obj_layout_union0=null;const obj_layout_union0_error=(()=>{if(typeof obj_layout!=='object'){return new TypeError('Expected "object" but received "'+typeof obj_layout+'" (at "'+path_layout+'")');}})();if(obj_layout_union0_error!=null){obj_layout_union0=obj_layout_union0_error.message;}let obj_layout_union1=null;const obj_layout_union1_error=(()=>{if(obj_layout!==null){return new TypeError('Expected "null" but received "'+typeof obj_layout+'" (at "'+path_layout+'")');}})();if(obj_layout_union1_error!=null){obj_layout_union1=obj_layout_union1_error.message;}if(obj_layout_union0&&obj_layout_union1){let message='Object doesn\'t match union (at "'+path_layout+'")';message+='\n'+obj_layout_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_layout_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_objectInfos=obj.objectInfos;const path_objectInfos=path+'.objectInfos';if(typeof obj_objectInfos!=='object'||ArrayIsArray$6(obj_objectInfos)||obj_objectInfos===null){return new TypeError('Expected "object" but received "'+typeof obj_objectInfos+'" (at "'+path_objectInfos+'")');}const obj_objectInfos_keys=ObjectKeys$5(obj_objectInfos);for(let i=0;i<obj_objectInfos_keys.length;i++){const key=obj_objectInfos_keys[i];const obj_objectInfos_prop=obj_objectInfos[key];const path_objectInfos_prop=path_objectInfos+'["'+key+'"]';if(typeof obj_objectInfos_prop!=='object'){return new TypeError('Expected "object" but received "'+typeof obj_objectInfos_prop+'" (at "'+path_objectInfos_prop+'")');}}const obj_record=obj.record;const path_record=path+'.record';if(typeof obj_record!=='object'){return new TypeError('Expected "object" but received "'+typeof obj_record+'" (at "'+path_record+'")');}})();return v_error===undefined?null:v_error;}function normalize$m(input,existing,path,lds,store,timestamp){const input_layout=input.layout;const input_layout_id=path.fullPath+'__layout';if(input_layout!==null&&typeof input_layout==='object'){input.layout=ingest$3$1(input_layout,{fullPath:input_layout_id,parent:{data:input,key:path.fullPath,existing:existing}},lds,store,timestamp);}const input_objectInfos=input.objectInfos;const input_objectInfos_id=path.fullPath+'__objectInfos';const input_objectInfos_keys=Object.keys(input_objectInfos);const input_objectInfos_length=input_objectInfos_keys.length;for(let i=0;i<input_objectInfos_length;i++){const key=input_objectInfos_keys[i];const input_objectInfos_prop=input_objectInfos[key];const input_objectInfos_prop_id=input_objectInfos_id+'__'+key;input_objectInfos[key]=ingest$a(input_objectInfos_prop,{fullPath:input_objectInfos_prop_id,parent:{data:input,key:path.fullPath,existing:existing}},lds,store,timestamp);}const input_record=input.record;const input_record_id=path.fullPath+'__record';input.record=ingest$l(input_record,{fullPath:input_record_id,parent:{data:input,key:path.fullPath,existing:existing}},lds,store,timestamp);return input;}function equals$r(existing,incoming){const existing_layout=existing.layout;const incoming_layout=incoming.layout;if(!(existing_layout===incoming_layout||existing_layout!=null&&incoming_layout!=null&&existing_layout.__ref!=null&&incoming_layout.__ref!=null&&existing_layout.__ref===incoming_layout.__ref)){return false;}const existing_objectInfos=existing.objectInfos;const incoming_objectInfos=incoming.objectInfos;const equals_objectInfos_props=equalsObject(existing_objectInfos,incoming_objectInfos,(existing_objectInfos_prop,incoming_objectInfos_prop)=>{if(!(existing_objectInfos_prop.__ref===incoming_objectInfos_prop.__ref)){return false;}});if(equals_objectInfos_props===false){return false;}const existing_record=existing.record;const incoming_record=incoming.record;if(!(existing_record.__ref===incoming_record.__ref)){return false;}return true;}const ingest$m=function RecordDefaultsRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$I(input);if(validateError!==null){throw validateError;}}const key=path.fullPath;let incomingRecord=normalize$m(input,store.records[key],{fullPath:key,parent:path.parent},lds,store,timestamp);const existingRecord=store.records[key];if(existingRecord===undefined||equals$r(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}store.setExpiration(key,timestamp+900000);return createLink$5(key);};function getUiApiRecordDefaultsCreateByObjectApiName(config){const key=keyPrefix$4+'RecordDefaultsRepresentation('+'formFactor:'+config.queryParams.formFactor+','+'optionalFields:'+config.queryParams.optionalFields+','+'recordTypeId:'+config.queryParams.recordTypeId+','+'objectApiName:'+config.urlParams.objectApiName+')';const headers={};return {path:'/services/data/v49.0/ui-api/record-defaults/create/'+config.urlParams.objectApiName+'',method:'get',body:null,urlParams:config.urlParams,queryParams:config.queryParams,key:key,ingest:ingest$m,headers};}const getRecordCreateDefaults_ConfigPropertyNames={displayName:'getRecordCreateDefaults',parameters:{required:['objectApiName'],optional:['formFactor','optionalFields','recordTypeId']}};function coerceConfig$e(config){const coercedConfig={};const objectApiName=getObjectApiName(config.objectApiName);if(objectApiName!==undefined){coercedConfig.objectApiName=objectApiName;}const formFactor=coerceFormFactor(config.formFactor);if(formFactor!==undefined){coercedConfig.formFactor=formFactor;}const optionalFields=getFieldApiNamesArray(config.optionalFields);if(optionalFields!==undefined){coercedConfig.optionalFields=optionalFields;}const recordTypeId=getRecordId18(config.recordTypeId);if(recordTypeId!==undefined){coercedConfig.recordTypeId=recordTypeId;}return coercedConfig;}function typeCheckConfig$f(untrustedConfig){const config={};const untrustedConfig_objectApiName=untrustedConfig.objectApiName;if(typeof untrustedConfig_objectApiName==='string'){config.objectApiName=untrustedConfig_objectApiName;}const untrustedConfig_formFactor=untrustedConfig.formFactor;if(typeof untrustedConfig_formFactor==='string'){config.formFactor=untrustedConfig_formFactor;}const untrustedConfig_optionalFields=untrustedConfig.optionalFields;if(ArrayIsArray$1$5(untrustedConfig_optionalFields)){const untrustedConfig_optionalFields_array=[];for(let i=0,arrayLength=untrustedConfig_optionalFields.length;i<arrayLength;i++){const untrustedConfig_optionalFields_item=untrustedConfig_optionalFields[i];if(typeof untrustedConfig_optionalFields_item==='string'){untrustedConfig_optionalFields_array.push(untrustedConfig_optionalFields_item);}}config.optionalFields=untrustedConfig_optionalFields_array;}const untrustedConfig_recordTypeId=untrustedConfig.recordTypeId;if(typeof untrustedConfig_recordTypeId==='string'){config.recordTypeId=untrustedConfig_recordTypeId;}return config;}function validateAdapterConfig$f(untrustedConfig,configPropertyNames){if(!untrustedIsObject$5(untrustedConfig)){return null;}{validateConfig$4(untrustedConfig,configPropertyNames);}const coercedConfig=coerceConfig$e(untrustedConfig);const config=typeCheckConfig$f(coercedConfig);if(!areRequiredParametersPresent$4(config,configPropertyNames)){return null;}return config;}const layoutSelections$3=select$5();const objectInfoSelections=select$9();function buildSelector(resp){const recordSelections=buildSelectionFromRecord(resp.record);return [{kind:'Link',name:'layout',nullable:true,selections:layoutSelections$3.selections},{kind:'Link',name:'objectInfos',map:true,selections:objectInfoSelections.selections},{kind:'Link',name:'record',selections:recordSelections}];}function buildNetworkSnapshot$a(lds,config){const{formFactor,optionalFields,recordTypeId}=config;const request=getUiApiRecordDefaultsCreateByObjectApiName({urlParams:{objectApiName:config.objectApiName},queryParams:{formFactor,optionalFields,recordTypeId}});const{key}=request;const selectorKey=`${key}__selector`;return lds.dispatchResourceRequest(request).then(response=>{const{body}=response;// TODO W-6399239 - fix API so we don't have to augment the response with request details in order
    // to support refresh. these are never emitted out per (private).
    if(body.layout!==null){body.layout.apiName=config.objectApiName;body.layout.recordTypeId=recordTypeId;}const cacheSelector={recordId:key,node:{kind:'Fragment',selections:buildSelector(body)},variables:{}};lds.storePublish(selectorKey,cacheSelector);lds.storeIngest(key,request,body);lds.storeBroadcast();return lds.storeLookup(cacheSelector);},err=>{lds.storeIngestFetchResponse(key,err);lds.storeBroadcast();return lds.errorSnapshot(err);});}function coerceConfigWithDefaults$5(untrusted){const config=validateAdapterConfig$f(untrusted,getRecordCreateDefaults_ConfigPropertyNames);if(config===null){return null;}let formFactor=config.formFactor;if(formFactor===undefined){if(untrusted.formFactor===undefined){formFactor=FormFactor$1.Large;}else {return null;}}const recordTypeId=config.recordTypeId===undefined?MASTER_RECORD_TYPE_ID:config.recordTypeId;const optionalFields=config.optionalFields===undefined?[]:config.optionalFields;return _objectSpread$2({},config,{formFactor,recordTypeId,optionalFields});}function buildInMemorySnapshot$b(lds,config){const{formFactor,optionalFields,recordTypeId}=config;const request=getUiApiRecordDefaultsCreateByObjectApiName({urlParams:{objectApiName:config.objectApiName},queryParams:{formFactor,optionalFields,recordTypeId}});const{key}=request;const selectorKey=`${key}__selector`;/**
         * getRecordCreateDefaults returns a value that includes a map of ObjectInfos,
         * a layout and a record. The returned record includes fields that are not
         * known to the client. Because we don't know what the return shape will be,
         * we have to store a selector from a previous response and see if we can
         * extract those values back out.
         *
         * cacheSnapshot is the cached selector from a previous request. It is just
         * a stashed selector
         */const cacheSnapshot=lds.storeLookup({recordId:selectorKey,node:{kind:'Fragment',opaque:true},variables:{}});// We've seen this request before
    if(isFulfilledSnapshot$1(cacheSnapshot)){const snapshot=lds.storeLookup(cacheSnapshot.data);// Cache hit
    if(isFulfilledSnapshot$1(snapshot)){return snapshot;}}return null;}const factory$e=lds=>{return refreshable$5(untrusted=>{const config=coerceConfigWithDefaults$5(untrusted);if(config===null){return null;}const snapshot=buildInMemorySnapshot$b(lds,config);if(snapshot!==null){return snapshot;}return buildNetworkSnapshot$a(lds,config);},untrusted=>{const config=coerceConfigWithDefaults$5(untrusted);if(config===null){throw new Error('Refresh should not be called with partial configuration');}return buildNetworkSnapshot$a(lds,config);});};/**
     * Returns the object API name.
     * @param value The value from which to get the object API name.
     * @returns The object API name.
     */function getObjectApiNamesArray(value){const valueArray=isArray$3(value)?value:[value];const array=[];for(let i=0,len=valueArray.length;i<len;i+=1){const item=valueArray[i];const apiName=getObjectApiName(item);if(apiName===undefined){return undefined;}push$1.call(array,apiName);}if(array.length===0){return undefined;}return dedupe(array).sort();}function validate$J(obj,path='PlatformActionRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_actionListContext=obj.actionListContext;const path_actionListContext=path+'.actionListContext';if(typeof obj_actionListContext!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_actionListContext+'" (at "'+path_actionListContext+'")');}const obj_actionTarget=obj.actionTarget;const path_actionTarget=path+'.actionTarget';let obj_actionTarget_union0=null;const obj_actionTarget_union0_error=(()=>{if(typeof obj_actionTarget!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_actionTarget+'" (at "'+path_actionTarget+'")');}})();if(obj_actionTarget_union0_error!=null){obj_actionTarget_union0=obj_actionTarget_union0_error.message;}let obj_actionTarget_union1=null;const obj_actionTarget_union1_error=(()=>{if(obj_actionTarget!==null){return new TypeError('Expected "null" but received "'+typeof obj_actionTarget+'" (at "'+path_actionTarget+'")');}})();if(obj_actionTarget_union1_error!=null){obj_actionTarget_union1=obj_actionTarget_union1_error.message;}if(obj_actionTarget_union0&&obj_actionTarget_union1){let message='Object doesn\'t match union (at "'+path_actionTarget+'")';message+='\n'+obj_actionTarget_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_actionTarget_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_actionTargetType=obj.actionTargetType;const path_actionTargetType=path+'.actionTargetType';let obj_actionTargetType_union0=null;const obj_actionTargetType_union0_error=(()=>{if(typeof obj_actionTargetType!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_actionTargetType+'" (at "'+path_actionTargetType+'")');}})();if(obj_actionTargetType_union0_error!=null){obj_actionTargetType_union0=obj_actionTargetType_union0_error.message;}let obj_actionTargetType_union1=null;const obj_actionTargetType_union1_error=(()=>{if(obj_actionTargetType!==null){return new TypeError('Expected "null" but received "'+typeof obj_actionTargetType+'" (at "'+path_actionTargetType+'")');}})();if(obj_actionTargetType_union1_error!=null){obj_actionTargetType_union1=obj_actionTargetType_union1_error.message;}if(obj_actionTargetType_union0&&obj_actionTargetType_union1){let message='Object doesn\'t match union (at "'+path_actionTargetType+'")';message+='\n'+obj_actionTargetType_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_actionTargetType_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_apiName=obj.apiName;const path_apiName=path+'.apiName';if(typeof obj_apiName!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_apiName+'" (at "'+path_apiName+'")');}const obj_externalId=obj.externalId;const path_externalId=path+'.externalId';if(typeof obj_externalId!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_externalId+'" (at "'+path_externalId+'")');}const obj_iconUrl=obj.iconUrl;const path_iconUrl=path+'.iconUrl';let obj_iconUrl_union0=null;const obj_iconUrl_union0_error=(()=>{if(typeof obj_iconUrl!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_iconUrl+'" (at "'+path_iconUrl+'")');}})();if(obj_iconUrl_union0_error!=null){obj_iconUrl_union0=obj_iconUrl_union0_error.message;}let obj_iconUrl_union1=null;const obj_iconUrl_union1_error=(()=>{if(obj_iconUrl!==null){return new TypeError('Expected "null" but received "'+typeof obj_iconUrl+'" (at "'+path_iconUrl+'")');}})();if(obj_iconUrl_union1_error!=null){obj_iconUrl_union1=obj_iconUrl_union1_error.message;}if(obj_iconUrl_union0&&obj_iconUrl_union1){let message='Object doesn\'t match union (at "'+path_iconUrl+'")';message+='\n'+obj_iconUrl_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_iconUrl_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_id=obj.id;const path_id=path+'.id';if(typeof obj_id!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_id+'" (at "'+path_id+'")');}const obj_isMassAction=obj.isMassAction;const path_isMassAction=path+'.isMassAction';if(typeof obj_isMassAction!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_isMassAction+'" (at "'+path_isMassAction+'")');}const obj_label=obj.label;const path_label=path+'.label';if(typeof obj_label!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_label+'" (at "'+path_label+'")');}const obj_primaryColor=obj.primaryColor;const path_primaryColor=path+'.primaryColor';let obj_primaryColor_union0=null;const obj_primaryColor_union0_error=(()=>{if(typeof obj_primaryColor!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_primaryColor+'" (at "'+path_primaryColor+'")');}})();if(obj_primaryColor_union0_error!=null){obj_primaryColor_union0=obj_primaryColor_union0_error.message;}let obj_primaryColor_union1=null;const obj_primaryColor_union1_error=(()=>{if(obj_primaryColor!==null){return new TypeError('Expected "null" but received "'+typeof obj_primaryColor+'" (at "'+path_primaryColor+'")');}})();if(obj_primaryColor_union1_error!=null){obj_primaryColor_union1=obj_primaryColor_union1_error.message;}if(obj_primaryColor_union0&&obj_primaryColor_union1){let message='Object doesn\'t match union (at "'+path_primaryColor+'")';message+='\n'+obj_primaryColor_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_primaryColor_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_relatedListRecordId=obj.relatedListRecordId;const path_relatedListRecordId=path+'.relatedListRecordId';let obj_relatedListRecordId_union0=null;const obj_relatedListRecordId_union0_error=(()=>{if(typeof obj_relatedListRecordId!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_relatedListRecordId+'" (at "'+path_relatedListRecordId+'")');}})();if(obj_relatedListRecordId_union0_error!=null){obj_relatedListRecordId_union0=obj_relatedListRecordId_union0_error.message;}let obj_relatedListRecordId_union1=null;const obj_relatedListRecordId_union1_error=(()=>{if(obj_relatedListRecordId!==null){return new TypeError('Expected "null" but received "'+typeof obj_relatedListRecordId+'" (at "'+path_relatedListRecordId+'")');}})();if(obj_relatedListRecordId_union1_error!=null){obj_relatedListRecordId_union1=obj_relatedListRecordId_union1_error.message;}if(obj_relatedListRecordId_union0&&obj_relatedListRecordId_union1){let message='Object doesn\'t match union (at "'+path_relatedListRecordId+'")';message+='\n'+obj_relatedListRecordId_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_relatedListRecordId_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_relatedSourceObject=obj.relatedSourceObject;const path_relatedSourceObject=path+'.relatedSourceObject';let obj_relatedSourceObject_union0=null;const obj_relatedSourceObject_union0_error=(()=>{if(typeof obj_relatedSourceObject!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_relatedSourceObject+'" (at "'+path_relatedSourceObject+'")');}})();if(obj_relatedSourceObject_union0_error!=null){obj_relatedSourceObject_union0=obj_relatedSourceObject_union0_error.message;}let obj_relatedSourceObject_union1=null;const obj_relatedSourceObject_union1_error=(()=>{if(obj_relatedSourceObject!==null){return new TypeError('Expected "null" but received "'+typeof obj_relatedSourceObject+'" (at "'+path_relatedSourceObject+'")');}})();if(obj_relatedSourceObject_union1_error!=null){obj_relatedSourceObject_union1=obj_relatedSourceObject_union1_error.message;}if(obj_relatedSourceObject_union0&&obj_relatedSourceObject_union1){let message='Object doesn\'t match union (at "'+path_relatedSourceObject+'")';message+='\n'+obj_relatedSourceObject_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_relatedSourceObject_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_section=obj.section;const path_section=path+'.section';let obj_section_union0=null;const obj_section_union0_error=(()=>{if(typeof obj_section!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_section+'" (at "'+path_section+'")');}})();if(obj_section_union0_error!=null){obj_section_union0=obj_section_union0_error.message;}let obj_section_union1=null;const obj_section_union1_error=(()=>{if(obj_section!==null){return new TypeError('Expected "null" but received "'+typeof obj_section+'" (at "'+path_section+'")');}})();if(obj_section_union1_error!=null){obj_section_union1=obj_section_union1_error.message;}if(obj_section_union0&&obj_section_union1){let message='Object doesn\'t match union (at "'+path_section+'")';message+='\n'+obj_section_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_section_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_sourceObject=obj.sourceObject;const path_sourceObject=path+'.sourceObject';if(typeof obj_sourceObject!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_sourceObject+'" (at "'+path_sourceObject+'")');}const obj_subtype=obj.subtype;const path_subtype=path+'.subtype';let obj_subtype_union0=null;const obj_subtype_union0_error=(()=>{if(typeof obj_subtype!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_subtype+'" (at "'+path_subtype+'")');}})();if(obj_subtype_union0_error!=null){obj_subtype_union0=obj_subtype_union0_error.message;}let obj_subtype_union1=null;const obj_subtype_union1_error=(()=>{if(obj_subtype!==null){return new TypeError('Expected "null" but received "'+typeof obj_subtype+'" (at "'+path_subtype+'")');}})();if(obj_subtype_union1_error!=null){obj_subtype_union1=obj_subtype_union1_error.message;}if(obj_subtype_union0&&obj_subtype_union1){let message='Object doesn\'t match union (at "'+path_subtype+'")';message+='\n'+obj_subtype_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_subtype_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_targetObject=obj.targetObject;const path_targetObject=path+'.targetObject';let obj_targetObject_union0=null;const obj_targetObject_union0_error=(()=>{if(typeof obj_targetObject!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_targetObject+'" (at "'+path_targetObject+'")');}})();if(obj_targetObject_union0_error!=null){obj_targetObject_union0=obj_targetObject_union0_error.message;}let obj_targetObject_union1=null;const obj_targetObject_union1_error=(()=>{if(obj_targetObject!==null){return new TypeError('Expected "null" but received "'+typeof obj_targetObject+'" (at "'+path_targetObject+'")');}})();if(obj_targetObject_union1_error!=null){obj_targetObject_union1=obj_targetObject_union1_error.message;}if(obj_targetObject_union0&&obj_targetObject_union1){let message='Object doesn\'t match union (at "'+path_targetObject+'")';message+='\n'+obj_targetObject_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_targetObject_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_targetUrl=obj.targetUrl;const path_targetUrl=path+'.targetUrl';let obj_targetUrl_union0=null;const obj_targetUrl_union0_error=(()=>{if(typeof obj_targetUrl!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_targetUrl+'" (at "'+path_targetUrl+'")');}})();if(obj_targetUrl_union0_error!=null){obj_targetUrl_union0=obj_targetUrl_union0_error.message;}let obj_targetUrl_union1=null;const obj_targetUrl_union1_error=(()=>{if(obj_targetUrl!==null){return new TypeError('Expected "null" but received "'+typeof obj_targetUrl+'" (at "'+path_targetUrl+'")');}})();if(obj_targetUrl_union1_error!=null){obj_targetUrl_union1=obj_targetUrl_union1_error.message;}if(obj_targetUrl_union0&&obj_targetUrl_union1){let message='Object doesn\'t match union (at "'+path_targetUrl+'")';message+='\n'+obj_targetUrl_union0.split('\n').map(line=>'\t'+line).join('\n');message+='\n'+obj_targetUrl_union1.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}const obj_type=obj.type;const path_type=path+'.type';if(typeof obj_type!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_type+'" (at "'+path_type+'")');}})();return v_error===undefined?null:v_error;}const select$q=function PlatformActionRepresentationSelect(){return {kind:'Fragment',selections:[{name:'actionListContext',kind:'Scalar'},{name:'actionTarget',kind:'Scalar'},{name:'actionTargetType',kind:'Scalar'},{name:'apiName',kind:'Scalar'},{name:'externalId',kind:'Scalar'},{name:'iconUrl',kind:'Scalar'},{name:'id',kind:'Scalar'},{name:'isMassAction',kind:'Scalar'},{name:'label',kind:'Scalar'},{name:'primaryColor',kind:'Scalar'},{name:'relatedListRecordId',kind:'Scalar'},{name:'relatedSourceObject',kind:'Scalar'},{name:'section',kind:'Scalar'},{name:'sourceObject',kind:'Scalar'},{name:'subtype',kind:'Scalar'},{name:'targetObject',kind:'Scalar'},{name:'targetUrl',kind:'Scalar'},{name:'type',kind:'Scalar'}]};};function equals$s(existing,incoming){const existing_actionListContext=existing.actionListContext;const incoming_actionListContext=incoming.actionListContext;if(!(existing_actionListContext===incoming_actionListContext)){return false;}const existing_apiName=existing.apiName;const incoming_apiName=incoming.apiName;if(!(existing_apiName===incoming_apiName)){return false;}const existing_externalId=existing.externalId;const incoming_externalId=incoming.externalId;if(!(existing_externalId===incoming_externalId)){return false;}const existing_id=existing.id;const incoming_id=incoming.id;if(!(existing_id===incoming_id)){return false;}const existing_isMassAction=existing.isMassAction;const incoming_isMassAction=incoming.isMassAction;if(!(existing_isMassAction===incoming_isMassAction)){return false;}const existing_label=existing.label;const incoming_label=incoming.label;if(!(existing_label===incoming_label)){return false;}const existing_sourceObject=existing.sourceObject;const incoming_sourceObject=incoming.sourceObject;if(!(existing_sourceObject===incoming_sourceObject)){return false;}const existing_type=existing.type;const incoming_type=incoming.type;if(!(existing_type===incoming_type)){return false;}const existing_actionTarget=existing.actionTarget;const incoming_actionTarget=incoming.actionTarget;if(!(existing_actionTarget===incoming_actionTarget)){return false;}const existing_actionTargetType=existing.actionTargetType;const incoming_actionTargetType=incoming.actionTargetType;if(!(existing_actionTargetType===incoming_actionTargetType)){return false;}const existing_iconUrl=existing.iconUrl;const incoming_iconUrl=incoming.iconUrl;if(!(existing_iconUrl===incoming_iconUrl)){return false;}const existing_primaryColor=existing.primaryColor;const incoming_primaryColor=incoming.primaryColor;if(!(existing_primaryColor===incoming_primaryColor)){return false;}const existing_relatedListRecordId=existing.relatedListRecordId;const incoming_relatedListRecordId=incoming.relatedListRecordId;if(!(existing_relatedListRecordId===incoming_relatedListRecordId)){return false;}const existing_relatedSourceObject=existing.relatedSourceObject;const incoming_relatedSourceObject=incoming.relatedSourceObject;if(!(existing_relatedSourceObject===incoming_relatedSourceObject)){return false;}const existing_section=existing.section;const incoming_section=incoming.section;if(!(existing_section===incoming_section)){return false;}const existing_subtype=existing.subtype;const incoming_subtype=incoming.subtype;if(!(existing_subtype===incoming_subtype)){return false;}const existing_targetObject=existing.targetObject;const incoming_targetObject=incoming.targetObject;if(!(existing_targetObject===incoming_targetObject)){return false;}const existing_targetUrl=existing.targetUrl;const incoming_targetUrl=incoming.targetUrl;if(!(existing_targetUrl===incoming_targetUrl)){return false;}return true;}function validate$K(obj,path='EntityActionRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_actions=obj.actions;const path_actions=path+'.actions';if(!ArrayIsArray$6(obj_actions)){return new TypeError('Expected "array" but received "'+typeof obj_actions+'" (at "'+path_actions+'")');}for(let i=0;i<obj_actions.length;i++){const obj_actions_item=obj_actions[i];const path_actions_item=path_actions+'['+i+']';const referencePlatformActionRepresentationValidationError=validate$J(obj_actions_item,path_actions_item);if(referencePlatformActionRepresentationValidationError!==null){let message='Object doesn\'t match PlatformActionRepresentation (at "'+path_actions_item+'")\n';message+=referencePlatformActionRepresentationValidationError.message.split('\n').map(line=>'\t'+line).join('\n');return new TypeError(message);}}const obj_links=obj.links;const path_links=path+'.links';if(!ArrayIsArray$6(obj_links)){return new TypeError('Expected "array" but received "'+typeof obj_links+'" (at "'+path_links+'")');}for(let i=0;i<obj_links.length;i++){const obj_links_item=obj_links[i];const path_links_item=path_links+'['+i+']';if(typeof obj_links_item!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_links_item+'" (at "'+path_links_item+'")');}}const obj_url=obj.url;const path_url=path+'.url';if(typeof obj_url!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_url+'" (at "'+path_url+'")');}})();return v_error===undefined?null:v_error;}function keyBuilder$f(config){return keyPrefix$4+'EntityActionRepresentation:'+config.url;}function normalize$n(input,existing,path,lds,store,timestamp){return input;}const select$r=function EntityActionRepresentationSelect(){const{selections:PlatformActionRepresentation__selections,opaque:PlatformActionRepresentation__opaque}=select$q();return {kind:'Fragment',selections:[{name:'actions',kind:'Object',plural:true,selections:PlatformActionRepresentation__selections}]};};function equals$t(existing,incoming){const existing_url=existing.url;const incoming_url=incoming.url;if(!(existing_url===incoming_url)){return false;}const existing_actions=existing.actions;const incoming_actions=incoming.actions;const equals_actions_items=equalsArray(existing_actions,incoming_actions,(existing_actions_item,incoming_actions_item)=>{if(!equals$s(existing_actions_item,incoming_actions_item)){return false;}});if(equals_actions_items===false){return false;}const existing_links=existing.links;const incoming_links=incoming.links;const equals_links_items=equalsArray(existing_links,incoming_links,(existing_links_item,incoming_links_item)=>{if(!(existing_links_item===incoming_links_item)){return false;}});if(equals_links_items===false){return false;}return true;}const ingest$n=function EntityActionRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$K(input);if(validateError!==null){throw validateError;}}const key=keyBuilder$f({url:input.url});let incomingRecord=normalize$n(input,store.records[key],{fullPath:key,parent:path.parent});const existingRecord=store.records[key];if(existingRecord===undefined||equals$t(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}return createLink$5(key);};const TTL$3=300000;function validate$L(obj,path='ActionRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_actions=obj.actions;const path_actions=path+'.actions';if(typeof obj_actions!=='object'||ArrayIsArray$6(obj_actions)||obj_actions===null){return new TypeError('Expected "object" but received "'+typeof obj_actions+'" (at "'+path_actions+'")');}const obj_actions_keys=ObjectKeys$5(obj_actions);for(let i=0;i<obj_actions_keys.length;i++){const key=obj_actions_keys[i];const obj_actions_prop=obj_actions[key];const path_actions_prop=path_actions+'["'+key+'"]';if(typeof obj_actions_prop!=='object'){return new TypeError('Expected "object" but received "'+typeof obj_actions_prop+'" (at "'+path_actions_prop+'")');}}const obj_eTag=obj.eTag;const path_eTag=path+'.eTag';if(typeof obj_eTag!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_eTag+'" (at "'+path_eTag+'")');}const obj_url=obj.url;const path_url=path+'.url';if(typeof obj_url!=='string'){return new TypeError('Expected "string" but received "'+typeof obj_url+'" (at "'+path_url+'")');}})();return v_error===undefined?null:v_error;}function normalize$o(input,existing,path,lds,store,timestamp){const input_actions=input.actions;const input_actions_id=path.fullPath+'__actions';const input_actions_keys=Object.keys(input_actions);const input_actions_length=input_actions_keys.length;for(let i=0;i<input_actions_length;i++){const key=input_actions_keys[i];const input_actions_prop=input_actions[key];const input_actions_prop_id=input_actions_id+'__'+key;input_actions[key]=ingest$n(input_actions_prop,{fullPath:input_actions_prop_id,parent:{data:input,key:path.fullPath,existing:existing}},lds,store);}return input;}const select$s=function ActionRepresentationSelect(){const{selections:EntityActionRepresentation__selections,opaque:EntityActionRepresentation__opaque}=select$r();return {kind:'Fragment',selections:[{name:'actions',kind:'Link',map:true,selections:EntityActionRepresentation__selections}]};};function equals$u(existing,incoming){const existing_eTag=existing.eTag;const incoming_eTag=incoming.eTag;if(!(existing_eTag===incoming_eTag)){return false;}const existing_url=existing.url;const incoming_url=incoming.url;if(!(existing_url===incoming_url)){return false;}const existing_actions=existing.actions;const incoming_actions=incoming.actions;const equals_actions_props=equalsObject(existing_actions,incoming_actions,(existing_actions_prop,incoming_actions_prop)=>{if(!(existing_actions_prop.__ref===incoming_actions_prop.__ref)){return false;}});if(equals_actions_props===false){return false;}return true;}const ingest$o=function ActionRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$L(input);if(validateError!==null){throw validateError;}}const key=path.fullPath;let incomingRecord=normalize$o(input,store.records[key],{fullPath:key,parent:path.parent},lds,store);const existingRecord=store.records[key];if(existingRecord===undefined||equals$u(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}store.setExpiration(key,timestamp+300000);return createLink$5(key);};function getUiApiActionsLookupByObjectApiNames(config){const key=keyPrefix$4+'ActionRepresentation('+'actionTypes:'+config.queryParams.actionTypes+','+'formFactor:'+config.queryParams.formFactor+','+'sections:'+config.queryParams.sections+','+'objectApiNames:'+config.urlParams.objectApiNames+')';const headers={};return {path:'/services/data/v49.0/ui-api/actions/lookup/'+config.urlParams.objectApiNames+'',method:'get',body:null,urlParams:config.urlParams,queryParams:config.queryParams,key:key,ingest:ingest$o,headers};}const getLookupActions_ConfigPropertyNames={displayName:'getLookupActions',parameters:{required:['objectApiNames'],optional:['actionTypes','formFactor','sections']}};function coerceConfig$f(config){const coercedConfig={};const objectApiNames=getObjectApiNamesArray(config.objectApiNames);if(objectApiNames!==undefined){coercedConfig.objectApiNames=objectApiNames;}const actionTypes=toSortedStringArray(config.actionTypes);if(actionTypes!==undefined){coercedConfig.actionTypes=actionTypes;}const formFactor=coerceFormFactor(config.formFactor);if(formFactor!==undefined){coercedConfig.formFactor=formFactor;}const sections=toSortedStringArray(config.sections);if(sections!==undefined){coercedConfig.sections=sections;}return coercedConfig;}function typeCheckConfig$h(untrustedConfig){const config={};const untrustedConfig_objectApiNames=untrustedConfig.objectApiNames;if(ArrayIsArray$1$5(untrustedConfig_objectApiNames)){const untrustedConfig_objectApiNames_array=[];for(let i=0,arrayLength=untrustedConfig_objectApiNames.length;i<arrayLength;i++){const untrustedConfig_objectApiNames_item=untrustedConfig_objectApiNames[i];if(typeof untrustedConfig_objectApiNames_item==='string'){untrustedConfig_objectApiNames_array.push(untrustedConfig_objectApiNames_item);}}config.objectApiNames=untrustedConfig_objectApiNames_array;}const untrustedConfig_actionTypes=untrustedConfig.actionTypes;if(ArrayIsArray$1$5(untrustedConfig_actionTypes)){const untrustedConfig_actionTypes_array=[];for(let i=0,arrayLength=untrustedConfig_actionTypes.length;i<arrayLength;i++){const untrustedConfig_actionTypes_item=untrustedConfig_actionTypes[i];if(typeof untrustedConfig_actionTypes_item==='string'){untrustedConfig_actionTypes_array.push(untrustedConfig_actionTypes_item);}}config.actionTypes=untrustedConfig_actionTypes_array;}const untrustedConfig_formFactor=untrustedConfig.formFactor;if(typeof untrustedConfig_formFactor==='string'){config.formFactor=untrustedConfig_formFactor;}const untrustedConfig_sections=untrustedConfig.sections;if(ArrayIsArray$1$5(untrustedConfig_sections)){const untrustedConfig_sections_array=[];for(let i=0,arrayLength=untrustedConfig_sections.length;i<arrayLength;i++){const untrustedConfig_sections_item=untrustedConfig_sections[i];if(typeof untrustedConfig_sections_item==='string'){untrustedConfig_sections_array.push(untrustedConfig_sections_item);}}config.sections=untrustedConfig_sections_array;}return config;}function validateAdapterConfig$h(untrustedConfig,configPropertyNames){if(!untrustedIsObject$5(untrustedConfig)){return null;}{validateConfig$4(untrustedConfig,configPropertyNames);}const coercedConfig=coerceConfig$f(untrustedConfig);const config=typeCheckConfig$h(coercedConfig);if(!areRequiredParametersPresent$4(config,configPropertyNames)){return null;}return config;}function buildInMemorySnapshot$c(lds,config){const request=getUiApiActionsLookupByObjectApiNames({urlParams:{objectApiNames:config.objectApiNames},queryParams:{actionTypes:config.actionTypes,formFactor:config.formFactor,sections:config.sections}});const selector={recordId:request.key,node:select$s(),variables:{}};return lds.storeLookup(selector);}function buildNetworkSnapshot$b(lds,config,override){const request=getUiApiActionsLookupByObjectApiNames({urlParams:{objectApiNames:config.objectApiNames},queryParams:{actionTypes:config.actionTypes,formFactor:config.formFactor,sections:config.sections}});return lds.dispatchResourceRequest(request,override).then(response=>{const{body}=response;lds.storeIngest(request.key,request,body);lds.storeBroadcast();return buildInMemorySnapshot$c(lds,config);},error=>{lds.storeIngestFetchResponse(request.key,error,TTL$3);lds.storeBroadcast();return lds.errorSnapshot(error);});}const getLookupActionsAdapterFactory=lds=>{return refreshable$5(// Create snapshot either via a cache hit or via the network
    function getLookupActions(untrustedConfig){const config=validateAdapterConfig$h(untrustedConfig,getLookupActions_ConfigPropertyNames);// Invalid or incomplete config
    if(config===null){return null;}const cacheSnapshot=buildInMemorySnapshot$c(lds,config);// Cache Hit
    if(cacheSnapshot.state===SNAPSHOT_STATE_FULFILLED$4){return cacheSnapshot;}return buildNetworkSnapshot$b(lds,config);},// Refresh snapshot
    // TODO W-6900511 - This currently passes the untrusted config
    // because we don't have a way to pass the validated config back to LDS
    untrustedConfig=>{const config=validateAdapterConfig$h(untrustedConfig,getLookupActions_ConfigPropertyNames);// This should never happen
    if(config===null){throw new Error('Invalid config passed to "getLookupActions" refresh function');}return buildNetworkSnapshot$b(lds,config,{headers:{'Cache-Control':'no-cache'}});});};function getUiApiActionsRecordByRecordIds(config){const key=keyPrefix$4+'ActionRepresentation('+'actionTypes:'+config.queryParams.actionTypes+','+'apiNames:'+config.queryParams.apiNames+','+'formFactor:'+config.queryParams.formFactor+','+'retrievalMode:'+config.queryParams.retrievalMode+','+'sections:'+config.queryParams.sections+','+'recordIds:'+config.urlParams.recordIds+')';const headers={};return {path:'/services/data/v49.0/ui-api/actions/record/'+config.urlParams.recordIds+'',method:'get',body:null,urlParams:config.urlParams,queryParams:config.queryParams,key:key,ingest:ingest$o,headers};}const oneOfConfigPropertiesIdentifier$1=['sections','apiNames'];const getRecordActions_ConfigPropertyNames={displayName:'getRecordActions',parameters:{required:['recordIds'],optional:['actionTypes','apiNames','formFactor','retrievalMode','sections']}};function coerceConfig$g(config){const coercedConfig={};const recordIds=getRecordId18Array(config.recordIds);if(recordIds!==undefined){coercedConfig.recordIds=recordIds;}const actionTypes=config.actionTypes;if(actionTypes!==undefined){coercedConfig.actionTypes=actionTypes;}const apiNames=toSortedStringArray(config.apiNames);if(apiNames!==undefined){coercedConfig.apiNames=apiNames;}const formFactor=coerceFormFactor(config.formFactor);if(formFactor!==undefined){coercedConfig.formFactor=formFactor;}const retrievalMode=config.retrievalMode;if(retrievalMode!==undefined){coercedConfig.retrievalMode=retrievalMode;}const sections=toSortedStringArray(config.sections);if(sections!==undefined){coercedConfig.sections=sections;}return coercedConfig;}function typeCheckConfig$i(untrustedConfig){const config={};const untrustedConfig_recordIds=untrustedConfig.recordIds;if(ArrayIsArray$1$5(untrustedConfig_recordIds)){const untrustedConfig_recordIds_array=[];for(let i=0,arrayLength=untrustedConfig_recordIds.length;i<arrayLength;i++){const untrustedConfig_recordIds_item=untrustedConfig_recordIds[i];if(typeof untrustedConfig_recordIds_item==='string'){untrustedConfig_recordIds_array.push(untrustedConfig_recordIds_item);}}config.recordIds=untrustedConfig_recordIds_array;}const untrustedConfig_actionTypes=untrustedConfig.actionTypes;if(ArrayIsArray$1$5(untrustedConfig_actionTypes)){const untrustedConfig_actionTypes_array=[];for(let i=0,arrayLength=untrustedConfig_actionTypes.length;i<arrayLength;i++){const untrustedConfig_actionTypes_item=untrustedConfig_actionTypes[i];if(typeof untrustedConfig_actionTypes_item==='string'){untrustedConfig_actionTypes_array.push(untrustedConfig_actionTypes_item);}}config.actionTypes=untrustedConfig_actionTypes_array;}const untrustedConfig_apiNames=untrustedConfig.apiNames;if(ArrayIsArray$1$5(untrustedConfig_apiNames)){const untrustedConfig_apiNames_array=[];for(let i=0,arrayLength=untrustedConfig_apiNames.length;i<arrayLength;i++){const untrustedConfig_apiNames_item=untrustedConfig_apiNames[i];if(typeof untrustedConfig_apiNames_item==='string'){untrustedConfig_apiNames_array.push(untrustedConfig_apiNames_item);}}config.apiNames=untrustedConfig_apiNames_array;}const untrustedConfig_formFactor=untrustedConfig.formFactor;if(typeof untrustedConfig_formFactor==='string'){config.formFactor=untrustedConfig_formFactor;}const untrustedConfig_retrievalMode=untrustedConfig.retrievalMode;if(typeof untrustedConfig_retrievalMode==='string'){config.retrievalMode=untrustedConfig_retrievalMode;}const untrustedConfig_sections=untrustedConfig.sections;if(ArrayIsArray$1$5(untrustedConfig_sections)){const untrustedConfig_sections_array=[];for(let i=0,arrayLength=untrustedConfig_sections.length;i<arrayLength;i++){const untrustedConfig_sections_item=untrustedConfig_sections[i];if(typeof untrustedConfig_sections_item==='string'){untrustedConfig_sections_array.push(untrustedConfig_sections_item);}}config.sections=untrustedConfig_sections_array;}return config;}function validateAdapterConfig$i(untrustedConfig,configPropertyNames){if(!untrustedIsObject$5(untrustedConfig)){return null;}{validateConfig$4(untrustedConfig,configPropertyNames,oneOfConfigPropertiesIdentifier$1);}const coercedConfig=coerceConfig$g(untrustedConfig);const config=typeCheckConfig$i(coercedConfig);if(!areRequiredParametersPresent$4(config,configPropertyNames)){return null;}if(config.sections===undefined&&config.apiNames===undefined){return null;}return config;}function buildInMemorySnapshot$d(lds,config){const request=getUiApiActionsRecordByRecordIds({urlParams:{recordIds:config.recordIds},queryParams:{actionTypes:config.actionTypes,apiNames:config.apiNames,formFactor:config.formFactor,retrievalMode:config.retrievalMode,sections:config.sections}});const selector={recordId:request.key,node:select$s(),variables:{}};return lds.storeLookup(selector);}function buildNetworkSnapshot$c(lds,config,override){const request=getUiApiActionsRecordByRecordIds({urlParams:{recordIds:config.recordIds},queryParams:{actionTypes:config.actionTypes,apiNames:config.apiNames,formFactor:config.formFactor,retrievalMode:config.retrievalMode,sections:config.sections}});return lds.dispatchResourceRequest(request,override).then(response=>{const{body}=response;lds.storeIngest(request.key,request,body);lds.storeBroadcast();return buildInMemorySnapshot$d(lds,config);},error=>{lds.storeIngestFetchResponse(request.key,error,TTL$3);lds.storeBroadcast();return lds.errorSnapshot(error);});}const getRecordActionsAdapterFactory=lds=>{return refreshable$5(// Create snapshot either via a cache hit or via the network
    function getRecordActions(untrustedConfig){const config=validateAdapterConfig$i(untrustedConfig,getRecordActions_ConfigPropertyNames);// Invalid or incomplete config
    if(config===null){return null;}const cacheSnapshot=buildInMemorySnapshot$d(lds,config);// Cache Hit
    if(cacheSnapshot.state===SNAPSHOT_STATE_FULFILLED$4){return cacheSnapshot;}return buildNetworkSnapshot$c(lds,config);},// Refresh snapshot
    // TODO W-6900511 - This currently passes the untrusted config
    // because we don't have a way to pass the validated config back to LDS
    untrustedConfig=>{const config=validateAdapterConfig$i(untrustedConfig,getRecordActions_ConfigPropertyNames);// This should never happen
    if(config===null){throw new Error('Invalid config passed to "getRecordActions" refresh function');}return buildNetworkSnapshot$c(lds,config,{headers:{'Cache-Control':'no-cache'}});});};function getUiApiActionsRecordRecordEditByRecordIds(config){const key=keyPrefix$4+'ActionRepresentation('+'actionTypes:'+config.queryParams.actionTypes+','+'formFactor:'+config.queryParams.formFactor+','+'sections:'+config.queryParams.sections+','+'recordIds:'+config.urlParams.recordIds+')';const headers={};return {path:'/services/data/v49.0/ui-api/actions/record/'+config.urlParams.recordIds+'/record-edit',method:'get',body:null,urlParams:config.urlParams,queryParams:config.queryParams,key:key,ingest:ingest$o,headers};}const getRecordEditActions_ConfigPropertyNames={displayName:'getRecordEditActions',parameters:{required:['recordIds'],optional:['actionTypes','formFactor','sections']}};function typeCheckConfig$j(untrustedConfig){const config={};const untrustedConfig_recordIds=untrustedConfig.recordIds;if(ArrayIsArray$1$5(untrustedConfig_recordIds)){const untrustedConfig_recordIds_array=[];for(let i=0,arrayLength=untrustedConfig_recordIds.length;i<arrayLength;i++){const untrustedConfig_recordIds_item=untrustedConfig_recordIds[i];if(typeof untrustedConfig_recordIds_item==='string'){untrustedConfig_recordIds_array.push(untrustedConfig_recordIds_item);}}config.recordIds=untrustedConfig_recordIds_array;}const untrustedConfig_actionTypes=untrustedConfig.actionTypes;if(ArrayIsArray$1$5(untrustedConfig_actionTypes)){const untrustedConfig_actionTypes_array=[];for(let i=0,arrayLength=untrustedConfig_actionTypes.length;i<arrayLength;i++){const untrustedConfig_actionTypes_item=untrustedConfig_actionTypes[i];if(typeof untrustedConfig_actionTypes_item==='string'){untrustedConfig_actionTypes_array.push(untrustedConfig_actionTypes_item);}}config.actionTypes=untrustedConfig_actionTypes_array;}const untrustedConfig_formFactor=untrustedConfig.formFactor;if(typeof untrustedConfig_formFactor==='string'){config.formFactor=untrustedConfig_formFactor;}const untrustedConfig_sections=untrustedConfig.sections;if(ArrayIsArray$1$5(untrustedConfig_sections)){const untrustedConfig_sections_array=[];for(let i=0,arrayLength=untrustedConfig_sections.length;i<arrayLength;i++){const untrustedConfig_sections_item=untrustedConfig_sections[i];if(typeof untrustedConfig_sections_item==='string'){untrustedConfig_sections_array.push(untrustedConfig_sections_item);}}config.sections=untrustedConfig_sections_array;}return config;}function validateAdapterConfig$j(untrustedConfig,configPropertyNames){if(!untrustedIsObject$5(untrustedConfig)){return null;}{validateConfig$4(untrustedConfig,configPropertyNames);}const config=typeCheckConfig$j(untrustedConfig);if(!areRequiredParametersPresent$4(config,configPropertyNames)){return null;}return config;}function buildInMemorySnapshot$e(lds,config){const request=getUiApiActionsRecordRecordEditByRecordIds({urlParams:{recordIds:config.recordIds},queryParams:{actionTypes:config.actionTypes,formFactor:config.formFactor,sections:config.sections}});const selector={recordId:request.key,node:select$s(),variables:{}};return lds.storeLookup(selector);}function buildNetworkSnapshot$d(lds,config,override){const request=getUiApiActionsRecordRecordEditByRecordIds({urlParams:{recordIds:config.recordIds},queryParams:{actionTypes:config.actionTypes,formFactor:config.formFactor,sections:config.sections}});return lds.dispatchResourceRequest(request,override).then(response=>{const{body}=response;lds.storeIngest(request.key,request,body);lds.storeBroadcast();return buildInMemorySnapshot$e(lds,config);},error=>{lds.storeIngestFetchResponse(request.key,error,TTL$3);lds.storeBroadcast();return lds.errorSnapshot(error);});}const getRecordEditActionsAdapterFactory=lds=>{return refreshable$5(// Create snapshot either via a cache hit or via the network
    function getRecordEditActions(untrustedConfig){const config=validateAdapterConfig$j(untrustedConfig,getRecordEditActions_ConfigPropertyNames);// Invalid or incomplete config
    if(config===null){return null;}const cacheSnapshot=buildInMemorySnapshot$e(lds,config);// Cache Hit
    if(cacheSnapshot.state===SNAPSHOT_STATE_FULFILLED$4){return cacheSnapshot;}return buildNetworkSnapshot$d(lds,config);},// Refresh snapshot
    // TODO W-6900511 - This currently passes the untrusted config
    // because we don't have a way to pass the validated config back to LDS
    untrustedConfig=>{const config=validateAdapterConfig$j(untrustedConfig,getRecordEditActions_ConfigPropertyNames);// This should never happen
    if(config===null){throw new Error('Invalid config passed to "getRecordEditActions" refresh function');}return buildNetworkSnapshot$d(lds,config,{headers:{'Cache-Control':'no-cache'}});});};function validate$M(obj,path='AbstractSimplifiedBatchResultRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_statusCode=obj.statusCode;const path_statusCode=path+'.statusCode';if(typeof obj_statusCode!=='number'){return new TypeError('Expected "number" but received "'+typeof obj_statusCode+'" (at "'+path_statusCode+'")');}})();return v_error===undefined?null:v_error;}const select$t=function AbstractSimplifiedBatchResultRepresentationSelect(){return {kind:'Fragment',selections:[{name:'statusCode',kind:'Scalar'}]};};function equals$v(existing,incoming){const existing_statusCode=existing.statusCode;const incoming_statusCode=incoming.statusCode;if(!(existing_statusCode===incoming_statusCode)){return false;}return true;}function validate$N(obj,path='SimplifiedBatchResultRepresentation'){const validateAbstractSimplifiedBatchResultRepresentation_validateError=validate$M(obj,path);if(validateAbstractSimplifiedBatchResultRepresentation_validateError!==null){return validateAbstractSimplifiedBatchResultRepresentation_validateError;}const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_result=obj.result;const path_result=path+'.result';if(typeof obj_result!=='object'){return new TypeError('Expected "object" but received "'+typeof obj_result+'" (at "'+path_result+'")');}})();return v_error===undefined?null:v_error;}function normalize$p(input,existing,path,lds,store,timestamp){const input_result=input.result;const input_result_id=path.fullPath+'__result';input.result=ingest$a(input_result,{fullPath:input_result_id,parent:{data:input,key:path.fullPath,existing:existing}},lds,store,timestamp);return input;}const select$u=function SimplifiedBatchResultRepresentationSelect(){const{selections:AbstractSimplifiedBatchResultRepresentationSelections}=select$t();const{selections:ObjectInfoRepresentation__selections,opaque:ObjectInfoRepresentation__opaque}=select$9();return {kind:'Fragment',selections:[...AbstractSimplifiedBatchResultRepresentationSelections,{name:'result',kind:'Link',selections:ObjectInfoRepresentation__selections}]};};function equals$w(existing,incoming){if(equals$v(existing,incoming)===false){return false;}const existing_result=existing.result;const incoming_result=incoming.result;if(!(existing_result.__ref===incoming_result.__ref)){return false;}return true;}const ingest$p=function SimplifiedBatchResultRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$N(input);if(validateError!==null){throw validateError;}}const key=path.fullPath;let incomingRecord=normalize$p(input,store.records[key],{fullPath:key,parent:path.parent},lds,store,timestamp);const existingRecord=store.records[key];if(existingRecord===undefined||equals$w(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}return createLink$5(key);};function validate$O(obj,path='SimplifiedBatchRepresentation'){const v_error=(()=>{if(typeof obj!=='object'||ArrayIsArray$6(obj)||obj===null){return new TypeError('Expected "object" but received "'+typeof obj+'" (at "'+path+'")');}const obj_results=obj.results;const path_results=path+'.results';if(!ArrayIsArray$6(obj_results)){return new TypeError('Expected "array" but received "'+typeof obj_results+'" (at "'+path_results+'")');}for(let i=0;i<obj_results.length;i++){const obj_results_item=obj_results[i];const path_results_item=path_results+'['+i+']';if(typeof obj_results_item!=='object'){return new TypeError('Expected "object" but received "'+typeof obj_results_item+'" (at "'+path_results_item+'")');}}})();return v_error===undefined?null:v_error;}function normalize$q(input,existing,path,lds,store,timestamp){const input_results=input.results;const input_results_id=path.fullPath+'__results';for(let i=0;i<input_results.length;i++){const input_results_item=input_results[i];let input_results_item_id=input_results_id+'__'+i;input_results[i]=ingest$p(input_results_item,{fullPath:input_results_item_id,parent:{data:input,key:path.fullPath,existing:existing}},lds,store,timestamp);}return input;}const select$v=function SimplifiedBatchRepresentationSelect(){const{selections:SimplifiedBatchResultRepresentation__selections,opaque:SimplifiedBatchResultRepresentation__opaque}=select$u();return {kind:'Fragment',selections:[{name:'results',kind:'Link',plural:true,selections:SimplifiedBatchResultRepresentation__selections}]};};function equals$x(existing,incoming){const existing_results=existing.results;const incoming_results=incoming.results;const equals_results_items=equalsArray(existing_results,incoming_results,(existing_results_item,incoming_results_item)=>{if(!(existing_results_item.__ref===incoming_results_item.__ref)){return false;}});if(equals_results_items===false){return false;}return true;}const ingest$q=function SimplifiedBatchRepresentationIngest(input,path,lds,store,timestamp){{const validateError=validate$O(input);if(validateError!==null){throw validateError;}}const key=path.fullPath;let incomingRecord=normalize$q(input,store.records[key],{fullPath:key,parent:path.parent},lds,store,timestamp);const existingRecord=store.records[key];if(existingRecord===undefined||equals$x(existingRecord,incomingRecord)===false){store.publish(key,incomingRecord);}return createLink$5(key);};function getUiApiObjectInfoBatchByObjectApiNames(config){const key=keyPrefix$4+'SimplifiedBatchRepresentation('+'objectApiNames:'+config.urlParams.objectApiNames+')';const headers={};return {path:'/services/data/v49.0/ui-api/object-info/batch/'+config.urlParams.objectApiNames+'',method:'get',body:null,urlParams:config.urlParams,queryParams:{},key:key,ingest:ingest$q,headers};}const getObjectInfos_ConfigPropertyNames={displayName:'getObjectInfos',parameters:{required:['objectApiNames'],optional:[]}};function coerceConfig$h(config){const coercedConfig={};const objectApiNames=getObjectApiNamesArray(config.objectApiNames);if(objectApiNames!==undefined){coercedConfig.objectApiNames=objectApiNames;}return coercedConfig;}function typeCheckConfig$k(untrustedConfig){const config={};const untrustedConfig_objectApiNames=untrustedConfig.objectApiNames;if(ArrayIsArray$1$5(untrustedConfig_objectApiNames)){const untrustedConfig_objectApiNames_array=[];for(let i=0,arrayLength=untrustedConfig_objectApiNames.length;i<arrayLength;i++){const untrustedConfig_objectApiNames_item=untrustedConfig_objectApiNames[i];if(typeof untrustedConfig_objectApiNames_item==='string'){untrustedConfig_objectApiNames_array.push(untrustedConfig_objectApiNames_item);}}config.objectApiNames=untrustedConfig_objectApiNames_array;}return config;}function validateAdapterConfig$k(untrustedConfig,configPropertyNames){if(!untrustedIsObject$5(untrustedConfig)){return null;}{validateConfig$4(untrustedConfig,configPropertyNames);}const coercedConfig=coerceConfig$h(untrustedConfig);const config=typeCheckConfig$k(coercedConfig);if(!areRequiredParametersPresent$4(config,configPropertyNames)){return null;}return config;}function buildInMemorySnapshot$f(lds,config){const request=getUiApiObjectInfoBatchByObjectApiNames({urlParams:{objectApiNames:config.objectApiNames}});const selector={recordId:request.key,node:select$v(),variables:{}};return lds.storeLookup(selector);}function buildNetworkSnapshot$e(lds,config,override){const request=getUiApiObjectInfoBatchByObjectApiNames({urlParams:{objectApiNames:config.objectApiNames}});return lds.dispatchResourceRequest(request,override).then(response=>{const{body}=response;lds.storeIngest(request.key,request,body);lds.storeBroadcast();return buildInMemorySnapshot$f(lds,config);},error=>{lds.storeIngestFetchResponse(request.key,error);lds.storeBroadcast();return lds.errorSnapshot(error);});}const getObjectInfosAdapterFactory=lds=>{return refreshable$5(// Create snapshot either via a cache hit or via the network
    function getObjectInfos(untrustedConfig){const config=validateAdapterConfig$k(untrustedConfig,getObjectInfos_ConfigPropertyNames);// Invalid or incomplete config
    if(config===null){return null;}const cacheSnapshot=buildInMemorySnapshot$f(lds,config);// Cache Hit
    if(cacheSnapshot.state===SNAPSHOT_STATE_FULFILLED$4){return cacheSnapshot;}return buildNetworkSnapshot$e(lds,config);},// Refresh snapshot
    // TODO W-6900511 - This currently passes the untrusted config
    // because we don't have a way to pass the validated config back to LDS
    untrustedConfig=>{const config=validateAdapterConfig$k(untrustedConfig,getObjectInfos_ConfigPropertyNames);// This should never happen
    if(config===null){throw new Error('Invalid config passed to "getObjectInfos" refresh function');}return buildNetworkSnapshot$e(lds,config,{headers:{'Cache-Control':'no-cache'}});});};/**
     * Limit the frequency and the duration that a function is invoked.
     *
     * @param invokeLimit The frequency a function could be invoked.
     * @param timeLimit The duration a function could be invoked with the rate limit, in milliseconds.
     * @param fn The function to be invoked.
     * @param options Extra options for instrumentation, logging, or bookkeeping purposes.
     * @returns The wrapped rate limited function.
     */function throttle(invokeLimit,timeLimit,fn,options){if(invokeLimit<=0||timeLimit<=0){throw new Error('only supports throttling with positive invokeLimit and timeLimit');}let invokeCount=0;let time=Date.now();const allowFunction=options&&options.allowFunction?options.allowFunction:()=>{};const dropFunction=options&&options.dropFunction?options.dropFunction:()=>{};return (...args)=>{const calledTime=Date.now();if(calledTime-time<=timeLimit){if(invokeCount<invokeLimit){invokeCount+=1;allowFunction();return fn(...args);}else {dropFunction();}}else {time=calledTime;invokeCount=1;allowFunction();return fn(...args);}};}const{push:push$2}=Array.prototype;const{entries,keys:keys$4}=Object;const{hasOwnProperty:hasOwnProperty$2}=Object.prototype;const{parse:parse$1,stringify:stringify$4}=JSON;const METRIC_KEY_OWNER='lds';/**
     * Note: This implementation of Metric Keys is a workaround due to @salesforce imports not currently working within LDS context.
     * To be changed in the future if that is fixed. Approved by @relango from Instrumentation team.
     */const ADS_BRIDGE_ADD_RECORDS_DURATION={get(){return {owner:METRIC_KEY_OWNER,name:'ads-bridge-add-records-duration'};}};const ADS_BRIDGE_EMIT_RECORD_CHANGED_DURATION={get(){return {owner:METRIC_KEY_OWNER,name:'ads-bridge-emit-record-changed-duration'};}};const ADS_BRIDGE_EVICT_DURATION={get(){return {owner:METRIC_KEY_OWNER,name:'ads-bridge-evict-duration'};}};const CACHE_HIT_COUNT={get(){return {owner:METRIC_KEY_OWNER,name:'cache-hit-count'};}};const CACHE_MISS_COUNT={get(){return {owner:METRIC_KEY_OWNER,name:'cache-miss-count'};}};const GET_RECORD_NOTIFY_CHANGE_ALLOW_COUNT={get(){return {owner:METRIC_KEY_OWNER,name:'get-record-notify-change-allow-count'};}};const GET_RECORD_NOTIFY_CHANGE_DROP_COUNT={get(){return {owner:METRIC_KEY_OWNER,name:'get-record-notify-change-drop-count'};}};const STORE_BROADCAST_DURATION={get(){return {owner:METRIC_KEY_OWNER,name:'store-broadcast-duration'};}};const STORE_INGEST_DURATION={get(){return {owner:METRIC_KEY_OWNER,name:'store-ingest-duration'};}};const STORE_LOOKUP_DURATION={get(){return {owner:METRIC_KEY_OWNER,name:'store-lookup-duration'};}};const STORE_SIZE_COUNT={get(){return {owner:METRIC_KEY_OWNER,name:'store-size-count'};}};const STORE_SNAPSHOT_SUBSCRIPTIONS_COUNT={get(){return {owner:METRIC_KEY_OWNER,name:'store-snapshot-subscriptions-count'};}};const STORE_WATCH_SUBSCRIPTIONS_COUNT={get(){return {owner:METRIC_KEY_OWNER,name:'store-watch-subscriptions-count'};}};const NAMESPACE='lds';const STORE_STATS_MARK_NAME='store-stats';const RUNTIME_PERF_MARK_NAME='runtime-perf';const NETWORK_TRANSACTION_NAME='lds-network';const cacheHitMetric=service.counter(CACHE_HIT_COUNT);const cacheMissMetric=service.counter(CACHE_MISS_COUNT);const getRecordNotifyChangeAllowMetric=service.counter(GET_RECORD_NOTIFY_CHANGE_ALLOW_COUNT);const getRecordNotifyChangeDropMetric=service.counter(GET_RECORD_NOTIFY_CHANGE_DROP_COUNT);const storeSizeMetric=service.percentileHistogram(STORE_SIZE_COUNT);const storeWatchSubscriptionsMetric=service.percentileHistogram(STORE_WATCH_SUBSCRIPTIONS_COUNT);const storeSnapshotSubscriptionsMetric=service.percentileHistogram(STORE_SNAPSHOT_SUBSCRIPTIONS_COUNT);/**
     * Aura Metrics Service plugin in charge of aggregating all the LDS performance marks before they
     * get sent to the server. All the marks are summed by operation type and the aggregated result
     * is then stored an a new mark.
     */const markAggregatorPlugin={name:NAMESPACE,enabled:true,initialize(){/* noop */},postProcess(marks){const postProcessedMarks=[];let shouldLogAggregated=false;const startTs={};const aggregated={};for(let i=0,len=marks.length;i<len;i++){const mark=marks[i];const{name,phase,ts}=mark;if(phase==='start'){startTs[name]=ts;}else if(phase==='end'){if(aggregated[name]===undefined){aggregated[name]=0;}shouldLogAggregated=true;aggregated[name]+=ts-startTs[name];}else {postProcessedMarks.push(mark);}}if(shouldLogAggregated){postProcessedMarks.push({ns:NAMESPACE,name:RUNTIME_PERF_MARK_NAME,phase:'stamp',ts:service.time(),context:aggregated});}return postProcessedMarks;}};function instrumentMethod(obj,methods){for(let i=0,len=methods.length;i<len;i++){const method=methods[i];const methodName=method.methodName;const originalMethod=obj[methodName];const methodTimer=service.timer(method.metricKey);obj[methodName]=function(...args){service.markStart(NAMESPACE,methodName);const startTime=Date.now();const res=originalMethod.call(this,...args);timerMetricAddDuration(methodTimer,Date.now()-startTime);service.markEnd(NAMESPACE,methodName);return res;};}}function createMetricsKey(owner,name,unit){let metricName=name;if(unit){metricName=metricName+'.'+unit;}return {get(){return {owner:owner,name:metricName};}};}function timerMetricAddDuration(timer,duration){// Guard against negative values since it causes error to be thrown by MetricsService
    if(duration>=0){timer.addDuration(duration);}}function getStoreStats(store){const{records,snapshotSubscriptions,watchSubscriptions}=store;const recordCount=keys$4(records).length;const snapshotSubscriptionCount=keys$4(snapshotSubscriptions).length;const watchSubscriptionCount=keys$4(watchSubscriptions).length;const subscriptionCount=snapshotSubscriptionCount+watchSubscriptionCount;return {recordCount,subscriptionCount,snapshotSubscriptionCount,watchSubscriptionCount};}/**
     * Add a mark to the metrics service.
     *
     * @param name The mark name.
     * @param content The mark content.
     */function mark(name,content){service.mark(NAMESPACE,name,content);}/**
     * Create a new instrumentation cache stats and return it.
     *
     * @param name The cache logger name.
     */function registerLdsCacheStats(name){return service.registerCacheStats(`${NAMESPACE}:${name}`);}/**
     * Initialize the instrumentation and instrument the LDS instance and the Store.
     *
     * @param lds The LDS to instrument.
     * @param store The Store to instrument.
     */function setupInstrumentation(lds,store){service.registerPlugin({name:NAMESPACE,plugin:markAggregatorPlugin});instrumentMethod(lds,[{methodName:'storeBroadcast',metricKey:STORE_BROADCAST_DURATION},{methodName:'storeIngest',metricKey:STORE_INGEST_DURATION},{methodName:'storeLookup',metricKey:STORE_LOOKUP_DURATION}]);service.registerPeriodicLogger(NAMESPACE,()=>{const storeStats=getStoreStats(store);service.mark(NAMESPACE,STORE_STATS_MARK_NAME,storeStats);storeSizeMetric.update(storeStats.recordCount);storeSnapshotSubscriptionsMetric.update(storeStats.snapshotSubscriptionCount);storeWatchSubscriptionsMetric.update(storeStats.watchSubscriptionCount);});}/**
     * Add a network transaction to the metrics service.
     * Injected to LDS for network handling instrumentation.
     *
     * @param context The transaction context.
     */function instrumentNetwork(context){service.perfStart(NETWORK_TRANSACTION_NAME);service.perfEnd(NETWORK_TRANSACTION_NAME,context);}/**
     * Instrument an existing adapter that would logs the cache hits and misses.
     *
     * @param name The adapter name.
     * @param adapter The adapter function.
     * @returns The wrapped adapter.
     */function instrumentAdapter(name,adapter){const stats=registerLdsCacheStats(name);const cacheMissByAdapterMetric=service.counter(createMetricsKey(NAMESPACE,'cache-miss-count',name));const cacheHitByAdapterMetric=service.counter(createMetricsKey(NAMESPACE,'cache-hit-count',name));return config=>{const result=adapter(config);// In the case where the adapter returns a Snapshot it is constructed out of the store
    // (cache hit) whereas a Promise<Snapshot> indicates a network request (cache miss).
    //
    // Note: we can't do a plain instanceof check for a promise here since the Promise may
    // originate from another javascript realm (for example: in jest test). Instead we use a
    // duck-typing approach by checking is the result has a then property.
    //
    // For adapters without persistent store:
    //  - total cache hit ratio:
    //      [in-memory cache hit count] / ([in-memory cache hit count] + [in-memory cache miss count])
    // For adapters with persistent store:
    //  - in-memory cache hit ratio:
    //      [in-memory cache hit count] / ([in-memory cache hit count] + [in-memory cache miss count])
    //  - total cache hit ratio:
    //      ([in-memory cache hit count] + [store cache hit count]) / ([in-memory cache hit count] + [in-memory cache miss count])
    //
    // if result === null then config is insufficient/invalid so do not log
    if(result!==null){if('then'in result){stats.logMisses();cacheMissMetric.increment(1);cacheMissByAdapterMetric.increment(1);}else {stats.logHits();cacheHitMetric.increment(1);cacheHitByAdapterMetric.increment(1);}}return result;};}function incrementGetRecordNotifyChangeAllowCount(){getRecordNotifyChangeAllowMetric.increment(1);}function incrementGetRecordNotifyChangeDropCount(){getRecordNotifyChangeDropMetric.increment(1);}// No need to pass the actual record key `lds.ingestStore`. The `RecordRepresentation.ts#ingest`
    // function extracts the appropriate record id from the ingested record.
    const INGEST_KEY='';// A fake record resource request to trick the LDS engine to ingest records coming from ADS.
    const FAKE_RECORD_REQUEST={ingest:ingest$2$1};const RECORD_ID_PREFIX='UiApi::RecordRepresentation:';const RECORD_ID_REGEXP=/^UiApi::RecordRepresentation:([a-zA-Z0-9])+$/;const MASTER_RECORD_TYPE_ID$1='012000000000000AAA';function isGraphNode$1(node){return node!==null&&node.type==='Node';}function isSpanningRecord$1(fieldValue){return fieldValue!==null&&typeof fieldValue==='object';}/**
     * Returns a shallow copy of a record with its field values if it is a scalar and a reference and a
     * a RecordRepresentation with no field if the value if a spanning record.
     * It returns null if the record contains any pending field.
     */function getShallowRecord(lds,storeRecordId){const recordNode=lds.getNode(storeRecordId);if(!isGraphNode$1(recordNode)){return null;}const fieldsCopy={};const copy=_objectSpread$2({},recordNode.retrieve(),{fields:fieldsCopy,childRelationships:{}});const fieldsNode=recordNode.object('fields');const fieldNames=fieldsNode.keys();for(let i=0,len=fieldNames.length;i<len;i++){let fieldCopy;const fieldName=fieldNames[i];const fieldLink=fieldsNode.link(fieldName);if(fieldLink.isPending()===true){return null;}const fieldNode=fieldLink.follow();if(!isGraphNode$1(fieldNode)){continue;}const{displayValue,value}=fieldNode.retrieve();if(fieldNode.isScalar('value')){fieldCopy={displayValue:displayValue,value:value};}else {const spanningRecordLink=fieldNode.link('value');if(spanningRecordLink.isPending()===true){return null;}const spanningRecordNode=spanningRecordLink.follow();if(!isGraphNode$1(spanningRecordNode)){continue;}fieldCopy={displayValue,value:_objectSpread$2({},spanningRecordNode.retrieve(),{fields:{},childRelationships:{}})};}fieldsCopy[fieldName]=fieldCopy;}return copy;}/**
     * Returns the ADS object metadata representation for a specific record.
     */function getObjectMetadata(lds,record){const{data:objectInfo}=lds.storeLookup({recordId:keyBuilder$8({apiName:record.apiName}),node:{kind:'Fragment',opaque:true},variables:{}});if(objectInfo!==undefined){let nameField='Name';// Extract the entity name field from the object info. In the case where there are multiple
    // field names then pick up the first one.
    if(objectInfo.nameFields.length!==0&&objectInfo.nameFields.indexOf('Name')===-1){nameField=objectInfo.nameFields[0];}return {_nameField:nameField,_entityLabel:objectInfo.label,_keyPrefix:objectInfo.keyPrefix};}return {_nameField:'Name',_entityLabel:record.apiName,_keyPrefix:record.id.substring(0,3)};}/**
     * RecordGvp can send records back to ADS with record types incorrectly set to the master
     * record type. Since there are no known legitimate scenarios where a record can change from a
     * non-master record type back to the master record type, we assume such a transition
     * indicates a RecordGvp mistake. This function checks for that scenario and overwrites the
     * incoming ADS record type information with what we already have in the store when it
     * occurs.
     *
     * @param lds LDS
     * @param record record from ADS, will be fixed in situ
     */function fixRecordTypes(lds,record){// non-master record types should always be correct
    if(record.recordTypeId===MASTER_RECORD_TYPE_ID$1){const key=keyBuilder({recordId:record.id});const recordNode=lds.getNode(key);if(isGraphNode$1(recordNode)&&recordNode.scalar('recordTypeId')!==MASTER_RECORD_TYPE_ID$1){// ignore bogus incoming record type information & keep what we have
    record.recordTypeId=recordNode.scalar('recordTypeId');record.recordTypeInfo=recordNode.object('recordTypeInfo').data;}}// recurse on nested records
    const fieldKeys=keys$4(record.fields);const fieldKeysLen=fieldKeys.length;for(let i=0;i<fieldKeysLen;++i){const fieldValue=record.fields[fieldKeys[i]].value;if(isSpanningRecord$1(fieldValue)){fixRecordTypes(lds,fieldValue);}}}class AdsBridge{constructor(lds){this.lds=lds;this.isRecordEmitLocked=false;this.addRecordsTimerMetric=service.timer(ADS_BRIDGE_ADD_RECORDS_DURATION);this.evictTimerMetric=service.timer(ADS_BRIDGE_EVICT_DURATION);this.emitRecordChangedTimerMetric=service.timer(ADS_BRIDGE_EMIT_RECORD_CHANGED_DURATION);}/**
         * This setter invoked by recordLibrary to listen for records ingested by LDS. The passed method
         * is invoked whenever a record is ingested. It may be via getRecord, getRecordUi, getListUi, ...
         */set receiveFromLdsCallback(callback){// Unsubscribe if there is an existing subscription.
    if(this.watchUnsubscribe!==undefined){this.watchUnsubscribe();this.watchUnsubscribe=undefined;}if(callback!==undefined){this.watchUnsubscribe=this.lds.storeWatch(RECORD_ID_PREFIX,entries=>{if(this.isRecordEmitLocked===true){return;}this.emitRecordChanged(entries,callback);});}}/**
         * This method is invoked when a record has been ingested by ADS.
         *
         * ADS may invoke this method with records that are not UIAPI whitelisted so not refreshable by
         * LDS. LDS filters the provided list so it ingests only UIAPI whitelisted records.
         */addRecords(records,uiApiEntityWhitelist){const startTime=Date.now();const{lds}=this;let didIngestRecord=false;return this.lockLdsRecordEmit(()=>{for(let i=0;i<records.length;i++){const record=records[i];const{apiName}=record;// Ingest the record if no whitelist is passed or the entity name is whitelisted.
    if(uiApiEntityWhitelist===undefined||uiApiEntityWhitelist[apiName]!=='false'){didIngestRecord=true;// Deep-copy the record to ingest and ingest the record copy. This avoids
    // corrupting the ADS cache since ingestion mutates the passed record.
    const recordCopy=parse$1(stringify$4(record));// Don't let incorrect ADS/RecordGVP recordTypeIds replace a valid record type in our store
    // with the master record type. See W-7302870 for details.
    fixRecordTypes(lds,recordCopy);lds.storeIngest(INGEST_KEY,FAKE_RECORD_REQUEST,recordCopy);}}if(didIngestRecord===true){lds.storeBroadcast();}timerMetricAddDuration(this.addRecordsTimerMetric,Date.now()-startTime);});}/**
         * This method is invoked whenever a record has been evicted from ADS.
         */evict(recordId){const startTime=Date.now();const{lds}=this;const key=keyBuilder({recordId});return this.lockLdsRecordEmit(()=>{lds.storeEvict(key);lds.storeBroadcast();timerMetricAddDuration(this.evictTimerMetric,Date.now()-startTime);return Promise.resolve();});}/**
         * Gets the list of fields of a record that LDS has in its store. The field list doesn't
         * contains the spanning record fields. ADS uses this list when it loads a record from the
         * server. This is an optimization to make a single roundtrip it queries for all fields required
         * by ADS and LDS.
         */getTrackedFieldsForRecord(recordId){const{lds}=this;const storeRecordId=keyBuilder({recordId});const recordNode=lds.getNode(storeRecordId);if(!isGraphNode$1(recordNode)){return Promise.resolve([]);}const apiName=recordNode.scalar('apiName');const fieldNames=recordNode.object('fields').keys();// Prefix all the fields with the record API name.
    const qualifiedFieldNames=[];for(let i=0,len=fieldNames.length;i<len;i++){push$2.call(qualifiedFieldNames,`${apiName}.${fieldNames[i]}`);}return Promise.resolve(qualifiedFieldNames);}/**
         * Prevents the bridge to emit record change during the execution of the callback.
         * This methods should wrap all the LDS store mutation done by the bridge. It prevents LDS store
         * mutations triggered by ADS to be emit back to ADS.
         */lockLdsRecordEmit(callback){this.isRecordEmitLocked=true;try{return callback();}finally{this.isRecordEmitLocked=false;}}/**
         * This method retrieves queries the store with with passed record ids to retrieve their
         * associated records and object info. Note that the passed ids are not Salesforce record id
         * but rather LDS internals store ids.
         */emitRecordChanged(updatedEntries,callback){const startTime=Date.now();const{lds}=this;let shouldEmit=false;const adsRecordMap={};const adsObjectMap={};for(let i=0;i<updatedEntries.length;i++){const storeRecordId=updatedEntries[i].id;// Exclude all the store record ids not matching with the record id pattern.
    // Note: FieldValueRepresentation have the same prefix than RecordRepresentation so we
    // need to filter them out.
    if(!storeRecordId.match(RECORD_ID_REGEXP)){continue;}const record=getShallowRecord(lds,storeRecordId);if(record===null){continue;}const{id,apiName}=record;shouldEmit=true;adsRecordMap[id]={[apiName]:{isPrimary:true,record}};// Extract and add the object metadata to the map if not already present.
    if(!hasOwnProperty$2.call(adsObjectMap,apiName)){adsObjectMap[apiName]=getObjectMetadata(lds,record);}}if(shouldEmit===true){callback(adsRecordMap,adsObjectMap);}timerMetricAddDuration(this.emitRecordChangedTimerMetric,Date.now()-startTime);}}// The VERSION environment variable is replaced by rollup during the bundling and replaces it with
    // the commit hash. This avoid having a cache hit on data that has been stored by a previous
    // version of LDS.
    const STORAGE_VERSION="3dfe453";// AuraStorage treats `secure` as a must-have whereas `persistent` is a nice-to-have. Secure and
    // persistent storage is only possible with CryptoAdapter. Availability of that adapter is
    // controlled by the application.
    const STORAGE_CONFIG={persistent:true,secure:true,maxSize:5*1024*1024,clearOnInit:false,debugLogging:false,version:STORAGE_VERSION};const STORAGE_INSTANCES=[];function createStorage(config){if(auraStorage.initStorage===undefined){return null;}const storageConfig=_objectSpread$2({},STORAGE_CONFIG,config);const storage=auraStorage.initStorage(storageConfig);if(!storage.isPersistent()){if(auraStorage.deleteStorage!==undefined){auraStorage.deleteStorage(storageConfig.name).catch(()=>{});// intentional noop on error
    }return null;}STORAGE_INSTANCES.push(storage);return storage;}function clearStorages(){return Promise.all(STORAGE_INSTANCES.map(storage=>storage.clear()));}const OBJECT_INFO_PREFIX='UiApi::ObjectInfoRepresentation:';const STORAGE_DROP_MARK_NAME='storage-drop';const STORAGE_DROP_MARK_CONTEXT={reason:'Object info changed'};/**
     * Watch an LDS instance for metadata changes.
     */function setupMetadataWatcher(lds){// Watch for object info changes. Since we don't have enough information to understand to which
    // extent an object info change may impact the application the only thing we do is to clear all
    // the  persistent storages.
    lds.storeWatch(OBJECT_INFO_PREFIX,entries=>{for(let i=0,len=entries.length;i<len;i++){const entry=entries[i];const isObjectInfoUpdated=entry.inserted===false;if(isObjectInfoUpdated){mark(STORAGE_DROP_MARK_NAME,STORAGE_DROP_MARK_CONTEXT);clearStorages().catch(()=>{/* noop */});break;}}});}class AuraFetchResponse{constructor(status,body,headers){this.status=status;this.body=body;this.headers=headers||{};}get statusText(){const{status}=this;switch(status){case HttpStatusCode.Ok:return 'OK';case HttpStatusCode.NotModified:return 'Not Modified';case HttpStatusCode.NotFound:return 'Not Found';case HttpStatusCode.BadRequest:return 'Bad Request';case HttpStatusCode.ServerError:return 'Server Error';default:return `Unexpected HTTP Status Code: ${status}`;}}get ok(){return this.status===200;}}const APEX_BASE_URI='/apex';const ApexController='ApexActionController.execute';function executeApex(resourceRequest){const{body}=resourceRequest;return dispatchApexAction(ApexController,body,{background:false,hotspot:false,longRunning:body.isContinuation});}function dispatchApexAction(endpoint,params,config){return aura.executeGlobalController(endpoint,params,config).then(body=>{// massage aura action response to
    //  headers: { cacheable }
    //  body: returnValue
    return new AuraFetchResponse(HttpStatusCode.Ok,body.returnValue===undefined?null:body.returnValue,// Headers expects properties of [name: string]: string
    // However this is a synthetic header and we want to keep the boolean
    {cacheable:body.cacheable});},err=>{// Handle ConnectedInJava exception shapes
    if(err.data!==undefined&&err.data.statusCode!==undefined){const{data}=err;throw new AuraFetchResponse(data.statusCode,data);}// Handle all the other kind of errors
    throw new AuraFetchResponse(HttpStatusCode.ServerError,err);});}const UI_API_BASE_URI='/services/data/v49.0/ui-api';const ACTION_CONFIG={background:false,hotspot:true,longRunning:false};const actionConfig={action:ACTION_CONFIG};function createOkResponse(body){return new AuraFetchResponse(HttpStatusCode.Ok,body);}/** Invoke an Aura controller with the pass parameters. */function dispatchAction(endpoint,params,config={}){const{action:actionConfig,cache:cacheConfig}=config;const fetchFromNetwork=()=>{return aura.executeGlobalController(endpoint,params,actionConfig).then(body=>{// If a cache is passed, store the action body in the cache before returning the
    // value. Even though `AuraStorage.set` is an asynchronous operation we don't
    // need to wait for the store to resolve/reject before returning the value.
    // Swallow the error to not have an unhandled promise rejection.
    if(cacheConfig!==undefined&&cacheConfig.storage!==null){cacheConfig.storage.set(cacheConfig.key,body).catch(_error=>{});}return createOkResponse(body);},err=>{// Handle ConnectedInJava exception shapes
    if(err.data!==undefined&&err.data.statusCode!==undefined){const{data}=err;throw new AuraFetchResponse(data.statusCode,data);}// Handle all the other kind of errors
    throw new AuraFetchResponse(HttpStatusCode.ServerError,{error:err.message});});};// If no cache is passed or if the action should be refreshed, directly fetch the action from
    // the server.
    if(cacheConfig===undefined||cacheConfig.forceRefresh===true||cacheConfig.storage===null){return fetchFromNetwork();}// Otherwise check for the action body in the cache. If action is not present in the cache or if
    // the cache lookup fails for any reason fallback to the network.
    return cacheConfig.storage.get(cacheConfig.key).then(cacheResult=>{if(cacheResult!==undefined){cacheConfig.statsLogger.logHits();return createOkResponse(cacheResult);}cacheConfig.statsLogger.logMisses();return fetchFromNetwork();},()=>{return fetchFromNetwork();});}/**
     * All the methods exposed out of the UiApiController accept a clientOption config. This method
     * adds methods returns a new params object with the client option if necessary, otherwise it
     * returns the passed params object.
     */function buildUiApiParams(params,resourceRequest){const ifModifiedSince=resourceRequest.headers['If-Modified-Since'];const ifUnmodifiedSince=resourceRequest.headers['If-Unmodified-Since'];let clientOptions={};if(ifModifiedSince!==undefined){clientOptions.ifModifiedSince=ifModifiedSince;}if(ifUnmodifiedSince!==undefined){clientOptions.ifUnmodifiedSince=ifUnmodifiedSince;}return Object.keys(clientOptions).length>0?_objectSpread$2({},params,{clientOptions:clientOptions}):params;}/** Returns true if an action should ignore the network cache data. */function shouldForceRefresh(resourceRequest){const cacheControl=resourceRequest.headers['Cache-Control'];return cacheControl!==undefined||cacheControl==='no-cache';}var UiApiActionsController;(function(UiApiActionsController){UiApiActionsController["GetLookupActions"]="ActionsController.getLookupActions";UiApiActionsController["GetRecordActions"]="ActionsController.getRecordActions";UiApiActionsController["GetRecordEditActions"]="ActionsController.getRecordEditActions";})(UiApiActionsController||(UiApiActionsController={}));const UIAPI_ACTIONS_LOOKUP_PATH=`${UI_API_BASE_URI}/actions/lookup/`;const UIAPI_ACTIONS_RECORD_PATH=`${UI_API_BASE_URI}/actions/record/`;const UIAPI_ACTIONS_RECORD_EDIT='/record-edit';function getLookupActions(resourceRequest){const{urlParams:{objectApiNames},queryParams}=resourceRequest;const parameters=buildUiApiParams(_objectSpread$2({objectApiNames},queryParams),resourceRequest);return dispatchAction(UiApiActionsController.GetLookupActions,parameters);}function getRecordActions(resourceRequest){const{urlParams:{recordIds},queryParams}=resourceRequest;const parameters=buildUiApiParams(_objectSpread$2({recordIds},queryParams),resourceRequest);return dispatchAction(UiApiActionsController.GetRecordActions,parameters);}function getRecordEditActions(resourceRequest){const{urlParams:{recordIds},queryParams}=resourceRequest;const parameters=buildUiApiParams(_objectSpread$2({recordIds},queryParams),resourceRequest);return dispatchAction(UiApiActionsController.GetRecordEditActions,parameters);}var UiApiListsController;(function(UiApiListsController){UiApiListsController["GetListsByObjectName"]="ListUiController.getListsByObjectName";UiApiListsController["GetListUiById"]="ListUiController.getListUiById";UiApiListsController["GetListRecordsById"]="ListUiController.getListRecordsById";UiApiListsController["GetListUiByName"]="ListUiController.getListUiByName";UiApiListsController["GetListRecordsByName"]="ListUiController.getListRecordsByName";})(UiApiListsController||(UiApiListsController={}));const UIAPI_LIST_RECORDS_PATH=`${UI_API_BASE_URI}/list-records/`;const UIAPI_LIST_UI_PATH=`${UI_API_BASE_URI}/list-ui/`;function getListRecordsByName(resourceRequest){const{urlParams:{objectApiName,listViewApiName},queryParams:{fields,optionalFields,pageSize,pageToken,sortBy}}=resourceRequest;const params=buildUiApiParams({objectApiName,listViewApiName,fields,optionalFields,pageSize,pageToken,sortBy},resourceRequest);return dispatchAction(UiApiListsController.GetListRecordsByName,params);}function getListRecordsById(resourceRequest){const{urlParams:{listViewId},queryParams:{fields,optionalFields,pageSize,pageToken,sortBy}}=resourceRequest;const params=buildUiApiParams({listViewId,fields,optionalFields,pageSize,pageToken,sortBy},resourceRequest);return dispatchAction(UiApiListsController.GetListRecordsById,params);}function getListUiByName(resourceRequest){const{urlParams:{objectApiName,listViewApiName},queryParams:{fields,optionalFields,pageSize,pageToken,sortBy}}=resourceRequest;const params=buildUiApiParams({objectApiName,listViewApiName,fields,optionalFields,pageSize,pageToken,sortBy},resourceRequest);return dispatchAction(UiApiListsController.GetListUiByName,params);}function getListUiById(resourceRequest){const{urlParams:{listViewId},queryParams:{fields,optionalFields,pageSize,pageToken,sortBy}}=resourceRequest;const params=buildUiApiParams({listViewId,fields,optionalFields,pageSize,pageToken,sortBy},resourceRequest);return dispatchAction(UiApiListsController.GetListUiById,params);}function getListsByObjectName(resourceRequest){const{urlParams:{objectApiName},queryParams:{pageSize,pageToken,q,recentListsOnly}}=resourceRequest;const params=buildUiApiParams({objectApiName,pageSize,pageToken,q,recentListsOnly},resourceRequest);return dispatchAction(UiApiListsController.GetListsByObjectName,params);}const UIAPI_LOOKUP_RECORDS=`${UI_API_BASE_URI}/lookups`;const LookupRecords='LookupController.getLookupRecords';function lookupRecords(resourceRequest){const{urlParams,queryParams}=resourceRequest;const params=buildUiApiParams(_objectSpread$2({},urlParams,queryParams),resourceRequest);return dispatchAction(LookupRecords,params);}var UiApiMruListsController;(function(UiApiMruListsController){UiApiMruListsController["GetMruListUi"]="MruListUiController.getMruListUi";UiApiMruListsController["GetMruListRecords"]="MruListUiController.getMruListRecords";})(UiApiMruListsController||(UiApiMruListsController={}));const UIAPI_MRU_LIST_RECORDS_PATH=`${UI_API_BASE_URI}/mru-list-records/`;const UIAPI_MRU_LIST_UI_PATH=`${UI_API_BASE_URI}/mru-list-ui/`;function getMruListRecords(resourceRequest){const{urlParams:{objectApiName},queryParams:{fields,optionalFields,pageSize,pageToken,sortBy}}=resourceRequest;const params=buildUiApiParams({objectApiName,fields,optionalFields,pageSize,pageToken,sortBy},resourceRequest);return dispatchAction(UiApiMruListsController.GetMruListRecords,params);}function getMruListUi(resourceRequest){const{urlParams:{objectApiName},queryParams:{fields,optionalFields,pageSize,pageToken,sortBy}}=resourceRequest;const params=buildUiApiParams({objectApiName,fields,optionalFields,pageSize,pageToken,sortBy},resourceRequest);return dispatchAction(UiApiMruListsController.GetMruListUi,params);}var UiApiRecordController;(function(UiApiRecordController){UiApiRecordController["CreateRecord"]="RecordUiController.createRecord";UiApiRecordController["DeleteRecord"]="RecordUiController.deleteRecord";UiApiRecordController["ExecuteAggregateUi"]="RecordUiController.executeAggregateUi";UiApiRecordController["GetLayout"]="RecordUiController.getLayout";UiApiRecordController["GetLayoutUserState"]="RecordUiController.getLayoutUserState";UiApiRecordController["GetRecordAvatars"]="RecordUiController.getRecordAvatars";UiApiRecordController["GetRecordCreateDefaults"]="RecordUiController.getRecordCreateDefaults";UiApiRecordController["GetRecordUi"]="RecordUiController.getRecordUis";UiApiRecordController["GetRecordWithFields"]="RecordUiController.getRecordWithFields";UiApiRecordController["GetRecordWithLayouts"]="RecordUiController.getRecordWithLayouts";UiApiRecordController["GetObjectInfo"]="RecordUiController.getObjectInfo";UiApiRecordController["GetObjectInfos"]="RecordUiController.getObjectInfos";UiApiRecordController["GetPicklistValues"]="RecordUiController.getPicklistValues";UiApiRecordController["GetPicklistValuesByRecordType"]="RecordUiController.getPicklistValuesByRecordType";UiApiRecordController["UpdateRecord"]="RecordUiController.updateRecord";UiApiRecordController["UpdateRecordAvatar"]="RecordUiController.postRecordAvatarAssociation";UiApiRecordController["UpdateLayoutUserState"]="RecordUiController.updateLayoutUserState";})(UiApiRecordController||(UiApiRecordController={}));const UIAPI_GET_LAYOUT=`${UI_API_BASE_URI}/layout/`;const UIAPI_RECORDS_PATH=`${UI_API_BASE_URI}/records`;const UIAPI_RECORD_AVATARS_BASE=`${UI_API_BASE_URI}/record-avatars/`;const UIAPI_RECORD_AVATARS_BATCH_PATH=`${UI_API_BASE_URI}/record-avatars/batch/`;const UIAPI_RECORD_AVATAR_UPDATE=`/association`;const UIAPI_RECORD_CREATE_DEFAULTS_PATH=`${UI_API_BASE_URI}/record-defaults/create/`;const UIAPI_RECORD_UI_PATH=`${UI_API_BASE_URI}/record-ui/`;const UIAPI_GET_LAYOUT_USER_STATE='/user-state';const UIAPI_OBJECT_INFO_PATH=`${UI_API_BASE_URI}/object-info/`;const UIAPI_OBJECT_INFO_BATCH_PATH=`${UI_API_BASE_URI}/object-info/batch/`;const objectInfoStorage=createStorage({name:'ldsObjectInfo',expiration:5*60});const objectInfoStorageStatsLogger=registerLdsCacheStats('getObjectInfo:storage');const layoutStorage=createStorage({name:'ldsLayout',expiration:15*60});const layoutStorageStatsLogger=registerLdsCacheStats('getLayout:storage');const layoutUserStateStorage=createStorage({name:'ldsLayoutUserState',expiration:15*60});const layoutUserStateStorageStatsLogger=registerLdsCacheStats('getLayoutUserState:storage');function getObjectInfo(resourceRequest,cacheKey){const params=buildUiApiParams({objectApiName:resourceRequest.urlParams.objectApiName},resourceRequest);const config=_objectSpread$2({},actionConfig);if(objectInfoStorage!==null){config.cache={storage:objectInfoStorage,key:cacheKey,statsLogger:objectInfoStorageStatsLogger,forceRefresh:shouldForceRefresh(resourceRequest)};}return dispatchAction(UiApiRecordController.GetObjectInfo,params,config);}function getObjectInfos(resourceRequest,cacheKey){const params=buildUiApiParams({objectApiNames:resourceRequest.urlParams.objectApiNames},resourceRequest);const config=_objectSpread$2({},actionConfig);if(objectInfoStorage!==null){config.cache={storage:objectInfoStorage,key:cacheKey,statsLogger:objectInfoStorageStatsLogger,forceRefresh:shouldForceRefresh(resourceRequest)};}return dispatchAction(UiApiRecordController.GetObjectInfos,params,config);}function getRecord$1(resourceRequest){const{urlParams,queryParams}=resourceRequest;const{recordId}=urlParams;const{fields,layoutTypes,modes,optionalFields}=queryParams;let getRecordParams={};let controller;if(layoutTypes!==undefined){getRecordParams={recordId,layoutTypes,modes,optionalFields};controller=UiApiRecordController.GetRecordWithLayouts;}else {getRecordParams={recordId,fields,optionalFields};controller=UiApiRecordController.GetRecordWithFields;}const params=buildUiApiParams(getRecordParams,resourceRequest);return dispatchAction(controller,params,actionConfig);}function createRecord(resourceRequest){const params=buildUiApiParams({recordInput:resourceRequest.body},resourceRequest);return dispatchAction(UiApiRecordController.CreateRecord,params,actionConfig);}function deleteRecord(resourceRequest){const{urlParams}=resourceRequest;const params=buildUiApiParams({recordId:urlParams.recordId},resourceRequest);return dispatchAction(UiApiRecordController.DeleteRecord,params,actionConfig);}function updateRecord(resourceRequest){const{body,urlParams}=resourceRequest;const params=buildUiApiParams({recordId:urlParams.recordId,recordInput:body},resourceRequest);return dispatchAction(UiApiRecordController.UpdateRecord,params,actionConfig);}function updateLayoutUserState$1(resourceRequest){const{body,urlParams:{objectApiName},queryParams:{layoutType,mode,recordTypeId}}=resourceRequest;const params=buildUiApiParams({objectApiName,layoutType,mode,recordTypeId,userState:body},resourceRequest);return dispatchAction(UiApiRecordController.UpdateLayoutUserState,params,actionConfig).then(response=>{// TODO: Instead of surgically evicting the record that has been updated in the cache we
    // currently dump all the entries. We need a way to recreate the same cache key between
    // getLayoutUserState and updateLayoutUserState.
    if(layoutUserStateStorage!==null){layoutUserStateStorage.clear();}return response;});}function getRecordAvatars(resourceRequest){const{urlParams}=resourceRequest;const recordIds=urlParams.recordIds;const params=buildUiApiParams({recordIds},resourceRequest);return dispatchAction(UiApiRecordController.GetRecordAvatars,params,actionConfig);}function updateRecordAvatar(resourceRequest){const{urlParams,body}=resourceRequest;const params=buildUiApiParams({input:body,recordId:urlParams.recordId},resourceRequest);return dispatchAction(UiApiRecordController.UpdateRecordAvatar,params,actionConfig);}function getRecordUi(resourceRequest){const{urlParams:{recordIds},queryParams:{layoutTypes,modes,optionalFields}}=resourceRequest;const params=buildUiApiParams({layoutTypes,modes,optionalFields,recordIds},resourceRequest);return dispatchAction(UiApiRecordController.GetRecordUi,params,actionConfig);}function getPicklistValues(resourceRequest){const{urlParams}=resourceRequest;const params=buildUiApiParams({objectApiName:urlParams.objectApiName,recordTypeId:urlParams.recordTypeId,fieldApiName:urlParams.fieldApiName},resourceRequest);return dispatchAction(UiApiRecordController.GetPicklistValues,params,actionConfig);}function getPicklistValuesByRecordType(resourceRequest){const{urlParams:{objectApiName,recordTypeId}}=resourceRequest;const params=buildUiApiParams({objectApiName,recordTypeId},resourceRequest);return dispatchAction(UiApiRecordController.GetPicklistValuesByRecordType,params,actionConfig);}function getLayout(resourceRequest,cacheKey){const{urlParams:{objectApiName},queryParams:{layoutType,mode,recordTypeId}}=resourceRequest;const params=buildUiApiParams({objectApiName,layoutType,mode,recordTypeId},resourceRequest);const config=_objectSpread$2({},actionConfig);if(layoutStorage!==null){config.cache={storage:layoutStorage,key:cacheKey,statsLogger:layoutStorageStatsLogger,forceRefresh:shouldForceRefresh(resourceRequest)};}return dispatchAction(UiApiRecordController.GetLayout,params,config);}function getLayoutUserState(resourceRequest,cacheKey){const{urlParams:{objectApiName},queryParams:{layoutType,mode,recordTypeId}}=resourceRequest;const params=buildUiApiParams({objectApiName,layoutType,mode,recordTypeId},resourceRequest);const config=_objectSpread$2({},actionConfig);if(layoutUserStateStorage!==null){config.cache={storage:layoutUserStateStorage,key:cacheKey,statsLogger:layoutUserStateStorageStatsLogger,forceRefresh:shouldForceRefresh(resourceRequest)};}return dispatchAction(UiApiRecordController.GetLayoutUserState,params,config);}function getRecordCreateDefaults(resourceRequest){const{urlParams:{objectApiName},queryParams:{formFactor,optionalFields,recordTypeId}}=resourceRequest;const params=buildUiApiParams({objectApiName,formFactor,recordTypeId,optionalFields},resourceRequest);return dispatchAction(UiApiRecordController.GetRecordCreateDefaults,params,actionConfig);}const ACTION_CONFIG$1={background:false,hotspot:true,longRunning:false};const BASE_URI='/services/data/v49.0';const CONNECT_BASE_URI=`${BASE_URI}/connect`;const COMMERCE_BASE_URI=`${BASE_URI}/commerce`;var ConnectController;(function(ConnectController){ConnectController["GetCommunityNavigationMenu"]="NavigationMenuController.getCommunityNavigationMenu";ConnectController["GetProduct"]="CommerceCatalogController.getProduct";ConnectController["GetProductCategoryPath"]="CommerceCatalogController.getProductCategoryPath";ConnectController["ProductSearch"]="CommerceProductSearchController.productSearch";ConnectController["GetProductPrice"]="CommerceStorePricingController.getProductPrice";})(ConnectController||(ConnectController={}));const COMMUNITIES_NAVIGATION_MENU_PATH=new RegExp(`${CONNECT_BASE_URI}/communities/([A-Z0-9]){15,18}/navigation-menu`,'i');const GET_PRODUCT_PATH=new RegExp(`${COMMERCE_BASE_URI}/webstores/([A-Z0-9]){15,18}/products/([A-Z0-9]){15,18}`,'i');const GET_PRODUCT_CATEGORY_PATH_PATH=new RegExp(`${COMMERCE_BASE_URI}/webstores/([A-Z0-9]){15,18}/product-category-path/product-categories/([A-Z0-9]){15,18}`,'i');const PRODUCT_SEARCH_PATH=new RegExp(`${COMMERCE_BASE_URI}/webstores/([A-Z0-9]){15,18}/search/product-search`,'i');const GET_PRODUCT_PRICE_PATH=new RegExp(`${COMMERCE_BASE_URI}/webstores/([A-Z0-9]){15,18}/pricing/products/([A-Z0-9]){15,18}`,'i');function getCommunityNavigationMenu(resourceRequest){return dispatchConnectAction(ConnectController.GetCommunityNavigationMenu,resourceRequest);}function getProduct(resourceRequest){return dispatchConnectAction(ConnectController.GetProduct,resourceRequest);}function getProductCategoryPath(resourceRequest){return dispatchConnectAction(ConnectController.GetProductCategoryPath,resourceRequest);}function productSearch(resourceRequest){return dispatchConnectAction(ConnectController.ProductSearch,resourceRequest);}function getProductPrice(resourceRequest){return dispatchConnectAction(ConnectController.GetProductPrice,resourceRequest);}function dispatchConnectAction(controller,resourceRequest){const actionConfig={action:ACTION_CONFIG$1};const{urlParams,queryParams}=resourceRequest;const params=_objectSpread$2({},urlParams,queryParams);return dispatchAction(controller,params,actionConfig);}function controllerInvokerFactory(resourceRequest){const{path,method}=resourceRequest;switch(method){case'delete':if(path.startsWith(UIAPI_RECORDS_PATH)){return deleteRecord;}break;case'post':if(path===UIAPI_RECORDS_PATH){return createRecord;}if(path===APEX_BASE_URI){return executeApex;}if(path.startsWith(UIAPI_RECORD_AVATARS_BASE)){if(path.endsWith(UIAPI_RECORD_AVATAR_UPDATE)){return updateRecordAvatar;}}if(path.startsWith(COMMERCE_BASE_URI)){if(PRODUCT_SEARCH_PATH.test(path)){return productSearch;}}break;case'patch':if(path.startsWith(UIAPI_RECORDS_PATH)){return updateRecord;}if(path.startsWith(UIAPI_GET_LAYOUT)){if(path.endsWith(UIAPI_GET_LAYOUT_USER_STATE)){return updateLayoutUserState$1;}}break;case'get':if(path.startsWith(UIAPI_ACTIONS_LOOKUP_PATH)){return getLookupActions;}if(path.startsWith(UIAPI_ACTIONS_RECORD_PATH)){if(path.endsWith(UIAPI_ACTIONS_RECORD_EDIT)){return getRecordEditActions;}else {return getRecordActions;}}if(path.startsWith(UIAPI_LIST_RECORDS_PATH)){if(/list-records\/.*\//.test(path)){// .../list-records/${objectApiName}/${listViewApiName}
    return getListRecordsByName;}else {// .../list-records/${listViewId}
    return getListRecordsById;}}if(path.startsWith(UIAPI_LIST_UI_PATH)){if(/list-ui\/.*\//.test(path)){// .../list-ui/${objectApiName}/${listViewApiName}
    return getListUiByName;}else if(/00B[a-zA-Z\d]{15}$/.test(path)){// .../list-ui/${listViewId}
    return getListUiById;}else {// .../list-ui/${objectApiName}
    return getListsByObjectName;}}if(path.startsWith(UIAPI_MRU_LIST_RECORDS_PATH)){return getMruListRecords;}if(path.startsWith(UIAPI_MRU_LIST_UI_PATH)){return getMruListUi;}if(path.startsWith(UIAPI_OBJECT_INFO_PATH)){if(path.startsWith(UIAPI_OBJECT_INFO_BATCH_PATH)){// object-info/batch/
    return getObjectInfos;}else if(/picklist-values\/[a-zA-Z\d]+\/[a-zA-Z\d]+/.test(path)){// object-info/API_NAME/picklist-values/RECORD_TYPE_ID/FIELD_API_NAME
    return getPicklistValues;}else if(/picklist-values\/[a-zA-Z\d]+/.test(path)){// object-info/API_NAME/picklist-values/RECORD_TYPE_ID
    return getPicklistValuesByRecordType;}return getObjectInfo;}if(path.startsWith(UIAPI_RECORDS_PATH)){return getRecord$1;}if(path.startsWith(UIAPI_RECORD_CREATE_DEFAULTS_PATH)){return getRecordCreateDefaults;}if(path.startsWith(UIAPI_RECORD_AVATARS_BATCH_PATH)){return getRecordAvatars;}if(path.startsWith(UIAPI_RECORD_UI_PATH)){return getRecordUi;}if(path.startsWith(UIAPI_LOOKUP_RECORDS)){return lookupRecords;}if(path.startsWith(UIAPI_GET_LAYOUT)){if(path.endsWith(UIAPI_GET_LAYOUT_USER_STATE)){return getLayoutUserState;}return getLayout;}// All connect APIs
    if(path.startsWith(CONNECT_BASE_URI)){if(COMMUNITIES_NAVIGATION_MENU_PATH.test(path)){return getCommunityNavigationMenu;}}// All commerce APIs
    if(path.startsWith(COMMERCE_BASE_URI)){if(GET_PRODUCT_PATH.test(path)){return getProduct;}if(GET_PRODUCT_CATEGORY_PATH_PATH.test(path)){return getProductCategoryPath;}if(GET_PRODUCT_CATEGORY_PATH_PATH.test(path)){return getProductCategoryPath;}if(GET_PRODUCT_PRICE_PATH.test(path)){return getProductPrice;}}break;}throw new Error(`No invoker matching controller factory: ${path} ${method}.`);}function getFulfillingRequest(inflightRequests,resourceRequest){const{fulfill}=resourceRequest;if(fulfill===undefined){return null;}const handlersMap=entries(inflightRequests);for(let i=0,len=handlersMap.length;i<len;i+=1){const[transactionKey,handlers]=handlersMap[i];// check fulfillment against only the first handler ([0]) because it's equal or
    // fulfills all subsequent handlers in the array
    const existing=handlers[0].resourceRequest;if(fulfill(existing,resourceRequest)===true){return transactionKey;}}return null;}function getTransactionKey(resourceRequest){const{path,key,queryParams,headers}=resourceRequest;return `${path}::${stringify$4(headers)}::${queryParams?stringify$4(queryParams):''}::${key}`;}const inflightRequests=Object.create(null);function networkAdapter(resourceRequest){const{method}=resourceRequest;const transactionKey=getTransactionKey(resourceRequest);const controllerInvoker=controllerInvokerFactory(resourceRequest);if(method!=='get'){return controllerInvoker(resourceRequest,transactionKey);}// if an identical request is in-flight then queue for its response (do not re-issue the request)
    if(transactionKey in inflightRequests){return new Promise((resolve,reject)=>{push$2.call(inflightRequests[transactionKey],{resolve,reject,resourceRequest});});}// fallback to checking a custom deduper to find a similar (but not identical) request
    const similarTransactionKey=getFulfillingRequest(inflightRequests,resourceRequest);if(similarTransactionKey!==null){return new Promise(resolve=>{// custom dedupers find similar (not identical) requests. if the similar request fails
    // there's no guarantee the deduped request should fail. thus we re-issue the
    // original request in the case of a failure
    function reissueRequest(){resolve(networkAdapter(resourceRequest));}push$2.call(inflightRequests[similarTransactionKey],{resolve,reject:reissueRequest,resourceRequest});});}// not a duplicate request so invoke the network
    // when it resolves, clear the queue then invoke queued handlers
    // (must clear the queue first in case handlers re-invoke the network)
    controllerInvoker(resourceRequest,transactionKey).then(response=>{const handlers=inflightRequests[transactionKey];delete inflightRequests[transactionKey];// handlers mutate responses so must clone the response for each.
    // the first handler is given the original version to avoid an
    // extra clone (particularly when there's only 1 handler).
    for(let i=1,len=handlers.length;i<len;i++){const handler=handlers[i];handler.resolve(parse$1(stringify$4(response)));}handlers[0].resolve(response);},error=>{const handlers=inflightRequests[transactionKey];delete inflightRequests[transactionKey];for(let i=0,len=handlers.length;i<len;i++){const handler=handlers[i];handler.reject(error);}});// rely on sync behavior of Promise creation to create the list for handlers
    return new Promise((resolve,reject)=>{inflightRequests[transactionKey]=[{resolve,reject,resourceRequest}];});}const store=new Store();const lds=new LDS(store,networkAdapter,{instrument:instrumentNetwork});setupInstrumentation(lds,store);setupMetadataWatcher(lds);/** Create a new LDS adapter from an adapter factory. */const createLdsAdapter=(name,factory)=>{return instrumentAdapter(name,factory(lds));};/** Register an LDS adapter to the LWC Wire Service */const registerWireAdapter=adapter=>{return register(lds,wireService,adapter);};/** Create and register an LDS adapter factory. */const setupWireAdapter=(name,factory)=>{const adapter=createLdsAdapter(name,factory);return registerWireAdapter(adapter);};const getObjectInfoLdsAdapter=createLdsAdapter('getObjectInfo',getObjectInfoAdapterFactory);const getObjectInfosLdsAdapter=createLdsAdapter('getObjectInfos',getObjectInfosAdapterFactory);const getLayoutLdsAdapter=createLdsAdapter('getLayout',factory$2);const getRecordLdsAdapter=createLdsAdapter('getRecord',factory$7);const getRecordActionsLdsAdapter=getRecordActionsAdapterFactory(lds);const getRecordAvatarsLdsAdapter=createLdsAdapter('getRecordAvatars',factory$8);const getRecordUiLdsAdapter=createLdsAdapter('getRecordUi',factory$6);const getLayoutUserStateLdsAdapter=createLdsAdapter('getLayoutUserState',factory$3);const getLayout$1=registerWireAdapter(getLayoutLdsAdapter);const getLayoutUserState$1=registerWireAdapter(getLayoutUserStateLdsAdapter);const getListUi=setupWireAdapter('getListUi',factory$4);const getLookupActions$1=setupWireAdapter('getLookupActions',getLookupActionsAdapterFactory);const getLookupRecords=setupWireAdapter('getLookupRecords',factory$5);const getObjectInfo$1=registerWireAdapter(getObjectInfoLdsAdapter);const getObjectInfos$1=registerWireAdapter(getObjectInfosLdsAdapter);const getPicklistValues$1=setupWireAdapter('getPicklistValues',factory$9);const getPicklistValuesByRecordType$1=setupWireAdapter('getPicklistValuesByRecordType',factory$a);const getRecord$2=registerWireAdapter(getRecordLdsAdapter);const getRecordActions$1=registerWireAdapter(getRecordActionsLdsAdapter);const getRecordAvatars$1=registerWireAdapter(getRecordAvatarsLdsAdapter);const getRecordCreateDefaults$1=setupWireAdapter('getRecordCreateDefaults',factory$e);const getRecordEditActions$1=setupWireAdapter('getRecordEditActions',getRecordEditActionsAdapterFactory);const getRecordUi$1=registerWireAdapter(getRecordUiLdsAdapter);/**
     * Connect
     */const getCommunityNavigationMenuAdapter=createLdsAdapter('getCommunityNavigationMenu',getCommunityNavigationMenuAdapterFactory);const getCommunityNavigationMenu$1=registerWireAdapter(getCommunityNavigationMenuAdapter);/**
     * Commerce
     */const getProductAdapter=createLdsAdapter('getProduct',getProductAdapterFactory);const getProduct$1=registerWireAdapter(getProductAdapter);const getProductCategoryPathAdapter=createLdsAdapter('getProductCategoryPath',getProductCategoryPathAdapterFactory);const getProductCategoryPath$1=registerWireAdapter(getProductCategoryPathAdapter);const getProductPriceAdapter=createLdsAdapter('getProductPrice',getProductPriceAdapterFactory);const getProductPrice$1=registerWireAdapter(getProductPriceAdapter);const productSearchAdapter=createLdsAdapter('productSearch',productSearchAdapterFactory);const productSearch$1=registerWireAdapter(productSearchAdapter);/**
     * Apex
     */const getApexInvoker=function(namespace,classname,method,isContinuation){const identifier=invoker(lds,{namespace,classname,method,isContinuation});return register(lds,wireService,factory(lds,{namespace,classname,method,isContinuation}),identifier);};const adsBridge=new AdsBridge(lds);const getRecordNotifyChange=throttle(60,60000,notifyChangeFactory(lds),{allowFunction:incrementGetRecordNotifyChangeAllowCount,dropFunction:incrementGetRecordNotifyChangeDropCount});/** Apex exports */const getApexInvoker$1=getApexInvoker;// version: 0.1.10-3dfe453

    const apexInvoker = getApexInvoker$1("", "AccountDataService", "getAccounts", false);

    class AccountSearchForm extends navigation.NavigationMixin(lwc.LightningElement) {
      constructor(...args) {
        super(...args);
        this.selectedAccountId = '';
        this.error = undefined;
        this.searchAccount = void 0;
      }

      // Wire a custom Apex method
      Accounts({
        error,
        data
      }) {
        if (data) {
          this.searchAccount = data.map(account => {
            return {
              label: account.Name,
              value: account.Id
            };
          });
          this.searchAccount.unshift({
            label: 'All Accounts',
            value: ''
          });
        } else if (error) {
          this.searchOptions = undefined;
          this.error = error;
        }
      }

      createNewAccount() {
        this[navigation.NavigationMixin.Navigate]({
          type: 'standard__objectPage',
          attributes: {
            objectApiName: 'Account',
            actionName: 'new'
          }
        });
      }

    }

    lwc.registerDecorators(AccountSearchForm, {
      wire: {
        Accounts: {
          adapter: apexInvoker,
          method: 1
        }
      },
      track: {
        selectedAccountId: 1,
        error: 1,
        searchAccount: 1
      }
    });

    var accountSearchForm = lwc.registerComponent(AccountSearchForm, {
      tmpl: _tmpl$d
    });

    return accountSearchForm;

});
