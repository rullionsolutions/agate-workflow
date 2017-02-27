"use strict";

var UI = require("lazuli-ui/index.js");
var Workflow = require("agate-workflow/index.js");


module.exports = UI.Page.clone({
    id              : "sy_workflow_display",
    title           : "Display this Workflow Template",
    requires_key    : true,
    security        : { sysmgr: true }
});


module.exports.sections.addAll([
    { id: "dotg" , type: "FormParams"    , title: "Graph", layout: "fluid" }
]);


module.exports.defbind("setupEnd", "setupEnd", function () {
    this.source_obj = Workflow.wf_templates.getThrowIfUnrecognized(this.page_key);
    this.sections.get("dotg").fieldset.addField(
        { id: "graph", type: "DotGraph", label: "", editable: false }
    ).set(this.source_obj.getTemplateDotGraph());
});
