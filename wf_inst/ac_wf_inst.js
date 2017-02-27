"use strict";

var Core = require("lapis-core/index.js");
var Data = require("lazuli-data/index.js");
var Workflow = require("agate-workflow/index.js");


module.exports = Data.Entity.clone({
    id              : "ac_wf_inst",
    title           : "Workflow Instance",
    area            : "ac",
    primary_key     : "id",
    default_order   : "_key",
    transactional   : true,
    display_page    : true,
    autocompleter   : true,
    label_pattern   : "{title}",
    nodes           : Core.OrderedMap.clone({ id: "ac_wf_inst.nodes" }),
    actors          : Core.OrderedMap.clone({ id: "ac_wf_inst.actors" }),
});


module.exports.addFields([
    { id: "id"            , label: "Id"               , type: "Number"   , editable: false, list_column: true, search_criterion: true, decimal_digits: 0, auto_generate: true },
    { id: "title"         , label: "Title"            , type: "Text"     , editable: false, data_length: 255, dscrptn : "The name given to this instance." },
    { id: "wf_tmpl"       , label: "Workflow Template", type: "Text"     , editable: false, list_column: true, search_criterion: true, data_length: 25,
        config_item: "wf_templates", url_pattern: "?page_id=sy_workflow_display&page_key={val}" },
    { id: "base_record"   , label: "Base Record"      , type: "Flex"     , editable: false, list_column: true, description: "The record to which this action relates, shown as record number and description." },
    { id: "entity"        , label: "Base Entity"      , type: "Text"     , editable: false, data_length: 25, config_item: "entities", description : "The entity upon which this WF instance acts." },
    { id: "key_string"    , label: "Key String"       , type: "Text"     , editable: false, data_length: 255, description: "The key of the record upon which this WF instance acts." },
    { id: "status"        , label: "Overall Status"   , type: "Option"   , editable: false, list_column: false, visible: false, /*list_column: true, search_criterion: true,*/ list: "ac.node_status", default_val: "P" },
    { id: "created_at"    , label: "Created At"       , type: "Reference", editable: false, ref_entity: "ac_tx", description: "The transaction that created this workflow instance." },
    { id: "created_by"    , label: "Created By"       , type: "Reference", editable: false, ref_entity: "ac_user", description: "The user that created this workflow instance." },
    { id: "prnt_inst"     , label: "Parent Workflow Instance"     , type: "Reference", editable: false, ref_entity: "ac_wf_inst" },
    { id: "prnt_inst_node", label: "Parent Workflow Instance Node", type: "Reference", editable: false, ref_entity: "ac_wf_inst_node" },
    { id: "dotgraph"      , label: "Graph"            , type: "DotGraph" , editable: false, sql_function: "'X'",
        getComputed: function () { return this.owner.getDotGraph(); }
    }
]);


module.exports.define("indexes", [ "wf_tmpl, created_at" ]);


module.exports.defbind("cloneNodesActors", "cloneType", function () {
    this.nodes = this.parent.nodes.clone({ id: "ac_wf_inst.nodes" });
    this.nodes.wf_tmpl = this;
    this.actors = this.parent.actors.clone({ id: "ac_wf_inst.actors" });
    this.actors.wf_tmpl = this;
});


module.exports.override("getTransRow", function (trans, action, key, addl_data) {
    var row_number = trans.row_number,
        row,
        template;

    trans.row_number += 1;
    if (action === "C") {           // if creating a new wf_inst, addl_data is the template id
        template = Workflow.wf_templates[addl_data];
    } else {                        // if loading an existing wf_inst, key is the key of the wf_inst
        row = this.getRow(key);
        template = Workflow.wf_templates[row.getField("wf_tmpl").get()];
    }
    row = template.clone({
        id        : this.id,
        connection: trans.connection,
        trans     : trans,
        modifiable: true,
        instance  : true,
        row_number: row_number,
        id_prefix : "_" + row_number,
        action    : action
    });
    row.messages = Data.MessageManagerRow.clone({ id: "row_" + row.row_number, row: row, prefix: (row.row_number === 0) ? "" : row.title });
    return row;
});


