/*:
 * @plugindesc マップセレクトを実装します。
 * @author FAL
 * @version 0.1
 *
 * @help
 * ================================================================
 * 
 * マップセレクトを実装します。
 * 
 * ＜使い方＞
 * 　　１．マップを作る（これを原寸マップとする）
 * 　　２．マップを画像として保存で画像を作る
 * 　　３．作った画像を縮小して画面解像度に合わせる
 * 　　４．img/parallaxesにその画像を入れる
 * 　　５．新たにマップを作って遠景にその画像を設定する（これを縮小マップとする）
 * 　　６．縮小マップに下記イベントを作成する
 * 　　　　　　・トリガー：自動実行
 * 　　　　　　・実行内容：プラグインコマンドを以下の順で入力
 * 　　　　　　　　　ClearMapSelectPoint
 * 　　　　　　　　　AddMapSelectPoint name v x y を必要数
 * 　　　　　　　　　OpenMapSelectWindow v1 v2
 * 　　　　　　・ここに文章表示（※微妙なバグ、無いとうまく動かない）
 * 　　　　　　・OpenMapSelectWindowで設定した変数で場合分けして原寸マップの各地へ移動
 * 　　７．原寸マップから縮小マップへ移動するイベントを作る
 * 　　　（このイベントには SetMapSelectIndex で初期位置を指定してもいい）
 * 
 * ＜プラグインコマンド＞
 * 　　ClearMapSelectPoint
 * 　　　　　マップセレクトウィンドウで表示される選択肢をリセットする
 * 
 * 　　AddMapSelectPoint xxxx y z
 * 　　　　　新たなマップセレクトの選択肢を追加する
 * 　　　　　　　name: (文字列) 表示される名称
 * 　　　　　　　v: (整数) 選択された時に変数へ渡される数字
 * 　　　　　　　x: (整数) 縮小マップのX座標
 * 　　　　　　　y: (整数) 縮小マップのY座標
 * 
 * 　　OpenMapSelectWindow v1 v2
 * 　　　　　マップセレクトウィンドウを表示する
 * 　　　　　　　v1: (整数) AddMapSelectPointで設定した名称が格納される変数ID
 * 　　　　　　　v2: (整数) AddMapSelectPointで設定した数字が格納される変数ID
 * 
 * 　　SetMapSelectIndex
 * 　　　　　マップセレクトウィンドウを表示した時に選択されている選択肢
 * 
 * ================================================================
 * 
 */

var Imported = Imported || {};
Imported.FAL_マップセレクト = true;

var FAL = FAL || {};

FAL.Parameters = PluginManager.parameters('FAL_マップセレクト');
FAL.Param = FAL.Param || {};

FAL.Param.MapSelect = {};
FAL.Param.MapSelect.isMapSelect = false;
FAL.Param.MapSelect.items = [];
FAL.Param.MapSelect.nameSetVariableId = -1;
FAL.Param.MapSelect.symbolSetVariableId = -1;
FAL.Param.MapSelect.selectedIndex = 0;

