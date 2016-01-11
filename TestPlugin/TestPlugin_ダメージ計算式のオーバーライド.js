/*:
 * @plugindesc スキルのメモ欄に<EDF: 計算式 on state x>（xはステートのID）と記入してください。
 * @author fal
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 */

(function() {
    
    var formatFormulaOfSpecificState = /(.+)(?:on state )(\d+)/;
    
    //
    // ダメージ計算式のオーバーライド
    //
    var _Game_Action_evalDamageFormula = Game_Action.prototype.evalDamageFormula;
    Game_Action.prototype.evalDamageFormula = function (target) {
        try {
            var item = this.item();
            var a = this.subject();
            var b = target;
            var v = $gameVariables._data;
            var sign = ([3, 4].contains(item.damage.type) ? -1 : 1);
            /////////////////////////
            //　追加箇所：
            //　　メモにタグが書かれているかチェックして計算式をタグに指定されたものに変更する
            //　　ここではメモに<EDF: XXXXXXX>と記述されている場合動作する
            //
            if (item.hasOwnProperty('meta')) {
                var edfText = item.meta['EDF'];
                
                // on state文の場合
                var match = formatFormulaOfSpecificState.exec(edfText);
                if (match) {
                    var damageFormula = match[1];
                    var specificState = parseInt(match[2]);
                    if (a.isStateAffected(specificState)) {
                        return Math.max(eval(damageFormula), 0) * sign;
                    }
                }
                
            }
            /////////////////////////
            return _Game_Action_evalDamageFormula.call(this, target);
        } catch (e) {
            return 0;
        }
    }
    
})();
