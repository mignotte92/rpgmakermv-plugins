/*:
 * @plugindesc かばうと仁王立ち（全体かばう）を実装します。
 * @author FAL
 * @version 0.1
 *
 * @help
 * =========================================================
 * 
 * このプラグインによって単体をかばうスキルと仁王立ち（全体かばう）スキルが
 * 導入できるようになります。
 * 
 * このスキルは命中タイプが必中以外の攻撃に対してスキル発動者がダメージを肩代わりするものです。
 * 
 * ＜かばう＞
 * 　１．かばう実行者に付与されるステートを作成してください
 * 　２．かばう対象者に付与されるステートを作成してください
 * 　３．プラグインパラメータでそれぞれのステートIDを設定してください
 * 　４．かばう実行スキルを範囲：味方単体にして、使用効果にステート付与２番のステート
 * 　　　コモンイベントで下記のプラグインコマンド呼び出しを行うように
 * 
 * 　１番と２番のステートが揃っている時にのみ効果が発揮されます。
 * 
 * ＜仁王立ち＞
 * 　１．仁王立ち実行者に付与されるステートを作成してください
 * 　２．プラグインパラメータでそのステートIDを設定してください
 * 　３．そのステートを付与するスキルを作成してください
 * 
 * 　こちらの場合は下記のプラグインコマンドを呼ぶ必要はありません。
 * 
 * ＜プラグインコマンド＞
 * 　SetProtectedState
 * 
 * =========================================================
 *
 * @param Protect State ID
 * @desc かばう状態を示すステートID。
 * @default 18
 * 
 * @param Protected State ID
 * @desc かばわれている状態を示すステートID。
 * @default 20
 * 
 * @param Protect All State ID
 * @desc 仁王立ち状態を示すステートID。
 * @default 19
 * 
 */

var Imported = Imported || {};
Imported.FAL_かばうと仁王立ち = true;

var FAL = FAL || {};

FAL.Parameters = PluginManager.parameters('FAL_かばうと仁王立ち');
FAL.Param = FAL.Param || {};

FAL.Param.ProtectStateId = Number(FAL.Parameters['Protect State ID']);
FAL.Param.ProtectedStateId = Number(FAL.Parameters['Protected State ID']);
FAL.Param.ProtectAllStateId = Number(FAL.Parameters['Protect All State ID']);

(function() {
    
    var _BattleManager_applySubstitute = BattleManager.applySubstitute;
    BattleManager.applySubstitute = function(target) {
        var realTarget = _BattleManager_applySubstitute.call(this, target);
        
        if (target === realTarget) {
            if (!this._action.isCertainHit()) {
                var protectAllBattlers = target.friendsUnit().hasStateMembers(FAL.Param.ProtectAllStateId);
                if (protectAllBattlers.length > 0) {
                    this._logWindow.displaySubstitute(protectAllBattlers[0], target);
                    return protectAllBattlers[0];
                }
                
                if (target.isStateAffected(FAL.Param.ProtectedStateId) && target._protectedState) {
                    var substitute = target._protectedState.substitute;
                    if (substitute.isStateAffected(FAL.Param.ProtectStateId) && substitute.canMove()) {
                        this._logWindow.displaySubstitute(substitute, target);
                        return substitute;
                    }
                }
            }
        }
        
        return realTarget;
    };
    
    Game_Unit.prototype.hasStateMembers = function(stateId) {
        return this.aliveMembers().filter(function(member) {
            return member.isStateAffected(stateId);
        });
    }
    
    Game_Battler.prototype.setProtectedState = function(battler) {
        this._protectedState = {
            'substitute': battler
        }
    }
    
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        if (command === 'SetProtectedState') {
            var subject = BattleManager._action.subject();
            var targets = BattleManager._action.targetsForFriends();
            if (targets.length === 1) {
                subject.addState(FAL.Param.ProtectStateId);
                targets[0].setProtectedState(subject);
            }
        }
        
        _Game_Interpreter_pluginCommand.call(this, command, args);
    }
    
})();
