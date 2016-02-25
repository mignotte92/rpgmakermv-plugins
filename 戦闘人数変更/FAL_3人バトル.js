/*:
 * @plugindesc 3人パーティ用にUIを変更します。
 * @author FAL
 * @version 0.1
 *
 * @help
 * =================================================================
 * 
 * 戦闘参加人数を3人にしてそれ用にUIを変更します。
 * 
 * =================================================================
 * 
 */

var Imported = Imported || {};
Imported.FAL_3人バトル = true;

var FAL = FAL || {};

FAL.Parameters = PluginManager.parameters('FAL_3人バトル');
FAL.Param = FAL.Param || {};

(function() {
    
    Game_Party.prototype.maxBattleMembers = function() {
        return 3; // default 4
    }
    
    /////////////////////////////////////////////////////////////////////////////////////////////
    // 戦闘画面の対処
    Window_BattleStatus.prototype.standardFontSize = function() {
        return 18; // default 28
    }
    
    Window_BattleStatus.prototype.windowWidth = function() {
        return Graphics.boxWidth - 192;
    };
    
    Window_BattleStatus.prototype.windowHeight = function() {
        return 180; // return this.fittingHeight(this.numVisibleRows()); // =180
    };
    
    Window_BattleStatus.prototype.standardPadding = function() {
        return 18; // default 18
    };
    
    Window_BattleStatus.prototype.lineHeight = function() {
        return 24; // default 36
    }
    
    Window_BattleStatus.prototype.numVisibleRows = function() {
        return 6; // default 4
    }
    
    Window_BattleStatus.prototype.maxCols = function() {
        return 3; // default 1
    }
    
    Window_BattleStatus.prototype.itemHeight = function() {
        return this.lineHeight() * this.numVisibleRows();
    };
    
    Window_BattleStatus.prototype.basicAreaRect = function(index) {
        var rect = this.itemRectForText(index);
        return rect;
    };
    
    Window_BattleStatus.prototype.gaugeAreaRect = function(index) {
        var rect = this.itemRectForText(index);
        return rect;
    };
    
    Window_BattleStatus.prototype.drawBasicArea = function(rect, actor) {
        var lineHeight = this.lineHeight();
        this.drawActorFace(actor, rect.x, rect.y, rect.width, lineHeight * 4);
        this.drawActorName(actor, rect.x + 0, rect.y + lineHeight * 3, rect.width);
        this.drawActorIcons(actor, rect.x + 0, rect.y + 0, rect.width);
    };
    
    Window_BattleStatus.prototype.drawGaugeAreaWithTp = function(rect, actor) {
        var lineHeight = this.lineHeight();
        var hpGaurgeWidth = rect.width;
        var mpTpGaurgeWidth = (rect.width - 8) / 2;
        this.drawActorHp(actor, rect.x + 0, rect.y + lineHeight * 4, hpGaurgeWidth);
        this.drawActorMp(actor, rect.x + 0, rect.y + lineHeight * 5, mpTpGaurgeWidth);
        this.drawActorTp(actor, rect.x + mpTpGaurgeWidth + 8, rect.y + lineHeight * 5, mpTpGaurgeWidth);
    };
    
    Window_BattleStatus.prototype.drawGaugeAreaWithoutTp = function(rect, actor) {
        var lineHeight = this.lineHeight();
        var gaurgeWidth = rect.width;
        this.drawActorHp(actor, rect.x + 0, rect.y + lineHeight * 4, gaurgeWidth);
        this.drawActorMp(actor, rect.x + 0,  rect.y + lineHeight * 5, gaurgeWidth);
    };
    
    /////////////////////////////////////////////////////////////////////////////////////////////
    // メニュー画面の対処
    Window_MenuStatus.prototype.standardFontSize = function() {
        return 28; // default 28
    }
    
    Window_MenuStatus.prototype.lineHeight = function() {
        return 36; // default 36
    }
    
    Window_MenuStatus.prototype.numVisibleRows = function() {
        return 3; // FAL.Param.numFrontBattleMembers + FAL.Param.numBackBattleMembers; // default 4
    };
    
    Window_MenuStatus.prototype.maxCols = function() {
        return 1; // default 1
    }
    
    Window_MenuStatus.prototype.drawItemStatus = function(index) {
        var actor = $gameParty.members()[index];
        var rect = this.itemRect(index);
        var x = rect.x + 162;
        var y = rect.y + rect.height / 2 - this.lineHeight() * 2;
        var width = rect.width - x - this.textPadding();
        this.drawActorSimpleStatus(actor, x, y, width);
    };
    
    Window_MenuStatus.prototype.drawActorSimpleStatus = function(actor, x, y, width) {
        var lineHeight = this.lineHeight();
        var x2 = x + 180;
        var width2 = Math.min(200, width - 180 - this.textPadding());
        this.drawActorName(actor, x, y);
        this.drawActorIcons(actor, x, y + lineHeight * 1);
        this.drawActorLevel(actor, x, y + lineHeight * 2);
        this.drawText('Next', x, y + lineHeight * 3);
        this.drawText(actor.nextRequiredExp(), x, y + lineHeight * 3, 164, 'right');
        this.drawActorClass(actor, x2, y);
        this.drawActorHp(actor, x2, y + lineHeight * 1, width2);
        this.drawActorMp(actor, x2, y + lineHeight * 2, width2);
        this.drawActorTp(actor, x2, y + lineHeight * 3, width2);
    };
    
})();
