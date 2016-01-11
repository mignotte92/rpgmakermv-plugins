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
 */

var Imported = Imported || {};
Imported.TestPlugin_反撃とカウンター = true;

var FAL = FAL || {};

FAL.Parameters = PluginManager.parameters('TestPlugin_反撃とカウンター');
FAL.Param = FAL.Param || {};

FAL.Param.permitSubstituteCnt = FAL.Parameters['Permit Substitute Counter'] === 'true';
FAL.Param.permitSubstituteRCnt = FAL.Parameters['Permit Substitute Received Counter'] === 'true';

(function() {
    
    BattleManager.invokeNormalAction = function(subject, target) {
        var realTarget = this.applySubstitute(target);
        if (realTarget !== target && FAL.Param.permitSubstituteCnt && Math.random() < this._action.itemCnt(realTarget)) {
            this.invokeCounterAttack(subject, realTarget);
        } else {
            this._action.apply(realTarget);
            this._logWindow.displayActionResults(subject, realTarget);
            if ((FAL.Param.permitSubstituteRCnt || realTarget === target) && this.canReceivedCounter(this._action, realTarget)) {
                this._logWindow.push('performReceivedCounter', this.invokeCounterAttack, this, subject, realTarget);
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
    
})();
