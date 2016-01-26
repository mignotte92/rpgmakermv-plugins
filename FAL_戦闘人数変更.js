/*:
 * @plugindesc 戦闘参加人数を変更し、隊列の概念を導入します
 * @author FAL
 * @version 0.2
 *
 * @help
 * =================================================================
 * 
 * 戦闘参加人数をデフォルトの4人から変更できます。
 * また隊列と攻撃に近距離＆遠距離の概念を導入します。
 * 
 * 後列からの攻撃は通常攻撃なら武器の設定、スキルならスキル自身の設定によりダメージが減少します。
 * 敵から後列への攻撃は通常攻撃なら敵の設定、スキルならスキル自身の設定によりダメージが減少します。
 * 
 * ＜通常攻撃の武器の距離設定＞
 * 　　プラグインパラメータの Ranged Weapons ID に遠距離攻撃可能な武器タイプIDを設定してください。
 * 
 * ＜エネミーの通常攻撃の距離設定＞
 * 　　エネミーのメモ欄に <Ranged Attacker> と記入すると、そのエネミーは通常攻撃で隊列の影響を受けなくなります。
 * 
 * ＜スキルの距離設定＞
 * 　　スキルのメモ欄に <Ranged Skill> と記入すると、そのスキルは隊列の影響を受けなくなります。
 * 
 * ＜プラグインコマンド＞
 * 　　SetPartyFrontAndBack x y
 * 　　　　x: (整数) 隊列の前衛の数
 * 　　　　y: (整数) 隊列の後衛の数
 * 　　現在の隊列の前衛後衛の数の変更を行います。
 * 
 * =================================================================
 * 
 * @param Ranged Weapons ID
 * @desc 遠距離攻撃の可能な武器タイプID
 * @default 7, 8, 9
 * 
 * @param Front Battle Members
 * @desc 隊列の前衛の数
 * 3ならば先頭から3人が前衛として戦闘に参加します
 * @default 3
 * 
 * @param Back Battle Members
 * @desc 隊列の後衛の数
 * 3ならば前衛の数の後の3人が後衛として戦闘に参加します
 * @default 3
 * 
 * @param Back Given Damage Reduce Rate
 * @desc 後列から攻撃した時の与ダメージの減少率（0～1の小数）
 * 0.2ならば20%ダメージカット
 * @default 0.333
 * 
 * @param Back Gain Damage Reduce Rate
 * @desc 後列が攻撃された時の被ダメージの減少率（0～1の小数）
 * 0.2ならば20%ダメージカット
 * @default 0.333
 * 
 */

var Imported = Imported || {};
Imported.FAL_戦闘人数変更 = true;

var FAL = FAL || {};

FAL.Parameters = PluginManager.parameters('FAL_戦闘人数変更');
FAL.Param = FAL.Param || {};

FAL.Param.rangedWeapons = String(FAL.Parameters['Ranged Weapons ID']).split(',').map(function(v){return parseInt(v)});
FAL.Param.numFrontBattleMembers = Number(FAL.Parameters['Front Battle Members']);
FAL.Param.numBackBattleMembers = Number(FAL.Parameters['Back Battle Members']);
FAL.Param.backGivenDamageReduceRate = Number(FAL.Parameters['Back Given Damage Reduce Rate']);
FAL.Param.backGainDamageReduceRate = Number(FAL.Parameters['Back Gain Damage Reduce Rate']);

