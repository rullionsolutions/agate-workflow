"use strict";

var Core = require("lapis-core/index.js");
var Data = require("lazuli-data/index.js");
var SQL = require("lazuli-sql/index.js");
var UI = require("lazuli-ui/index.js");
var Rhino = require("lazuli-rhino/index.js");


module.exports = Data.Entity.clone({
    id              : "ac_wf_inst_node",
    title           : "Workflow Instance Node",
    area            : "ac",
    primary_key     : "wf_inst,id",
    default_order   : "_key",
    title_field     : "title",
    transactional   : true,
    display_page    : true,
    autocompleter   : true,
    parent_entity   : "ac_wf_inst",
    link_field      : "wf_inst",
    label_pattern   : "{title} [{status}]",
    label_pattern_dotgraph  : "{title}",
     email_text_string      : "ac.wf_ntfcn_actvn",
     email_text_string_deleg: "ac.wf_ntfcn_actvn_deleg",
    digest_text_string      : "ac.wf_digest",
    pack_condition   : "status IN ('A', 'P')",
    create_pending_nodes: false,
    transitions      : Core.OrderedMap.clone({ id: "ac_wf_inst_node.transitions" }),
    data_volume_oom: 6,
});


module.exports.addFields([
    { id: "seq_number"        , label: "Sequence"             , type: "Number"   , decimal_digits: 0 },
    { id: "wf_inst"           , label: "Workflow Instance"    , type: "Reference", list_column: true, ref_entity: "ac_wf_inst" },
    { id: "id"                , label: "Id"                   , type: "Number"   , list_column: true, decimal_digits: 0, auto_generate: true },
    { id: "title"             , label: "Title"                , type: "Text"     , list_column: true, data_length: 255 },
    { id: "page"              , label: "Page"                 , type: "Text"     , search_criterion: true, data_length: 40, collection_id: "pages", css_reload: true, description: "Users are taken to this page when performing the step." },
    { id: "status"            , label: "Status"               , type: "Option"   , editable: false, list_column: true, search_criterion: true, default_val: "P", list: "ac.node_status", description: "Records the status of this step. Progresses through pending, active, completed, skipped or frozen" },
    { id: "prev_node"         , label: "Previous Node"        , type: "Reference", editable: false, ref_entity: "ac_wf_inst_node" },
    { id: "outcome_id"        , label: "Outcome"              , type: "Text"     , data_length: 25 },
    { id: "actor_id"          , label: "Actor"                , type: "Text"     , data_length: 80 },
    { id: "assigned_user"     , label: "Assigned User"        , type: "Reference", list_column: true, search_criterion: true, ref_entity: "ac_user", description: "The person responsible for carrying out this task" },
    { id: "asgn_user_name"    , label: "Assigned User Name"   , type: "Text"     , data_length: 80, editable: false },
    { id: "page_key"          , label: "Page Key"             , type: "Text"     , data_length: 255, description: "Users are taken to this record when performing the step" },
    { id: "simple_url"        , label: "Perform Task"         , type: "InternalLink", list_column: true, description: "To perform this task, click the on the icon shown", sql_function: "0" },
    { id: "addl_url"          , label: "Additional URL"       , type: "Text"     , data_length: 255 },
    { id: "created_at"        , label: "Created At"           , type: "Reference", editable: false, ref_entity: "ac_tx" },
    { id: "activated_at"      , label: "Activated At"         , type: "Reference", editable: false, ref_entity: "ac_tx" },
    { id: "activated_on"      , label: "Activated On"         , type: "Date"     , editable: false, visible: false },
    { id: "completed_at"      , label: "Completed At"         , type: "Reference", editable: false, ref_entity: "ac_tx", description: "The date the step was completed" },
    { id: "completed_by"      , label: "Completed By"         , type: "Reference", editable: false, ref_entity: "ac_user", description: "The user that completed the step" },
    { id: "wf_tmpl_node"      , label: "WF Template Node"     , type: "Text"     , data_length:  80, css_reload: true },
    { id: "icon"              , label: "Icon"                 , type: "Text"     , data_length: 255 },
    { id: "rmdr_date"         , label: "Reminder Date"        , type: "Date" },
    { id: "due_date"          , label: "Due Date"             , type: "Date" },
    { id: "attributes"        , label: "Attributes"           , type: "Attributes", list: "sy.node_attributes", css_reload: true },
    { id: "ntfcn_email"       , label: "Notification Email"   , type: "Reference" , editable: false, ref_entity: "ac_email", skip_reference_validation: true },
    { id: "ntfcn_status"      , label: "Notification Status"  , type: "Attributes", description: "Records if activation, reminder , or due notifications have been sent", list : "ac.node_ntfcn_status" },
    { id: "one_time_lock_code", label: "One Time Lock Code"   , type: "Text"      , /*editable: false,*/ data_length: 20, regex_pattern: "^.{20}$", regex_label: "Code must be 20 characters" }
]);


