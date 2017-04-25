"use strict";

var Data = require("lazuli-data/index.js");
var Rhino = require("lazuli-rhino/index.js");
var Access = require("lazuli-access/index.js");


Data.entities.get("ac_wf_inst_node").batchPoke = Rhino.AsyncJob.clone({
    id      : "batchPoke",
    interval: 1000 * 60 * 5,        // 5 minutes
    start_inside_tomcat : (Rhino.app.server_purpose !== "prod_alt"),
    stuck_nodes         : {}
});


// Data.entities.get("ac_wf_inst_node").batchPoke.run = function () {
//     var go = true;
//     while (go) {
//         try {
//             java.lang.Thread.currentThread().sleep(this.interval);
//             this.iteration();
//         } catch (ignore) {            // interrupted
//             this.info("batchPoke.run interrupted");
//             go = false;
//         }
//     }
// };

// Note: MOST active automatic nodes will be timer steps, and hence have a due date
// However, SOME may be just waiting indefinitely for some external event, e.g. "Wait Until 1st Interview Done" in UU
// At the moment, it is assumed that these steps will have page = 'ac_wf_inst_node_auto'
// In the future, it will be better to have a separate attribute representing this, e.g. 'Awaiting External Completion'
Data.entities.get("ac_wf_inst_node").batchPoke.define("iteration", function () {
    var query = Data.entities.get("ac_wf_inst_node").getQuery();
    var node_row;
    var session;
    var trans;
    var params;

    query.addCondition({
        column: "attributes",
        operator: "CO",
        value: "AU",
    });
    query.addCondition({
        column: "status",
        operator: "=",
        value: "A",
    });
    query.addCondition({
        column: "due_date",
        operator: "NU",
        value: "",
    });
    query.addCondition({
        column: "page",
        operator: "NE",
        value: "ac_wf_inst_node_auto",
    });        // Wait until 1st Interview Done
    while (query.next()) {
        params = {
            wf_node_id: query.getColumn("A._key").get(),
            title: query.getColumn("A.title").get(),
            page_key: query.getColumn("A.page_key").get(),
            visit_start_time: (new Date()).getTime().toFixed(0),
        };
        if (!this.stuck_nodes[params.wf_node_id]) {
            this.stuck_nodes[params.wf_node_id] = 0;
        }
        this.stuck_nodes[params.wf_node_id] += 1;
        params.node_checks = this.stuck_nodes[params.wf_node_id] || 0;

        // ignore 1st check as might be in progress

        if (params.node_checks === 2) {
            if (!session) {
                session = Access.Session.getNewSession({ user_id: "batch", });
                trans = session.getNewTrans();
            }
            session.newVisit(null, "batchPoke", params, "", params.page_key);
            node_row = trans.getActiveRow("ac_wf_inst_node", params.wf_node_id);
            node_row.performThisAutomatedStep(session);

            session.updateVisit(parseInt(params.visit_start_time, 10));
        } else if (params.node_checks === 3) {
            Data.entities.get("ac_email").create({
                to_addr: "rsl.support@rullion.co.uk",
                subject: "Urgent Stuck WF Node",
                body: "Node " + params.wf_node_id + " seems to be stuck, after " + params.node_checks + " checks",
            }).send();
        }
    }
    query.reset();
    if (trans && trans.active) {
       trans.cancel();
    }
    if (session) {
        session.close();
    }
});


/*
Rhino.app.defbind("startBatchPoke", "loadEnd", function () {
    if (x.inside_tomcat && Rhino.app.server_purpose !== "prod_alt") {
        Data.entities.get("ac_wf_inst_node").batchPoke.runnable = new java.lang.Runnable(Data.entities.get("ac_wf_inst_node").batchPoke);
        Data.entities.get("ac_wf_inst_node").batchPoke.thread   = new java.lang.Thread(Data.entities.get("ac_wf_inst_node").batchPoke.runnable,
            "Data.entities.get("ac_wf_inst_node").batchPoke in " + Rhino.app.id);
        Data.entities.get("ac_wf_inst_node").batchPoke.thread.start();
    }
});

Rhino.app.defbind("stopBatchPoke", "stop", function () {
    if (Data.entities.get("ac_wf_inst_node").batchPoke.thread) {
        Data.entities.get("ac_wf_inst_node").batchPoke.thread.interrupt();
    }
});
*/
