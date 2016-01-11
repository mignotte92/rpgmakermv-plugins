/*:
 * @plugindesc スキルのメモ欄に<Consume All Tp>と書くことでスキルがTP全消費型になります。
 * ダメージ計算で消費したTP値を参照したいときは a.consumedTp と書いてください。
 * @author fal
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 */

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
