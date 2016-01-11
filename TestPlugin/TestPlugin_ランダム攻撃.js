/*:
 * @plugindesc <Random Repeats Attack: x to y>で1体にx～y回攻撃。
 * 範囲をランダムにした上で<Random Targets: x to y>でx～y回ランダム対象攻撃。
 * @author FAL
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 */

var Imported = Imported || {};
Imported.TestPlugin_ランダム攻撃 = true;

var FAL = FAL || {};

FAL.FormatRandomAttackAtoZ = /\s*(\d+)(?: to )(\d+)\s*/;

(function() {
    
    // ランダム回数攻撃
    var _Game_Action_numRepeats = Game_Action.prototype.numRepeats;
    Game_Action.prototype.numRepeats = function() {
        var repeats = _Game_Action_numRepeats.call(this);
        
        var metaTagRepeatsAttack = this.item().meta['Random Repeats Attack'];
        if (metaTagRepeatsAttack) {
            var match = FAL.FormatRandomAttackAtoZ.exec(metaTagRepeatsAttack);
            if (match) {
                var minRepeats = parseInt(match[1]);
                var maxRepeats = parseInt(match[2]);
                if (minRepeats > 0 && maxRepeats >= minRepeats) {
                    repeats = minRepeats + Math.randomInt(maxRepeats - minRepeats + 1);
                }
            }
        }
        
        return repeats;
    }
    
    // N回ランダム対象攻撃
    var _Game_Action_numTargets = Game_Action.prototype.numTargets;
    Game_Action.prototype.numTargets = function() {
        var targets = _Game_Action_numTargets.call(this);
        
        var metaTagRandomTargets = this.item().meta['Random Targets'];
        if (metaTagRandomTargets) {
            var match = FAL.FormatRandomAttackAtoZ.exec(metaTagRandomTargets);
            if (match) {
                var minTargets = parseInt(match[1]);
                var maxTargets = parseInt(match[2]);
                if (minTargets > 0 && maxTargets >= minTargets) {
                    targets = minTargets + Math.randomInt(maxTargets - minTargets + 1);
                }
            }
        }
        
        return targets;
    }
    
})();
