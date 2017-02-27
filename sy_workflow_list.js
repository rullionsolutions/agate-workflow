"use strict";

var UI = require("lazuli-ui/index.js");
var Workflow = require("agate-workflow/index.js");


module.exports = UI.Page.clone({
    id: "sy_workflow_list",
    title: "Workflow Templates",
    security: { sysmgr: true, },
});


module.exports.sections.addAll([
    {
        id: "main",
        type: "ListObjects",
        title: "Workflow Templates",
        container: Workflow.wf_templates,
        column_ids: ["parent", "id", "type", "title", "entity_id",
        ],
        rowURL: function (row_elem, row_obj) {
            row_elem.attribute("url", UI.pages.get("sy_workflow_display").getSimpleURL(row_obj.id)
                + this.getReferURLParams());
        },
    },
]);