// index keys shortened to work with MYISAM
module.exports.define("indexes", [
    "status, assigned_user, attributes(100)",
    "status, page, page_key(100), assigned_user",
    "wf_inst, seq_number",
    "status, due_date",
    "prev_node",
    "wf_tmpl_node, status"
]);


module.exports.getField("simple_url").define("getComputed", function () {
    var page;
    var out = "";

    if (!this.owner.getField("page").isBlank()) {
        page = UI.pages.get(this.owner.getField("page").get());
    }
    if (page && this.owner.getField("attributes").isItem("OT") && !this.owner.getField("one_time_lock_code").isBlank()) {
        out = "guest.html#page_id=" + page.id + "&page_key=" + this.owner.getField("page_key").get() + "&one_time_lock_code=" + this.owner.getField("one_time_lock_code").get();
    } else if (page) {
        out = page.getSimpleURL(this.owner.getField("page_key").get());
    }
    return out;
});


module.exports.getField("status").override("getUneditableCSSStyle", function () {
    if (this.get() === "A") {        // active
        return "color: blue";
    }
    if (this.get() === "C") {        // completed
        return "color: green";
    }
    if (this.get() === "P") {        // pending
        return "color: orange";
    }
    if (this.get() === "F") {        // frozen
        return "color: aqua";
    }
});


module.exports.getField("due_date").override("getUneditableCSSStyle", function () {
    if (this.isBefore("today")) {
        return "color: red";
    }
});


module.exports.getField("rmdr_date").override("getUneditableCSSStyle", function () {
    if (this.isBefore("today")) {
        return "color: red";
    }
});


Rhino.app.defbind("ac_wf_inst_node", "dailyBatch", function (session) {
    session.getPage("ac_wf_inst_node_timer_batch" ).update({});         // page is not transactional
    session.getPage("ac_wf_inst_node_notify_batch").update({ page_button: "save" });
});


module.exports.defbind("cloneTransitions", "cloneType", function () {
    this.transitions = this.parent.transitions.clone({ id: "ac_wf_inst_node.transitions" });
    this.transitions.wf_tmpl_node = this;
});


module.exports.override("getTransRow", function (trans, action, key, addl_data) {
    var row_number = trans.row_number,
        row,
        wf_tmpl_node = this;

    trans.row_number += 1;
                                        // if creating a new wf_inst_node, addl_data passes wf_inst object and tmpl_node_id
    if (action !== "C") {               // otherwise, key is the key of existing ac_wf_inst_node record
        row = this.getRow(key);
        addl_data = addl_data || {};
        addl_data.wf_inst = trans.getActiveRow("ac_wf_inst", row.getField("wf_inst").get());
        addl_data.tmpl_node_id = row.getField("wf_tmpl_node").get();
    }
    if (!addl_data.wf_inst) {
        this.throwError({ id: "invalid_argument", text: "wf_inst must be specified" });
    }
//    tmpl_node_unknown allows ac_wf_inst_node_add to work
    if ((!row || row.getField("icon").get() !== "STATEFUL") && addl_data.tmpl_node_id && !addl_data.tmpl_node_unknown) {           // tmpl_node_id is not mandatory, but if supplied, it must yield a valid node
        wf_tmpl_node = addl_data.wf_inst.nodes.get(addl_data.tmpl_node_id);
        if (!wf_tmpl_node) {
            this.throwError({ id: "invalid_argument", text: "tmpl_node_id not found: " + addl_data.tmpl_node_id });
        }
    }
    row = wf_tmpl_node.clone({
        id        : this.id,
        connection: trans.connection,
        trans     : trans,
        modifiable: true,
        instance  : true,
        row_number: row_number,
        id_prefix : "_" + row_number,
        action    : action,
        wf_inst   : addl_data.wf_inst,
        tmpl_node_id: addl_data.tmpl_node_id
    });
    row.messages = Data.MessageManagerRecord.clone({ id: "row_" + row.row_number, record: row, prefix: (row.row_number === 0) ? "" : row.title, instance: true, });
    return row;
});


