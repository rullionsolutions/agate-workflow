"use strict";

var UI = require("lazuli-ui/index.js");


module.exports = UI.Page.clone({
    id              : "ac_wf_inst_unfreeze",
    entity_id       : "ac_wf_inst",
    title           : "Unfreeze this Workflow",
    short_title     : "Unfreeze",
    transactional   : true,
    requires_key    : true
});


module.exports.sections.addAll([
    { id: "display" , type: "Display"   , entity: "ac_wf_inst" },
    { id: "current" , type: "ListQuery" , entity: "ac_wf_inst_node", link_field: "wf_inst", title: "Current Nodes" }
]);


module.exports.defbind("setupEnd", "setupEnd", function () {
    this.sections.get("current").query.addCondition({ full_condition: "A.status IN ( 'A', 'F' )" });    // Active, Frozen
    this.sections.get("current").columns.get("rmdr_date"   ).visible = true;
    this.sections.get("current").columns.get( "due_date"   ).visible = true;
    this.getPrimaryRow();
});


module.exports.defbind("presaveUnfreeze", "presave", function () {
    this.getPrimaryRow().unfreeze();
});
