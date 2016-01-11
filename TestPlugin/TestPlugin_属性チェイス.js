/*:
 * @plugindesc 世界樹のような属性チェイス攻撃を実装します。
 * ステート付与スキル、攻撃実体スキル、チェイス待ちステートが必要です。
 * @author FAL
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 * @param === Chase EleId 2 =========
 * @default ===================
 * 
 * @param Chase EleId 2 Flag
 * @desc 属性2番のチェイス処理を行うかどうかのフラグ
 * @default true
 * 
 * @param Chase EleId 2 Stance State ID
 * @desc 属性2番のチェイス状態を示すステートID
 * @default 22
 * 
 * @param Chase EleId 2 Stance Skill ID
 * @desc 属性2番のチェイスのダメージ実体を示すスキルID
 * @default 38
 * 
 * @param Chase EleId 2 Message
 * @desc 属性2番のチェイス実行時のメッセージ
 * @default チェイスファイア発動！
 * 
 * @param === Chase EleId 3 =========
 * @default ===================
 * 
 * @param Chase EleId 3 Flag
 * @desc 属性3番のチェイス処理を行うかどうかのフラグ
 * @default true
 * 
 * @param Chase EleId 3 Stance State ID
 * @desc 属性3番のチェイス状態を示すステートID
 * @default 22
 * 
 * @param Chase EleId 3 Stance Skill ID
 * @desc 属性3番のチェイスのダメージ実体を示すスキルID
 * @default 38
 * 
 * @param Chase EleId 3 Message
 * @desc 属性3番のチェイス実行時のメッセージ
 * @default 属性3番のチェイス発動！
 * 
 * @param === Chase EleId 4 =========
 * @default ===================
 * 
 * @param Chase EleId 4 Flag
 * @desc 属性4番のチェイス処理を行うかどうかのフラグ
 * @default true
 * 
 * @param Chase EleId 4 Stance State ID
 * @desc 属性4番のチェイス状態を示すステートID
 * @default 22
 * 
 * @param Chase EleId 4 Stance Skill ID
 * @desc 属性4番のチェイスのダメージ実体を示すスキルID
 * @default 38
 * 
 * @param Chase EleId 4 Message
 * @desc 属性4番のチェイス実行時のメッセージ
 * @default 属性4番のチェイス発動！
 * 
 * @param === Chase EleId 5 =========
 * @default ===================
 * 
 * @param Chase EleId 5 Flag
 * @desc 属性5番のチェイス処理を行うかどうかのフラグ
 * @default true
 * 
 * @param Chase EleId 5 Stance State ID
 * @desc 属性5番のチェイス状態を示すステートID
 * @default 22
 * 
 * @param Chase EleId 5 Stance Skill ID
 * @desc 属性5番のチェイスのダメージ実体を示すスキルID
 * @default 38
 * 
 * @param Chase EleId 5 Message
 * @desc 属性5番のチェイス実行時のメッセージ
 * @default 属性5番のチェイス発動！
 * 
 * @param === Chase EleId 6 =========
 * @default ===================
 * 
 * @param Chase EleId 6 Flag
 * @desc 属性6番のチェイス処理を行うかどうかのフラグ
 * @default true
 * 
 * @param Chase EleId 6 Stance State ID
 * @desc 属性6番のチェイス状態を示すステートID
 * @default 22
 * 
 * @param Chase EleId 6 Stance Skill ID
 * @desc 属性6番のチェイスのダメージ実体を示すスキルID
 * @default 38
 * 
 * @param Chase EleId 6 Message
 * @desc 属性6番のチェイス実行時のメッセージ
 * @default 属性6番のチェイス発動！
 * 
 * @param === Chase EleId 7 =========
 * @default ===================
 * 
 * @param Chase EleId 7 Flag
 * @desc 属性7番のチェイス処理を行うかどうかのフラグ
 * @default true
 * 
 * @param Chase EleId 7 Stance State ID
 * @desc 属性7番のチェイス状態を示すステートID
 * @default 22
 * 
 * @param Chase EleId 7 Stance Skill ID
 * @desc 属性7番のチェイスのダメージ実体を示すスキルID
 * @default 38
 * 
 * @param Chase EleId 7 Message
 * @desc 属性7番のチェイス実行時のメッセージ
 * @default 属性7番のチェイス発動！
 * 
 */

var Imported = Imported || {};
Imported.TestPlugin_属性チェイス = true;

var FAL = FAL || {};

FAL.Parameters = PluginManager.parameters('TestPlugin_属性チェイス');
FAL.Param = FAL.Param || {};

FAL.Param.chaseElements = {};
FAL.Param.chaseElementNum = 7;

for (var i = 2; i <= FAL.Param.chaseElementNum; i++) {
    FAL.Param.isCheckChaseElement = FAL.Parameters['Chase EleId ' + i + ' Flag'] === 'true';
    FAL.Param.chaseElementStanceStateId = Number(FAL.Parameters['Chase EleId ' + i + ' Stance State ID']);
    FAL.Param.chaseElementStanceSkillId = Number(FAL.Parameters['Chase EleId ' + i + ' Stance Skill ID']);
    FAL.Param.chaseElementActionMessage = String(FAL.Parameters['Chase EleId ' + i + ' Message']);
    FAL.Param.chaseElements[i] = {
        isChase : FAL.Param.isCheckChaseElement,
        stateId : FAL.Param.chaseElementStanceStateId,
        skillId : FAL.Param.chaseElementStanceSkillId,
        message : FAL.Param.chaseElementActionMessage
    };
}

(function() {
    
    var _BattleManager_invokeNormalAction = BattleManager.invokeNormalAction;
    BattleManager.invokeNormalAction = function(subject, target) {
        _BattleManager_invokeNormalAction.call(this, subject, target);
        
        var eleId = this._action.item().damage.elementId;
        if (eleId > 1 && eleId <= FAL.Param.chaseElementNum && FAL.Param.chaseElements[eleId].isChase) {
            var battlers = this._action.friendsUnit().members();
            var chaser = this.checkInChaseStance(battlers, FAL.Param.chaseElements[eleId].stateId);
            if (chaser) {
                this._logWindow.push('performChaseAction', this.invokeChaseAction, this, chaser, target, FAL.Param.chaseElements[eleId].skillId, eleId);
            }
        }
    }
    
    BattleManager.checkInChaseStance = function(battlers, stateId) {
        for (var i = 0; i < battlers.length; i++) {
            if (battlers[i].isStateAffected(stateId)) {
                return battlers[i];
            }
        }
        return null;
    }
    
    BattleManager.invokeChaseAction = function(chaser, target, actionId, elementId) {
        var action = new Game_Action(chaser);
        action.setSkill(actionId);
        action.apply(target);
        this._logWindow.displayChaseAction(elementId);
        this._logWindow.displayActionResults(chaser, target);
    }
    
    Window_BattleLog.prototype.performChaseAction = function(method, caller, chaser, target, skillId, elementId) {
        method.call(caller, chaser, target, skillId, elementId);
    }
    
    Window_BattleLog.prototype.displayChaseAction = function(elementId) {
        this.push('pushBaseLine');
        this.push('addText', FAL.Param.chaseElements[elementId].message);
        this.push('popBaseLine');
    }
    
})();