module.exports.defbind("initCreate", "initCreate", function () {
    this.getField("created_at").set(this.trans.id);
    this.getField("wf_inst"   ).set(this.wf_inst.getKey());
    this.setupNodeFromTemplate();
});


// assumes template, wf_inst and key_string already set
module.exports.define("setupNodeFromTemplate", function () {
    this.getField("attributes"  ).setItem("ST", this.show_in_taskbar);
    this.getField("attributes"  ).setItem("AU", this.automatic);
    this.getField("attributes"  ).setItem("SU", this.skip_if_no_user);
    this.getField("attributes"  ).setItem("PD", this.prevent_delegation);
    this.getField("attributes"  ).setItem("SN", this.skip_notification);
    this.getField("attributes"  ).setItem("SM", this.suppress_activation_message);
    this.getField("attributes"  ).setItem("OT", this.one_time_link_execution);
    this.getField("attributes"  ).setItem("SP", this.separate_process);
    this.getField("wf_tmpl_node").set(this.tmpl_node_id || "");        // Text field not Reference
    if (this.actor_id) {
        this.getField("actor_id").set(this.actor_id); // C9678
    }
    if (this.page_id) {
        this.setupNodeFromPage(this.page_id);
    }
    if (this.title !== module.exports.title) {        // if title defined in WF template node, use this in preference
        this.getField("title").set(this.title);
    }
});


module.exports.define("setupNodeFromPage", function (page_id) {
    var page,
        page_key;

    page = UI.pages.get(page_id);
    if (!page) {
        this.throwError({ id: "page_not_found", page_id: page_id });
    }
    page_key = this.wf_inst.getField("key_string").get();
    if (page.entity === module.exports) {
        page_key = this.getKey();
    }
    this.getField("page"      ).set(page_id);
    this.getField("title"     ).set(page.title);
    this.getField("page_key"  ).set(page_key);
//    this.getField("simple_url").set(UI.pages.get(page_id).getSimpleURL(page_key));
});


module.exports.define("createNextNodes", function (outcome_id) {
    var that = this;
    this.debug(this, "createNextNodes() on " + this.getKey() + ", page_id: " + this.page_id);
    if (!this.next_nodes && this.transitions) {
        this.next_nodes = [];
        this.transitions.each(function (tmpl_trans) {
            that.debug(that, "Next node outcome_id:" + tmpl_trans.outcome_id + ", to_node_id: " + tmpl_trans.to_node_id);
            if (tmpl_trans.to_node_id && (!outcome_id || outcome_id === tmpl_trans.outcome_id)) {
                that.next_nodes.push(that.createNextNode(tmpl_trans.to_node_id, tmpl_trans.outcome_id));
            }
        });
    }
});


module.exports.define("createNextNode", function (tmpl_node_id, outcome_id) {
    var to_inst_node = this.wf_inst.createNode(tmpl_node_id);
    to_inst_node.getField("seq_number").set(this.getField("seq_number").getNumber(0) + 1);
    to_inst_node.getField("prev_node" ).set(this.getKey());
    to_inst_node.getField("outcome_id").set(outcome_id);
    to_inst_node.outcome_id = outcome_id;
    return to_inst_node;
});


module.exports.define("getNextNodes", function () {
    var query,
        outcome_id,
        to_node_id,
        to_node;

    if (!this.next_nodes) {
        this.next_nodes = [];
        query = module.exports.getQuery();
        query.addCondition({ column: "prev_node", operator: "=", value: this.getKey() });
        while (query.next()) {
            outcome_id = query.getColumn("A.outcome_id").get();
            to_node_id = query.getColumn("A._key"      ).get();
            this.debug(this, "getNextNodes() outcome_id: " + outcome_id + ", to_node: " + to_node_id);
            try {
                to_node = this.trans.getActiveRow("ac_wf_inst_node", to_node_id);
                to_node.outcome_id = outcome_id;
                this.next_nodes.push(to_node);
            } catch (ignore) {
                this.debug(this, "getNextNodes() to_node not found, must have been deleted: " + to_node);
            }
        }
        query.reset();
    }
    return this.next_nodes;
});


