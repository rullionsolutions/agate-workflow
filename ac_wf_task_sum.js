"use strict";

var Data = require("lazuli-data/index.js");


module.exports = Data.Entity.clone({
    id              : "ac_wf_task_sum",
    title           : "Workflow Task Summary Record",
    area            : "ac",
    view_only       : true,
    label_pattern   : "{wf_tmpl}.{wf_tmpl_node}",
    default_order   : "wf_tmpl,wf_tmpl_node",
    primary_key     : "wf_tmpl,wf_tmpl_node"
});


module.exports.define("getCountURL", function () {
    var url;
    if (this.owner && this.owner.isKeyComplete()) {
        url = "index.html?page_id=ac_wf_inst_node_search&page_button=url_search&status_0_filt=A" +
            "&wf_tmpl_0_oper=EQ&wf_tmpl_0_filt="           + this.owner.getField("wf_tmpl"     ).get() +
            "&wf_tmpl_node_0_oper=EQ&wf_tmpl_node_0_filt=" + this.owner.getField("wf_tmpl_node").get();
        if (this.due_interval) {
            url += "&due_date_0_oper=LT&due_date_0_filt=" + Date.parse("today+-" + this.due_interval).internal();
        }
    }
    return url;
});


module.exports.addFields([
    { id: "wf_tmpl"             , label: "Workflow Template"      , type: "Text"    , list_column: true, data_length: 25,
        collection_id: "wf_templates", url_pattern: "?page_id=sy_workflow_display&page_key={val}" },
    { id: "wf_tmpl_node"        , label: "WF Template Node"       , type: "Text"    , list_column: true, data_length: 80 },
    { id: "tasks_active"        , label: "Active Tasks"           , type: "Number"  , list_column: true, aggregation: "S",
        getURLFromVal: module.exports.getCountURL },
    { id: "tasks_overdue"       , label: "Overdue Tasks"          , type: "Number"  , list_column: true, aggregation: "S",
        getURLFromVal: module.exports.getCountURL, due_interval: "0days" },
    { id: "tasks_overdue_1week" , label: "Tasks Overdue > 1 week" , type: "Number"  , list_column: true, aggregation: "S",
        getURLFromVal: module.exports.getCountURL, due_interval: "1weeks" },
    { id: "tasks_overdue_1month", label: "Tasks Overdue > 1 month", type: "Number"  , list_column: true, aggregation: "S",
        getURLFromVal: module.exports.getCountURL, due_interval: "1months" }
]);


module.exports.define("views", [
    "SELECT I.wf_tmpl, N.wf_tmpl_node, COUNT(*) as tasks_active, " +
    "       SUM(IF(         N.due_date                    < DATE(NOW()), 1, 0)) as tasks_overdue, " +
    "       SUM(IF(DATE_ADD(N.due_date, INTERVAL 1 WEEK ) < DATE(NOW()), 1, 0)) as tasks_overdue_1week, " +
    "       SUM(IF(DATE_ADD(N.due_date, INTERVAL 1 MONTH) < DATE(NOW()), 1, 0)) as tasks_overdue_1month, " +
    "       CONCAT(I.wf_tmpl, '.', N.wf_tmpl_node) as _key " +
    "  FROM ac_wf_inst_node N " +
    " INNER JOIN ac_wf_inst I ON I._key = N.wf_inst " +
    " WHERE N.status = 'A' " +
    " GROUP BY I.wf_tmpl, N.wf_tmpl_node "
]);
