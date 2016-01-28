/*:
 * @plugindesc 自動で属性弱点を攻撃するスキルを実装します。
 * @author FAL
 * @version 0.1
 * 
 * @help このプラグインにはプラグインコマンドはありません。
 * ==========================================================
 * 
 * 自動で指定した属性のうち最もダメージ倍率の大きい属性で攻撃するスキルを作れます。
 * スキルのメモ欄に <Auto Element Weakness Attack: x, y, z, ......> と
 * 対象のチェックする属性IDを書き並べてください。
 * 
 * ==========================================================
 * 
 */

var Imported = Imported || {};
Imported.FAL_自動属性弱点攻撃 = true;

(function() {
    
    var _Game_Action_calcElementRate = Game_Action.prototype.calcElementRate;
    Game_Action.prototype.calcElementRate = function(target) {
        if (this.item().meta['Auto Element Weakness Attack']) {
            return this.item().meta['Auto Element Weakness Attack'].split(',').reduce(function(p, c) {
                return Math.max(target.elementRate(parseInt(c)), p);
            }, 1);
        } else {
            return _Game_Action_calcElementRate.call(this, target);
        }
    }
    
})();
