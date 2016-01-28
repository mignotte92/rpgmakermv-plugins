/*:
 * @plugindesc 会心の計算式を変更します。
 * @author FAL
 * @version 0.1
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 */

var Imported = Imported || {};
Imported.FAL_会心の計算の変更 = true;

(function() {
    
    Game_Action.prototype.applyCritical = function(damage) {
        return damage * 2; // default *3
    }
    
})();