module.exports.define("activate", function () {
    if (this.getField("status").get() !== "P") {
        this.throwError({ id: "cannot_activate_status_not_pending", node: this.getKey() });
    }
    this.getField("status"      ).set("A");                 // active
    this.getField("activated_at").set(this.trans.id);
    this.getField("activated_on").set("today");
    this.skipNodesOnActivation();
    if (this.wf_inst.freeze_next_node_on_completion) {
        this.updateDates();
        this.getField("status"  ).set("F");                 // frozen
    } else {
        this.poke();
    }
});


module.exports.define("poke", function () {
    if (this.getField("status").get() !== "A") {
        return;
    }
    this.updateDates();
    if (this.getField("attributes").isItem("AU")) {         // automatic
        if (!this.getField("attributes").isItem("SP")) {
            this.trans.addNextAutoStep(this);
        }
    } else {
        // Add one time lock code
        this.setOneTimeLockCode();
        this.setUserFromActor();
    }
});


module.exports.define("complete", function (outcome_id) {
    this.getField("status"      ).set("C");                 // complete
    this.getField("completed_at").set(this.trans.id);
    if (this.trans.session) {
        this.getField("completed_by").set(this.trans.session.user_id);
    }
    this.skipNodesOnCompletion();
    this.advanceWorkflow(outcome_id);
});


module.exports.define("advanceWorkflow", function (outcome_id) {
    var i,
        next_node;

    if (this.create_pending_nodes) {
        this.getNextNodes();
        for (i = 0; i < this.next_nodes.length; i += 1) {
            next_node = this.next_nodes[i];
            this.debug(this, "complete() outcome: " + outcome_id + ", next_node.outcome_id: " + next_node.outcome_id);
            if (next_node.getField("status").get() === "P") {   // If Pending (might have been skipped already)
                if (outcome_id === next_node.outcome_id) {
                    next_node.createNextNodes();
                    next_node.activate();
                } else {
                    this.debug(this, "Skipping " + next_node.getKey() + " due to diff outcome");
                    next_node.skip();
                }
            }
        }
    } else {
        this.createNextNodes(outcome_id);
        for (i = 0; i < this.next_nodes.length; i += 1) {
            this.next_nodes[i].activate();
        }
        // CL - Advance manually added nodes
        this.next_nodes = null;
        this.getNextNodes();
        for (i = 0; i < this.next_nodes.length; i += 1) {
            next_node = this.next_nodes[i];
            if (next_node.getField("status").get() === "P") {
                if (outcome_id === next_node.outcome_id) {
                    next_node.activate();
                } else {
                    next_node.skip();
                }
            }
        }
    }
});


// skip_on_activation can be false (do nothing), "all" (skip all active nodes) or an array
module.exports.define("skipNodesOnActivation", function () {
    var that = this;
    if (!this.skip_on_activation) {
        return;            // go no further if no template node
    }
    this.wf_inst.eachLinkedRow("ac_wf_inst_node", "wf_inst", function (node, query) {
        var tmpl_node_id;
        if (!node && query.getColumn("A.status").get() === "A") {
            node = query.getRow(that.trans);
        }
        if (node && node.getField("status").get() === "A") {
            tmpl_node_id = node.getField("wf_tmpl_node").get();
            if (that.skip_on_completion === "all") {
                this.debug(that, "Skipping " + node.toString() + " due to 'skip_on_activation' === 'all'");
                node.skip();
            } else if (Array.isArray(that.skip_on_activation) && that.skip_on_activation.indexOf(tmpl_node_id) > -1) {
                this.debug(that, "Skipping " + node.toString() + " due to 'skip_on_activation' includes '" + tmpl_node_id + "'");
                node.skip();
            }
        }
    });
});


