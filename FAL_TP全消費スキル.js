/*:
 * @plugindesc TPを今ある量全部消費するスキルを実装します
 * @author FAL
 * @version 0.1
 *
 * @help このプラグインにはプラグインコマンドはありません。
 * =========================================================
 * 
 * スキルのメモ欄に<Consume All Tp>と書くことでスキルがTP全消費型になります。
 * ダメージ計算で消費したTP値を参照したいときは a.consumedTp と書いてください。
 * 
 * =========================================================
 *
 */

var Imported = Imported || {};
Imported.FAL_TP全消費スキル = true;

(function() {
    
    var _Game_Actor_skillTpCost = Game_Actor.prototype.skillTpCost;
    Game_Actor.prototype.skillTpCost = function(skill) {
        var tpCost = _Game_Actor_skillTpCost.call(this, skill);
        if (skill.meta['Consume All Tp']) {
            tpCost = this.tp;
        }
        this.consumedTp = tpCost;
        return tpCost;
    }
    
})();
