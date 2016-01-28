/*:
 * @plugindesc 
 * @author FAL
 * @version 0.1
 * 
 * @help このプラグインにはプラグインコマンドはありません。
 * 
 * @param Starlight State ID
 * @desc スターライト状態を示すステートID
 * @default 11
 * 
 */

var Imported = Imported || {};
Imported.FAL_スターライト = true;

var FAL = FAL || {};

FAL.Parameters = PluginManager.parameters('FAL_スターライト');
FAL.Param = FAL.Param || {};

FAL.Param.starlightStateId = Number(FAL.Parameters['Starlight State ID']);

(function() {
    
    var _BattleManager_invokeNormalAction = BattleManager.invokeNormalAction;
    BattleManager.invokeNormalAction = function(subject, target) {
        _BattleManager_invokeNormalAction.call(this, subject, target);
        
        if (this._action.item().meta['Starlight Skill'] && subject.isStateAffected(FAL.Param.starlightStateId)) {
            var starlightSkillId = parseInt(this._action.item().meta['Starlight Skill']);
            this._logWindow.push('performStarlightAction', this.invokeStarlightAction, this, subject, starlightSkillId);
        }
    }
    
    BattleManager.invokeStarlightAction = function(subject, starlightSkillId) {
        var action = new Game_Action(subject);
        action.setSkill(starlightSkillId);
        if (action.checkItemScope([8])) {
            var targets = action.makeTargets();
            targets.forEach(function(v){
                action.apply(v);
                this._logWindow.displayActionResults(subject, v);
            }, this);
        }
    }
    
    Window_BattleLog.prototype.performStarlightAction = function(method, caller, subject, skillId) {
        method.call(caller, subject, skillId);
    }
    
})();
