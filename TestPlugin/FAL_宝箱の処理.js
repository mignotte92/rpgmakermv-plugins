/*:
 * @plugindesc 
 * @author FAL
 * @version 0.1
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 * @param 
 * @desc 
 * @default 
 * 
 */

var Imported = Imported || {};
Imported.FAL_宝箱の処理 = true;

var FAL = FAL || {};

FAL.Parameters = PluginManager.parameters('FAL_宝箱の処理');
FAL.Param = FAL.Param || {};

FAL.Param.name = Number(FAL.Parameters['']);

(function() {
    
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        if (command === 'GetItem') {
            console.log(BattleManager._action);
        }
        
        _Game_Interpreter_pluginCommand.call(this, command, args);
    }
    
})();
