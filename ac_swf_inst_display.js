"use strict";

var UI = require("lazuli-ui/index.js");


module.exports = UI.Page.clone({
    id: "ac_swf_inst_display",
    area: "ac",
    entity_id       : "ac_wf_inst",
    title: "Stateful Workflow Instance",
    requires_key: true,
});


module.exports.sections.addAll([
    {
        id: "nodes",
        type: "ListQuery",
        entity: "ac_wf_inst_node",
        link_field: "wf_inst",
        // title: "Template",
    },
]);


module.exports.defbind("showHideColumns", "setupEnd", function () {
    this.sections.get("nodes").columns.get("seq_number").visible = true;
    this.sections.get("nodes").columns.get("id").visible = false;
    this.sections.get("nodes").columns.get("activated_at").visible = true;
    this.sections.get("nodes").columns.get("due_date").visible = true;
    this.sections.get("nodes").columns.get("rmdr_date").visible = true;
});

// UI.pages.get(ac_swf_inst_display).defbind("getParameters", "updateAfterSections", function (params) {
//     var entity = Data.entities.get(params.entity_id);
//     var field = entity.getField(params.field_id);
//     this.sections.get("nodes").field = field;
//     this.full_title = this.title + ": " + field.label;
// });

// UI.pages.get(ac_swf_tmpl_display).sections.get("nodes").defbind("showWorkflow", "render", function (render_opts) {
//     var outer_elem = this.getSectionElement(render_opts).addChild("div");
//     outer_elem.attr("class", "css_type_dotgraph");
//     outer_elem.addChild("div", null, "css_disp").text(this.field.getTemplateDotGraph());
// });
