/*:
 * @plugindesc 戦闘中のアクターのコマンドを選択時にstartを押すと
 * ステートとバフのアイコン一覧が表示されます。
 * @author FAL
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 */

var Imported = Imported || {};
Imported.FAL_startでステート表示 = true;

(function() {
    
    /////////////////////////////////////////////////////
    //　selectボタンとstartボタンの定義
    Input.gamepadMapper[8] = 'select';
    Input.gamepadMapper[9] = 'start';
    
    /////////////////////////////////////////////////////
    //　戦闘中にステートを表示するウィンドウ
    function Window_BattleState() {
        this.initialize.apply(this, arguments);
    }
    
    Window_BattleState.prototype = Object.create(Window_Base.prototype);
    Window_BattleState.prototype.constructor = Window_BattleState;
    
    Window_BattleState.prototype.initialize = function() {
        var width = Graphics.boxWidth;
        var height = Graphics.boxHeight;
        var x = (Graphics.boxWidth - width) / 2;
        Window_Base.prototype.initialize.call(this, x, 0, width, height);
        this.close();
        this.hide();
        this.deactivate();
    }
    
    Window_BattleState.prototype.refresh = function() {
        this.contents.clear();
        this.drawPartyStates();
    }
    
    Window_BattleState.prototype.drawPartyStates = function() {
        var battleMembers = $gameParty.battleMembers();
        var drawPosY = 0;
        for (var i = 0; i < battleMembers.length; i++) {
            // キャラ名
            this.drawTextEx(battleMembers[i].name(), 0, drawPosY);
            drawPosY += 32;
            // ステート
            var actorStates = battleMembers[i].states();
            var posXPadding = 16;
            var drawPosX = posXPadding;
            for (j = 0; j < actorStates.length; j++) {
                var state = actorStates[j];
                if (state.iconIndex > 0) {
                    this.drawIcon(state.iconIndex, drawPosX, drawPosY);
                    drawPosX += 32;
                }
            }
            drawPosY += 32;
            // バフ
            var actorBuffIcons = battleMembers[i].buffIcons();
            drawPosX = posXPadding;
            for (var j = 0; j < actorBuffIcons.length; j++) {
                this.drawIcon(actorBuffIcons[j], drawPosX, drawPosY);
                drawPosX += 32;
            }
            drawPosY += 40;
        }
    }
    
    Window_BattleState.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        
        if (this.active) {
            if (this.isTriggered()) {
                Input.update();
                this.close();
                this.hide();
                this.deactivate();
            }
        }
    }
    
    Window_BattleState.prototype.isTriggered = function() {
        return (Input.isRepeated('ok') || Input.isRepeated('cancel') || TouchInput.isRepeated());
    }
    /////////////////////////////////////////////////////////////
    
    ////////////////////////////////////////////////////////////
    //　ウィンドウの生成とか
    Scene_Battle.prototype.createBattleStateWindow = function() {
        this._battleStateWindow = new Window_BattleState();
        this._battleStateWindow.height -= this._statusWindow.height;
        this._battleStateWindow.setBackgroundType(0);
        this.addWindow(this._battleStateWindow);
    }
    
    var _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
        _Scene_Battle_createAllWindows.call(this);
        this._actorCommandWindow.setHandler('start', this.openBattleStateWindow.bind(this));
        this.createBattleStateWindow();
    }
    
    Scene_Battle.prototype.openBattleStateWindow = function() {
        this._battleStateWindow.open();
        this._battleStateWindow.refresh();
        this._battleStateWindow.show();
        this._battleStateWindow.activate();
    }
    
    var _Scene_Battle_isAnyInputWindowActive = Scene_Battle.prototype.isAnyInputWindowActive;
    Scene_Battle.prototype.isAnyInputWindowActive = function() {
        return _Scene_Battle_isAnyInputWindowActive.call(this) || this._battleStateWindow.active;
    }
    
    var _Window_ActorCommand_processHandling = Window_ActorCommand.prototype.processHandling;
    Window_ActorCommand.prototype.processHandling = function() {
        _Window_ActorCommand_processHandling.call(this);
        
        if (this.isOpenAndActive()) {
            if (this.isHandled('start') && Input.isRepeated('start')) {
                this.updateInputData();
                this.deactivate();
                this.callHandler('start');
            }
        }
    }
    /////////////////////////////////////////////////////
    
    
})();