(function() {
    
    Game_Party.prototype.maxBattleMembers = function() {
        return FAL.Param.numFrontBattleMembers + FAL.Param.numBackBattleMembers; // default 4
    }
    
    Game_Action.prototype.evalDamageFormula = function(target) {
        try {
            var item = this.item();
            var a = this.subject();
            var b = target;
            var v = $gameVariables._data;
            var sign = ([3, 4].contains(item.damage.type) ? -1 : 1);
            var damage = Math.max(eval(item.damage.formula), 0) * sign;
            
            if (sign > 0 && FAL.Param.numBackBattleMembers > 0) {
                if (a.isActor() && b.isEnemy() && $gameParty.battleMembers().indexOf(a) >= FAL.Param.numFrontBattleMembers) {
                    if (item.id === 1) {
                        if (!FAL.Param.rangedWeapons.contains(a.weapons()[0]?a.weapons()[0].wtype:-1)) {
                            damage -= damage * FAL.Param.backGivenDamageReduceRate;
                        }
                    } else {
                        if (!item.meta['Ranged Skill']) {
                            damage -= damage * FAL.Param.backGivenDamageReduceRate;
                        }
                    }
                } else if (a.isEnemy() && b.isActor() && $gameParty.battleMembers().indexOf(b) >= FAL.Param.numFrontBattleMembers) {
                    if (item.id === 1) {
                        if (!$dataEnemies[a.enemyId()].meta['Ranged Attacker']) {
                            damage -= damage * FAL.Param.backGainDamageReduceRate;
                        }
                    } else {
                        if (!item.meta['Ranged Skill']) {
                            damage -= damage * FAL.Param.backGainDamageReduceRate;
                        }
                    }
                }
            }
            
            return damage;
        } catch (e) {
            return 0;
        }
    }
    
    /////////////////////////////////////////////////////////////////////////////////////////////
    // ゲーム内から隊列の前衛と後衛の数を変えるプラグインコマンド
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        if (command === 'SetPartyFrontAndBack' && args.length === 2) {
            FAL.Param.numFrontBattleMembers = parseInt(args[0]);
            FAL.Param.numBackBattleMembers = parseInt(args[1]);
        }
        
        _Game_Interpreter_pluginCommand.call(this, command, args);
    }
    
    /////////////////////////////////////////////////////////////////////////////////////////////
    // 共用関数
    FAL.ajustNumByNumOfBattleMembers = function(defaultNum) {
        return Math.min(
            Math.floor(defaultNum * (4/(FAL.Param.numFrontBattleMembers + FAL.Param.numBackBattleMembers))),
            defaultNum
        );
    }
    
    /////////////////////////////////////////////////////////////////////////////////////////////
    // 戦闘画面の暫定対処
    var _Window_BattleStatus_initialize = Window_BattleStatus.prototype.initialize;
    Window_BattleStatus.prototype.initialize = function() {
        _Window_BattleStatus_initialize.call(this);
        this.contents.fontSize = FAL.ajustNumByNumOfBattleMembers(28); // default 28
    }
    
    Window_BattleStatus.prototype.lineHeight = function() {
        return Math.floor(36 * (4/(FAL.Param.numFrontBattleMembers + FAL.Param.numBackBattleMembers))); // default 36
    }
    
    Window_BattleStatus.prototype.numVisibleRows = function() {
        return FAL.Param.numFrontBattleMembers + FAL.Param.numBackBattleMembers; // default 4
    }
    
    Window_BattleStatus.prototype.maxCols = function() {
        return 1; // default 1
    }
    
    /////////////////////////////////////////////////////////////////////////////////////////////
    // メニュー画面の暫定対処
    var _Window_MenuStatus_initialize = Window_MenuStatus.prototype.initialize;
    Window_MenuStatus.prototype.initialize = function(x, y) {
        _Window_MenuStatus_initialize.call(this, x, y);
        this.contents.fontSize = FAL.ajustNumByNumOfBattleMembers(28); // default 28
    }
    
    Window_MenuStatus.prototype.lineHeight = function() {
        return Math.floor(36 * (4/(FAL.Param.numFrontBattleMembers + FAL.Param.numBackBattleMembers))); // default 36
    }
    
    Window_MenuStatus.prototype.numVisibleRows = function() {
        return FAL.Param.numFrontBattleMembers + FAL.Param.numBackBattleMembers; // default 4
    };
    
    Window_MenuStatus.prototype.maxCols = function() {
        return 1; // default 1
    }
    
})();
