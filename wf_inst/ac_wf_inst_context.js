"use strict";

var UI = require("lazuli-ui/index.js");


module.exports = UI.ContextPage.clone({
    id              : "ac_wf_inst_context",
    entity_id       : "ac_wf_inst",
    title           : "Workflow Instance",
    requires_key    : true
});


module.exports.sections.addAll([
    { id: "main"    , type: "Display", entity: "ac_wf_inst" }
]);


module.exports.links.addAll([
    { id: "skip"    , page_to: "ac_wf_inst_skip"      , page_key: "{page_key}" },
    { id: "freeze"  , page_to: "ac_wf_inst_freeze"    , page_key: "{page_key}" },
    { id: "unfreeze", page_to: "ac_wf_inst_unfreeze"  , page_key: "{page_key}" }
]);
