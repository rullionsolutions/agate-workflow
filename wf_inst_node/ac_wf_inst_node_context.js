"use strict";

var UI = require("lazuli-ui/index.js");


module.exports = UI.ContextPage.clone({
    id              : "ac_wf_inst_node_context",
    entity_id       : "ac_wf_inst_node",
    title           : "Workflow Instance Node",
    requires_key    : true
});


module.exports.sections.addAll([
    { id: "display"  , type: "Display", entity: "ac_wf_inst_node" }
]);
