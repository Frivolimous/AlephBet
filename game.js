var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var FlashMode;
(function (FlashMode) {
    FlashMode[FlashMode["STANDARD"] = 0] = "STANDARD";
    FlashMode[FlashMode["QUICK"] = 1] = "QUICK";
    FlashMode[FlashMode["DELAYED"] = 2] = "DELAYED";
    FlashMode[FlashMode["DOUBLE"] = 3] = "DOUBLE";
})(FlashMode || (FlashMode = {}));
var ObjectType;
(function (ObjectType) {
    ObjectType[ObjectType["BASIC"] = 0] = "BASIC";
})(ObjectType || (ObjectType = {}));
var ObjectManager = (function () {
    function ObjectManager(_stage) {
        var _this = this;
        this.objects = [];
        this.updateAll = function () {
            for (var i = 0; i < _this.objects.length; i += 1) {
                if (_this.objects[i].toRemove) {
                    _this.removeObjectAt(i);
                    i -= 1;
                }
                else {
                    _this.objects[i].update();
                }
            }
        };
        this.stage = _stage;
    }
    ObjectManager.prototype.numObjects = function () {
        return this.objects.length;
    };
    ObjectManager.prototype.getObjectAt = function (i) {
        return this.objects[i];
    };
    ObjectManager.prototype.getObjectIndex = function (_object) {
        for (var i = 0; i < this.objects.length; i += 1) {
            if (this.objects[i] == _object) {
                return i;
            }
        }
    };
    ObjectManager.prototype.addObject = function (_object) {
        this.stage.addChildAt(_object, 0);
        this.objects.push(_object);
        return _object;
    };
    ObjectManager.prototype.removeObject = function (_object) {
        return this.removeObjectAt(this.getObjectIndex(_object));
    };
    ObjectManager.prototype.removeObjectAt = function (i) {
        var _object = this.objects[i];
        if (_object.parent != null)
            _object.parent.removeChild(_object);
        this.objects.splice(i, 1);
        return _object;
    };
    ObjectManager.prototype.getClosestObject = function (point, maxDist, filter) {
        if (filter === void 0) { filter = null; }
        var m = null;
        var _distance = maxDist * maxDist;
        var _distance2 = 0;
        for (var i = 0; i < this.objects.length; i += 1) {
            if (filter != null && filter == this.objects[i])
                continue;
            if (!this.objects[i].interactive)
                continue;
            _distance2 = this.objects[i].getDistance(point);
            if (_distance2 <= _distance) {
                _distance = _distance2;
                m = this.objects[i];
            }
        }
        return m;
    };
    ObjectManager.prototype.removeAll = function () {
        while (this.objects.length > 0) {
            this.removeObjectAt(0);
        }
    };
    ObjectManager.prototype.forEach = function (_function) {
        for (var i = 0; i < this.objects.length; i += 1) {
            _function.call(this.objects[i]);
        }
    };
    return ObjectManager;
}());
var GameObject = (function (_super) {
    __extends(GameObject, _super);
    function GameObject(_texture) {
        if (_texture === void 0) { _texture = null; }
        var _this = _super.call(this, _texture) || this;
        _this.baseTint = 0xffffff;
        _this.goal = new PIXI.Point(0, 0);
        _this.eventRegisters = [];
        _this.type = ObjectType.BASIC;
        _this.offset = new PIXI.Point(0, 0);
        _this.moving = false;
        _this.draggable = true;
        _this.clickable = true;
        _this.toRemove = false;
        _this.update = function () {
            var _static = true;
            if (_this.x != _this.goal.x + _this.offset.x) {
                var diff = _this.goal.x + _this.offset.x - _this.x;
                if (Math.abs(diff) < 1)
                    _this.x = _this.goal.x + _this.offset.x;
                else
                    _this.x += diff * GameObject.tweenSpeed;
                _static = false;
                _this.moving = true;
            }
            if (_this.y != _this.goal.y + _this.offset.y) {
                var diff = _this.goal.y + _this.offset.y - _this.y;
                if (Math.abs(diff) < 1)
                    _this.y = _this.goal.y + _this.offset.y;
                else
                    _this.y += diff * GameObject.tweenSpeed;
                _static = false;
                _this.moving = true;
            }
            if (_static && _this.moving) {
                _this.moving = false;
                _this.publishEvent(ObjectEvent.END_TWEEN, new JME_TweenEnd(_this));
            }
        };
        _this.interactive = true;
        _this.buttonMode = true;
        return _this;
    }
    GameObject.prototype.addEventListener = function (_type, _function, _once) {
        if (_once === void 0) { _once = false; }
        if (this.eventRegisters[_type] == null)
            this.eventRegisters[_type] = new JMERegister(_type);
        if (_once) {
            this.eventRegisters[_type].once.push(_function);
        }
        else {
            this.eventRegisters[_type].listeners.push(_function);
        }
    };
    GameObject.prototype.publishEvent = function (_type, _par) {
        if (this.eventRegisters[_type] != null)
            JME.publishSelfEvent(this.eventRegisters[_type], _par);
    };
    GameObject.prototype.setTint = function (_color) {
        this.baseTint = _color;
        this.tint = _color;
    };
    GameObject.prototype.getDistance = function (p) {
        var dX = p.x - this.goal.x - this.offset.x;
        var dY = p.y - this.goal.y - this.offset.y;
        if (dX > this.width)
            dX -= this.width;
        else if (dX > 0)
            dX = 0;
        if (dY > this.height)
            dY -= this.height;
        else if (dY > 0)
            dY = 0;
        return Math.sqrt(dX * dX + dY * dY);
    };
    GameObject.prototype.goto = function (x, y) {
        this.goal.set(x, y);
        this.x = x + this.offset.x;
        this.y = y + this.offset.y;
    };
    GameObject.prototype.tweenTo = function (x, y, _output) {
        if (_output === void 0) { _output = null; }
        this.goal.set(x, y);
        if (_output != null) {
            this.addEventListener(ObjectEvent.END_TWEEN, _output, true);
        }
    };
    Object.defineProperty(GameObject.prototype, "tweening", {
        get: function () {
            if (this.goal.x != this.x || this.goal.y != this.y)
                return true;
            return false;
        },
        enumerable: true,
        configurable: true
    });
    GameObject.prototype.select = function (b) {
        if (b === void 0) { b = true; }
        if (b) {
        }
        else {
        }
    };
    GameObject.prototype.dispose = function () {
        this.toRemove = true;
    };
    GameObject.prototype.onWheel = function (_delta) {
    };
    GameObject.prototype.colorFlash = function (_color, _mode) {
        if (_color === void 0) { _color = -1; }
        if (_mode === void 0) { _mode = FlashMode.STANDARD; }
        if (_color < 0)
            _color = 0xff0000;
        switch (_mode) {
            case FlashMode.QUICK:
                JMBL.tweenColor(this, 4, { tint: _color }, function () {
                    JMBL.tweenColor(this, 6, { delay: 10, tint: this.baseTint });
                });
                break;
            case FlashMode.STANDARD:
                JMBL.tweenColor(this, 8, { tint: _color }, function () {
                    JMBL.tweenColor(this, 12, { delay: 20, tint: this.baseTint });
                });
                break;
            case FlashMode.DOUBLE:
                JMBL.tweenColor(this, 1, { tint: _color }, function () {
                    JMBL.tweenColor(this, 4, { tint: this.baseTint }, function () {
                        JMBL.tweenColor(this, 5, { delay: 4, tint: _color }, function () {
                            JMBL.tweenColor(this, 12, { delay: 14, tint: this.baseTint });
                        });
                    });
                });
                break;
            case FlashMode.DELAYED:
                JMBL.tweenColor(this, 7, { delay: 32, tint: _color }, function () {
                    JMBL.tweenColor(this, 10, { delay: 25, tint: this.baseTint });
                });
                break;
        }
    };
    GameObject.tweenSpeed = 0.3;
    return GameObject;
}(PIXI.Sprite));
var GameManager = (function () {
    function GameManager(_app) {
        var _this = this;
        this.gameStage = new PIXI.Sprite();
        this.step = 0;
        this.onClick = function (e) {
            var self = _this;
            if (_this.step == 0) {
                var _object = new AlephObject;
                facade.game.objects.addObject(_object);
                _object.goto(e.mouse.x, e.mouse.y);
                var sound = new Audio("assets/Aleph.m4a");
                sound.play();
                _this.step = 1;
            }
            else if (_this.step == 1) {
                _this.step = -1;
                var _object = _this.objects.getObjectAt(0);
                JMBL.tweenColor(_object, 5, { tint: 0xff8888 }, function () { JMBL.tweenColor(this, 5, { delay: 100, tint: 0xcc55cc }, function () { self.step = 2; }); });
                var sound = new Audio("assets/PinkPurple.m4a");
                sound.play();
            }
            else if (_this.step == 2) {
                var _object_1 = _this.objects.getObjectAt(0);
                _object_1.colorFlash(0x00ff00);
                JMBL.tweenWait(_object_1, 30, function () { JMBL.tweenTo(this, 20, { alpha: 0 }, function () { _object_1.dispose(); }); });
                _this.step = 0;
                var sound = new Audio("assets/GoodJob.m4a");
                sound.play();
            }
            else {
            }
        };
        this.app = _app;
        this.app.stage.addChild(this.gameStage);
        this.objects = new ObjectManager(this.gameStage);
        var self = this;
        this.app.ticker.add(function () { self.onTick(); });
        JME.addEventListener(EventType.MOVE_EVENT, this.onMouseMove);
        JME.addEventListener(EventType.CLICK_EVENT, this.onClick);
        JME.addEventListener(EventType.DRAG_EVENT, this.onDrag);
    }
    GameManager.prototype.clearGame = function () {
    };
    GameManager.prototype.loadGame = function (_levelData) {
    };
    GameManager.prototype.onTick = function () {
        this.objects.updateAll();
    };
    GameManager.prototype.onMouseMove = function (e) {
        var _drag = e.mouse.drag;
        if (_drag != null && !e.mouse.timerRunning) {
            _drag.tweenTo(e.mouse.x, e.mouse.y);
        }
    };
    GameManager.prototype.onDrag = function (e) {
        facade.game.onMouseMove(e);
    };
    GameManager.prototype.startDrag = function () {
    };
    GameManager.prototype.endDrag = function () {
    };
    GameManager.prototype.clearSelection = function () {
    };
    return GameManager;
}());
var ObjectType;
(function (ObjectType) {
    ObjectType[ObjectType["SECOND"] = 1] = "SECOND";
})(ObjectType || (ObjectType = {}));
var CircleObject = (function (_super) {
    __extends(CircleObject, _super);
    function CircleObject() {
        var _this = _super.call(this, TextureData.circle) || this;
        _this.setTint(0x0000ff);
        _this.offset.set(-_this.width / 2, -_this.height / 2);
        return _this;
    }
    return CircleObject;
}(GameObject));
var SquareObject = (function (_super) {
    __extends(SquareObject, _super);
    function SquareObject() {
        var _this = _super.call(this, TextureData.square) || this;
        _this.setTint(0x008850);
        _this.offset.set(-_this.width / 2, -_this.height / 2);
        return _this;
    }
    return SquareObject;
}(GameObject));
var AlephObject = (function (_super) {
    __extends(AlephObject, _super);
    function AlephObject() {
        var _this = _super.call(this, hebrewLetters.aleph) || this;
        _this.setTint(0xff0000);
        _this.offset.set(-_this.width / 4, -_this.height / 4);
        _this.scale.x = 0.5;
        _this.scale.y = 0.5;
        return _this;
    }
    return AlephObject;
}(GameObject));
var TextureData = (function () {
    function TextureData() {
    }
    TextureData.init = function (_renderer) {
        var _graphic = new PIXI.Graphics;
        _graphic.beginFill(0xffffff);
        _graphic.drawCircle(-25, -25, 25);
        this.circle = _renderer.generateTexture(_graphic);
        _graphic.clear();
        _graphic.beginFill(0xffffff);
        _graphic.drawRect(0, 0, 50, 50);
        this.square = _renderer.generateTexture(_graphic);
    };
    return TextureData;
}());
var hebrewLetters = {
    aleph: PIXI.Texture.fromImage("assets/white_aleph.png", , 1, 1),
};
var CONFIG = (function () {
    function CONFIG() {
    }
    CONFIG.INIT = {
        STAGE_WIDTH: 800,
        STAGE_HEIGHT: 500,
        RESOLUTION: 2,
        BACKGROUND_COLOR: 0,
        MOUSE_HOLD: 200,
    };
    return CONFIG;
}());
var Facade = (function () {
    function Facade() {
        var _this = this;
        this.interactionMode = "desktop";
        this._Resolution = CONFIG.INIT.RESOLUTION;
        this.windowToLocal = function (e) {
            return new PIXI.Point(e.x + _this.stageBorders.x, e.y + _this.stageBorders.y);
        };
        if (Facade.exists)
            throw "Cannot instatiate more than one Facade Singleton.";
        Facade.exists = true;
        try {
            document.createEvent("TouchEvent");
            this.interactionMode = "mobile";
        }
        catch (e) {
        }
        this.stageBorders = new JMBL_Rect(0, 0, CONFIG.INIT.STAGE_WIDTH / this._Resolution, CONFIG.INIT.STAGE_HEIGHT / this._Resolution);
        this.app = new PIXI.Application(this.stageBorders.width, this.stageBorders.height, {
            backgroundColor: 0xff0000,
            antialias: true,
            resolution: this._Resolution,
            roundPixels: true,
        });
        document.getElementById("game-canvas").append(this.app.view);
        this.stageBorders.width *= this._Resolution;
        this.stageBorders.height *= this._Resolution;
        this.app.stage.scale.x = 1 / this._Resolution;
        this.app.stage.scale.y = 1 / this._Resolution;
        this.stageBorders.x = this.app.view.offsetLeft;
        this.stageBorders.y = this.app.view.offsetTop;
        this.app.stage.interactive = true;
        var _background = new PIXI.Graphics();
        _background.beginFill(CONFIG.INIT.BACKGROUND_COLOR);
        _background.drawRect(0, 0, this.stageBorders.width, this.stageBorders.height);
        this.app.stage.addChild(_background);
        var self = this;
        TextureData.init(this.app.renderer);
        window.setTimeout(function () { self.init(); }, 10);
    }
    Facade.prototype.disableGameInput = function (b) {
        if (b === void 0) { b = true; }
        if (b) {
            this.inputM.mouseEnabled = false;
        }
        else {
            this.inputM.mouseEnabled = true;
        }
    };
    Facade.prototype.init = function () {
        JME.init(this.app.ticker);
        this.game = new GameManager(this.app);
        this.inputM = new InputManager(this.app, this.game.objects);
    };
    Facade.exists = false;
    return Facade;
}());
var facade;
function initialize_game() {
    facade = new Facade();
}
var InputManager = (function () {
    function InputManager(app, objects) {
        this.mouseEnabled = true;
        var self = this;
        this.mouse = new MouseObject();
        this.app = app;
        this.objects = objects;
        window.addEventListener("keydown", function (e) { self.onKeyDown(e); });
        window.addEventListener("keyup", function (e) { self.onKeyUp(e); });
        app.stage.on("pointerdown", function (e) { self.onMouseDown(e); });
        app.stage.on("pointermove", function (e) { self.onMouseMove(e); });
        window.addEventListener("wheel", function (e) { self.onWheel(e); });
        if (facade.interactionMode == "desktop") {
            window.addEventListener("pointerup", function (e) { self.onMouseUp(e); });
        }
        else {
            window.addEventListener("touchend", function (e) { self.onMouseUp(e); });
        }
    }
    InputManager.prototype.onWheel = function (e) {
        var _object = this.objects.getClosestObject(this.mouse, 0);
        if (_object != null && _object.onWheel != null) {
            _object.onWheel(e.deltaY);
        }
    };
    InputManager.prototype.onMouseDown = function (e) {
        var _mouse = this.mouse;
        _mouse.set(e.data.global.x / this.app.stage.scale.x, e.data.global.y / this.app.stage.scale.y);
        _mouse.down = true;
        if (!this.mouseEnabled)
            return;
        if (_mouse.timerRunning)
            return;
        _mouse.drag = this.objects.getClosestObject(_mouse, 0);
        if (_mouse.drag != null) {
            _mouse.timerRunning = true;
            if (_mouse.drag.clickable) {
                setTimeout(function () {
                    _mouse.timerRunning = false;
                    if (_mouse.drag != null) {
                        if (_mouse.drag.draggable)
                            JME.publishEvent(EventType.DRAG_EVENT, new JME_DragEvent(_mouse.clone(), true));
                    }
                }, CONFIG.INIT.MOUSE_HOLD);
            }
            else if (_mouse.drag.draggable) {
                JME.publishEvent(EventType.DRAG_EVENT, new JME_DragEvent(_mouse.clone(), true));
            }
        }
        else {
            _mouse.timerRunning = true;
            setTimeout(function () {
                _mouse.timerRunning = false;
            }, CONFIG.INIT.MOUSE_HOLD);
        }
    };
    InputManager.prototype.onMouseUp = function (e) {
        var _mouse = this.mouse;
        _mouse.down = false;
        if (_mouse.drag != null) {
            if (!_mouse.timerRunning) {
                _mouse.dragTarget = this.objects.getClosestObject(_mouse, 0, _mouse.drag);
                if (_mouse.drag.draggable)
                    JME.publishEvent(EventType.DRAG_EVENT, new JME_DragEvent(_mouse.clone(), false));
            }
            else {
                if (_mouse.drag.clickable)
                    JME.publishEvent(EventType.CLICK_EVENT, new JME_ClickEvent(_mouse.clone()));
            }
        }
        else {
            if (_mouse.timerRunning) {
                JME.publishEvent(EventType.CLICK_EVENT, new JME_ClickEvent(_mouse.clone()));
            }
        }
        _mouse.drag = null;
        _mouse.dragTarget = null;
    };
    InputManager.prototype.onMouseMove = function (e) {
        this.mouse.set(e.data.global.x / this.app.stage.scale.x, e.data.global.y / this.app.stage.scale.y);
        JME.publishEvent(EventType.MOVE_EVENT, new JME_MoveEvent(this.mouse));
    };
    InputManager.prototype.onKeyDown = function (e) {
        switch (e.key) {
            case "a":
            case "A": break;
        }
    };
    InputManager.prototype.onKeyUp = function (e) {
    };
    return InputManager;
}());
var MouseObject = (function (_super) {
    __extends(MouseObject, _super);
    function MouseObject() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.down = false;
        _this.timerRunning = false;
        return _this;
    }
    MouseObject.prototype.clone = function () {
        var m = new MouseObject();
        m.down = this.down;
        m.drag = this.drag;
        m.dragTarget = this.dragTarget;
        m.timerRunning = this.timerRunning;
        m.x = this.x;
        m.y = this.y;
        return m;
    };
    return MouseObject;
}(PIXI.Point));
var JMBL = (function () {
    function JMBL() {
    }
    JMBL.shallowClone = function (obj) {
        var m = {};
        for (var v in obj) {
            m[v] = obj[v];
        }
        return m;
    };
    JMBL.deepClone = function (obj) {
        if (Array.isArray(obj)) {
            var m = [];
            for (var i = 0; i < obj.length; i += 1) {
                m.push(this.deepClone(obj[i]));
            }
            return m;
        }
        else if (obj === Object(obj)) {
            var m = {};
            for (var v in obj) {
                m[v] = this.deepClone(obj[v]);
            }
            return m;
        }
        return obj;
    };
    JMBL.applyDefaultOptions = function (supplied, defaultOptions) {
        supplied = supplied || {};
        for (var v in defaultOptions) {
            supplied[v] = supplied[v] || defaultOptions[v];
        }
        return supplied;
    };
    JMBL.removeFromArray = function (_element, _array) {
        for (var i = 0; i < _array.length; i += 1) {
            if (_array[i] === _element) {
                _array.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    JMBL.tweenWait = function (_obj, _maxTicks, _function) {
        if (_function === void 0) { _function = null; }
        var ticks = 0;
        function _tickThis() {
            ticks += 1;
            if (ticks > _maxTicks) {
                facade.app.ticker.remove(_tickThis);
                if (_function != null)
                    _function.call(_obj);
            }
        }
        facade.app.ticker.add(_tickThis);
    };
    JMBL.tweenTo = function (_obj, maxTicks, par, _function) {
        if (_function === void 0) { _function = null; }
        if (par == null)
            return;
        var properties = {};
        var ticks = 0;
        for (var v in par) {
            if (v == "delay") {
                ticks = -par[v];
            }
            else {
                properties[v] = { start: _obj[v], end: par[v] };
            }
        }
        function _tickThis() {
            ticks += 1;
            if (ticks > maxTicks) {
                facade.app.ticker.remove(_tickThis);
                if (_function != null)
                    _function.call(_obj);
            }
            else if (ticks >= 0) {
                for (var v in properties) {
                    _obj[v] = properties[v].start + (properties[v].end - properties[v].start) / maxTicks * ticks;
                }
            }
        }
        facade.app.ticker.add(_tickThis);
    };
    JMBL.tweenFrom = function (_obj, maxTicks, par, _function) {
        if (_function === void 0) { _function = null; }
        if (par == null)
            return;
        var newPar = {};
        for (var v in par) {
            if (v == "delay") {
                newPar[v] = par[v];
            }
            else {
                newPar[v] = _obj[v];
                _obj[v] = par[v];
            }
        }
        JMBL.tweenTo(_obj, maxTicks, newPar, _function);
    };
    JMBL.tweenColor = function (_obj, maxTicks, par, _function) {
        if (_function === void 0) { _function = null; }
        if (par == null)
            return;
        var properties = {};
        var ticks = 0;
        for (var v in par) {
            if (v == "delay") {
                ticks = -par[v];
            }
            else {
                properties[v] = { start: _obj[v], end: par[v],
                    incR: Math.floor(par[v] / 0x010000) - Math.floor(_obj[v] / 0x010000),
                    incG: Math.floor((par[v] % 0x010000) / 0x000100) - Math.floor((_obj[v] % 0x010000) / 0x000100),
                    incB: Math.floor(par[v] % 0x000100) - Math.floor(_obj[v] % 0x000100),
                };
            }
        }
        function _tickThis() {
            ticks += 1;
            if (ticks > maxTicks) {
                facade.app.ticker.remove(_tickThis);
                if (_function != null)
                    _function.call(_obj);
            }
            else if (ticks >= 0) {
                for (var v in properties) {
                    _obj[v] = properties[v].start + Math.floor(properties[v].incR / maxTicks * ticks) * 0x010000 + Math.floor(properties[v].incG / maxTicks * ticks) * 0x000100 + Math.floor(properties[v].incB / maxTicks * ticks);
                }
            }
        }
        facade.app.ticker.add(_tickThis);
    };
    return JMBL;
}());
var JMBL_Rect = (function (_super) {
    __extends(JMBL_Rect, _super);
    function JMBL_Rect() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(JMBL_Rect.prototype, "left", {
        set: function (n) {
            this.width += this.x - n;
            this.x = n;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(JMBL_Rect.prototype, "right", {
        set: function (n) {
            this.width += n - this.right;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(JMBL_Rect.prototype, "top", {
        set: function (n) {
            this.height -= n - this.y;
            this.y = n;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(JMBL_Rect.prototype, "bot", {
        set: function (n) {
            this.height += n - this.top;
        },
        enumerable: true,
        configurable: true
    });
    return JMBL_Rect;
}(PIXI.Rectangle));
var DisplayState;
(function (DisplayState) {
    DisplayState[DisplayState["NORMAL"] = 0] = "NORMAL";
    DisplayState[DisplayState["DARKENED"] = 1] = "DARKENED";
    DisplayState[DisplayState["BLACKENED"] = 2] = "BLACKENED";
    DisplayState[DisplayState["GREYED"] = 3] = "GREYED";
    DisplayState[DisplayState["BRIGHTENED"] = 4] = "BRIGHTENED";
})(DisplayState || (DisplayState = {}));
var BoolPlus;
(function (BoolPlus) {
    BoolPlus[BoolPlus["False"] = 0] = "False";
    BoolPlus[BoolPlus["Enabled"] = 1] = "Enabled";
    BoolPlus[BoolPlus["Active"] = 2] = "Active";
})(BoolPlus || (BoolPlus = {}));
var JMBUI_BasicElement = (function (_super) {
    __extends(JMBUI_BasicElement, _super);
    function JMBUI_BasicElement(options) {
        var _this = _super.call(this) || this;
        _this.graphics = new PIXI.Graphics;
        options = options || {};
        _this.addChild(_this.graphics);
        if (options.width != null) {
            _this.graphics.beginFill(options.bgColor || 0x808080);
            if (options.rounding != null) {
                _this.graphics.drawRoundedRect(0, 0, options.width, options.height, options.rounding);
            }
            else {
                _this.graphics.drawRect(0, 0, options.width, options.height);
            }
            _this.graphics.alpha = options.alpha == null ? 1 : options.alpha;
        }
        _this.x = options.x || 0;
        _this.y = options.y || 0;
        if (options.label != null) {
            _this.label = new PIXI.Text(options.label, options.labelStyle || {});
            if (_this.label.width > _this.graphics.width * 0.9) {
                _this.label.width = _this.graphics.width * 0.9;
                _this.label.scale.y = _this.label.scale.x;
            }
            _this.label.x = (options.width - _this.label.width) / 2;
            _this.label.y = (options.height - _this.label.height) / 2;
            _this.addChild(_this.label);
        }
        return _this;
    }
    return JMBUI_BasicElement;
}(PIXI.Sprite));
var JMBUI_InteractiveElement = (function (_super) {
    __extends(JMBUI_InteractiveElement, _super);
    function JMBUI_InteractiveElement(options) {
        var _this = _super.call(this, options) || this;
        _this.setDisplayState = function (_state) {
            if (_this.displayState == _state)
                return;
            _this.displayState = _state;
            if (_this.overlay == null)
                _this.overlay = new PIXI.Graphics();
            _this.overlay.clear();
            switch (_state) {
                case DisplayState.DARKENED:
                    _this.overlay.beginFill(0);
                    _this.overlay.alpha = 0.5;
                    _this.overlay.drawRect(0, 0, _this.graphics.width, _this.graphics.height);
                    _this.addChild(_this.overlay);
                    break;
                case DisplayState.BLACKENED:
                    _this.overlay.beginFill(0);
                    _this.overlay.alpha = 0.8;
                    _this.overlay.drawRect(0, 0, _this.graphics.width, _this.graphics.height);
                    _this.addChild(_this.overlay);
                    break;
                case DisplayState.GREYED:
                    _this.overlay.beginFill(0x999999);
                    _this.overlay.alpha = 0.5;
                    _this.overlay.drawRect(0, 0, _this.graphics.width, _this.graphics.height);
                    _this.addChild(_this.overlay);
                    break;
                case DisplayState.BRIGHTENED:
                    _this.overlay.beginFill(0xffffff);
                    _this.overlay.alpha = 0.3;
                    _this.overlay.drawRect(0, 0, _this.graphics.width, _this.graphics.height);
                    _this.addChild(_this.overlay);
                    break;
                case DisplayState.NORMAL:
                default:
                    if (_this.overlay != null && _this.overlay.parent == _this) {
                        _this.removeChild(_this.overlay);
                    }
                    break;
            }
        };
        options = options || {};
        _this.interactive = true;
        if (options.downFunction != null) {
            _this.downFunction = options.downFunction;
            _this.on("pointerdown", _this.downFunction);
        }
        options.displayState = options.displayState || DisplayState.NORMAL;
        _this.setDisplayState(options.displayState);
        return _this;
    }
    return JMBUI_InteractiveElement;
}(JMBUI_BasicElement));
var JMBUI_Button = (function (_super) {
    __extends(JMBUI_Button, _super);
    function JMBUI_Button(options) {
        var _this = _super.call(this, JMBL.applyDefaultOptions(options, {
            x: 50, y: 50, width: 200, height: 50, bgColor: 0x8080ff,
        })) || this;
        _this.downOnThis = false;
        _this.disabled = false;
        _this.timeout = BoolPlus.Enabled;
        _this.output = options.output;
        _this.buttonMode = true;
        if (facade.interactionMode == "desktop") {
            _this.addListener("pointerover", function (e) {
                if (!_this.disabled)
                    _this.setDisplayState(DisplayState.DARKENED);
                facade.disableGameInput();
            });
            _this.addListener("pointerout", function (e) {
                if (!_this.disabled)
                    _this.setDisplayState(DisplayState.NORMAL);
                _this.downOnThis = false;
                facade.disableGameInput(false);
            });
            _this.addListener("pointerdown", function (e) {
                if (!_this.disabled)
                    _this.setDisplayState(DisplayState.BRIGHTENED);
                _this.downOnThis = true;
                if (_this.timeout == BoolPlus.Enabled) {
                    _this.timeout = BoolPlus.Active;
                    window.setTimeout(function () { _this.timeout = BoolPlus.Enabled; }, CONFIG.INIT.MOUSE_HOLD);
                }
            });
            _this.addListener("pointerup", function (e) {
                if (!_this.disabled)
                    _this.setDisplayState(DisplayState.DARKENED);
                if (_this.downOnThis && !_this.disabled && _this.output != null && _this.timeout != BoolPlus.Enabled)
                    _this.output();
                _this.downOnThis = false;
            });
        }
        else {
            _this.addListener("pointerup", function (e) {
                if (!_this.disabled && _this.output != null)
                    _this.output();
            });
        }
        return _this;
    }
    JMBUI_Button.prototype.disable = function (b) {
        if (b === void 0) { b = true; }
        this.disabled = b;
        if (b) {
            this.setDisplayState(DisplayState.BLACKENED);
        }
        else {
            this.setDisplayState(DisplayState.NORMAL);
        }
    };
    return JMBUI_Button;
}(JMBUI_InteractiveElement));
var JMBUI_ClearButton = (function (_super) {
    __extends(JMBUI_ClearButton, _super);
    function JMBUI_ClearButton(options) {
        var _this = _super.call(this, JMBL.applyDefaultOptions(options, {
            bgColor: 0x00ff00,
            alpha: 0.01,
            width: 190,
            height: 50,
            x: 0,
            y: 0,
        })) || this;
        _this.buttonMode = true;
        return _this;
    }
    return JMBUI_ClearButton;
}(JMBUI_InteractiveElement));
var JMBUI_MaskedWindow = (function (_super) {
    __extends(JMBUI_MaskedWindow, _super);
    function JMBUI_MaskedWindow(options) {
        if (options === void 0) { options = null; }
        var _this = _super.call(this, options) || this;
        _this.mask = new PIXI.Graphics;
        _this.objects = [];
        _this.offsetY = 0;
        _this.goalY = 1;
        _this.scrollbar = null;
        _this.container = new PIXI.Sprite();
        _this.vY = 0;
        _this.sortMargin = 5;
        _this.dragging = false;
        _this.scrollHeight = 0;
        _this.addScrollbar = function (_scrollbar) {
            _this.scrollbar = _scrollbar;
            _scrollbar.output = _this.setScroll;
        };
        _this.onWheel = function (e) {
            var _point = facade.windowToLocal(e);
            if (_point.x > _this.x && _point.x < _this.x + _this.mask.width && _point.y > _this.y && _point.y < _this.y + _this.mask.height) {
                _this.vY -= e.deltaY * 0.008;
            }
        };
        _this.setScroll = function (p) {
            if (_this.scrollHeight > _this.mask.height) {
                _this.container.y = p * (_this.mask.height - _this.scrollHeight);
                if (_this.container.y > 0)
                    _this.container.y = 0;
                if (_this.container.y < _this.mask.height - _this.scrollHeight)
                    _this.container.y = _this.mask.height - _this.scrollHeight;
            }
            else {
                _this.container.y = 0;
            }
        };
        _this.getRatio = function () {
            return Math.min(1, _this.mask.height / _this.scrollHeight);
        };
        _this.update = function () {
            if (_this.goalY <= 0) {
                _this.vY = (_this.goalY - _this.container.y) / 4;
            }
            if (_this.vY != 0) {
                if (Math.abs(_this.vY) < 0.1)
                    _this.vY = 0;
                else {
                    var _y = _this.container.y + _this.vY;
                    _y = Math.min(0, Math.max(_y, _this.mask.height - _this.scrollHeight));
                    _this.vY *= 0.95;
                    if (_this.scrollbar != null)
                        _this.scrollbar.setPosition(_y / (_this.mask.height - _this.scrollHeight));
                    else
                        _this.setScroll(_y / (_this.mask.height - _this.scrollHeight));
                }
            }
        };
        _this.addObject = function (_object) {
            _this.objects.push(_object);
            _object.x -= _this.x - _this.container.x;
            _object.y -= _this.y - _this.container.y;
            _this.container.addChild(_object);
            if (_this.autoSort)
                _this.sortObjects();
        };
        _this.removeObject = function (_object) {
            for (var i = 0; i < _this.objects.length; i += 1) {
                if (_this.objects[i] == _object) {
                    _this.removeObjectAt(i);
                    return;
                }
            }
        };
        _this.removeObjectAt = function (i) {
            _this.container.removeChild(_this.objects[i]);
            _this.objects.splice(i, 1);
            if (_this.autoSort)
                _this.sortObjects();
        };
        _this.sortObjects = function () {
            _this.scrollHeight = _this.sortMargin;
            for (var i = 0; i < _this.objects.length; i += 1) {
                _this.objects[i].y = _this.scrollHeight;
                _this.objects[i].timeout = BoolPlus.Enabled;
                _this.objects[i].x = 0;
                _this.scrollHeight += _this.objects[i].graphics.height + _this.sortMargin;
            }
        };
        options = options || {};
        _this.addChild(_this.container);
        _this.addChild(_this.mask);
        _this.mask.beginFill(0);
        _this.mask.drawRect(0, 0, options.width || 50, options.height || 100);
        _this.autoSort = options.autoSort || false;
        _this.interactive = true;
        _this.sortMargin = options.sortMargin || 5;
        _this.addListener("pointerover", function (e) {
            facade.disableGameInput();
        });
        _this.addListener("pointerout", function (e) {
            facade.disableGameInput(false);
        });
        _this.addListener("pointerdown", function (e) {
            var _point = facade.windowToLocal(e.data.originalEvent);
            _this.offsetY = _point.y - _this.y - _this.container.y;
            _this.dragging = true;
        });
        window.addEventListener("pointerup", function (e) {
            _this.goalY = 1;
            _this.dragging = false;
        });
        JME.addEventListener(EventType.MOVE_EVENT, function (e) {
            if (_this.dragging) {
                var _y = e.mouse.y - _this.y - _this.offsetY;
                _this.goalY = e.mouse.y - _this.y - _this.offsetY;
                _this.vY = (_y - _this.container.y) / 4;
            }
        });
        JME.addToTicker(_this.update);
        window.addEventListener("wheel", _this.onWheel);
        return _this;
    }
    return JMBUI_MaskedWindow;
}(JMBUI_BasicElement));
var JMBUI_Scrollbar = (function (_super) {
    __extends(JMBUI_Scrollbar, _super);
    function JMBUI_Scrollbar(options) {
        var _this = _super.call(this, JMBL.applyDefaultOptions(options, {
            x: 100, y: 50, width: 10, height: 100, rounding: 5, bgColor: 0x404080,
        })) || this;
        _this.mover = new PIXI.Graphics();
        _this.topY = 0;
        _this.bottomY = 40;
        _this.offsetY = 0;
        _this.drawMover = function (p) {
            p = Math.min(1, Math.max(0, p));
            if (p >= 1)
                _this.visible = false;
            else
                _this.visible = true;
            _this.mover.clear();
            _this.mover.beginFill(_this.moverColor);
            _this.mover.drawRoundedRect(0, 0, _this.graphics.width, p * _this.graphics.height, _this.graphics.width / 2);
            _this.bottomY = _this.graphics.height - _this.mover.height;
        };
        _this.setPosition = function (p) {
            var _y = p * (_this.bottomY - _this.topY) + _this.topY;
            _this.mover.y = _y;
            if (_this.output != null)
                _this.output(p);
        };
        _this.getPosition = function () {
            return (_this.mover.y - _this.topY) / (_this.bottomY - _this.topY);
        };
        _this.startMove = function (e) {
            _this.offsetY = e.y - _this.y - _this.mover.y;
            _this.dragging = true;
        };
        _this.addChild(_this.mover);
        _this.output = options.output;
        _this.interactive = true;
        _this.buttonMode = true;
        _this.moverColor = options.moverColor || 0x333333;
        _this.ratio = options.ratio || 0.5;
        _this.drawMover(_this.ratio);
        _this.setPosition(options.position || 0);
        _this.addListener("pointerover", function (e) {
            facade.disableGameInput();
        });
        _this.addListener("pointerout", function (e) {
            facade.disableGameInput(false);
        });
        _this.addListener("pointerdown", function (e) {
            var _point = facade.windowToLocal(e.data.originalEvent);
            _this.offsetY = _point.y - _this.y - _this.mover.y;
            _this.dragging = true;
        });
        window.addEventListener("pointerup", function (e) {
            _this.dragging = false;
        });
        JME.addEventListener(EventType.MOVE_EVENT, function (e) {
            if (_this.dragging) {
                var _y = e.mouse.y - _this.y - _this.offsetY;
                _y = Math.max(_y, _this.topY);
                _y = Math.min(_y, _this.bottomY);
                _this.mover.y = _y;
                if (_this.output != null)
                    _this.output(_this.getPosition());
            }
        });
        return _this;
    }
    return JMBUI_Scrollbar;
}(JMBUI_BasicElement));
var EventType;
(function (EventType) {
    EventType[EventType["UI_SELECT_MODE"] = 0] = "UI_SELECT_MODE";
    EventType[EventType["DRAG_EVENT"] = 1] = "DRAG_EVENT";
    EventType[EventType["MOVE_EVENT"] = 2] = "MOVE_EVENT";
    EventType[EventType["MOUSE_DOWN"] = 3] = "MOUSE_DOWN";
    EventType[EventType["MOUSE_UP"] = 4] = "MOUSE_UP";
    EventType[EventType["CLICK_EVENT"] = 5] = "CLICK_EVENT";
    EventType[EventType["UI_CLICK_SKILL"] = 6] = "UI_CLICK_SKILL";
    EventType[EventType["UI_BUTTON_PRESS"] = 7] = "UI_BUTTON_PRESS";
})(EventType || (EventType = {}));
var ObjectEvent;
(function (ObjectEvent) {
    ObjectEvent[ObjectEvent["END_TWEEN"] = 0] = "END_TWEEN";
})(ObjectEvent || (ObjectEvent = {}));
var JME = (function () {
    function JME() {
    }
    JME.init = function (_ticker) {
        this.ticker = _ticker;
        _ticker.add(this.onTick.bind(this));
    };
    JME.addToTicker = function (_output) {
        this.ticker.add(_output);
    };
    JME.createRegister = function (_type, _log) {
        if (_log === void 0) { _log = false; }
        this.registers[_type] = new JMERegister(_type);
        if (_log)
            this.addEventListener(_type, JME.logEvent);
    };
    JME.addEventListener = function (_type, _function, _once) {
        if (_once === void 0) { _once = false; }
        if (this.registers[_type] == null)
            this.createRegister(_type);
        if (_once) {
            this.registers[_type].once.push(_function);
        }
        else {
            this.registers[_type].listeners.push(_function);
        }
    };
    JME.removeEventListener = function (_type, _function) {
        JMBL.removeFromArray(_function, this.registers[_type].listeners);
    };
    JME.publishEvent = function (_type, _par) {
        if (this.registers[_type] == null)
            this.createRegister(_type);
        this.registers[_type].events.push(_par);
        if (!this.registers[_type].active) {
            this.registers[_type].active = true;
            this.activeRegisters.push(this.registers[_type]);
        }
    };
    JME.publishSelfEvent = function (_register, _par) {
        _register.events.push(_par);
        if (!_register.active) {
            _register.active = true;
            this.activeRegisters.push(_register);
        }
    };
    JME.logEvent = function (e) {
        this.eventLog.push(e);
    };
    JME.traceEventLog = function () {
        console.log(this.eventLog);
    };
    JME.onTick = function () {
        while (this.activeRegisters.length > 0) {
            var _register = this.activeRegisters[0];
            while (_register.events.length > 0) {
                var _cEvent = _register.events[0];
                for (var i = 0; i < _register.listeners.length; i += 1) {
                    _register.listeners[i](_cEvent);
                }
                while (_register.once.length > 0) {
                    _register.once[0](_cEvent);
                    _register.once.shift();
                }
                _register.events.shift();
            }
            _register.active = false;
            this.activeRegisters.shift();
        }
    };
    JME.registers = [];
    JME.activeRegisters = [];
    JME.eventLog = [];
    return JME;
}());
var JMERegister = (function () {
    function JMERegister(_type) {
        this.listeners = [];
        this.once = [];
        this.events = [];
        this.active = false;
        this.type = _type;
    }
    return JMERegister;
}());
var JMEvent = (function () {
    function JMEvent() {
    }
    return JMEvent;
}());
var JME_UISelectModeEvent = (function (_super) {
    __extends(JME_UISelectModeEvent, _super);
    function JME_UISelectModeEvent(_mode) {
        var _this = _super.call(this) || this;
        _this.eventType = EventType.UI_SELECT_MODE;
        _this.mode = _mode;
        return _this;
    }
    return JME_UISelectModeEvent;
}(JMEvent));
var JME_MoveEvent = (function (_super) {
    __extends(JME_MoveEvent, _super);
    function JME_MoveEvent(_mouse) {
        var _this = _super.call(this) || this;
        _this.eventType = EventType.MOVE_EVENT;
        _this.mouse = _mouse;
        return _this;
    }
    return JME_MoveEvent;
}(JMEvent));
var JME_ClickEvent = (function (_super) {
    __extends(JME_ClickEvent, _super);
    function JME_ClickEvent(_mouse) {
        var _this = _super.call(this) || this;
        _this.eventType = EventType.CLICK_EVENT;
        _this.mouse = _mouse;
        return _this;
    }
    return JME_ClickEvent;
}(JMEvent));
var JME_DragEvent = (function (_super) {
    __extends(JME_DragEvent, _super);
    function JME_DragEvent(_mouse, _startDrag) {
        var _this = _super.call(this) || this;
        _this.eventType = EventType.DRAG_EVENT;
        _this.mouse = _mouse;
        _this.startDrag = _startDrag;
        return _this;
    }
    return JME_DragEvent;
}(JMEvent));
var JME_TweenEnd = (function (_super) {
    __extends(JME_TweenEnd, _super);
    function JME_TweenEnd(_target) {
        var _this = _super.call(this) || this;
        _this.eventType = ObjectEvent.END_TWEEN;
        _this.target = _target;
        return _this;
    }
    return JME_TweenEnd;
}(JMEvent));
