/*:
 * @plugindesc 反撃のパターンを追加します。
 * @author FAL
 * @version 0.1
 * 
 * @help
 * =======================================================
 * 既存の反撃率は攻撃を受ける前に反撃して敵の攻撃自体はキャンセルされます。
 * このプラグインでは敵の攻撃を受けた後に反撃する反撃パターンを追加します。
 * また敵から攻撃された時にカウンターとしてスキルが発動するパターンも追加します。
 * プラグインパラメーターを変更することで身代わりが発動した時に反撃を許可するか
 * 変更できます。
 * 
 * BattleManager.invokeNormalAction を書き換えているため、プラグインの互換性に
 * 注意してください。
 * 
 * ＜デフォルトの反撃率＞
 * 　　特に動作的な影響を受けません。
 * 　　プラグインパラメーターのPermit Substitute Counterをtrueにすることで、
 * 　　身代わり発動時にも敵の攻撃をキャンセルして反撃するようになります。
 * 
 * ＜食らい反撃＞
 * 　　攻撃を受けた後に攻撃コマンドで反撃します。
 * 　　デフォルトの反撃と同じく命中タイプが物理攻撃の場合のみ反応します。
 * 　　アクター、職業、武器、防具、敵キャラのメモ欄に
 * 　　　　<Received Counter: x>（xは0~1の少数）
 * 　　と記入することで反撃する確率が設定できます。
 * 　　プラグインパラメーターのPermit Received Substitute Counterをtrue
 * 　　にすることで、身代わり発動時にも敵の攻撃を受けてから反撃するように
 * 　　なります。
 * 
 * ＜カウンタースキル＞
 * 　　攻撃を受けた後に指定したスキルで反撃します。
 * 　　上記の反撃とは異なり、命中タイプにかかわらず反応します。
 * 　　使用するには以下の手続きを踏んでください。
 * 　　　１．カウンタースキル待機状態を示すステートを作成する
 * 　　　２．カウンタースキルで使われるスキルを作成する
 * 　　　３．１．で作成したステートを付与するスキルを作る
 * 　　　　　（範囲は味方単体、味方全体、使用者のいづれかにしてください）
 * 　　　４．３．で作成したスキルで下記のプラグインコマンドを呼ぶ
 * 
 * ＜プラグインコマンド＞
 *     AddCounterSkill text a b c d
 *         text: (文字列) カウンタースキル発動時に表示されるテキスト（半角スペースを含んではいけない）
 *         a: (整数) カウンタースキル発動待ち状態を示すステートID
 *         b: (整数) カウンタースキル発動で実行されるスキルID
 *         c: (整数) カウンタースキル発動回数
 *         d: (0~1の小数) カウンタースキル発動確率（0.8=80%、指定しない場合100%）
 * 
 * =========================================================
 * 
 * @param Permit Substitute Counter
 * @desc 身代わり効果発動時に反撃を許可するかどうか。
 * @default false
 * 
 * @param Permit Substitute Received Counter
 * @desc 身代わり効果発動時に食らい反撃を許可するかどうか。
 * @default false
 * 
 */

var Imported = Imported || {};
Imported.FAL_反撃とカウンタースキル = true;

var FAL = FAL || {};

FAL.Parameters = PluginManager.parameters('FAL_反撃とカウンタースキル');
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
            
            ////////////////////////////////////////////////
            // カウンタースキルの発動チェック
            if (this._action.isForOpponent() && realTarget.result().isHit() && realTarget.isAffectedCounterSkill()) {
                this._logWindow.push('performReceivedCounter', this.invokeCounterSkill, this, subject, realTarget);
            }
            
            ////////////////////////////////////////////////
            // 食らい反撃の発動チェック
            if ((realTarget === target || FAL.Param.permitSubstituteRCnt) && this.canReceivedCounter(this._action, realTarget)) {
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
    
    Game_Battler.prototype.addCounterSkill = function(stateId, battler, skillId, cnt, rate, message) {
        if (battler && skillId > 0 && cnt > 0) {
            this._counterSkill = {
                'stateId': stateId,
                'battler': battler,
                'skillId': skillId,
                'counts': cnt,
                'rate': rate,
                'message': message
            };
        }
    }
    
    // カウンタースキルがセットされているかチェック
    Game_Battler.prototype.isAffectedCounterSkill = function() {
        return !!this._counterSkill && this.isStateAffected(this._counterSkill.stateId);
    }
    
    // カウンタースキルの発動処理
    BattleManager.invokeCounterSkill = function(subject, target) {
        if (target._counterSkill.rate > Math.random()) {
            var action = new Game_Action(target._counterSkill.battler);
            action.setSkill(target._counterSkill.skillId);
            var realTarget = action.isForFriend()? target: subject;
            this._logWindow.displayCounterSkill(target._counterSkill.message);
            if (action.checkItemScope([11])) {
                action.apply(target._counterSkill.battler);
                this._logWindow.displayActionResults(target._counterSkill.battler, target._counterSkill.battler);
            } else if (action.checkItemScope([1, 7, 9])) {
                action.apply(realTarget);
                this._logWindow.displayActionResults(target._counterSkill.battler, realTarget);
            } else {
                var targets = action.makeTargets();
                targets.forEach(function(v){
                    action.apply(v);
                    this._logWindow.displayActionResults(target._counterSkill.battler, v);
                }, this);
            }
            target._counterSkill.counts--;
            if (target._counterSkill.counts < 1) {
                target.removeState(target._counterSkill.stateId);
                target._counterSkill = null;
            }
        }
    }
    
    Window_BattleLog.prototype.displayCounterSkill = function(str) {
        this.push('addText', str);
    }
    
    // プラグインコマンドに登録
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        if (command === 'AddCounterSkill' && [5, 4].contains(args.length)) {
            var counterSkillMessage = args[0]
            var counterSkillStateId = parseInt(args[1]);
            var counterSkillId = parseInt(args[2]);
            var counterSkillInvokeCounts = parseInt(args[3]);
            var counterSkillInvokeRate = 1;
            if (args.length === 5) {
                counterSkillInvokeRate = parseFloat(args[3]);
            }
            var subject = BattleManager._action.subject();
            var targets = BattleManager._action.targetsForFriends();
            for (var i = 0; i < targets.length; i++) {
                targets[i].addCounterSkill(counterSkillStateId, subject, counterSkillId, counterSkillInvokeCounts, counterSkillInvokeRate, counterSkillMessage);
            }
        }
        
        _Game_Interpreter_pluginCommand.call(this, command, args);
    }
    
})();
