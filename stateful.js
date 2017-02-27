"use strict";

var Data = require("lazuli-data/index.js");
var SQL = require("lazuli-sql/index.js");


// This entity is currently for the porpose of comparison with ac_wf_inst_node
module.exports = Data.Entity.clone({
    id              : "swf_inst_node",
    title           : "Stateful Workflow Instance Node",
    area            : "ac",
    primary_key     : "entity_id,page_id,page_key",
    default_order   : "entity_id,page_id,page_key",
    label_pattern   : "{entity_id} / {page_id} [{page_key}]"
});


module.exports.addFields([
    { id: "entity_id"         , label: "Entity"               , type: "Text"     , data_length: 40, config_item: "entities" },
    { id: "page_id"           , label: "Page"                 , type: "Text"     , data_length: 40, config_item: "pages" },
    { id: "page_key"          , label: "Page Key"             , type: "Text"     , data_length: 40 },
    { id: "actor_id"          , label: "Actor"                , type: "Text"     , data_length: 80 },
    { id: "assigned_user"     , label: "Assigned User"        , type: "Reference", list_column: true, search_criterion: true, ref_entity: "ac_user", description: "The person responsible for carrying out this task." },
    { id: "wf_state"          , label: "WF State"             , type: "Text"     , data_length:  80, css_reload: true },
    { id: "created_at"        , label: "Created At"           , type: "Reference", editable: false, ref_entity: "ac_tx" },
    { id: "rmdr_date"         , label: "Reminder Date"        , type: "Date" },
    { id: "due_date"          , label: "Due Date"             , type: "Date" },
    { id: "attributes"        , label: "Attributes"           , type: "Attributes", list: "sy.node_attributes", css_reload: true }
]);


// index keys shortened to work with MYISAM
module.exports.define("indexes", [
    "page_key, page_id",
]);


Data.WorkflowState.define("forEachWorkflowStateField", function (callback) {
    Object.keys(Data.WorkflowState.templates).forEach(function (wf_state_field_id) {
        callback(Data.WorkflowState.templates[wf_state_field_id]);
    });
});


module.exports.define("generateActiveNodes", function () {
    Data.WorkflowState.forEachWorkflowStateField(function (wf_state_field) {
        wf_state_field.generateActiveNodes();
    });
});


Data.WorkflowState.define("generateActiveNodes", function () {
    var that = this;
    SQL.Connection.shared.executeUpdate("DELETE FROM swf_inst_node WHERE entity_id = " + SQL.Connection.escape(this.id));
    Object.keys(this.wf_states).forEach(function (wf_state_id) {
        that.generateActiveNodesForState(wf_state_id);
    });
});


Data.WorkflowState.define("generateActiveNodesForState", function (wf_state_id) {
    var that = this;
    var wf_state = this.getState(wf_state_id);
    if (!wf_state.page_transitions) {
        this.debug("no page_transitions for wf_state: " + wf_state_id);
        return;
    }
    wf_state.page_transitions.forEach(function (transition) {
        that.generateActiveNodesForStateAndPage(wf_state_id, transition);
    });
});


Data.WorkflowState.define("generateActiveNodesForStateAndPage", function (wf_state_id, page_transition) {
    SQL.Connection.shared.executeUpdate(
        "INSERT INTO swf_inst_node (_key, entity_id, page_id, page_key, actor_id, wf_state) " +
        "SELECT CONCAT(" + SQL.Connection.escape(this.owner.id) + ", '.', " + SQL.Connection.escape(page_transition.page_id) + ", '.', REPLACE(_key, '.', '|')), " +
            SQL.Connection.escape(this.owner.id) + ", " + SQL.Connection.escape(page_transition.page_id) + ", _key, " +
            SQL.Connection.escape(page_transition.actor_id) + ", " +
            SQL.Connection.detokenizeAlias(this.sql_function, "A") + " AS wf_state" +
        "  FROM " + this.owner.table + " A HAVING wf_state = " + SQL.Connection.escape(wf_state_id));
});


/**
 * Use the following SQL for WF comparison:
 *   Existing WF not defined in stateful WF or defined differently
SELECT A.page, B.page_id, A.page_key, B.page_key
  FROM ac_wf_inst_node A
  LEFT OUTER JOIN swf_inst_node B ON A.page = B.page_id AND A.page_key = B.page_key
 WHERE A.status = 'A' AND A.wf_inst IN (SELECT _key FROM ac_wf_inst WHERE entity = 'vc_offer')
 ORDER BY A.page;
*
*   Stateful WF not defined in existing WF or defined differently
SELECT A.page_id, B.page, A.page_key, B.page_key
  FROM swf_inst_node A
  LEFT OUTER JOIN ac_wf_inst_node B ON A.page_id = B.page AND A.page_key = B.page_key
 WHERE A.entity_id = 'vc_offer'
 ORDER BY A.page_id;
*/