module.exports.define("instantiate", function (trans, template_id, key) {
    var wf_inst_row,
        flex;

    if (typeof key !== "string") {
        this.throwError({ id: "workflow_requires_key_string" });
    }
    wf_inst_row = trans.createNewRow("ac_wf_inst", template_id);
    wf_inst_row.getField("wf_tmpl").set(template_id);
    if (wf_inst_row.entity_id) {
        wf_inst_row.getField("entity").set(wf_inst_row.entity_id);
        flex = wf_inst_row.getField("base_record");
        flex.reset({ id: "base_record", type: "Reference", label: "Base Record",
            ref_entity: wf_inst_row.entity_id });
        flex.set(key);
    }
    wf_inst_row.getField("key_string").set(key);
    wf_inst_row.getField("created_at").set(trans.id);
    if (trans.session) {
        wf_inst_row.getField("created_by").set(trans.session.user_id);
    }
    wf_inst_row.first_node = wf_inst_row.createNode(wf_inst_row.first_node_id);
    wf_inst_row.first_node.getField("seq_number").set(0);
    if (wf_inst_row.create_pending_nodes) {
        wf_inst_row.first_node.createNextNodes();
    }
    wf_inst_row.first_node.activate();
//    wf_inst_row.getField("status").set("A"); - done by activate()
    return wf_inst_row;
});


module.exports.define("retrieve", function (trans, inst_id) {
    return trans.getActiveRow("ac_wf_inst", inst_id);
});


module.exports.define("createNode", function (tmpl_node_id) {
    var inst_node_row = this.trans.createNewRow("ac_wf_inst_node", { wf_inst: this, tmpl_node_id: tmpl_node_id });
    return inst_node_row;
});


module.exports.define("getNode", function (node_id) {
    var key = this.getKey() + "." + node_id;
    return this.trans.getActiveRow("ac_wf_inst_node", key);
});


module.exports.define("getBaseRecord", function () {
    return this.trans.getActiveRow(this.getField("entity").get(), this.getField("key_string").get());
});


// id of the template node
module.exports.define("getActiveNode", function (tmpl_node_id) {
    var out_node,
        trans = this.trans;

    this.eachLinkedRow("ac_wf_inst_node", "wf_inst", function (node, query) {
        if (!out_node && !node && query.getColumn("A.status").get() === "A" &&
                (!tmpl_node_id || query.getColumn("A.wf_tmpl_node").get() === tmpl_node_id)) {
            out_node = query.getRow(trans);
        }
        if (!out_node &&  node && node.getField("status").get() === "A" &&
                (!tmpl_node_id || node.getField("wf_tmpl_node").get() === tmpl_node_id)) {
            out_node = node;
        }
    });
    return out_node;
});


module.exports.define("freeze", function () {
    var count = 0,
        trans = this.trans;

    this.eachLinkedRow("ac_wf_inst_node", "wf_inst", function (node, query) {
        if (!node && query.getColumn("A.status").get() === "A") {
            node = query.getRow(trans);
        }
        if (node && node.getField("status").get() === "A") {
            node.freeze();
            count += 1;
        }
    });
    if (count > 0) {
        this.getField("status").get("F");
        this.freeze_next_node_on_completion = true;     // freeze next nodes as soon as activated
    }
});


module.exports.define("unfreeze", function () {
    var count = 0,
        trans = this.trans;

    this.eachLinkedRow("ac_wf_inst_node", "wf_inst", function (node, query) {
        if (!node && query.getColumn("A.status").get() === "F") {
            node = query.getRow(trans);
        }
        if (node && node.getField("status").get() === "F") {
            node.unfreeze();
            count += 1;
        }
    });
    if (count > 0) {
        this.getField("status").get("A");
    }
});


module.exports.define("skip", function () {
    var trans = this.trans;
    this.eachLinkedRow("ac_wf_inst_node", "wf_inst", function (node, query) {
        if (!node) {
            node = query.getRow(trans);
        }
        if (node.getField("status").get() === "P"               // pending
         || node.getField("status").get() === "A"               // active
         || node.getField("status").get() === "F") {            // frozen
                node.skip();
            }
    });
});


