"use strict";

var UI = require("lazuli-ui/index.js");


module.exports = UI.Page.clone({
    id              : "ac_wf_task_sum_list",
    entity_id       : "ac_wf_task_sum",
    title           : "Workflow Task Summary"
//    skin            : "report.html"
});


module.exports.sections.addAll([
    { id: "search", type: "ListQuery", entity: "ac_wf_task_sum", title: " ", level_break_depth: 1 }
]);
