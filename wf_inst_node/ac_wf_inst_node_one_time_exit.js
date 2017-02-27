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
