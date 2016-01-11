/*:
 * @plugindesc スキルのメモ欄に<Follow Up: x>とスキルのIDを指定してください。
 * @author fal
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 */

(function() {
    
    //////////////////////////////////////////////////////
    //　
    var _Game_Action_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        _Game_Action_apply.call(this, target);
        
        if (this._subjectActorId > 0 && target.result().isHit()) {
            //　アクターのスキルからフォローアップスキルを取り出し、
            //　今使ってるスキルのフォローか判別して使用可能にする
            var subjectSkills = this.subject().skills();
            for (var i = 0; i < subjectSkills.length; i++) {
                var meta = subjectSkills[i].meta['Follow Up'];
                if (meta) {
                    if (parseInt(meta) === this.item().id) {
                        subjectSkills[i].occasion = 1;
                    }
                }
            }
            
            //　今使っているスキルがフォローアップスキルならば使用不可に戻す
            if (this.item().meta['Follow Up']) {
                this.item().occasion = 3;
            }
        }
    }
    
    //////////////////////////////////////////////////////
    //　戦闘終了時のフォローアップスキル初期化
    var _BattleManager_updateBattleEnd = BattleManager.updateBattleEnd;
    BattleManager.updateBattleEnd = function() {
        _BattleManager_updateBattleEnd.call(this);
        
        var battleMembers = $gameParty.battleMembers();
        for (var i = 0; i < battleMembers.length; i++) {
            var battleMemberSkills = battleMembers[i].skills();
            for (var j = 0; j < battleMemberSkills.length; j++) {
                var meta = battleMemberSkills[j].meta['Follow Up'];
                if (meta) {
                    battleMemberSkills[j].occasion = 3;
                }
            }
        }
    }
    
})();
