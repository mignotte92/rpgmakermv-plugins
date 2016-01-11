/*:
 * @plugindesc 装備のメモ欄に<Passive State: x>と記入してください。
 * @author fal
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 */

(function() {
    
    var _Game_Actor_onBattleStart = Game_Actor.prototype.onBattleStart;
    Game_Actor.prototype.onBattleStart = function() {
        _Game_Actor_onBattleStart.call(this);
        
        var equips = this.equips();
        for (var i = 0; i < equips.length; i++) {
            if (equips[i]) {
                var stateId = equips[i].meta['Passive State'];
                if (stateId) {
                    this.addState(parseInt(stateId));
                }
            }
        }
    }
    
})();