// skip_on_completion can be false (do nothing), "all" (skip all active nodes), "siblings" or an array
module.exports.define("skipNodesOnCompletion", function () {
    var that = this;
    if (!this.skip_on_completion) {
        return;            // go no further if no template node
    }
    this.wf_inst.eachLinkedRow("ac_wf_inst_node", "wf_inst", function (node, query) {
        var tmpl_node_id;
        if (!node && query.getColumn("A.status").get() === "A") {
            node = query.getRow(that.trans);
        }
        if (node && node.getField("status").get() === "A") {
            tmpl_node_id = node.getField("wf_tmpl_node").get();
            if (that.skip_on_completion === "all") {
                this.debug(that, "Skipping " + node.toString() + " due to 'skip_on_completion' === 'all'");
                node.skip();
            } else if (that.skip_on_completion === "siblings") {
                if (node.getField("prev_node").get() === that.getField("prev_node").get()) {
                    this.debug(that, "Skipping " + node.toString() + " due to 'skip_on_completion' === 'siblings'");
                    node.skip();
                }
            } else if (Array.isArray(that.skip_on_completion) && that.skip_on_completion.indexOf(tmpl_node_id) > -1) {
                this.debug(that, "Skipping " + node.toString() + " due to 'skip_on_completion' includes '" + tmpl_node_id + "'");
                node.skip();
            }
        }
    });
});


module.exports.define("skip", function (outcome_id) {
    this.getField("status").set("K");        // skip
    if (outcome_id) {
        this.advanceWorkflow(outcome_id);
    }
});


module.exports.define("freeze", function () {
    if (this.getField("status").get() !== "A") {
        this.throwError({ id: "cannot_freeze_status_not_active" });
    }
    this.getField("status").set("F");        // frozen
});


module.exports.define("unfreeze", function () {
    if (this.getField("status").get() !== "F") {
        this.throwError({ id: "cannot_unfreeze_status_not_frozen" });
    }
    this.getField("status").set("A");        // active
    this.setUserFromActor(); // FIX
});


// CL - Set assigned user for active nodes by re-executing the template.actors.getUserId function
module.exports.define("setUserFromActor", function () {
    var actor,
        user_id;

    if (this.getField("status").get() !== "A") {
        this.throwError({ id: "cannot_change_user_status_not_active" });
    }
    if (this.getField("attributes").isItem("OA")) {
        this.debug(this, "setUserFromActor(): Override Actor so skipping");
        if (this.getField("assigned_user").isModified()) {
            this.debug(this, "notify assigned user after override actor");
            this.notifyAssignedUser();
        } else {
            this.debug(this, "no notification after override actor as assigned user hasn't changed");
        }
        return;
    }
    this.debug(this, "activate() actor_id: " + this.actor_id);

    if (this.actor_id && this.wf_inst) {
        this.debug(this, "module.exports.activate() template: " + this.wf_inst);
        this.getField("actor_id").set(this.actor_id);
        actor = this.wf_inst.actors.get(this.actor_id);
        if (!actor) {
            this.throwError({ id: "actor_not_specified_in_workflow", actor: this.actor_id, template: this.wf_inst });
        }
        user_id = actor.getUserId(this);
        if (!user_id) {
            this.warn(this, "activate() no user id for actor: " + this.actor_id + ", for WF node: " + this.getLabel("row_error"));
        } else if (user_id === this.getField("assigned_user").get()) {
            this.trace(this, "activate() no change to user id for actor: " + this.actor_id + ", for WF node: " + this.getLabel("row_error"));
        } else {
            this.changeAssignedUser(user_id);
        }
        this.debug("activate() user_id: " + user_id);
    }
});


// Only set lock code if blank
// Returns true if a code is set
module.exports.define("setOneTimeLockCode", function () {
    var out = false;
    if (this.getField("attributes").isItem("OT")) {
        if (this.getField("status").get() === "A" && this.getField("one_time_lock_code").isBlank()) {
            this.getField("one_time_lock_code").set(Core.Format.getRandomString(20));
            out = true;
        }
    } else {
        this.getField("one_time_lock_code").set("");
    }
    return out;
});


module.exports.define("changeAssignedUser", function (user_id) {
    this.getField("assigned_user" ).set(user_id);
    this.getField("asgn_user_name").set(this.getField("assigned_user").getText());
    this.getField("ntfcn_status").setItem("AS", false);
    this.notifyAssignedUser();
});


