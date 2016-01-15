/*:
 * @plugindesc コマンドリピートを実装します。
 * @author FAL
 * @version 0.2
 *
 * @help このプラグインにはプラグインコマンドはありません。
 * ===============================================================
 * 
 * 前に選択したコマンドをそのターン繰り返しで行います。
 * 戦闘開始時にリピートを選択した場合、前の戦闘で最後に入力したコマンドが繰り返されます。
 * 
 * ===============================================================
 *
 * @param Repeat Battle Command Text
 * @desc リピート戦闘の戦闘用コマンド表示名
 * @default リピート
 * 
 */

var Imported = Imported || {};
Imported.FAL_リピート戦闘 = true;

var FAL = FAL || {};

FAL.Parameters = PluginManager.parameters('FAL_リピート戦闘');
FAL.Param = FAL.Param || {};

FAL.Param.repeatBattleCommandText = String(FAL.Parameters['Repeat Battle Command Text']);
FAL.Param.isRepeatBattle = false;

(function() {
    
    var _Window_PartyCommand_makeCommandList = Window_PartyCommand.prototype.makeCommandList
    Window_PartyCommand.prototype.makeCommandList = function() {
        _Window_PartyCommand_makeCommandList.call(this);
        this.addCommand(FAL.Param.repeatBattleCommandText,  'repeat', true);
    }
    
    var _Window_PartyCommand_setup = Window_PartyCommand.prototype.setup;
    Window_PartyCommand.prototype.setup = function() {
        _Window_PartyCommand_setup.call(this);
        if (FAL.Param.isRepeatBattle) this.select(2);
    }
    
    var _Scene_Battle_createPartyCommandWindow = Scene_Battle.prototype.createPartyCommandWindow;
    Scene_Battle.prototype.createPartyCommandWindow = function() {
        _Scene_Battle_createPartyCommandWindow.call(this);
        this._partyCommandWindow.setHandler('repeat',  this.commandRepeat.bind(this));
    }
    
    Scene_Battle.prototype.commandRepeat = function() {
        FAL.Param.isRepeatBattle = true;
        BattleManager.processRepeatBattle();
        this.changeInputWindow();
    }
    
    var _Scene_Battle_commandFight = Scene_Battle.prototype.commandFight;
    Scene_Battle.prototype.commandFight = function() {
        FAL.Param.isRepeatBattle = false;
        _Scene_Battle_commandFight.call(this);
    }
    
    var _Scene_Battle_commandEscape = Scene_Battle.prototype.commandEscape;
    Scene_Battle.prototype.commandEscape = function() {
        FAL.Param.isRepeatBattle = false;
        _Scene_Battle_commandEscape.call(this);
    }
    
    BattleManager.processRepeatBattle = function() {
        this.displayRepeatBattleStart();
        $gameParty.makeRepeatActions();
        this.startTurn();
    }
    
    BattleManager.displayRepeatBattleStart = function() {
        // 特に何も表示してない。
    }
    
    ////////////////////////////////////////////////////////////////////////////
    // Game_Actorに選択したアクションを覚えさせる処理
    var _BattleManager_selectNextCommand = BattleManager.selectNextCommand;
    BattleManager.selectNextCommand = function() {
        if (this.actor()) {
            this.actor().setRepeatActions();
        }
        _BattleManager_selectNextCommand.call(this);
    }
    
    Game_Actor.prototype.setRepeatActions = function() {
        if ((this._actions || []).length > 0) this._repeatActions = this._actions.concat();
    }
    
    Game_Party.prototype.makeRepeatActions = function() {
        var members = this.members();
        for (var i = 0; i < members.length; i++) {
            if (members[i].canMove()) {
                var actions = members[i]._repeatActions || [];
                for (var j = actions.length; j < members[i].numActions(); j++) {
                    var action = new Game_Action(members[i]);
                    action.setAttack();
                    actions.push(action);
                }
                members[i]._actions = actions.concat();
            }
        }
    }
    
})();
