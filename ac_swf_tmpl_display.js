"use strict";

var UI = require("lazuli-ui/index.js");
var Data = require("lazuli-data/index.js");


module.exports = UI.Page.clone({
    id: "ac_swf_tmpl_display",
    area_id: "ac",
    title: "Stateful Workflow Template",
});


module.exports.sections.addAll([
    {
        id: "nodes",
        type: "Section",
        // title: "Template",
        text: "Workflow States are shown as boxes.<br/>Page transitions are shown as the black arrows, "
            + "where a page has multiple outcomes, these are shown in square brackets after the page title.<br/>"
            + "Auto transitions are shown as the grey arrows, and are evaluated in the sequential order shown, starting at zero. "
            + "The first auto transition evaluating to true is performed.",
    },
]);


module.exports.defbind("getParameters", "updateAfterSections", function (params) {
    var field = Data.WorkflowState.templates[params.wf_tmpl_id];
    this.sections.get("nodes").field = field;
    this.full_title = this.title + ": " + field.label;
});


module.exports.sections.get("nodes").defbind("showWorkflow", "render", function (render_opts) {
    var outer_elem = this.getSectionElement(render_opts).makeElement("div");
    outer_elem.attr("class", "css_type_dotgraph");
    outer_elem.makeElement("div", "css_disp").text(this.field.getTemplateDotGraph());
});