module.exports.define("notifyAssignedUser", function () {
    if ( this.getField("assigned_user").isBlank() ||
         this.getField("status"       ).get() !== "A" ||
         this.getField("attributes"   ).isItem("AU") ||
        !this.getField("attributes"   ).isItem("ST")) {
        return;
    }
    if (!this.getField("attributes").isItem("SM") && this.trans) {
        this.debug(this, "next user message: " + this.getField("assigned_user").getText());
        // must record the message against the session, as the transaction's MessageManager will be decoupled before it gets reported
        this.trans.session.messages.add({
            type: "I",
            text: Core.Format.convertNameFirstSpaceLast(this.getField("assigned_user").getText()) +
                " has now been assigned the task to " + this.getField("title").get(),
            high_priority: true,
        });
    }
    if (this.getField("attributes").isItem("SN")) {         // suppress notification
        return;
    }

    this.getField("ntfcn_status").setItem("AU", true);      // activation notification to send
    this.getField("ntfcn_status").setItem("DU", true);      //        due notification to send
    this.getField("ntfcn_status").setItem("DS", false);     //        due notification is sent
    this.getField("ntfcn_email" ).set(this.emailAssignedUserAndDelegates());
    this.getField("ntfcn_status").setItem("AU", false);
    this.getField("ntfcn_status").setItem("AS", true);      // activation notification sent
});


module.exports.define("emailAssignedUserAndDelegates", function () {
    var email = this.emailAssignedUser();
    this.emailDelegates();
    return email.id;
});


module.exports.define("getEmailParameters", function (to_delegate) {
    var spec = {
        session         : this.trans.session,
        page            : this.page,
        // CL - The trans param is for case 5532 as you can't notify a user who is created in the same transaction as node activation
        // MG & CL will find an alternative solution for this and then remove param unless there a valid reason for keeping it.
        trans           : this.trans,
        to_user         : this.getField("assigned_user").get(),
        text_string     : to_delegate ? this.email_text_string_deleg : this.email_text_string,
        wf_step_title   : this.getField("title").get(),
        wf_title        : this.wf_inst.getField("title").get(),
        key             : this.getField("page_key").get(),
        wf_simple_url   : this.getField("simple_url").get(),
        wf_due_date     : this.getField("due_date").isBlank() ? "n/a" : this.getField("due_date").getText()
    };
    this.setParameters(this, spec, to_delegate);
    return spec;
});


// DEPRECATED - in favour of just overriding getEmailParameters()
module.exports.define("setParameters", function (node, spec, to_delegate) {
    return undefined;
});


module.exports.define("emailAssignedUser", function () {
    var spec,
        email;

    this.getField("simple_url").validate();         // force call to getComputed()
    spec = this.getEmailParameters(false);
    if (this.trans) {
        email = this.trans.addEmail(spec);
    } else {
        email = Data.entities.get("ac_email").create(spec);
        email.send();
    }
    return email;
});


module.exports.define("workflow_email_tokens", [
    "- {wf_step_title} = title of the workflow step, e.g. 'Approve / Reject this Job'",
    "- {wf_title}      = title of the workflow, usually the same as the title of the base record the workflow relates to, e.g. 'Sales Director'",
    "- {key}           = key string of the base record, useful to construct link URLs, e.g. '42'",
    "- {wf_simple_url} = relative URL of the target task page, i.e. 'index.html#page_id=...&page_key=...', or if the step is using a 'one-time lock code', then it would begin 'guest.html'",
    "- {wf_due_date}   = due date of the task in the format 'dd/mm/yy', or 'n/a' if the date is blank"
]);


module.exports.define("emailDelegates", function () {
    var spec,
        query;

    this.getField("simple_url").validate();         // force call to getComputed()
    spec = this.getEmailParameters(true);
    query = Data.entities.get("ac_user_deleg").getQuery();
    query.addCondition({ column: "A.delegater" , operator: "=", value: this.getField("assigned_user").get() });
    query.addCondition({ column: "A.get_ntfcns", operator: "=", value: "Y" });
    while (query.next()) {
        spec.to_user = query.getColumn("A.delegatee").get();
        if (this.trans) {
            this.trans.addEmail(spec);
        } else {
            Data.entities.get("ac_email").create(spec).send();
        }
    }
    query.reset();
});


module.exports.define("getActivationDate", function (offset) {
    var date = this.getField("activated_on").get();
    if (date && offset) {
        date = Date.parse(date);
        if (this.due_date_ignore_working_days) {
            date = Date.parse("+" + offset);
        } else {
            date = Date.parse(date).addWorkingDays(offset);
        }
        date = date.internal();
    }
    return date;
});


