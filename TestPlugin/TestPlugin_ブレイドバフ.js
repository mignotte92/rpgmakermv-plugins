/*:
 * @plugindesc 
 * @author FAL
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 * @param 
 * @desc 
 * @default 
 * 
 */

var Imported = Imported || {};
Imported.TestPlugin_ = true;

var FAL = FAL || {};

FAL.Parameters = PluginManager.parameters('TestPlugin_');
FAL.Param = FAL.Param || {};

FAL.Param.name = Number(FAL.Parameters['']);

(function() {
    
    var _BattleManager_invokeNormalAction = BattleManager.invokeNormalAction;
    BattleManager.invokeNormalAction = function(subject, target) {
        _BattleManager_invokeNormalAction.call(this, subject, target);
        
        if () {
            
        }
    }
    
})();
