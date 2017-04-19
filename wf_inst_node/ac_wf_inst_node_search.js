"use strict";

var UI = require("lazuli-ui/index.js");
var Data = require("lazuli-data/index.js");


module.exports = UI.SearchPage.clone({
    id              : "ac_wf_inst_node_search",
    entity_id       : "ac_wf_inst_node",
    title           : "Search for Workflow Instance Nodes",
    short_title     : "Workflow Instance Nodes"
});


module.exports.sections.addAll([
    { id: "main", type: "Search", entity: "ac_wf_inst_node" }
]);


module.exports.defbind("addCriteria", "setupEnd", function () {
    this.sections.get("main").criteria.add(Data.entities.get("ac_wf_inst").getField("wf_tmpl").clone({
        id: "wf_tmpl",
        sql_function: "(SELECT ZI.wf_tmpl FROM ac_wf_inst ZI WHERE ZI._key = A.wf_inst)"
    }));
});
