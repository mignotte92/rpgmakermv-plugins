var Imported = Imported || {};
Imported.TestPlugin_かばうと仁王立ち = true;

var FAL = FAL || {};

/*:
 * @plugindesc ドラクエ的なかばうと仁王立ちを実装します。
 * 現状、二人身代わりが居るとバグると思う。
 * @author fal
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 * @param Protect State ID
 * @desc かばうで使うステートID。
 * @default 18
 * 
 * @param Protected State ID
 * @desc かばわれるで使うステートID。
 * @default 20
 * 
 * @param Protect All State ID
 * @desc 仁王立ちで使うステートID。
 * @default 19
 */

FAL.Parameters = PluginManager.parameters('TestPlugin_かばうと仁王立ち');
FAL.Param = FAL.Param || {};

FAL.Param.ProtectStateId = Number(FAL.Parameters['Protect State ID']);
FAL.Param.ProtectedStateId = Number(FAL.Parameters['Protected State ID']);
FAL.Param.ProtectAllStateId = Number(FAL.Parameters['Protect All State ID']);

(function() {
    
    var _BattleManager_checkSubstitute = BattleManager.checkSubstitute;
    BattleManager.checkSubstitute = function(target) {
        var isDyingAndNotCertain = _BattleManager_checkSubstitute.call(this, target);
        
        // 必中かチェック
        if (!this._action.isCertainHit()) {
            // 身代わりフラグチェック
            var substitute = target.friendsUnit().substituteBattler();
            if (substitute) {
                // 単体か全体か
                if (substitute.isStateAffected(FAL.Param.ProtectStateId)) {
                    // 対象がかばうの対象になっているか
                    if (target.isStateAffected(FAL.Param.ProtectedStateId)) {
                        return true;
                    } else {
                        // ステート以外で身代わりフラグが立っていないかチェック
                        var substituteFlags = substitute.traits(Game_BattlerBase.TRAIT_SPECIAL_FLAG).filter(function(v) {
                            return v.dataId === Game_BattlerBase.FLAG_ID_SUBSTITUTE;
                        });
                        if (substituteFlags.length > 1) {
                            return isDyingAndNotCertain;
                        } else {
                            return false;
                        }
                    }
                } else {
                    // 仁王立ちか普通の身代わりかチェック
                    if (substitute.isStateAffected(FAL.Param.ProtectAllStateId)) {
                        return true;
                    } else {
                        return isDyingAndNotCertain;
                    }
                }
            } else {
                return isDyingAndNotCertain;
            }
        } else {
            return isDyingAndNotCertain;
        }
    }
    
})();
