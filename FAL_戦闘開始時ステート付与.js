/*:
 * @plugindesc 戦闘開始時にステートを付与する装備を作れるようになります。
 * @author FAL
 * @version 0.1
 *
 * @help このプラグインにはプラグインコマンドはありません。
 * ========================================================
 * 
 * 武器と防具を装備しているだけで戦闘開始時に指定のステートが装備者に
 * 発動するようになります。
 * 武器と防具のメモ欄に<Passive Battle State: x>（xはステートID）と記入してください。
 * 
 * ========================================================
 *
 */

(function() {
    
    var _Game_Actor_onBattleStart = Game_Actor.prototype.onBattleStart;
    Game_Actor.prototype.onBattleStart = function() {
        _Game_Actor_onBattleStart.call(this);
        
        var equips = this.equips();
        for (var i = 0; i < equips.length; i++) {
            if (equips[i]) {
                var stateId = equips[i].meta['Passive Battle State'];
                if (stateId) {
                    this.addState(parseInt(stateId));
                }
            }
        }
    }
    
})();
