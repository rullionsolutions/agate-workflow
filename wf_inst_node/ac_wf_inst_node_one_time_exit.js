"use strict";

var UI = require("lazuli-ui/index.js");


module.exports = UI.Page.clone({
    id              : "ac_wf_inst_node_one_time_exit",
    entity_id       : "ac_wf_inst_node",
    title           : "Task Completed",
    security        : { all: true },
    require_key     : true,
    skin            : "guest.html"
});


module.exports.sections.addAll([
    { id: "main", type: "Section" }
]);


module.exports.defbind("setupEnd", "setupEnd", function () {
    var node = this.getPrimaryRow();
    this.full_title = "Workflow Task Completed";
    this.sections.get("main").text = "Thank you for completing your workflow task - <strong>'" + node.getField("title").get() +
        " - " + node.getField("wf_inst").getText() + "'</strong><br/><br/>" +
        "You can now close this window/tab or click the button below to login to myRecruiter.<br/><br/>" +
        "<a href=\"./index.html\" id=\"login\" class=\"btn css_cmd\" style=\"margin-right:20px;\">Go to Log-in</a>";
});


UI.Page.defbind("setExitURLonOneTimeExit", "setupStart", function () {
    var exit_url_key;
    if (this.allowed && this.allowed.one_time_guest_wf_access) {
        this.skin = "guest.html";
        // Redirect to 'thank you' page if one time guest access
        if (this.performing_wf_nodes && this.performing_wf_nodes[0]) {
            exit_url_key = this.performing_wf_nodes[0].getKey();
        }
        this.exit_url_save = UI.pages.get("wf_inst_node_one_time_exit").getSimpleURL(exit_url_key);
    }
});
