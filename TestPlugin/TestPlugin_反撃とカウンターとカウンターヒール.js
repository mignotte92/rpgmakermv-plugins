/*:
 * @plugindesc 反撃のパターンを追加します。
 * メモ欄に<Received Counter: x>（xは1以下の少数）と記入してください。
 * @author FAL
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 * @param Permit Substitute Counter
 * @desc 身代わり効果発動時に反撃を許可するかどうか。
 * @default false
 * 
 * @param Permit Substitute Received Counter
 * @desc 身代わり効果発動時に食らい反撃を許可するかどうか。
 * @default true
 * 
 * @param Counter Heal Message
 * @desc カウンターヒール発動時のメッセージ。
 * @default カウンターヒール発動！
 * 
 */
/* 以下をカウンターヒール付与スキルにスクリプトとして記述してください。
var counterHealSkillId = 35;
var counterHealInvokeCounts = 3;
var subjectActor = $gameActors.actor(BattleManager._action._subjectActorId);
var targetActor = $gameParty.battleMembers()[BattleManager._action._targetIndex];
targetActor.addCounterHeal(subjectActor, counterHealSkillId, counterHealInvokeCounts);
*/

var Imported = Imported || {};
Imported.TestPlugin_反撃とカウンターとカウンターヒール = true;

var FAL = FAL || {};

FAL.Parameters = PluginManager.parameters('TestPlugin_反撃とカウンターとカウンターヒール');
FAL.Param = FAL.Param || {};

FAL.Param.permitSubstituteCnt = FAL.Parameters['Permit Substitute Counter'] === 'true';
FAL.Param.permitSubstituteRCnt = FAL.Parameters['Permit Substitute Received Counter'] === 'true';
FAL.Param.counterHealMessage = String(FAL.Parameters['Counter Heal Message']);

(function() {
    
    BattleManager.invokeNormalAction = function(subject, target) {
        var realTarget = this.applySubstitute(target);
        if (realTarget !== target && FAL.Param.permitSubstituteCnt && Math.random() < this._action.itemCnt(realTarget)) {
            this.invokeCounterAttack(subject, realTarget);
        } else {
            this._action.apply(realTarget);
            this._logWindow.displayActionResults(subject, realTarget);
            ////////////////////////////////////////////////
            // 反撃とカウンターから追加した処理
            if (realTarget.isAffectedCounterHeal() && this._action.isForOpponent()) {
                this._logWindow.push('performReceivedCounter', BattleManager.invokeCounterHeal, this, subject, realTarget);
            }
            // ここまで
            ////////////////////////////////////////////////
            if ((FAL.Param.permitSubstituteRCnt || realTarget === target) && BattleManager.canReceivedCounter(this._action, realTarget)) {
                this._logWindow.push('performReceivedCounter', BattleManager.invokeCounterAttack, this, subject, realTarget);
            }
        }
    }
    
    BattleManager.canReceivedCounter = function(action, target) {
        if (action.isCertainHit()) {
            return false;
        } else {
            if (action.isPhysical() && target.canMove()) {
                var traitObjects = target.traitObjects();
                for (var i = 0; i < traitObjects.length; i++) {
                    var rCnt = traitObjects[i].meta['Received Counter'];
                    if (rCnt && Math.random() < parseFloat(rCnt)) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
    
    Window_BattleLog.prototype.performReceivedCounter = function(method, caller, subject, target) {
        method.call(caller, subject, target);
    }
    
    ////////////////////////////////////////////////
    // 反撃とカウンターから追加した処理
    Game_Battler.prototype.addCounterHeal = function(healer, actionId, cnt) {
        if (healer && actionId > 0 && cnt > 0) {
            this._counterHealBuff = {
                healBattler: healer,
                healActionId: actionId,
                healCnt: cnt
            };
        }
    }
    
    Game_Battler.prototype.isAffectedCounterHeal = function() {
        return !!this._counterHealBuff;
    }
    
    BattleManager.invokeCounterHeal = function(subject, target) {
        var action = new Game_Action(target._counterHealBuff.healBattler);
        action.setSkill(target._counterHealBuff.healActionId);
        action.apply(target);
        this._logWindow.displayCounterHeal(target);
        this._logWindow.displayActionResults(target._counterHealBuff.healBattler, target);
        target._counterHealBuff.healCnt -= 1;
        if (target._counterHealBuff.healCnt < 1) {
            target._counterHealBuff = null;
        }
    }
    
    Window_BattleLog.prototype.displayCounterHeal = function(target) {
        //this.push('performRecovery', target);
        this.push('addText', FAL.Param.counterHealMessage.format(target.name()));
    }
    
})();
