/*:
 * @plugindesc 
 * @author FAL
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 * @param 
 * @desc 
 * @default 
 * 
 */

(function() {
    
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        if (command === 'CommandTest') {
            console.log(BattleManager._action);
        }
        
        _Game_Interpreter_pluginCommand.call(this, command, args);
    }
    
})();
