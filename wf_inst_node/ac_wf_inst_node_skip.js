"use strict";

var UI = require("lazuli-ui/index.js");


module.exports = UI.Page.clone({
    id              : "ac_wf_inst_node_skip",
    entity_id       : "ac_wf_inst_node",
    title           : "Skip this Step",
    short_title     : "Skip",
    transactional   : true,
    requires_key    : true,
    dscrptn         : "Force this step to be skipped so that the Workflow can continue"
});


module.exports.sections.addAll([
    { id: "display" , type: "Display"   , entity: "ac_wf_inst_node" },
    { id: "next_nds", type: "ListQuery" , entity : "ac_wf_inst_node", link_field: "prev_node", title: "Transitions to Next Nodes" },
//    { id: "trans_to", type: "ListQuery" , entity: "ac_wf_inst_trns", link_field: "from_node", title: "Transitions from This" },
    { id: "params"  , type: "FormParams", title: "Specify the Outcome" }
]);


module.exports.defbind("setupEnd", "setupEnd", function () {
    this.sections.get("params").fieldset.addFields([
        { id: "outcome_id", type: "Text", label: "Outcome", mandatory: true }
    ]);
    this.getPrimaryRow();
    this.sections.get("next_nds").columns.get("wf_inst").visible = false;
});


module.exports.defbind("presaveSkip", "presave", function () {
    var fieldset = this.sections.get("params").getFieldSet();
    this.getPrimaryRow().skip(fieldset.getField("outcome_id").get());
});
