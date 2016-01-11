/*:
 * @plugindesc ダメージを吸収してくれるアブソーブシールドを実装します。
 * @author FAL
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 * @param Absorb Shield State ID
 * @desc アブソーブシールド状態にあることを示すステートID
 * @default 24
 * 
 * @param Absorb Rate
 * @desc アブソーブシールドが吸収できる被ダメージの割合
 * 1で完全吸収
 * @default 1
 * 
 */
/* これをコモンイベントへ追加してステート付与スキルから呼ぶ
var subjectActor = $gameActors.actor(BattleManager._action._subjectActorId);
var targetActor = $gameParty.battleMembers()[BattleManager._action._targetIndex];
// アブソーブシールドの吸収量を変えたいときはこの式を編集
var value = subjectActor.mat * 2;
targetActor.addAbsorbShield(value);
*/

var Imported = Imported || {};
Imported.TestPlugin_アブソーブシールド = true;

var FAL = FAL || {};

FAL.Parameters = PluginManager.parameters('TestPlugin_アブソーブシールド');
FAL.Param = FAL.Param || {};

FAL.Param.absorbShieldStateID = Number(FAL.Parameters['Absorb Shield State ID']);
FAL.Param.absorbShieldRate = Number(FAL.Parameters['Absorb Rate']);

(function() {
    
    var _Game_Action_applyGuard = Game_Action.prototype.applyGuard;
    Game_Action.prototype.applyGuard = function(damage, target) {
        var guardedDamage = _Game_Action_applyGuard.call(this, damage, target);
        
        if (guardedDamage > 0 && target.isStateAffected(FAL.Param.absorbShieldStateID)) {
            var absorbDamage = guardedDamage * FAL.Param.absorbShieldRate;
            if (absorbDamage < target._absorbShield.value) {
                target._absorbShield.value -= absorbDamage;
            } else {
                absorbDamage = target._absorbShield.value;
                target._absorbShield = null;
                target.removeState(FAL.Param.absorbShieldStateID);
            }
            guardedDamage -= absorbDamage;
        }
        
        return guardedDamage;
    }
    
    Game_Battler.prototype.addAbsorbShield = function(absorbValue) {
        this._absorbShield = {
            value : absorbValue
        };
    }
    
})();
