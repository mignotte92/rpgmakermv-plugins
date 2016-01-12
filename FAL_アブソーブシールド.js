/*:
 * @plugindesc ダメージを吸収してくれるアブソーブシールドを実装します。
 * 必ずプラグイン管理画面でFAL_盾ブロック.jsよりも下においてください。
 * @author FAL
 * @version 0.1
 *
 * @help
 * ========================================================
 * 
 * ダメージを吸収してくれるアブソーブシールドバフを使うことが出来るようになります。
 * 必ずプラグイン管理画面でFAL_盾ブロック.jsよりも下においてください。
 * 
 * ＜使い方＞
 * 　　１．アブソーブ状態を示すステートを作成する
 * 　　２．吸収量を計算するためのスキルを作成する
 * 　　　　この時、ダメージのタイプはHP回復にしてください
 * 　　３．１．で作成したステートを付与するスキルを作成する
 * 　　　　（範囲は味方単体、味方全体、使用者のいづれかにしてください）
 * 　　４．３．で作成したスキルで下記のプラグインコマンドを呼ぶようにする
 * 
 * ＜プラグインコマンド＞
 * 　　SetAbsorbShield x y
 * 　　　　x: (整数) 吸収量を計算するためのスキルID
 * 　　　　y: (0~1の小数) ダメージに対する吸収量の割合、省略可能
 * 　　　　　 0.8ならば100ダメージのうち80までは吸収でき、最低でも20は受けるようになります。
 * 
 * ========================================================
 * 
 * @param Absorb Shield State ID
 * @desc アブソーブシールド状態にあることを示すステートID
 * @default 24
 * 
 * @param Default Absorb Rate
 * @desc プラグインコマンドで吸収割合を指定しない場合の吸収できる被ダメージの割合
 * 0から1までの小数で指定してください
 * @default 1
 * 
 */

var Imported = Imported || {};
Imported.FAL_アブソーブシールド = true;

var FAL = FAL || {};

FAL.Parameters = PluginManager.parameters('FAL_アブソーブシールド');
FAL.Param = FAL.Param || {};

FAL.Param.absorbShieldStateID = Number(FAL.Parameters['Absorb Shield State ID']);
FAL.Param.defaultAbsorbShieldRate = Number(FAL.Parameters['Default Absorb Rate']);

(function() {
    
    var _Game_Action_applyGuard = Game_Action.prototype.applyGuard;
    Game_Action.prototype.applyGuard = function(damage, target) {
        var guardedDamage = _Game_Action_applyGuard.call(this, damage, target);
        
        if (guardedDamage > 0 && target.isStateAffected(FAL.Param.absorbShieldStateID) && target._absorbShield) {
            var absorbDamage = guardedDamage * target._absorbShield.rate;
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
    
    Game_Battler.prototype.addAbsorbShield = function(absorbValue, absorbRate) {
        this._absorbShield = {
            'value' : -absorbValue,
            'rate' : absorbRate
        };
    }
    
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        if (command === 'SetAbsorbShield' && [1, 2].contains(args.length)) {
            var subject = BattleManager._action.subject();
            var targets = BattleManager._action.targetsForFriends();
            var absorbAction = new Game_Action(subject);
            absorbAction.setSkill(parseInt(args[0]));
            var absorbRate = parseFloat(args[1] || FAL.Param.defaultAbsorbShieldRate);
            if (absorbRate > 1) {
                absorbRate = 1;
            } else if (absorbRate < 0) {
                absorbRate = 0;
            }
            for (var i = 0; i < targets.length; i++) {
                targets[i].addAbsorbShield(absorbAction.makeDamageValue(targets[i], absorbAction.itemCri(targets[i]) > Math.random()), absorbRate);
            }
        }
        
        _Game_Interpreter_pluginCommand.call(this, command, args);
    }
    
})();
