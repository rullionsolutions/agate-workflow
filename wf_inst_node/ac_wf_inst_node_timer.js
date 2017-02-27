"use strict";

var UI = require("lazuli-ui/index.js");
var Data = require("lazuli-data/index.js");


module.exports = UI.pages.get("ac_wf_inst_node_auto").clone({
    id              : "ac_wf_inst_node_timer",
    title           : "Workflow Timer Step"
});


module.exports.define("outcomes", {
    save: { label: "save", main_button: true },
    skip: { label: "skip" }
});


module.exports.defbind("updateAfterSections", "updateAfterSections", function (params) {
    var node     = this.getPrimaryRow(),
        due_date = node.getField("due_date");
    if (due_date.get() > Data.Date.parse("today")) {
        params.page_button = "cancel";
    } else if (due_date.isBlank()) {
        node.skip();
        params.page_button = "skip";
    } else {
        params.page_button = "save";
    }
});
