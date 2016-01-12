/*:
 * @plugindesc スキルの範囲と連続回数にランダム性を導入します。
 * @author FAL
 * @version 0.1
 * 
 * @help このプラグインにはプラグインコマンドはありません。
 * =========================================================
 * 
 * 既存のままでは範囲は敵1体のランダムや、発動連続回数は9回までしか設定できません。
 * このプラグインでは範囲を2～4体のランダム対象にしたり、スキルの発動回数自体を
 * 2～5回のランダムにしたり出来るようになります。
 * 
 * ＜使い方＞
 * スキルのメモ欄に以下のタグを記述してください。
 * 　　<Random Repeats Attack: x to y>　1体にx～y回攻撃
 * 　　<Random Targets: x to y>　x～y回ランダム対象攻撃
 * 　　　　　　　　　　　　　　　　範囲をランダムのどれかに指定する必要があります。
 * 　　<Random Friends: x to y>　x～y回ランダム味方対象
 * 　　　　　　　　　　　　　　　　範囲を味方全体にする必要があります。
 * 
 * =========================================================
 */

var Imported = Imported || {};
Imported.FAL_ランダム攻撃 = true;

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
    
    // 味方ランダム対象
    var _Game_Action_targetsForFriends = Game_Action.prototype.targetsForFriends;
    Game_Action.prototype.targetsForFriends = function() {
        var targets = _Game_Action_targetsForFriends.call(this);
        
        var metaTagRandomFriends = this.item().meta['Random Friends'];
        if (this.isForAll() && metaTagRandomFriends) {
            var match = FAL.FormatRandomAttackAtoZ.exec(metaTagRandomFriends);
            if (match) {
                var minFriends = parseInt(match[1]);
                var maxFriends = parseInt(match[2]);
                if (minFriends > 0 && maxFriends >= minFriends) {
                    var targetsCnt = minFriends + Math.randomInt(maxFriends - minFriends + 1);
                    targets = [];
                    var unit = this.friendsUnit();
                    for (var i = 0; i < targetsCnt; i++) {
                        targets.push(unit.randomTarget());
                    }
                }
            }
        }
        
        return targets;
    }
})();