(function() {
    
    function Window_MapSelect() {
        this.initialize.apply(this, arguments);
    }
    
    Window_MapSelect.prototype = Object.create(Window_Command.prototype);
    Window_MapSelect.prototype.constructor = Window_MapSelect;
    
    Window_MapSelect.prototype.initialize = function() {
        Window_Command.prototype.initialize.call(this, 0, 0);
        this.openness = 0;
        this.deactivate();
    }
    
    Window_MapSelect.prototype.windowWidth = function() {
        return Graphics.boxWidth / 2;
    }
    
    Window_MapSelect.prototype.maxCols = function() {
        return 1;
    }
    
    Window_MapSelect.prototype.numVisibleRows = function() {
        return 8;
    }
    
    Window_MapSelect.prototype.makeCommandList = function() {
        for (var i = 0; i < FAL.Param.MapSelect.items.length; i++) {
            this.addCommand(FAL.Param.MapSelect.items[i].name, FAL.Param.MapSelect.items[i].symbol, true);
        }
    }
    
    Window_MapSelect.prototype.processOk = function() {
        // ここに選択した時の処理
        $gameVariables.setValue(FAL.Param.MapSelect.nameSetVariableId, this.currentData().name);
        $gameVariables.setValue(FAL.Param.MapSelect.symbolSetVariableId, this.currentData().symbol);
        
        Window_Command.prototype.processOk.call(this);
        this.close();
        this.deactivate();
        FAL.Param.MapSelect.isMapSelect = false;
    }
    
    Window_MapSelect.prototype.start = function() {
        this.refresh();
        this.select(FAL.Param.MapSelect.selectedIndex);
        this.open();
        this.activate();
    }
    
    Window_MapSelect.prototype.processCursorMove = function() {
        Window_Selectable.prototype.processCursorMove.call(this);
        if (this.isCursorMovable()) {
            // ここにカーソル動かした時の処理
            var jumpX = FAL.Param.MapSelect.items[this.index()].pointX - $gamePlayer.x;
            var jumpY = FAL.Param.MapSelect.items[this.index()].pointY - $gamePlayer.y;
            if (jumpX !== 0 || jumpY !== 0) {
                $gamePlayer.jump(jumpX, jumpY);
            }
        }
    }
    
    var _Window_Message_subWindows = Window_Message.prototype.subWindows;
    Window_Message.prototype.subWindows = function() {
        var subWindows = _Window_Message_subWindows.call(this);
        subWindows.push(this._mapSelectWindow);
        return subWindows;
    }
    
    var _Window_Message_createSubWindows = Window_Message.prototype.createSubWindows;
    Window_Message.prototype.createSubWindows = function() {
        _Window_Message_createSubWindows.call(this);
        this._mapSelectWindow = new Window_MapSelect();
    }
    
    var _Window_Message_isAnySubWindowActive = Window_Message.prototype.isAnySubWindowActive;
    Window_Message.prototype.isAnySubWindowActive = function() {
        return (_Window_Message_isAnySubWindowActive.call(this) || this._mapSelectWindow.active);
    }
    
    var _Window_Message_startInput = Window_Message.prototype.startInput;
    Window_Message.prototype.startInput = function() {
        if (_Window_Message_startInput.call(this)) {
            return true;
        } else if ($gameMessage.isMapSelect()) {
            this._mapSelectWindow.start();
            return true;
        } else {
            return false;
        }
    }
    
    Game_Message.prototype.isMapSelect = function() {
        return FAL.Param.MapSelect.isMapSelect;
    }
    
    var _Game_Message_isBusy = Game_Message.prototype.isBusy;
    Game_Message.prototype.isBusy = function() {
        return _Game_Message_isBusy.call(this) || this.isMapSelect();
    }
    
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        if (command === 'OpenMapSelectWindow' && args.length === 2) {
            if (SceneManager._scene instanceof Scene_Map) {
                FAL.Param.MapSelect.isMapSelect = true;
                FAL.Param.MapSelect.nameSetVariableId = parseInt(args[0]);
                FAL.Param.MapSelect.symbolSetVariableId = parseInt(args[1]);
            }
        }
        
        if (command === 'AddMapSelectPoint' && args.length === 4) {
            var mapPoint = {
                'name' : args[0],
                'symbol' : parseInt(args[1]),
                'pointX' : parseInt(args[2]),
                'pointY' : parseInt(args[3])
            };
            FAL.Param.MapSelect.items.push(mapPoint);
        }
        
        if (command === 'ClearMapSelectPoint') {
            FAL.Param.MapSelect.items = [];
        }
        
        if (command === 'SetMapSelectIndex' && args.length === 1) {
            FAL.Param.MapSelect.selectedIndex = parseInt(args[0]) - 1;
        }
        
        _Game_Interpreter_pluginCommand.call(this, command, args);
    }
    
})();
