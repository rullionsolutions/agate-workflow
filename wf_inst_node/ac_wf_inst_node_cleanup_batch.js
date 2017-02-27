"use strict";

var Data = require("lazuli-data/index.js");
var SQL = require("lazuli-sql/index.js");
var UI = require("lazuli-ui/index.js");
var Rhino = require("lazuli-rhino/index.js");


// ac_wf_inst_node_cleanup_batch
Data.entities.get("ac_wf_inst_node").silence_tasks_older_than_days = 28;

Data.entities.get("ac_wf_inst_node").freeze_tasks_older_than_days = 730;

Rhino.app.defbind("ac_wf_inst_node_cleanup_batch", "dailyBatch", function (session) {
    session.getPage("ac_wf_inst_node_cleanup_batch").update({ page_button: "save" });
});


module.exports = UI.Page.clone({
    id              : "ac_wf_inst_node_cleanup_batch",
    entity_id       : "ac_wf_inst_node",
    title           : "Batch Cleanup Nodes"
});


module.exports.buttons.addAll([
    { id: "save"  , label: "Save", main_button: true, css_class: "btn-primary" },
    { id: "cancel", label: "Cancel" }
]);


module.exports.defbind("updateAfterSections", "updateAfterSections", function (params) {
    var node_query,
        node_row,
        trans;

    if (params.page_button !== "save") {
        return;
    }
    node_query = Data.entities.get("ac_wf_inst_node").getQuery();
    node_query.addCondition({ column: "A.status", operator: "=", value: "A" });
    node_query.addCondition({ full_condition: "A.attributes LIKE '%ST%'" });
    node_query.addCondition({ full_condition: "DATEDIFF(DATE(now()), A.due_date) > " + SQL.Connection.escape(Data.entities.get("ac_wf_inst_node").silence_tasks_older_than_days) });
    while (node_query.next()) {
        trans = this.session.getNewTrans({ page: this });
        node_row = node_query.getRow(trans);
        node_row.getField("attributes").setItem("ST", false);
        trans.save();
    }
    node_query.reset();

    node_query = Data.entities.get("ac_wf_inst_node").getQuery();
    node_query.addCondition({ column: "A.status", operator: "=", value: "A" });
    node_query.addCondition({ full_condition: "DATEDIFF(DATE(now()), A.activated_on) > " + SQL.Connection.escape(Data.entities.get("ac_wf_inst_node").freeze_tasks_older_than_days) });
    while (node_query.next()) {
        trans = this.session.getNewTrans({ page: this });
        node_row = node_query.getRow(trans);
        node_row.freeze();
        trans.save();
    }
    node_query.reset();
});
