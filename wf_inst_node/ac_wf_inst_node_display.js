"use strict";

var UI = require("lazuli-ui/index.js");


module.exports = UI.Page.clone({
    id              : "ac_wf_inst_node_display",
    entity_id       : "ac_wf_inst_node",
    title           : "Workflow Instance Node",
    requires_key    : true
});


module.exports.sections.addAll([
    { id: "main"    , type: "Display"      , entity : "ac_wf_inst_node" },
    { id: "next_nds", type: "ListQuery"    , entity : "ac_wf_inst_node", link_field: "prev_node", title: "Transitions to Next Nodes" },
//    { id: "trans_fr", type: "ListQuery"    , entity : "ac_wf_inst_trns", link_field: "from_node", title: "Transitions from This" },
//    { id: "trans_to", type: "ListQuery"    , entity : "ac_wf_inst_trns", link_field:   "to_node", title: "Transitions to This" },
//    { id: "param"   , type: "ListQuery"    , entity : "ac_wf_inst_parm", link_field: "wf_inst_node" },
    { id: "chg_hist", type: "ChangeHistory", entity : "ac_wf_inst_node", title : "Change History" }
]);


module.exports.links.addAll([
    { id: "add_node", page_to: "ac_wf_inst_node_add"    , page_key: "{page_key}" },
    { id: "correct" , page_to: "ac_wf_inst_node_correct", page_key: "{page_key}" },
    { id: "skip"    , page_to: "ac_wf_inst_node_skip"   , page_key: "{page_key}" }
]);


module.exports.defbind("setupEnd", "setupEnd", function () {
    this.sections.get("next_nds").columns.get("wf_inst"   ).visible = false;
    this.sections.get("next_nds").columns.get("prev_node" ).visible = false;
    this.sections.get("next_nds").columns.get("outcome_id").visible = true;
    this.sections.get("next_nds").columns.moveTo("outcome_id", 1);
});
