/*:
 * @plugindesc 盾によるブロック発生、およびダメージ減少を実装します。
 * オプションで武器によるブロックも追加できます。
 * @author FAL
 *
 * @help このプラグインにはプラグインコマンドはありません。
 * 盾のメモ欄に <Physical Block Rate: x> (xは0~1の少数)で物理と必中へのブロック率、
 * <Magical Block Rate: x> (xは0~1の少数)で魔法へのブロック率となります。
 *
 * @param Allow Weapon Block
 * @desc 武器ブロックを許可するかどうか。
 * @default false
 * 
 */

var Imported = Imported || {};
Imported.TestPlugin_盾ブロック_物魔区別 = true;

var FAL = FAL || {};

FAL.Parameters = PluginManager.parameters('TestPlugin_盾ブロック_物魔区別');
FAL.Param = FAL.Param || {};

FAL.Param.isDoWeaponBlock = FAL.Parameters['Allow Weapon Block'] === 'true';

(function() {
    
    var _Game_Action_applyGuard = Game_Action.prototype.applyGuard;
    Game_Action.prototype.applyGuard = function(damage, target) {
        var guardedDamage = _Game_Action_applyGuard.call(this, damage, target);
        
        if (damage > 0 && !target.isGuard() && target.isActor()) {
            var isBlocked = false;
            if (this.isMagical()) {
                isBlocked = target.isMagicalBlock();
            } else {
                isBlocked = target.isPhysicalBlock();
            }
            if (isBlocked) guardedDamage = damage / (2 * target.grd);
        }
        
        return guardedDamage;
    }
    
    Game_Actor.prototype.isBlock = function(initialMetaTag) {
        var equips = this.equips();
        for (var i = 0; i < equips.length; i++) {
            if (equips[i] && (equips[i].etypeId === 2 || (FAL.Param.isDoWeaponBlock && equips[i].etypeId === 1))) {
                var metaTag = equips[i].meta[initialMetaTag + ' Block Rate'];
                if (metaTag) {
                    var blockRate = parseFloat(metaTag);
                    if (Math.random() < blockRate) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    Game_Actor.prototype.isPhysicalBlock = function() {
        return this.isBlock('Physical');
    }
    
    Game_Actor.prototype.isMagicalBlock = function() {
        return this.isBlock('Magical');
    }
    
})();