module.exports.define("updateDates", function () {
    var date;
    if (this.getField("status").get() === "C" || this.getField("status").get() === "K") {
        return;            // If Completed or Skipped then no further action
    }
    date = this.getDueDate(this);
    if (date) {
        this.getField("due_date" ).set(date);
        if (this.getField("attributes").isItem("AU") && !this.getField("due_date" ).isAfter("today")) {
            if (!this.getField("attributes").isItem("SP")) {
                this.trans.addNextAutoStep(this);
            }
        }
    }
    date = this.getReminderDate(this);
    if (date) {
        this.getField("rmdr_date").set(date);
    }
});


module.exports.define("getDueDate", function () {
    var activation_date;
    if (this.days_from_activation_to_due) {
        activation_date = this.getActivationDate(this.days_from_activation_to_due);
        return activation_date;
    }
});


module.exports.define("getReminderDate", function () {
    if (this.days_from_activation_to_reminder) {
        return this.getActivationDate(this.days_from_activation_to_reminder);
    }
});


module.exports.define("performThisAutomatedStep", function (session) {
    var page,
        // wf_node_id = this.getKey(),
        page_id    = this.getField("page"    ).get(),
        page_key   = this.getField("page_key").get(),
        prev_prevent_reporting;

    session = session || this.trans.session;
    try {
// removed because that check is performed by the allowed logic
//        if (this.getField("status").get() !== "A") {
//            this.info(this, "Auto node no longer active: " + wf_node_id);
//            return;
//        }
        prev_prevent_reporting = session.messages.prevent_reporting;
        // this.trans.session.messages.prevent_reporting = true;
        session.messages.prevent_reporting = true;
        page = session.getPage(page_id, page_key);
        page.update({ page_button: this.getAutomaticOutcome(this) });
    } catch (e) {
        if (e.access === false) { // it's safe to suppress that here
            this.debug(this, "Access to page_id: " + page_id + " page_key: " + page_key + " denied. Node no loger active");
        } else {
            this.fatal(this, "Failure in Auto WF Step in " + Rhino.app.app_id + "\n" + page_id + " [" + page_key + "\n" + e.toString());
            this.report(e);
        }
    }
    session.messages.prevent_reporting = prev_prevent_reporting;
    if (page && page.active) {
        page.cancel();
    }
    return page;
});


module.exports.define("getAutomaticOutcome", function () {
    return "save";
});


// is this used?
module.exports.define("renderNode", function (parent, render_opts) {
    var div = parent.addChild("div", this.getKey(), "wf_node", this.getLabel("row_error"));
    return div;
});


module.exports.override("renderTile", function (parent_elem, render_opts) {
    var a_elem,
        status,
        that = this,
        css_class = "btn css_tile ",
        hover_text = "",
        hover_delim = "";

    function addHoverPiece(field_id) {
        if (!that.getField(field_id).isBlank()) {
            hover_text += hover_delim + that.getField(field_id).label + ": " + that.getField(field_id).getText();
            hover_delim = ", ";
        }
    }

    a_elem = parent_elem.addChild("a");
    status = this.getField("status").get();
    if (status === "A") {
        css_class += "btn-primary";            // Active node
    } else if (status === "P") {
        css_class += "btn-warning";            // Pending node
    } else if (status === "C") {
        css_class += "btn-success";            // Completed node
    } else if (status === "F") {
        css_class += "btn-info";            // Frozen node
    }
    a_elem.attribute("class", css_class);
    a_elem.attribute("href", UI.pages.get("ac_wf_inst_node_display").getSimpleURL(this.getKey()));
    addHoverPiece("id");
    addHoverPiece("assigned_user");
    addHoverPiece("due_date");
    addHoverPiece("completed_at");
    addHoverPiece("completed_by");
    addHoverPiece("attributes");
    if (hover_text) {
        a_elem.attribute("title", hover_text);
    }
    a_elem.addText(this.getField("title").get());
    return a_elem;
});


