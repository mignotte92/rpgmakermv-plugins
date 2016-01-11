/*:
 * @plugindesc 盾によるブロック発生、およびダメージ減少を実装します。
 * オプションで武器によるブロックも追加できます。
 * @author FAL
 *
 * @help このプラグインにはプラグインコマンドはありません。
 * 盾のメモ欄に <Block Rate: x> (xは0~1の少数)と書いてください。
 *
 * @param Allow Weapon Block
 * @desc 武器ブロックを許可するかどうか。
 * @default false
 * 
 */

var Imported = Imported || {};
Imported.TestPlugin_盾ブロック = true;

var FAL = FAL || {};

FAL.Parameters = PluginManager.parameters('TestPlugin_盾ブロック');
FAL.Param = FAL.Param || {};

FAL.Param.isDoWeaponBlock = FAL.Parameters['Allow Weapon Block'] === 'true';

(function() {
    
    var _Game_Action_applyGuard = Game_Action.prototype.applyGuard;
    Game_Action.prototype.applyGuard = function(damage, target) {
        var guardedDamage = _Game_Action_applyGuard.call(this, damage, target);
        
        if (damage > 0 && !target.isGuard() && target.isActor() && target.isBlock()) {
            guardedDamage = damage / (2 * target.grd);
        }
        
        return guardedDamage;
    }
    
    Game_Actor.prototype.isBlock = function() {
        var equips = this.equips();
        for (var i = 0; i < equips.length; i++) {
            if (equips[i] && (equips[i].etypeId === 2 || (FAL.Param.isDoWeaponBlock && equips[i].etypeId === 1))) {
                var metaTag = equips[i].meta['Block Rate'];
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
    
})();
