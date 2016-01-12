/*:
 * @plugindesc 盾によるブロック発生、およびダメージ減少を実装します。
 * オプションで武器によるブロックも追加できます。
 * @author FAL
 * @version 0.1
 *
 * @help このプラグインにはプラグインコマンドはありません。
 * ========================================================
 * 防御した時と同じように盾や武器でダメージを減らす確率を追加します。
 * 
 * ＜使い方＞
 * 盾や武器のメモ欄に以下を記入してください。
 * 　　<Physical Block Rate: x> (xは0~1の小数)　物理と必中へのブロック率
 * 　　<Physical Block Mitigation: x> (xは0~1の小数)　そのダメージの減少率、0.8なら80%カット
 * 　　<Magical Block Rate: x> (xは0~1の小数)　魔法へのブロック率
 * 　　<Magical Block Mitigation: x> (xは0~1の小数)　そのダメージの減少率、0.8なら80%カット
 * 
 * ========================================================
 *
 * @param Allow Weapon Block
 * @desc 武器ブロックを許可するかどうか
 * @default false
 * 
 * @param Equip Type Weapon
 * @desc 武器の装備タイプID
 * @default 1
 * 
 * @param Equip Type Shield
 * @desc 盾の装備タイプID
 * @default 2
 * 
 */

var Imported = Imported || {};
Imported.FAL_盾ブロック = true;

var FAL = FAL || {};

FAL.Parameters = PluginManager.parameters('FAL_盾ブロック');
FAL.Param = FAL.Param || {};

FAL.Param.isDoWeaponBlock = FAL.Parameters['Allow Weapon Block'] === 'true';
FAL.Param.etypeW = Number(FAL.Parameters['Equip Type Weapon']);
FAL.Param.etypeS = Number(FAL.Parameters['Equip Type Shield']);

(function() {
    
    var _Game_Action_applyGuard = Game_Action.prototype.applyGuard;
    Game_Action.prototype.applyGuard = function(damage, target) {
        var guardedDamage = _Game_Action_applyGuard.call(this, damage, target);
        
        if (damage > 0 && !target.isGuard() && target.isActor()) {
            if (this.isMagical()) {
                guardedDamage = target.applyMagicalBlock(damage, target);
            } else {
                guardedDamage = target.applyPhysicalBlock(damage, target);
            }
        }
        
        return guardedDamage;
    }
    
    Game_Actor.prototype.applyBlock = function(initialMetaTag, damage, target) {
        var equips = this.equips();
        for (var i = 0; i < equips.length; i++) {
            if (equips[i] && (equips[i].etypeId === FAL.Param.etypeS || (FAL.Param.isDoWeaponBlock && equips[i].etypeId === FAL.Param.etypeW))) {
                var strBlockRate = equips[i].meta[initialMetaTag + ' Block Rate'];
                if (strBlockRate && parseFloat(strBlockRate) > Math.random()) {
                    var strBlockMiti = equips[i].meta[initialMetaTag + ' Block Mitigation'];
                    if (strBlockMiti) {
                        return damage * (1 - parseFloat(strBlockMiti));
                    } else {
                        return damage / (2 * target.grd);
                    }
                }
            }
        }
        return damage;
    }
    
    Game_Actor.prototype.applyPhysicalBlock = function(damage, target) {
        return this.applyBlock('Physical', damage, target);
    }
    
    Game_Actor.prototype.applyMagicalBlock = function(damage, target) {
        return this.applyBlock('Magical', damage, target);
    }
    
})();
