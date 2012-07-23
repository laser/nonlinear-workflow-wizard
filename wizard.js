var CharacterModel = Backbone.Model.extend({
    "defaults": {
        "world": "Krynn"
    }
});

var CreateCharacterView = Marionette.Layout.extend({
    regions: {
        content: ".content"
    },
    showContent : function(view) {
        this.content.show(view);
    },
    template: (function() {
        var t;

        t  = '';
        t += '<h1>Build a Character</h1>';
        t += '<div class="content"></div>';

        return t;
    }())
});

var createCharacterWorkflow = {
    "model":  new CharacterModel(),
    "end": function(completed) {
        if (completed) alert("you completed the workflow!");
        alert("might want to implement something like closing a modal, refreshing page, whatever");
    },
    "start": function() {
        this.nameCharacter(this.end);
    },
    "wizard": new CreateCharacterView(),

    /* individual steps below this point */

    "nameCharacter": function(onPrevious) {
        var view;

        this.nameCharacter.onPrevious = onPrevious || this.nameCharacter.onPrevious;

        view = new NameCharacterView({ "model": this.model });

        view.on("character:named", function() {
            this.selectClass(this.nameCharacter);
        }, this);

        view.on("cancel", function() {
            this.model.unset("name");
            onPrevious();
        }, this);

        this.wizard.showContent(view);
    },
    "selectClass": function(onPrevious) {
        var view;

        this.selectClass.onPrevious = onPrevious || this.nameCharacter.onPrevious;

        view = new SelectClassView({ "model": this.model });

        view.on("class:selected", function() {
            if (this.model.get("class") === "warrior") {
                this.selectSword(this.selectClass);
            }
            else if (this.model.get("class") === "wizard") {
                this.selectSpell(this.selectClass);
            }
        }, this);

        view.on("back", function() {
            this.model.unset("class");
            this.selectClass.onPrevious();
        }, this);

        this.wizard.showContent(view);
    },
    "selectSword": function(onPrevious) {
        var view;

        this.selectSword.onPrevious = onPrevious || this.nameCharacter.onPrevious;

        view = new SelectSwordView({ "model": this.model });

        view.on("sword:selected", function() {
            this.reviewCharacter(this.selectSword);
        }, this);

        view.on("back", function() {
            this.model.unset("sword");
            this.selectSword.onPrevious();
        }, this);

        this.wizard.showContent(view);
    },
    "selectSpell": function(onPrevious) {
        var view;

        view = new SelectSpellView({ "model": this.model });

        this.selectSpell.onPrevious = onPrevious || this.selectSpell.onPrevious;

        view.on("spell:selected", function() {
            this.reviewCharacter(this.selectSpell);
        }, this);

        view.on("back", function() {
            this.model.unset("spell");
            this.selectSpell.onPrevious();
        }, this);

        this.wizard.showContent(view);
    },
    "reviewCharacter": function(onPrevious) {
        var view;

        view = new ReviewCharacterView({ "model": this.model });

        this.reviewCharacter.onPrevious = onPrevious || this.reviewCharacter.onPrevious;

        view.on("character:completed", function(char) {
            this.end(char);
        }, this);

        view.on("back", onPrevious, this);

        this.wizard.showContent(view);
    }
}