module.exports.define("updateUsersFromActors", function () {
    var trans = this.trans;
    this.eachLinkedRow("ac_wf_inst_node", "wf_inst", function (node, query) {
        if (!node && query.getColumn("A.status").get() === "A") {
            node = query.getRow(trans);
        }
        if (node && node.getField("status").get() === "A") {            // active
            node.setUserFromActor();
        }
    });
});


module.exports.define("updateDates", function () {
    var trans = this.trans;
    this.eachLinkedRow("ac_wf_inst_node", "wf_inst", function (node, query) {
        if (!node && query.getColumn("A.status").get() === "A") {
            node = query.getRow(trans);
        }
        if (node && node.getField("status").get() === "A") {            // active
            node.updateDates();
        }
    });
});


// Calls updateDates(), then trans.addNextAutoStep(this) if automatic, or setUserFromActor() if not
module.exports.define("poke", function () {
    var trans = this.trans;
    this.eachLinkedRow("ac_wf_inst_node", "wf_inst", function (node, query) {
        if (!node && query.getColumn("A.status").get() === "A") {
            node = query.getRow(trans);
        }
        // If workflow instance is being performed by a page do not poke
        if (node && !node.page && node.getField("status").get() === "A") {            // active
            node.poke();
        }
    });
});


module.exports.define("getDotGraph", function () {
    var out,
        query;

    out  = "digraph " + this.id + " { ";
    out += " graph [ penwidth=1 ]; ";
    out += " node [ fontname=Arial, fontsize=10, shape=box ]; ";
    out += " edge [ fontname=Arial, fontsize=10 ]; ";
    query = module.exports_node.getQuery();
    query.addCondition({
        column: "A.wf_inst",
        operator: "=",
        value: this.getKey(),
    });
//    query.addCondition({ full_condition: "A.status NOT IN ('K', 'P')" });        // exclude skipped, pending
    query.addCondition({
    full_condition: "A.status <> 'K'",
    });        // exclude skipped
    while (query.next()) {
        out += module.exports_node.getRow(query).getDotGraph();
    }
    query.reset();
    out += " }";
    return out;
});


module.exports.define("getTemplateDotGraph", function () {
    var out;
    out  = "digraph " + this.id + " { ";
    out += " graph [ penwidth=1 ]; ";
    out += " node [ fontname=Arial, fontsize=10, shape=box ]; ";
    out += " edge [ fontname=Arial, fontsize=10 ]; ";
    out += this.nodes.get(this.first_node_id).getTemplateDotGraph([]);
    out += " }";
    return out;
});


// Complete an action on a workflow and its children - this function was missing in R6_11
module.exports.define("updateChildren", function (action) {
    var trans = this.trans;
    if (!action) {
        return;
    }
    this.debug(this, "updateChildren action: " + action);
    this[action]();

    this.getBaseRecord().eachChildRow(function (row, query) {
        if (row && row.getField("wf_inst") && !row.getField("wf_inst").isBlank()) {
            this.debug(this, "updateChildren(): Child Row - Entity: " + row.id + ";"
                + " Key: " + row.getKey() + "; wf_inst: " + row.getField("wf_inst").get() + ";");
            module.exports.retrieve(trans, row.getField("wf_inst").get()).updateChildren(action);
        } else if (query && query.getColumn("A.wf_inst") && query.getColumn("A.wf_inst").get()) {
            module.exports.retrieve(trans, query.getColumn("A.wf_inst").get()).updateChildren(action);
        }
    });
});


module.exports.nodes.override("add", function (spec) {
    var node = module.exports_node.clone(spec);
    Core.OrderedMap.add.call(this, node);
    return node;
});


module.exports.Actor = Core.Base.clone({
    id : "Workflow.Actor"
});


module.exports.actors.override("add", function (spec) {
    var actor;
    if (!spec.label) {
        this.throwError({ id: "actor_label_not_specified", actor: spec.id });
    }
    if (typeof spec.getUserId !== "function") {
        this.throwError({ id: "getUserId_function_not_specified", actor: spec.id });
    }
    actor = module.exports.Actor.clone(spec);
    Core.OrderedMap.add.call(this, actor);
    return actor;
});


module.exports.actors.add({
    id            : "sysmgr",
    label         : "System Manager",
    getUserId     : function (node) {
        return "sysmgr";
    }
});
