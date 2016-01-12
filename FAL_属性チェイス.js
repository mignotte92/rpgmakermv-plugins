/*:
 * @plugindesc 世界樹のような属性チェイス攻撃を実装します。
 * ステート付与スキル、攻撃実体スキル、チェイス待ちステートが必要です。
 * @author FAL
 * @version 0.1
 *
 * @help
 * ======================================================
 * 世界樹の迷宮にあるような特定の属性スキルの発動に対して追撃を行うスキルです。
 * 現状、属性タイプ2から7までしか対応させていません。
 * またチェイス実行スキルにおいて範囲は適応されず必ず敵単体対象になります。
 * 
 * ＜使い方＞
 * 　　１．プラグインを読み込み、各種プラグインパラメータを修正する
 * 　　２．チェイス待ち状態を示すステートを作成する
 * 　　３．チェイス発動時の実行スキルを作成する
 * 　　４．チェイス待ちへ移行するためのスキルを作成し、
 * 　　　　２．のステート付与とコモンイベントで下記プラグインコマンドを設定する
 * 
 * ＜プラグインコマンド＞
 * 　必ずこのプラグインコマンドをステート付与スキルで実行してください。
 * 　　SetChaseElement x y
 * 　　　　x: (整数) チェイス発動時に実行される攻撃スキルのID
 * 　　　　y: (0~1の小数) チェイス発動率の減衰率、1ならば必ず発動する
 * 
 * ======================================================
 *
 * @param Default Chase Decay Rate
 * @desc プラグインコマンドで2番目の引数を指定しなかった場合のチェイス実行の減衰率
 * 0.8ならば 100%>80%>64%>51.2%>... と落ちていく
 * @default 0.8
 * 
 * @param Remove Chase Stance State
 * @desc 上記の減衰の影響でチェイスしなかった時にステートを解除するかどうか
 * falseの場合、確率は下がるがチェイス状態は維持される
 * @default true
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
 * @param Chase EleId 7 Message
 * @desc 属性7番のチェイス実行時のメッセージ
 * @default 属性7番のチェイス発動！
 * 
 */

var Imported = Imported || {};
Imported.FAL_属性チェイス = true;

var FAL = FAL || {};

FAL.Parameters = PluginManager.parameters('FAL_属性チェイス');
FAL.Param = FAL.Param || {};

FAL.Param.chaseElements = {};
FAL.Param.chaseElementNum = 7;

for (var i = 2; i <= FAL.Param.chaseElementNum; i++) {
    FAL.Param.isCheckChaseElement = FAL.Parameters['Chase EleId ' + i + ' Flag'] === 'true';
    FAL.Param.chaseElementStanceStateId = Number(FAL.Parameters['Chase EleId ' + i + ' Stance State ID']);
    FAL.Param.chaseElementActionMessage = String(FAL.Parameters['Chase EleId ' + i + ' Message']);
    FAL.Param.chaseElements[i] = {
        isChase : FAL.Param.isCheckChaseElement,
        stateId : FAL.Param.chaseElementStanceStateId,
        message : FAL.Param.chaseElementActionMessage
    };
}

FAL.Param.defaultChaseDecayRate = Number(FAL.Parameters['Default Chase Decay Rate']);
if (FAL.Param.defaultChaseDecayRate > 1) {
    FAL.Param.defaultChaseDecayRate = 1;
} else if (FAL.Param.defaultChaseDecayRate < 0) {
    FAL.Param.defaultChaseDecayRate = 0;
}
FAL.Param.isRemoveChaseStanceState = FAL.Parameters['Remove Chase Stance State'] === 'true';

(function() {
    
    var _BattleManager_invokeNormalAction = BattleManager.invokeNormalAction;
    BattleManager.invokeNormalAction = function(subject, target) {
        _BattleManager_invokeNormalAction.call(this, subject, target);
        
        var eleId = this._action.item().damage.elementId;
        if (eleId > 1 && eleId <= FAL.Param.chaseElementNum && FAL.Param.chaseElements[eleId].isChase) {
            var chasers = this._action.friendsUnit().inChaseStanceMembers(FAL.Param.chaseElements[eleId].stateId);
            
            if (chasers.length !== 0) {
                for (var i = 0; i < chasers.length; i++) {
                    if (chasers[i]._chaseElement.chaseRate > Math.random()) {
                        this._logWindow.push('performChaseAction', this.invokeChaseAction, this, chasers[i], target, chasers[i]._chaseElement.skillId, eleId);
                        chasers[i]._chaseElement.chaseRate *= chasers[i]._chaseElement.decayRate;
                    } else {
                        if (FAL.Param.isRemoveChaseStanceState) {
                            chasers[i].removeChaseElement();
                            chasers[i].removeState(FAL.Param.chaseElements[eleId].stateId);
                        }
                    }
                }
            }
        }
    }
    
    Game_Unit.prototype.inChaseStanceMembers = function(chaseStanceStateId) {
        return this.members().filter(function(member) {
            return member.isStateAffected(chaseStanceStateId) && member._chaseElement;
        })
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
    
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        if (command === 'SetChaseElement') {
            var decayRate = FAL.Param.defaultChaseDecayRate;
            if (args.length === 2) {
                decayRate = parseFloat(args[1]);
                if (decayRate > 1) {
                    decayRate = 1;
                } else if (decayRate < 0) {
                    decayRate = 0;
                }
            }
            BattleManager._action.subject().setChaseElement(parseInt(args[0]), decayRate);
        }
        
        _Game_Interpreter_pluginCommand.call(this, command, args);
    }
    
    Game_Battler.prototype.setChaseElement = function(chaseActionSkillId, chaseActionDecayRate) {
        this._chaseElement = {
            skillId : chaseActionSkillId,
            chaseRate : 1,
            decayRate : chaseActionDecayRate
        };
    }
    
    Game_Battler.prototype.removeChaseElement = function() {
        this._chaseElement = undefined;
    }
    
})();
