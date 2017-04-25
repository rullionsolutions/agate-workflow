"use strict";


var UI = require("lazuli-ui/index.js");
var Data = require("lazuli-data/index.js");
var Access = require("lazuli-access/index.js");
var menu2;
var menu3;


Data.entities.get("ac_user").addFields([
    { id: "wf_inst"          , label: "Workflow Instance", type: "Reference", editable: false, ref_entity: "ac_wf_inst" }
]);


UI.pages.get("ac_user_display").sections.addAll([
    { id: "current" , type: "ListQuery"    , tab: "workflow", entity: "ac_wf_inst_node", link_field: "assigned_user", title: "Current Tasks" },
    { id: "done"    , type: "ListQuery"    , tab: "workflow", entity: "ac_wf_inst_node", link_field: "assigned_user", title: "Completed Tasks" },
]);

UI.pages.get("ac_user_display").defbind("setupEnd", "setupEnd", function () {
    this.sections.get("current").query.addCondition({ column: "A.status", operator: "=", value: "A" });        // active
    this.sections.get("current").columns.get("id"          ).visible = false;
    this.sections.get("current").columns.get("status"      ).visible = false;
    this.sections.get("current").columns.get("due_date"    ).visible = true;

    this.sections.get("done"   ).query.addCondition({ column: "A.status", operator: "=", value: "C" });        // completed
    this.sections.get("done"   ).columns.get("id"          ).visible = false;
    this.sections.get("done"   ).columns.get("status"      ).visible = false;
    this.sections.get("done"   ).columns.get("simple_url"  ).visible = false;
    this.sections.get("done"   ).columns.get("completed_at").visible = true;
    this.sections.get("done"   ).columns.get("completed_by").visible = true;
});


UI.pages.get("sy_home").sections.addAll([
    { id: "overdue_tasks", type: "ListQuery", tab: "curr", entity: "ac_wf_inst_node", title: "Overdue Tasks" },
]);


menu2 = Access.MenuItem.getItemByModule("ac");
menu3 = menu2.addChild({ label: "Workflow" });
menu3.addChild({ page: "ac_wf_task_sum_list" });
menu3.addChild({ page: "ac_wf_inst_search" });
menu3.addChild({ page: "ac_wf_inst_node_search" });