module.exports.define("getDotGraph", function () {
    var out,
        status,
        that = this,
        hover_text = "",
        hover_delim = "";

//    out = this.getKey() + " [ label=\"" + this.getLabel("dotgraph") + "\" ]; ";
    function addHoverPiece(field_id) {
        if (!that.getField(field_id).isBlank()) {
            hover_text += hover_delim + that.getField(field_id).label + ": " + that.getField(field_id).getText();
            hover_delim = ", ";
        }
    }
    status = this.getField("status").get();
    out = this.getKey() + " [ label=\"" + this.getLabel("dotgraph") + "\" color=\"" +
        (status === "A" ? "blue" : (status === "C" ? "green" : (status === "P" ? "orange" : "aqua"))) + "\"";
    addHoverPiece("assigned_user");
    addHoverPiece("due_date");
    addHoverPiece("completed_at");
    addHoverPiece("completed_by");
    addHoverPiece("attributes");
    if (hover_text) {
        out += " tooltip=\"" + hover_text + "\"";
    }
    out += " URL=\"index.html#page_id=ac_wf_inst_node_display&page_key=" + this.getKey() + "\" ]; ";
    if (!this.getField("prev_node").isBlank()) {
//        out = "\"" + this.getField("prev_node").get() + ". " + this.getField("prev_node").getRow().getLabel("dotgraph") + "\" -> " +
        out += this.getField("prev_node").get() + " -> " + this.getKey() + " [ label=" + this.getField("outcome_id").get() + " ]; ";
    }
    return out;
});


module.exports.define("getTemplateDotGraph", function (drawn_nodes) {
    var out = "",
        node = this;

    if (drawn_nodes.indexOf(node) > -1) {
        return out;
    }
    drawn_nodes.push(this);
    out += this.id + " [ " + this.getTemplateDotGraphLabel() + this.getTemplateDotGraphTooltip() + this.getTemplateDotGraphStyle() + " ];";
    if (this.transitions && this.transitions.length() > 0) {
        this.transitions.each(function (transition) {
            var workflow,
                next_node;

            workflow = node.owner.wf_tmpl;

            if (transition.to_node_id) {
                next_node = workflow.nodes.get(transition.to_node_id);
                out += node.id + " -> ";
                if (next_node) {
                    out += next_node.id + " [ label=" + transition.outcome_id + "]; "
                        +  next_node.getTemplateDotGraph(drawn_nodes);
                } else {
                    out += "\"" + transition.to_node_id + "\"; ";
                }
            }
        });
    }
    return out;
});


module.exports.define("getTemplateDotGraphLabel", function () {
    var out = " label=\"" + this.id + "\"";
    return out;
});


module.exports.define("getTemplateDotGraphTooltip", function () {
    var out = " tooltip=\"";
    if (this.title) {
        out += this.title;
    } else if (this.page_id) {
        out += UI.pages.get(this.page_id).title;
    } else {
        out += "Unlabelled";
    }
//  Attempt to use DOT HTML label failed...
//    out = out.replace(/\[/g, "&#91;").replace(/\]/g, "&#93;").replace(/\//g, "&#47;")
//    out = "<" + this.id + "<BR/>" + out + ">";
    out += "\"";
    return out;
});


// Automatic nodes will be highlighted - R6_11_5
module.exports.define("getTemplateDotGraphStyle", function () {
    var out = "";
    if (this.automatic) {
        out += ",style=filled,color=\"#aaaaaa\"";
    }
    return out;
});


module.exports.override("archive", function (path, non_destructive, max_trans, max_session) {
    var filename = this.id + ".sql";
    var condition = "status = 'K'";
    var rows;

    Data.Entity.archive.call(this, path, non_destructive, max_trans);
    Rhino.app.dumpMySQLDataThrowOnFail(path + filename, {
        tables: "ac_wf_inst_node",
        where_clause: condition,
    });
    if (!non_destructive) {
        rows = SQL.Connection.shared.executeUpdate("DELETE FROM ac_wf_inst_node WHERE " + condition);
    }
    this.info("Archived " + rows + " rows from " + this.table);
    return filename;
});


module.exports.Transition = Core.Base.clone({
    id : "Workflow.Node.Transition"
});


module.exports.transitions.override("add", function (spec) {
    var transition;
    spec.id = spec.id || spec.to_node_id || spec.outcome_id;
    transition = module.exports.Transition.clone(spec);
    Core.OrderedMap.add.call(this, transition);
    return transition;
});
